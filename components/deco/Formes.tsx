/* Decors geometriques du site. Formes pleines, cernees d un trait d encre,
   dans l esprit des objets bas-polygone de la reference. Ce sont des SVG et non
   des images, ils restent nets a toute taille et ne coutent rien au chargement.

   Chaque forme est purement decorative, elle porte aria-hidden et ne doit
   jamais transporter d information. */

type Props = { className?: string };

/* Palmier bas-polygone, la silhouette la plus lisible de la reference. */
export function Palmier({ className = "" }: Props) {
  return (
    <svg viewBox="0 0 200 260" className={className} aria-hidden="true" fill="none">
      <g stroke="#1f2222" strokeWidth="4" strokeLinejoin="round">
        <path d="M96 250 L88 120 L112 120 L104 250 Z" fill="#b07a3c" />
        <path d="M90 150 L110 146 M90 178 L110 174 M90 206 L110 202" strokeWidth="3" />
        <path d="M100 118 L28 92 L46 66 L100 100 Z" fill="#0f7a5c" />
        <path d="M100 118 L172 92 L154 66 L100 100 Z" fill="#6fdcb8" />
        <path d="M100 112 L52 40 L84 32 L100 92 Z" fill="#6fdcb8" />
        <path d="M100 112 L148 40 L116 32 L100 92 Z" fill="#0f7a5c" />
        <path d="M100 106 L86 22 L114 22 L100 88 Z" fill="#0f7a5c" />
      </g>
    </svg>
  );
}

/* Fleche manuscrite, pour relier une annotation a ce qu elle designe. */
export function Fleche({ className = "" }: Props) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden="true" fill="none">
      <path
        d="M6 12 C40 4 78 18 96 52"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M84 44 L98 56 L82 62"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Etoile a quatre branches, l eclat qui ponctue les titres. */
export function Eclat({ className = "" }: Props) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path
        d="M50 0 C54 34 66 46 100 50 C66 54 54 66 50 100 C46 66 34 54 0 50 C34 46 46 34 50 0 Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* Blob, la tache de couleur posee derriere un bloc. */
export function Blob({ className = "" }: Props) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <path
        d="M42 22 C96 -8 168 8 186 62 C204 116 172 168 118 184 C64 200 16 172 8 118 C0 64 12 40 42 22 Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* Trace ondule, la ligne de vitesse. */
export function Onde({ className = "" }: Props) {
  return (
    <svg viewBox="0 0 200 40" className={className} aria-hidden="true" fill="none">
      <path
        d="M4 20 C24 2 44 38 64 20 C84 2 104 38 124 20 C144 2 164 38 196 20"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
