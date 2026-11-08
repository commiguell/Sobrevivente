<?php
/**
 * Title: Sem resultados
 * Slug: transfer-me-theme/no-results
 * Categories: transfer-me-theme
 * Inserter: no
 * Description: Mensagem quando a pesquisa ou o arquivo não têm conteúdo.
 *
 * @package TransferMeTheme
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<!-- wp:paragraph -->
<p><?php esc_html_e( 'Não encontrámos resultados. Tente outras palavras.', 'transfer-me-theme' ); ?></p>
<!-- /wp:paragraph -->
