"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { TRACKS, SITE } from "@/lib/content";
import { Objet3D } from "@/components/deco/Objet3D";

/* Deux pistes tarifaires exposées via un sélecteur, plutôt que deux pages.
   Le visiteur doit voir qu'il existe une entrée à son échelle avant de partir,
   c'est tout l'intérêt de la piste Fondateurs.

   Les trois offres d'une piste ne sont PAS des formules concurrentes. C'est une
   progression, on mesure, on construit, on gouverne, et l'etape 2 ne s'achete
   pas sans l'etape 1. La convention du tableau de prix, carte du milieu en
   sombre marquee « le plus demande », disait exactement l'inverse et laissait
   croire a un choix.

   D'ou le rail numerote au-dessus des cartes, avec un tiret de liaison qui
   court d'une etape a la suivante. La numerotation est ici une information
   reelle, l'ordre est contraignant. L'emphase sombre passe sur l'etape 1, la
   seule qu'un visiteur puisse acheter aujourd'hui. */
export function Pricing() {
  const [active, setActive] = useState<"fondateurs" | "organisations">("fondateurs");
  const track = TRACKS.find((t) => t.id === active) ?? TRACKS[0];

  return (
    <section id="tarifs" className="scroll-mt-20 bg-paper-alt/45 py-20 md:py-28">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        {/* L enveloppe porte l animation, Objet3D ne transmettant pas les
            attributs arbitraires. La rotation initiale sort de la classe pour
            vivre dans les keyframes, sinon les deux se cumuleraient. */}
        <span
          data-envol
          aria-hidden
          className="absolute right-2 -top-6 hidden lg:block xl:right-8"
        >
          <Objet3D nom="avion" className="h-[110px] w-auto" />
        </span>
        <div className="max-w-2xl" data-reveal>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            Tarifs
          </span>
          <h2 className="display mt-3 text-[34px] md:text-[44px] leading-[1.08] tracking-[-0.03em] ">
            Deux façons d&apos;y venir.
          </h2>
          <p className="mt-4 text-[14.5px] leading-[1.7] text-ink-soft">
            Le prix suit le temps d&apos;équipe consommé, pas la taille de votre
            entreprise. Un fondateur seul n&apos;a pas besoin du même dispositif
            qu&apos;une PME de quarante personnes.
          </p>
        </div>

        {/* sélecteur de piste */}
        <div
          role="tablist"
          aria-label="Choisir une grille tarifaire"
          className="mt-10 inline-flex rounded-full border-2 border-ink bg-surface p-1"
        >
          {TRACKS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={active === t.id}
              onClick={() => setActive(t.id)}
              className={`rounded-full px-5 py-2.5 text-[13.5px] font-medium transition-colors ${
                active === t.id
                  ? "bg-charbon text-banane"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <p className="mt-5 max-w-2xl text-[13.5px] leading-[1.7] text-ink-soft">
          <span className="font-medium text-ink">{track.audience}.</span>{" "}
          {track.intro}
        </p>

        {/* La sequence dite en toutes lettres, avant meme les cartes. */}
        <p className="mt-4 max-w-2xl text-[13.5px] leading-[1.7] text-ink">
          Les trois étapes ci-dessous s&apos;enchaînent. Le diagnostic ouvre la
          marche, et son montant est déduit du chantier qui le suit.
        </p>

        {/* offres */}
        <ol
          className={`mt-10 grid grid-cols-1 gap-x-5 gap-y-8 ${
            track.offers.length > 3
              ? "md:grid-cols-2 xl:grid-cols-4"
              : "md:grid-cols-3"
          }`}
        >
          {track.offers.map((o, i) => {
            /* L'etape 1 porte l'emphase, c'est la seule achetable en l'etat. */
            const entree = i === 0;
            const dernier = i === track.offers.length - 1;

            return (
              <li
                key={o.name}
                data-reveal
                className="flex flex-col"
              >
                {/* rail d'etape, hors de la carte pour ne pas subir sa rotation */}
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink text-[13px] font-semibold tabular-nums ${
                      entree ? "bg-charbon text-banane" : "bg-surface text-ink"
                    }`}
                  >
                    {o.index}
                  </span>
                  {o.badge && (
                    <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                      {o.badge}
                    </span>
                  )}
                  {/* le tiret de liaison, il ne court pas apres la derniere etape */}
                  {!dernier && (
                    <span
                      aria-hidden
                      className="hidden h-px flex-1 border-t-2 border-dashed border-ink/25 md:block"
                    />
                  )}
                </div>

                <article
                  className={`${["penche-a", "penche-b", "penche-c"][i % 3]} flex flex-1 flex-col rounded-[22px] border-2 border-ink p-6 ${
                    entree
                      ? "ombre-dure bg-charbon text-paper"
                      : "ombre-dure-sm bg-surface"
                  }`}
                >
                  <div>
                    <h3 className="text-[19px] font-semibold tracking-[-0.02em]">
                      {o.name}
                    </h3>
                    <p
                      className={`mt-0.5 text-[12.5px] ${
                        entree ? "text-paper/65" : "text-ink-soft"
                      }`}
                    >
                      {o.duration}
                    </p>
                  </div>

                  <p
                    className={`mt-4 text-[13px] leading-[1.65] ${
                      entree ? "text-paper/80" : "text-ink-soft"
                    }`}
                  >
                    {o.tagline}
                  </p>

                  <ul className="mt-5 flex-1 space-y-2.5">
                    {o.deliverables.map((d) => (
                      <li key={d.text} className="flex gap-2.5">
                        <Check
                          className={`mt-0.5 h-4 w-4 shrink-0 ${
                            entree ? "text-banane" : "text-vert"
                          }`}
                          aria-hidden
                        />
                        <span
                          className={`text-[13px] leading-[1.55] ${
                            d.strong
                              ? "font-medium"
                              : entree
                                ? "text-paper/75"
                                : "text-ink-soft"
                          }`}
                        >
                          {d.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div
                    className={`mt-6 border-t pt-5 ${
                      entree ? "border-paper/20" : "border-ink/10"
                    }`}
                  >
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[24px] font-semibold tracking-[-0.02em] tabular-nums">
                        {o.price}
                      </span>
                      {o.priceSuffix && (
                        <span
                          className={`text-[13px] ${
                            entree ? "text-paper/65" : "text-ink-soft"
                          }`}
                        >
                          {o.priceSuffix}
                        </span>
                      )}
                    </div>
                    <p
                      className={`mt-1 text-[12px] ${
                        entree ? "text-paper/60" : "text-ink-soft"
                      }`}
                    >
                      {o.priceNote}
                    </p>

                    <a
                      href={o.ctaHref ?? SITE.booking}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-5 block rounded-full px-5 py-3 text-center text-[13.5px] font-medium transition-colors ${
                        entree
                          ? "bouton-relief border-2 border-ink bg-banane text-ink"
                          : "border-2 border-ink hover:bg-ink hover:text-paper"
                      }`}
                    >
                      {o.cta}
                    </a>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>

      </div>
    </section>
  );
}
