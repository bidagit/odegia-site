import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroMedia } from "./HeroMedia";
import { Eclat, Onde } from "@/components/deco/Formes";
import { HERO, SITE } from "@/lib/content";

/* Hero sur fond charbon, titre d affichage tres lourd, annotations autour du
   media, et vague de sortie vers la section claire. La profondeur vient des
   ombres franches, jamais d un flou.

   Ordre des blocs. Sur mobile l ordre du DOM s applique, accroche puis media
   puis argumentaire, ce qui remonte la video juste sous le titre au lieu de la
   renvoyer sous les boutons. En deux colonnes, le placement explicite remet le
   media a droite sur les deux rangees. */
export function Hero() {
  return (
    <section className="relative bg-charbon text-paper">
      <div className="relative mx-auto max-w-7xl px-5 pb-4 pt-12 sm:px-8 md:pb-8 md:pt-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-x-14 lg:gap-y-0">
          {/* ── accroche ── */}
          <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-paper/20 px-3.5 py-1.5 text-[12px] font-medium text-paper/70">
              <span aria-hidden className="h-2 w-2 rounded-full bg-rose-vif" />
              {HERO.eyebrow}
            </span>

            <div className="relative">
              <Eclat
                aria-hidden
                className="pointer-events-none absolute -left-8 -top-4 hidden h-10 w-10 text-banane lg:block"
              />
            </div>

            <h1 className="display mt-7 text-[46px] sm:text-[58px] lg:text-[66px] xl:text-[76px]">
              {HERO.title[0]}
              <br />
              {/* Bande rose posee de travers, l adhesif du debardeur d ou vient
                  la palette. Seul endroit ou le rose occupe autant de surface. */}
              <span className="mt-2 inline-block -rotate-[1.5deg] bg-rose-vif px-4 pb-1 pt-0.5 text-charbon">
                {HERO.title[1]}
              </span>
            </h1>

            <p className="display mt-7 text-[22px] text-vert-vif md:text-[26px]">
              {HERO.claim}
            </p>
            <Onde aria-hidden className="mt-2 h-4 w-40 text-rose-vif" />
          </div>

          {/* ── média ── */}
          <div className="relative lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <p
              aria-hidden
              className="annotation ombre-dure-sm absolute -left-4 -top-4 z-20 hidden max-w-[190px] -rotate-3 rounded-2xl border-2 border-ink bg-vert-vif px-3.5 py-2.5 font-bold text-charbon lg:block"
            >
              ↘ pendant que vous lisez ça, un système tourne quelque part sans
              personne
            </p>

            <div className="relative aspect-square overflow-hidden rounded-[32px] border-2 border-paper/15">
              <HeroMedia />
            </div>

            <p
              aria-hidden
              className="annotation ombre-dure-sm absolute -bottom-5 -right-3 z-20 hidden max-w-[190px] rotate-2 rounded-2xl border-2 border-ink bg-rose px-3.5 py-2.5 font-bold text-paper lg:block"
            >
              vous gardez la barre, c&apos;est tout l&apos;intérêt ↖
            </p>
          </div>

          {/* ── argumentaire et actions ── */}
          <div className="lg:col-start-1 lg:row-start-2 lg:self-start">
            <p className="max-w-md text-[14.5px] leading-[1.75] text-paper/60">
              {HERO.body}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href={HERO.ctaPrimary.href}
                target="_blank"
                rel="noopener noreferrer"
                className="bouton-relief ombre-dure group inline-flex items-center gap-2 rounded-full border-2 border-ink bg-banane px-7 py-3.5 text-[15px] font-semibold text-ink"
              >
                {HERO.ctaPrimary.label}
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </a>
              <Link
                href={HERO.ctaSecondary.href}
                className="rounded-full border-2 border-paper/25 px-7 py-3.5 text-[15px] font-semibold text-paper transition-colors hover:border-vert-vif hover:text-vert-vif"
              >
                {HERO.ctaSecondary.label}
              </Link>
            </div>

            <p className="mt-4 max-w-sm text-[12.5px] leading-[1.55] text-paper/45">
              {HERO.ctaNote}
            </p>
          </div>
        </div>

        {/* chiffres, le gain et jamais le prix */}
        <ul className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-[24px] border-2 border-paper/15 bg-paper/15 sm:grid-cols-3">
          {HERO.stats.map((s) => (
            <li key={s.label} className="bg-charbon px-6 py-7">
              <div className="display text-[30px] text-banane md:text-[36px]">
                {s.value}
              </div>
              <div className="mt-2 text-[12.5px] leading-[1.45] text-paper/55">
                {s.label}
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-[11.5px] leading-[1.5] text-paper/35">
          {HERO.statsNote} · Une marque {SITE.parent}
        </p>
      </div>

      {/* Vague de sortie. Volontairement sans objet 3D, le hero porte deja le
          titre geant, les annotations et les chiffres. */}
      <div aria-hidden className="pointer-events-none relative">
        <Eclat className="absolute -top-[70px] left-[8%] hidden h-7 w-7 text-vert-vif md:block" />
        <Eclat className="absolute -top-[120px] left-[26%] hidden h-5 w-5 text-banane lg:block" />
        <div className="vague -mb-px bg-paper" />
      </div>
    </section>
  );
}
