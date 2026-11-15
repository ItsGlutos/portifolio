import type { MetadataRoute } from "next";
import { brand } from "@/content/profile";
import { asset } from "@/lib/asset";

export const dynamic = "force-static";

/**
 * `start_url`, `scope` e ícones precisam do `basePath`: no GitHub Pages o site
 * vive em /portifolio/ e um caminho absoluto na raiz sairia fora do app.
 */
export default function manifest(): MetadataRoute.Manifest {
  const scope = asset("/");

  return {
    name: "gutoexplorer — Portfólio de Gustavo Pinheiro",
    short_name: "gutoexplorer",
    description: `${brand.role} — análise de dados, processos e automação.`,
    start_url: scope,
    scope,
    display: "standalone",
    background_color: "#091522",
    theme_color: "#091522",
    lang: "pt-BR",
    icons: [
      {
        src: asset("/assets/brand/guto-logo.svg"),
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
