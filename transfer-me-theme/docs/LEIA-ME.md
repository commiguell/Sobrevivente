# Transfer.me Theme 1.0.0

Tema de blocos (Full Site Editing) para apresentar o formulário do plugin **Transfer.me Booking**. O tema não tem lógica de reservas nem de preços.

- WordPress 6.5 ou superior (testado em 7.1.4), PHP 8.1 ou superior.
- Sem jQuery, sem bibliotecas JavaScript de terceiros e sem pedidos a servidores externos. A fonte Inter (WOFF2) vem com o tema.
- Idioma de origem: pt_PT. Traduções incluídas: en_US e de_DE (`languages/`).

## Instalação

1. **Aparência > Temas > Adicionar novo tema > Carregar tema**: escolher `transfer-me-theme-1.0.0.zip` e ativar.
2. **Plugins**: instalar e ativar o **Transfer.me Booking 1.2.0 ou superior**. O tema usa o bloco `transfer-me/booking-form`, que só existe a partir da 1.2. Sem o plugin, o tema mostra um aviso com o contacto no lugar do formulário.
3. Criar as páginas da checklist abaixo.
4. **Definições > Leitura**: "A sua página inicial mostra" pode ficar em "Os seus artigos mais recentes" — a página inicial é sempre o template do tema (hero, formulário, como funciona, confiança).
5. **Definições > Leitura**: desmarcar "Desencorajar os motores de pesquisa" antes de publicar.
6. **Definições > Privacidade**: escolher a página "Política de privacidade".
7. **Aparência > Editor > Navegação**: confirmar os links do cabeçalho (o tema aponta para /como-funciona/, /sobre/ e /contactos/).
8. A página `/transfers` que o plugin cria ao ser ativado deixa de ser necessária: pode passá-la a rascunho para não haver duas páginas de reserva.

## Checklist de páginas a criar

Ao criar cada página, o WordPress mostra os padrões do tema ("Transfer.me: páginas"). Escolha o padrão indicado e substitua os campos entre `[ ]`.

| Página | Slug | Template | Padrão inicial | Notas |
|---|---|---|---|---|
| Reservar | `reservar` | **Reservar** | — (o formulário vem do template) | Escreva um excerto: é a meta description. |
| Sobre | `sobre` | Predefinido | Página: Sobre | |
| Como funciona | `como-funciona` | Predefinido | Página: Como funciona | |
| Condições de serviço | `condicoes-de-servico` | Predefinido | Página: Condições de serviço | Revisão jurídica obrigatória. |
| Política de privacidade | `politica-de-privacidade` | Predefinido | Página: Política de privacidade (RGPD) | Revisão jurídica. Definir em Definições > Privacidade. |
| Contactos | `contactos` | Predefinido | Página: Contactos | |

Os slugs importam: o cabeçalho, o rodapé e o botão "Reservar" apontam para eles. O botão "Reservar" usa a página `reservar`; se não existir, a página de reservas do plugin; senão, a âncora `#reservar` da página inicial.

**Meta description:** cada página usa o seu excerto (painel lateral > Excerto). Sem excerto, usa o primeiro parágrafo.

## O que vem das definições do plugin

O rodapé e a secção de confiança mostram, a partir de **Transfer.me > Definições** do plugin:

- número de licença ("Licença n.º …");
- nota de IVA;
- botão de WhatsApp.

Estes elementos usam *block bindings*: continuam ligados às definições do plugin mesmo depois de editar o rodapé no Editor do site. Se o campo estiver vazio no plugin, o elemento não aparece.

O tema pede ao plugin para não repetir estes dados por baixo do formulário (filtro `transferme_booking_show_footer_notes`).

## Classes CSS do plugin estilizadas pelo tema

Estão em `style.css`, secção 4, e podem ser sobrescritas num tema-filho ou em **Aparência > Editor > Estilos > CSS adicional**. O invólucro do bloco (`.wp-block-transfer-me-booking-form`) é estilizado em `theme.json` (`styles.blocks["transfer-me/booking-form"]`: fundo, contorno, cantos, sombra e espaçamento) e também pode ser ajustado em **Estilos > Blocos > Formulário de reserva**.

| Classe | Elemento |
|---|---|
| `.tmb` | Contentor de qualquer ecrã do plugin |
| `.tmb-form` | Formulário (reserva e consulta) |
| `.tmb-field` | Grupo de um campo: label, controlo e erro |
| `.tmb-row` | Dois campos lado a lado (uma coluna em mobile) |
| `.tmb-error` | Mensagem de erro de um campo, ligada com `aria-describedby` |
| `.tmb-price` | Caixa da cotação (também tem `.tmb-quote`) |
| `.tmb-total` | Total dentro da cotação |
| `.tmb-note` | Texto secundário |
| `.tmb-button`, `.tmb-button-secondary` | Botões principal e secundário |
| `.tmb-link` | Botão com aspeto de link ("Usar a minha localização") |
| `.tmb-suggestions` | Lista de sugestões de moradas |
| `.tmb-result` | Mensagem depois de enviar |
| `.tmb-mine` | "As minhas reservas" |
| `.tmb-lookup` | Consulta por código e telefone |
| `.tmb-summary` | Resumo na página privada da reserva |
| `.tmb-card` | Cartão de reserva no painel do motorista |

