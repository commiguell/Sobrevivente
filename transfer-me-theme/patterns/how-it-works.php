<?php
/**
 * Title: Como funciona (3 passos)
 * Slug: transfer-me-theme/how-it-works
 * Categories: transfer-me-theme
 * Inserter: yes
 * Description: Secção com título e três passos numerados.
 *
 * @package TransferMeTheme
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
$transfer_me_theme_steps = array(
	array( __( 'Indique o percurso', 'transfer-me-theme' ), __( 'Escreva a morada de recolha e de destino, ou use a sua localização atual. Escolha a data, a hora e o número de passageiros.', 'transfer-me-theme' ) ),
	array( __( 'Veja o preço fixo', 'transfer-me-theme' ), __( 'O preço é calculado pela distância por estrada e fica fixo quando confirma o pedido. Sem taxímetro nem surpresas.', 'transfer-me-theme' ) ),
	array( __( 'Confirme e viaje', 'transfer-me-theme' ), __( 'Recebe um código e um link para acompanhar ou cancelar a reserva. Paga a bordo, em numerário ou com cartão.', 'transfer-me-theme' ) ),
);
?>
<!-- wp:group {"align":"full","anchor":"como-funciona","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull" id="como-funciona" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
	<!-- wp:heading {"align":"wide"} -->
	<h2 class="wp-block-heading alignwide"><?php esc_html_e( 'Como funciona', 'transfer-me-theme' ); ?></h2>
	<!-- /wp:heading -->
	<!-- wp:columns {"align":"wide","className":"tmt-steps"} -->
	<div class="wp-block-columns alignwide tmt-steps">
		<?php foreach ( $transfer_me_theme_steps as $transfer_me_theme_step ) : ?>
		<!-- wp:column {"className":"tmt-step"} -->
		<div class="wp-block-column tmt-step">
			<!-- wp:heading {"level":3} -->
			<h3 class="wp-block-heading"><?php echo esc_html( $transfer_me_theme_step[0] ); ?></h3>
			<!-- /wp:heading -->
			<!-- wp:paragraph -->
			<p><?php echo esc_html( $transfer_me_theme_step[1] ); ?></p>
			<!-- /wp:paragraph -->
		</div>
		<!-- /wp:column -->
		<?php endforeach; ?>
	</div>
	<!-- /wp:columns -->
</div>
<!-- /wp:group -->
