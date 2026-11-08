<?php
/**
 * Title: Página: Condições de serviço
 * Slug: transfer-me-theme/page-condicoes
 * Categories: transfer-me-theme-pages
 * Post Types: page
 * Block Types: core/post-content
 * Viewport Width: 1200
 * Description: Estrutura das condições gerais do serviço, com campos a preencher.
 *
 * @package TransferMeTheme
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

echo transfer_me_theme_block_draft_notice(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
$transfer_me_theme_sections = array(
	__( '1. Prestador do serviço', 'transfer-me-theme' )           => __( '[Nome ou firma], NIF [número], com sede em [morada]. Licença de transporte n.º [número].', 'transfer-me-theme' ),
	__( '2. Reserva', 'transfer-me-theme' )                         => __( 'A reserva fica registada quando recebe o código de reserva. A reserva com preço por confirmar só fica garantida depois de confirmarmos o valor consigo.', 'transfer-me-theme' ),
	__( '3. Preço', 'transfer-me-theme' )                           => __( 'O preço apresentado e aceite na reserva é fixo e inclui [IVA à taxa legal em vigor / outras taxas]. Portagens, esperas superiores a [X] minutos e paragens extra: [regras].', 'transfer-me-theme' ),
	__( '4. Cancelamento e alterações', 'transfer-me-theme' )       => __( 'Pode cancelar sem custos através do link da reserva até [X] horas antes da hora marcada. Depois desse prazo: [regras]. Para alterar a reserva, contacte-nos.', 'transfer-me-theme' ),
	__( '5. Tempo de espera e atrasos', 'transfer-me-theme' )       => __( 'Esperamos até [X] minutos sem custos. Em recolhas no aeroporto acompanhamos a hora de chegada do voo indicado nas notas. [Regras para atrasos maiores e não comparência.]', 'transfer-me-theme' ),
	__( '6. Passageiros, bagagem e crianças', 'transfer-me-theme' ) => __( 'Máximo de 4 passageiros. Bagagem: [limites]. O transporte de crianças cumpre o Código da Estrada; indique nas notas se precisa de cadeira.', 'transfer-me-theme' ),
	__( '7. Pagamento', 'transfer-me-theme' )                       => __( 'Pagamento a bordo, em numerário ou cartão. É emitida fatura com o NIF indicado pelo cliente.', 'transfer-me-theme' ),
	__( '8. Responsabilidade', 'transfer-me-theme' )                => __( '[Limites de responsabilidade, objetos esquecidos, danos na viatura.]', 'transfer-me-theme' ),
	__( '9. Reclamações e litígios', 'transfer-me-theme' )          => __( 'Pode reclamar no <a href="https://www.livroreclamacoes.pt/">Livro de Reclamações Eletrónico</a>. Em caso de litígio de consumo, pode recorrer a [entidade de resolução alternativa de litígios competente, com contacto e site].', 'transfer-me-theme' ),
	__( '10. Lei aplicável', 'transfer-me-theme' )                  => __( 'Estas condições regem-se pela lei portuguesa.', 'transfer-me-theme' ),
);
foreach ( $transfer_me_theme_sections as $transfer_me_theme_title => $transfer_me_theme_text ) {
	echo transfer_me_theme_block_heading( $transfer_me_theme_title ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	echo transfer_me_theme_block_paragraph( $transfer_me_theme_text ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
}
