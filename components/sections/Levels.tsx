import { LEVELS, LEVEL_RULE } from "@/lib/content";

/* Section en menthe pleine, l equivalent de la bande saturee de la reference.
   Elle casse la page en deux et donne le ton. Le texte passe en charbon, la
   menthe est bien trop claire pour porter du blanc. */
export function Levels() {
  return (
    <>
      <div aria-hidden className="vague-haut -mt-px bg-vert-vif" />
      <section
        id="niveaux"
        className="scroll-mt-20 bg-vert-vif py-16 text-charbon md:py-20"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-charbon/60">
              L&apos;échelle
            </span>
            <h2 className="display mt-3 text-[34px] md:text-[46px]">
              Six niveaux,
              <br />
              trois qui se livrent.
            </h2>
            <p className="mt-5 text-[15px] leading-[1.7] text-charbon/75">
              Nous mesurons votre autonomie comme on mesure celle d&apos;un
              véhicule, par ce que le système fait sans vous. Les niveaux 2, 3 et
              4 se livrent et se facturent. Le 4 est la cible, il n&apos;est pas
              la seule vente.
            </p>
          </div>

          <ol className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LEVELS.map((l) => (
              <li
                key={l.level}
                className={`penche rounded-[22px] border-2 p-6 ${
                  l.target
                    ? "ombre-dure border-ink bg-banane"
                    : l.sellable
                      ? "ombre-dure-sm border-ink bg-paper"
                      : "border-charbon/25 bg-vert-vif"
                }`}
              >
                <div className="flex items-baseline gap-3">
                  <span
                    className={`display text-[34px] ${
                      l.sellable ? "text-ink" : "text-charbon/40"
                    }`}
                  >
                    {l.level}
                  </span>
                  <h3
                    className={`text-[15.5px] font-semibold leading-tight ${
                      l.sellable ? "" : "text-charbon/55"
                    }`}
                  >
                    {l.title}
                  </h3>
                </div>
                <p
                  className={`mt-3 text-[13px] leading-[1.65] ${
                    l.sellable ? "text-charbon/75" : "text-charbon/50"
                  }`}
                >
                  {l.body}
                </p>
                {l.sellable && (
                  <p
                    className={`mt-4 inline-block rounded-full border-2 border-ink px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] ${
                      l.target
                        ? "bg-charbon text-banane"
                        : "bg-rose-vif text-charbon"
                    }`}
                  >
                    {l.sellable}
                  </p>
                )}
              </li>
            ))}
          </ol>

          {/* la regle d arbitrage, elle vaut argument commercial */}
          <div className="ombre-dure mt-10 rounded-[24px] border-2 border-ink bg-charbon p-7 text-paper md:p-9">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14">
              <div>
                <h3 className="display text-[24px] md:text-[28px]">
                  {LEVEL_RULE.title}
                </h3>
                <p className="mt-4 text-[13.5px] leading-[1.7] text-paper/65">
                  {LEVEL_RULE.body}
                </p>
              </div>
              <dl className="divide-y divide-paper/15 border-t border-paper/15">
                {LEVEL_RULE.rows.map((r) => (
                  <div
                    key={r.when}
                    className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                  >
                    <dt className="text-[13px] text-paper/60">{r.when}</dt>
                    <dd className="text-[13.5px] font-semibold text-vert-vif sm:text-right">
                      {r.then}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>
      <div aria-hidden className="vague -mb-px bg-paper" />
    </>
  );
}
