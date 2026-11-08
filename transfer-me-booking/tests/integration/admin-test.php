<?php
/**
 * Testes de integração da administração, permissões e páginas privadas.
 */

use TransferMe\Booking\Admin;
use TransferMe\Booking\Bookings;
use TransferMe\Booking\Frontend;
use TransferMe\Booking\Util;

class TMB_Admin_Test extends TMB_TestCase {

	/**
	 * Regressão: o tipo de conteúdo não pode transformar manage_options numa meta-capacidade.
	 */
	public function test_registering_bookings_does_not_remove_manage_options() {
		$this->assertTrue( post_type_exists( Bookings::CPT ) );
		$admin = self::factory()->user->create( array( 'role' => 'administrator' ) );
		$this->assertTrue( user_can( $admin, 'manage_options' ) );
		$this->assertSame( array( 'manage_options' ), map_meta_cap( 'manage_options', $admin ) );

		$editor = self::factory()->user->create( array( 'role' => 'editor' ) );
		$booking = self::factory()->post->create( array( 'post_type' => Bookings::CPT ) );
		$this->assertTrue( user_can( $admin, 'edit_post', $booking ) );
		$this->assertFalse( user_can( $editor, 'edit_post', $booking ) );
		$this->assertFalse( user_can( $editor, 'read_post', $booking ) );
	}

	public function test_settings_sanitize_keeps_google_key_when_left_blank() {
		update_option( Util::OPTION, array( 'google_server_key' => 'chave-antiga' ) );
		$out = Admin::sanitize( array( 'google_server_key' => '', 'rate_trip_eur' => '1,25', 'retention_days' => 5 ) );
		$this->assertSame( 'chave-antiga', $out['google_server_key'] );
		$this->assertSame( 125, $out['rate_trip_cents'] );
		$this->assertSame( 30, $out['retention_days'] );

		$this->assertSame( 'nova', Admin::sanitize( array( 'google_server_key' => 'nova' ) )['google_server_key'] );
		$this->assertSame( '', Admin::sanitize( array( 'google_server_key_clear' => '1' ) )['google_server_key'] );
	}

	public function test_settings_page_does_not_print_google_key() {
		update_option( Util::OPTION, array( 'google_server_key' => 'AIza-segredo' ) );
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'administrator' ) ) );
		ob_start();
		Admin::render();
		$html = ob_get_clean();
		$this->assertStringNotContainsString( 'AIza-segredo', $html );
		$this->assertStringContainsString( 'name="tmb_settings[rate_trip_eur]"', $html );
	}

	public function test_driver_and_booking_pages_are_noindex() {
		$page = self::factory()->post->create( array( 'post_type' => 'page', 'post_content' => '[transfer_me_driver]' ) );
		$this->go_to( get_permalink( $page ) );
		$robots = Frontend::robots( array() );
		$this->assertTrue( $robots['noindex'] );

		$public = self::factory()->post->create( array( 'post_type' => 'page', 'post_content' => '[transfer_me_booking]' ) );
		$this->go_to( get_permalink( $public ) );
		$this->assertArrayNotHasKey( 'noindex', Frontend::robots( array() ) );
	}

	public function test_customer_shortcode_does_not_render_bookings_server_side() {
		$_COOKIE[ Util::COOKIE ] = str_repeat( 'a', 64 );
		$html = do_shortcode( '[transfer_me_booking]' );
		$this->assertStringContainsString( 'id="tmb-form"', $html );
		$this->assertStringContainsString( 'id="tmb-mine"', $html );
		$this->assertStringNotContainsString( '/reserva/', $html, 'A lista vem da REST para não ficar em cache de página' );
	}
}
