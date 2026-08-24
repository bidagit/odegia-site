import { LEVELS, LEVEL_RULE } from "@/lib/content";

/* L'échelle est l'outil de vente autant que l'outil de diagnostic. Les niveaux
   2, 3 et 4 sont marqués comme livrables, parce qu'ils se vendent tous les
   trois. Ne présenter que le 4 ferait fuir les tâches à fort coût d'erreur,
   qui relèvent précisément du 3. */
export function Levels() {
  return (
    <section
      id="niveaux"
      className="scroll-mt-20 bg-violet-deep py-20 text-paper md:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper/50">
            L&apos;échelle
          </span>
          <h2 className="mt-3 text-[30px] font-semibold leading-[1.08] tracking-[-0.03em] md:text-[40px]">
            Six niveaux, trois qui se livrent.
          </h2>
          <p className="mt-4 text-[14.5px] leading-[1.7] text-paper/65">
            Nous mesurons votre autonomie comme on mesure celle d&apos;un
            véhicule, par ce que le système fait sans vous. Les niveaux 2, 3 et
            4 se livrent et se facturent. Le 4 est la cible, il n&apos;est pas
            la seule vente.
          </p>
        </div>

        <ol className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LEVELS.map((l) => (
            <li
              key={l.level}
              className={`rounded-[20px] border p-6 ${
                l.target
                  ? "border-jaune bg-jaune/12"
                  : l.sellable
                    ? "border-paper/25 bg-paper/[0.07]"
                    : "border-paper/12 bg-paper/[0.03]"
              }`}
            >
              <div className="flex items-baseline gap-3">
                <span
                  className={`text-[30px] font-semibold leading-none tracking-[-0.03em] ${
                    l.target
                      ? "text-jaune"
                      : l.sellable
                        ? "text-paper/70"
                        : "text-paper/30"
                  }`}
                >
                  {l.level}
                </span>
                <h3
                  className={`text-[15.5px] font-semibold leading-tight tracking-[-0.01em] ${
                    l.sellable ? "" : "text-paper/55"
                  }`}
                >
                  {l.title}
                </h3>
              </div>
              <p
                className={`mt-3 text-[13px] leading-[1.65] ${
                  l.sellable ? "text-paper/70" : "text-paper/45"
                }`}
              >
                {l.body}
              </p>
              {l.sellable && (
                <p
                  className={`mt-4 inline-block rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.06em] ${
                    l.target
                      ? "bg-jaune text-ink"
                      : "border border-paper/30 text-paper/75"
                  }`}
                >
                  {l.sellable}
                </p>
              )}
            </li>
          ))}
        </ol>

        {/* la règle d'arbitrage, elle vaut argument commercial */}
        <div className="mt-10 rounded-[22px] border border-paper/15 bg-paper/[0.05] p-6 md:p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14">
            <div>
              <h3 className="text-[19px] font-semibold leading-tight tracking-[-0.02em]">
                {LEVEL_RULE.title}
              </h3>
              <p className="mt-3 text-[13.5px] leading-[1.7] text-paper/65">
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
                  <dd className="text-[13.5px] font-medium sm:text-right">
                    {r.then}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
