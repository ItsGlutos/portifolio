# Plano — do HTML estático para React

> **Status:** plano validado e executado nas fases **P0–P3** em 15/11/2026.
> O site novo está em `web/` (Next.js 16 + React 19, export estático); este documento
> registra o estudo e as decisões. Resultado medido: [`RESULTADO.md`](./RESULTADO.md).
> **Data:** 15/11/2026 · **Base:** commit `41ed129` (`Site do portfólio gutoexplorer`)

---

## 1. O que existe hoje (medido, não estimado)

| Arquivo | Linhas | Tamanho | Papel |
| --- | ---: | ---: | --- |
| `index.html` | 729 | 40,6 KB | página inteira, conteúdo escrito à mão |
| `assets/css/site.css` | 3.159 | 59,6 KB | 323 blocos de regra, BEM, 5 breakpoints |
| `assets/css/tokens.css` | 177 | 5,5 KB | design tokens + `@font-face` |
| `assets/js/site.js` | 295 | 9,4 KB | menu, scroll spy, reveal, filtro, ímã, tilt, spotlight |
| `assets/js/stars.js` | 386 | 11,7 KB | céu em canvas 2D (semente fixa, 25 fps, constelação) |
| SVGs de marca (4) | — | 122,3 KB | logo, mark, favicon, ícone do PagFlow |
| Fontes TTF (5) | — | 432 KB no pior caso | Space Grotesk 400/500/700, JetBrains Mono 400/700 |
| `pagflow/app.js` | 2.400+ | 117 KB | réplica imperativa do app, 12 temas, canvas |

**Comportamentos que precisam sobreviver à migração** (todos em `site.js`/`stars.js`): barra de progresso, header `is-scrolled`, menu mobile com `inert` + foco + `Esc`, scroll spy com `aria-current`, revelação no scroll, filtro com contagem ao vivo, ímã nos CTAs, tilt/brilho no retrato, spotlight nos cartões, ano automático, céu com constelação que segue o ponteiro, pausa com aba oculta, `prefers-reduced-motion` em tempo real.

Medido no ambiente: Node 24.22, npm 12.2, rede do registry OK. **Não há pnpm** instalado (o corepack resolve se for o caso).

---

## 2. Diagnóstico: onde o estático impõe teto

Não é "React porque sim". São limites concretos que só um build + componentes resolvem:

1. **Conteúdo duplicado sem fonte única.** Os contadores do filtro (`Todos 05`, `Dados 03`, `Automação 02`) são números escritos à mão que precisam ser sincronizados com `data-category` de cada cartão; o e-mail aparece 4×, os links sociais 6×. Um erro de sincronia é invisível.
2. **Sem tipagem.** `data-category="automacao"` divergir de `data-filter="automacao"` não quebra nada até o usuário filtrar.
3. **JS imperativo global.** As IIFEs varrem o DOM no load; não há ciclo de vida, não há teste unitário possível, e cada novo bloco de interação aumenta o risco de colisão.
4. **CSS monolítico.** 3.159 linhas num arquivo, sem fronteira de componente: qualquer ajuste no hero pode afetar o rodapé por cascata.
5. **Fontes pesadas e incompletas.** TTF (432 KB no pior caso) — e o CSS declara `font-weight: 600` (16×) e `650` (1×) **sem arquivo correspondente**, ou seja: hoje o navegador sintetiza o peso ou cai para outro. Woff2 com subset latin resolve tamanho e fidelidade.
6. **SEO manual e incompleto.** Metadados escritos à mão, `og:image` apontando para `docs/preview-desktop.png` (pasta de documentação, que nem deveria ir ao ar), sem `canonical`, `robots.txt`, `sitemap.xml`, JSON-LD, nem imagem social 1200×630.
7. **Zero build.** Sem minificação, sem hash de cache (`immutable`), sem code splitting, sem tree shaking. O navegador baixa e revalida arquivos com nome fixo.
8. **Nenhum teste automatizado.** Há scripts Selenium de captura (`tools/*.py`), mas não há teste de regressão de comportamento, acessibilidade ou orçamento de performance em CI.
9. **A réplica do PagFlow é o maior ativo e o maior risco.** 117 KB de JS acoplado ao DOM, sem fronteira de módulo — não dá para evoluir o app e o site em paralelo com segurança.

