<?php
/**
 * Remove dados do plugin ao apagar. Não apaga as páginas criadas, para não partir links existentes.
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

$transferme_bookings = get_posts( array(
	'post_type'   => 'tmb_booking',
	'post_status' => 'any',
	'numberposts' => -1,
	'fields'      => 'ids',
) );
foreach ( $transferme_bookings as $transferme_id ) {
	wp_delete_post( $transferme_id, true );
}

delete_option( 'tmb_settings' );
delete_option( 'tmb_driver_state' );
delete_option( 'tmb_customer_page_id' );
delete_option( 'tmb_driver_page_id' );
remove_role( 'transfer_driver' );
wp_clear_scheduled_hook( 'tmb_daily_cleanup' );
