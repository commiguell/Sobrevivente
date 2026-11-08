<?php
/**
 * Reservas: tipo de conteúdo privado, criação a partir de uma cotação, acesso por token e estados.
 *
 * @package TransferMe\Booking
 */

namespace TransferMe\Booking;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Reservas.
 */
final class Bookings {

	const CPT = 'tmb_booking';

	/** Dias à frente mostrados no painel do motorista. */
	const DRIVER_DAYS_AHEAD = 14;

	/** Comprimento máximo das notas. */
	const NOTES_MAX = 1000;

	/** Transições de estado permitidas. */
	const TRANSITIONS = array(
		'pending'     => array( 'confirmed', 'cancelled' ),
		'confirmed'   => array( 'in_progress', 'cancelled' ),
		'in_progress' => array( 'completed' ),
		'completed'   => array(),
		'cancelled'   => array(),
	);

	/**
	 * Ganchos do administrador e da privacidade.
	 */
	public static function init(): void {
		add_filter( 'manage_' . self::CPT . '_posts_columns', array( __CLASS__, 'admin_columns' ) );
		add_action( 'manage_' . self::CPT . '_posts_custom_column', array( __CLASS__, 'admin_column' ), 10, 2 );
		add_action( 'add_meta_boxes_' . self::CPT, array( __CLASS__, 'meta_boxes' ) );
		add_filter( 'wp_privacy_personal_data_exporters', array( __CLASS__, 'register_exporter' ) );
		add_filter( 'wp_privacy_personal_data_erasers', array( __CLASS__, 'register_eraser' ) );
	}

	/**
	 * Etiqueta de um estado.
	 *
	 * @param string $status Estado.
	 */
	public static function label( string $status ): string {
		$labels = array(
			'pending'     => __( 'Pendente', 'transfer-me-booking' ),
			'confirmed'   => __( 'Confirmada', 'transfer-me-booking' ),
			'in_progress' => __( 'Em curso', 'transfer-me-booking' ),
			'completed'   => __( 'Concluída', 'transfer-me-booking' ),
			'cancelled'   => __( 'Cancelada', 'transfer-me-booking' ),
		);
		return $labels[ $status ] ?? $status;
	}

	/**
	 * Etiqueta de um método de pagamento.
	 *
	 * @param string $method Método.
	 */
	public static function payment_label( string $method ): string {
		return 'card_on_board' === $method
			? __( 'Cartão (terminal a bordo)', 'transfer-me-booking' )
			: __( 'Numerário', 'transfer-me-booking' );
	}

	/**
	 * Regista o tipo de conteúdo.
	 *
	 * Importante: com map_meta_cap ligado, os valores de edit_post/read_post/delete_post passam a ser
	 * tratados como meta-capacidades. Pôr ali "manage_options" retirava essa capacidade a todos os
	 * administradores do site. Por isso map_meta_cap fica desligado e todas as capacidades apontam
	 * diretamente para manage_options, exceto criar, que fica bloqueado (as reservas só nascem da REST).
	 */
	public static function register_cpt(): void {
		register_post_type(
			self::CPT,
			array(
				'labels'          => array(
					'name'          => __( 'Reservas', 'transfer-me-booking' ),
					'singular_name' => __( 'Reserva', 'transfer-me-booking' ),
					'edit_item'     => __( 'Reserva', 'transfer-me-booking' ),
					'search_items'  => __( 'Pesquisar reservas', 'transfer-me-booking' ),
					'not_found'     => __( 'Sem reservas.', 'transfer-me-booking' ),
				),
				'public'          => false,
				'show_ui'         => true,
				'show_in_menu'    => Admin::PAGE,
				'show_in_rest'    => false,
				'supports'        => array( 'title' ),
				'map_meta_cap'    => false,
				'capability_type' => 'tmb_booking',
				'capabilities'    => array(
					'edit_post'              => 'manage_options',
					'read_post'              => 'manage_options',
					'delete_post'            => 'manage_options',
					'edit_posts'             => 'manage_options',
					'edit_others_posts'      => 'manage_options',
					'edit_published_posts'   => 'manage_options',
					'edit_private_posts'     => 'manage_options',
					'publish_posts'          => 'manage_options',
					'read_private_posts'     => 'manage_options',
					'delete_posts'           => 'manage_options',
					'delete_others_posts'    => 'manage_options',
					'delete_published_posts' => 'manage_options',
					'delete_private_posts'   => 'manage_options',
					'read'                   => 'manage_options',
					'create_posts'           => 'do_not_allow',
				),
			)
		);
	}

