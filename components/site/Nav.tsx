import Link from "next/link";
import Image from "next/image";
import { NAV_LINKS, SITE } from "@/lib/content";

/* Barre haute sur charbon, dans la continuite du hero. Le mot-marque doit
   porter sa couleur explicitement, il heriterait sinon de l encre foncee du
   body et disparaitrait sur le fond sombre. */
export function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-charbon">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-3.5 sm:px-8">
        <Link
          href="/"
          className="display flex shrink-0 items-center gap-2.5 text-[20px] text-paper"
        >
          <Image
            src="/images/logo.png"
            alt=""
            width={554}
            height={506}
            priority
            className="h-8 w-8 object-contain"
          />
          {SITE.name}
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[14px] text-paper/65 transition-colors hover:text-vert-vif"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          {/* Pas de bouton Tarifs ici, l entree existe deja dans NAV_LINKS.
              L action de droite reste unique, la prise de rendez-vous. */}
          <a
            href={SITE.booking}
            target="_blank"
            rel="noopener noreferrer"
            className="bouton-relief ombre-dure-sm rounded-full border-2 border-ink bg-banane px-4 py-2 text-[13.5px] font-semibold text-ink"
          >
            Prendre rendez-vous
          </a>
        </div>
      </nav>
    </header>
  );
}
