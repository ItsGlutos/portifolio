import type { MetadataRoute } from "next";
import { absoluteUrl, isPreview } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  /* Prévia não publica sitemap: o robots já bloqueia a indexação. */
  if (isPreview) return [];

  const lastModified = new Date();

  return [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: absoluteUrl("/pagflow/"),
      lastModified,
      changeFrequency: "yearly",
      priority: 0.6,
    },
  ];
}
