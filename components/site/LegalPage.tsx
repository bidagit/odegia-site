import type { ReactNode } from "react";
import { LEGAL } from "@/lib/content";

/* Gabarit commun aux trois pages légales. Colonne de lecture étroite, aucun
   média, la date de mise à jour est affichée parce qu'elle fait partie de
   l'information légale. */
export function LegalPage({
  kicker,
  title,
  intro,
  children,
}: {
  kicker: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <article className="border-t border-ink/10">
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 md:py-20">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
          {kicker}
        </span>
        <h1 className="mt-3 text-[32px] font-semibold leading-[1.08] tracking-[-0.03em] md:text-[42px]">
          {title}
        </h1>
        <p className="mt-5 text-[15px] leading-[1.7] text-ink-soft">{intro}</p>
        <p className="mt-3 text-[12.5px] text-ink-soft/70">
          Dernière mise à jour, {LEGAL.maj}.
        </p>

        <div className="mt-12">{children}</div>
      </div>
    </article>
  );
}

export function Block({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="text-[20px] font-semibold tracking-[-0.02em]">{title}</h2>
      <div className="mt-3 space-y-3.5 text-[14px] leading-[1.75] text-ink-soft">
        {children}
      </div>
    </section>
  );
}

export function Facts({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
      {rows.map(([k, v]) => (
        <div
          key={k}
          className="flex flex-col gap-0.5 py-3 sm:flex-row sm:gap-6"
        >
          <dt className="font-medium text-ink sm:w-64 sm:shrink-0">{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}