	/**
	 * Valida data e hora (formato, existência no calendário e antecedência mínima).
	 *
	 * @param string $date Data Y-m-d.
	 * @param string $time Hora H:i.
	 * @return \DateTimeImmutable|\WP_Error
	 */
	public static function parse_start( string $date, string $time ) {
		$tz     = wp_timezone();
		$starts = \DateTimeImmutable::createFromFormat( '!Y-m-d H:i', $date . ' ' . $time, $tz );
		if ( ! $starts || $starts->format( 'Y-m-d H:i' ) !== $date . ' ' . $time ) {
			return new \WP_Error( 'tmb_invalid', __( 'Data ou hora inválida.', 'transfer-me-booking' ), array( 'status' => 422, 'fields' => array( 'datetime' ) ) );
		}
		$min_start = ( new \DateTimeImmutable( 'now', $tz ) )->modify( '+' . (int) Util::settings()['lead_minutes'] . ' minutes' );
		if ( $starts < $min_start ) {
			return new \WP_Error( 'tmb_invalid', __( 'A data ou hora não cumpre a antecedência mínima.', 'transfer-me-booking' ), array( 'status' => 422, 'fields' => array( 'datetime' ) ) );
		}
		return $starts;
	}

	/**
	 * Cria a reserva a partir de uma cotação consumida. O preço é copiado da cotação e não volta a ser calculado.
	 * O formulário tem de vir já validado (ver Rest::create_booking).
	 *
	 * @param array              $quote  Cotação consumida.
	 * @param array              $form   Dados do formulário.
	 * @param \DateTimeImmutable $starts Início validado.
	 * @return array|\WP_Error Dados da reserva com o token em claro (só é mostrado uma vez).
	 */
	public static function create( array $quote, array $form, \DateTimeImmutable $starts ) {
		$token   = bin2hex( random_bytes( 32 ) );
		$ref     = self::unique_ref();
		$calc    = $quote['calc'];
		$pickup  = $quote['pickup'];
		$dropoff = $quote['dropoff'];

		$post_id = wp_insert_post(
			array(
				'post_type'   => self::CPT,
				'post_status' => 'publish',
				'post_title'  => $ref . ' — ' . sanitize_text_field( $form['name'] ),
			),
			true
		);
		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		$meta = array(
			'token_hash'      => hash( 'sha256', $token ),
			'ref'             => $ref,
			'status'          => 'pending',
			'starts_ts'       => $starts->getTimestamp(),
			'starts_local'    => $starts->format( 'Y-m-d H:i' ),
			'customer_name'   => sanitize_text_field( $form['name'] ),
			'customer_phone'  => sanitize_text_field( $form['phone'] ),
			'customer_email'  => sanitize_email( $form['email'] ?? '' ),
			'passengers'      => (int) $form['passengers'],
			'bags'            => (int) $form['bags'],
			'payment_method'  => in_array( $form['payment'], array( 'cash', 'card_on_board' ), true ) ? $form['payment'] : 'cash',
			'notes'           => mb_substr( sanitize_textarea_field( $form['notes'] ?? '' ), 0, self::NOTES_MAX ),
			'pickup_address'  => $pickup['address'],
			'pickup_lat'      => $pickup['lat'],
			'pickup_lng'      => $pickup['lng'],
			'dropoff_address' => $dropoff['address'],
			'dropoff_lat'     => $dropoff['lat'],
			'dropoff_lng'     => $dropoff['lng'],
			'price_pending'   => $calc ? 0 : 1,
			'consent_at'      => time(),
			'consent_version' => Util::POLICY_VERSION,
		);
		if ( $calc ) {
			$meta += array(
				'trip_km'              => $calc['trip_km'],
				'pickup_km'            => $calc['pickup_km'],
				'pickup_chargeable_km' => $calc['pickup_chargeable_km'],
				'trip_cents'           => $calc['trip_cents'],
				'pickup_cents'         => $calc['pickup_cents'],
				'total_cents'          => $calc['total_cents'],
			);
		}
		foreach ( $meta as $k => $v ) {
			update_post_meta( $post_id, $k, $v );
		}

		self::notify_created( $post_id, $token );

		return array(
			'id'    => $post_id,
			'ref'   => $ref,
			'token' => $token,
			'url'   => self::booking_url( $token ),
		);
	}

