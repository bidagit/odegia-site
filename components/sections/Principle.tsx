import { STEPS } from "@/lib/content";

export function Principle() {
  return (
    <section id="principe" className="scroll-mt-20 border-t border-ink/10 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
              Le principe
            </span>
            <h2 className="mt-3 text-[30px] font-semibold leading-[1.08] tracking-[-0.03em] md:text-[40px]">
              Automatiser n&apos;est pas
              <br />
              <span className="text-petrol">rendre autonome.</span>
            </h2>
            <p className="mt-6 max-w-md text-[14.5px] leading-[1.75] text-ink-soft">
              Automatiser, c&apos;est exécuter plus vite une décision déjà prise
              par une personne. Rendre autonome, c&apos;est confier la décision
              elle-même au système, sur un périmètre défini, avec des limites
              écrites et des garde-fous.
            </p>
            <p className="mt-4 max-w-md text-[14.5px] leading-[1.75] text-ink-soft">
              La différence ne se lit pas sur votre facture d&apos;outillage.
              Elle se lit sur votre agenda.
            </p>
          </div>

          <div id="methode" className="scroll-mt-20 grid grid-cols-1 gap-px overflow-hidden rounded-[22px] border border-ink/12 bg-ink/10 sm:grid-cols-2">
            {STEPS.map((s) => (
              <div key={s.numeral} className="bg-sand p-6">
                <span className="font-mono text-[12px] font-medium text-ocre-deep">
                  {s.numeral}
                </span>
                <h3 className="mt-3 text-[16px] font-semibold tracking-[-0.01em]">
                  {s.title}
                </h3>
                <p className="mt-2 text-[13px] leading-[1.65] text-ink-soft">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
