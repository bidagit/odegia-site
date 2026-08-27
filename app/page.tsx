import { Hero } from "@/components/sections/Hero";
import { Briques } from "@/components/sections/Briques";
import { Principle } from "@/components/sections/Principle";
import { Cadre } from "@/components/sections/Cadre";
import { Pricing } from "@/components/sections/Pricing";
import { Faq } from "@/components/sections/Faq";
import { FAQ } from "@/lib/content";

/* Ordre revu le 27/08/2026, apres un retour repete de visiteurs jugeant le site
   trop complexe. La mesure donnait raison au reproche, quatre des sept sections
   etaient de l appareil conceptuel, le mot niveau revenait trente-deux fois et
   le mot brique trente-et-une, pour mille neuf cent quatre-vingts mots.

   Le principe du nouvel ordre, ce que vous vivez, puis comment on s y prend,
   puis combien. Les briques passent donc avant la methode, elles sont ecrites
   dans les mots du dirigeant et forment le seul contenu concret de la page.
   L echelle et la distinction partent sur /echelle, a un clic. */

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  /* Seules les questions visibles ici. Les deux autres sont balisees sur
     /echelle, la ou elles s affichent. */
  mainEntity: FAQ.filter((f) => !f.cadre).map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <Hero />
      <Briques />
      <Principle />
      <Cadre />
      <Pricing />
      <Faq />
    </>
  );
}