	/**
	 * Procura uma reserva pelo token em claro.
	 *
	 * @param string $token Token.
	 */
	public static function find_by_token( string $token ): ?\WP_Post {
		if ( ! Util::is_valid_token( $token ) ) {
			return null;
		}
		$posts = get_posts(
			array(
				'post_type'   => self::CPT,
				'post_status' => 'publish',
				'numberposts' => 1,
				'meta_key'    => 'token_hash', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
				'meta_value'  => hash( 'sha256', $token ), // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
			)
		);
		return $posts ? $posts[0] : null;
	}

	/**
	 * Procura uma reserva pelo código.
	 *
	 * @param string $ref Código.
	 */
	public static function find_by_ref( string $ref ): ?\WP_Post {
		$ref = strtoupper( (string) preg_replace( '/[^A-Za-z0-9]/', '', $ref ) );
		if ( '' === $ref ) {
			return null;
		}
		$posts = get_posts(
			array(
				'post_type'   => self::CPT,
				'post_status' => 'publish',
				'numberposts' => 1,
				'meta_key'    => 'ref', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
				'meta_value'  => $ref, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
			)
		);
		return $posts ? $posts[0] : null;
	}

	/**
	 * Lê os metadados de uma reserva como texto.
	 *
	 * @param \WP_Post $post Reserva.
	 * @return callable(string):string
	 */
	private static function getter( \WP_Post $post ): callable {
		$m = get_post_meta( $post->ID );
		return static fn( string $k ): string => (string) ( $m[ $k ][0] ?? '' );
	}

	/**
	 * Total formatado, ou "A confirmar".
	 *
	 * @param callable $get Leitor de metadados.
	 */
	private static function total_text( callable $get ): string {
		return '1' === $get( 'price_pending' ) ? __( 'A confirmar', 'transfer-me-booking' ) : Pricing::format( (int) $get( 'total_cents' ) );
	}

	/**
	 * Dados públicos da reserva. Nunca inclui dados do motorista nem contactos do cliente.
	 *
	 * @param \WP_Post $post Reserva.
	 */
	public static function public_view( \WP_Post $post ): array {
		$get             = self::getter( $post );
		$s               = Util::settings();
		$status          = $get( 'status' );
		$cancel_deadline = (int) $get( 'starts_ts' ) - (int) $s['cancel_hours'] * HOUR_IN_SECONDS;
		return array(
			'ref'             => $get( 'ref' ),
			'status'          => $status,
			'status_label'    => self::label( $status ),
			'starts_local'    => $get( 'starts_local' ),
			'pickup_address'  => $get( 'pickup_address' ),
			'dropoff_address' => $get( 'dropoff_address' ),
			'passengers'      => (int) $get( 'passengers' ),
			'bags'            => (int) $get( 'bags' ),
			'payment_method'  => $get( 'payment_method' ),
			'payment_label'   => self::payment_label( $get( 'payment_method' ) ),
			'price_pending'   => '1' === $get( 'price_pending' ),
			'total'           => self::total_text( $get ),
			'vat_label'       => (string) $s['vat_label'],
			'can_cancel'      => in_array( $status, array( 'pending', 'confirmed' ), true ) && time() < $cancel_deadline,
		);
	}

