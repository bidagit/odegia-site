import { Hero } from "@/components/sections/Hero";
import { Principle } from "@/components/sections/Principle";
import { Levels } from "@/components/sections/Levels";
import { Briques } from "@/components/sections/Briques";
import { Pricing } from "@/components/sections/Pricing";
import { Faq } from "@/components/sections/Faq";
import { FAQ } from "@/lib/content";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
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
      <Principle />
      <Levels />
      <Briques />
      <Pricing />
      <Faq />
    </>
  );
}
