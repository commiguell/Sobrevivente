<?php
/**
 * Testes do bloco, das mensagens de erro acessíveis e da função pública para temas.
 */

use TransferMe\Booking\Util;

class TMB_Block_Test extends TMB_TestCase {

	public function test_block_is_registered_with_style_supports() {
		$type = WP_Block_Type_Registry::get_instance()->get_registered( 'transfer-me/booking-form' );
		$this->assertInstanceOf( WP_Block_Type::class, $type );
		$this->assertTrue( $type->supports['color']['background'] );
		$this->assertTrue( $type->supports['spacing']['padding'] );
		$this->assertTrue( $type->is_dynamic() );
	}

	public function test_block_renders_form_with_wrapper_and_enqueues_assets() {
		wp_dequeue_script( 'transfer-me' );
		$html = do_blocks( '<!-- wp:transfer-me/booking-form {"className":"is-style-card"} /-->' );
		$this->assertStringContainsString( 'wp-block-transfer-me-booking-form', $html );
		$this->assertStringContainsString( 'is-style-card', $html );
		$this->assertStringContainsString( 'id="tmb-form"', $html );
		$this->assertTrue( wp_script_is( 'transfer-me', 'enqueued' ), 'O JS tem de carregar quando o formulário vem de um template' );
		$this->assertTrue( wp_style_is( 'transfer-me', 'enqueued' ) );
	}

	public function test_every_described_field_has_its_error_element() {
		$html = do_shortcode( '[transfer_me_booking]' );
		preg_match_all( '/aria-describedby="([^"]+)"/', $html, $m );
		$this->assertNotEmpty( $m[1] );
		foreach ( array_unique( $m[1] ) as $id ) {
			$this->assertMatchesRegularExpression( '/<p class="tmb-error" id="' . preg_quote( $id, '/' ) . '"/', $html, $id );
		}
		foreach ( array( 'tmb-name', 'tmb-phone', 'tmb-email', 'tmb-date', 'tmb-time', 'tmb-consent', 'tmb-pickup-text', 'tmb-dropoff-text' ) as $field ) {
			$this->assertMatchesRegularExpression( '/id="' . $field . '" aria-describedby="/', $html, $field );
			$this->assertMatchesRegularExpression( '/<label[^>]*for="' . $field . '"|<label><input[^>]*id="' . $field . '"/', $html, 'label visível: ' . $field );
		}
		$this->assertStringContainsString( 'class="tmb-quote tmb-price"', $html );
		$this->assertDoesNotMatchRegularExpression( '/id="tmb-submit"[^>]*disabled/', $html );
	}

	public function test_public_info_for_themes_hides_secrets() {
		update_option( Util::OPTION, array( 'google_server_key' => 'segredo', 'licence_number' => 'RNAVT 99', 'whatsapp_number' => '351912000000', 'notify_email' => 'privado@example.org' ) );
		$page = self::factory()->post->create( array( 'post_type' => 'page', 'post_status' => 'publish' ) );
		update_option( 'tmb_customer_page_id', $page );

		$info = transferme_booking_public_info();
		$this->assertSame( 'RNAVT 99', $info['licence_number'] );
		$this->assertSame( 'https://wa.me/351912000000', $info['whatsapp_url'] );
		$this->assertSame( get_permalink( $page ), $info['booking_url'] );
		$this->assertStringNotContainsString( 'segredo', wp_json_encode( $info ) );
		$this->assertStringNotContainsString( 'privado@', wp_json_encode( $info ) );
	}

	public function test_theme_can_hide_footer_notes() {
		update_option( Util::OPTION, array( 'licence_number' => 'RNAVT 99' ) );
		$this->assertStringContainsString( 'RNAVT 99', do_shortcode( '[transfer_me_booking]' ) );
		add_filter( 'transferme_booking_show_footer_notes', '__return_false' );
		$this->assertStringNotContainsString( 'RNAVT 99', do_shortcode( '[transfer_me_booking]' ) );
		remove_filter( 'transferme_booking_show_footer_notes', '__return_false' );
	}
}
