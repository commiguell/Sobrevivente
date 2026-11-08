<?php
/**
 * Title: Página: Contactos
 * Slug: transfer-me-theme/page-contactos
 * Categories: transfer-me-theme-pages
 * Post Types: page
 * Block Types: core/post-content
 * Viewport Width: 1200
 * Description: Contactos, horário e reclamações.
 *
 * @package TransferMeTheme
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<!-- wp:paragraph -->
<p><?php esc_html_e( 'A forma mais rápida de nos contactar é por WhatsApp. Para reservas, use o formulário: vê logo o preço.', 'transfer-me-theme' ); ?></p>
<!-- /wp:paragraph -->
<!-- wp:buttons -->
<div class="wp-block-buttons">
	<!-- wp:button {"metadata":{"bindings":{"url":{"source":"transfer-me-theme/plugin-info","args":{"key":"whatsapp_url"}},"text":{"source":"transfer-me-theme/plugin-info","args":{"key":"whatsapp_label"}}}}} -->
	<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="#">WhatsApp</a></div>
	<!-- /wp:button -->
	<!-- wp:button {"className":"is-style-outline","metadata":{"bindings":{"url":{"source":"transfer-me-theme/plugin-info","args":{"key":"booking_url"}}}}} -->
	<div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="<?php echo esc_url( transfer_me_theme_booking_url() ); ?>"><?php esc_html_e( 'Reservar online', 'transfer-me-theme' ); ?></a></div>
	<!-- /wp:button -->
</div>
<!-- /wp:buttons -->
<?php
echo transfer_me_theme_block_heading( __( 'Outros contactos', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_list( array( __( 'Telefone: [número]', 'transfer-me-theme' ), __( 'Email: [email]', 'transfer-me-theme' ), __( 'Horário de atendimento: [horário]', 'transfer-me-theme' ), __( 'Morada: [morada da sede]', 'transfer-me-theme' ) ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_heading( __( 'Reclamações', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_paragraph( __( 'Pode usar o <a href="https://www.livroreclamacoes.pt/">Livro de Reclamações Eletrónico</a> ou pedir o livro físico na viatura.', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
