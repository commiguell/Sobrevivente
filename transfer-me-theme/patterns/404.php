<?php
/**
 * Title: Página não encontrada (404)
 * Slug: transfer-me-theme/404
 * Categories: transfer-me-theme
 * Inserter: no
 * Description: Conteúdo do template 404.
 *
 * @package TransferMeTheme
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<!-- wp:heading {"level":1,"style":{"spacing":{"margin":{"top":"var:preset|spacing|60"}}}} -->
<h1 class="wp-block-heading" style="margin-top:var(--wp--preset--spacing--60)"><?php esc_html_e( 'Página não encontrada', 'transfer-me-theme' ); ?></h1>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p><?php esc_html_e( 'O endereço pode estar errado ou a página pode ter mudado de sítio. Pesquise ou volte à página inicial.', 'transfer-me-theme' ); ?></p>
<!-- /wp:paragraph -->
<!-- wp:pattern {"slug":"transfer-me-theme/search-form"} /-->
<!-- wp:buttons -->
<div class="wp-block-buttons">
	<!-- wp:button -->
	<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="<?php echo esc_url( transfer_me_theme_booking_url() ); ?>"><?php esc_html_e( 'Reservar um transfer', 'transfer-me-theme' ); ?></a></div>
	<!-- /wp:button -->
	<!-- wp:button {"className":"is-style-outline"} -->
	<div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Página inicial', 'transfer-me-theme' ); ?></a></div>
	<!-- /wp:button -->
</div>
<!-- /wp:buttons -->
