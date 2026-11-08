<?php
/**
 * Regras de preço. Funções puras, sem dependências do WordPress, para poderem ser testadas em isolamento.
 * Todos os valores monetários são em cêntimos (inteiros) para evitar erros de vírgula flutuante.
 *
 * @package TransferMe\\Booking
 */

namespace TransferMe\Booking;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Pricing {

	/**
	 * Valores por defeito. Podem ser substituídos pelas definições do plugin.
	 */
	public static function defaults(): array {
		return array(
			'rate_trip_cents'   => 100, // 1,00 € por km de viagem.
			'pickup_free_km'    => 3,   // Recolha gratuita até 3 km.
			'pickup_rate_cents' => 30,  // 0,30 € por km a partir dos 3 km.
			'minimum_cents'     => 500, // Mínimo de 5,00 € sobre o total.
			'max_km'            => 0,   // 0 = sem limite.
		);
	}

	/**
	 * Arredondamento padrão (half up): 10,4 -> 10; 10,5 -> 11; 10,6 -> 11.
	 */
	public static function round_km( float $km ): int {
		return (int) floor( $km + 0.5 );
	}

	/**
	 * Calcula a cotação completa.
	 *
	 * @param float $trip_km   Distância por estrada da recolha ao destino.
	 * @param float $pickup_km Distância por estrada da posição do motorista até à recolha.
	 * @param array $settings  Parâmetros (ver defaults()).
	 * @return array{trip_km:int,pickup_km:int,pickup_chargeable_km:int,trip_cents:int,pickup_cents:int,total_cents:int,within_limits:bool}
	 */
	public static function calculate( float $trip_km, float $pickup_km, array $settings = array() ): array {
		$s = array_merge( self::defaults(), $settings );

		$trip_r   = self::round_km( $trip_km );
		$pickup_r = self::round_km( $pickup_km );

		$pickup_chargeable = max( 0, $pickup_r - (int) $s['pickup_free_km'] );

		$trip_cents   = $trip_r * (int) $s['rate_trip_cents'];
		$pickup_cents = $pickup_chargeable * (int) $s['pickup_rate_cents'];
		$gross        = $trip_cents + $pickup_cents;
		$total        = max( $gross, (int) $s['minimum_cents'] );

		$max_km        = (int) $s['max_km'];
		$within_limits = $max_km <= 0 || $trip_r <= $max_km;

		return array(
			'trip_km'               => $trip_r,
			'pickup_km'             => $pickup_r,
			'pickup_chargeable_km'  => $pickup_chargeable,
			'trip_cents'            => $trip_cents,
			'pickup_cents'          => $pickup_cents,
			'total_cents'           => $total,
			'within_limits'         => $within_limits,
		);
	}

	/**
	 * Formata cêntimos para apresentação em pt_PT: 2640 -> "26,40 €".
	 */
	public static function format( int $cents ): string {
		return number_format( $cents / 100, 2, ',', '.' ) . ' €';
	}
}
