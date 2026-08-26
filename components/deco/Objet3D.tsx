import Image from "next/image";

/* Objets 3D bas-polygone, generes puis detoures. Purement decoratifs, donc
   aria-hidden et alt vide, ils ne transportent aucune information.

   Ils sont volontairement poses en absolu et debordent de leur section, c est
   ce chevauchement qui fait decor plutot qu illustration rangee dans une boite.
   Tous sont masques sous md, ils encombreraient l ecran etroit sans rien
   apporter. */

const OBJETS = {
  paperasse: { src: "/images/3d/paperasse.png", w: 194, h: 365 },
  sablier: { src: "/images/3d/sablier.png", w: 169, h: 312 },
  avion: { src: "/images/3d/avion.png", w: 585, h: 354 },
  hamster: { src: "/images/3d/hamster.png", w: 460, h: 498 },
} as const;

export function Objet3D({
  nom,
  className = "",
  priority = false,
}: {
  nom: keyof typeof OBJETS;
  className?: string;
  priority?: boolean;
}) {
  const o = OBJETS[nom];
  return (
    <Image
      src={o.src}
      alt=""
      aria-hidden
      width={o.w}
      height={o.h}
      priority={priority}
      className={`pointer-events-none select-none ${className}`}
    />
  );
}
