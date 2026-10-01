import Image from "next/image";
import { FONDATEUR } from "@/lib/content";

/* Qui tient la methode, placee entre les tarifs et la FAQ.

   L emplacement porte une intention. La confiance se joue juste avant
   l engagement et non en haut de page, ou elle interromprait la demonstration
   par une biographie que personne ne demande encore.

   Trois reperes numerotes plutot que des cartes. Le propos est une suite de
   causes, chaque ligne expliquant un choix visible ailleurs sur la page, et une
   grille de cartes de meme rang effacerait cet enchainement. */
export function Fondateur() {
  return (
    <section className="border-t border-ink/10 bg-paper-alt/45 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.25fr] lg:gap-20">
          <div data-reveal>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
              {FONDATEUR.eyebrow}
            </span>
            <h2 className="display mt-3 text-[34px] leading-[1.08] tracking-[-0.03em] md:text-[44px]">
              {FONDATEUR.title}
              <br />
              <span className="text-vert">{FONDATEUR.titleAccent}</span>
            </h2>
            <p className="mt-5 max-w-md text-[14.5px] leading-[1.75] text-ink-soft">
              {FONDATEUR.intro}
            </p>
            <p className="mt-3 max-w-md text-[14.5px] leading-[1.75] text-ink">
              {FONDATEUR.equipe}
            </p>

            {/* Portrait detoure, pose sur une pastille menthe. Le haut du
                portrait deborde du cercle, le bas est coupe par sa courbe, ce
                qui evite le cadre rectangulaire d une photo d identite. */}
            <figure className="mt-10">
              <div className="relative h-[300px] w-[250px]">
                <span
                  aria-hidden="true"
                  className="ombre-dure absolute bottom-0 left-0 h-[250px] w-[250px] rounded-full border-2 border-ink bg-vert-vif"
                />
                <div className="absolute bottom-0 left-0 h-[300px] w-[250px] overflow-hidden rounded-b-full">
                  <Image
                    src="/images/adib-bensalem.webp"
                    alt="Adib Bensalem, fondateur d'Odegia"
                    width={640}
                    height={887}
                    sizes="250px"
                    className="absolute bottom-[-40px] left-1/2 w-[230px] max-w-none -translate-x-1/2"
                  />
                </div>
              </div>
              <figcaption className="mt-4 text-[13px] text-ink-soft">
                <span className="font-semibold text-ink">Adib Bensalem</span>, fondateur
              </figcaption>
            </figure>
          </div>

          <div data-reveal>
            <p className="text-[14.5px] leading-[1.75] text-ink-soft">
              {FONDATEUR.lead}
            </p>

            <ol className="mt-8 space-y-7">
              {FONDATEUR.points.map((p, i) => (
                <li key={p.title} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-banane font-mono text-[12px] font-semibold text-ink">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-[15.5px] font-semibold tracking-[-0.01em]">
                      {p.title}
                    </h3>
                    <p className="mt-1.5 text-[13.5px] leading-[1.7] text-ink-soft">
                      {p.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {/* La cloture porte la promesse assumee le 28/08/2026, la methode ne
                depend pas d une seule personne. Elle est vraie sur le principe
                et le deviendra dans les faits quand la bibliotheque de
                specifications sera ecrite. */}
            <p className="ombre-dure-sm mt-9 rounded-[20px] border-2 border-ink bg-vert-soft p-5 text-[14px] leading-[1.7] text-ink">
              {FONDATEUR.closing}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