	/**
	 * Cancelamento pelo cliente, dentro do prazo. Avisa o email de notificação.
	 *
	 * @param \WP_Post $post Reserva.
	 * @return true|\WP_Error
	 */
	public static function cancel_by_customer( \WP_Post $post ) {
		$view = self::public_view( $post );
		if ( ! $view['can_cancel'] ) {
			return new \WP_Error( 'tmb_cancel', __( 'Esta reserva já não pode ser cancelada online. Contacte-nos.', 'transfer-me-booking' ), array( 'status' => 409 ) );
		}
		update_post_meta( $post->ID, 'status', 'cancelled' );

		$notify = (string) Util::settings()['notify_email'];
		if ( $notify ) {
			wp_mail(
				$notify,
				/* translators: %s: booking code */
				sprintf( __( 'Reserva %s cancelada pelo cliente', 'transfer-me-booking' ), $view['ref'] ),
				implode( "\n", self::summary_lines( $post ) )
			);
		}
		return true;
	}

	/**
	 * Alteração de estado (motorista ou administrador). Só transições permitidas.
	 *
	 * @param int    $post_id Reserva.
	 * @param string $new     Novo estado.
	 * @return true|\WP_Error
	 */
	public static function set_status( int $post_id, string $new ) {
		$current = (string) get_post_meta( $post_id, 'status', true );
		if ( ! in_array( $new, self::TRANSITIONS[ $current ] ?? array(), true ) ) {
			return new \WP_Error( 'tmb_transition', __( 'Transição de estado não permitida.', 'transfer-me-booking' ), array( 'status' => 409 ) );
		}
		update_post_meta( $post_id, 'status', $new );
		return true;
	}

