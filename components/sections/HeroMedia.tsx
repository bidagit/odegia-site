"use client";

import { useEffect, useState } from "react";

/* La vidéo est décorative. Elle est remplacée par l'image fixe lorsque le
   visiteur a demandé la réduction des animations, plutôt que jouée en boucle
   malgré lui. L'image sert aussi d'affiche pendant le chargement. */
export function HeroMedia() {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduce(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (reduce) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/images/hero.png"
        alt=""
        aria-hidden
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster="/images/hero.png"
      aria-hidden
      className="h-full w-full object-cover"
    >
      <source src="/images/hero.mp4" type="video/mp4" />
    </video>
  );
}
