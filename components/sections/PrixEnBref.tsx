import Link from "next/link";
import { PRIX_EN_BREF } from "@/lib/content";

/* Ce que ca coute, en une ligne, juste sous le hero. Ajoute le 01/10/2026,
   des visiteurs ne trouvaient pas le prix en parcourant le site. Trois montants,
   dans l ordre ou on les paie, et un renvoi vers les exemples chiffres. */
export function PrixEnBref() {
  return (
    <section aria-labelledby="prix-en-bref" className="border-b border-ink/10 bg-banane/25 py-8 md:py-10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
          <h2
            id="prix-en-bref"
            className="display shrink-0 text-[22px] leading-[1.15] tracking-[-0.02em] md:text-[26px]"
          >
            Ce que ça coûte
          </h2>
          <ol className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
            {PRIX_EN_BREF.map((p, i) => (
              <li
                key={p.montant}
                className="ombre-dure-sm flex items-start gap-3 rounded-[18px] border-2 border-ink bg-paper px-4 py-3.5"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-banane font-mono text-[11px] font-semibold">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[15px] leading-[1.3]">
                    <strong className="display text-[19px] tracking-[-0.01em]">
                      {p.montant.replace(/ /g, " ")}
                    </strong>{" "}
                    {p.quoi}
                  </p>
                  <p className="mt-0.5 text-[12.5px] leading-[1.45] text-ink-soft">{p.note}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link
            href="/#tarifs"
            className="shrink-0 self-start text-[13.5px] font-medium text-vert underline decoration-2 underline-offset-4 hover:text-ink lg:self-center"
          >
            Voir trois exemples chiffrés
          </Link>
        </div>
      </div>
    </section>
  );
}
