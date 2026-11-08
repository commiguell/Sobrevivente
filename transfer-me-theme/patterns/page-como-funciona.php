<?php
/**
 * Title: Página: Como funciona
 * Slug: transfer-me-theme/page-como-funciona
 * Categories: transfer-me-theme-pages
 * Post Types: page
 * Block Types: core/post-content
 * Viewport Width: 1200
 * Description: Explicação detalhada da reserva, do preço e do cancelamento.
 *
 * @package TransferMeTheme
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

echo transfer_me_theme_block_heading( __( 'Reservar', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_list( array( __( 'Escreva a morada de recolha e escolha-a na lista, ou use a sua localização atual.', 'transfer-me-theme' ), __( 'Escreva a morada de destino e escolha-a na lista.', 'transfer-me-theme' ), __( 'Escolha a data, a hora, o número de passageiros e de malas.', 'transfer-me-theme' ), __( 'Veja o preço, preencha o nome e o telefone e confirme.', 'transfer-me-theme' ) ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_heading( __( 'Como é calculado o preço', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_paragraph( __( 'O preço depende da distância por estrada entre a recolha e o destino, mais a deslocação do motorista até à recolha quando esta passa os primeiros quilómetros gratuitos. Há um valor mínimo por viagem.', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_paragraph( __( 'O preço mostrado vale 10 minutos. Depois de confirmar, fica fixo, mesmo que haja trânsito ou desvios.', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_paragraph( __( 'Se o preço não puder ser calculado no momento, pode enviar o pedido na mesma: confirmamos o valor consigo antes da viagem.', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_heading( __( 'Depois de reservar', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_paragraph( __( 'Recebe um código de reserva e um link privado. Com o link pode ver o estado da reserva e cancelá-la dentro do prazo. Se perder o link, consulte a reserva com o código e o telefone.', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_heading( __( 'Pagamento', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_paragraph( __( 'Paga a bordo, no fim da viagem, em numerário ou com cartão no terminal da viatura.', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
