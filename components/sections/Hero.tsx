import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroMedia } from "./HeroMedia";
import { HERO, SITE } from "@/lib/content";

/* Composition reprise de la référence, énoncé à gauche, média au centre,
   chiffres alignés à droite. Le média déborde volontairement vers le bas. */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* halo pétrole derrière le média, remplace le dégradé de la référence */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-vert/8 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 md:pb-20 md:pt-14">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)_auto] lg:gap-8">
          {/* ── énoncé ── */}
          <div className="lg:pb-10">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-ink/12 bg-surface/70 px-3.5 py-1.5 text-[12px] font-medium text-ink-soft">
              <span aria-hidden className="h-2 w-2 rounded-full bg-rose-vif" />
              {HERO.eyebrow}
            </span>

            {/* La seconde ligne est posee sur une bande rose, comme l adhesif du
                debardeur d ou vient la palette. C est le seul endroit du site ou
                le rose occupe autant de surface, ailleurs il reste ponctuel. */}
            <h1 className="mt-6 text-[38px] font-semibold leading-[1.06] tracking-[-0.035em] sm:text-[46px] lg:text-[54px] xl:text-[62px]">
              {HERO.title[0]}
              <br />
              <span className="mt-1.5 inline-block -rotate-[1.2deg] bg-rose px-3 py-0.5 text-paper">
                {HERO.title[1]}
              </span>
            </h1>

            <p className="mt-5 text-[17px] font-medium leading-[1.45] tracking-[-0.01em] md:text-[19px]">
              {HERO.claim}
            </p>

            <p className="mt-4 max-w-md text-[14.5px] leading-[1.7] text-ink-soft">
              {HERO.body}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={HERO.ctaPrimary.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full bg-vert px-6 py-3.5 text-[14.5px] font-medium text-white transition-colors hover:bg-vert-deep"
              >
                {HERO.ctaPrimary.label}
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </a>
              <Link
                href={HERO.ctaSecondary.href}
                className="rounded-full border border-ink/15 px-6 py-3.5 text-[14.5px] font-medium transition-colors hover:border-vert hover:text-vert"
              >
                {HERO.ctaSecondary.label}
              </Link>
            </div>

            <p className="mt-4 max-w-sm text-[12.5px] leading-[1.55] text-ink-soft">
              {HERO.ctaNote}
            </p>
          </div>

          {/* ── média ── */}
          <div className="relative">
            <div className="relative aspect-square overflow-hidden rounded-[28px] bg-paper-alt shadow-[0_28px_60px_-28px_rgba(9,50,55,0.45)]">
              <HeroMedia />
            </div>
          </div>

          {/* ── chiffres, le gain et jamais le prix ── */}
          <div className="lg:w-[200px]">
            <ul className="flex flex-row justify-between gap-6 lg:flex-col lg:justify-start lg:gap-8">
              {HERO.stats.map((s) => (
                <li key={s.label} className="lg:border-t lg:border-ink/12 lg:pt-5">
                  <div className="text-[26px] font-semibold leading-none tracking-[-0.03em] text-vert lg:text-[30px]">
                    {s.value}
                  </div>
                  <div className="mt-2 text-[12.5px] leading-[1.45] text-ink-soft">
                    {s.label}
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-6 hidden text-[11px] leading-[1.5] text-ink-soft/70 lg:block">
              {HERO.statsNote}
            </p>
          </div>
        </div>

        <p className="mt-10 text-[11px] leading-[1.5] text-ink-soft/70 lg:hidden">
          {HERO.statsNote}
        </p>

        <p className="mt-8 text-[12px] text-ink-soft/70 lg:mt-12">
          Une marque {SITE.parent}
        </p>
      </div>
    </section>
  );
}
