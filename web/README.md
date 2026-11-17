# gutoexplorer — versão React

Site do **gutoexplorer** em **Next.js 16 (App Router) + React 19 + TypeScript**, com export estático. É a única versão do site: o repositório não mantém mais a implementação antiga em HTML.

## Rodar

```bash
cd web
npm install
npm run dev          # http://localhost:3000
```

Build estático e prévia:

```bash
npm run build        # gera out/ (HTML por rota)
npm run preview      # serve out/ em http://localhost:4173
npm run typecheck    # tsc --noEmit
npm run lint         # oxlint
```

> O site deixou de abrir por duplo clique (`file://`): agora há build, rotas com HTML próprio e hidratação. Para inspecionar, use os servidores acima.

## O que mudou de verdade

- **Conteúdo tipado.** Projetos, contatos, fatos e ferramentas vivem em `content/`, com tipos discriminados. Os contadores do filtro (`05/03/02`) passaram a ser derivados do array — não existe mais número digitado à mão que possa divergir dos cartões.
- **Duas leituras do PagFlow.** O cartão em destaque alterna entre a explicação **gerencial** (padrão, para recrutadores e público não técnico) e a **técnica**, trocando também as tags. A troca usa abas ARIA com setas/Home/End, lembra a escolha em `localStorage` e mantém os dois textos no HTML; os painéis dividem a mesma célula de grid, então a altura do cartão não pula.
- **Componentes com estado no React.** Filtro, menu, céu, ímã, tilt e spotlight são componentes/hooks; o `site.js` global de 295 linhas não existe mais.
- **React Bits no que se move.** O ímã dos CTAs é o **Magnet** oficial (física de mola, `maxOffset`, respeito a toque e reduced motion) e o CTA do header usa **StarBorder** com `hover="reveal"`: em repouso o contorno fica limpo, a estrela só percorre a borda quando o ponteiro chega perto. Os dois foram copiados como código-fonte (variantes TS sem Tailwind), sem dependência nova.
- **Estrela cadente.** O céu ganhou uma passagem rara: um dos ✦ se desgarra, atravessa o céu em ~0,7 s e some. A frequência é controlada em `lib/starfield.ts` (`METEOR_FIRST`, `METEOR_GAP`, `METEOR_PAIR_CHANCE`): a primeira vem depois de 8–13 s, as seguintes esperam 34–76 s, e em 18% das vezes uma segunda passa logo atrás. Com reduced motion, nenhuma passa.
- **Céu em Canvas isolado.** `lib/starfield.ts` é lógica pura (semente fixa, 25 fps, constelação); `SkyCanvas` só liga ao ciclo de vida. Dá para testar e trocar por WebGL sem tocar no resto. O céu continua a 25 fps; só a cadente sobe para 60 fps enquanto atravessa, para o rastro não picotar.
- **Fontes de verdade.** Space Grotesk e JetBrains Mono em WOFF2 com subset latino: **432 KB → 86 KB** no total.
- **SVGO no build.** Marca e ícone do PagFlow caíram de 138 KB para 48 KB.
- **SEO nativo.** `metadata` por rota, `canonical`, Open Graph/Twitter, JSON-LD (`Person` + `WebSite`), `sitemap.xml`, `robots.txt`, `manifest` e imagem social 1200×630 gerada no build (`app/opengraph-image.tsx`).
- **Movimento sob demanda.** Lenis + GSAP/ScrollTrigger entram por `import()` dinâmico e não rodam com `prefers-reduced-motion` nem em telas de toque. O filtro usa a View Transitions API nativa, com fallback instantâneo.
- **Acessibilidade melhor que a anterior.** `aside` deixou de ser landmark aninhado, conteúdo novo do filtro é sempre revelado (inclusive em reduced motion), e o e2e cobre foco/inert/Esc.

### React Bits e a estrela cadente

Os componentes do React Bits entram como **código-fonte** em `components/reactbits/`, sem pacote novo e sem Tailwind:

