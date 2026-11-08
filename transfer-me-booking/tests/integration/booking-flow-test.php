<?php
/**
 * Testes de integração do fluxo de reserva: cotação, reserva, consulta, cancelamento, motorista e privacidade.
 */

use TransferMe\Booking\Bookings;
use TransferMe\Booking\Driver;
use TransferMe\Booking\Util;

class TMB_Booking_Flow_Test extends TMB_TestCase {

	private function priced_quote_id(): string {
		$this->driver_on_duty();
		$data = $this->quote()->get_data();
		$this->assertSame( 'ok', $data['status'] );
		return $data['quote_id'];
	}

	private function book( array $override = array() ): array {
		$res = $this->rest( 'POST', '/booking', $this->booking_form( $this->priced_quote_id(), $override ) );
		$this->assertSame( 200, $res->get_status(), wp_json_encode( $res->get_data() ) );
		return $res->get_data();
	}

	public function test_full_booking_flow() {
		$quote_id = $this->priced_quote_id();
		$res      = $this->rest( 'POST', '/booking', $this->booking_form( $quote_id ) );
		$this->assertSame( 200, $res->get_status() );
		$data = $res->get_data();
		$this->assertMatchesRegularExpression( '/^[A-F0-9]{8}$/', $data['ref'] );
		$token = $this->token_from_url( $data['url'] );

		// A cotação só serve uma vez.
		$again = $this->rest( 'POST', '/booking', $this->booking_form( $quote_id ) );
		$this->assertSame( 409, $again->get_status() );

		$post = Bookings::find_by_token( $token );
		$this->assertInstanceOf( WP_Post::class, $post );
		$this->assertSame( 'pending', get_post_meta( $post->ID, 'status', true ) );
		$this->assertSame( '1210', get_post_meta( $post->ID, 'total_cents', true ) );
		$this->assertSame( hash( 'sha256', $token ), get_post_meta( $post->ID, 'token_hash', true ) );
		$this->assertSame( Util::POLICY_VERSION, get_post_meta( $post->ID, 'consent_version', true ) );

		// A política de privacidade diz que a posição do motorista não fica em histórico.
		foreach ( array( 'driver_lat', 'driver_lng', 'driver_ts' ) as $key ) {
			$this->assertSame( '', get_post_meta( $post->ID, $key, true ), $key );
		}

		// Emails: administrador e cliente, só o cliente recebe o link.
		$mailer = tests_retrieve_phpmailer_instance();
		$this->assertCount( 2, $mailer->mock_sent );
		$this->assertSame( get_option( 'admin_email' ), $mailer->get_recipient( 'to', 0 )->address );
		$this->assertStringNotContainsString( $token, $mailer->get_sent( 0 )->body );
		$this->assertSame( 'ana@example.org', $mailer->get_recipient( 'to', 1 )->address );
		$this->assertStringContainsString( $token, $mailer->get_sent( 1 )->body );

		// Vista pública por token.
		$view = $this->rest( 'GET', '/booking/' . $token )->get_data();
		$this->assertSame( $data['ref'], $view['ref'] );
		$this->assertSame( '12,10 €', $view['total'] );
		$this->assertTrue( $view['can_cancel'] );
		$this->assertArrayNotHasKey( 'customer_phone', $view );

		// Cancelamento: estado muda e o administrador é avisado.
		reset_phpmailer_instance();
		$cancel = $this->rest( 'POST', '/booking/' . $token . '/cancel' );
		$this->assertSame( 200, $cancel->get_status() );
		$this->assertSame( 'cancelled', $cancel->get_data()['status'] );
		$this->assertFalse( $cancel->get_data()['can_cancel'] );
		$this->assertCount( 1, tests_retrieve_phpmailer_instance()->mock_sent );
		$this->assertSame( 409, $this->rest( 'POST', '/booking/' . $token . '/cancel' )->get_status() );
	}

	public function test_unknown_token_is_404() {
		$this->assertSame( 404, $this->rest( 'GET', '/booking/' . str_repeat( 'a', 64 ) )->get_status() );
		$this->assertSame( 404, $this->rest( 'POST', '/booking/' . str_repeat( 'a', 64 ) . '/cancel' )->get_status() );
	}

	/**
	 * @dataProvider invalid_forms
	 */
	public function test_validation_errors_do_not_consume_the_quote( array $override, string $field ) {
		$quote_id = $this->priced_quote_id();
		$res      = $this->rest( 'POST', '/booking', $this->booking_form( $quote_id, $override ) );
		$this->assertSame( 422, $res->get_status() );
		$this->assertContains( $field, $res->get_data()['data']['fields'] ?? array( $res->get_data()['code'] ) );

		// A mesma cotação continua válida depois de corrigir o formulário.
		$this->assertSame( 200, $this->rest( 'POST', '/booking', $this->booking_form( $quote_id ) )->get_status() );
	}

