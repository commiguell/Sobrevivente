<?php
/**
 * Testes das regras de preço. Executar com: php tests/pricing-test.php
 * Não requer WordPress nem PHPUnit.
 */

define( 'ABSPATH', __DIR__ . '/' ); // Pricing.php recusa acesso direto sem ABSPATH.
require_once __DIR__ . '/../includes/Pricing.php';

use TransferMe\Booking\Pricing;

$failures = 0;
$passes   = 0;

/**
 * Casos: [trip_km, pickup_km, total_cents esperado, recolha_cents esperada, descrição]
 * Valores conferidos à mão com a regra acordada.
 */
$cases = array(
	array( 24.0, 3.0, 2400, 0,    'recolha de 3 km é gratuita' ),
	array( 24.0, 10.4, 2610, 210, 'recolha 10,4 arredonda para 10' ),
	array( 24.0, 10.5, 2640, 240, 'recolha 10,5 arredonda para 11' ),
	array( 24.0, 10.6, 2640, 240, 'recolha 10,6 arredonda para 11' ),
	array( 3.0, 3.5, 500, 30,     'mínimo aplica-se ao total (recolha 3,5 -> 4 km)' ),
	array( 3.0, 0.0, 500, 0,      'pedido curto: mínimo de 5 €' ),
	array( 5.0, 2.0, 500, 0,      '5 km exatos ficam no mínimo' ),
	array( 3.0, 10.0, 510, 210,   'mínimo não ativado quando total ultrapassa 5 €' ),
	array( 1.4, 0.2, 500, 0,      'trip arredonda para 1 km e mínimo sobe para 5 €' ),
);

foreach ( $cases as [ $trip, $pickup, $expected_total, $expected_pickup, $label ] ) {
	$r = Pricing::calculate( $trip, $pickup );
	$ok = $r['total_cents'] === $expected_total && $r['pickup_cents'] === $expected_pickup;
	if ( $ok ) {
		++$passes;
	} else {
		++$failures;
		printf(
			"FALHOU: %s | trip=%.1f pickup=%.1f | esperado total=%d recolha=%d | obtido total=%d recolha=%d\n",
			$label, $trip, $pickup, $expected_total, $expected_pickup, $r['total_cents'], $r['pickup_cents']
		);
	}
}

// Arredondamento isolado.
$rounding = array(
	array( 10.4, 10 ),
	array( 10.5, 11 ),
	array( 10.6, 11 ),
	array( 0.0, 0 ),
	array( 2.5, 3 ),
);
foreach ( $rounding as [ $in, $out ] ) {
	if ( Pricing::round_km( $in ) === $out ) {
		++$passes;
	} else {
		++$failures;
		echo "FALHOU: round_km($in) esperado $out\n";
	}
}

// Limite máximo de distância.
$limit = Pricing::calculate( 50.0, 0.0, array( 'max_km' => 40 ) );
if ( false === $limit['within_limits'] ) {
	++$passes;
} else {
	++$failures;
	echo "FALHOU: limite máximo não bloqueou viagem de 50 km\n";
}

echo "\nPassaram: $passes | Falharam: $failures\n";
exit( $failures > 0 ? 1 : 0 );