Classes do tema: `.tmt-header`, `.tmt-sticky-cta` (botão "Reservar" fixo em mobile), `.tmt-hero`, `.tmt-hero-image` (imagem com `fetchpriority="high"`), `.tmt-steps`/`.tmt-step`, `.tmt-card`, `.tmt-footer`, `.tmt-plugin-missing`.

## Cores, tipografia e espaçamentos

Definidos em `theme.json` e disponíveis como variáveis CSS:

| Cor | Variável | Valor | Uso |
|---|---|---|---|
| Base | `--wp--preset--color--base` | #FFFFFF | Fundo |
| Superfície | `--wp--preset--color--surface` | #EEF4F7 | Secções alternadas |
| Contraste | `--wp--preset--color--contrast` | #0F1B24 | Texto, rodapé |
| Texto secundário | `--wp--preset--color--muted` | #45545F | Texto de apoio |
| Primária | `--wp--preset--color--primary` | #0B4F6C | Botões, links, foco |
| Primária forte | `--wp--preset--color--primary-strong` | #083B51 | Hover |
| Destaque | `--wp--preset--color--accent` | #FFC845 | Botão WhatsApp, foco em fundo escuro |
| Contorno | `--wp--preset--color--border` | #6A7B87 | Contornos de campos (≥ 3:1) |
| Erro | `--wp--preset--color--error` | #A3242F | Erros |
| Sucesso | `--wp--preset--color--success` | #1E6B3A | Reservado |

Fonte: Inter variável (`--wp--preset--font-family--body`). Tamanhos fluidos `small` a `xx-large`. Espaçamentos `--wp--preset--spacing--10` a `--70`. Outros: `--wp--custom--touch-target` (44 px), `--wp--custom--radius--small/medium`, `--wp--custom--focus--width`.

## Acessibilidade

- Link "Saltar para o conteúdo" gerado no servidor (funciona sem JavaScript).
- Foco visível em todos os controlos (3 px; cor de destaque em fundos escuros).
- Alvos de toque com pelo menos 44 px no cabeçalho, botões e formulário.
- O botão "Reservar" fixo deixa de ser fixo quando a altura útil é pequena (zoom de 200%), para não tapar conteúdo, e o `scroll-padding` evita que tape o campo com foco.
- Contraste AA verificado com axe-core em todas as páginas.

## SEO

- Meta description, Open Graph e Twitter Card em todas as páginas; dados estruturados `TaxiService` (área servida: Madeira e Porto Santo) na página inicial e na página Reservar.
- Desligam-se sozinhos com Yoast, Rank Math, AIOSEO, SEOPress ou The SEO Framework. Para desligar manualmente: `add_filter( 'transfer_me_theme_seo_enabled', '__return_false' );`
- Dados estruturados alteráveis com o filtro `transfer_me_theme_structured_data`.
- Sitemap (`/wp-sitemap.xml`) e `robots.txt` são os do WordPress.

## Traduções

- `languages/transfer-me-theme.pot`: modelo com todas as strings (PHP, padrões, theme.json).
- `languages/en_US.po/.mo` e `languages/de_DE.po/.mo`.
- Os textos do formulário vêm do plugin, que tem o seu próprio `.pot` mas ainda não tem traduções en_US/de_DE.
- Um site WordPress tem um idioma. Para ter páginas em pt, en e de ao mesmo tempo é preciso um plugin multilíngue (por exemplo, Polylang); o tema funciona com ele sem alterações.

## Decisões pendentes

1. **Logótipo.** Hoje aparece o nome do site em texto. Carregar um SVG/PNG em Editor > Cabeçalho > Logótipo do site.
2. **Cores da marca.** A paleta é provisória. Ao mudar, verificar o contraste (texto normal ≥ 4,5:1; contornos e ícones ≥ 3:1).
3. **Imagem do hero e imagem de partilha.** Hoje são ilustrações provisórias (`assets/images/hero.webp`, `og-default.jpg`). Recomendo uma fotografia real da viatura ou da ilha, com direitos de uso, em WebP com cerca de 1200×750 px e menos de 150 KB.
4. **Textos finais.** Título e subtítulo do hero, os três passos, a secção de confiança e todas as páginas.
5. **Afirmações a confirmar.** "Licença válida", "viatura com seguro", "toda a Madeira e Porto Santo", "levadas e miradouros", "até 4 passageiros", "cartão no terminal". Só publique o que for verdade.
6. **Textos legais.** Condições de serviço e Política de privacidade têm campos `[ ]` e precisam de revisão jurídica: entidade de resolução alternativa de litígios, mecanismo de transferência de dados para a Google, prazos de cancelamento e espera.
7. **Contactos.** Telefone, email, horário e morada (página Contactos).
8. **Multilíngue.** Ficar só em pt_PT ou instalar um plugin multilíngue para conteúdo em en/de.
9. **Traduções do plugin.** Criar en_US e de_DE para o formulário, se o site for multilíngue.
10. **Livro de Reclamações.** O rodapé tem o link para o Livro de Reclamações Eletrónico. Confirme as obrigações de afixação que se aplicam à atividade.
