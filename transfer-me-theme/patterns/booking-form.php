<?php
/**
 * Title: Formulário de reserva
 * Slug: transfer-me-theme/booking-form
 * Categories: transfer-me-theme
 * Inserter: yes
 * Description: Bloco do plugin Transfer.me Booking. Sem o plugin ativo, mostra um aviso com o contacto.
 *
 * @package TransferMeTheme
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( transfer_me_theme_has_booking_block() ) :
	?>
<!-- wp:transfer-me/booking-form /-->
	<?php
else :
	$transfer_me_theme_info = transfer_me_theme_plugin_info();
	?>
<!-- wp:group {"className":"tmt-plugin-missing","layout":{"type":"constrained"}} -->
<div class="wp-block-group tmt-plugin-missing">
	<!-- wp:heading -->
	<h2 class="wp-block-heading"><?php esc_html_e( 'Reservas online indisponíveis', 'transfer-me-theme' ); ?></h2>
	<!-- /wp:heading -->
	<!-- wp:paragraph -->
	<p>
		<?php esc_html_e( 'De momento não é possível reservar online.', 'transfer-me-theme' ); ?>
		<a href="<?php echo esc_url( home_url( '/contactos/' ) ); ?>"><?php esc_html_e( 'Contacte-nos para reservar.', 'transfer-me-theme' ); ?></a>
	</p>
	<!-- /wp:paragraph -->
	<?php if ( current_user_can( 'activate_plugins' ) ) : ?>
	<!-- wp:paragraph {"fontSize":"small"} -->
	<p class="has-small-font-size"><?php esc_html_e( 'Nota para administradores: ative o plugin Transfer.me Booking (versão 1.2 ou superior) para mostrar aqui o formulário.', 'transfer-me-theme' ); ?></p>
	<!-- /wp:paragraph -->
	<?php endif; ?>
</div>
<!-- /wp:group -->
	<?php
endif;
