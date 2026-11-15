import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/+$/, "") ?? "";

/* Aviso útil no build: sem URL explícita (e fora da Vercel), canonical,
   sitemap e Open Graph sairiam apontando para localhost. */
if (
  process.env.NODE_ENV === "production" &&
  !process.env.NEXT_PUBLIC_SITE_URL &&
  !process.env.VERCEL
) {
  console.warn(
    "[gutoexplorer] NEXT_PUBLIC_SITE_URL não definido: canonical, sitemap e og:image usarão http://localhost:3000.",
  );
}

/**
 * Export estático: o build gera HTML por rota em `out/`.
 * Funciona em GitHub Pages, Netlify, Cloudflare Pages e Vercel sem servidor Node.
 * `trailingSlash` garante `rota/index.html`, que qualquer host estático resolve.
 * Para publicar em subpasta (Pages de projeto), defina NEXT_PUBLIC_BASE_PATH.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
