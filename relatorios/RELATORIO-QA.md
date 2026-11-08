# Relatório de qualidade — Transfer.me Theme 1.0.0 + Transfer.me Booking 1.2.0

Data: 2026-11-08. Ambiente: WordPress 7.1.4 (versão compilada oficial), PHP 8.3, base de dados SQLite, servidor PHP de desenvolvimento, Chromium 1243 (Playwright). As APIs do Google foram simuladas.

## 1. Theme Check

Plugin oficial Theme Check (WordPress/theme-check, ramo principal), corrido sobre o tema ativo.

- **Resultado: "Transfer.me Theme passed the tests"** (7842 testes).
- REQUIRED: 0 · WARNING: 0 · RECOMMENDED: 0.
- INFO (informativos, sem ação necessária):
  - INFO: Possible hard-coded links were found in the file patterns/page-privacidade.php. Line 33: echo transfer_me_theme_block_paragraph( __( 'Pode pedir acesso, retificação
  - INFO: Only one text-domain is being used in this theme. Make sure it matches the theme's slug correctly so that the theme will be compatible with WordPress.org language p
  - INFO Themes that use the tag accessibility-ready will need to undergo an accessibility review. See https://make.wordpress.org/themes/handbook/review/accessibility/

Os links assinalados são intencionais (CNPD e Livro de Reclamações nos textos legais).

## 2. Lighthouse 13.6.0

Configuração por defeito do Lighthouse (mobile: Moto G Power emulado com rede 4G lenta simulada; desktop: `--preset=desktop`).

| Página | Modo | Desempenho | Acessibilidade | Boas práticas | SEO | FCP | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|---|
| Página inicial | mobile | 99 | 100 | 100 | 100 | 1.4 s | 2.1 s | 0 | 0 ms |
| Página inicial | desktop | 100 | 100 | 100 | 100 | 0.3 s | 0.5 s | 0 | 0 ms |
| Reservar | mobile | 100 | 100 | 100 | 100 | 1.4 s | 1.4 s | 0 | 0 ms |
| Reservar | desktop | 100 | 100 | 100 | 100 | 0.3 s | 0.3 s | 0 | 0 ms |

Relatórios completos em `lighthouse/*.report.html`.

**Limite:** servidor PHP local, sem compressão HTTP nem cache de página. Em produção os números dependem do alojamento; o que se transporta são o peso da página, a ausência de bloqueios e o CLS 0.

## 3. Acessibilidade (WCAG 2.2 AA)

- **axe-core 4.14.0** (regras wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa e best-practice) em 8 páginas (inicial, Reservar, Sobre, Como funciona, Condições, Privacidade, Contactos, 404) a 390 px e 1280 px: **0 violações**.
- **Sem deslocamento horizontal** a 320, 360, 390, 768 e 1280 px, nem com zoom de 200% (640 px CSS).
- **Alvos de toque**: nenhum controlo interativo abaixo de 44 px a 320–390 px (links dentro de texto corrido excluídos, como prevê o critério 2.5.8).
- **Teclado**: o 1.º Tab é "Saltar para o conteúdo"; os 25 primeiros pontos de paragem têm contorno de foco visível e ficam no ecrã, incluindo o ícone do calendário nos campos de data e hora.
- **Botão "Reservar" fixo em mobile**: escondido na página Reservar; deixa de ser fixo com altura útil ≤ 500 px (zoom 200%), para não tapar o conteúdo nem o campo com foco (2.4.11).
- **Formulário**: labels visíveis; ao enviar com campos em falta aparecem 6 mensagens, cada uma ligada ao campo por `aria-describedby`, com `aria-invalid="true"` e foco no primeiro campo com erro.
- **Idioma**: `lang="pt-PT"`; com o site em de_DE e en_US, `lang` e textos do tema mudam (verificado).

### Contraste da paleta

| Par | Cores | Contraste | Mínimo | |
|---|---|---|---|---|
| Texto / base | #0F1B24 sobre #FFFFFF | 17.46:1 | 4.5:1 | ✔ |
| Texto / superfície | #0F1B24 sobre #EEF4F7 | 15.73:1 | 4.5:1 | ✔ |
| Secundário / base | #45545F sobre #FFFFFF | 7.82:1 | 4.5:1 | ✔ |
| Secundário / superfície | #45545F sobre #EEF4F7 | 7.04:1 | 4.5:1 | ✔ |
| Link primária / base | #0B4F6C sobre #FFFFFF | 8.94:1 | 4.5:1 | ✔ |
| Link primária / superfície | #0B4F6C sobre #EEF4F7 | 8.05:1 | 4.5:1 | ✔ |
| Botão: branco / primária | #FFFFFF sobre #0B4F6C | 8.94:1 | 4.5:1 | ✔ |
| Botão hover: branco / primária forte | #FFFFFF sobre #083B51 | 11.97:1 | 4.5:1 | ✔ |
| Rodapé: branco / contraste | #FFFFFF sobre #0F1B24 | 17.46:1 | 4.5:1 | ✔ |
| WhatsApp: contraste / destaque | #0F1B24 sobre #FFC845 | 11.31:1 | 4.5:1 | ✔ |
| Erro / base | #A3242F sobre #FFFFFF | 7.37:1 | 4.5:1 | ✔ |
| Contorno de campo / base | #6A7B87 sobre #FFFFFF | 4.38:1 | 3:1 | ✔ |
| Foco primária / base | #0B4F6C sobre #FFFFFF | 8.94:1 | 3:1 | ✔ |
| Foco destaque / contraste | #FFC845 sobre #0F1B24 | 11.31:1 | 3:1 | ✔ |

## 4. Editor de blocos

Abertos no editor: templates página inicial, Reservar e 404, e as 8 páginas criadas a partir dos padrões. **0 blocos inválidos.**

## 5. Fluxo de reserva no tema (Playwright, 390 px)

Página Reservar → envio vazio (erros por campo) → recolha e destino pelo autocompletar → cotação (26,40 €, IVA incluído) → reserva criada → página privada da reserva com cabeçalho e rodapé do tema. Sem erros de JavaScript.

## 6. Plugin Transfer.me Booking 1.2.0

- Testes de integração (suite oficial do WordPress 7.1.4): **54 testes, 360 asserções, todos a passar.**
- Plugin Check 2.2.0 (31 verificações estáticas): **0 problemas.**

## 7. Defeitos encontrados e corrigidos durante os testes

1. Ícone do menu móvel visível em desktop (CSS do tema anulava o `display:none` do core).
2. Licença, IVA e WhatsApp repetidos por baixo do formulário e no rodapé.
3. Ao clicar no campo seguinte, o erro do campo anterior desaparecia e o layout saltava, fazendo falhar o clique (o erro passou a desaparecer enquanto se escreve).
4. Página privada da reserva com tema de blocos: módulos da navegação carregados depois do `<head>` (erro de JavaScript).
5. Ícone do calendário dos campos de data/hora sem contorno de foco.
6. Botão fixo a tapar conteúdo com zoom de 200%.
7. Imagem do hero marcada como bloco inválido no editor.
8. Meta description automática a juntar títulos de secção.
