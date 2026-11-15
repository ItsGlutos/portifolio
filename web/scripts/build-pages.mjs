/**
 * Build da prévia do GitHub Pages.
 *
 * O site vive em `https://<usuario>.github.io/<repo>/`, então o export precisa
 * de `basePath` — sem isso o HTML pede `/_next/...` na raiz do domínio e a
 * página chega sem CSS. Este script deriva repo, basePath e URL do ambiente do
 * GitHub Actions (ou dos valores padrão do projeto) e roda `next build`.
 *
 * Uso:
 *   npm run build:pages                       # deriva do repositório
 *   PAGES_BASE_PATH=/meu-repo npm run build:pages
 *   PAGES_SITE_URL=https://dominio.com npm run build:pages
 *
 * Ao final cria `out/.nojekyll`: o Pages não deve tentar processar `_next/`.
 */
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/* `GITHUB_REPOSITORY=usuario/repositorio` e `GITHUB_REPOSITORY_OWNER=usuario`
   existem em todo workflow do Actions. Localmente, caem no padrão do projeto. */
const [ownerFromEnv, repoFromEnv] = (process.env.GITHUB_REPOSITORY ?? "").split("/");
const owner = (process.env.GITHUB_REPOSITORY_OWNER || ownerFromEnv || "ItsGlutos").toLowerCase();
const repo = repoFromEnv || "portifolio";

/* Repositório <usuario>.github.io é site de usuário: mora na raiz. */
const isUserSite = repo.toLowerCase().endsWith(".github.io");
const basePath = process.env.PAGES_BASE_PATH ?? (isUserSite ? "" : `/${repo}`);
const siteUrl =
  process.env.PAGES_SITE_URL ?? (isUserSite ? `https://${repo.toLowerCase()}` : `https://${owner}.github.io`);

const cleanBase = basePath.replace(/\/+$/, "");

console.log(`[pages] repo=${owner}/${repo}`);
console.log(`[pages] basePath=${cleanBase || "/"}  site=${siteUrl}`);

const nextBin = join(root, "node_modules", "next", "dist", "bin", "next");

const result = spawnSync(process.execPath, [nextBin, "build"], {
  cwd: root,
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_PUBLIC_BASE_PATH: cleanBase,
    NEXT_PUBLIC_SITE_URL: siteUrl,
    NEXT_PUBLIC_DEPLOY_TARGET: "pages",
  },
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

/* O artefato do Pages é servido como está; o `.nojekyll` evita que o Jekyll
   (quando o site é publicado a partir de um branch) ignore `_next/`. */
writeFileSync(join(root, "out", ".nojekyll"), "");
console.log(`[pages] pronto: ${join(root, "out")} (com .nojekyll)`);
