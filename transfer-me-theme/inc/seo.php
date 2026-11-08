<?php
/**
 * SEO básico: meta description, Open Graph, Twitter Card e dados estruturados schema.org (TaxiService).
 *
 * Desliga-se sozinho quando há um plugin de SEO ativo (Yoast, Rank Math, AIOSEO, SEOPress, The SEO Framework),
 * para não duplicar etiquetas. Também pode ser desligado com:
 *     add_filter( 'transfer_me_theme_seo_enabled', '__return_false' );
 *
 * O sitemap (/wp-sitemap.xml) e o robots.txt são os do WordPress.
 *
 * @package TransferMeTheme
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * O SEO do tema está ativo?
 */
function transfer_me_theme_seo_enabled(): bool {
	$seo_plugin = defined( 'WPSEO_VERSION' ) || defined( 'RANK_MATH_VERSION' ) || defined( 'AIOSEO_VERSION' )
		|| defined( 'SEOPRESS_VERSION' ) || function_exists( 'the_seo_framework' );
	/**
	 * Liga ou desliga as meta tags e os dados estruturados do tema.
	 *
	 * @param bool $enabled Por defeito, true sem plugin de SEO.
	 */
	return (bool) apply_filters( 'transfer_me_theme_seo_enabled', ! $seo_plugin );
}

/**
 * Descrição da página atual (excerto, início do conteúdo ou descrição do site).
 */
function transfer_me_theme_meta_description(): string {
	$text = '';
	if ( is_singular() ) {
		$post = get_queried_object();
		if ( $post instanceof WP_Post ) {
			$text = has_excerpt( $post ) ? $post->post_excerpt : transfer_me_theme_first_paragraph( $post->post_content );
		}
	} elseif ( is_category() || is_tag() || is_tax() ) {
		$text = term_description();
	}
	if ( is_front_page() || '' === trim( wp_strip_all_tags( $text ) ) ) {
		$front = (int) get_option( 'page_on_front' );
		$text  = is_front_page() && $front && has_excerpt( $front ) ? get_the_excerpt( $front ) : get_bloginfo( 'description' );
	}
	if ( '' === trim( wp_strip_all_tags( (string) $text ) ) ) {
		$text = __( 'Transfers privados na Madeira e no Porto Santo, com preço fixo calculado pela distância. Reserve online sem criar conta.', 'transfer-me-theme' );
	}
	$text = trim( preg_replace( '/\s+/', ' ', wp_strip_all_tags( (string) $text ) ) );
	return mb_strlen( $text ) > 160 ? rtrim( mb_substr( $text, 0, 157 ) ) . '…' : $text;
}

/**
 * Primeiro parágrafo "normal" do conteúdo (ignora parágrafos com cor de fundo, como o aviso de texto provisório).
 *
 * @param string $content Conteúdo em blocos.
 */
function transfer_me_theme_first_paragraph( string $content ): string {
	foreach ( parse_blocks( $content ) as $block ) {
		if ( 'core/paragraph' === $block['blockName'] && empty( $block['attrs']['backgroundColor'] ) ) {
			$text = trim( wp_strip_all_tags( $block['innerHTML'] ) );
			if ( '' !== $text ) {
				return $text;
			}
		}
	}
	return wp_trim_words( excerpt_remove_blocks( strip_shortcodes( $content ) ), 30, '…' );
}

/**
 * Imagem para partilha: imagem de destaque, ou a imagem por defeito do tema.
 *
 * @return array{url:string,width:int,height:int,alt:string}
 */
function transfer_me_theme_share_image(): array {
	if ( is_singular() && has_post_thumbnail() ) {
		$id  = (int) get_post_thumbnail_id();
		$img = wp_get_attachment_image_src( $id, 'large' );
		if ( $img ) {
			return array(
				'url'    => $img[0],
				'width'  => (int) $img[1],
				'height' => (int) $img[2],
				'alt'    => (string) get_post_meta( $id, '_wp_attachment_image_alt', true ),
			);
		}
	}
	// JPEG de propósito: algumas apps de mensagens ainda não mostram pré-visualizações em WebP.
	return array(
		'url'    => get_template_directory_uri() . '/assets/images/og-default.jpg',
		'width'  => 1200,
		'height' => 630,
		'alt'    => __( 'Transfer.me: transfers privados na Madeira e no Porto Santo', 'transfer-me-theme' ),
	);
}