| Componente | Onde | Ajuste |
| --- | --- | --- |
| `Magnet` | CTAs do header, hero e contato (6 botões) | `maxOffset` 7 px, mola 190/17; o `<a>` continua sendo o elemento focável |
| `StarBorder` | CTA “Vamos conversar” do header | `hover="reveal"`, órbita de 4,2 s, rastro de 28% do contorno, cabeça ✦, ciano `#55ceff` |

A cadente não veio do React Bits — o catálogo não tem um fundo de meteoros. Ela foi desenhada sobre o mesmo canvas do céu para parecer **um dos nossos ✦**: cabeça de quatro pontas, halo curto e rastro afilado de ciano para branco. O agendamento usa o relógio do céu, então pausa junto com a aba e não dispara em `prefers-reduced-motion`. Os dois componentes do React Bits são MIT e mantêm o link para a documentação original no topo de cada arquivo.

Para ver a frequência sem esperar: `Math.random = () => 0.5` no console antes de carregar faz a primeira passar em 10,5 s (e a segunda em 65,5 s, sem par). Para calibrar, ajuste as constantes no topo de `lib/starfield.ts`.

## Estrutura

```
app/
  layout.tsx            fontes (next/font/local), metadata, JSON-LD, céu, header, footer
  page.tsx              home (Server Component compondo as seções)
  globals.css           tokens + CSS do site (portado do original, mesmo desenho)
  og.png/route.tsx      imagem social 1200×630 gerada no build em /og.png
  sitemap.ts · robots.ts · manifest.ts · not-found.tsx · icon.svg
components/
  layout/               Header (+ menu mobile), Footer, ScrollProgress
  sections/             Hero, About, Projects, Contact
  projects/             ProjectsBrowser (filtro), ProjectCard, ProjectArt, PagflowViews (visões), PagflowCta (aviso mobile)
  ui/                   ícones, MagneticLink (compõe o Magnet), PortraitTilt, SectionLabel
  reactbits/            Magnet (React Bits) · StarBorder + CSS (React Bits)
  sky/                  SkyCanvas
  motion/               MotionRoot (Lenis + GSAP), RevealRoot (revelação)
content/                profile.ts · projects.ts  (fonte única; inclui o aviso do PagFlow)
lib/                    starfield, useInView, useReducedMotion, asset (basePath), site (URL/prévia), cn
scripts/build-pages.mjs build da prévia do GitHub Pages (basePath + noindex + .nojekyll)
public/assets/          marca, ícone do PagFlow (SVGO)
public/pagflow/         réplica atual, intacta (fase 5 reescreve em React)
vercel.json             headers, cache e trailingSlash do deploy real
DEPLOY.md               passo a passo de GitHub Pages (prévia) e Vercel (produção)
```

## Mobile

A versão mobile foi revisada para parecer intencional, não um desktop encolhido:

- **Área segura.** `viewport-fit=cover` + `env(safe-area-inset-*)`: o cabeçalho
  fixo cresce com o recorte superior (`--header-h`), o rodapé e o menu respeitam
  a barra de gestos e o container não encosta no notch em paisagem.
- **Alvo de toque.** Filtro (44 px), CTA do cartão (44 px, 48 px em 680 px ou
  menos), links do rodapé em linha inteira e o link “Perfil no LinkedIn”, que
  ganhou área de toque por padding inline (sem mexer na linha do texto).
- **Menu.** A trava de rolagem agora funciona no iOS: o `body` vira fixo com
  `top: -scrollY` e a posição volta exata ao fechar. O painel rola sozinho se
  não couber, fecha com `Esc`, por toque fora e ao girar para paisagem.
- **Legibilidade.** Em até 480 px, os rótulos mono que estavam em 8,5–9,5 px
  sobem para 10–10,5 px e as tags para 11 px — o suficiente para não sumirem no
  fundo escuro, sem mudar o desenho.
- **Paisagem.** Em telas com até 480 px de altura, o título do hero encolhe e o
  conteúdo principal cabe na primeira dobra.
