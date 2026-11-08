<?php
/**
 * Title: Rodapé
 * Slug: transfer-me-theme/footer
 * Categories: footer
 * Block Types: core/template-part/footer
 * Inserter: no
 * Description: Licença (das definições do plugin), contactos e links legais, incluindo o Livro de Reclamações.
 *
 * @package TransferMeTheme
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$transfer_me_theme_privacy = get_privacy_policy_url();
$transfer_me_theme_legal   = array(
	array( __( 'Condições de serviço', 'transfer-me-theme' ), home_url( '/condicoes-de-servico/' ) ),
	array( __( 'Política de privacidade', 'transfer-me-theme' ), $transfer_me_theme_privacy ? $transfer_me_theme_privacy : home_url( '/politica-de-privacidade/' ) ),
	array( __( 'Livro de Reclamações', 'transfer-me-theme' ), 'https://www.livroreclamacoes.pt/' ),
);
?>
<!-- wp:group {"align":"full","className":"tmt-footer","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|50"}},"elements":{"link":{"color":{"text":"var:preset|color|base"}}}},"backgroundColor":"contrast","textColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull tmt-footer has-base-color has-contrast-background-color has-text-color has-background has-link-color" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--50)">
	<!-- wp:columns {"align":"wide"} -->
	<div class="wp-block-columns alignwide">
		<!-- wp:column -->
		<div class="wp-block-column">
			<!-- wp:site-title {"level":0,"style":{"elements":{"link":{"color":{"text":"var:preset|color|base"}}}}} /-->
			<!-- wp:paragraph -->
			<p><?php esc_html_e( 'Transfers privados na Madeira e no Porto Santo, com preço fixo.', 'transfer-me-theme' ); ?></p>
			<!-- /wp:paragraph -->
			<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"transfer-me-theme/plugin-info","args":{"key":"licence"}}}},"fontSize":"small"} -->
			<p class="has-small-font-size"></p>
			<!-- /wp:paragraph -->
			<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"transfer-me-theme/plugin-info","args":{"key":"vat"}}}},"fontSize":"small"} -->
			<p class="has-small-font-size"></p>
			<!-- /wp:paragraph -->
		</div>
		<!-- /wp:column -->

		<!-- wp:column -->
		<div class="wp-block-column">
			<!-- wp:heading {"fontSize":"large"} -->
			<h2 class="wp-block-heading has-large-font-size"><?php esc_html_e( 'Contactos', 'transfer-me-theme' ); ?></h2>
			<!-- /wp:heading -->
			<!-- wp:buttons -->
			<div class="wp-block-buttons">
				<!-- wp:button {"backgroundColor":"accent","textColor":"contrast","metadata":{"bindings":{"url":{"source":"transfer-me-theme/plugin-info","args":{"key":"whatsapp_url"}},"text":{"source":"transfer-me-theme/plugin-info","args":{"key":"whatsapp_label"}}}}} -->
				<div class="wp-block-button"><a class="wp-block-button__link has-contrast-color has-accent-background-color has-text-color has-background wp-element-button" href="#">WhatsApp</a></div>
				<!-- /wp:button -->
			</div>
			<!-- /wp:buttons -->
			<!-- wp:paragraph -->
			<p><a href="<?php echo esc_url( home_url( '/contactos/' ) ); ?>"><?php esc_html_e( 'Todos os contactos', 'transfer-me-theme' ); ?></a></p>
			<!-- /wp:paragraph -->
		</div>
		<!-- /wp:column -->

		<!-- wp:column -->
		<div class="wp-block-column">
			<!-- wp:heading {"fontSize":"large"} -->
			<h2 class="wp-block-heading has-large-font-size"><?php esc_html_e( 'Informação legal', 'transfer-me-theme' ); ?></h2>
			<!-- /wp:heading -->
			<!-- wp:navigation {"overlayMenu":"never","className":"tmt-legal-links","ariaLabel":<?php echo wp_json_encode( __( 'Informação legal', 'transfer-me-theme' ) ); ?>,"layout":{"type":"flex","orientation":"vertical"}} -->
			<?php foreach ( $transfer_me_theme_legal as $transfer_me_theme_link ) : ?>
				<!-- wp:navigation-link <?php echo wp_json_encode( array( 'label' => $transfer_me_theme_link[0], 'url' => $transfer_me_theme_link[1], 'kind' => 'custom', 'isTopLevelLink' => true ) ); ?> /-->
			<?php endforeach; ?>
			<!-- /wp:navigation -->
		</div>
		<!-- /wp:column -->
	</div>
	<!-- /wp:columns -->

	<!-- wp:paragraph {"align":"wide","fontSize":"small"} -->
	<p class="alignwide has-small-font-size">
		<?php
		/* translators: 1: year, 2: site name. */
		echo esc_html( sprintf( __( '© %1$s %2$s', 'transfer-me-theme' ), gmdate( 'Y' ), get_bloginfo( 'name' ) ) );
		?>
	</p>
	<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
