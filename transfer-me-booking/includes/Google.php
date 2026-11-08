<?php
/**
 * Integração com as APIs do Google, sempre feita no servidor com a chave de servidor.
 * Não há chave exposta no browser: o autocompletar passa por um endpoint REST do próprio site.
 *
 * APIs usadas: Places API (New), Routes API, Geocoding API.
 * Nomes dos campos conferidos com as definições oficiais (google.maps.places.v1 e google.maps.routing.v2).
 *
 * @package TransferMe\Booking
 */

namespace TransferMe\Booking;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Chamadas às APIs do Google.
 */
final class Google {

	/**
	 * Retângulo que cobre a Madeira e o Porto Santo (low = sudoeste, high = nordeste).
	 * Madeira: aprox. 32,63–32,88 N, 17,27–16,65 O. Porto Santo: aprox. 33,03–33,10 N, 16,42–16,27 O.
	 */
	const RECT_LOW  = array(
		'latitude'  => 32.55,
		'longitude' => -17.30,
	);
	const RECT_HIGH = array(
		'latitude'  => 33.15,
		'longitude' => -16.20,
	);

	/** Duração da cache de place_id -> coordenadas. */
	const PLACE_CACHE_TTL = DAY_IN_SECONDS;

	/**
	 * Chave de servidor.
	 */
	private static function key(): string {
		return (string) Util::settings()['google_server_key'];
	}

	/**
	 * O ponto está dentro da área servida?
	 *
	 * @param float $lat Latitude.
	 * @param float $lng Longitude.
	 */
	public static function in_service_area( float $lat, float $lng ): bool {
		return $lat >= self::RECT_LOW['latitude'] && $lat <= self::RECT_HIGH['latitude']
			&& $lng >= self::RECT_LOW['longitude'] && $lng <= self::RECT_HIGH['longitude'];
	}

	/**
	 * Token de sessão aceite pela Places API (New): base64 seguro para URL, no máximo 36 caracteres.
	 *
	 * @param string $token Token vindo do browser.
	 */
	public static function is_valid_session( string $token ): bool {
		return (bool) preg_match( '/^[A-Za-z0-9_-]{1,36}$/', $token );
	}

	/**
	 * Trata a resposta HTTP. Erros disparam a ação transferme_google_error, para diagnóstico.
	 *
	 * @param array|\WP_Error $response Resposta de wp_remote_*.
	 * @param string          $url      URL pedido (sem chave).
	 */
	private static function decode( $response, string $url ): ?array {
		if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {
			/**
			 * Falha numa chamada ao Google.
			 *
			 * @param string          $url      URL pedido, sem a chave.
			 * @param array|\WP_Error $response Resposta.
			 */
			do_action( 'transferme_google_error', remove_query_arg( 'key', $url ), $response );
			return null;
		}
		$data = json_decode( wp_remote_retrieve_body( $response ), true );
		return is_array( $data ) ? $data : null;
	}

	/**
	 * POST com corpo JSON.
	 *
	 * @param string $url     URL.
	 * @param array  $body    Corpo.
	 * @param array  $headers Cabeçalhos.
	 */
	private static function post_json( string $url, array $body, array $headers ): ?array {
		$response = wp_remote_post(
			$url,
			array(
				'timeout' => 8,
				'headers' => array_merge( array( 'Content-Type' => 'application/json' ), $headers ),
				'body'    => wp_json_encode( $body ),
			)
		);
		return self::decode( $response, $url );
	}

	/**
	 * GET.
	 *
	 * @param string $url     URL.
	 * @param array  $headers Cabeçalhos.
	 */
	private static function get_json( string $url, array $headers ): ?array {
		$response = wp_remote_get(
			$url,
			array(
				'timeout' => 8,
				'headers' => $headers,
			)
		);
		return self::decode( $response, $url );
	}

	/**
	 * Sugestões de morada enquanto o cliente escreve.
	 *
	 * @param string $input         Texto escrito.
	 * @param string $session_token Token de sessão (UUID v4 recomendado).
	 * @return array<int, array{place_id:string,text:string}>
	 */
	public static function autocomplete( string $input, string $session_token ): array {
		$data = self::post_json(
			'https://places.googleapis.com/v1/places:autocomplete',
			array(
				'input'               => $input,
				'sessionToken'        => $session_token,
				'languageCode'        => 'pt-PT',
				'includedRegionCodes' => array( 'pt' ),
				'locationRestriction' => array(
					'rectangle' => array(
						'low'  => self::RECT_LOW,
						'high' => self::RECT_HIGH,
					),
				),
			),
			array( 'X-Goog-Api-Key' => self::key() )
		);
		if ( ! $data || empty( $data['suggestions'] ) || ! is_array( $data['suggestions'] ) ) {
			return array();
		}
		$out = array();
		foreach ( $data['suggestions'] as $s ) {
			if ( empty( $s['placePrediction']['placeId'] ) ) {
				continue;
			}
			$out[] = array(
				'place_id' => (string) $s['placePrediction']['placeId'],
				'text'     => (string) ( $s['placePrediction']['text']['text'] ?? '' ),
			);
		}
		return $out;
	}

