import Link from "next/link";
import { BENEFICES } from "@/lib/content";

/* Ce que le client y gagne, juste sous le hero. Remplace le 02/10/2026 la
   bande « Ce que ça coûte », a la demande d Adib, le premier ecran apres le
   titre devant parler du benefice et non du prix. Le prix reste a un clic, et
   la troisieme carte en garde l essentiel, des visiteurs ne le trouvaient pas
   avant le 01/10/2026. */
export function Benefices() {
  return (
    <section aria-labelledby="benefices" className="border-b border-ink/10 bg-banane/25 py-8 md:py-10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
          <h2
            id="benefices"
            className="display shrink-0 text-[22px] leading-[1.15] tracking-[-0.02em] md:text-[26px] lg:max-w-[190px]"
          >
            Ce que ça change pour vous
          </h2>
          <ol className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
            {BENEFICES.map((b, i) => (
              <li
                key={b.titre}
                className="ombre-dure-sm flex items-start gap-3 rounded-[18px] border-2 border-ink bg-paper px-4 py-3.5"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-banane font-mono text-[11px] font-semibold">
                  {i + 1}
                </span>
                <div>
                  <p className="display text-[17px] leading-[1.25] tracking-[-0.01em]">{b.titre}</p>
                  <p className="mt-1 text-[12.5px] leading-[1.5] text-ink-soft">{b.texte}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link
            href="/#tarifs"
            className="shrink-0 self-start text-[13.5px] font-medium text-vert underline decoration-2 underline-offset-4 hover:text-ink lg:self-center"
          >
            Voir les tarifs
          </Link>
        </div>
      </div>
    </section>
  );
}