	/**
	 * Reservas do motorista de hoje até DRIVER_DAYS_AHEAD dias, ordenadas por hora.
	 * Inclui as próximas para que as pendentes possam ser confirmadas a tempo.
	 *
	 * @return \WP_Post[]
	 */
	public static function upcoming_for_driver(): array {
		$tz    = wp_timezone();
		$start = ( new \DateTimeImmutable( 'today', $tz ) )->getTimestamp();
		$end   = ( new \DateTimeImmutable( 'today', $tz ) )->modify( '+' . ( self::DRIVER_DAYS_AHEAD + 1 ) . ' days' )->getTimestamp() - 1;
		return get_posts(
			array(
				'post_type'   => self::CPT,
				'post_status' => 'publish',
				'numberposts' => 200,
				'meta_key'    => 'starts_ts', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
				'orderby'     => 'meta_value_num',
				'order'       => 'ASC',
				'meta_query'  => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
					array(
						'key'     => 'starts_ts',
						'value'   => array( $start, $end ),
						'compare' => 'BETWEEN',
						'type'    => 'NUMERIC',
					),
				),
			)
		);
	}

	/**
	 * Dados completos para o motorista. Inclui contacto do cliente, mas não o token.
	 *
	 * @param \WP_Post $post Reserva.
	 */
	public static function driver_view( \WP_Post $post ): array {
		$get = self::getter( $post );
		return array(
			'id'              => $post->ID,
			'ref'             => $get( 'ref' ),
			'status'          => $get( 'status' ),
			'status_label'    => self::label( $get( 'status' ) ),
			'starts_local'    => $get( 'starts_local' ),
			'customer_name'   => $get( 'customer_name' ),
			'customer_phone'  => $get( 'customer_phone' ),
			'pickup_address'  => $get( 'pickup_address' ),
			'dropoff_address' => $get( 'dropoff_address' ),
			'pickup_lat'      => (float) $get( 'pickup_lat' ),
			'pickup_lng'      => (float) $get( 'pickup_lng' ),
			'passengers'      => (int) $get( 'passengers' ),
			'bags'            => (int) $get( 'bags' ),
			'payment_method'  => $get( 'payment_method' ),
			'payment_label'   => self::payment_label( $get( 'payment_method' ) ),
			'price_pending'   => '1' === $get( 'price_pending' ),
			'total'           => self::total_text( $get ),
			'notes'           => $get( 'notes' ),
			'whatsapp_url'    => 'https://wa.me/' . Util::phone_international( $get( 'customer_phone' ) ),
			'maps_url'        => 'https://www.google.com/maps/dir/?api=1&destination=' . rawurlencode( $get( 'pickup_lat' ) . ',' . $get( 'pickup_lng' ) ),
		);
	}

	/**
	 * URL privado da reserva.
	 *
	 * @param string $token Token em claro.
	 */
	public static function booking_url( string $token ): string {
		return home_url( '/reserva/' . $token . '/' );
	}

	/**
	 * Código de 8 caracteres hexadecimais, único.
	 */
	private static function unique_ref(): string {
		do {
			$ref = strtoupper( bin2hex( random_bytes( 4 ) ) );
		} while ( self::find_by_ref( $ref ) );
		return $ref;
	}

	/**
	 * Resumo da reserva para emails.
	 *
	 * @param \WP_Post $post Reserva.
	 * @return string[]
	 */
	private static function summary_lines( \WP_Post $post ): array {
		$s     = Util::settings();
		$get   = self::getter( $post );
		$lines = array(
			/* translators: %s: booking code */
			sprintf( __( 'Reserva %s', 'transfer-me-booking' ), $get( 'ref' ) ),
			/* translators: %s: date and time */
			sprintf( __( 'Data: %s', 'transfer-me-booking' ), $get( 'starts_local' ) ),
			/* translators: %s: pickup address */
			sprintf( __( 'Recolha: %s', 'transfer-me-booking' ), $get( 'pickup_address' ) ),
			/* translators: %s: drop-off address */
			sprintf( __( 'Destino: %s', 'transfer-me-booking' ), $get( 'dropoff_address' ) ),
			/* translators: 1: passengers, 2: bags */
			sprintf( __( 'Passageiros: %1$d · Malas: %2$d', 'transfer-me-booking' ), (int) $get( 'passengers' ), (int) $get( 'bags' ) ),
			/* translators: %s: total price */
			sprintf( __( 'Total: %s', 'transfer-me-booking' ), self::total_text( $get ) ) . ( $s['vat_label'] ? ' (' . $s['vat_label'] . ')' : '' ),
			/* translators: %s: payment method */
			sprintf( __( 'Pagamento: %s', 'transfer-me-booking' ), self::payment_label( $get( 'payment_method' ) ) ),
		);
		if ( $s['licence_number'] ) {
			/* translators: %s: licence number */
			$lines[] = sprintf( __( 'Número de licença: %s', 'transfer-me-booking' ), $s['licence_number'] );
		}
		return $lines;
	}

	/**
	 * Emails de nova reserva: ao email de notificação (com contacto do cliente) e ao cliente (com o link).
	 *
	 * @param int    $post_id Reserva.
	 * @param string $token   Token em claro.
	 */
	private static function notify_created( int $post_id, string $token ): void {
		$post  = get_post( $post_id );
		$s     = Util::settings();
		$get   = self::getter( $post );
		$lines = self::summary_lines( $post );

		if ( $s['notify_email'] ) {
			$admin   = $lines;
			$admin[] = '';
			/* translators: 1: customer name, 2: customer phone */
			$admin[] = sprintf( __( 'Cliente: %1$s · %2$s', 'transfer-me-booking' ), $get( 'customer_name' ), $get( 'customer_phone' ) );
			if ( $get( 'notes' ) ) {
				/* translators: %s: customer notes */
				$admin[] = sprintf( __( 'Notas: %s', 'transfer-me-booking' ), $get( 'notes' ) );
			}
			if ( '1' === $get( 'price_pending' ) ) {
				$admin[] = __( 'Preço por confirmar: contacte o cliente.', 'transfer-me-booking' );
			}
			wp_mail(
				$s['notify_email'],
				/* translators: %s: booking code */
				sprintf( __( 'Nova reserva %s', 'transfer-me-booking' ), $get( 'ref' ) ),
				implode( "\n", $admin )
			);
		}
		if ( $get( 'customer_email' ) ) {
			$lines[] = '';
			if ( '1' === $get( 'price_pending' ) ) {
				$lines[] = __( 'O preço será confirmado em breve.', 'transfer-me-booking' );
			}
			$lines[] = __( 'Acompanhe ou cancele a sua reserva aqui:', 'transfer-me-booking' ) . ' ' . self::booking_url( $token );
			wp_mail(
				$get( 'customer_email' ),
				/* translators: %s: booking code */
				sprintf( __( 'A sua reserva %s', 'transfer-me-booking' ), $get( 'ref' ) ),
				implode( "\n", $lines )
			);
		}
	}

	/**
	 * Apaga reservas mais antigas do que o prazo de retenção (cron diário).
	 */
	public static function purge_old(): void {
		$days   = max( 30, (int) Util::settings()['retention_days'] );
		$cutoff = time() - $days * DAY_IN_SECONDS;
		$old    = get_posts(
			array(
				'post_type'   => self::CPT,
				'post_status' => 'any',
				'numberposts' => 500,
				'fields'      => 'ids',
				'meta_query'  => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
					array(
						'key'     => 'starts_ts',
						'value'   => $cutoff,
						'compare' => '<',
						'type'    => 'NUMERIC',
					),
				),
			)
		);
		foreach ( $old as $id ) {
			wp_delete_post( $id, true );
		}
	}

	/* ------------------------------------------------------------------
	 * Administração
	 * ------------------------------------------------------------------ */

	/**
	 * Colunas da lista de reservas.
	 *
	 * @param array $columns Colunas.
	 */
	public static function admin_columns( array $columns ): array {
		return array(
			'cb'         => $columns['cb'] ?? '',
			'title'      => __( 'Reserva', 'transfer-me-booking' ),
			'tmb_starts' => __( 'Data e hora', 'transfer-me-booking' ),
			'tmb_route'  => __( 'Percurso', 'transfer-me-booking' ),
			'tmb_status' => __( 'Estado', 'transfer-me-booking' ),
			'tmb_total'  => __( 'Total', 'transfer-me-booking' ),
		);
	}

	/**
	 * Conteúdo das colunas.
	 *
	 * @param string $column  Coluna.
	 * @param int    $post_id Reserva.
	 */
	public static function admin_column( string $column, int $post_id ): void {
		$post = get_post( $post_id );
		if ( ! $post ) {
			return;
		}
		$get = self::getter( $post );
		switch ( $column ) {
			case 'tmb_starts':
				echo esc_html( $get( 'starts_local' ) );
				break;
			case 'tmb_route':
				echo esc_html( $get( 'pickup_address' ) . ' → ' . $get( 'dropoff_address' ) );
				break;
			case 'tmb_status':
				echo esc_html( self::label( $get( 'status' ) ) );
				break;
			case 'tmb_total':
				echo esc_html( self::total_text( $get ) );
				break;
		}
	}

	/**
	 * Caixa com os detalhes no ecrã de edição.
	 */
	public static function meta_boxes(): void {
		add_meta_box( 'tmb_details', __( 'Detalhes da reserva', 'transfer-me-booking' ), array( __CLASS__, 'render_meta_box' ), self::CPT, 'normal', 'high' );
	}

	/**
	 * Mostra os detalhes da reserva (só leitura).
	 *
	 * @param \WP_Post $post Reserva.
	 */
	public static function render_meta_box( \WP_Post $post ): void {
		$v    = self::driver_view( $post );
		$rows = array(
			__( 'Código', 'transfer-me-booking' )         => $v['ref'],
			__( 'Estado', 'transfer-me-booking' )         => $v['status_label'],
			__( 'Data e hora', 'transfer-me-booking' )    => $v['starts_local'],
			__( 'Cliente', 'transfer-me-booking' )        => $v['customer_name'],
			__( 'Telefone', 'transfer-me-booking' )       => $v['customer_phone'],
			__( 'Email', 'transfer-me-booking' )          => (string) get_post_meta( $post->ID, 'customer_email', true ),
			__( 'Recolha', 'transfer-me-booking' )        => $v['pickup_address'],
			__( 'Destino', 'transfer-me-booking' )        => $v['dropoff_address'],
			__( 'Passageiros', 'transfer-me-booking' )    => (string) $v['passengers'],
			__( 'Malas', 'transfer-me-booking' )          => (string) $v['bags'],
			__( 'Pagamento', 'transfer-me-booking' )      => $v['payment_label'],
			__( 'Total', 'transfer-me-booking' )          => $v['total'],
			__( 'Notas', 'transfer-me-booking' )          => $v['notes'],
		);
		echo '<table class="widefat striped"><tbody>';
		foreach ( $rows as $label => $value ) {
			echo '<tr><th scope="row">' . esc_html( $label ) . '</th><td>' . esc_html( $value ) . '</td></tr>';
		}
		echo '</tbody></table>';
	}

	/* ------------------------------------------------------------------
	 * Privacidade (Ferramentas > Exportar / Apagar dados pessoais)
	 * ------------------------------------------------------------------ */

	/**
	 * Regista o exportador.
	 *
	 * @param array $exporters Exportadores.
	 */
	public static function register_exporter( array $exporters ): array {
		$exporters['transfer-me-booking'] = array(
			'exporter_friendly_name' => __( 'Reservas de transfers', 'transfer-me-booking' ),
			'callback'               => array( __CLASS__, 'export_personal_data' ),
		);
		return $exporters;
	}

	/**
	 * Regista o eliminador.
	 *
	 * @param array $erasers Eliminadores.
	 */
	public static function register_eraser( array $erasers ): array {
		$erasers['transfer-me-booking'] = array(
			'eraser_friendly_name' => __( 'Reservas de transfers', 'transfer-me-booking' ),
			'callback'             => array( __CLASS__, 'erase_personal_data' ),
		);
		return $erasers;
	}

	/**
	 * Reservas de um email, por página.
	 *
	 * @param string $email Email.
	 * @param int    $page  Página (1..n).
	 * @return int[]
	 */
	private static function ids_by_email( string $email, int $page ): array {
		return get_posts(
			array(
				'post_type'   => self::CPT,
				'post_status' => 'any',
				'numberposts' => 50,
				'paged'       => max( 1, $page ),
				'fields'      => 'ids',
				'orderby'     => 'ID',
				'order'       => 'ASC',
				'meta_key'    => 'customer_email', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
				'meta_value'  => sanitize_email( $email ), // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
			)
		);
	}

	/**
	 * Exporta os dados das reservas associadas a um email.
	 *
	 * @param string $email Email.
	 * @param int    $page  Página.
	 */
	public static function export_personal_data( string $email, int $page = 1 ): array {
		$ids  = self::ids_by_email( $email, $page );
		$data = array();
		$keys = array(
			'ref'             => __( 'Código', 'transfer-me-booking' ),
			'starts_local'    => __( 'Data e hora', 'transfer-me-booking' ),
			'customer_name'   => __( 'Nome', 'transfer-me-booking' ),
			'customer_phone'  => __( 'Telefone', 'transfer-me-booking' ),
			'customer_email'  => __( 'Email', 'transfer-me-booking' ),
			'pickup_address'  => __( 'Recolha', 'transfer-me-booking' ),
			'dropoff_address' => __( 'Destino', 'transfer-me-booking' ),
			'notes'           => __( 'Notas', 'transfer-me-booking' ),
			'consent_version' => __( 'Versão da política aceite', 'transfer-me-booking' ),
		);
		foreach ( $ids as $id ) {
			$item = array();
			foreach ( $keys as $key => $name ) {
				$item[] = array(
					'name'  => $name,
					'value' => (string) get_post_meta( $id, $key, true ),
				);
			}
			$data[] = array(
				'group_id'    => 'tmb-bookings',
				'group_label' => __( 'Reservas de transfers', 'transfer-me-booking' ),
				'item_id'     => 'tmb-booking-' . $id,
				'data'        => $item,
			);
		}
		return array(
			'data' => $data,
			'done' => count( $ids ) < 50,
		);
	}

	/**
	 * Apaga as reservas associadas a um email.
	 *
	 * @param string $email Email.
	 * @param int    $page  Página (ignorada: apaga sempre a primeira página até não restar nada).
	 */
	public static function erase_personal_data( string $email, int $page = 1 ): array { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
		$ids = self::ids_by_email( $email, 1 );
		foreach ( $ids as $id ) {
			wp_delete_post( $id, true );
		}
		return array(
			'items_removed'  => (bool) $ids,
			'items_retained' => false,
			'messages'       => array(),
			'done'           => count( $ids ) < 50,
		);
	}
}
