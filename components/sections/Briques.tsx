import { BRIQUES, BRIQUE_TYPES } from "@/lib/content";
import { Objet3D } from "@/components/deco/Objet3D";

/* Le catalogue est l'unité de vente autant que l'unité de production. Les
   intitulés sont écrits dans les mots du dirigeant, la colonne technique reste
   secondaire, personne n'achète une « brique de production documentaire ». */
export function Briques() {
  return (
    <section id="briques" className="scroll-mt-20 border-t border-ink/10 py-20 md:py-28">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Objet3D nom="paperasse" className="absolute right-4 -top-4 hidden h-[150px] w-auto rotate-3 lg:block xl:right-10" />
        <div className="max-w-2xl">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            Les briques
          </span>
          <h2 className="display mt-3 text-[34px] md:text-[44px] leading-[1.08] tracking-[-0.03em] ">
            On automatise
            <br />
            <span className="text-vert">une tâche à la fois.</span>
          </h2>
          <p className="mt-4 text-[14.5px] leading-[1.7] text-ink-soft">
            Pas de forfait, pas de périmètre flou. Chaque tâche répétitive
            devient une brique, avec son prix, son gain annuel et son retour sur
            investissement. Vous commencez par une seule.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BRIQUES.map((b, i) => {
            /* La couleur porte une information, le charbon signale la seule
               brique complexe du catalogue. Les simples alternent sur trois
               teintes claires pour rompre la grille sans hierarchiser, aucune
               d elles ne vaut plus qu une autre. */
            const teinte = b.complexe
              ? "bg-charbon text-paper"
              : ["bg-paper", "bg-vert-soft", "bg-banane"][i % 3];
            /* L encre douce tombe a 4,07:1 sur la banane, sous le seuil AA. La
               citation y passe donc en encre pleine, 10,72:1. */
            const surBanane = !b.complexe && i % 3 === 2;
            return (
              <li
                key={b.name}
                className={`penche ombre-dure-sm rounded-[20px] border-2 border-ink p-6 ${teinte}`}
              >
                <h3 className="text-[15.5px] font-semibold tracking-[-0.01em]">
                  {b.name}
                </h3>
                <p
                  className={`mt-2 text-[13px] leading-[1.6] ${
                    b.complexe
                      ? "text-paper/75"
                      : surBanane
                        ? "text-ink"
                        : "text-ink-soft"
                  }`}
                >
                  &laquo;&nbsp;{b.said}&nbsp;&raquo;
                </p>
                {b.complexe && (
                  <span className="mt-4 inline-block rounded-full bg-vert-vif px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-charbon">
                    Brique complexe
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        {/* Les deux cartes de prix passent en vert profond plein. En menthe
            pale elles reprenaient une teinte du catalogue juste au-dessus et se
            lisaient comme deux briques de plus, alors qu elles donnent la cle de
            lecture des neuf autres. Le blanc sur vert profond tient a 5,30:1, et
            le prix en banane est un texte large, donc conforme a 3,55:1. */}
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          {BRIQUE_TYPES.map((t) => (
            <div
              key={t.label}
              className="ombre-dure rounded-[22px] border-2 border-ink bg-vert p-6 text-paper"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-[15.5px] font-semibold">{t.label}</h3>
                <span className="display text-[26px] text-banane">
                  {t.price}
                </span>
              </div>
              <p className="mt-2.5 text-[13px] leading-[1.65] text-paper">
                {t.criteria}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-5 text-[13px] leading-[1.7] text-ink-soft">
          Trois briques simples prises ensemble, 2 900 EUR HT au lieu de 3 600.
          Une tâche absente du catalogue passe par les deux mêmes questions et
          se range dans l&apos;une des deux lignes. Quand les deux réponses
          manquent, données dispersées et sortie qui change à chaque fois, elle
          devient un chantier sur devis, cadré et chiffré au diagnostic.
        </p>
      </div>
    </section>
  );
}
