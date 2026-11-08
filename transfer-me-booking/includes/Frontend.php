<?php
/**
 * Páginas públicas: painel do cliente (shortcode), painel do motorista, página de reserva e recursos.
 *
 * @package TransferMe\Booking
 */

namespace TransferMe\Booking;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Frontend.
 */
final class Frontend {

	/**
	 * Ganchos.
	 */
	public static function init(): void {
		add_shortcode( 'transfer_me_booking', array( __CLASS__, 'render_customer' ) );
		add_shortcode( 'transfer_me_driver', array( __CLASS__, 'render_driver' ) );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue' ) );
		add_action( 'init', array( __CLASS__, 'rewrites' ) );
		add_filter( 'query_vars', array( __CLASS__, 'query_vars' ) );
		add_action( 'template_redirect', array( __CLASS__, 'no_cache_private_pages' ), 1 );
		add_action( 'template_redirect', array( __CLASS__, 'maybe_render_booking_page' ) );
		add_filter( 'wp_robots', array( __CLASS__, 'robots' ) );
	}

	/**
	 * Regra do URL privado da reserva.
	 */
	public static function rewrites(): void {
		add_rewrite_rule( '^reserva/([a-f0-9]{64})/?$', 'index.php?tmb_token=$matches[1]', 'top' );
	}

	/**
	 * Variável de consulta do token.
	 *
	 * @param array $vars Variáveis.
	 */
	public static function query_vars( array $vars ): array {
		$vars[] = 'tmb_token';
		return $vars;
	}

	/**
	 * A página atual contém o shortcode?
	 *
	 * @param string $shortcode Shortcode.
	 */
	private static function page_has( string $shortcode ): bool {
		$post = get_queried_object();
		return $post instanceof \WP_Post && has_shortcode( $post->post_content, $shortcode );
	}

	/**
	 * Página da reserva ou do motorista: sem cache de página nem de browser partilhado.
	 */
	private static function is_private_page(): bool {
		return (bool) get_query_var( 'tmb_token' ) || self::page_has( 'transfer_me_driver' );
	}