	/**
	 * Coordenadas e morada formatada de um place_id. Envia o token de sessão para fechar a sessão
	 * do autocompletar (senão cada pedido de autocompletar é cobrado à parte) e guarda o resultado em cache.
	 *
	 * @param string $place_id      Identificador do local.
	 * @param string $session_token Token da sessão de autocompletar que originou o place_id.
	 * @return array{lat:float,lng:float,address:string}|null
	 */
	public static function resolve_place( string $place_id, string $session_token = '' ): ?array {
		$cache_key = 'tmb_place_' . md5( $place_id );
		$cached    = get_transient( $cache_key );
		if ( is_array( $cached ) ) {
			return $cached;
		}

		$args = array( 'languageCode' => 'pt-PT' );
		if ( self::is_valid_session( $session_token ) ) {
			$args['sessionToken'] = $session_token;
		}
		$data = self::get_json(
			add_query_arg( $args, 'https://places.googleapis.com/v1/places/' . rawurlencode( $place_id ) ),
			array(
				'X-Goog-Api-Key'   => self::key(),
				'X-Goog-FieldMask' => 'location,formattedAddress',
			)
		);
		if ( ! $data || ! isset( $data['location']['latitude'], $data['location']['longitude'] ) ) {
			return null;
		}
		$point = array(
			'lat'     => (float) $data['location']['latitude'],
			'lng'     => (float) $data['location']['longitude'],
			'address' => (string) ( $data['formattedAddress'] ?? '' ),
		);
		set_transient( $cache_key, $point, self::PLACE_CACHE_TTL );
		return $point;
	}

	/**
	 * Morada aproximada a partir de coordenadas (botão "usar a minha localização").
	 * Fora da área servida não chama o Google.
	 *
	 * @param float $lat Latitude.
	 * @param float $lng Longitude.
	 */
	public static function reverse_geocode( float $lat, float $lng ): ?string {
		if ( ! self::in_service_area( $lat, $lng ) ) {
			return null;
		}
		$url  = add_query_arg(
			array(
				'latlng'   => $lat . ',' . $lng,
				'language' => 'pt-PT',
				'key'      => self::key(),
			),
			'https://maps.googleapis.com/maps/api/geocode/json'
		);
		$data = self::get_json( $url, array() );
		if ( ! $data || ( $data['status'] ?? '' ) !== 'OK' || empty( $data['results'][0]['formatted_address'] ) ) {
			return null;
		}
		return (string) $data['results'][0]['formatted_address'];
	}

	/**
	 * Distância por estrada, em km, de origem a destino. Null se a rota não for calculada.
	 *
	 * Nota: em JSON (proto3) um distanceMeters igual a 0 é omitido da resposta. Uma rota presente
	 * sem distanceMeters significa 0 m (por exemplo, o motorista já está no local de recolha).
	 *
	 * @param array{lat:float,lng:float} $from Origem.
	 * @param array{lat:float,lng:float} $to   Destino.
	 */
	public static function route_km( array $from, array $to ): ?float {
		$data = self::post_json(
			'https://routes.googleapis.com/directions/v2:computeRoutes',
			array(
				'origin'            => array(
					'location' => array(
						'latLng' => array(
							'latitude'  => $from['lat'],
							'longitude' => $from['lng'],
						),
					),
				),
				'destination'       => array(
					'location' => array(
						'latLng' => array(
							'latitude'  => $to['lat'],
							'longitude' => $to['lng'],
						),
					),
				),
				'travelMode'        => 'DRIVE',
				'routingPreference' => 'TRAFFIC_UNAWARE',
				'units'             => 'METRIC',
			),
			array(
				'X-Goog-Api-Key'   => self::key(),
				'X-Goog-FieldMask' => 'routes.distanceMeters',
			)
		);
		if ( ! $data || ! isset( $data['routes'][0] ) || ! is_array( $data['routes'][0] ) ) {
			return null;
		}
		return ( (float) ( $data['routes'][0]['distanceMeters'] ?? 0 ) ) / 1000;
	}
}
