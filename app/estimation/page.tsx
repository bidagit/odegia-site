import type { Metadata } from "next";
import { Estimator } from "@/components/estimator/Estimator";

const TITLE = "Combien vous coûte votre administratif";
const DESCRIPTION =
  "Deux minutes pour chiffrer ce que votre administratif vous coûte en heures et en euros, et savoir par quelle tâche commencer. Calcul immédiat, sans engagement.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/estimation" },
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
      <div className="mx-auto max-w-3xl px-5 pt-14 sm:px-8">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
          Estimation gratuite
        </span>
        <h1 className="mt-3 text-[30px] font-semibold leading-[1.08] tracking-[-0.03em] md:text-[40px]">
          Combien vous coûte
          <br />
          <span className="text-vert">votre administratif ?</span>
        </h1>
        <p className="mt-4 max-w-xl text-[14.5px] leading-[1.7] text-ink-soft">
          Neuf questions, deux minutes. Vous obtenez le coût réel de votre
          administratif, ce qui est récupérable, et par quelle tâche commencer.
          Le calcul se fait dans votre navigateur.
        </p>
      </div>
      <Estimator />
    </div>
  );
}
