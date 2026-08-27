"use client";

import { useEffect } from "react";

/* Declenche la chute des briques, puis laisse le mouvement se derouler seul.

   Pourquoi du JavaScript ici alors que le reste du site anime en CSS pur. Une
   minuterie de defilement est asservie au geste, elle avance et recule avec la
   molette et s arrete des qu on s arrete. Le comportement demande est autre,
   l entree dans le champ declenche, l animation va au bout toute seule, et rien
   ne se rejoue au retour vers le haut. Cela suppose une animation temporelle
   declenchee une fois, donc un observateur.

   Trois precautions, tirees d une premiere tentative ratee.

   Aucune classe n est posee sur la racine et rien ne s execute avant
   l hydratation. Un script de tete modifiant <html> avait fait echouer
   l hydratation React, et plus aucun composant client ne montait.

   L etat masque n est applique qu aux cartes deja sous le pli au montage.
   Celles qui sont a l ecran ne sont jamais cachees, il n y a donc aucun
   clignotement au chargement.

   Si ce composant ne s execute pas, rien n est jamais masque et la page reste
   entierement lisible. La panne possible est une absence d animation, jamais
   une carte invisible. */
export function ChuteBriques() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cartes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-chute]")
    );
    if (!cartes.length) return;
    const liste = cartes[0].closest("ul");
    if (!liste) return;

    /* Rangees et colonnes deduites de la position verticale reelle. Le nombre
       de colonnes varie de une a trois selon la largeur, un index de boucle
       fige inverserait l ordre des le premier changement de grille. La
       tolerance de vingt pixels absorbe les ecarts de hauteur entre cartes. */
    const y = (e: HTMLElement) => e.getBoundingClientRect().top + window.scrollY;
    const rangees: number[] = [];
    for (const c of cartes) {
      const v = y(c);
      if (!rangees.some((r) => Math.abs(r - v) < 20)) rangees.push(v);
    }
    rangees.sort((a, b) => a - b);

    /* Ordre de lecture, rangee puis colonne. */
    const ordonnees = [...cartes].sort((a, b) => {
      const d = y(a) - y(b);
      if (Math.abs(d) >= 20) return d;
      return a.getBoundingClientRect().left - b.getBoundingClientRect().left;
    });

    /* Duree totale voulue pour la cascade entiere, premiere carte lachee a
       derniere carte posee. Les delais s en deduisent, ce qui la garde exacte
       que la grille affiche une, deux ou trois colonnes. Un pas fixe par
       rangee la faisait varier du simple au double selon la largeur. */
    const CASCADE_MS = 2600;
    /* La duree se lit dans --duree-chute et non dans animationDuration. Au
       moment de ce calcul la classe .tombe n est pas encore posee, aucune
       animation n est donc declaree et animationDuration vaut zero, ce qui
       allongeait la cascade de toute la duree d une chute. */
    cartes[0].classList.add("attente");
    const brut = getComputedStyle(cartes[0])
      .getPropertyValue("--duree-chute")
      .trim();
    const duree = brut.endsWith("ms")
      ? parseFloat(brut)
      : parseFloat(brut || "1") * 1000;
    const etale = Math.max(0, CASCADE_MS - duree);
    const pas = ordonnees.length > 1 ? etale / (ordonnees.length - 1) : 0;

    ordonnees.forEach((c, rang) => {
      /* La cascade entiere est programmee d avance. C est ce qui permet au
         mouvement d aller au bout meme si le lecteur s arrete de defiler, une
         minuterie de defilement s arreterait avec lui. */
      c.style.animationDelay = `${Math.round(rang * pas)}ms`;
      c.classList.add("attente");
    });

    /* Un seul observateur, pose sur la liste. L entree de la section declenche
       les neuf cartes d un coup, chacune partant a son tour selon son delai.
       Observer chaque carte obligerait a continuer de defiler pour voir tomber
       les rangees du bas. */
    const obs = new IntersectionObserver(
      (entrees) => {
        for (const e of entrees) {
          if (e.isIntersecting) {
            for (const c of cartes) c.classList.add("tombe");
            continue;
          }
          /* Rearmement, mais seulement si l on est repasse au-dessus de la
             section. La condition distingue les deux facons de sortir du champ.
             Sans elle, poursuivre vers le bas rearmerait aussi, et la section
             se rejouerait a chaque remontee depuis le pied de page.

             La comparaison porte sur rootBounds et non sur la hauteur de la
             fenetre. La marge basse negative de l observateur remonte la
             frontiere de sortie, si bien qu au moment ou la liste sort par le
             bas son bord haut vaut environ 88 % de la hauteur seulement. Une
             comparaison a window.innerHeight ne se verifiait donc jamais et le
             rearmement ne partait pas.

             L observateur reste branche, contrairement a la version qui se
             deconnectait apres le premier tir. */
          const bas = e.rootBounds?.bottom ?? window.innerHeight;
          if (e.boundingClientRect.top >= bas) {
            for (const c of cartes) c.classList.remove("tombe");
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.01 }
    );
    obs.observe(liste);

    return () => obs.disconnect();
  }, []);

  return null;
}