---

## 3. Stack recomendada

**Next.js 16.4 (App Router, `output: "export"`) + React 19.3 + TypeScript 7 (strict) + CSS Modules + GSAP/ScrollTrigger + Lenis + MDX.**

Por que Next e não Vite puro:

| Critério | Next SSG (recomendado) | Vite + React Router (prerender) | Vite MPA (sem router) |
| --- | --- | --- | --- |
| HTML estático por rota (SEO/LCP) | ✅ no build | ✅ no prerender | ✅ por entrada manual |
| JS de seções estáticas | ✅ RSC: zero JS | ❌ hidrata tudo | ❌ hidrata tudo |
| Fontes TTF → WOFF2 + subset | ✅ `next/font/local` automático | ⚠️ ferramenta manual | ⚠️ ferramenta manual |
| Metadados, sitemap, robots, OG image | ✅ APIs nativas | ⚠️ plugins | ❌ à mão |
| Artigos/cases em MDX | ✅ `@next/mdx` | ⚠️ plugin | ❌ |
| Abrir com duplo clique (`file://`) | ❌ precisa de servidor | ⚠️ só rotas raiz | ✅ |
| Complexidade | média | baixa | baixa |
| Deploy | Vercel ou Pages (export) | Pages/Netlify | Pages/Netlify |

**Trade-off explícito:** o site deixa de abrir por `file://`. Hoje o README usa isso como conveniência de desenvolvimento, não como requisito de produto — o próprio README recomenda servidor. Se você quiser preservar o duplo clique, a recomendação muda para **Vite MPA** (opção 3), com perda de SEO por rota.

**Evidência de viabilidade:** spike executado neste ambiente com `create-vite` → Vite 8.3.8 + React 19.3.1 + TypeScript 7.0.2, `npm install` em 20 s, `build` em 247 ms, bundle base 69,3 KB gz. O registry responde e o toolchain funciona. Versões candidatas conferidas: `next@16.4.6`, `react@19.3.1`, `gsap@3.15.1`, `lenis@1.3.27`, `three@0.187.0`, `@react-three/fiber@9.8.2`, `vitest@5.1.0`, `@playwright/test@1.65.1`, `@axe-core/playwright@4.14.0`, `size-limit@14.3.0`.

**O que não entra:** Tailwind. O CSS atual é artesanal e afinado (3.159 linhas com decisões ópticas: máscaras de linha, pivô de 68% no ícone, gradientes de halo). Reescrever em utilitários é regressão de fidelidade com ganho zero. A estratégia é **migrar o CSS existente para CSS Modules por componente**, preservando as declarações.

---

## 4. Arquitetura

```
app/
  layout.tsx                 fontes (next/font/local), metadata, JSON-LD, SkyCanvas, Header, Footer
  page.tsx                   home: compõe as seções (Server Components)
  projetos/[slug]/page.tsx   cases como páginas reais (generateStaticParams)
  artigos/[slug]/page.tsx    artigos em MDX, com RSS
  pagflow/page.tsx           réplica como rota React (fase 5)
  sitemap.ts · robots.ts · opengraph-image.tsx · manifest.ts
  not-found.tsx

components/
  layout/    Header, MobileNav, Footer, ScrollProgress, SkipLink
  sections/  Hero, About, Projects, Contact          (server quando possível)
  projects/  ProjectCard, ProjectShowcase, ProjectReading, ProjectFilter
  ui/        Button, Tag, SectionLabel, Reveal, Magnetic, Tilt, Spotlight
  sky/       SkyCanvas.tsx (client) + starfield.ts + constellation.ts

content/
  profile.ts     fatos, e-mail, links sociais (fonte única)
  projects.ts    array tipado — contadores derivados, não digitados
  articles/      .mdx

styles/
  tokens.css     (global, importado no layout)
  base.css       (reset, tipografia, utilidades)
  *.module.css   (um por componente, migrado de site.css)

lib/
  useReducedMotion.ts · usePointer.ts · useInView.ts · motion.ts (GSAP + Lenis)
```

