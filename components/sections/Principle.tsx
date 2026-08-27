import { STEPS } from "@/lib/content";

/* La methode, presentee comme une sequence et non comme une grille.
   Elle etait rendue en 2x2, ce qui donne quatre cases de meme rang alors que
   les etapes s enchainent, chacune s appuyant sur ce que la precedente a
   produit. Le rail numerote avec tiret de liaison rend l ordre visible, et la
   numerotation porte ici une contrainte reelle.

   Les chiffres romains distinguent la methode, qui decrit le travail, de la
   sequence commerciale des tarifs, numerotee en arabe, qui decrit ce qu on
   achete. Deux sequences differentes, deux systemes de numerotation. */
export function Principle() {
  return (
    <section
      id="principe"
      className="scroll-mt-20 border-t border-ink/10 py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl" data-reveal>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            La méthode
          </span>
          <h2 className="display mt-3 text-[34px] leading-[1.08] tracking-[-0.03em] md:text-[44px]">
            De la mesure
            <br />
            <span className="text-vert">à la gouvernance.</span>
          </h2>
          <p className="mt-5 max-w-xl text-[14.5px] leading-[1.75] text-ink-soft">
            Voici comment se déroule un accompagnement. Chaque étape s&apos;appuie
            sur ce que la précédente a produit, et vous pouvez vous arrêter après
            chacune d&apos;elles.
          </p>
        </div>

        <ol
          id="methode"
          className="mt-12 grid scroll-mt-20 grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {STEPS.map((s, i) => {
            const dernier = i === STEPS.length - 1;
            return (
              <li
                key={s.numeral}
                data-reveal
                className="flex flex-col"
              >
                {/* Rail hors de la carte, le tiret court d une etape a la
                    suivante et s arrete apres la derniere. */}
                <div className="mb-4 flex items-center gap-3">
                  {/* Progression par paliers et non par degrade, le kit de
                      marque excluant les fondus. La teinte s intensifie de la
                      mesure vers la gouvernance, et l encre reste le texte sur
                      les trois premieres, le blanc sur la derniere ou le vert
                      plein l impose. */}
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink font-mono text-[12px] font-semibold ${
                      ["bg-vert-soft text-ink", "bg-banane text-ink", "bg-vert-vif text-ink", "bg-vert text-white"][i]
                    }`}
                  >
                    {s.numeral}
                  </span>
                  {!dernier && (
                    <span
                      aria-hidden
                      className="relative hidden h-0 flex-1 lg:block"
                    >
                      {/* Le pointille dit le chemin restant. */}
                      <span className="absolute inset-x-0 top-0 border-t-2 border-dashed border-ink/25" />
                      {/* Le trait plein dit le chemin parcouru, il se dessine
                          de gauche a droite au defilement. */}
                      <span className="rail-parcouru absolute inset-x-0 top-0 border-t-2 border-vert" />
                    </span>
                  )}
                </div>

                <div className="ombre-dure-sm flex flex-1 flex-col rounded-[22px] border-2 border-ink bg-surface p-6">
                  <h3 className="text-[16.5px] font-semibold tracking-[-0.01em]">
                    {s.title}
                  </h3>
                  <p className="mt-2.5 text-[13px] leading-[1.65] text-ink-soft">
                    {s.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
