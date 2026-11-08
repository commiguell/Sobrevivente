<?php
/**
 * Title: Hero da página inicial
 * Slug: transfer-me-theme/hero
 * Categories: transfer-me-theme, banner
 * Inserter: yes
 * Description: Título H1, subtítulo, botões e imagem principal (carregada com prioridade alta).
 *
 * @package TransferMeTheme
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<!-- wp:group {"align":"full","className":"tmt-hero","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"backgroundColor":"surface","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull tmt-hero has-surface-background-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
	<!-- wp:columns {"verticalAlignment":"center","align":"wide","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|60"}}}} -->
	<div class="wp-block-columns alignwide are-vertically-aligned-center">
		<!-- wp:column {"verticalAlignment":"center","width":"55%"} -->
		<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:55%">
			<!-- wp:heading {"level":1} -->
			<h1 class="wp-block-heading"><?php esc_html_e( 'Transfers privados na Madeira e no Porto Santo', 'transfer-me-theme' ); ?></h1>
			<!-- /wp:heading -->
			<!-- wp:paragraph {"fontSize":"large","textColor":"muted"} -->
			<p class="has-muted-color has-text-color has-large-font-size"><?php esc_html_e( 'Do aeroporto, do porto ou do hotel até onde precisar. Veja o preço fixo antes de reservar e pague a bordo.', 'transfer-me-theme' ); ?></p>
			<!-- /wp:paragraph -->
			<!-- wp:buttons -->
			<div class="wp-block-buttons">
				<!-- wp:button -->
				<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="#reservar"><?php esc_html_e( 'Ver preço e reservar', 'transfer-me-theme' ); ?></a></div>
				<!-- /wp:button -->
				<!-- wp:button {"className":"is-style-outline"} -->
				<div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="#como-funciona"><?php esc_html_e( 'Como funciona', 'transfer-me-theme' ); ?></a></div>
				<!-- /wp:button -->
			</div>
			<!-- /wp:buttons -->
		</div>
		<!-- /wp:column -->
		<!-- wp:column {"verticalAlignment":"center","width":"45%"} -->
		<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:45%">
			<!-- wp:image {"sizeSlug":"full","linkDestination":"none","className":"tmt-hero-image"} -->
			<figure class="wp-block-image size-full tmt-hero-image"><img src="<?php echo esc_url( get_template_directory_uri() . '/assets/images/hero.webp' ); ?>" alt="<?php esc_attr_e( 'Ilustração de um carro numa estrada costeira, entre o mar e as montanhas', 'transfer-me-theme' ); ?>"/></figure>
			<!-- /wp:image -->
		</div>
		<!-- /wp:column -->
	</div>
	<!-- /wp:columns -->
</div>
<!-- /wp:group -->