**Regra de ouro:** tudo que é estático continua Server Component (zero JS no cliente). Só desce para `"use client"` o que tem estado, ponteiro ou canvas: `SkyCanvas`, `MobileNav`, `ProjectFilter`, `Magnetic`, `Tilt`, `Spotlight`, `Reveal`.

---

## 5. Modelo de conteúdo (o ganho estrutural)

Hoje o cartão vitrine, o de leitura e o padrão são HTMLs diferentes. Em React viram **um tipo discriminado** e uma lista:

```ts
// content/projects.ts
export type Project =
  | { kind: "showcase"; slug: string; title: string; categories: Category[]; /* ... */ }
  | { kind: "reading";  slug: string; title: string; categories: Category[]; readMinutes: number; url: string }
  | { kind: "standard"; slug: string; title: string; categories: Category[]; art: ArtKey };

export const projects: Project[] = [/* os 5 de hoje */];
export const counts = {
  todos: projects.length,
  dados: projects.filter(p => p.categories.includes("dados")).length,
  automacao: projects.filter(p => p.categories.includes("automacao")).length,
};
```

Consequências diretas: o filtro passa a derivar contagem e `aria-pressed` do mesmo array; é impossível o número 05 divergir dos cartões; o ano do rodapé e o "2026" do retrato vêm de uma constante; os links sociais são um objeto; o `eslint`/`tsc` quebra o build se um slug, categoria ou CTA faltar. E cada projeto pode ganhar página própria (`/projetos/kpi`) sem duplicar markup.

---

## 6. Mapa de migração

### 6.1 HTML → componentes

| Bloco atual | Vira | Observação |
| --- | --- | --- |
| `<header class="site-header">` | `Header` + `MobileNav` | `is-scrolled` via hook, menu com `inert`, `Esc`, retorno de foco |
| `.hero` | `Hero` (server) + `PortraitTilt` (client) | headline em 3 linhas com máscara preservada |
| `#sobre` | `About` + `Facts` + `Pillars` + `Toolbox` | fatos e ferramentas vindos de `profile.ts` |
| `#projetos` | `Projects` + `ProjectFilter` + 3 cartões | filtro com `useTransition` e contagem derivada |
| `#contato` | `Contact` | três CTAs de `profile.ts` |
| `footer` | `Footer` | ano automático |
| `canvas#sky` | `SkyCanvas` | lógica de `stars.js` isolada em módulos puros e testável |

### 6.2 JS → React

| Hoje | Depois |
| --- | --- |
| `window.addEventListener("scroll")` + rAF | `useScrollProgress()` com `useSyncExternalStore` (ou ScrollTrigger) |
| IntersectionObserver de reveal | `<Reveal>` (ou `whileInView`), mesma classe CSS |
| menu mobile manual | `useEffect` + `inert` + focus trap + `Escape` |
| filtro manipulando `card.hidden` | estado no `ProjectFilter`; animação de entrada via `key`/View Transitions |
| ímã/tilt/spotlight escrevendo `style` | componentes com `ref` escrevendo CSS vars — **sem re-render** |
| `matchMedia` listener | `useReducedMotion()` com `useSyncExternalStore` |

Exemplo do hook central (o mesmo que garante paridade com o site atual):

```tsx
export function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const mq = matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false, // SSR: assume movimento, e o CSS desliga
  );
}
```

### 6.3 CSS

Migração **mecânica e verificada**, não reescrita:

