<?php
/**
 * Cotações: calculam o preço com a posição atual do motorista e ficam guardadas durante 10 minutos.
 * Uma cotação só pode dar origem a uma reserva, e essa reserva fica com o preço fixo.
 *
 * Sem motorista disponível ou sem rota, a cotação fica "preço a confirmar": as moradas são guardadas
 * e o cliente pode enviar o pedido; o preço é confirmado depois.
 *
 * @package TransferMe\Booking
 */

namespace TransferMe\Booking;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Cotações.
 */
final class Quotes {

	const TTL = 600;

	/**
	 * Calcula uma cotação.
	 *
	 * @param array $pickup  ['place_id' => string, 'session' => string] ou ['lat' => float, 'lng' => float, 'address' => string].
	 * @param array $dropoff Mesma estrutura.
	 */
	public static function compute( array $pickup, array $dropoff ): array {
		$settings = Util::settings();

		$pickup_point  = self::resolve_point( $pickup );
		$dropoff_point = self::resolve_point( $dropoff );
		if ( ! $pickup_point || ! $dropoff_point ) {
			return self::unconfirmed( 'morada_invalida' );
		}

		$driver = Driver::current_position();
		if ( ! $driver ) {
			return self::unconfirmed( 'sem_motorista_disponivel', $pickup_point, $dropoff_point );
		}

		$pickup_km = Google::route_km( $driver, $pickup_point );
		$trip_km   = Google::route_km( $pickup_point, $dropoff_point );
		if ( null === $pickup_km || null === $trip_km ) {
			return self::unconfirmed( 'rota_indisponivel', $pickup_point, $dropoff_point );
		}

		$calc = Pricing::calculate( $trip_km, $pickup_km, $settings );
		if ( ! $calc['within_limits'] ) {
			return self::unconfirmed( 'distancia_excede_maximo' );
		}

		$id = self::store( $pickup_point, $dropoff_point, $calc );

		return array(
			'status'               => 'ok',
			'quote_id'             => $id,
			'expires_in'           => self::TTL,
			'trip_km'              => $calc['trip_km'],
			'pickup_km'            => $calc['pickup_km'],
			'pickup_chargeable_km' => $calc['pickup_chargeable_km'],
			'trip_price'           => Pricing::format( $calc['trip_cents'] ),
			'pickup_price'         => Pricing::format( $calc['pickup_cents'] ),
			'total_cents'          => $calc['total_cents'],
			'total'                => Pricing::format( $calc['total_cents'] ),
			'vat_label'            => (string) $settings['vat_label'],
		);
	}

	/**
	 * Obtém e consome a cotação. Uma cotação só pode ser usada uma vez.
	 *
	 * @param string $id Identificador.
	 */
	public static function consume( string $id ): ?array {
		if ( ! preg_match( '/^[a-f0-9]{32}$/', $id ) ) {
			return null;
		}
		$quote = get_transient( self::key( $id ) );
		if ( ! is_array( $quote ) ) {
			return null;
		}
		delete_transient( self::key( $id ) );
		return $quote;
	}

	/**
	 * Guarda a cotação. A posição do motorista não é guardada: só a distância resultante.
	 *
	 * @param array      $pickup  Ponto de recolha.
	 * @param array      $dropoff Ponto de destino.
	 * @param array|null $calc    Resultado de Pricing::calculate(), ou null se o preço estiver por confirmar.
	 */
	private static function store( array $pickup, array $dropoff, ?array $calc ): string {
		$id = bin2hex( random_bytes( 16 ) );
		set_transient(
			self::key( $id ),
			array(
				'id'      => $id,
				'pickup'  => $pickup,
				'dropoff' => $dropoff,
				'calc'    => $calc,
				'created' => time(),
			),
			self::TTL
		);
		return $id;
	}

	/**
	 * Chave do transient.
	 *
	 * @param string $id Identificador.
	 */
	private static function key( string $id ): string {
		return 'tmb_q_' . md5( $id );
	}

	/**
	 * Resposta "preço a confirmar". Com moradas válidas, inclui um quote_id que permite enviar o pedido.
	 *
	 * @param string     $reason  Motivo.
	 * @param array|null $pickup  Ponto de recolha.
	 * @param array|null $dropoff Ponto de destino.
	 */
	private static function unconfirmed( string $reason, ?array $pickup = null, ?array $dropoff = null ): array {
		$out = array(
			'status' => 'preco_a_confirmar',
			'reason' => $reason,
		);
		if ( $pickup && $dropoff ) {
			$out['quote_id']   = self::store( $pickup, $dropoff, null );
			$out['expires_in'] = self::TTL;
		}
		return $out;
	}

	/**
	 * Converte um place_id ou coordenadas em ponto com lat, lng e morada, dentro da área servida.
	 *
	 * @param array $point Ponto validado pela REST.
	 */
	private static function resolve_point( array $point ): ?array {
		$resolved = null;
		if ( ! empty( $point['place_id'] ) ) {
			$resolved = Google::resolve_place( (string) $point['place_id'], (string) ( $point['session'] ?? '' ) );
		} elseif ( isset( $point['lat'], $point['lng'] ) && is_numeric( $point['lat'] ) && is_numeric( $point['lng'] ) ) {
			$resolved = array(
				'lat'     => (float) $point['lat'],
				'lng'     => (float) $point['lng'],
				'address' => mb_substr( sanitize_text_field( (string) ( $point['address'] ?? '' ) ), 0, 200 ),
			);
		}
		if ( ! $resolved || ! Google::in_service_area( $resolved['lat'], $resolved['lng'] ) ) {
			return null;
		}
		if ( '' === $resolved['address'] ) {
			$resolved['address'] = sprintf( '%.5f, %.5f', $resolved['lat'], $resolved['lng'] );
		}
		return $resolved;
	}
}
