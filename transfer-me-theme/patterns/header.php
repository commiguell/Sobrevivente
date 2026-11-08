<?php
/**
 * Title: Cabeçalho
 * Slug: transfer-me-theme/header
 * Categories: header
 * Block Types: core/template-part/header
 * Inserter: no
 * Description: Logótipo ou nome do site, navegação e botão "Reservar" (fixo em baixo em mobile).
 *
 * @package TransferMeTheme
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$transfer_me_theme_links = array(
	array( __( 'Como funciona', 'transfer-me-theme' ), home_url( '/como-funciona/' ) ),
	array( __( 'Sobre', 'transfer-me-theme' ), home_url( '/sobre/' ) ),
	array( __( 'Contactos', 'transfer-me-theme' ), home_url( '/contactos/' ) ),
);
$transfer_me_theme_booking = transfer_me_theme_booking_url();
?>
<!-- wp:group {"align":"full","className":"tmt-header","style":{"spacing":{"padding":{"top":"var:preset|spacing|20","bottom":"var:preset|spacing|20"}},"border":{"bottom":{"color":"var:preset|color|surface","width":"1px","style":"solid"}}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull tmt-header has-base-background-color has-background" style="border-bottom-color:var(--wp--preset--color--surface);border-bottom-style:solid;border-bottom-width:1px;padding-top:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20)">
	<!-- wp:group {"align":"wide","layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between"}} -->
	<div class="wp-block-group alignwide">
		<!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap"},"style":{"spacing":{"blockGap":"var:preset|spacing|20"}}} -->
		<div class="wp-block-group">
			<!-- wp:site-logo {"width":48,"shouldSyncIcon":false} /-->
			<!-- wp:site-title {"level":0} /-->
		</div>
		<!-- /wp:group -->

		<!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap"},"style":{"spacing":{"blockGap":"var:preset|spacing|30"}}} -->
		<div class="wp-block-group">
			<!-- wp:navigation {"overlayMenu":"mobile","ariaLabel":<?php echo wp_json_encode( __( 'Navegação principal', 'transfer-me-theme' ) ); ?>,"layout":{"type":"flex","justifyContent":"right"}} -->
			<?php foreach ( $transfer_me_theme_links as $transfer_me_theme_link ) : ?>
				<!-- wp:navigation-link <?php echo wp_json_encode( array( 'label' => $transfer_me_theme_link[0], 'url' => $transfer_me_theme_link[1], 'kind' => 'custom', 'isTopLevelLink' => true ) ); ?> /-->
			<?php endforeach; ?>
			<!-- /wp:navigation -->

			<!-- wp:buttons {"className":"tmt-sticky-cta"} -->
			<div class="wp-block-buttons tmt-sticky-cta">
				<!-- wp:button {"metadata":{"bindings":{"url":{"source":"transfer-me-theme/plugin-info","args":{"key":"booking_url"}}}}} -->
				<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="<?php echo esc_url( $transfer_me_theme_booking ); ?>"><?php esc_html_e( 'Reservar', 'transfer-me-theme' ); ?></a></div>
				<!-- /wp:button -->
			</div>
			<!-- /wp:buttons -->
		</div>
		<!-- /wp:group -->
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->
