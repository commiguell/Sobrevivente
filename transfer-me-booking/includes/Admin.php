<?php
/**
 * Página de definições no painel de administração.
 *
 * @package TransferMe\Booking
 */

namespace TransferMe\Booking;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Administração.
 */
final class Admin {

	const PAGE = 'transfer-me';

	/**
	 * Ganchos.
	 */
	public static function init(): void {
		add_action( 'admin_menu', array( __CLASS__, 'menu' ) );
		add_action( 'admin_init', array( __CLASS__, 'register' ) );
	}

	/**
	 * Menu.
	 */
	public static function menu(): void {
		add_menu_page(
			__( 'Transfer.me', 'transfer-me-booking' ),
			__( 'Transfer.me', 'transfer-me-booking' ),
			'manage_options',
			self::PAGE,
			array( __CLASS__, 'render' ),
			'dashicons-car',
			58
		);
		add_submenu_page(
			self::PAGE,
			__( 'Definições', 'transfer-me-booking' ),
			__( 'Definições', 'transfer-me-booking' ),
			'manage_options',
			self::PAGE,
			array( __CLASS__, 'render' )
		);
	}

	/**
	 * Regista a opção.
	 */
	public static function register(): void {
		register_setting(
			'tmb_settings_group',
			Util::OPTION,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( __CLASS__, 'sanitize' ),
				'default'           => array(),
			)
		);
	}

	/**
	 * Valores em euros são convertidos para cêntimos antes de guardar.
	 * A chave Google não é mostrada no formulário; deixar o campo vazio mantém a chave atual.
	 *
	 * @param mixed $input Valores enviados.
	 */
	public static function sanitize( $input ): array {
		$input   = is_array( $input ) ? $input : array();
		$current = Util::settings();
		$eur     = static fn( $v ) => (int) round( (float) str_replace( ',', '.', (string) $v ) * 100 );
		$key     = trim( sanitize_text_field( (string) ( $input['google_server_key'] ?? '' ) ) );
		if ( '' === $key || ! empty( $input['google_server_key_clear'] ) ) {
			$key = ! empty( $input['google_server_key_clear'] ) ? '' : (string) $current['google_server_key'];
		}
		return array(
			'rate_trip_cents'   => max( 0, $eur( $input['rate_trip_eur'] ?? 1 ) ),
			'pickup_free_km'    => max( 0, (int) ( $input['pickup_free_km'] ?? 3 ) ),
			'pickup_rate_cents' => max( 0, $eur( $input['pickup_rate_eur'] ?? 0.30 ) ),
			'minimum_cents'     => max( 0, $eur( $input['minimum_eur'] ?? 5 ) ),
			'max_km'            => max( 0, (int) ( $input['max_km'] ?? 0 ) ),
			'google_server_key' => $key,
			'lead_minutes'      => max( 0, (int) ( $input['lead_minutes'] ?? 120 ) ),
			'cancel_hours'      => max( 0, (int) ( $input['cancel_hours'] ?? 2 ) ),
			'retention_days'    => max( 30, (int) ( $input['retention_days'] ?? 365 ) ),
			'licence_number'    => sanitize_text_field( (string) ( $input['licence_number'] ?? '' ) ),
			'notify_email'      => sanitize_email( (string) ( $input['notify_email'] ?? '' ) ),
			'whatsapp_number'   => (string) preg_replace( '/\D+/', '', (string) ( $input['whatsapp_number'] ?? '' ) ),
			'vat_label'         => sanitize_text_field( (string) ( $input['vat_label'] ?? '' ) ),
		);
	}

	/**
	 * Página de definições.
	 */
	public static function render(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		$s       = Util::settings();
		$money   = static fn( int $cents ): string => number_format( $cents / 100, 2, '.', '' );
		$has_key = '' !== (string) $s['google_server_key'];
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Transfer.me — Definições', 'transfer-me-booking' ); ?></h1>
			<form method="post" action="options.php">
				<?php settings_fields( 'tmb_settings_group' ); ?>
				<h2><?php esc_html_e( 'Preços', 'transfer-me-booking' ); ?></h2>
				<table class="form-table" role="presentation">
					<?php
					self::row( 'rate_trip_eur', __( 'Viagem (€ por km)', 'transfer-me-booking' ), $money( (int) $s['rate_trip_cents'] ), 'number', array( 'step' => '0.01', 'min' => '0' ) );
					self::row( 'pickup_free_km', __( 'Recolha gratuita (km)', 'transfer-me-booking' ), (string) $s['pickup_free_km'], 'number', array( 'min' => '0' ) );
					self::row( 'pickup_rate_eur', __( 'Recolha (€ por km após o limite gratuito)', 'transfer-me-booking' ), $money( (int) $s['pickup_rate_cents'] ), 'number', array( 'step' => '0.01', 'min' => '0' ) );
					self::row( 'minimum_eur', __( 'Mínimo por reserva (€)', 'transfer-me-booking' ), $money( (int) $s['minimum_cents'] ), 'number', array( 'step' => '0.01', 'min' => '0' ) );
					self::row( 'max_km', __( 'Distância máxima da viagem (km, 0 = sem limite)', 'transfer-me-booking' ), (string) $s['max_km'], 'number', array( 'min' => '0' ) );
					?>
				</table>

				<h2><?php esc_html_e( 'Google', 'transfer-me-booking' ); ?></h2>
				<table class="form-table" role="presentation">
					<?php
					self::row(
						'google_server_key',
						__( 'Chave de servidor Google', 'transfer-me-booking' ),
						'',
						'password',
						array(
							'autocomplete' => 'new-password',
							'placeholder'  => $has_key ? __( 'Chave guardada — deixe vazio para manter', 'transfer-me-booking' ) : '',
						),
						__( 'Usada para Places (New), Routes e Geocoding. Restrinja-a ao IP do servidor e a estas três APIs.', 'transfer-me-booking' )
					);
					if ( $has_key ) {
						echo '<tr><th scope="row"></th><td><label><input type="checkbox" name="' . esc_attr( Util::OPTION ) . '[google_server_key_clear]" value="1"> ' . esc_html__( 'Apagar a chave guardada', 'transfer-me-booking' ) . '</label></td></tr>';
					}
					?>
				</table>

				<h2><?php esc_html_e( 'Reservas', 'transfer-me-booking' ); ?></h2>
				<table class="form-table" role="presentation">
					<?php
					self::row( 'lead_minutes', __( 'Antecedência mínima (minutos)', 'transfer-me-booking' ), (string) $s['lead_minutes'], 'number', array( 'min' => '0' ) );
					self::row( 'cancel_hours', __( 'Cancelamento permitido até (horas antes)', 'transfer-me-booking' ), (string) $s['cancel_hours'], 'number', array( 'min' => '0' ) );
					self::row( 'retention_days', __( 'Apagar reservas após (dias, mínimo 30)', 'transfer-me-booking' ), (string) $s['retention_days'], 'number', array( 'min' => '30' ) );
					self::row( 'licence_number', __( 'Número de licença', 'transfer-me-booking' ), (string) $s['licence_number'], 'text' );
					self::row( 'vat_label', __( 'Nota de IVA (opcional)', 'transfer-me-booking' ), (string) $s['vat_label'], 'text', array(), __( 'Ex.: "IVA incluído à taxa legal em vigor". Aparece junto ao preço e nos emails.', 'transfer-me-booking' ) );
					self::row( 'notify_email', __( 'Email de notificação', 'transfer-me-booking' ), (string) $s['notify_email'], 'email' );
					self::row( 'whatsapp_number', __( 'WhatsApp de contacto (com indicativo, só dígitos)', 'transfer-me-booking' ), (string) $s['whatsapp_number'], 'text', array( 'inputmode' => 'numeric' ), __( 'Mostrado aos clientes como link de contacto.', 'transfer-me-booking' ) );
					?>
				</table>
				<?php submit_button(); ?>
			</form>
		</div>
		<?php
	}

	/**
	 * Linha de formulário.
	 *
	 * @param string               $name  Nome do campo.
	 * @param string               $label Etiqueta.
	 * @param string               $value Valor.
	 * @param string               $type  Tipo do input.
	 * @param array<string,string> $attrs Atributos extra.
	 * @param string               $help  Ajuda.
	 */
	private static function row( string $name, string $label, string $value, string $type, array $attrs = array(), string $help = '' ): void {
		$id = 'tmb_' . $name;
		?>
		<tr>
			<th scope="row"><label for="<?php echo esc_attr( $id ); ?>"><?php echo esc_html( $label ); ?></label></th>
			<td>
				<input type="<?php echo esc_attr( $type ); ?>" id="<?php echo esc_attr( $id ); ?>" name="<?php echo esc_attr( Util::OPTION . '[' . $name . ']' ); ?>" value="<?php echo esc_attr( $value ); ?>" class="regular-text"
				<?php
				foreach ( $attrs as $attr => $attr_value ) {
					echo ' ' . esc_attr( $attr ) . '="' . esc_attr( $attr_value ) . '"';
				}
				?>
				>
				<?php if ( $help ) : ?>
					<p class="description"><?php echo esc_html( $help ); ?></p>
				<?php endif; ?>
			</td>
		</tr>
		<?php
	}
}
