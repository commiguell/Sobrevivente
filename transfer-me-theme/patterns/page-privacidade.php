<?php
/**
 * Title: Página: Política de privacidade (RGPD)
 * Slug: transfer-me-theme/page-privacidade
 * Categories: transfer-me-theme-pages
 * Post Types: page
 * Block Types: core/post-content
 * Viewport Width: 1200
 * Description: Estrutura da política de privacidade com os dados que o plugin trata.
 *
 * @package TransferMeTheme
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

echo transfer_me_theme_block_draft_notice(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_paragraph( __( 'Última atualização: [data]. Esta política explica que dados pessoais tratamos quando reserva um transfer neste site.', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_heading( __( 'Responsável pelo tratamento', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_paragraph( __( '[Nome ou firma], NIF [número], [morada]. Contacto para assuntos de privacidade: [email].', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_heading( __( 'Que dados tratamos', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_list( array( __( 'Nome, telefone e, se indicar, email.', 'transfer-me-theme' ), __( 'Moradas e coordenadas de recolha e de destino, data e hora.', 'transfer-me-theme' ), __( 'Número de passageiros e de malas, notas e método de pagamento.', 'transfer-me-theme' ), __( 'Data e versão da política aceite.', 'transfer-me-theme' ), __( 'Se usar "Usar a minha localização", a posição do seu dispositivo nesse momento.', 'transfer-me-theme' ) ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_heading( __( 'Para quê e com que fundamento', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_paragraph( __( 'Para fazer o transfer que pediu e falar consigo sobre ele (execução de contrato, artigo 6.º, n.º 1, alínea b) do RGPD) e para cumprir obrigações fiscais (obrigação legal, alínea c)).', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_heading( __( 'Quanto tempo guardamos', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_paragraph( __( 'As reservas são apagadas automaticamente [365] dias depois da data da viagem. Os documentos de faturação são guardados pelo prazo legal.', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_heading( __( 'Com quem partilhamos', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_list( array( __( 'Google (Google Maps Platform), para sugerir moradas e calcular distâncias. Recebe o texto das moradas e coordenadas, nunca o seu nome, telefone ou email. Pode implicar transferência para fora da UE, ao abrigo de [mecanismo, por exemplo o Quadro de Privacidade de Dados UE-EUA].', 'transfer-me-theme' ), __( 'Empresa de alojamento do site: [nome e país].', 'transfer-me-theme' ), __( 'Autoridades, quando a lei o exigir.', 'transfer-me-theme' ) ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_heading( __( 'Cookies', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_paragraph( __( 'Usamos apenas um cookie técnico (tmb_res) que guarda neste browser o acesso às suas reservas durante 180 dias. Não usamos cookies de publicidade nem de análise. [Atualizar se instalar ferramentas de estatística.]', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_heading( __( 'Os seus direitos', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo transfer_me_theme_block_paragraph( __( 'Pode pedir acesso, retificação, apagamento, limitação ou portabilidade dos seus dados e opor-se ao tratamento, através de [email]. Tem também o direito de reclamar junto da Comissão Nacional de Proteção de Dados (<a href="https://www.cnpd.pt/">www.cnpd.pt</a>).', 'transfer-me-theme' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
