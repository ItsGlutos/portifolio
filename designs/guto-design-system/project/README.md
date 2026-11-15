O gutoexplorer é uma identidade para um portfólio pessoal de dados, análise e processos: um céu noturno profundo, um azul de ação e um azul celeste de marca. O sistema existe para que qualquer página nova pareça ter sido feita no mesmo lugar — não para decorar telas escuras.

## Princípios

- **Profundidade por luz, não por sombra.** O fundo é um gradiente vertical de `sky-top` a `sky-bottom` com um brilho radial em `sky-glow` no canto superior direito. Não adicione vinheta, nebulosa ou textura de ruído.
- **Um azul de ação e um céu de marca.** `accent` é o único azul clicável, selecionado ou focado. `celeste` é sinal, rótulo, contorno e estrela. Se não é ação nem sinal, fica no azul-acinzentado neutro.
- **O movimento é um só.** As estrelas do céu são o único elemento em loop contínuo. Todo o resto responde ao usuário e para.

## Voz e tom

Escreva em português do Brasil, em primeira pessoa, com frases curtas e concretas. "Investigo", "organizo", "apresento" — não "somos apaixonados por soluções inovadoras". Títulos podem ser poéticos; descrições e botões, literais.

- Botões: verbo no infinitivo ou imperativo curto — "Explorar projetos", "Enviar e-mail", "Vamos conversar".
- Metadados e rótulos em caixa alta sempre com `micro` (tracking de 0,14em). Caixa alta sem tracking em tamanho pequeno vira borrão.
- Sem emoji como ícone, marcador ou decoração. Sem exclamações em série.
- Números técnicos usam `code` ou `code-micro` com `font-variant-numeric: tabular-nums`.

## Cor

O fundo é sempre `sky-top`; o gradiente usa `sky-bottom`. Superfícies de conteúdo são translúcidas: `surface` a 88% deixa o céu atravessar. Campos digitáveis são opacos (`field`, `field-focus`) para o texto do usuário nunca disputar atenção com as estrelas.

Contraste é consequência, não enfeite:

- `text` sobre `surface` — 14:1. `text-secondary` — 7,5:1. `text-muted` — 4,6:1 (piso para texto pequeno).
- `on-accent` sobre `accent` — 4,6:1. Não use `accent-hover` como preenchimento de texto: branco sobre ele dá 3,6:1.
- `accent-soft-text` sobre `accent-soft` — 7,5:1. `placeholder` sobre `field` — 5,7:1.
- `celeste` sobre `sky-top` — ~10:1. Ele é claro demais para carregar texto branco; quando precisar de preenchimento com texto, use `accent`.
- Estados semânticos só existem em pares: `success`/`success-bg`, `danger`/`danger-bg`, `warning`/`warning-bg`, `info`/`info-bg`. Nunca use verde ou vermelho puros, e nunca cor como único sinal — sempre acompanhe de palavra ou ícone.

## Tipografia

A família é humanista e silenciosa: `Segoe UI Variable` (`Segoe UI` no Windows), com `Inter`, `SF Pro` e `Roboto` como alternativas. `display` é usada só em títulos; `sans` no resto; `mono` em metadados técnicos. Não misture serifada "para dar personalidade" — a personalidade está no fundo.

- Hero: `display-hero` (76px, peso 600, tracking −0,035em). Uma vez por página.
- Seções: `display-section` (40px, −0,028em). Cards: `display-card` (20px).
- Corpo: `body` (15px, 1,65). Abertura: `lead` (17px, 1,55).
- Rótulos: `micro` (11px, caixa alta, 0,14em). Créditos: `nano` (9px).
- Hierarquia vem de peso e cor, não de muitos tamanhos: no máximo quatro tamanhos por bloco de tela.
- Tudo em px; nada abaixo de 9px; line-height 1,35 para corpo curto e 1,65 para leitura longa.

## Espaço, forma e elevação

A escala parte de 2px e usa múltiplos pares: `space-1` a `space-14`. Padding de card: `space-7`. Padding de painel: `space-8`. Separação de seções: `space-12` a `space-14`. Gap entre tags: `space-2`.

Raios são por família, nunca por gosto: `radius-badge` em tags, `radius-field` em botões e campos, `radius-card` em cartões pequenos e barras, `radius-panel` em cartões de projeto e citações, `radius-xl` no painel de contato, `radius-pill` em pílulas e selos.

No escuro não existe sombra padrão. Para separar planos use, nesta ordem: borda de 1px (`border`), superfície mais clara (`surface-alt`) e glow. `glow-accent` é luz emitida pelo botão primário; `shadow-float` e `shadow-hard` só tiram cartões do fundo. `inset-sheen` dá ao botão a sensação de superfície curva.

## Componentes

