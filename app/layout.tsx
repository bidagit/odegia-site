import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Outfit } from "next/font/google";
import "./globals.css";

import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { SITE } from "@/lib/content";
/* Typo d affichage, ronde et lourde. Elle porte le ton, Geist reste sur le
   corps de texte pour la lisibilite des pages longues. */
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});


const TITLE = "Odegia — Votre entreprise tourne sans vous";
const DESCRIPTION =
  "Odegia confie un domaine entier de votre entreprise à un système qui décide et agit seul. L'IA exécute, vous gouvernez. Deux formules, fondateurs et PME.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: TITLE, template: "%s | Odegia" },
  description: DESCRIPTION,
  applicationName: SITE.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: TITLE,
    description: DESCRIPTION,
    url: SITE.url,
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${GeistSans.variable} ${GeistMono.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased">
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