/**
 * Meta tags no <head>.
 */
function transfer_me_theme_meta_tags(): void {
	if ( ! transfer_me_theme_seo_enabled() || is_404() ) {
		return;
	}
	$title = wp_get_document_title();
	$desc  = transfer_me_theme_meta_description();
	$url   = is_singular() ? (string) get_permalink() : home_url( add_query_arg( array() ) );
	$image = transfer_me_theme_share_image();
	$tags  = array(
		array( 'name', 'description', $desc ),
		array( 'property', 'og:locale', get_locale() ),
		array( 'property', 'og:type', is_singular( 'post' ) ? 'article' : 'website' ),
		array( 'property', 'og:site_name', get_bloginfo( 'name' ) ),
		array( 'property', 'og:title', $title ),
		array( 'property', 'og:description', $desc ),
		array( 'property', 'og:url', $url ),
		array( 'property', 'og:image', $image['url'] ),
		array( 'property', 'og:image:width', (string) $image['width'] ),
		array( 'property', 'og:image:height', (string) $image['height'] ),
		array( 'property', 'og:image:alt', $image['alt'] ),
		array( 'name', 'twitter:card', 'summary_large_image' ),
	);
	foreach ( $tags as [ $attr, $key, $value ] ) {
		if ( '' === $value ) {
			continue;
		}
		$value = 'og:url' === $key || 'og:image' === $key ? esc_url( $value ) : esc_attr( $value );
		printf( '<meta %1$s="%2$s" content="%3$s">' . "\n", esc_attr( $attr ), esc_attr( $key ), $value ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escapado acima.
	}
}
add_action( 'wp_head', 'transfer_me_theme_meta_tags', 2 );

/**
 * Dados estruturados: TaxiService com a área servida, na página inicial e na página de reserva.
 */
function transfer_me_theme_structured_data(): void {
	if ( ! transfer_me_theme_seo_enabled() ) {
		return;
	}
	if ( ! is_front_page() && ! is_page_template( 'page-reservar' ) && ! is_page( 'reservar' ) ) {
		return;
	}
	$info     = transfer_me_theme_plugin_info();
	$provider = array(
		'@type' => 'LocalBusiness',
		'name'  => get_bloginfo( 'name' ),
		'url'   => home_url( '/' ),
		'image' => get_template_directory_uri() . '/assets/images/og-default.jpg',
	);
	if ( $info['whatsapp_number'] ) {
		$provider['telephone'] = '+' . $info['whatsapp_number'];
	}
	$data = array(
		'@context'      => 'https://schema.org',
		'@type'         => 'TaxiService',
		'name'          => get_bloginfo( 'name' ),
		'description'   => transfer_me_theme_meta_description(),
		'url'           => home_url( '/' ),
		'serviceType'   => __( 'Transfer privado', 'transfer-me-theme' ),
		'provider'      => $provider,
		'areaServed'    => array(
			array(
				'@type' => 'AdministrativeArea',
				'name'  => 'Madeira',
			),
			array(
				'@type' => 'Place',
				'name'  => 'Porto Santo',
			),
		),
		'availableChannel' => array(
			'@type'      => 'ServiceChannel',
			'serviceUrl' => transfer_me_theme_booking_url(),
		),
	);
	/**
	 * Dados estruturados schema.org da página inicial e da página de reserva.
	 *
	 * @param array $data Objeto TaxiService.
	 */
	$data = apply_filters( 'transfer_me_theme_structured_data', $data );
	echo '<script type="application/ld+json">' . wp_json_encode( $data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG ) . "</script>\n";
}
add_action( 'wp_head', 'transfer_me_theme_structured_data', 3 );
