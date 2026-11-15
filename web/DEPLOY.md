# Deploy — prévia no GitHub Pages e site de verdade na Vercel

O site é um export estático do Next.js (`output: "export"`): `npm run build` gera
`web/out/` com HTML por rota, `404.html`, `og.png`, `sitemap.xml`, `robots.txt` e
a réplica do PagFlow em `/pagflow/`. Nenhum servidor Node é necessário depois do
build.

Dois destinos, com papéis diferentes:

| Destino | Papel | Indexação | Endereço |
| --- | --- | --- | --- |
| **GitHub Pages** | prévia para visualização | `noindex` | `https://<usuario>.github.io/portifolio/` |
| **Vercel** | site de verdade | indexável | domínio do projeto ou domínio próprio |

---

## Variáveis de build

| Variável | Para quê | Exemplo |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | origem do site (canonical, Open Graph, sitemap). Sem caminho e sem barra final. | `https://gutoexplorer.com` |
| `NEXT_PUBLIC_BASE_PATH` | subpasta em que o site é publicado (Pages de projeto) | `/portifolio` |
| `NEXT_PUBLIC_DEPLOY_TARGET` | `pages` marca o build como prévia: `noindex`, sem canonical, sitemap vazio | `pages` |

- **Vercel:** nenhuma variável é obrigatória. Em produção, o build usa
  `VERCEL_PROJECT_PRODUCTION_URL`; em deployments de preview, usa `VERCEL_URL` e
  marca a página como `noindex` (preview não deve competir no índice).
- **Local:** sem variáveis, a URL vira `http://localhost:3000`.
- O `basePath` entra em `absoluteUrl()` uma única vez: se você colar a URL já com
  a subpasta, ela é removida em vez de duplicada.

---

## GitHub Pages — prévia

1. No GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Faça push em `master` (o workflow roda quando `web/**` muda) ou dispare
   **Actions → Prévia do portfólio no GitHub Pages → Run workflow**.
3. O site aparece em `https://<usuario>.github.io/portifolio/`.

O workflow (`.github/workflows/pages.yml`) roda `npm run build:pages`, que:

- deriva `basePath` (`/portifolio`) e a URL do Pages a partir do repositório;
- define `NEXT_PUBLIC_DEPLOY_TARGET=pages` (prévia, sem indexação);
- gera `out/.nojekyll`, para o Pages não processar a pasta `_next/`;
- publica `web/out` como artefato (o Pages serve os arquivos como estão).

Para conferir o build de Pages localmente:

```bash
cd web
npm run build:pages          # gera out/ com /portifolio como basePath
cd ..
python tools/serve_out.py 4301 --base /portifolio
# abra http://127.0.0.1:4301/portifolio/
```

> O `basePath` é o que faz `/portifolio/_next/...` e `/portifolio/pagflow/...`
> resolverem. Sem ele, a prévia chega sem CSS — é o erro mais comum em Pages de
> projeto.

---

## Vercel — deploy real

1. **Add New Project → Import** o repositório.
2. Em **Root Directory**, escolha **`web`**. Este passo é obrigatório: o
   `package.json` e o `next.config.ts` estão lá, não na raiz.
3. Framework: **Next.js** (detectado). Build Command `next build`, Output
   Directory `out` — já é o padrão do export estático.
4. Deploy. A URL de produção fica `https://<projeto>.vercel.app`.
5. **Domínio próprio** (opcional): **Settings → Domains** → adicione o domínio →
   defina `NEXT_PUBLIC_SITE_URL=https://seudominio.com` em **Environment
   Variables** (Production) e faça redeploy, para canonical, Open Graph e
   sitemap saírem absolutos no domínio certo.

O `web/vercel.json` cuida do que o host não faz sozinho:

- `trailingSlash: true` — `/pagflow` redireciona para `/pagflow/`, igual ao
  export;
- `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` e
  `Permissions-Policy` em todas as respostas;
- cache longo e imutável para `/_next/static/*` e cache curto para as imagens e
  fontes de `public/` (os nomes não têm hash, então não podem ser imutáveis).

Preview deployments da Vercel saem sozinhos com `noindex, nofollow`: o build
detecta `VERCEL_ENV !== production`.

---

## Checklist antes de publicar

```bash
cd web
npm run typecheck
npm run lint
npm run build                # confere avisos do próximo e gera out/

cd ..
python tools/serve_out.py 4300          # preview do export na raiz
python tools/qa_next.py                 # filtro, menu, âncoras, aviso mobile, reduced motion, metas
python tools/a11y_next.py               # axe-core (home, PagFlow e diálogo de mobile)
python tools/mobile_audit.py --sections # 360/390/430/768/paisagem + capturas
```

Conferências manuais rápidas:

- `curl -I https://seudominio.com/og.png` → `content-type: image/png`;
- abrir uma URL inexistente → página 404 do site;
- `/pagflow/` abre a prévia e o aviso de desktop aparece no celular;
- no celular, o cartão do PagFlow mostra a nota e o botão abre o diálogo antes
  de sair do site.

---

## Problemas comuns

| Sintoma | Causa provável | Correção |
| --- | --- | --- |
| Página sem CSS no Pages | build feito sem `NEXT_PUBLIC_BASE_PATH` | use `npm run build:pages` |
| 404 em `/_next/*` no Pages | site publicado a partir de branch, sem `.nojekyll` | use o workflow (artifact) ou mantenha o `out/.nojekyll` |
| Prévia do link sem imagem | `og.png` servido como `application/octet-stream` | o site usa `/og.png` (com extensão); confira o content-type |
| Vercel: "No Next.js version detected" | Root Directory na raiz do repo | defina Root Directory = `web` |
| Canonical apontando para localhost | build sem `NEXT_PUBLIC_SITE_URL` fora da Vercel | defina a variável e refaça o deploy |
| Prévia indexada no Google | build sem `NEXT_PUBLIC_DEPLOY_TARGET=pages` | rode `npm run build:pages` |