	public function invalid_forms(): array {
		$past = ( new DateTimeImmutable( 'now', new DateTimeZone( 'UTC' ) ) )->modify( '-1 day' );
		return array(
			'nome curto'         => array( array( 'name' => 'A' ), 'name' ),
			'telefone curto'     => array( array( 'phone' => '1234' ), 'phone' ),
			'email inválido'     => array( array( 'email' => 'nao-e-email' ), 'email' ),
			'passageiros'        => array( array( 'passengers' => 9 ), 'passengers' ),
			'malas'              => array( array( 'bags' => -1 ), 'bags' ),
			'pagamento'          => array( array( 'payment' => 'bitcoin' ), 'payment' ),
			'sem consentimento'  => array( array( 'consent' => false ), 'consent' ),
			'data inexistente'   => array( array( 'date' => '2030-02-31' ), 'datetime' ),
			'hora inexistente'   => array( array( 'time' => '25:61' ), 'datetime' ),
			'data no passado'    => array( array( 'date' => $past->format( 'Y-m-d' ) ), 'datetime' ),
			'notas demasiado longas' => array( array( 'notes' => str_repeat( 'x', 1001 ) ), 'notes' ),
		);
	}

	public function test_lead_time_is_enforced() {
		update_option( Util::OPTION, array( 'google_server_key' => 'test-key', 'lead_minutes' => 180 ) );
		$quote_id = $this->priced_quote_id();
		$soon     = ( new DateTimeImmutable( 'now', wp_timezone() ) )->modify( '+60 minutes' );
		$res      = $this->rest( 'POST', '/booking', $this->booking_form( $quote_id, array( 'date' => $soon->format( 'Y-m-d' ), 'time' => $soon->format( 'H:i' ) ) ) );
		$this->assertSame( 422, $res->get_status() );
		$this->assertSame( 200, $this->rest( 'POST', '/booking', $this->booking_form( $quote_id ) )->get_status() );
	}

	public function test_booking_with_price_to_confirm() {
		$quote = $this->quote()->get_data(); // Sem motorista em serviço.
		$this->assertSame( 'preco_a_confirmar', $quote['status'] );

		$res = $this->rest( 'POST', '/booking', $this->booking_form( $quote['quote_id'] ) );
		$this->assertSame( 200, $res->get_status() );
		$token = $this->token_from_url( $res->get_data()['url'] );
		$post  = Bookings::find_by_token( $token );
		$this->assertSame( '1', get_post_meta( $post->ID, 'price_pending', true ) );
		$this->assertSame( 'Marina do Funchal, 9000-055 Funchal, Portugal', get_post_meta( $post->ID, 'pickup_address', true ) );

		$view = Bookings::public_view( $post );
		$this->assertSame( 'A confirmar', $view['total'] );
		$this->assertStringContainsString( 'A confirmar', tests_retrieve_phpmailer_instance()->get_sent( 0 )->body );
	}

	public function test_booking_is_rate_limited() {
		for ( $i = 0; $i < 5; $i++ ) {
			$this->rest( 'POST', '/booking', array( 'quote_id' => 'x' ) );
		}
		$this->assertSame( 429, $this->rest( 'POST', '/booking', array( 'quote_id' => 'x' ) )->get_status() );
	}

	public function test_lookup_rotates_token() {
		$data      = $this->book();
		$old_token = $this->token_from_url( $data['url'] );

		$this->assertSame( 404, $this->rest( 'POST', '/lookup', array( 'ref' => $data['ref'], 'phone' => '919999999' ) )->get_status() );

		// Telefone sem indicativo e código em minúsculas continuam a funcionar.
		$res = $this->rest( 'POST', '/lookup', array( 'ref' => strtolower( $data['ref'] ), 'phone' => '912345678' ) );
		$this->assertSame( 200, $res->get_status() );
		$new_token = $this->token_from_url( $res->get_data()['url'] );
		$this->assertNotSame( $old_token, $new_token );
		$this->assertNull( Bookings::find_by_token( $old_token ) );
		$this->assertInstanceOf( WP_Post::class, Bookings::find_by_token( $new_token ) );
	}

	public function test_my_bookings_endpoint_reads_cookie() {
		$a = $this->token_from_url( $this->book()['url'] );
		$b = $this->token_from_url( $this->book()['url'] );

		$_COOKIE[ Util::COOKIE ] = $a . ',' . $b . ',lixo';
		$list = $this->rest( 'GET', '/mine' )->get_data();
		$this->assertCount( 2, $list );
		$this->assertArrayHasKey( 'url', $list[0] );
		$this->assertArrayNotHasKey( 'customer_phone', $list[0] );

		unset( $_COOKIE[ Util::COOKIE ] );
		$this->assertSame( array(), $this->rest( 'GET', '/mine' )->get_data() );
	}

