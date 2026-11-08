<?php
/**
 * Renderização do bloco transfer-me/booking-form: o mesmo formulário do shortcode [transfer_me_booking],
 * dentro de um invólucro com as classes e estilos do bloco (definidos no editor ou em theme.json).
 *
 * @package TransferMe\Booking
 *
 * @var array    $attributes Atributos do bloco.
 * @var string   $content    Conteúdo interno (não usado).
 * @var WP_Block $block      Instância do bloco.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

printf(
	'<div %1$s>%2$s</div>',
	get_block_wrapper_attributes(), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Função do core que já escapa os atributos.
	\TransferMe\Booking\Frontend::render_customer() // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- HTML gerado e escapado em render_customer().
);
