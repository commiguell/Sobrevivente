<?php
/**
 * Dependências do script do editor.
 *
 * @package TransferMe\Booking
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return array(
	'dependencies' => array( 'wp-blocks', 'wp-element', 'wp-block-editor', 'wp-server-side-render', 'wp-i18n' ),
	'version'      => '1.2.0',
);
