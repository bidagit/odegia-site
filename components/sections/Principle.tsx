import { STEPS } from "@/lib/content";

/* La methode, presentee comme une sequence et non comme une grille.
   Elle etait rendue en 2x2, ce qui donne quatre cases de meme rang alors que
   les etapes s enchainent, on ne peut pas chiffrer avant d avoir diagnostique
   ni construire avant d avoir chiffre. Le rail numerote avec tiret de liaison
   rend l ordre visible, et la numerotation porte ici une contrainte reelle.

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
        <div className="max-w-2xl">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            La méthode
          </span>
          <h2 className="display mt-3 text-[34px] leading-[1.08] tracking-[-0.03em] md:text-[44px]">
            Quatre étapes,
            <br />
            <span className="text-vert">dans cet ordre.</span>
          </h2>
          <p className="mt-5 max-w-xl text-[14.5px] leading-[1.75] text-ink-soft">
            Chacune s&apos;appuie sur la précédente. La mesure précède le
            chiffrage, et le chiffrage précède la construction.
          </p>
        </div>

        <ol
          id="methode"
          className="mt-12 grid scroll-mt-20 grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {STEPS.map((s, i) => {
            const dernier = i === STEPS.length - 1;
            return (
              <li key={s.numeral} className="flex flex-col">
                {/* Rail hors de la carte, le tiret court d une etape a la
                    suivante et s arrete apres la derniere. */}
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-banane font-mono text-[12px] font-semibold text-ink">
                    {s.numeral}
                  </span>
                  {!dernier && (
                    <span
                      aria-hidden
                      className="hidden h-px flex-1 border-t-2 border-dashed border-ink/25 lg:block"
                    />
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