- **Cabeçalho fixo** (`size-header`, 68px): fundo `surface` com blur a partir de 8px de rolagem, borda inferior `border-soft`. Marca à esquerda, navegação de 13px, ícone e ação primária à direita. No mobile vira `menu-toggle` + painel de altura cheia.
- **Botão primário**: gradiente `accent` → `#23629f`, texto `on-accent`, `radius-field`, altura mínima `size-control`, glow `glow-accent`. Hover clareia para `accent-hover`; pressionado escurece para `accent-pressed`. Foco com anel de 2px.
- **Botão fantasma**: `surface`, borda `border`, texto `text-secondary`; no hover borda `celeste-line` e texto `text`. É o contraponto silencioso do primário.
- **Cartão de projeto**: `surface`, borda `border`, `radius-panel`, `shadow-hard`. A ilustração ocupa 16:10 e é SVG inline (sem imagens externas); o rodapé separa com `border-soft`. Hover levanta 4px e acende a borda em `celeste-line`.
- **Controle segmentado**: trilho `field` com borda `border` e raio 11; pílula ativa em gradiente `accent` → `#23629f`, raio 9, transição de 180–220ms. Em telas pequenas os itens quebram em duas linhas — nunca esconda filtros atrás de rolagem silenciosa.
- **Barra de status**: altura 44px, fundo `surface`, divisor `border-soft`, ponto de 6px e texto `text-muted` em 11px. Mostra "Pronto" quando não há nada pendente.
- **Divisor**: linha de 1px que desaparece nas pontas, com gradiente transparente → `border` em 18% → `border` em 82% → transparente. Nunca uma borda dura de ponta a ponta.

## Céu estrelado

O céu é canvas, não textura. Siga os parâmetros ou o efeito quebra:

- 67 estrelas de referência, densidade de ~1 por 4.500px², com teto de 140; 5 estrelas com halo (`celeste-strong`, raio 4,2×).
- Semente determinística `20261104`: o céu é sempre o mesmo lugar, em qualquer abertura.
- Cintilação: seno + smoothstep, período de 2,8 a 9,5s, fase aleatória por estrela. Piso de alfa 0,35; o raio acompanha o brilho (0,68× a 1,30×).
- 25fps, pausado com a aba oculta. Em `prefers-reduced-motion`, desenhe um quadro estático no brilho médio e pare.
- Estrelas nunca cruzam texto denso sem superfície opaca por trás. Se acontecer, aumente o alfa da superfície antes de remover estrelas.
- Proibido: estrelas brancas puras, mesma fase para todas, cintilação abaixo de 1,5s, blur por estrela e re-sortear posições a cada frame.

## Ícones

Ícones são SVG inline, traço de 1,6–1,7px, viewBox 24×24, cantos arredondados e `currentColor`. Um único estilo linear por página. Nunca emoji como ícone estrutural. Ícones decorativos levam `aria-hidden="true"` e `focusable="false"`; ícones que carregam significado levam rótulo textual visível ou `aria-label`.

## Movimento

O céu é o único loop. O resto é resposta: hover e foco em 120–150ms; pílula e menu em 180–220ms; revelação de seção em 600–720ms com `cubic-bezier(0.16, 1, 0.3, 1)`. Respeite `prefers-reduced-motion`: congele estrelas e mostre todo o conteúdo sem transição.

## Acessibilidade

- Foco sempre visível: anel de 2px em `celeste` com offset de 3px; no botão primário, anel em `on-accent` para dentro. Nunca `outline: none` sem substituto.
- Alvos de toque com no mínimo `size-control` (44px).
- Contraste conferido em cada par de texto (mínimo 4,5:1; 3:1 para textos grandes e ícones de significado).
- `lang="pt-BR"`, hierarquia de títulos sem pulos, link "Pular para o conteúdo" antes do cabeçalho e foco preso no menu mobile enquanto ele estiver aberto.
- Zoom de 150–200% não pode sobrepor controles: alturas em px com line-height fluida.

## Assets

O grupo **Brand** guarda duas versões da marca, copiadas do arquivo original:

- `guto-logo.svg` — retrato em `celeste` sobre fundo em gradiente `#10295a` → `#061a3e`, quadrado. Use como ícone de app, favicon, avatar e capa social.
- `guto-mark.svg` — a mesma arte sem o fundo, para superfícies escuras e translucent­es. É a versão do herói e do cabeçalho.

Não recolora, não gire e não recorte o anel orbital. A marca já é um sistema: o anel é o motivo gráfico do céu. Em fundo claro, use `guto-logo.svg` (o fundo navy é parte da peça).

## Como consumir

O site do portfólio, em `index.html` na raiz do projeto, implementa estes valores em `assets/css/tokens.css`; consuma as custom properties (`var(--accent)`, `var(--celeste)`, `var(--radius-card)`, `var(--font-display)`) em vez de repetir hex. Para um bloco novo, comece por `surface` + `border` + `radius-panel`; para uma ação, comece pelo botão primário com `glow-accent`.