	public function test_cancel_deadline() {
		update_option( Util::OPTION, array( 'google_server_key' => 'test-key', 'lead_minutes' => 0, 'cancel_hours' => 2 ) );
		$soon  = ( new DateTimeImmutable( 'now', wp_timezone() ) )->modify( '+90 minutes' );
		$data  = $this->book( array( 'date' => $soon->format( 'Y-m-d' ), 'time' => $soon->format( 'H:i' ) ) );
		$token = $this->token_from_url( $data['url'] );
		$this->assertFalse( $this->rest( 'GET', '/booking/' . $token )->get_data()['can_cancel'] );
		$this->assertSame( 409, $this->rest( 'POST', '/booking/' . $token . '/cancel' )->get_status() );
	}

	public function test_driver_sees_upcoming_bookings_and_moves_status() {
		$data = $this->book( array( 'phone' => '912 345 678' ) );

		Driver::add_role();
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'transfer_driver' ) ) );

		$list = $this->rest( 'GET', '/driver/bookings' )->get_data();
		$this->assertCount( 1, $list, 'A reserva daqui a 2 dias tem de aparecer ao motorista para a confirmar' );
		$item = $list[0];
		$this->assertSame( $data['ref'], $item['ref'] );
		$this->assertSame( '912 345 678', $item['customer_phone'] );
		$this->assertSame( 'https://wa.me/351912345678', $item['whatsapp_url'] );
		$this->assertArrayNotHasKey( 'token_hash', $item );

		$this->assertSame( 409, $this->rest( 'POST', '/driver/bookings/' . $item['id'] . '/status', array( 'status' => 'completed' ) )->get_status() );
		$this->assertSame( 'confirmed', $this->rest( 'POST', '/driver/bookings/' . $item['id'] . '/status', array( 'status' => 'confirmed' ) )->get_data()['status'] );
		$this->assertSame( 'in_progress', $this->rest( 'POST', '/driver/bookings/' . $item['id'] . '/status', array( 'status' => 'in_progress' ) )->get_data()['status'] );
		$this->assertSame( 409, $this->rest( 'POST', '/driver/bookings/' . $item['id'] . '/status', array( 'status' => 'cancelled' ) )->get_status() );
		$this->assertSame( 'completed', $this->rest( 'POST', '/driver/bookings/' . $item['id'] . '/status', array( 'status' => 'completed' ) )->get_data()['status'] );

		$other = self::factory()->post->create();
		$this->assertSame( 404, $this->rest( 'POST', '/driver/bookings/' . $other . '/status', array( 'status' => 'confirmed' ) )->get_status() );
	}

	public function test_purge_old_bookings() {
		$data = $this->book();
		$post = Bookings::find_by_ref( $data['ref'] );
		update_post_meta( $post->ID, 'starts_ts', time() - 400 * DAY_IN_SECONDS );
		$keep = Bookings::find_by_ref( $this->book()['ref'] );

		Bookings::purge_old();
		$this->assertNull( get_post( $post->ID ) );
		$this->assertInstanceOf( WP_Post::class, get_post( $keep->ID ) );
	}

	public function test_privacy_exporter_and_eraser() {
		$this->book();
		$this->book( array( 'email' => 'outra@example.org' ) );

		$exporters = apply_filters( 'wp_privacy_personal_data_exporters', array() );
		$this->assertArrayHasKey( 'transfer-me-booking', $exporters );
		$export = call_user_func( $exporters['transfer-me-booking']['callback'], 'ana@example.org', 1 );
		$this->assertCount( 1, $export['data'] );
		$this->assertTrue( $export['done'] );

		$erasers = apply_filters( 'wp_privacy_personal_data_erasers', array() );
		$this->assertArrayHasKey( 'transfer-me-booking', $erasers );
		$erase = call_user_func( $erasers['transfer-me-booking']['callback'], 'ana@example.org', 1 );
		$this->assertTrue( $erase['items_removed'] );

		$left = get_posts( array( 'post_type' => Bookings::CPT, 'post_status' => 'any', 'numberposts' => -1 ) );
		$this->assertCount( 1, $left );
		$this->assertSame( 'outra@example.org', get_post_meta( $left[0]->ID, 'customer_email', true ) );
	}

	public function test_admin_cannot_create_bookings_manually() {
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'administrator' ) ) );
		$this->assertFalse( current_user_can( get_post_type_object( Bookings::CPT )->cap->create_posts ) );
	}
}
