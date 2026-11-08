<?php
/**
 * Caso de teste base: simula as APIs do Google, regista os pedidos HTTP e ajuda a chamar a API REST.
 */

use TransferMe\Booking\Driver;
use TransferMe\Booking\Util;

abstract class TMB_TestCase extends WP_UnitTestCase {

	/** Pedidos HTTP feitos ao Google: [ 'url' => string, 'args' => array, 'body' => array|null ]. */
	protected array $http_log = array();

	/** Distâncias simuladas, em metros, por par "lat,lng>lat,lng". Sem par, usa $default_meters. */
	protected array $route_meters = array();

	protected ?int $default_meters = 10000;

	/** Places simulados: place_id => [ lat, lng, address ]. */
	protected array $places = array();

	/** Força uma resposta de erro HTTP (código) para pedidos cujo URL contenha a chave. */
	protected array $http_fail = array();

	public function set_up(): void {
		parent::set_up();

		$this->http_log     = array();
		$this->route_meters = array();
		$this->http_fail    = array();
		$this->places       = array(
			'ChIJ_funchal_marina' => array( 32.6440, -16.9110, 'Marina do Funchal, 9000-055 Funchal, Portugal' ),
			'ChIJ_aeroporto_fnc'  => array( 32.6979, -16.7745, 'Aeroporto da Madeira, 9100-105 Santa Cruz, Portugal' ),
			'ChIJ_lisboa_fora'    => array( 38.7223, -9.1393, 'Lisboa, Portugal' ),
		);

		$_SERVER['REMOTE_ADDR'] = '203.0.113.' . wp_rand( 1, 250 );

		update_option( Util::OPTION, array( 'google_server_key' => 'test-key' ) );
		delete_option( Driver::OPTION );

		add_filter( 'pre_http_request', array( $this, 'fake_http' ), 10, 3 );
		reset_phpmailer_instance();

		// O servidor REST tem de ser recriado em cada teste para as rotas serem registadas.
		global $wp_rest_server;
		$wp_rest_server = new WP_REST_Server();
		do_action( 'rest_api_init', $wp_rest_server );
	}

	public function tear_down(): void {
		remove_filter( 'pre_http_request', array( $this, 'fake_http' ), 10 );
		unset( $_COOKIE[ Util::COOKIE ] );
		global $wp_rest_server;
		$wp_rest_server = null;
		parent::tear_down();
	}

	/**
	 * Substitui as chamadas ao Google por respostas fixas.
	 */
	public function fake_http( $pre, array $args, string $url ) {
		$body             = isset( $args['body'] ) && is_string( $args['body'] ) ? json_decode( $args['body'], true ) : null;
		$this->http_log[] = array( 'url' => $url, 'args' => $args, 'body' => $body );

		foreach ( $this->http_fail as $needle => $code ) {
			if ( false !== strpos( $url, $needle ) ) {
				return $this->json( array( 'error' => array( 'code' => $code ) ), $code );
			}
		}

		if ( false !== strpos( $url, 'places.googleapis.com/v1/places:autocomplete' ) ) {
			return $this->json( array(
				'suggestions' => array(
					array( 'placePrediction' => array( 'placeId' => 'ChIJ_funchal_marina', 'text' => array( 'text' => 'Marina do Funchal' ) ) ),
					array( 'queryPrediction' => array( 'text' => array( 'text' => 'marina' ) ) ),
				),
			) );
		}

		if ( preg_match( '#places\.googleapis\.com/v1/places/([^?]+)#', $url, $m ) ) {
			$id = rawurldecode( $m[1] );
			if ( ! isset( $this->places[ $id ] ) ) {
				return $this->json( array( 'error' => array( 'code' => 404 ) ), 404 );
			}
			[ $lat, $lng, $address ] = $this->places[ $id ];
			return $this->json( array( 'location' => array( 'latitude' => $lat, 'longitude' => $lng ), 'formattedAddress' => $address ) );
		}

		if ( false !== strpos( $url, 'routes.googleapis.com/directions/v2:computeRoutes' ) ) {
			$o   = $body['origin']['location']['latLng'];
			$d   = $body['destination']['location']['latLng'];
			$key = $o['latitude'] . ',' . $o['longitude'] . '>' . $d['latitude'] . ',' . $d['longitude'];
			$m   = $this->route_meters[ $key ] ?? $this->default_meters;
			if ( null === $m ) {
				return $this->json( new stdClass() ); // Sem rota: resposta vazia.
			}
			// Com a máscara routes.distanceMeters, e porque em JSON proto3 um int32 a 0 é omitido,
			// uma rota de 0 m chega como objeto vazio: {"routes":[{}]}.
			$route = 0 === $m ? new stdClass() : array( 'distanceMeters' => $m );
			return $this->json( array( 'routes' => array( $route ) ) );
		}

		if ( false !== strpos( $url, 'maps.googleapis.com/maps/api/geocode/json' ) ) {
			return $this->json( array( 'status' => 'OK', 'results' => array( array( 'formatted_address' => 'Rua da Praia 1, Funchal' ) ) ) );
		}

		return new WP_Error( 'tmb_test_unexpected_http', 'Pedido HTTP inesperado: ' . $url );
	}

