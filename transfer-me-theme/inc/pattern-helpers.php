<?php
/**
 * Pequenos geradores de marcação de blocos para os patterns de página.
 * Cada texto é escapado aqui; os patterns passam só texto traduzido.
 *
 * @package TransferMeTheme
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Bloco de título.
 *
 * @param string $text  Texto.
 * @param int    $level Nível (2 ou 3).
 */
function transfer_me_theme_block_heading( string $text, int $level = 2 ): string {
	$attrs = 2 === $level ? '' : ' ' . wp_json_encode( array( 'level' => $level ) );
	return "<!-- wp:heading{$attrs} -->\n<h{$level} class=\"wp-block-heading\">" . esc_html( $text ) . "</h{$level}>\n<!-- /wp:heading -->\n";
}

/**
 * Bloco de parágrafo. Aceita <strong>, <em> e <a href>.
 *
 * @param string $text Texto.
 */
function transfer_me_theme_block_paragraph( string $text ): string {
	$allowed = array(
		'strong' => array(),
		'em'     => array(),
		'a'      => array( 'href' => array() ),
	);
	return "<!-- wp:paragraph -->\n<p>" . wp_kses( $text, $allowed ) . "</p>\n<!-- /wp:paragraph -->\n";
}

/**
 * Bloco de lista simples.
 *
 * @param string[] $items Itens.
 */
function transfer_me_theme_block_list( array $items ): string {
	$out = "<!-- wp:list -->\n<ul class=\"wp-block-list\">";
	foreach ( $items as $item ) {
		$out .= "<!-- wp:list-item -->\n<li>" . wp_kses( $item, array( 'strong' => array(), 'a' => array( 'href' => array() ) ) ) . "</li>\n<!-- /wp:list-item -->";
	}
	return $out . "</ul>\n<!-- /wp:list -->\n";
}

/**
 * Aviso de conteúdo provisório (só visível enquanto não for apagado pelo editor).
 */
function transfer_me_theme_block_draft_notice(): string {
	return "<!-- wp:paragraph {\"backgroundColor\":\"accent\",\"textColor\":\"contrast\",\"style\":{\"spacing\":{\"padding\":{\"top\":\"0.75rem\",\"bottom\":\"0.75rem\",\"left\":\"1rem\",\"right\":\"1rem\"}}}} -->\n<p class=\"has-contrast-color has-accent-background-color has-text-color has-background\" style=\"padding-top:0.75rem;padding-right:1rem;padding-bottom:0.75rem;padding-left:1rem\"><strong>"
		. esc_html__( 'Texto provisório: substitua os campos entre parênteses retos e peça revisão jurídica antes de publicar. Apague este aviso no fim.', 'transfer-me-theme' )
		. "</strong></p>\n<!-- /wp:paragraph -->\n";
}
