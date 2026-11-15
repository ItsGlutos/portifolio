import { asset, basePath } from "./asset";

/**
 * Endereço público do site e modo de publicação.
 *
 * Precedência da URL:
 * 1. `NEXT_PUBLIC_SITE_URL` — explícito, vale para qualquer host (domínio
 *    próprio, Cloudflare, Netlify…). Informe a origem, sem caminho: o
 *    `basePath` entra depois em `absoluteUrl()`.
 * 2. Vercel — produção usa o domínio do projeto (`VERCEL_PROJECT_PRODUCTION_URL`);
 *    deployments de preview usam a URL do próprio deployment.
 * 3. `http://localhost:3000` — build local.
 *
 * `isPreview` separa "prévia para olhar" de "site de verdade": em prévia o
 * robots bloqueia a indexação e o `<link rel=canonical>` não é emitido.
 */

const explicit = normalizar(process.env.NEXT_PUBLIC_SITE_URL);

const vercelEnv = process.env.VERCEL_ENV;
const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const vercelDeploy = process.env.VERCEL_URL;

function normalizar(value: string | undefined): string | undefined {
  const raw = value?.trim();
  if (!raw || !/^https?:\/\//.test(raw)) return undefined;

  const clean = raw.replace(/\/+$/, "");
  /* Quem colar a URL já com a subpasta não pode acabar com /portifolio/portifolio. */
  return basePath && clean.endsWith(basePath) ? clean.slice(0, -basePath.length) : clean;
}

function host(value: string | undefined): string | undefined {
  const raw = value?.trim();
  return raw ? `https://${raw.replace(/^https?:\/\//, "").replace(/\/+$/, "")}` : undefined;
}

const vercelSite =
  vercelEnv === "production" ? host(vercelProd) : vercelEnv ? host(vercelDeploy) : undefined;

/** Origem do site, sem caminho e sem barra final. */
export const siteUrl = (explicit ?? vercelSite ?? "http://localhost:3000").replace(/\/+$/, "");

/** `true` quando a URL veio de configuração explícita (ou do domínio da Vercel). */
export const siteUrlConfigured = Boolean(
  explicit ?? (vercelEnv === "production" && host(vercelProd)),
);

/** GitHub Pages é publicação de prévia: visualização, não a vitrine. */
export const isPagesPreview = process.env.NEXT_PUBLIC_DEPLOY_TARGET === "pages";

/** Deployments da Vercel que não são produção também não entram no índice. */
export const isVercelPreview = Boolean(vercelEnv && vercelEnv !== "production");

export const isPreview = isPagesPreview || isVercelPreview;

/**
 * Caminho absoluto do site, já com `basePath`.
 * `absoluteUrl("/")` → `https://dominio/` ou `https://usuario.github.io/portifolio/`.
 */
export function absoluteUrl(path = "/"): string {
  return `${siteUrl}${asset(path)}`;
}
