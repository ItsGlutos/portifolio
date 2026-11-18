# Migração para React — resultado

> Execução do plano em `PLANO-REACT.md`, fases **P0–P3** (validadas em 15/11/2026).
> Site novo em `web/`; site antigo preservado na raiz como referência de paridade.

## Entregue

| Fase | O que saiu | Estado |
| --- | --- | --- |
| P0 Fundação | Next 16.4 + React 19.3 + TS 5.9 strict, fontes WOFF2, CI de tipos | ✅ |
| P1 Paridade | Home inteira em componentes sobre o CSS original | ✅ 0,018–0,069% de diferença |
| P2 Interações | céu, menu, reveal, filtro, ímã, tilt, spotlight, reduced motion | ✅ QA 30/30 |
| P3 Ápice | Lenis + GSAP, View Transitions, OG image, JSON-LD, sitemap, axe | ✅ |

## Números medidos

| Métrica | Antes (estático) | Depois (React) |
| --- | --- | --- |
| Fontes | 432 KB em TTF | **86 KB em WOFF2** (subset latino) |
| SVGs de marca | 138 KB | **48 KB** (SVGO) |
| Transferência da home | ~600 KB (fontes sem compressão) | **284 KB gz** |
| JS inicial | ~21 KB | 185 KB gz (React/Next 115 + app/movimento 70) |
| LCP (localhost) | não medido | **580 ms** desktop · **420 ms** mobile |
| CLS | ~0 | **0,0004** / 0,0000 |
| TBT | — | **49 ms** / 22 ms |
| Console | 0 erros | 0 erros |
| Lighthouse/axe | sem teste | **0 violações serious/critical** |

Contexto do LCP/TBT: servidor local, sem throttling de rede nem CPU — serve como linha de base comparável, não como Lighthouse de campo.

## Bugs encontrados e corrigidos no caminho

1. **Cartões invisíveis com `prefers-reduced-motion`.** O site antigo revelava tudo por classe global; no React, conteúdo montado depois (filtro) ficava sem `is-visible` e, no modo reduzido, nunca era revelado. Agora `useInView` mantém o estado no React e o filtro força visibilidade.
2. **IntersectionObserver x View Transition.** Durante a transição de filtro, o observer não reavalia o layout: cartões que passavam a estar na tela ficavam com opacidade 0 até o usuário rolar. Resolvido revelando o resultado do filtro no próprio commit, sem depender do observer.
3. **Peso `600` fantasma.** O CSS original pedia `font-weight: 600` (16×) sem arquivo correspondente; o navegador sintetizava. Com `next/font/local` os pesos são explícitos (400/500/700).
4. **Encoding.** O CSS concatenado via PowerShell voltou duplamente codificado; reconstruído em UTF-8 explícito e auditado (`globals.css` sem mojibake).
5. **Landmark aninhado.** `aside` dentro de `section` era violação moderada no axe; virou `div` (sem mudança visual).
6. **Header sem estado de rolagem.** O componente guardava `scrolled` mas não aplicava `is-scrolled`; o header não ganhava fundo/desfoque ao rolar. Pegue pela regra de lint de variável não usada e corrigido.
7. **`backdrop-filter` comido pelo minificador.** O Lightning CSS manteve apenas `-webkit-backdrop-filter`, o que funciona no Chrome/Edge mas derrubaria o desfoque no Firefox. A ordem das declarações foi invertida (prefixo primeiro) e o build agora emite as duas.

## Como reproduzir a verificação

```bash
cd web && npm run build
cd .. && python tools/serve_out.py 4300
python tools/qa_next.py
python tools/a11y_next.py
python tools/vitals_next.py
python tools/compare_shots.py
```

## O que ficou fora (P4–P6)

- cases como páginas (`/projetos/[slug]`) e artigos em MDX;
- reescrita da réplica do PagFlow em React (segue em `public/pagflow/`);
- divisão do CSS em módulos por componente (o CSS está íntegro em `app/globals.css`);
- workflow de deploy — o build é estático e funciona em Pages, Netlify, Cloudflare ou Vercel.

## Decisões que valem revisão

- **Next em vez de Vite**: ganhamos HTML por rota, `next/font` (WOFF2/subset), metadata/sitemap/OG e RSC; perdemos o `file://` e ~115 KB gz de runtime.
- **GSAP + Lenis em vez de Motion**: coreografia de scroll é o ponto forte do GSAP; o custo (~70 KB gz) entra por import dinâmico e não roda em reduced motion.
- **CSS global em vez de CSS Modules**: preservou o pixel; a modularização fica como refatoração incremental, com o diff visual como rede de segurança.

## Atualização — React Bits + estrela cadente (15/11/2026)

- **Magnet** (React Bits) nos 6 CTAs, com mola e `maxOffset` de 7 px; o link continua focável e o componente ignora toque e reduced motion.
- **StarBorder** (React Bits) no CTA do header com `hover="reveal"`: o contorno fica limpo em repouso e a estrela percorre a borda no hover/foco.
- **Estrela cadente** no canvas do céu: primeira passagem em 8–13 s, seguintes em 34–76 s, 18% de chance de uma segunda logo atrás; nenhuma em reduced motion. O céu segue a 25 fps e só a cadente sobe para 60 fps durante o voo.
- Verificação: `typecheck` + `oxlint` limpos, build estático, QA 30/30, axe sem violação, sem erro de console, sem overflow em 1440/834/390/360, magnet e StarBorder medidos no DOM (7 px / 664 px de contorno aceso).
- Prévia: `docs/react/preview-cadente-1440.png`.

