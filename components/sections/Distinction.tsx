import { Objet3D } from "@/components/deco/Objet3D";

/* Cette section vivait au-dessus de l echelle, dans « Le principe ». Elle y
   arrivait trop tot, le visiteur n avait pas encore de niveaux en tete et la
   distinction restait abstraite.

   Placee juste apres l echelle, elle devient concrete, la frontiere tombe
   exactement entre le niveau 3 et le niveau 4. On peut donc la montrer au lieu
   de l expliquer, ce qui est l interet du deplacement. */
export function Distinction() {
  return (
    <section className="border-t border-ink/10 py-20 md:py-28">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Objet3D
          nom="avion"
          className="absolute right-4 -top-6 hidden h-[100px] w-auto rotate-6 lg:block xl:right-12"
        />
        <div className="max-w-2xl">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            La frontière
          </span>
          <h2 className="display mt-3 text-[34px] leading-[1.08] tracking-[-0.03em] md:text-[44px]">
            Automatiser n&apos;est pas
            <br />
            <span className="text-vert">rendre autonome.</span>
          </h2>
          <p className="mt-5 text-[14.5px] leading-[1.75] text-ink-soft">
            Vous venez de voir six niveaux. La bascule ne se joue pas entre le
            premier et le dernier, elle se joue à un endroit précis, entre le
            niveau 3 et le niveau 4.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch lg:gap-6">
          <div className="ombre-dure-sm rounded-[22px] border-2 border-ink bg-surface p-7">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
              Niveaux 1 à 3
            </span>
            <h3 className="display mt-2 text-[24px]">Automatiser</h3>
            <p className="mt-4 text-[14px] leading-[1.7] text-ink-soft">
              Exécuter plus vite une décision déjà prise par une personne. La
              tâche part seule, mais c&apos;est vous qui avez tranché en amont,
              ou qui validez avant envoi.
            </p>
            <p className="mt-4 text-[13.5px] leading-[1.65] text-ink-soft">
              Votre facture d&apos;outillage baisse. Votre agenda ne bouge
              presque pas.
            </p>
          </div>

          {/* La bascule, marquee physiquement entre les deux cartes. */}
          <div
            aria-hidden
            className="flex items-center justify-center lg:w-16 lg:flex-col"
          >
            <span className="hidden h-full w-px border-l-2 border-dashed border-ink/25 lg:block" />
            <span className="my-0 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-banane font-mono text-[11px] font-semibold text-ink lg:-my-5">
              3→4
            </span>
            <span className="hidden h-full w-px border-l-2 border-dashed border-ink/25 lg:block" />
          </div>

          <div className="ombre-dure rounded-[22px] border-2 border-ink bg-charbon p-7 text-paper">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-vert-vif">
              Niveaux 4 et 5
            </span>
            <h3 className="display mt-2 text-[24px]">Rendre autonome</h3>
            <p className="mt-4 text-[14px] leading-[1.7] text-paper/75">
              Confier la décision elle-même au système, sur un périmètre défini,
              avec des limites écrites et des garde-fous. Vous n&apos;intervenez
              plus que sur exception.
            </p>
            <p className="mt-4 text-[13.5px] leading-[1.65] text-paper/75">
              La différence ne se lit pas sur votre facture d&apos;outillage.
              Elle se lit sur votre agenda.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
