<?php
/**
 * Ligação ao plugin Transfer.me Booking. Só lê dados públicos (licença, WhatsApp, nota de IVA, página de reservas).
 * Sem o plugin, o tema continua a funcionar e mostra um aviso no lugar do formulário.
 *
 * @package TransferMeTheme
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * O bloco do formulário está disponível?
 */
function transfer_me_theme_has_booking_block(): bool {
	return WP_Block_Type_Registry::get_instance()->is_registered( 'transfer-me/booking-form' );
}

/**
 * Dados públicos do plugin, ou valores vazios sem o plugin.
 *
 * @return array{licence_number:string,whatsapp_number:string,whatsapp_url:string,vat_label:string,booking_url:string}
 */
function transfer_me_theme_plugin_info(): array {
	$empty = array(
		'licence_number'  => '',
		'whatsapp_number' => '',
		'whatsapp_url'    => '',
		'vat_label'       => '',
		'booking_url'     => '',
	);
	if ( ! function_exists( 'transferme_booking_public_info' ) ) {
		return $empty;
	}
	return array_merge( $empty, (array) transferme_booking_public_info() );
}

/**
 * URL do botão "Reservar": página com o slug "reservar"; senão a página do plugin; senão a âncora da página inicial.
 */
function transfer_me_theme_booking_url(): string {
	$page = get_page_by_path( 'reservar' );
	if ( $page instanceof WP_Post && 'publish' === $page->post_status ) {
		return (string) get_permalink( $page );
	}
	$info = transfer_me_theme_plugin_info();
	if ( $info['booking_url'] ) {
		return $info['booking_url'];
	}
	return home_url( '/#reservar' );
}

/**
 * Fonte de block bindings "transfer-me-theme/plugin-info".
 *
 * Os parágrafos e botões ligados a esta fonte mostram sempre o valor atual das definições do plugin,
 * mesmo depois de o cabeçalho ou o rodapé serem editados no Editor do site.
 */
function transfer_me_theme_register_bindings(): void {
	if ( ! function_exists( 'register_block_bindings_source' ) ) {
		return;
	}
	register_block_bindings_source(
		'transfer-me-theme/plugin-info',
		array(
			'label'              => __( 'Transfer.me: dados do plugin', 'transfer-me-theme' ),
			'get_value_callback' => 'transfer_me_theme_binding_value',
		)
	);
}
add_action( 'init', 'transfer_me_theme_register_bindings' );

/**
 * Valor de uma ligação.
 *
 * @param array $args Argumentos da ligação: key = licence | vat | whatsapp_url | whatsapp_label | booking_url.
 */
function transfer_me_theme_binding_value( array $args ): ?string {
	$info = transfer_me_theme_plugin_info();
	switch ( $args['key'] ?? '' ) {
		case 'licence':
			return $info['licence_number']
				/* translators: %s: licence number set in the Transfer.me Booking plugin. */
				? sprintf( esc_html__( 'Licença n.º %s', 'transfer-me-theme' ), esc_html( $info['licence_number'] ) )
				: '';
		case 'vat':
			return esc_html( $info['vat_label'] );
		case 'whatsapp_url':
			return $info['whatsapp_url'] ? esc_url( $info['whatsapp_url'] ) : '';
		case 'whatsapp_label':
			return $info['whatsapp_number']
				/* translators: %s: WhatsApp number with country code. */
				? sprintf( esc_html__( 'WhatsApp: +%s', 'transfer-me-theme' ), esc_html( $info['whatsapp_number'] ) )
				: '';
		case 'booking_url':
			return esc_url( transfer_me_theme_booking_url() );
	}
	return null;
}

/**
 * Sem número de WhatsApp, o link do rodapé não é mostrado (evita um link vazio).
 *
 * @param string $content HTML do bloco.
 * @param array  $block   Bloco.
 */
function transfer_me_theme_hide_empty_bound_links( string $content, array $block ): string {
	$bindings = $block['attrs']['metadata']['bindings'] ?? array();
	foreach ( $bindings as $binding ) {
		if ( 'transfer-me-theme/plugin-info' === ( $binding['source'] ?? '' ) && in_array( $binding['args']['key'] ?? '', array( 'whatsapp_url', 'whatsapp_label', 'licence', 'vat' ), true ) ) {
			$value = transfer_me_theme_binding_value( $binding['args'] );
			if ( '' === $value ) {
				return '';
			}
		}
	}
	return $content;
}
add_filter( 'render_block_core/paragraph', 'transfer_me_theme_hide_empty_bound_links', 10, 2 );
add_filter( 'render_block_core/button', 'transfer_me_theme_hide_empty_bound_links', 10, 2 );

/**
 * O rodapé do tema já mostra a licença, a nota de IVA e o WhatsApp: o plugin não os repete por baixo do formulário.
 */
add_filter( 'transferme_booking_show_footer_notes', '__return_false' );
