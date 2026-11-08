<?php
/**
 * Bootstrap dos testes de integração (suite oficial do WordPress).
 *
 * Variáveis de ambiente:
 *   WP_TESTS_DIR                    Pasta tests/phpunit do wordpress-develop (ou wordpress-tests-lib).
 *   WP_TESTS_PHPUNIT_POLYFILLS_PATH Pasta do yoast/phpunit-polyfills.
 */

$tmb_tests_dir = getenv( 'WP_TESTS_DIR' ) ?: rtrim( sys_get_temp_dir(), '/\\' ) . '/wordpress-tests-lib';

if ( ! file_exists( $tmb_tests_dir . '/includes/functions.php' ) ) {
	fwrite( STDERR, "Suite de testes do WordPress não encontrada em {$tmb_tests_dir}. Defina WP_TESTS_DIR.\n" );
	exit( 1 );
}

require_once $tmb_tests_dir . '/includes/functions.php';

tests_add_filter(
	'muplugins_loaded',
	static function () {
		require dirname( __DIR__, 2 ) . '/transfer-me-booking.php';
	}
);

require $tmb_tests_dir . '/includes/bootstrap.php';
require_once __DIR__ . '/class-tmb-testcase.php';
