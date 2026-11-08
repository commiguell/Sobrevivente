<?php
/**
 * Title: Página: Sobre
 * Slug: transfer-me-theme/page-sobre
 * Categories: transfer-me-theme-pages
 * Post Types: page
 * Block Types: core/post-content
 * Viewport Width: 1200
 * Description: Apresentação do serviço.
 *
 * @package TransferMeTheme
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

echo transfer_me_theme_block_draft_notice(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escapado na função.
echo transfer_me_theme_block_paragraph( __( 'Somos um serviço de transfers privados na Madeira e no Porto Santo. Levamos residentes e visitantes entre o aeroporto, o porto, hotéis e qualquer ponto da ilha, com preço fixo combinado antes da viagem.', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_heading( __( 'Quem somos', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_paragraph( __( '[Nome do motorista ou da empresa], a trabalhar na Madeira desde [ano]. [Uma ou duas frases sobre a experiência e a forma de trabalhar.]', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_heading( __( 'A viatura', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_list( array( __( 'Até 4 passageiros e respetiva bagagem.', 'transfer-me-theme' ), __( '[Marca e modelo], com ar condicionado.', 'transfer-me-theme' ), __( 'Cadeira de criança: [disponível a pedido / não disponível].', 'transfer-me-theme' ) ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_heading( __( 'Licença e seguro', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_paragraph( __( 'Licença n.º [número], emitida por [entidade]. Seguro de responsabilidade civil e de passageiros: [seguradora].', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
