import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroMedia } from "./HeroMedia";
import { HERO, SITE } from "@/lib/content";

/* Hero sur fond charbon, titre d affichage tres lourd, annotations manuscrites
   autour du media, et vague de sortie vers la section claire. La profondeur
   vient des ombres franches, jamais d un flou. */
export function Hero() {
  return (
    <section className="relative bg-charbon text-paper">
      <div className="relative mx-auto max-w-7xl px-5 pb-4 pt-12 sm:px-8 md:pb-8 md:pt-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          {/* ── énoncé ── */}
          <div>
            <span className="inline-flex items-center gap-2.5 rounded-full border border-paper/20 px-3.5 py-1.5 text-[12px] font-medium text-paper/70">
              <span aria-hidden className="h-2 w-2 rounded-full bg-rose-vif" />
              {HERO.eyebrow}
            </span>

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

            <p className="mt-4 max-w-md text-[14.5px] leading-[1.75] text-paper/60">
              {HERO.body}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
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

          {/* ── média, entouré d annotations ── */}
          <div className="relative">
            <p
              aria-hidden
              className="annotation absolute -left-2 -top-3 z-10 hidden max-w-[150px] -rotate-3 text-vert-vif lg:block"
            >
              ↘ pendant que vous lisez ça, un système tourne quelque part sans
              personne
            </p>

            <div className="relative aspect-square overflow-hidden rounded-[32px] border-2 border-paper/15">
              <HeroMedia />
            </div>

            <p
              aria-hidden
              className="annotation absolute -bottom-4 -right-1 z-10 hidden max-w-[160px] rotate-2 text-rose-vif lg:block"
            >
              vous gardez la barre, c est tout l intérêt ↖
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

      {/* vague de sortie, elle porte la couleur de la section suivante */}
      <div aria-hidden className="vague -mb-px bg-paper" />
    </section>
  );
}