	/**
	 * Impede caches de página (LiteSpeed, WP Rocket, W3TC, etc.) de guardar páginas privadas.
	 */
	public static function no_cache_private_pages(): void {
		if ( ! self::is_private_page() ) {
			return;
		}
		if ( ! defined( 'DONOTCACHEPAGE' ) ) {
			define( 'DONOTCACHEPAGE', true ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedConstantFound -- Constante padrão reconhecida pelos plugins de cache.
		}
		nocache_headers();
		if ( ! headers_sent() ) {
			header( 'Referrer-Policy: no-referrer' );
		}
	}

	/**
	 * Recursos CSS e JS, só nas páginas do plugin.
	 */
	public static function enqueue(): void {
		if ( ! self::page_has( 'transfer_me_booking' ) && ! self::page_has( 'transfer_me_driver' ) && ! get_query_var( 'tmb_token' ) ) {
			return;
		}
		wp_enqueue_style( 'transfer-me', TRANSFERME_URL . 'assets/css/transfer-me.css', array(), TRANSFERME_VERSION );
		wp_enqueue_script(
			'transfer-me',
			TRANSFERME_URL . 'assets/js/transfer-me.js',
			array(),
			TRANSFERME_VERSION,
			array(
				'in_footer' => true,
				'strategy'  => 'defer',
			)
		);
		wp_localize_script(
			'transfer-me',
			'tmbConfig',
			array(
				'root'        => esc_url_raw( rest_url( Rest::NS . '/' ) ),
				'nonce'       => is_user_logged_in() ? wp_create_nonce( 'wp_rest' ) : '',
				'leadMinutes' => (int) Util::settings()['lead_minutes'],
				'i18n'        => array(
					'choose'        => __( 'Escolha uma morada da lista.', 'transfer-me-booking' ),
					'calculating'   => __( 'A calcular o preço…', 'transfer-me-booking' ),
					'unconfirmed'   => __( 'Preço a confirmar. Envie o pedido e confirmaremos o valor.', 'transfer-me-booking' ),
					'invalidPlace'  => __( 'Só fazemos transfers na Madeira e no Porto Santo. Verifique as moradas.', 'transfer-me-booking' ),
					'tooFar'        => __( 'A distância excede o máximo para reserva online. Contacte-nos.', 'transfer-me-booking' ),
					'expired'       => __( 'A cotação expirou. A recalcular…', 'transfer-me-booking' ),
					'error'         => __( 'Ocorreu um erro. Tente novamente.', 'transfer-me-booking' ),
					'gpsFail'       => __( 'Não foi possível obter a localização. Escreva a morada.', 'transfer-me-booking' ),
					'sending'       => __( 'A enviar…', 'transfer-me-booking' ),
					'sent'          => __( 'Reserva criada. Guarde o código:', 'transfer-me-booking' ),
					'sentPending'   => __( 'Pedido enviado. Vamos confirmar o preço consigo. Código:', 'transfer-me-booking' ),
					'cancelled'     => __( 'Reserva cancelada.', 'transfer-me-booking' ),
					'driverOn'      => __( 'Em serviço', 'transfer-me-booking' ),
					'driverOff'     => __( 'Fora de serviço', 'transfer-me-booking' ),
					'driverEnter'   => __( 'Entrar em serviço', 'transfer-me-booking' ),
					'driverEmpty'   => __( 'Sem reservas nos próximos dias.', 'transfer-me-booking' ),
					'confirmCancel' => __( 'Cancelar esta reserva?', 'transfer-me-booking' ),
					'total'         => __( 'Total', 'transfer-me-booking' ),
					'trip'          => __( 'Viagem', 'transfer-me-booking' ),
					'pickup'        => __( 'Recolha', 'transfer-me-booking' ),
					'chargeable'    => __( 'km cobráveis', 'transfer-me-booking' ),
					'from'          => __( 'De', 'transfer-me-booking' ),
					'to'            => __( 'Para', 'transfer-me-booking' ),
					'pax'           => __( 'pax', 'transfer-me-booking' ),
					'bags'          => __( 'malas', 'transfer-me-booking' ),
					'notes'         => __( 'Notas', 'transfer-me-booking' ),
					'navigate'      => __( 'Navegar', 'transfer-me-booking' ),
					'call'          => __( 'Ligar', 'transfer-me-booking' ),
					'actConfirm'    => __( 'Confirmar', 'transfer-me-booking' ),
					'actStart'      => __( 'Iniciar viagem', 'transfer-me-booking' ),
					'actComplete'   => __( 'Concluir', 'transfer-me-booking' ),
				),
			)
		);
	}

	/**
	 * Formulário de reserva do cliente.
	 */
	public static function render_customer(): string {
		$s   = Util::settings();
		$min = wp_date( 'Y-m-d' );

		ob_start();
		?>
		<div class="tmb tmb-customer">
			<h2><?php esc_html_e( 'Reserve o seu transfer', 'transfer-me-booking' ); ?></h2>
			<form id="tmb-form" class="tmb-form" novalidate>
				<fieldset class="tmb-field">
					<legend><?php esc_html_e( 'Recolha', 'transfer-me-booking' ); ?></legend>
					<label for="tmb-pickup-text"><?php esc_html_e( 'Morada de recolha', 'transfer-me-booking' ); ?></label>
					<input type="text" id="tmb-pickup-text" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="tmb-pickup-list" aria-autocomplete="list">
					<ul id="tmb-pickup-list" class="tmb-suggestions" role="listbox" hidden></ul>
					<button type="button" id="tmb-gps" class="tmb-link"><?php esc_html_e( 'Usar a minha localização', 'transfer-me-booking' ); ?></button>
					<input type="hidden" name="pickup_place_id" id="tmb-pickup-place">
					<input type="hidden" name="pickup_lat" id="tmb-pickup-lat">
					<input type="hidden" name="pickup_lng" id="tmb-pickup-lng">
				</fieldset>

				<fieldset class="tmb-field">
					<legend><?php esc_html_e( 'Destino', 'transfer-me-booking' ); ?></legend>
					<label for="tmb-dropoff-text"><?php esc_html_e( 'Morada de destino', 'transfer-me-booking' ); ?></label>
					<input type="text" id="tmb-dropoff-text" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="tmb-dropoff-list" aria-autocomplete="list">
					<ul id="tmb-dropoff-list" class="tmb-suggestions" role="listbox" hidden></ul>
					<input type="hidden" name="dropoff_place_id" id="tmb-dropoff-place">
				</fieldset>

				<div class="tmb-row">
					<div class="tmb-field">
						<label for="tmb-date"><?php esc_html_e( 'Data', 'transfer-me-booking' ); ?></label>
						<input type="date" id="tmb-date" name="date" min="<?php echo esc_attr( $min ); ?>" required>
					</div>
					<div class="tmb-field">
						<label for="tmb-time"><?php esc_html_e( 'Hora', 'transfer-me-booking' ); ?></label>
						<input type="time" id="tmb-time" name="time" step="900" required>
					</div>
				</div>

				<div class="tmb-row">
					<div class="tmb-field">
						<label for="tmb-passengers"><?php esc_html_e( 'Passageiros', 'transfer-me-booking' ); ?></label>
						<select id="tmb-passengers" name="passengers">
							<?php for ( $i = 1; $i <= 4; $i++ ) : ?>
								<option value="<?php echo esc_attr( (string) $i ); ?>"><?php echo esc_html( (string) $i ); ?></option>
							<?php endfor; ?>
						</select>
					</div>
					<div class="tmb-field">
						<label for="tmb-bags"><?php esc_html_e( 'Malas', 'transfer-me-booking' ); ?></label>
						<select id="tmb-bags" name="bags">
							<?php for ( $i = 0; $i <= 10; $i++ ) : ?>
								<option value="<?php echo esc_attr( (string) $i ); ?>" <?php selected( $i, 1 ); ?>><?php echo esc_html( (string) $i ); ?></option>
							<?php endfor; ?>
						</select>
					</div>
				</div>

				<fieldset class="tmb-field">
					<legend><?php esc_html_e( 'Pagamento', 'transfer-me-booking' ); ?></legend>
					<label><input type="radio" name="payment" value="cash" checked> <?php echo esc_html( Bookings::payment_label( 'cash' ) ); ?></label>
					<label><input type="radio" name="payment" value="card_on_board"> <?php echo esc_html( Bookings::payment_label( 'card_on_board' ) ); ?></label>
				</fieldset>

				<div class="tmb-field">
					<label for="tmb-name"><?php esc_html_e( 'Nome', 'transfer-me-booking' ); ?></label>
					<input type="text" id="tmb-name" name="name" autocomplete="name" required minlength="2" maxlength="100">
				</div>
				<div class="tmb-row">
					<div class="tmb-field">
						<label for="tmb-phone"><?php esc_html_e( 'Telefone', 'transfer-me-booking' ); ?></label>
						<input type="tel" id="tmb-phone" name="phone" autocomplete="tel" required>
					</div>
					<div class="tmb-field">
						<label for="tmb-email"><?php esc_html_e( 'Email (opcional)', 'transfer-me-booking' ); ?></label>
						<input type="email" id="tmb-email" name="email" autocomplete="email">
					</div>
				</div>
				<div class="tmb-field">
					<label for="tmb-notes"><?php esc_html_e( 'Notas (opcional)', 'transfer-me-booking' ); ?></label>
					<textarea id="tmb-notes" name="notes" rows="2" maxlength="<?php echo esc_attr( (string) Bookings::NOTES_MAX ); ?>"></textarea>
				</div>

				<div class="tmb-field tmb-consent">
					<label><input type="checkbox" id="tmb-consent" name="consent" required>
						<?php
						$privacy_url = get_privacy_policy_url();
						printf(
							wp_kses(
								/* translators: %s: link to privacy policy */
								__( 'Li e aceito a <a href="%s">política de privacidade</a>.', 'transfer-me-booking' ),
								array( 'a' => array( 'href' => array() ) )
							),
							esc_url( $privacy_url ? $privacy_url : home_url( '/' ) )
						);
						?>
					</label>
				</div>

				<div id="tmb-quote" class="tmb-quote" aria-live="polite"></div>
				<button type="submit" id="tmb-submit" class="tmb-button" disabled><?php esc_html_e( 'Confirmar pedido', 'transfer-me-booking' ); ?></button>
				<div id="tmb-result" class="tmb-result" aria-live="polite"></div>
			</form>

			<section class="tmb-mine" id="tmb-mine" aria-labelledby="tmb-mine-title" hidden>
				<h3 id="tmb-mine-title"><?php esc_html_e( 'As minhas reservas', 'transfer-me-booking' ); ?></h3>
				<ul id="tmb-mine-list"></ul>
			</section>

			<section class="tmb-lookup" aria-labelledby="tmb-lookup-title">
				<h3 id="tmb-lookup-title"><?php esc_html_e( 'Consultar uma reserva', 'transfer-me-booking' ); ?></h3>
				<form id="tmb-lookup-form" class="tmb-form">
					<div class="tmb-row">
						<div class="tmb-field">
							<label for="tmb-lookup-ref"><?php esc_html_e( 'Código da reserva', 'transfer-me-booking' ); ?></label>
							<input type="text" id="tmb-lookup-ref" name="ref" required>
						</div>
						<div class="tmb-field">
							<label for="tmb-lookup-phone"><?php esc_html_e( 'Telefone', 'transfer-me-booking' ); ?></label>
							<input type="tel" id="tmb-lookup-phone" name="phone" required>
						</div>
					</div>
					<button type="submit" class="tmb-button tmb-button-secondary"><?php esc_html_e( 'Consultar', 'transfer-me-booking' ); ?></button>
					<p class="tmb-note"><?php esc_html_e( 'Ao consultar, o link anterior da reserva deixa de funcionar. Use sempre o link mais recente.', 'transfer-me-booking' ); ?></p>
					<div id="tmb-lookup-result" aria-live="polite"></div>
				</form>
			</section>
			<?php self::render_footer_notes( $s ); ?>
		</div>
		<?php
		return (string) ob_get_clean();
	}

	/**
	 * Licença, IVA e contacto por WhatsApp.
	 *
	 * @param array $s Definições.
	 */
	private static function render_footer_notes( array $s ): void {
		if ( $s['vat_label'] ) {
			echo '<p class="tmb-note tmb-vat">' . esc_html( $s['vat_label'] ) . '</p>';
		}
		if ( $s['licence_number'] ) {
			/* translators: %s: licence number */
			echo '<p class="tmb-note tmb-license">' . esc_html( sprintf( __( 'Número de licença: %s', 'transfer-me-booking' ), $s['licence_number'] ) ) . '</p>';
		}
		if ( $s['whatsapp_number'] ) {
			echo '<p class="tmb-note"><a href="' . esc_url( 'https://wa.me/' . $s['whatsapp_number'] ) . '" rel="noopener">' . esc_html__( 'Falar connosco por WhatsApp', 'transfer-me-booking' ) . '</a></p>';
		}
	}

	/**
	 * Painel do motorista.
	 */
	public static function render_driver(): string {
		ob_start();
		?>
		<div class="tmb tmb-driver">
		<?php
		if ( ! is_user_logged_in() ) {
			echo '<h2>' . esc_html__( 'Área do motorista', 'transfer-me-booking' ) . '</h2>';
			wp_login_form(
				array(
					'redirect' => get_permalink(),
					'remember' => true,
				)
			);
		} elseif ( ! Util::is_driver() ) {
			echo '<p>' . esc_html__( 'Esta conta não tem acesso ao painel do motorista.', 'transfer-me-booking' ) . '</p>';
			echo '<p><a href="' . esc_url( wp_logout_url( get_permalink() ) ) . '">' . esc_html__( 'Sair', 'transfer-me-booking' ) . '</a></p>';
		} else {
			$status = Driver::status();
			?>
			<h2><?php esc_html_e( 'Painel do motorista', 'transfer-me-booking' ); ?></h2>
			<p class="tmb-note"><?php esc_html_e( 'Mantenha o ecrã ligado enquanto estiver em serviço, para que a posição seja atualizada.', 'transfer-me-booking' ); ?></p>
			<button type="button" id="tmb-duty" class="tmb-button" aria-pressed="<?php echo $status['on_duty'] ? 'true' : 'false'; ?>">
				<?php echo $status['on_duty'] ? esc_html__( 'Em serviço', 'transfer-me-booking' ) : esc_html__( 'Entrar em serviço', 'transfer-me-booking' ); ?>
			</button>
			<p id="tmb-duty-status" class="tmb-note" aria-live="polite"></p>
			<h3><?php esc_html_e( 'Próximas reservas', 'transfer-me-booking' ); ?></h3>
			<div id="tmb-driver-list" aria-live="polite"></div>
			<?php
		}
		?>
		</div>
		<?php
		return (string) ob_get_clean();
	}

	/**
	 * Página privada /reserva/{token}/. Funciona com temas clássicos e temas de blocos.
	 */
	public static function maybe_render_booking_page(): void {
		$token = (string) get_query_var( 'tmb_token' );
		if ( ! $token ) {
			return;
		}
		$post = Bookings::find_by_token( $token );
		status_header( $post ? 200 : 404 );

		$block_theme = function_exists( 'wp_is_block_theme' ) && wp_is_block_theme();
		if ( $block_theme ) {
			?>
			<!doctype html>
			<html <?php language_attributes(); ?>>
			<head>
				<meta charset="<?php bloginfo( 'charset' ); ?>">
				<meta name="viewport" content="width=device-width, initial-scale=1">
				<?php wp_head(); ?>
			</head>
			<body <?php body_class(); ?>>
			<?php
			wp_body_open();
			echo '<div class="wp-site-blocks">';
			block_template_part( 'header' );
		} else {
			get_header();
		}

		echo '<main class="tmb tmb-booking-page">';
		if ( ! $post ) {
			echo '<h1>' . esc_html__( 'Reserva não encontrada', 'transfer-me-booking' ) . '</h1>';
			echo '<p>' . esc_html__( 'O link pode ter sido substituído por um mais recente. Consulte a reserva com o código e o telefone.', 'transfer-me-booking' ) . '</p>';
		} else {
			$v = Bookings::public_view( $post );
			$s = Util::settings();
			?>
			<h1>
				<?php
				/* translators: %s: booking code */
				echo esc_html( sprintf( __( 'Reserva %s', 'transfer-me-booking' ), $v['ref'] ) );
				?>
			</h1>
			<dl class="tmb-summary">
				<dt><?php esc_html_e( 'Estado', 'transfer-me-booking' ); ?></dt><dd id="tmb-status-label"><?php echo esc_html( $v['status_label'] ); ?></dd>
				<dt><?php esc_html_e( 'Data e hora', 'transfer-me-booking' ); ?></dt><dd><?php echo esc_html( $v['starts_local'] ); ?></dd>
				<dt><?php esc_html_e( 'Recolha', 'transfer-me-booking' ); ?></dt><dd><?php echo esc_html( $v['pickup_address'] ); ?></dd>
				<dt><?php esc_html_e( 'Destino', 'transfer-me-booking' ); ?></dt><dd><?php echo esc_html( $v['dropoff_address'] ); ?></dd>
				<dt><?php esc_html_e( 'Passageiros e malas', 'transfer-me-booking' ); ?></dt><dd><?php echo esc_html( $v['passengers'] . ' / ' . $v['bags'] ); ?></dd>
				<dt><?php esc_html_e( 'Pagamento', 'transfer-me-booking' ); ?></dt><dd><?php echo esc_html( $v['payment_label'] ); ?></dd>
				<dt><?php echo $v['price_pending'] ? esc_html__( 'Total', 'transfer-me-booking' ) : esc_html__( 'Total (preço fixo)', 'transfer-me-booking' ); ?></dt>
				<dd><?php echo esc_html( $v['total'] . ( $v['vat_label'] && ! $v['price_pending'] ? ' (' . $v['vat_label'] . ')' : '' ) ); ?></dd>
			</dl>
			<?php if ( $v['can_cancel'] ) : ?>
				<button type="button" id="tmb-cancel" class="tmb-button tmb-button-secondary" data-token="<?php echo esc_attr( $token ); ?>"><?php esc_html_e( 'Cancelar reserva', 'transfer-me-booking' ); ?></button>
				<p id="tmb-cancel-result" class="tmb-note" aria-live="polite"></p>
			<?php endif; ?>
			<?php
			self::render_footer_notes( $s );
		}
		echo '</main>';

		if ( $block_theme ) {
			block_template_part( 'footer' );
			echo '</div>';
			wp_footer();
			echo '</body></html>';
		} else {
			get_footer();
		}
		exit;
	}

	/**
	 * Páginas privadas (reserva e motorista) não devem aparecer nos motores de pesquisa.
	 *
	 * @param array $robots Diretivas.
	 */
	public static function robots( array $robots ): array {
		if ( self::is_private_page() ) {
			$robots['noindex']  = true;
			$robots['nofollow'] = true;
			unset( $robots['max-image-preview'] );
		}
		return $robots;
	}
}
