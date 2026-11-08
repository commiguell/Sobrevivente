<?php
/**
 * Plugin Name:       Transfer.me Booking
 * Plugin URI:        https://madeiratransfer.me
 * Description:       Reservas de transfers privados com cotação por distância, painel do cliente sem conta e painel do motorista.
 * Version:           1.1.0
 * Requires at least: 6.5
 * Requires PHP:      8.1
 * Author:            Transfer.me
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       transfer-me-booking
 * Domain Path:       /languages
 *
 * @package TransferMe\Booking
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'TRANSFERME_VERSION', '1.1.0' );
define( 'TRANSFERME_DIR', plugin_dir_path( __FILE__ ) );
define( 'TRANSFERME_URL', plugin_dir_url( __FILE__ ) );

require_once TRANSFERME_DIR . 'includes/Pricing.php';
require_once TRANSFERME_DIR . 'includes/Util.php';
require_once TRANSFERME_DIR . 'includes/Google.php';
require_once TRANSFERME_DIR . 'includes/Driver.php';
require_once TRANSFERME_DIR . 'includes/Quotes.php';
require_once TRANSFERME_DIR . 'includes/Bookings.php';
require_once TRANSFERME_DIR . 'includes/Rest.php';
require_once TRANSFERME_DIR . 'includes/Frontend.php';
require_once TRANSFERME_DIR . 'includes/Admin.php';

use TransferMe\Booking\Admin;
use TransferMe\Booking\Bookings;
use TransferMe\Booking\Driver;
use TransferMe\Booking\Frontend;
use TransferMe\Booking\Rest;

add_action(
	'plugins_loaded',
	static function () {
		Frontend::init();
		Admin::init();
		Bookings::init();
		add_action( 'rest_api_init', array( Rest::class, 'register' ) );
		add_action( 'tmb_daily_cleanup', array( Bookings::class, 'purge_old' ) );
	}
);

add_action( 'init', array( Bookings::class, 'register_cpt' ) );

/*
 * O plugin não é distribuído pelo WordPress.org, por isso as traduções vêm da pasta /languages
 * do próprio plugin e têm de ser carregadas explicitamente (em init, como pede o WordPress 6.7+).
 */
add_action(
	'init',
	static function () {
		load_plugin_textdomain( 'transfer-me-booking', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' ); // phpcs:ignore PluginCheck.CodeAnalysis.DiscouragedFunctions.load_plugin_textdomainFound
	},
	0
);

register_activation_hook(
	__FILE__,
	static function () {
		Driver::add_role();
		Frontend::rewrites();
		Bookings::register_cpt();
		flush_rewrite_rules();

		// Páginas criadas uma única vez.
		$pages = array(
			'customer_page_id' => array(
				'title'   => 'Transfers',
				'slug'    => 'transfers',
				'content' => '[transfer_me_booking]',
			),
			'driver_page_id'   => array(
				'title'   => 'Motorista',
				'slug'    => 'motorista',
				'content' => '[transfer_me_driver]',
			),
		);
		foreach ( $pages as $option => $page ) {
			if ( get_option( 'tmb_' . $option ) && get_post( (int) get_option( 'tmb_' . $option ) ) ) {
				continue;
			}
			$id = wp_insert_post(
				array(
					'post_title'   => $page['title'],
					'post_name'    => $page['slug'],
					'post_content' => $page['content'],
					'post_status'  => 'publish',
					'post_type'    => 'page',
				)
			);
			if ( $id && ! is_wp_error( $id ) ) {
				update_option( 'tmb_' . $option, $id );
			}
		}

		if ( ! wp_next_scheduled( 'tmb_daily_cleanup' ) ) {
			wp_schedule_event( time() + DAY_IN_SECONDS, 'daily', 'tmb_daily_cleanup' );
		}
	}
);

register_deactivation_hook(
	__FILE__,
	static function () {
		wp_clear_scheduled_hook( 'tmb_daily_cleanup' );
		flush_rewrite_rules();
	}
);
