<?php
/**
 * Funções auxiliares: definições, permissões, limitação de pedidos, telefones e cookies.
 *
 * @package TransferMe\Booking
 */

namespace TransferMe\Booking;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Funções auxiliares.
 */
final class Util {

	const OPTION         = 'tmb_settings';
	const COOKIE         = 'tmb_res';
	const COOKIE_MAX     = 10;
	const POLICY_VERSION = '2026-11-01';
	const DRIVER_CAP     = 'transfer_driver';
	const DEFAULT_CC     = '351'; // Indicativo usado quando o telefone tem só 9 dígitos.

	/**
	 * Definições com valores por defeito.
	 */
	public static function settings(): array {
		$defaults = array_merge(
			Pricing::defaults(),
			array(
				'google_server_key' => '',   // Chave de servidor (Places, Routes, Geocoding), restrita ao IP do servidor.
				'lead_minutes'      => 120,  // Antecedência mínima para reservar.
				'cancel_hours'      => 2,    // Cancelamento permitido até X horas antes.
				'retention_days'    => 365,  // Apagar reservas mais antigas do que isto.
				'licence_number'    => '',   // Número de licença a apresentar nos emails.
				'notify_email'      => get_option( 'admin_email' ),
				'whatsapp_number'   => '',   // Só dígitos com indicativo, ex. 351912345678.
				'vat_label'         => '',   // Texto de IVA a apresentar, se aplicável.
			)
		);
		$saved    = get_option( self::OPTION, array() );
		return array_merge( $defaults, is_array( $saved ) ? $saved : array() );
	}

	/**
	 * Pode aceder ao painel do motorista? Admin também, porque o administrador pode ser o próprio motorista.
	 */
	public static function is_driver(): bool {
		return is_user_logged_in() && ( current_user_can( self::DRIVER_CAP ) || current_user_can( 'manage_options' ) );
	}

	/**
	 * Limitação simples por IP usando transients. Devolve true se o pedido estiver dentro do limite.
	 * A janela é fixa: começa no primeiro pedido e não é prolongada pelos seguintes.
	 *
	 * @param string $bucket Nome do limite.
	 * @param int    $max    Pedidos permitidos na janela.
	 * @param int    $window Janela, em segundos.
	 */
	public static function rate_limit( string $bucket, int $max, int $window ): bool {
		$key   = 'tmb_rl_' . md5( $bucket . '|' . self::client_ip() );
		$state = get_transient( $key );
		$now   = time();
		if ( ! is_array( $state ) || $state['until'] <= $now ) {
			$state = array(
				'count' => 0,
				'until' => $now + $window,
			);
		}
		if ( $state['count'] >= $max ) {
			return false;
		}
		++$state['count'];
		set_transient( $key, $state, max( 1, $state['until'] - $now ) );
		return true;
	}

	/**
	 * IP do cliente. Por defeito só REMOTE_ADDR; atrás de um proxy de confiança, use o filtro transferme_client_ip.
	 */
	public static function client_ip(): string {
		$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
		/**
		 * IP usado na limitação de pedidos.
		 *
		 * @param string $ip REMOTE_ADDR.
		 */
		return (string) apply_filters( 'transferme_client_ip', $ip );
	}

	/**
	 * Mantém só dígitos.
	 *
	 * @param string $phone Telefone.
	 */
	public static function phone_digits( string $phone ): string {
		return (string) preg_replace( '/\D+/', '', $phone );
	}

	/**
	 * Compara dois telefones pelos últimos 9 dígitos.
	 *
	 * @param string $a Telefone A.
	 * @param string $b Telefone B.
	 */
	public static function phone_matches( string $a, string $b ): bool {
		$da = self::phone_digits( $a );
		$db = self::phone_digits( $b );
		if ( strlen( $da ) < 9 || strlen( $db ) < 9 ) {
			return false;
		}
		return substr( $da, -9 ) === substr( $db, -9 );
	}

	/**
	 * Número internacional para wa.me: retira o prefixo 00 e acrescenta 351 a números nacionais de 9 dígitos.
	 *
	 * @param string $phone Telefone.
	 */
	public static function phone_international( string $phone ): string {
		$digits = self::phone_digits( $phone );
		if ( str_starts_with( $digits, '00' ) ) {
			$digits = substr( $digits, 2 );
		}
		if ( 9 === strlen( $digits ) ) {
			$digits = self::DEFAULT_CC . $digits;
		}
		return $digits;
	}

	/**
	 * Lista de tokens de reservas guardada num cookie HTTP-only. Permite ao cliente ver as suas reservas sem conta.
	 *
	 * @param string $token Token em claro.
	 */
	public static function remember_token( string $token ): void {
		$tokens = self::remembered_tokens();
		array_unshift( $tokens, $token );
		$tokens = array_slice( array_values( array_unique( $tokens ) ), 0, self::COOKIE_MAX );
		if ( ! headers_sent() ) {
			setcookie(
				self::COOKIE,
				implode( ',', $tokens ),
				array(
					'expires'  => time() + 180 * DAY_IN_SECONDS,
					'path'     => '/',
					'secure'   => is_ssl(),
					'httponly' => true,
					'samesite' => 'Lax',
				)
			);
		}
	}

	/**
	 * Tokens válidos presentes no cookie.
	 */
	public static function remembered_tokens(): array {
		if ( empty( $_COOKIE[ self::COOKIE ] ) ) {
			return array();
		}
		$raw   = sanitize_text_field( wp_unslash( $_COOKIE[ self::COOKIE ] ) );
		$parts = array_filter( array_map( 'trim', explode( ',', $raw ) ) );
		return array_values( array_filter( $parts, array( __CLASS__, 'is_valid_token' ) ) );
	}

	/**
	 * Formato de token: 64 caracteres hexadecimais.
	 *
	 * @param string $token Token.
	 */
	public static function is_valid_token( string $token ): bool {
		return (bool) preg_match( '/^[a-f0-9]{64}$/', $token );
	}
}