1. `tokens.css` vira global (importada no layout) e ganha os tokens que faltam (`--fs-*` fluidos).
2. `site.css` é fatiado por dono: `header.module.css`, `hero.module.css`, `about.module.css`, `projects.module.css`, `contact.module.css`, `footer.module.css`, `ui/*.module.css`.
3. Cada fatia é comparada com a atual por **diff visual automatizado** (Playwright, 1440/1024/834/390, `threshold` de pixel).
4. Seletores globais que sobrarem (`.container`, `.sr-only`, `.skip-link`) ficam em `base.css`.

Isso preserva exatamente o visual aprovado e ainda ganha escopo local — o motivo real de componentizar CSS.

### 6.4 Assets

- Fontes: `next/font/local` gera WOFF2 + subset no build (resolve os 432 KB e o peso 600 fantasma: **adicionar o arquivo 600 ou normalizar para 500/700** — decisão técnica que já fica registrada).
- `pagflow-icon.svg` (64 KB) e os SVGs de marca passam por `svgo` no build.
- Imagens sociais geradas no build (`opengraph-image.tsx`), sem PNG solto em `docs/`.
- `docs/` sai do deploy (hoje o `og:image` aponta para lá).

---

## 7. Camada de movimento (o "ápice" sem virar enfeite)

Princípio: **movimento com função** — orientar leitura, dar peso a gesto, mostrar relação entre dados. E sempre com fallback.

- **Lenis** para scroll suave (desligado em `prefers-reduced-motion` e em toque).
- **GSAP + ScrollTrigger** para coreografia de entrada de seção, pin do trecho do case e scrub das ilustrações SVG (as barras do KPI e o fluxo de automação ganham leitura progressiva).
- **SplitText** (hoje gratuito) na headline, mantendo a máscara de linha atual.
- **View Transitions API** nativa para troca de rota e reordenação do filtro — sem lib, com fallback instantâneo.
- **Céu:** Canvas 2D atual permanece como baseline (comprovado, 25 fps, pausa em aba oculta). Um protótipo WebGL (R3F) roda em A/B **só entra se**: 60 fps em GPU integrada, ≤ 40 KB gz extra e fallback estático. Caso contrário, o 2D fica — o céu é identidade, não vitrine de tecnologia.

**Orçamento de movimento:** GSAP core + ScrollTrigger + SplitText ≈ 40 KB gz, Lenis ≈ 3 KB. Teto combinado de JS inicial (site) **90 KB gz**; o que passar disso entra por rota, sob demanda.

---

## 8. Performance — metas numéricas

| Métrica | Hoje (referência) | Meta |
| --- | --- | --- |
| LCP | não medido | ≤ 1,5 s (4G) / ≤ 0,8 s (desktop) |
| CLS | ~0 (bom) | ≤ 0,02 |
| INP | não medido | ≤ 100 ms |
| JS inicial (site) | ~21 KB sem framework | ≤ 90 KB gz |
| Fontes | 432 KB TTF (pior caso) | ≤ 90 KB WOFF2 subset |
| Lighthouse (4 categorias) | não medido | 100 / 100 / 100 / 100 |
| Peso da home | ~250 KB sem fontes | ≤ 350 KB com fontes |

Alavancas: RSC (seções sem JS), fontes subset, `svgo`, `cache-control: immutable` com hash, `content-visibility` nas seções abaixo da dobra, `srcset`/AVIF se entrar foto, e remoção do PNG de 1,3 MB da raiz do deploy.

**Medição antes de otimizar** (regra do próprio React): o primeiro passo é medir o site atual com Lighthouse e WebPageTest e guardar o baseline.

---

## 9. SEO, social e conteúdo

- `metadata` por rota (title, description, canonical, `og:*`, `twitter:*`).
- `sitemap.ts` e `robots.ts` gerados no build.
- JSON-LD `Person` + `CreativeWork` para os projetos.
- Imagem OG 1200×630 gerada no build a partir dos tokens (nunca desatualiza).
- Artigos do Medium podem virar páginas locais em MDX **com canônica para o Medium** (evita conteúdo duplicado) ou continuar apenas como link — decisão sua.
- RSS opcional.

---

## 10. Acessibilidade (não regride; melhora)

