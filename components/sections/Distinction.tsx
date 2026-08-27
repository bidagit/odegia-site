import { Objet3D } from "@/components/deco/Objet3D";

/* Cette section repond a une objection reelle du visiteur cible, un independant
   qui a deja bricole des automatisations avec des modeles, des macros ou un
   outil de connexion, et qui se demande en quoi Odegia differe.

   Elle sert donc trois choses, dans cet ordre. Justifier qu on vende une
   progression plutot qu un outil. Nommer les deux benefices, gagner des heures
   d un cote, sortir de la boucle de l autre, qui ne sont pas le meme achat. Et
   legitimer l arret au niveau 3, sans quoi l echelle se lit comme un escalier
   qu il faudrait monter jusqu en haut.

   Elle vient apres l echelle, ou le visiteur a les niveaux en tete, sans quoi
   la distinction reste abstraite. */
export function Distinction() {
  return (
    <section className="border-t border-ink/10 py-20 md:py-28">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Objet3D
          nom="hamster"
          className="absolute right-2 -top-10 hidden h-[190px] w-auto -rotate-3 lg:block xl:right-8"
        />
        <div className="max-w-2xl" data-reveal>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            Pourquoi une échelle
          </span>
          <h2 className="display mt-3 text-[34px] leading-[1.08] tracking-[-0.03em] md:text-[44px]">
            Gagner des heures,
            <br />
            <span className="text-vert">ou sortir de la boucle.</span>
          </h2>
          <p className="mt-5 text-[14.5px] leading-[1.75] text-ink-soft">
            Vous avez sans doute déjà automatisé quelque chose, un modèle, une
            macro, deux outils reliés entre eux. Ça marche, et ça vous fait
            gagner du temps. C&apos;est le premier bénéfice, et il s&apos;arrête
            là où vous restez dans la boucle.
          </p>
          <p className="mt-4 text-[14.5px] leading-[1.75] text-ink-soft">
            Le second bénéfice arrive plus haut sur l&apos;échelle, entre le
            niveau 3 et le niveau 4. C&apos;est pour ça que nous vendons une
            progression plutôt qu&apos;un outil.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch lg:gap-6">
          <div className="ombre-dure-sm rounded-[22px] border-2 border-ink bg-surface p-7">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
              Niveaux 1 à 3
            </span>
            <h3 className="display mt-2 text-[24px]">Vous gagnez des heures</h3>
            <p className="mt-4 text-[14px] leading-[1.7] text-ink-soft">
              La tâche s&apos;exécute plus vite, voire toute seule. La décision
              reste la vôtre, en amont quand vous fixez la règle, ou juste avant
              l&apos;envoi quand vous validez.
            </p>
            <p className="mt-4 text-[13.5px] leading-[1.65] text-ink-soft">
              Vous récupérez du temps sur chaque tâche. Votre agenda garde la
              même forme.
            </p>
          </div>

          {/* La bascule, marquee physiquement entre les deux cartes. */}
          <div
            aria-hidden
            className="flex items-center justify-center lg:w-16 lg:flex-col"
          >
            <span className="hidden h-full w-px border-l-2 border-dashed border-ink/25 lg:block" />
            <span className="my-0 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-banane font-mono text-[11px] font-semibold text-ink lg:-my-5">
              3→4
            </span>
            <span className="hidden h-full w-px border-l-2 border-dashed border-ink/25 lg:block" />
          </div>

          <div className="ombre-dure rounded-[22px] border-2 border-ink bg-charbon p-7 text-paper">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-vert-vif">
              Niveaux 4 et 5
            </span>
            <h3 className="display mt-2 text-[24px]">Vous sortez de la boucle</h3>
            <p className="mt-4 text-[14px] leading-[1.7] text-paper/75">
              Le système décide lui-même sur un périmètre défini, avec des
              limites écrites et des garde-fous. Vous n&apos;intervenez plus que
              sur exception.
            </p>
            <p className="mt-4 text-[13.5px] leading-[1.65] text-paper/75">
              C&apos;est là que votre agenda change de forme, et c&apos;est le
              seul endroit où ça arrive.
            </p>
          </div>
        </div>

        {/* Sans cette phrase, l echelle se lit comme un escalier a monter
            jusqu en haut, ce qui contredit la regle d arbitrage juste au-dessus. */}
        <p className="mt-8 max-w-3xl text-[13.5px] leading-[1.7] text-ink-soft">
          S&apos;arrêter au niveau 3 reste un bon choix quand une erreur coûte
          cher. Nous le recommandons souvent. L&apos;échelle sert à savoir où
          vous êtes et ce que coûte le palier suivant, elle se monte au rythme
          qui vous convient.
        </p>
      </div>
    </section>
  );
}
