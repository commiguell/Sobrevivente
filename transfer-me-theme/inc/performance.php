<?php
/**
 * Imagens: dimensões explícitas, carregamento diferido, e prioridade alta na imagem principal do hero.
 *
 * As imagens do próprio tema (assets/images) não passam pela biblioteca de média, por isso o WordPress
 * não lhes acrescenta width/height nem decide o carregamento. Este filtro faz isso:
 * - imagem com a classe "tmt-hero-image": loading="eager" e fetchpriority="high";
 * - restantes imagens do tema: loading="lazy" e decoding="async";
 * - width/height lidos do ficheiro quando faltam (evita saltos de layout, CLS).
 *
 * @package TransferMeTheme
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Ajusta o <img> de um bloco de imagem.
 *
 * @param string $content HTML do bloco.
 * @param array  $block   Bloco.
 */
function transfer_me_theme_image_attributes( string $content, array $block ): string {
	if ( false === strpos( $content, '<img' ) ) {
		return $content;
	}
	$is_hero = false !== strpos( (string) ( $block['attrs']['className'] ?? '' ), 'tmt-hero-image' );
	$p       = new WP_HTML_Tag_Processor( $content );
	if ( ! $p->next_tag( 'img' ) ) {
		return $content;
	}
	$src       = (string) $p->get_attribute( 'src' );
	$theme_url = get_template_directory_uri() . '/assets/images/';

	if ( $is_hero ) {
		$p->set_attribute( 'fetchpriority', 'high' );
		$p->set_attribute( 'loading', 'eager' );
		$p->set_attribute( 'decoding', 'async' );
	} elseif ( null === $p->get_attribute( 'loading' ) ) {
		$p->set_attribute( 'loading', 'lazy' );
		$p->set_attribute( 'decoding', 'async' );
	}

	if ( 0 === strpos( $src, $theme_url ) && ( null === $p->get_attribute( 'width' ) || null === $p->get_attribute( 'height' ) ) ) {
		$file = get_template_directory() . '/assets/images/' . basename( (string) wp_parse_url( $src, PHP_URL_PATH ) );
		$size = is_readable( $file ) ? wp_getimagesize( $file ) : false;
		if ( $size ) {
			$p->set_attribute( 'width', (string) $size[0] );
			$p->set_attribute( 'height', (string) $size[1] );
		}
	}
	return $p->get_updated_html();
}
add_filter( 'render_block_core/image', 'transfer_me_theme_image_attributes', 10, 2 );

/**
 * Sem emojis convertidos em imagens (pedido extra e script desnecessários).
 */
function transfer_me_theme_disable_emoji(): void {
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );
	remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
	remove_action( 'admin_print_styles', 'print_emoji_styles' );
	remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
	remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
	remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
}
add_action( 'init', 'transfer_me_theme_disable_emoji' );