O que já existe e será preservado: skip link, foco visível, alvos de 44 px, menu com `inert` e `Esc`, `aria-live` na contagem, `prefers-reduced-motion`.

O que é adicionado: `@axe-core/playwright` no CI (falha em violação séria/crítica), navegação por teclado no filtro (roving tabindex), foco gerenciado na troca de rota, teste com leitor de tela no menu e no filtro, e `prefers-contrast: more` como bônus.

---

## 11. Qualidade e CI

- `tsc --noEmit` + ESLint (React Hooks, jsx-a11y) + Prettier.
- Vitest + Testing Library: filtro, contadores, menu, `useReducedMotion`, gerador do céu (semente determinística → snapshot das posições).
- Playwright: 5 viewports, diff visual contra o site atual, teclado, axe.
- `size-limit` (ou `next build` + relatório) travando o bundle.
- Lighthouse CI com orçamento no PR.
- GitHub Actions: `typecheck → lint → test → build → e2e → lighthouse`. Sem isso, "ápice" não se sustenta.

---

## 12. Fases, esforço e critério de aceite

| Fase | Escopo | Esforço | Aceite |
| --- | --- | --- | --- |
| **P0 Fundação** | repo Next, TS strict, tokens, fontes WOFF2, metadata base, CI | 0,5 dia | `build` + `lint` + `typecheck` verdes |
| **P1 Paridade estática** | Hero→Footer em componentes, CSS fatiado, PagFlow como ilha em `public/` | 1,5–2 dias | diff visual 0 nas 5 larguras; Lighthouse ≥ 95 |
| **P2 Interações** | céu, menu, reveal, filtro, ímã, tilt, spotlight, reduced motion | 1 dia | paridade funcional; axe 0 crítico |
| **P3 Ápice visual** | GSAP/Lenis/View Transitions, OG image, JSON-LD, sitemap | 2–3 dias | coreografia aprovada; 60 fps; orçamento de JS cumprido |
| **P4 Conteúdo e rotas** | cases como páginas, MDX + RSS, `/projetos/[slug]` | 1–2 dias | 5 rotas estáticas indexáveis |
| **P5 PagFlow em React** | tema engine tipado, telas, diálogos, canvas | 3–5 dias | paridade com a réplica; bundle isolado |
| **P6 Endurecimento** | budgets, e2e, docs, deploy | 0,5 dia | CI completo; README reescrito |

Total estimado: **10–15 dias de trabalho**. P0–P3 são o mínimo para você ver o "ápice" rodando.

---

## 13. Riscos e mitigação

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| Regressão visual na migração do CSS | alto | diff automatizado por viewport antes de seguir de fase |
| Hidratação divergente (canvas/aleatório) | médio | nada de `window`/`Math.random` no render; efeito só no cliente |
| GSAP + Lenis pesarem no mobile | médio | carregar por rota, desligar em toque/reduced-motion, medir INP |
| PagFlow quebrar o link durante a migração | médio | `public/pagflow` intocado até P5 |
| Perder `file://` | baixo | decisão explícita na validação; Vite MPA é a alternativa |
| Conteúdo confidencial vazar no MDX | alto | revisão editorial obrigatória, sem números não confirmados (regra do README) |

---

## 14. Decisões que preciso de você

1. **Base do projeto** — Next.js 16 SSG (recomendado; perde o duplo clique em `file://`) ou Vite + React (mantém offline, perde SEO por rota).
2. **Alcance da primeira entrega** — P0–P3 (site completo com movimento) ou ir até P5 (incluir o PagFlow em React).
3. **"Ápice" para você** — prioridade entre: performance/SEO, animação cinematográfica, cases como páginas de leitura, blog/MDX, WebGL no céu.
4. **Deploy** — continua GitHub Pages ou migra para Vercel/Netlify/Cloudflare (Vercel simplifica Next; Pages funciona com export + workflow).

Respondidas essas quatro, começo por P0/P1 com você validando o resultado de cada fase antes da seguinte.
