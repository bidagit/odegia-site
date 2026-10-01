import type { MetadataRoute } from "next";

/* Tout est ouvert sauf l API, ajoute le 01/10/2026 avec le plan du site. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }],
    sitemap: "https://odegia.com/sitemap.xml",
  };
}
