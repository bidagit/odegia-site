import Link from "next/link";
import Image from "next/image";
import { NAV_LINKS, SITE } from "@/lib/content";

/* Barre haute inspirée de la référence, logo à gauche, liens centrés, action à
   droite. Fond translucide pour laisser respirer le média du hero au scroll. */
export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-sand/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-3.5 sm:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 text-[17px] font-semibold tracking-[-0.01em]"
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
              className="text-[14px] text-ink-soft transition-colors hover:text-petrol"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="#tarifs"
            className="hidden rounded-full border border-ink/15 px-4 py-2 text-[13.5px] font-medium transition-colors hover:border-petrol hover:text-petrol sm:inline-block"
          >
            Tarifs
          </Link>
          <a
            href={SITE.booking}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-petrol px-4 py-2 text-[13.5px] font-medium text-white transition-colors hover:bg-petrol-deep"
          >
            Prendre rendez-vous
          </a>
        </div>
      </nav>
    </header>
  );
}
