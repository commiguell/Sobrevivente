<?php
/**
 * Estado do motorista: em serviço ou não, e a última posição conhecida.
 * Guarda apenas a última posição (sem histórico) e apaga-a ao sair de serviço.
 */

namespace TransferMe\Booking;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Driver {

	const OPTION        = 'tmb_driver_state';
	const FRESH_SECONDS = 600; // Posição com mais de 10 minutos não serve para cotar.

	public static function add_role(): void {
		add_role( 'transfer_driver', __( 'Motorista de transfers', 'transfer-me-booking' ), array(
			'read'                => true,
			Util::DRIVER_CAP      => true,
		) );
	}

	public static function remove_role(): void {
		remove_role( 'transfer_driver' );
	}

	/**
	 * Entra ou sai de serviço. Ao sair, apaga a posição.
	 */
	public static function set_duty( bool $on_duty ): void {
		if ( ! $on_duty ) {
			delete_option( self::OPTION );
			return;
		}
		$state = get_option( self::OPTION, array() );
		$state['on_duty'] = true;
		update_option( self::OPTION, $state, false );
	}

	/**
	 * Atualiza a última posição. Ignorado se o motorista não estiver em serviço.
	 */
	public static function set_position( float $lat, float $lng ): bool {
		$state = get_option( self::OPTION, array() );
		if ( empty( $state['on_duty'] ) ) {
			return false;
		}
		$state['lat'] = $lat;
		$state['lng'] = $lng;
		$state['ts']  = time();
		update_option( self::OPTION, $state, false );
		return true;
	}

	/**
	 * Posição usada para cotar, ou null se estiver fora de serviço ou desatualizada.
	 *
	 * @return array{lat:float,lng:float,ts:int}|null
	 */
	public static function current_position(): ?array {
		$state = get_option( self::OPTION, array() );
		if ( empty( $state['on_duty'] ) || ! isset( $state['lat'], $state['lng'], $state['ts'] ) ) {
			return null;
		}
		if ( time() - (int) $state['ts'] > self::FRESH_SECONDS ) {
			return null;
		}
		return array( 'lat' => (float) $state['lat'], 'lng' => (float) $state['lng'], 'ts' => (int) $state['ts'] );
	}

	public static function status(): array {
		$state = get_option( self::OPTION, array() );
		return array(
			'on_duty'     => ! empty( $state['on_duty'] ),
			'last_update' => isset( $state['ts'] ) ? (int) $state['ts'] : 0,
			'fresh'       => null !== self::current_position(),
		);
	}
}
