import { LEVELS, LEVEL_RULE } from "@/lib/content";
import { Objet3D } from "@/components/deco/Objet3D";

/* Section en menthe pleine, l equivalent de la bande saturee de la reference.
   Elle casse la page en deux et donne le ton. Le texte passe en charbon, la
   menthe est bien trop claire pour porter du blanc.

   Quatre traitements de carte, un par nature de niveau. L horizon (5) recoit le
   charbon plein, il est le seul fond sombre de la bande et se lit donc comme un
   etat terminal plutot que comme une brique de plus. La menthe vive sur charbon
   tient a 7,68:1, largement au-dessus du seuil AA. */
type Genre = "horizon" | "cible" | "vendable" | "eteint";

const CARTE: Record<Genre, string> = {
  horizon: "ombre-dure border-ink bg-charbon",
  cible: "ombre-dure border-ink bg-banane",
  vendable: "ombre-dure-sm border-ink bg-paper",
  eteint: "border-charbon/25 bg-vert-vif",
};

const NUMERO: Record<Genre, string> = {
  horizon: "text-vert-vif",
  cible: "text-ink",
  vendable: "text-ink",
  eteint: "text-charbon/40",
};

const TITRE: Record<Genre, string> = {
  horizon: "text-paper",
  cible: "",
  vendable: "",
  eteint: "text-charbon/55",
};

const CORPS: Record<Genre, string> = {
  horizon: "text-paper/70",
  cible: "text-charbon/75",
  vendable: "text-charbon/75",
  eteint: "text-charbon/50",
};

const PASTILLE: Record<Genre, string> = {
  horizon: "border-vert-vif bg-vert-vif text-charbon",
  cible: "border-ink bg-charbon text-banane",
  vendable: "border-ink bg-rose-vif text-charbon",
  eteint: "",
};

export function Levels() {
  return (
    <>
      <div aria-hidden className="vague-haut -mt-px bg-vert-vif" />
      <section
        id="niveaux"
        className="scroll-mt-20 bg-vert-vif py-16 text-charbon md:py-20"
      >
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <Objet3D nom="sablier" className="absolute right-6 -top-2 hidden h-[135px] w-auto -rotate-6 lg:block xl:right-16" />
          <div className="max-w-2xl">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-charbon/60">
              L&apos;échelle
            </span>
            <h2 className="display mt-3 text-[34px] md:text-[46px]">
              Six niveaux,
              <br />
              quatre qui se livrent.
            </h2>
            <p className="mt-5 text-[15px] leading-[1.7] text-charbon/75">
              Nous mesurons votre autonomie comme on mesure celle d&apos;un
              véhicule, par ce que le système fait sans vous. Les niveaux 2, 3 et
              4 se livrent brique par brique. Le niveau 5 se livre aussi, mais il
              se construit domaine après domaine plutôt qu&apos;en un chantier.
            </p>
          </div>

          <ol className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LEVELS.map((l) => {
              const genre: Genre = l.horizon
                ? "horizon"
                : l.target
                  ? "cible"
                  : l.sellable
                    ? "vendable"
                    : "eteint";

              return (
                <li
                  key={l.level}
                  className={`penche rounded-[22px] border-2 p-6 ${CARTE[genre]}`}
                >
                  <div className="flex items-baseline gap-3">
                    <span className={`display text-[34px] ${NUMERO[genre]}`}>
                      {l.level}
                    </span>
                    <h3
                      className={`text-[15.5px] font-semibold leading-tight ${TITRE[genre]}`}
                    >
                      {l.title}
                    </h3>
                  </div>
                  <p className={`mt-3 text-[13px] leading-[1.65] ${CORPS[genre]}`}>
                    {l.body}
                  </p>
                  {l.sellable && (
                    <p
                      className={`mt-4 inline-block rounded-full border-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] ${PASTILLE[genre]}`}
                    >
                      {l.sellable}
                    </p>
                  )}
                </li>
              );
            })}
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
