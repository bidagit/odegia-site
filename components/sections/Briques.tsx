import { BRIQUES, BRIQUE_TYPES } from "@/lib/content";

/* Le catalogue est l'unité de vente autant que l'unité de production. Les
   intitulés sont écrits dans les mots du dirigeant, la colonne technique reste
   secondaire, personne n'achète une « brique de production documentaire ». */
export function Briques() {
  return (
    <section id="briques" className="scroll-mt-20 border-t border-ink/10 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            Les briques
          </span>
          <h2 className="mt-3 text-[30px] font-semibold leading-[1.08] tracking-[-0.03em] md:text-[40px]">
            On automatise
            <br />
            <span className="text-violet">une tâche à la fois.</span>
          </h2>
          <p className="mt-4 text-[14.5px] leading-[1.7] text-ink-soft">
            Pas de forfait, pas de périmètre flou. Chaque tâche répétitive
            devient une brique, avec son prix, son gain annuel et son retour sur
            investissement. Vous commencez par une seule.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-[22px] border border-ink/12 bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
          {BRIQUES.map((b) => (
            <li key={b.name} className="bg-paper p-6">
              <h3 className="text-[15.5px] font-semibold tracking-[-0.01em]">
                {b.name}
              </h3>
              <p className="mt-2 text-[13px] leading-[1.6] text-ink-soft">
                &laquo;&nbsp;{b.said}&nbsp;&raquo;
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          {BRIQUE_TYPES.map((t) => (
            <div
              key={t.label}
              className="rounded-[22px] border border-ink/12 bg-surface p-6"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-[15.5px] font-semibold">{t.label}</h3>
                <span className="text-[19px] font-semibold tracking-[-0.02em] text-violet">
                  {t.price}
                </span>
              </div>
              <p className="mt-2 text-[13px] leading-[1.65] text-ink-soft">
                {t.criteria}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-5 text-[13px] leading-[1.7] text-ink-soft">
          Trois briques simples prises ensemble, 2 900 EUR HT. Une tâche qui
          n&apos;entre dans aucune ligne du catalogue est soit hors périmètre,
          soit une brique nouvelle, et elle se chiffre alors en complexe.
        </p>
      </div>
    </section>
  );
}
