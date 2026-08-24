import Link from "next/link";
import Image from "next/image";
import { NAV_LINKS, SITE, LEGAL_LINKS } from "@/lib/content";

export function Footer() {
  return (
    <footer className="bg-charbon-deep text-paper">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <span className="display flex items-center gap-2.5 text-[22px]">
              <Image
                src="/images/logo.png"
                alt=""
                width={554}
                height={506}
                className="h-9 w-9 object-contain"
              />
              {SITE.name}
            </span>
            <p className="mt-5 max-w-xs text-[13.5px] leading-[1.75] text-paper/60">
              L&apos;IA exécute, vous gouvernez. Odegia automatise votre
              administratif brique par brique, du niveau 2 au niveau 4.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <a
                href={SITE.booking}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full bg-banane px-5 py-2.5 text-[13.5px] font-medium text-ink transition-colors hover:bg-banane-deep"
              >
                Prendre rendez-vous
              </a>
              <a
                href={`mailto:${SITE.email}`}
                className="inline-block rounded-full border border-paper/25 px-5 py-2.5 text-[13.5px] font-medium text-paper/80 transition-colors hover:border-paper hover:text-paper"
              >
                {SITE.email}
              </a>
            </div>
          </div>

          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-paper/45">
              Le site
            </span>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[13.5px] text-paper/70 transition-colors hover:text-paper"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-paper/45">
              Le groupe
            </span>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a
                  href="https://orbisoptima.com"
                  className="text-[13.5px] text-paper/70 transition-colors hover:text-paper"
                >
                  Orbis Optima Group
                </a>
              </li>
              <li>
                <a
                  href="https://orbisoptima.com/entreprises-autonomes"
                  className="text-[13.5px] text-paper/70 transition-colors hover:text-paper"
                >
                  Entreprises autonomes
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-paper/15 pt-6 text-[12px] text-paper/40 sm:flex-row sm:items-center sm:justify-between">
          <span>
            {SITE.city} · © {new Date().getFullYear()} {SITE.name}
          </span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {LEGAL_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="transition-colors hover:text-paper"
              >
                {l.label}
              </Link>
            ))}
            <span>Une marque {SITE.parent}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
