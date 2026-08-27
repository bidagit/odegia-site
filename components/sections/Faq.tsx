import { FAQ, SITE } from "@/lib/content";

/* Deux jeux de questions depuis le 27/08/2026. Celles marquees cadre ne se
   lisent que l echelle sous les yeux, elles partent donc sur /echelle et
   quittent l accueil, ou elles supposaient un vocabulaire que la page
   n enseigne plus. */
export function Faq({ cadre = false }: { cadre?: boolean }) {
  const questions = FAQ.filter((f) => Boolean(f.cadre) === cadre);
  return (
    <section className="border-t border-ink/10 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
              Questions
            </span>
            <h2 className="display mt-3 text-[34px] md:text-[44px] leading-[1.08] tracking-[-0.03em] ">
              Ce qu&apos;on nous demande.
            </h2>
            <p className="mt-5 max-w-xs text-[14px] leading-[1.7] text-ink-soft">
              Si votre situation ne relève pas de l&apos;autonomisation, nous
              vous le dirons au premier échange.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <a
                href={SITE.booking}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full bg-vert px-6 py-3.5 text-[14px] font-medium text-white transition-colors hover:bg-vert-deep"
              >
                Réserver 15 minutes
              </a>
              <a
                href="/estimation"
                className="inline-block rounded-full border border-ink/15 px-6 py-3.5 text-[14px] font-medium transition-colors hover:border-vert hover:text-vert"
              >
                Estimer d&apos;abord
              </a>
            </div>
          </div>

          <dl className="divide-y divide-ink/10 border-t border-ink/10">
            {questions.map((f) => (
              <div key={f.q} className="py-6">
                <dt className="text-[15.5px] font-semibold tracking-[-0.01em]">
                  {f.q}
                </dt>
                <dd className="mt-2.5 text-[13.5px] leading-[1.75] text-ink-soft">
                  {f.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
