<?php
/**
 * Testes de integração dos endpoints REST: permissões, validação, limites e pedidos ao Google.
 */

use TransferMe\Booking\Driver;
use TransferMe\Booking\Util;

class TMB_Rest_Test extends TMB_TestCase {

	public function test_all_routes_are_registered_with_permission_callbacks() {
		$routes = rest_get_server()->get_routes( 'transfer-me/v1' );
		foreach ( array( '/places/autocomplete', '/places/reverse', '/quote', '/booking', '/lookup', '/mine', '/driver/duty', '/driver/location', '/driver/bookings' ) as $path ) {
			$this->assertArrayHasKey( '/transfer-me/v1' . $path, $routes, $path );
			foreach ( $routes[ '/transfer-me/v1' . $path ] as $handler ) {
				$this->assertNotEmpty( $handler['permission_callback'], $path );
			}
		}
	}

	/**
	 * @dataProvider driver_routes
	 */
	public function test_driver_routes_require_driver_or_admin( string $method, string $path, ?array $body ) {
		wp_set_current_user( 0 );
		$this->assertSame( 401, $this->rest( $method, $path, $body )->get_status(), 'anónimo' );

		wp_set_current_user( self::factory()->user->create( array( 'role' => 'subscriber' ) ) );
		$this->assertSame( 403, $this->rest( $method, $path, $body )->get_status(), 'subscritor' );

		Driver::add_role();
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'transfer_driver' ) ) );
		$this->assertNotContains( $this->rest( $method, $path, $body )->get_status(), array( 401, 403 ), 'motorista' );

		wp_set_current_user( self::factory()->user->create( array( 'role' => 'administrator' ) ) );
		$this->assertNotContains( $this->rest( $method, $path, $body )->get_status(), array( 401, 403 ), 'administrador' );
	}

	public function driver_routes(): array {
		return array(
			'duty'     => array( 'POST', '/driver/duty', array( 'on_duty' => false ) ),
			'location' => array( 'POST', '/driver/location', array( 'lat' => 32.65, 'lng' => -16.9 ) ),
			'bookings' => array( 'GET', '/driver/bookings', null ),
			'status'   => array( 'POST', '/driver/bookings/999999/status', array( 'status' => 'confirmed' ) ),
		);
	}

	public function test_autocomplete_sends_places_new_fields_and_filters_query_predictions() {
		$res = $this->rest( 'POST', '/places/autocomplete', array( 'input' => 'marina fun', 'session' => 'b1f0c7d2-1234-4abc-9def-0123456789ab' ) );
		$this->assertSame( 200, $res->get_status() );
		$this->assertSame( array( array( 'place_id' => 'ChIJ_funchal_marina', 'text' => 'Marina do Funchal' ) ), $res->get_data()['suggestions'] );

		$req = $this->requests_to( 'places:autocomplete' );
		$this->assertCount( 1, $req );
		$this->assertSame( 'POST', $req[0]['args']['method'] );
		$this->assertSame( 'test-key', $req[0]['args']['headers']['X-Goog-Api-Key'] );
		$this->assertSame( 'marina fun', $req[0]['body']['input'] );
		$this->assertSame( 'b1f0c7d2-1234-4abc-9def-0123456789ab', $req[0]['body']['sessionToken'] );
		$this->assertSame( array( 'pt' ), $req[0]['body']['includedRegionCodes'] );
		$this->assertSame( array( 'low', 'high' ), array_keys( $req[0]['body']['locationRestriction']['rectangle'] ) );
		$this->assertSame( array( 'latitude', 'longitude' ), array_keys( $req[0]['body']['locationRestriction']['rectangle']['low'] ) );
		$this->assertArrayNotHasKey( 'locationBias', $req[0]['body'], 'locationBias e locationRestriction são exclusivos' );
	}

	public function test_autocomplete_short_input_does_not_call_google() {
		$res = $this->rest( 'POST', '/places/autocomplete', array( 'input' => 'ma', 'session' => 'abc' ) );
		$this->assertSame( array(), $res->get_data()['suggestions'] );
		$this->assertCount( 0, $this->http_log );
	}

	/**
	 * A Google exige um token de sessão base64 seguro para URL com no máximo 36 caracteres.
	 */
	public function test_autocomplete_rejects_session_tokens_google_would_refuse() {
		foreach ( array( str_repeat( 'a', 37 ), '1730000000000.123', 'com espaço' ) as $bad ) {
			$res = $this->rest( 'POST', '/places/autocomplete', array( 'input' => 'marina', 'session' => $bad ) );
			$this->assertSame( array(), $res->get_data()['suggestions'] ?? array(), $bad );
		}
		$this->assertCount( 0, $this->requests_to( 'places:autocomplete' ) );
	}

	public function test_autocomplete_is_rate_limited_per_ip() {
		for ( $i = 0; $i < 60; $i++ ) {
			$this->assertSame( 200, $this->rest( 'POST', '/places/autocomplete', array( 'input' => 'marina', 'session' => 's1' ) )->get_status() );
		}
		$this->assertSame( 429, $this->rest( 'POST', '/places/autocomplete', array( 'input' => 'marina', 'session' => 's1' ) )->get_status() );

		$_SERVER['REMOTE_ADDR'] = '198.51.100.7';
		$this->assertSame( 200, $this->rest( 'POST', '/places/autocomplete', array( 'input' => 'marina', 'session' => 's1' ) )->get_status() );
	}

	public function test_reverse_geocode_inside_madeira() {
		$res = $this->rest( 'POST', '/places/reverse', array( 'lat' => 32.65, 'lng' => -16.91 ) );
		$this->assertSame( 'Rua da Praia 1, Funchal', $res->get_data()['address'] );
		$req = $this->requests_to( 'geocode/json' );
		$this->assertStringContainsString( 'latlng=32.65,-16.91', $req[0]['url'] );
		$this->assertStringContainsString( 'key=test-key', $req[0]['url'] );
	}

	public function test_reverse_geocode_outside_madeira_does_not_spend_quota() {
		$res = $this->rest( 'POST', '/places/reverse', array( 'lat' => 38.72, 'lng' => -9.14 ) );
		$this->assertSame( '', $res->get_data()['address'] );
		$this->assertCount( 0, $this->http_log );
	}

	public function test_quote_with_driver_uses_routes_and_place_details_fields() {
		$this->driver_on_duty( 32.6500, -16.9000 );
		$this->route_meters['32.65,-16.9>32.644,-16.911']   = 10500; // Motorista -> recolha: 10,5 km -> 11.
		$this->route_meters['32.644,-16.911>32.6979,-16.7745'] = 24000; // Viagem: 24 km.

		$res  = $this->quote();
		$data = $res->get_data();
		$this->assertSame( 200, $res->get_status() );
		$this->assertSame( 'ok', $data['status'] );
		$this->assertMatchesRegularExpression( '/^[a-f0-9]{32}$/', $data['quote_id'] );
		$this->assertSame( 24, $data['trip_km'] );
		$this->assertSame( 11, $data['pickup_km'] );
		$this->assertSame( 8, $data['pickup_chargeable_km'] );
		$this->assertSame( 2640, $data['total_cents'] );
		$this->assertSame( '26,40 €', $data['total'] );

		$details = $this->requests_to( 'places.googleapis.com/v1/places/' );
		$this->assertCount( 2, $details );
		$this->assertSame( 'location,formattedAddress', $details[0]['args']['headers']['X-Goog-FieldMask'] );
		$this->assertStringContainsString( 'sessionToken=sess-pickup-1', $details[0]['url'], 'Place Details fecha a sessão do autocompletar' );
		$this->assertStringContainsString( 'sessionToken=sess-dropoff-1', $details[1]['url'] );

		$routes = $this->requests_to( 'computeRoutes' );
		$this->assertCount( 2, $routes );
		$this->assertSame( 'routes.distanceMeters', $routes[0]['args']['headers']['X-Goog-FieldMask'] );
		$this->assertSame( 'DRIVE', $routes[0]['body']['travelMode'] );
		$this->assertSame( 'TRAFFIC_UNAWARE', $routes[0]['body']['routingPreference'] );
		$this->assertSame( 'METRIC', $routes[0]['body']['units'] );
		$this->assertSame( array( 'latitude' => 32.65, 'longitude' => -16.9 ), $routes[0]['body']['origin']['location']['latLng'] );
	}

	public function test_places_are_cached_between_quotes() {
		$this->driver_on_duty();
		$this->quote();
		$this->quote();
		$this->assertCount( 2, $this->requests_to( 'places.googleapis.com/v1/places/' ) );
	}

	/**
	 * Em JSON proto3, distanceMeters = 0 é omitido. O motorista já na recolha não pode dar "rota indisponível".
	 */
	public function test_quote_when_driver_is_already_at_pickup() {
		$this->driver_on_duty( 32.644, -16.911 );
		$this->route_meters['32.644,-16.911>32.644,-16.911'] = 0;
		$data = $this->quote()->get_data();
		$this->assertSame( 'ok', $data['status'] );
		$this->assertSame( 0, $data['pickup_km'] );
	}

	public function test_quote_without_driver_is_price_to_confirm_but_bookable() {
		$data = $this->quote()->get_data();
		$this->assertSame( 'preco_a_confirmar', $data['status'] );
		$this->assertSame( 'sem_motorista_disponivel', $data['reason'] );
		$this->assertMatchesRegularExpression( '/^[a-f0-9]{32}$/', $data['quote_id'] );
		$this->assertCount( 0, $this->requests_to( 'computeRoutes' ) );
	}

	public function test_quote_with_stale_driver_position_is_price_to_confirm() {
		$this->driver_on_duty();
		$state       = get_option( Driver::OPTION );
		$state['ts'] = time() - Driver::FRESH_SECONDS - 1;
		update_option( Driver::OPTION, $state );
		$this->assertSame( 'preco_a_confirmar', $this->quote()->get_data()['status'] );
	}

	public function test_quote_when_routes_api_fails() {
		$this->driver_on_duty();
		$this->http_fail['computeRoutes'] = 403;
		$data = $this->quote()->get_data();
		$this->assertSame( 'preco_a_confirmar', $data['status'] );
		$this->assertSame( 'rota_indisponivel', $data['reason'] );
	}

	public function test_quote_rejects_points_outside_madeira() {
		$this->driver_on_duty();
		$data = $this->quote( array( 'dropoff' => array( 'place_id' => 'ChIJ_lisboa_fora' ) ) )->get_data();
		$this->assertSame( 'morada_invalida', $data['reason'] );
		$this->assertArrayNotHasKey( 'quote_id', $data );

		$data = $this->quote( array( 'pickup' => array( 'lat' => 38.7, 'lng' => -9.1, 'address' => 'Lisboa' ) ) )->get_data();
		$this->assertSame( 'morada_invalida', $data['reason'] );
		$this->assertCount( 0, $this->requests_to( 'computeRoutes' ) );
	}

	public function test_quote_above_max_distance() {
		update_option( Util::OPTION, array( 'google_server_key' => 'test-key', 'max_km' => 20 ) );
		$this->driver_on_duty();
		$this->default_meters = 30000;
		$data = $this->quote()->get_data();
		$this->assertSame( 'distancia_excede_maximo', $data['reason'] );
		$this->assertArrayNotHasKey( 'quote_id', $data );
	}

	public function test_quote_with_invalid_points_is_400() {
		$this->assertSame( 400, $this->rest( 'POST', '/quote', array( 'pickup' => 'x', 'dropoff' => array() ) )->get_status() );
		$this->assertSame( 400, $this->rest( 'POST', '/quote', array( 'pickup' => array( 'place_id' => '../../x' ), 'dropoff' => array( 'place_id' => 'ChIJ_aeroporto_fnc' ) ) )->get_status() );
	}

	public function test_driver_duty_and_location() {
		Driver::add_role();
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'transfer_driver' ) ) );

		$this->assertSame( 409, $this->rest( 'POST', '/driver/location', array( 'lat' => 32.65, 'lng' => -16.9 ) )->get_status(), 'fora de serviço' );

		$this->assertTrue( $this->rest( 'POST', '/driver/duty', array( 'on_duty' => true ) )->get_data()['on_duty'] );
		$this->assertSame( 422, $this->rest( 'POST', '/driver/location', array( 'lat' => 'x', 'lng' => -16.9 ) )->get_status() );
		$status = $this->rest( 'POST', '/driver/location', array( 'lat' => 32.65, 'lng' => -16.9 ) )->get_data();
		$this->assertTrue( $status['fresh'] );

		// "false" em texto (formulários) também tem de desligar.
		$this->assertFalse( $this->rest( 'POST', '/driver/duty', array( 'on_duty' => 'false' ) )->get_data()['on_duty'] );
		$this->assertFalse( get_option( Driver::OPTION ), 'Ao sair de serviço a posição é apagada' );
	}
}
