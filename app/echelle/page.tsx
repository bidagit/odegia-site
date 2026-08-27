import type { Metadata } from "next";
import Link from "next/link";
import { Levels } from "@/components/sections/Levels";
import { Distinction } from "@/components/sections/Distinction";
import { Faq } from "@/components/sections/Faq";
import { FAQ, SITE } from "@/lib/content";

/* Page dediee, creee le 27/08/2026 apres un retour repete de visiteurs, le site
   etait juge trop complexe. Le diagnostic tenait en un chiffre, le mot niveau
   apparaissait trente-deux fois sur la page d accueil.

   L echelle et la distinction automatiser-autonomiser sont justes, mais ce sont
   des outils de vendeur. Un dirigeant ne cherche pas son niveau de maturite, il
   veut recuperer ses soirees. Elles vivent donc ici, a un clic, pour ceux qui
   veulent comprendre le cadre avant d acheter. */

const TITLE = "L'échelle d'autonomie";
const DESCRIPTION =
  "Six niveaux d'autonomie administrative, de la tâche entièrement manuelle à l'entreprise qui tourne sans vous. Comment nous mesurons où vous en êtes et jusqu'où aller.";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.filter((f) => f.cadre).map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/echelle" },
  openGraph: {
    type: "website",
    siteName: "Odegia",
    title: `${TITLE} | Odegia`,
    description: DESCRIPTION,
    locale: "fr_FR",
  },
};

export default function Page() {
  return (
    <div className="border-t border-ink/10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      {/* Section pleine largeur, le fond devant couvrir toute la page et non la
          seule colonne de texte. Le bloc centre reste a l interieur. */}
      <section className="bg-vert-soft pb-16 pt-14 md:pb-20">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
          Le cadre
        </span>
        <h1 className="display mt-3 text-[34px] leading-[1.08] tracking-[-0.03em] md:text-[44px]">
          Jusqu&apos;où peut aller
          <br />
          <span className="text-vert">votre administratif ?</span>
        </h1>
        <p className="mt-4 max-w-xl text-[14.5px] leading-[1.7] text-ink-soft">
          Cette page explique comment nous mesurons l&apos;autonomie et pourquoi
          nous vendons une progression plutôt qu&apos;un outil. Elle est utile
          pour choisir jusqu&apos;où aller. Elle n&apos;est pas nécessaire pour
          commencer.
        </p>
      </div>
      </section>

      <Distinction />
      <Levels />
      <Faq cadre />

      <section className="bg-vert-soft py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <h2 className="display text-[26px] leading-[1.12] tracking-[-0.02em] md:text-[32px]">
            Le niveau se décide au diagnostic.
          </h2>
          <p className="mt-4 text-[14.5px] leading-[1.7] text-ink-soft">
            Vous n&apos;avez pas à choisir votre niveau à l&apos;avance. Chaque
            tâche reçoit celui qui lui convient, selon ce que coûterait une
            erreur non détectée, et le rapport vous le dit noir sur blanc.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={SITE.booking}
              target="_blank"
              rel="noopener noreferrer"
              className="bouton-relief ombre-dure-sm inline-block rounded-full border-2 border-ink bg-banane px-6 py-3.5 text-[14px] font-semibold text-ink"
            >
              Réserver 15 minutes
            </a>
            <Link
              href="/estimation"
              className="inline-block rounded-full border border-ink/15 px-6 py-3.5 text-[14px] font-medium transition-colors hover:border-vert hover:text-vert"
            >
              Estimer mon coût
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
