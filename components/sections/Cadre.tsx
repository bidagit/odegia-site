import Link from "next/link";

/* Ce bloc remplace deux sections entieres sur la page d accueil, l echelle et
   la distinction automatiser-autonomiser, deplacees vers /echelle le 27/08/2026.

   Il garde ce dont le visiteur a besoin pour acheter, on commence petit et on
   monte si ca marche, et renvoie le reste a ceux qui veulent le cadre. Trois
   phrases au lieu de deux sections, et le mot niveau passe de trente-deux
   occurrences a deux sur la page. */
export function Cadre() {
  return (
    <section className="border-t border-ink/10 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="ombre-dure rounded-[24px] border-2 border-ink bg-vert-soft p-7 md:p-10">
          <div className="md:flex md:items-end md:justify-between md:gap-10">
            <div className="max-w-xl">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
                Le rythme
              </span>
              <h2 className="display mt-3 text-[28px] leading-[1.1] tracking-[-0.025em] md:text-[36px]">
                Une tâche, puis la suivante.
              </h2>
              <p className="mt-4 text-[14.5px] leading-[1.75] text-ink-soft">
                On commence par la tâche qui vous coûte le plus. Elle tourne
                pendant quelques semaines, vous voyez ce que ça change, et vous
                décidez si on continue. Vous pouvez vous arrêter là, beaucoup le
                font et s&apos;en portent bien.
              </p>
              <p className="mt-3 text-[14.5px] leading-[1.75] text-ink-soft">
                Derrière ce rythme il y a une échelle en six niveaux, qui sert à
                décider jusqu&apos;où pousser chaque tâche. Elle est utile à
                connaître, elle n&apos;est pas nécessaire pour commencer.
              </p>
            </div>

            <div className="mt-7 shrink-0 md:mt-0">
              <Link
                href="/echelle"
                className="bouton-relief ombre-dure-sm inline-block rounded-full border-2 border-ink bg-paper px-6 py-3.5 text-[14px] font-semibold text-ink"
              >
                Voir l&apos;échelle
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
