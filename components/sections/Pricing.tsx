"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { TRACKS, SITE } from "@/lib/content";

/* Deux pistes tarifaires exposées via un sélecteur, plutôt que deux pages.
   Le visiteur doit voir qu'il existe une entrée à son échelle avant de partir,
   c'est tout l'intérêt de la piste Fondateurs. */
export function Pricing() {
  const [active, setActive] = useState<"fondateurs" | "organisations">("fondateurs");
  const track = TRACKS.find((t) => t.id === active) ?? TRACKS[0];

  return (
    <section id="tarifs" className="scroll-mt-20 bg-paper-alt/45 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
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

        {/* offres */}
        <div
          className={`mt-10 grid grid-cols-1 gap-5 ${
            track.offers.length > 3
              ? "md:grid-cols-2 xl:grid-cols-4"
              : "md:grid-cols-3"
          }`}
        >
          {track.offers.map((o) => (
            <article
              key={o.name}
              className={`flex flex-col rounded-[22px] border p-6 ${
                o.highlight
                  ? "ombre-dure border-2 border-ink bg-charbon text-paper"
                  : "ombre-dure-sm border-2 border-ink bg-surface"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[19px] font-semibold tracking-[-0.02em]">
                    {o.name}
                  </h3>
                  <p
                    className={`mt-0.5 text-[12.5px] ${
                      o.highlight ? "text-paper/65" : "text-ink-soft"
                    }`}
                  >
                    {o.duration}
                  </p>
                </div>
                {o.badge && (
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.06em] ${
                      o.highlight
                        ? "bg-banane text-ink"
                        : "bg-paper-alt text-ink-soft"
                    }`}
                  >
                    {o.badge}
                  </span>
                )}
              </div>

              <p
                className={`mt-4 text-[13px] leading-[1.65] ${
                  o.highlight ? "text-paper/80" : "text-ink-soft"
                }`}
              >
                {o.tagline}
              </p>

              <ul className="mt-5 flex-1 space-y-2.5">
                {o.deliverables.map((d) => (
                  <li key={d.text} className="flex gap-2.5">
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        o.highlight ? "text-banane" : "text-vert"
                      }`}
                      aria-hidden
                    />
                    <span
                      className={`text-[13px] leading-[1.55] ${
                        d.strong
                          ? "font-medium"
                          : o.highlight
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
                  o.highlight ? "border-paper/20" : "border-ink/10"
                }`}
              >
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[24px] font-semibold tracking-[-0.02em]">
                    {o.price}
                  </span>
                  {o.priceSuffix && (
                    <span
                      className={`text-[13px] ${
                        o.highlight ? "text-paper/65" : "text-ink-soft"
                      }`}
                    >
                      {o.priceSuffix}
                    </span>
                  )}
                </div>
                <p
                  className={`mt-1 text-[12px] ${
                    o.highlight ? "text-paper/60" : "text-ink-soft"
                  }`}
                >
                  {o.priceNote}
                </p>

                <a
                  href={
                    o.ctaHref ??
                    `mailto:${SITE.email}?subject=${encodeURIComponent(
                      `${o.name} — ${track.label}`
                    )}`
                  }
                  {...(o.ctaHref
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className={`mt-5 block rounded-full px-5 py-3 text-center text-[13.5px] font-medium transition-colors ${
                    o.highlight
                      ? "bouton-relief border-2 border-ink bg-banane text-ink"
                      : "border-2 border-ink hover:bg-ink hover:text-paper"
                  }`}
                >
                  {o.cta}
                </a>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
