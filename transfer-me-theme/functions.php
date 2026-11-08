<?php
/**
 * Transfer.me Theme: arranque.
 *
 * O tema não tem lógica de reservas nem de preços. Apresenta o formulário do plugin
 * Transfer.me Booking (bloco transfer-me/booking-form) e lê dele apenas dados públicos.
 *
 * @package TransferMeTheme
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'TRANSFER_ME_THEME_VERSION', wp_get_theme( get_template() )->get( 'Version' ) );

require_once get_template_directory() . '/inc/plugin-bridge.php';
require_once get_template_directory() . '/inc/seo.php';
require_once get_template_directory() . '/inc/performance.php';
require_once get_template_directory() . '/inc/pattern-helpers.php';

/**
 * Suportes do tema e traduções.
 */
function transfer_me_theme_setup(): void {
	load_theme_textdomain( 'transfer-me-theme', get_template_directory() . '/languages' );
	add_theme_support( 'editor-styles' );
	add_editor_style( 'style.css' );
	// Excerto nas páginas: é usado como meta description.
	add_post_type_support( 'page', 'excerpt' );
}
add_action( 'after_setup_theme', 'transfer_me_theme_setup' );

/**
 * Folha de estilos do tema (as variáveis vêm de theme.json).
 */
function transfer_me_theme_enqueue(): void {
	// Quando o CSS do plugin está na página, o do tema carrega depois dele, para as regras .tmb-* do tema prevalecerem.
	$deps = wp_style_is( 'transfer-me', 'enqueued' ) ? array( 'transfer-me' ) : array();
	wp_enqueue_style(
		'transfer-me-theme',
		get_stylesheet_uri(),
		$deps,
		TRANSFER_ME_THEME_VERSION
	);
}
add_action( 'wp_enqueue_scripts', 'transfer_me_theme_enqueue', 20 );

/**
 * Link "Saltar para o conteúdo" no HTML (funciona sem JavaScript).
 * Substitui o link que o WordPress acrescenta por JavaScript nos temas de blocos.
 */
function transfer_me_theme_skip_link(): void {
	echo '<a class="skip-link screen-reader-text" href="#main">' . esc_html__( 'Saltar para o conteúdo', 'transfer-me-theme' ) . '</a>';
}
add_action( 'wp_body_open', 'transfer_me_theme_skip_link', 1 );
remove_action( 'wp_enqueue_scripts', 'wp_enqueue_block_template_skip_link' );
remove_action( 'wp_footer', 'the_block_template_skip_link' );

/**
 * Pré-carrega a fonte principal (evita texto invisível e reduz o LCP).
 */
function transfer_me_theme_preload_font(): void {
	printf(
		'<link rel="preload" href="%s" as="font" type="font/woff2" crossorigin>' . "\n",
		esc_url( get_template_directory_uri() . '/assets/fonts/inter/Inter-latin-wght-normal.woff2' )
	);
}
add_action( 'wp_head', 'transfer_me_theme_preload_font', 1 );

/**
 * Classe no body quando a página já mostra o formulário: o botão "Reservar" fixo fica escondido.
 *
 * @param string[] $classes Classes do body.
 * @return string[]
 */
function transfer_me_theme_body_class( array $classes ): array {
	$post = get_queried_object();
	if ( $post instanceof WP_Post && ( has_block( 'transfer-me/booking-form', $post ) || has_shortcode( $post->post_content, 'transfer_me_booking' ) ) ) {
		$classes[] = 'tmt-has-booking-form';
	}
	return $classes;
}
add_filter( 'body_class', 'transfer_me_theme_body_class' );

/**
 * Categorias de patterns.
 */
function transfer_me_theme_pattern_categories(): void {
	register_block_pattern_category(
		'transfer-me-theme',
		array( 'label' => __( 'Transfer.me', 'transfer-me-theme' ) )
	);
	register_block_pattern_category(
		'transfer-me-theme-pages',
		array( 'label' => __( 'Transfer.me: páginas', 'transfer-me-theme' ) )
	);
}
add_action( 'init', 'transfer_me_theme_pattern_categories' );

/**
 * Estilo de bloco "Cartão" para grupos (contorno e cantos arredondados).
 */
function transfer_me_theme_block_styles(): void {
	register_block_style(
		'core/group',
		array(
			'name'  => 'tmt-card',
			'label' => __( 'Cartão', 'transfer-me-theme' ),
		)
	);
}
add_action( 'init', 'transfer_me_theme_block_styles' );
