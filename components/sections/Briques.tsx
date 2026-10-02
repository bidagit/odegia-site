import { BRIQUES } from "@/lib/content";
import { MENSUALITE } from "@/lib/estimator";
import { Objet3D } from "@/components/deco/Objet3D";
import { ChuteBriques } from "@/components/sections/ChuteBriques";

/* Le catalogue est l'unité de vente autant que l'unité de production. Les
   intitulés sont écrits dans les mots du dirigeant, la colonne technique reste
   secondaire, personne n'achète une « brique de production documentaire ». */
export function Briques() {
  return (
    <section id="briques" className="scroll-mt-20 border-t border-ink/10 py-20 md:py-28">
      <ChuteBriques />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Objet3D nom="paperasse" className="absolute right-4 -top-4 hidden h-[150px] w-auto rotate-3 lg:block xl:right-10" />
        <div className="max-w-2xl" data-reveal>
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
            devient une brique, avec sa mensualité et ce qu&apos;elle vous rend
            chaque mois. Vous commencez par une seule.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BRIQUES.map((b, i) => {
            /* La couleur porte une information, le charbon signale la seule
               brique complexe du catalogue. Les autres alternent sur trois
               teintes claires pour rompre la grille sans hierarchiser, le prix
               affiche sur chaque carte disant seul ce que vaut la brique. */
            const palier = b.palier ?? "intermediaire";
            const complexe = palier === "complexe";
            const teinte = complexe
              ? "bg-charbon text-paper"
              : ["bg-paper", "bg-vert-soft", "bg-banane"][i % 3];
            /* L encre douce tombe a 4,07:1 sur la banane, sous le seuil AA. La
               citation y passe donc en encre pleine, 10,72:1. */
            const surBanane = !complexe && i % 3 === 2;
            /* Une seule mensualite depuis le 02/10/2026, lue dans la grille de
               l estimateur. Le visiteur lit son prix complet sur sa tache. */
            const mensualite = MENSUALITE[palier];
            /* Le <li> ne sert plus qu au placement et porte la rotation de
               .penche. Tout l habillage descend sur l enfant, qui devient la
               carte visible et peut donc tomber en entier. Auparavant seul le
               texte bougeait, la bordure et le fond restant en place.

               Les deux transforms se composent, le parent tourne, l enfant
               translate. */
            return (
              <li key={b.name} className="penche">
                <div
                  data-chute
                  className={`ombre-dure-sm rounded-[20px] border-2 border-ink p-6 ${teinte}`}
                >
                <h3 className="text-[15.5px] font-semibold tracking-[-0.01em]">
                  {b.name}
                </h3>
                <p
                  className={`mt-2 text-[13px] leading-[1.6] ${
                    complexe
                      ? "text-paper/75"
                      : surBanane
                        ? "text-ink"
                        : "text-ink-soft"
                  }`}
                >
                  &laquo;&nbsp;{b.said}&nbsp;&raquo;
                </p>
                {/* Le prix figure sur chaque carte. Sans lui le visiteur
                    suppose un tarif unique et trouve cher ce qui ne l'est pas,
                    reproche fait le 27/08/2026 sur les rendez-vous. */}
                <span
                  className={`mt-4 inline-block rounded-full px-3 py-1 text-[12px] font-semibold ${
                    complexe
                      ? "bg-vert-vif text-charbon"
                      : "border border-ink/20 text-ink"
                  }`}
                >
                  {mensualite}&nbsp;€ par mois
                </span>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Les cartes de criteres sont parties en FAQ le 01/10/2026. Elles
            obligeaient le visiteur a classer sa tache avant de lire un prix,
            alors que chaque carte porte desormais le sien. */}
        <p className="mt-6 max-w-3xl text-[13px] leading-[1.7] text-ink-soft">
          À partir de trois tâches, la remise de parc retire 20&nbsp;% de la
          mensualité. Une tâche absente de cette liste se chiffre au diagnostic.
        </p>
      </div>
    </section>
  );
}
