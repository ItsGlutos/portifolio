import type { MetadataRoute } from "next";
import { absoluteUrl, isPreview, siteUrl } from "@/lib/site";

export const dynamic = "force-static";

/**
 * Prévia (GitHub Pages, deployment da Vercel) bloqueia tudo: a versão
 * definitiva é a produção, e duas cópias indexadas só atrapalham.
 */
export default function robots(): MetadataRoute.Robots {
  if (isPreview) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteUrl,
  };
}