- **Aviso do PagFlow.** A réplica é uma janela de desktop 1280 × 960; a 390 px
  ela cai para ~27%. Além da nota no cartão, tocar em “Abrir o app interativo”
  no celular abre um `<dialog>` nativo (foco preso, `Esc`, backdrop) que explica
  o limite e deixa continuar. No desktop, nada muda: o link abre em nova aba.

Ferramentas: `python tools/mobile_audit.py --sections` mede rolagem horizontal,
alvos < 44 px e salva as seções em 360, 390, 430, 768 e 844 × 390.

## Testes

Com o export servido (`python tools/serve_out.py 4300`, a partir da raiz):

```bash
python tools/qa_next.py        # filtro, contagens, menu, Esc/foco/inert, âncoras, reduced motion, metas
python tools/a11y_next.py      # axe-core (WCAG 2.1 AA + best practices) na home e no PagFlow
python tools/vitals_next.py    # FCP, LCP, CLS, TBT e peso transferido
```

Resultado atual: QA 30/30, axe sem violação grave/crítica, LCP 580 ms (desktop) / 420 ms (mobile) em localhost, CLS ≈ 0, TBT 49 ms / 22 ms.

## Deploy

O build é 100% estático (`out/`). Dois destinos, com papéis diferentes — o passo
a passo completo está em [`DEPLOY.md`](DEPLOY.md):

| Destino | Papel | Comando / configuração |
| --- | --- | --- |
| **GitHub Pages** | prévia para visualização (`noindex`) | `.github/workflows/pages.yml` → `npm run build:pages` |
| **Vercel** | site de verdade (indexável) | importar o repo com **Root Directory = `web`** |

```bash
# prévia do Pages, local: gera out/ com basePath /portifolio e noindex
npm run build:pages
# site de verdade
NEXT_PUBLIC_SITE_URL=https://gutoexplorer.com npm run build
```

O `basePath` sai de `NEXT_PUBLIC_BASE_PATH`; a URL pública (`canonical`, Open
Graph, sitemap) sai de `NEXT_PUBLIC_SITE_URL` e, na Vercel, do próprio projeto —
produção usa o domínio do projeto, preview marca `noindex`. O `og.png` é gerado
no build em `/og.png` (com extensão, para o content-type sair certo em qualquer
host).

O site do PagFlow (`public/pagflow/`) é copiado como está e responde em
`/pagflow/` — com link relativo, funciona tanto na raiz quanto em subpasta.

## Limites conhecidos / próximos passos

- **P4 — cases como páginas.** `app/projetos/[slug]/page.tsx` com `generateStaticParams`, narrativa por projeto e MDX para os artigos. Hoje os projetos são cartões na home.
- **P5 — PagFlow em React.** A réplica continua estática em `public/pagflow/`; reescrever exige separar o tema engine (12 temas) do DOM imperativo. No celular ela é uma janela de desktop reduzida: o site avisa (nota + diálogo) em vez de tentar responsivizar a réplica.
- **CSS em módulos.** O CSS foi portado inteiro para `app/globals.css` (mesmas classes) para garantir paridade pixel a pixel. A divisão em CSS Modules por componente é refatoração segura, mas ainda não feita.
- **Peso de JS.** O runtime do Next/React + GSAP somam ~185 KB gz. Abaixo do que o React entrega não se desce sem trocar de framework; o total transferido (284 KB gz) ainda é menor que o site antigo, porque as fontes encolheram 80%.
- **`file://`.** Não abre mais por duplo clique — decisão validada com build estático em servidor.
- **Domínio.** Sem `NEXT_PUBLIC_SITE_URL` fora da Vercel, canonical e sitemap saem em `localhost`. Na Vercel, o fallback é o domínio do projeto; com domínio próprio, defina a variável.
- **CSP.** O `vercel.json` traz os headers básicos de segurança; uma
  Content-Security-Policy exige liberar os scripts inline do Next (JSON-LD e
  bootstrap) e fica para quando houver domínio fixo.