## Atualização — mobile, aviso do PagFlow e deploy (15/11/2026)

### Mobile

- **Área segura.** `viewport-fit=cover` + `env(safe-area-inset-*)`; `--header-h`
  passou a somar o recorte superior, então header, menu e `scroll-margin` das
  âncoras acompanham juntos. Container e rodapé respeitam notch e barra de
  gestos.
- **Alvos de toque.** Filtro e CTA do cartão com 44 px (48 px em ≤680 px), links
  do rodapé em linha inteira e o link “Perfil no LinkedIn” com padding inline
  (área maior, mesma linha de texto).
- **Menu mobile.** Trava de rolagem que funciona no iOS (body fixo com
  `top: -scrollY` e restauração exata). O painel já rolava sozinho; agora fecha
  também ao girar para paisagem.
- **Legibilidade.** Rótulos mono de 8,5–9,5 px sobem para 10–10,5 px e as tags
  para 11 px em ≤480 px.
- **Paisagem.** Em telas de até 480 px de altura, `.hero h1` encolhe (a regra
  base `.hero h1` tinha especificidade maior que as media queries de
  `.hero__title` — corrigido no override novo).

### Aviso do PagFlow

A réplica é uma janela 1280 × 960; a 390 px ela cai para 27% (medido:
`matrix(0.273438, …)`). Em vez de responsivizar a réplica, o site avisa:

- nota no cartão em destaque até 900 px;
- `<dialog>` nativo ao tocar em “Abrir o app interativo” no celular (foco preso,
  `Esc`, clique no backdrop, foco devolvido ao CTA). No desktop o link continua
  abrindo direto em nova aba;
- aviso destacado no topo da própria réplica (`web/public/pagflow/index.html`) em telas de
  até 900 px, e cabeçalho da réplica reorganizado em duas linhas no celular.

### Deploy

- **GitHub Pages (prévia).** `.github/workflows/pages.yml` + `npm run build:pages`
  (`scripts/build-pages.mjs`): deriva `basePath` (`/portifolio`) e URL do
  repositório, marca o build como prévia (`noindex`, sem canonical, sitemap
  vazio) e gera `out/.nojekyll`.
- **Vercel (produção).** Root Directory `web`; `web/vercel.json` com
  `trailingSlash`, headers de segurança e cache. URL canônica vem de
  `NEXT_PUBLIC_SITE_URL` ou, na Vercel, de `VERCEL_PROJECT_PRODUCTION_URL`
  (produção) / `VERCEL_URL` (preview, que sai `noindex`).
- **`og.png`.** A convenção `opengraph-image` gerava `/opengraph-image` sem
  extensão — servido como `application/octet-stream`, o que quebra a prévia em
  WhatsApp/LinkedIn. Virou route handler em `app/og.png/`, com content-type
  correto em qualquer host.

### Verificação

- `typecheck` e `oxlint` limpos; build normal e build de Pages.
- QA 45/45 (inclui o diálogo de mobile e o estado de desktop).
- axe-core: 0 violações na home (1440 e 390), no PagFlow e no diálogo aberto.
- `tools/mobile_audit.py`: sem rolagem horizontal em 360/390/430/768/844 × 390;
  nenhum alvo abaixo de 44 px nos viewports testados.
- Build de Pages servido em `/portifolio/` com CSS, fontes, imagens, manifesto,
  `og.png`, 404 e `/pagflow/` respondendo sob o `basePath`; console limpo.
- Altura da home: desktop idêntica (5832 px); mobile +90 px (nota e CTA maiores).



## Atualização — animações de entrada restauradas (18/11/2026)

Depois dos ajustes mobile e da constelação do morcego, as entradas baseadas em
revelação pararam de animar. Duas causas independentes:

1. **Hero fora do reveal.** A correção de mobile removeu `data-reveal` dos cinco
   nós do hero e passou a revelar só o que está abaixo da dobra. Resultado: a
   primeira tela (eyebrow, lead, CTAs, metadados e retrato) aparecia pronta.
2. **React sobrescrevia o estado da revelação.** `ProjectCard` controlava
   `is-visible` pelo `className`; ao re-renderizar, apagava o `is-pending`
   colocado pelo RevealRoot. Sem o par `is-pending → is-pending.is-visible` não
   havia transição: o cartão surgia de uma vez (e o filtro nunca animava).

Correção:

- `[data-reveal]` voltou a ter transição na base e ganhou `@starting-style`:
  a entrada da primeira tela é 100% CSS e acontece antes da hidratação — o
  HTML continua visível, sem o problema de página em branco em rede lenta.
- `RevealRoot` voltou a esconder (`.is-pending`) só o que está fora da dobra,
  revela por IntersectionObserver, cobre conteúdo novo por MutationObserver e
  responde a `reveal:refresh` (disparado pelo filtro) para trazer ao palco o que
  passou a estar na tela durante a View Transition.
- `ProjectCard` não mexe mais em `is-visible`; a classe é escrita no DOM.
- Hero voltou ao reveal (com os atrasos 2/3/4 originais).

Verificação: hero 0 → 0,89 → 1; Sobre 0 → 0,42 → 0,83 → 1; cartões 0 → 0,66 → 1
com escalonamento; cartão que entra pelo filtro 0 → 0,67 → 0,98 → 1; `hero-line`
0,95 s; órbitas, flutuação do ícone e pulso do selo intactos; sem JS, 17/17
blocos visíveis; reduced motion instantâneo; CLS 0; QA 49/49 e axe sem
violações. `tools/qa_next.py` ganhou a checagem "animações" para travar essa
regressão.
