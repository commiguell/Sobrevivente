<?php
/**
 * Endpoints REST. Cada rota tem permission_callback explícito.
 * Base: /wp-json/transfer-me/v1/
 *
 * @package TransferMe\Booking
 */

namespace TransferMe\Booking;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Rotas REST.
 */
final class Rest {

	const NS = 'transfer-me/v1';

	/**
	 * Regista as rotas.
	 */
	public static function register(): void {
		$public = '__return_true';
		$driver = array( __CLASS__, 'can_drive' );

		register_rest_route(
			self::NS,
			'/places/autocomplete',
			array(
				'methods'             => 'POST',
				'permission_callback' => $public,
				'callback'            => array( __CLASS__, 'autocomplete' ),
				'args'                => array(
					'input'   => array(
						'type'     => 'string',
						'required' => true,
					),
					'session' => array(
						'type'     => 'string',
						'required' => true,
					),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/places/reverse',
			array(
				'methods'             => 'POST',
				'permission_callback' => $public,
				'callback'            => array( __CLASS__, 'reverse' ),
				'args'                => array(
					'lat' => array(
						'type'     => 'number',
						'required' => true,
					),
					'lng' => array(
						'type'     => 'number',
						'required' => true,
					),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/quote',
			array(
				'methods'             => 'POST',
				'permission_callback' => $public,
				'callback'            => array( __CLASS__, 'quote' ),
			)
		);

		register_rest_route(
			self::NS,
			'/booking',
			array(
				'methods'             => 'POST',
				'permission_callback' => $public,
				'callback'            => array( __CLASS__, 'create_booking' ),
			)
		);

		register_rest_route(
			self::NS,
			'/booking/(?P<token>[a-f0-9]{64})',
			array(
				'methods'             => 'GET',
				'permission_callback' => $public,
				'callback'            => array( __CLASS__, 'view_booking' ),
			)
		);

		register_rest_route(
			self::NS,
			'/booking/(?P<token>[a-f0-9]{64})/cancel',
			array(
				'methods'             => 'POST',
				'permission_callback' => $public,
				'callback'            => array( __CLASS__, 'cancel_booking' ),
			)
		);

		register_rest_route(
			self::NS,
			'/lookup',
			array(
				'methods'             => 'POST',
				'permission_callback' => $public,
				'callback'            => array( __CLASS__, 'lookup' ),
			)
		);

		register_rest_route(
			self::NS,
			'/mine',
			array(
				'methods'             => 'GET',
				'permission_callback' => $public,
				'callback'            => array( __CLASS__, 'my_bookings' ),
			)
		);

		register_rest_route(
			self::NS,
			'/driver/duty',
			array(
				'methods'             => 'POST',
				'permission_callback' => $driver,
				'callback'            => array( __CLASS__, 'driver_duty' ),
			)
		);

		register_rest_route(
			self::NS,
			'/driver/location',
			array(
				'methods'             => 'POST',
				'permission_callback' => $driver,
				'callback'            => array( __CLASS__, 'driver_location' ),
			)
		);

		register_rest_route(
			self::NS,
			'/driver/bookings',
			array(
				'methods'             => 'GET',
				'permission_callback' => $driver,
				'callback'            => array( __CLASS__, 'driver_bookings' ),
			)
		);

		register_rest_route(
			self::NS,
			'/driver/bookings/(?P<id>\d+)/status',
			array(
				'methods'             => 'POST',
				'permission_callback' => $driver,
				'callback'            => array( __CLASS__, 'driver_status' ),
			)
		);
	}

	/**
	 * Permissão das rotas do motorista: 401 sem sessão, 403 sem permissão.
	 *
	 * @return true|\WP_Error
	 */
	public static function can_drive() {
		if ( Util::is_driver() ) {
			return true;
		}
		return new \WP_Error(
			'rest_forbidden',
			__( 'Sem acesso ao painel do motorista.', 'transfer-me-booking' ),
			array( 'status' => rest_authorization_required_code() )
		);
	}

	/**
	 * Resposta 429 se o limite tiver sido ultrapassado.
	 *
	 * @param string $bucket Nome do limite.
	 * @param int    $max    Pedidos por janela.
	 * @param int    $window Janela em segundos.
	 */
	private static function limited( string $bucket, int $max, int $window ): ?\WP_REST_Response {
		if ( Util::rate_limit( $bucket, $max, $window ) ) {
			return null;
		}
		return new \WP_REST_Response( array( 'message' => __( 'Demasiados pedidos. Tente mais tarde.', 'transfer-me-booking' ) ), 429 );
	}

	/**
	 * Autocompletar de moradas.
	 *
	 * @param \WP_REST_Request $req Pedido.
	 */
	public static function autocomplete( \WP_REST_Request $req ) {
		$limited = self::limited( 'autocomplete', 60, MINUTE_IN_SECONDS );
		if ( $limited ) {
			return $limited;
		}
		$input   = sanitize_text_field( (string) $req['input'] );
		$session = (string) $req['session'];
		if ( mb_strlen( $input ) < 3 || mb_strlen( $input ) > 120 || ! Google::is_valid_session( $session ) ) {
			return array( 'suggestions' => array() );
		}
		return array( 'suggestions' => Google::autocomplete( $input, $session ) );
	}

	/**
	 * Morada a partir de coordenadas.
	 *
	 * @param \WP_REST_Request $req Pedido.
	 */
	public static function reverse( \WP_REST_Request $req ) {
		$limited = self::limited( 'reverse', 30, MINUTE_IN_SECONDS );
		if ( $limited ) {
			return $limited;
		}
		$address = Google::reverse_geocode( (float) $req['lat'], (float) $req['lng'] );
		return array( 'address' => $address ?? '' );
	}

	/**
	 * Cotação.
	 *
	 * @param \WP_REST_Request $req Pedido.
	 */
	public static function quote( \WP_REST_Request $req ) {
		$limited = self::limited( 'quote', 20, MINUTE_IN_SECONDS );
		if ( $limited ) {
			return $limited;
		}
		$pickup  = self::point( $req['pickup'] );
		$dropoff = self::point( $req['dropoff'] );
		if ( ! $pickup || ! $dropoff ) {
			return new \WP_Error( 'tmb_point', __( 'Indique recolha e destino válidos.', 'transfer-me-booking' ), array( 'status' => 400 ) );
		}
		return Quotes::compute( $pickup, $dropoff );
	}

	/**
	 * Valida um ponto: ou place_id (com token de sessão opcional), ou lat/lng.
	 *
	 * @param mixed $raw Valor recebido.
	 */
	private static function point( $raw ): ?array {
		if ( ! is_array( $raw ) ) {
			return null;
		}
		if ( ! empty( $raw['place_id'] ) && is_string( $raw['place_id'] ) && preg_match( '/^[A-Za-z0-9_\-]{5,200}$/', $raw['place_id'] ) ) {
			$session = isset( $raw['session'] ) && is_string( $raw['session'] ) && Google::is_valid_session( $raw['session'] ) ? $raw['session'] : '';
			return array(
				'place_id' => $raw['place_id'],
				'session'  => $session,
			);
		}
		if ( isset( $raw['lat'], $raw['lng'] ) && is_numeric( $raw['lat'] ) && is_numeric( $raw['lng'] ) ) {
			return array(
				'lat'     => (float) $raw['lat'],
				'lng'     => (float) $raw['lng'],
				'address' => isset( $raw['address'] ) && is_scalar( $raw['address'] ) ? (string) $raw['address'] : '',
			);
		}
		return null;
	}

	/**
	 * Cria a reserva. Toda a validação acontece antes de consumir a cotação,
	 * para o cliente não a perder por um erro de formulário.
	 *
	 * @param \WP_REST_Request $req Pedido.
	 */
	public static function create_booking( \WP_REST_Request $req ) {
		$limited = self::limited( 'booking', 5, MINUTE_IN_SECONDS );
		if ( $limited ) {
			return $limited;
		}

		$str   = static fn( $v ): string => is_scalar( $v ) ? (string) $v : '';
		$name  = sanitize_text_field( $str( $req['name'] ) );
		$phone = sanitize_text_field( $str( $req['phone'] ) );
		$raw_e = trim( $str( $req['email'] ) );
		$email = sanitize_email( $raw_e );
		$date  = $str( $req['date'] );
		$time  = $str( $req['time'] );
		$pax   = (int) $req['passengers'];
		$bags  = (int) ( $req['bags'] ?? 0 );
		$pay   = $str( $req['payment'] );
		$notes = sanitize_textarea_field( $str( $req['notes'] ) );

		$errors = array();
		if ( mb_strlen( $name ) < 2 || mb_strlen( $name ) > 100 ) {
			$errors[] = 'name';
		}
		$digits = strlen( Util::phone_digits( $phone ) );
		if ( $digits < 9 || $digits > 15 ) {
			$errors[] = 'phone';
		}
		if ( '' !== $raw_e && ! is_email( $email ) ) {
			$errors[] = 'email';
		}
		$starts = null;
		if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date ) || ! preg_match( '/^\d{2}:\d{2}$/', $time ) ) {
			$errors[] = 'datetime';
		} else {
			$starts = Bookings::parse_start( $date, $time );
			if ( is_wp_error( $starts ) ) {
				$errors[] = 'datetime';
			}
		}
		if ( $pax < 1 || $pax > 4 ) {
			$errors[] = 'passengers';
		}
		if ( $bags < 0 || $bags > 10 ) {
			$errors[] = 'bags';
		}
		if ( ! in_array( $pay, array( 'cash', 'card_on_board' ), true ) ) {
			$errors[] = 'payment';
		}
		if ( mb_strlen( $notes ) > Bookings::NOTES_MAX ) {
			$errors[] = 'notes';
		}
		if ( ! rest_sanitize_boolean( $req['consent'] ?? false ) ) {
			$errors[] = 'consent';
		}
		if ( $errors ) {
			$message = in_array( 'datetime', $errors, true ) && is_wp_error( $starts )
				? $starts->get_error_message()
				: __( 'Verifique os campos assinalados.', 'transfer-me-booking' );
			return new \WP_Error(
				'tmb_invalid',
				$message,
				array(
					'status' => 422,
					'fields' => $errors,
				)
			);
		}

		$quote = Quotes::consume( $str( $req['quote_id'] ) );
		if ( ! $quote ) {
			return new \WP_Error( 'tmb_quote', __( 'A cotação expirou ou já foi usada. Calcule novamente o preço.', 'transfer-me-booking' ), array( 'status' => 409 ) );
		}

		$result = Bookings::create(
			$quote,
			array(
				'name'       => $name,
				'phone'      => $phone,
				'email'      => $email,
				'passengers' => $pax,
				'bags'       => $bags,
				'payment'    => $pay,
				'notes'      => $notes,
			),
			$starts
		);
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		Util::remember_token( $result['token'] );

		return array(
			'ref'           => $result['ref'],
			'url'           => $result['url'],
			'price_pending' => null === $quote['calc'],
		);
	}

	/**
	 * Vista pública por token.
	 *
	 * @param \WP_REST_Request $req Pedido.
	 */
	public static function view_booking( \WP_REST_Request $req ) {
		$post = Bookings::find_by_token( (string) $req['token'] );
		if ( ! $post ) {
			return new \WP_Error( 'tmb_not_found', __( 'Reserva não encontrada.', 'transfer-me-booking' ), array( 'status' => 404 ) );
		}
		return Bookings::public_view( $post );
	}

	/**
	 * Cancelamento pelo cliente.
	 *
	 * @param \WP_REST_Request $req Pedido.
	 */
	public static function cancel_booking( \WP_REST_Request $req ) {
		$limited = self::limited( 'cancel', 10, HOUR_IN_SECONDS );
		if ( $limited ) {
			return $limited;
		}
		$post = Bookings::find_by_token( (string) $req['token'] );
		if ( ! $post ) {
			return new \WP_Error( 'tmb_not_found', __( 'Reserva não encontrada.', 'transfer-me-booking' ), array( 'status' => 404 ) );
		}
		$ok = Bookings::cancel_by_customer( $post );
		if ( is_wp_error( $ok ) ) {
			return $ok;
		}
		return Bookings::public_view( $post );
	}

	/**
	 * Consulta por código e telefone. Devolve um novo link e o link anterior deixa de funcionar.
	 *
	 * @param \WP_REST_Request $req Pedido.
	 */
	public static function lookup( \WP_REST_Request $req ) {
		$limited = self::limited( 'lookup', 5, HOUR_IN_SECONDS );
		if ( $limited ) {
			return $limited;
		}
		$ref   = is_scalar( $req['ref'] ) ? (string) $req['ref'] : '';
		$phone = is_scalar( $req['phone'] ) ? (string) $req['phone'] : '';
		$post  = Bookings::find_by_ref( $ref );
		if ( ! $post || ! Util::phone_matches( $phone, (string) get_post_meta( $post->ID, 'customer_phone', true ) ) ) {
			return new \WP_Error( 'tmb_lookup', __( 'Não encontrámos uma reserva com esses dados.', 'transfer-me-booking' ), array( 'status' => 404 ) );
		}
		$token = bin2hex( random_bytes( 32 ) );
		update_post_meta( $post->ID, 'token_hash', hash( 'sha256', $token ) );
		Util::remember_token( $token );
		return array( 'url' => Bookings::booking_url( $token ) );
	}

	/**
	 * Reservas guardadas no cookie deste browser. Lido por JavaScript para não ficar em caches de página.
	 */
	public static function my_bookings() {
		$out = array();
		foreach ( Util::remembered_tokens() as $token ) {
			$post = Bookings::find_by_token( $token );
			if ( ! $post ) {
				continue;
			}
			$v     = Bookings::public_view( $post );
			$out[] = array(
				'ref'          => $v['ref'],
				'starts_local' => $v['starts_local'],
				'status_label' => $v['status_label'],
				'url'          => Bookings::booking_url( $token ),
			);
		}
		$response = new \WP_REST_Response( $out );
		$response->header( 'Cache-Control', 'no-store, private' );
		return $response;
	}

	/**
	 * Entrar ou sair de serviço.
	 *
	 * @param \WP_REST_Request $req Pedido.
	 */
	public static function driver_duty( \WP_REST_Request $req ) {
		Driver::set_duty( rest_sanitize_boolean( $req['on_duty'] ?? false ) );
		return Driver::status();
	}

	/**
	 * Atualiza a posição do motorista.
	 *
	 * @param \WP_REST_Request $req Pedido.
	 */
	public static function driver_location( \WP_REST_Request $req ) {
		$lat = $req['lat'];
		$lng = $req['lng'];
		if ( ! is_numeric( $lat ) || ! is_numeric( $lng ) || abs( (float) $lat ) > 90 || abs( (float) $lng ) > 180 ) {
			return new \WP_Error( 'tmb_coords', __( 'Coordenadas inválidas.', 'transfer-me-booking' ), array( 'status' => 422 ) );
		}
		if ( ! Driver::set_position( (float) $lat, (float) $lng ) ) {
			return new \WP_Error( 'tmb_off_duty', __( 'Entre em serviço antes de partilhar a posição.', 'transfer-me-booking' ), array( 'status' => 409 ) );
		}
		return Driver::status();
	}

	/**
	 * Reservas próximas para o motorista.
	 */
	public static function driver_bookings() {
		return array_map(
			static fn( \WP_Post $p ) => Bookings::driver_view( $p ),
			Bookings::upcoming_for_driver()
		);
	}

	/**
	 * Muda o estado de uma reserva.
	 *
	 * @param \WP_REST_Request $req Pedido.
	 */
	public static function driver_status( \WP_REST_Request $req ) {
		$post = get_post( (int) $req['id'] );
		if ( ! $post || Bookings::CPT !== $post->post_type ) {
			return new \WP_Error( 'tmb_not_found', __( 'Reserva não encontrada.', 'transfer-me-booking' ), array( 'status' => 404 ) );
		}
		$new = sanitize_key( is_scalar( $req['status'] ) ? (string) $req['status'] : '' );
		$ok  = Bookings::set_status( $post->ID, $new );
		if ( is_wp_error( $ok ) ) {
			return $ok;
		}
		return Bookings::driver_view( $post );
	}
}