	protected function json( $data, int $code = 200 ): array {
		return array(
			'headers'  => array( 'content-type' => 'application/json' ),
			'body'     => wp_json_encode( $data ),
			'response' => array( 'code' => $code, 'message' => '' ),
			'cookies'  => array(),
			'filename' => null,
		);
	}

	protected function requests_to( string $needle ): array {
		return array_values( array_filter( $this->http_log, static fn( $r ) => false !== strpos( $r['url'], $needle ) ) );
	}

	/**
	 * Chama uma rota REST do plugin com corpo JSON.
	 */
	protected function rest( string $method, string $path, ?array $body = null ): WP_REST_Response {
		$request = new WP_REST_Request( $method, '/transfer-me/v1' . $path );
		if ( null !== $body ) {
			$request->set_header( 'Content-Type', 'application/json' );
			$request->set_body( wp_json_encode( $body ) );
		}
		return rest_get_server()->dispatch( $request );
	}

	protected function driver_on_duty( float $lat = 32.6500, float $lng = -16.9000 ): void {
		Driver::set_duty( true );
		Driver::set_position( $lat, $lng );
	}

	protected function future_date( string $modify = '+2 days' ): array {
		$dt = ( new DateTimeImmutable( 'now', wp_timezone() ) )->modify( $modify );
		return array( 'date' => $dt->format( 'Y-m-d' ), 'time' => '10:00' );
	}

	protected function booking_form( string $quote_id, array $override = array() ): array {
		return array_merge(
			array(
				'quote_id'   => $quote_id,
				'name'       => 'Ana Teste',
				'phone'      => '+351 912 345 678',
				'email'      => 'ana@example.org',
				'passengers' => 2,
				'bags'       => 1,
				'payment'    => 'cash',
				'notes'      => 'Voo TP1689',
				'consent'    => true,
			),
			$this->future_date(),
			$override
		);
	}

	/** Pede uma cotação entre a marina e o aeroporto. */
	protected function quote( array $override = array() ): WP_REST_Response {
		return $this->rest( 'POST', '/quote', array_merge(
			array(
				'pickup'  => array( 'place_id' => 'ChIJ_funchal_marina', 'session' => 'sess-pickup-1' ),
				'dropoff' => array( 'place_id' => 'ChIJ_aeroporto_fnc', 'session' => 'sess-dropoff-1' ),
			),
			$override
		) );
	}

	/** Lê o token da reserva a partir do URL devolvido. */
	protected function token_from_url( string $url ): string {
		$this->assertMatchesRegularExpression( '#/reserva/([a-f0-9]{64})/#', $url );
		preg_match( '#/reserva/([a-f0-9]{64})/#', $url, $m );
		return $m[1];
	}
}
