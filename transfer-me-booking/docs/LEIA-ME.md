# Transfer.me Booking

Reservas de transfers privados com cotação por distância. Clientes reservam sem conta. O motorista tem um painel próprio em /motorista.

## Instalação

1. Enviar a pasta `transfer-me-booking` para `wp-content/plugins/` (ou instalar o .zip).
2. Ativar o plugin. Ficam criadas as páginas /transfers e /motorista e o papel "Motorista de transfers".
3. Em **Transfer.me > Definições**, preencher preços, chave Google de servidor, número de licença e email de notificação.
4. Em **Definições > Leitura**, definir /transfers como página inicial, se for o caso.
5. Confirmar que o cron do servidor está ativo (WP-Cron ou cron real), para a limpeza diária.

## Google Cloud (manual)

- Criar projeto e associar faturação.
- Ativar: Places API (New), Routes API, Geocoding API.
- Criar uma chave de API só para este servidor. Restringir ao IP do servidor e às três APIs acima.
- Definir quotas diárias e um alerta de orçamento.
- A área servida é o retângulo em `includes/Google.php` (`RECT_LOW`, `RECT_HIGH`): 32,55–33,15 N e 17,30–16,20 O (Madeira e Porto Santo). Moradas e coordenadas fora dele são recusadas sem chamar o Google.
- O campo da chave nas definições não mostra a chave guardada. Deixar vazio mantém a chave atual.

### Custos

- O autocompletar usa um token de sessão por campo. O token é enviado no pedido Place Details que se segue à escolha, o que fecha a sessão (é cobrada como sessão e não por cada tecla).
- As coordenadas de cada place_id ficam em cache 24 horas.
- Cada cotação com motorista disponível faz 2 pedidos à Routes API (motorista → recolha, recolha → destino).

## Como funciona o preço

- Viagem: distância por estrada da recolha ao destino × preço por km.
- Recolha: distância por estrada da posição atual do motorista até à recolha. Os primeiros km são gratuitos; os restantes são cobrados.
- Arredondamento: as distâncias são arredondadas ao km inteiro mais próximo (0,5 sobe), antes de multiplicar pelo preço.
- Mínimo: aplicado ao total.
- A cotação vale 10 minutos. A página recalcula sozinha antes de expirar. A reserva fica com o preço fixo.
- Sem motorista com posição recente, ou se a Routes API falhar, a cotação fica "preço a confirmar". O cliente pode enviar o pedido; a reserva fica pendente com o total "A confirmar" e o email de notificação avisa que é preciso confirmar o preço.

## Motorista

- Entrar em serviço partilha a posição a cada 60 segundos (e logo que o separador volta a ficar visível). Apenas a última posição é guardada.
- Sair de serviço apaga a posição. Sem posição recente (10 minutos), as cotações ficam "preço a confirmar".
- O painel mostra as reservas de hoje e dos 14 dias seguintes, com botões para confirmar, iniciar e concluir, e links para ligar, WhatsApp e navegação.
- O administrador também tem acesso ao painel.

## Privacidade

- Dados guardados por reserva: nome, telefone, email (opcional), moradas, coordenadas de recolha e destino, data, hora, passageiros, malas, notas, pagamento, consentimento com versão da política.
- A posição do motorista não é guardada nas reservas nem em histórico.
- Reservas são apagadas ao fim do prazo definido nas definições (mínimo 30 dias, por defeito 365).
- **Ferramentas > Exportar dados pessoais** e **Apagar dados pessoais** encontram as reservas pelo email do cliente.
- A página da reserva e o painel do motorista enviam cabeçalhos sem cache, `DONOTCACHEPAGE` e `noindex`. A lista "As minhas reservas" é carregada por JavaScript a partir do cookie, para nunca ficar guardada numa cache de página.

## Bloco e integração com temas (1.2)

- Bloco **Formulário de reserva** (`transfer-me/booking-form`): o mesmo formulário do shortcode `[transfer_me_booking]`, mas pode ser colocado em templates e estilizado em `theme.json` (`styles.blocks["transfer-me/booking-form"]`) ou no Editor de estilos.
- Cada campo tem uma mensagem de erro própria (`.tmb-error`), ligada com `aria-describedby`. O botão de envio nunca fica desativado: ao enviar, a validação mostra o que falta.
- A caixa do preço tem a classe `.tmb-price`.
- `transferme_booking_public_info()` devolve dados públicos para temas: número de licença, WhatsApp, nota de IVA e URL da página de reservas. Nunca inclui a chave Google nem emails.
- Filtro `transferme_booking_show_footer_notes`: devolver `false` para não mostrar licença, IVA e WhatsApp por baixo do formulário (quando o tema já os mostra).

## Para programadores

- Ganchos: `transferme_client_ip` (filtro do IP usado na limitação de pedidos, para sites atrás de um proxy de confiança) e `transferme_google_error` (ação disparada quando uma chamada ao Google falha).
- Testes de preço, sem WordPress: `php tests/pricing-test.php`.
- Testes de integração (suite oficial do WordPress, com o Google simulado):

  ```bash
  WP_TESTS_DIR=/caminho/wordpress-develop/tests/phpunit \
  WP_TESTS_PHPUNIT_POLYFILLS_PATH=/caminho/vendor/yoast/phpunit-polyfills \
  phpunit -c phpunit.xml.dist
  ```

## Limitações conhecidas

- Não testado contra as APIs reais do Google. Os nomes dos campos foram conferidos com as definições oficiais da API, mas é preciso testar com uma chave de staging antes de produção.
- Traduções: os textos estão em português. Há um `languages/transfer-me-booking.pot`; falta criar os ficheiros .po/.mo para en_US e de_DE.
- Limitação de pedidos por IP: atrás de um proxy sem IP real, todos os pedidos partilham o mesmo limite (ver o filtro `transferme_client_ip`).
- Consulta por código e telefone rota o token: o link anterior deixa de funcionar.
- A cotação usa a posição atual do motorista, mesmo para reservas em dias futuros.
