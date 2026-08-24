import Link from "next/link";
import Image from "next/image";
import { NAV_LINKS, SITE, LEGAL_LINKS } from "@/lib/content";

export function Footer() {
  return (
    <footer className="bg-petrol-deep text-sand">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <span className="flex items-center gap-2.5 text-[17px] font-semibold">
              <Image
                src="/images/logo.png"
                alt=""
                width={554}
                height={506}
                className="h-8 w-8 rounded-lg bg-sand object-contain p-0.5"
              />
              {SITE.name}
            </span>
            <p className="mt-5 max-w-xs text-[13.5px] leading-[1.75] text-sand/60">
              L&apos;IA exécute, vous gouvernez. Odegia automatise votre
              administratif brique par brique, du niveau 2 au niveau 4.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <a
                href={SITE.booking}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full bg-ocre px-5 py-2.5 text-[13.5px] font-medium text-ink transition-colors hover:bg-ocre-deep"
              >
                Prendre rendez-vous
              </a>
              <a
                href={`mailto:${SITE.email}`}
                className="inline-block rounded-full border border-sand/25 px-5 py-2.5 text-[13.5px] font-medium text-sand/80 transition-colors hover:border-sand hover:text-sand"
              >
                {SITE.email}
              </a>
            </div>
          </div>

          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-sand/45">
              Le site
            </span>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[13.5px] text-sand/70 transition-colors hover:text-sand"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-sand/45">
              Le groupe
            </span>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a
                  href="https://orbisoptima.com"
                  className="text-[13.5px] text-sand/70 transition-colors hover:text-sand"
                >
                  Orbis Optima Group
                </a>
              </li>
              <li>
                <a
                  href="https://orbisoptima.com/entreprises-autonomes"
                  className="text-[13.5px] text-sand/70 transition-colors hover:text-sand"
                >
                  Entreprises autonomes
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-sand/15 pt-6 text-[12px] text-sand/40 sm:flex-row sm:items-center sm:justify-between">
          <span>
            {SITE.city} · © {new Date().getFullYear()} {SITE.name}
          </span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {LEGAL_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="transition-colors hover:text-sand"
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
