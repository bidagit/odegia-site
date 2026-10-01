import type { MetadataRoute } from "next";

/* Plan du site, ajoute le 01/10/2026 avec la premiere etude de cas. Le site
   n en avait aucun, ce qui laissait les moteurs decouvrir les pages au hasard
   des liens. */
const BASE = "https://odegia.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { chemin: string; priorite: number }[] = [
    { chemin: "", priorite: 1 },
    { chemin: "/estimation", priorite: 0.9 },
    { chemin: "/cas/chamil-france", priorite: 0.8 },
    { chemin: "/echelle", priorite: 0.7 },
    { chemin: "/mentions-legales", priorite: 0.2 },
    { chemin: "/confidentialite", priorite: 0.2 },
    { chemin: "/cgv", priorite: 0.2 },
  ];
  return pages.map((p) => ({
    url: `${BASE}${p.chemin}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: p.priorite,
  }));
}
