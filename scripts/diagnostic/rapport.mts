/* Produit le rapport de diagnostic a partir d un dossier client.

     node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/diagnostic/rapport.mts "<dossier>"

   Le dossier contient entree.json, rempli par le skill diagnostic-odegia a
   partir du formulaire et des fiches d entretien. Le script y ecrit
   calcul.json, rapport.html et etalon.md, puis pdf.py transforme le HTML en
   PDF. Les nombres viennent tous de calcul.mts, la prose de entree.json.

   Ordre arrete par Adib le 17/10/2026. Ce que l administratif coute, ce qui
   s automatise, ce qu Odegia fait economiser, la feuille de route, et
   seulement ensuite ce que coute Odegia, le gain net et le devis. Un client
   qui lit un prix avant d avoir vu ce qu il gagne lit un cout.

   Vocabulaire client du meme jour. Ni brique, ni palier, ni parcours, des
   niveaux d autonomie que tout le monde comprend, 100 % autonome,
   semi-autonome, manuel. Le temps est economise, plus rendu. */

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { diagnostiquer, type Entree, type LigneDiag } from "./calcul.mts";
import { tutoyer, restesVouvoiement } from "./tutoiement.mts";
import { NOM_PALIER, TACHES, euros as eurosSite, heures } from "../../lib/estimator.ts";

/* Intl separe les milliers par une espace fine insecable, que la police des
   grands chiffres n a pas. « 37679 € » s affichait colle, le 17/10/2026. Le
   rapport la remplace par l espace insecable ordinaire, le site garde la sienne. */
const euros = (n: number) => eurosSite(n).replace(/ /g, " ");
import { LEGAL, SITE } from "../../lib/content.ts";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as Lucide from "lucide-react";

/* Illustrations des automatisations, demande d Adib du 19/10/2026, pour que le
   client voie ce que fait chaque automatisation. Icones Lucide rendues en SVG
   au moment du rapport, un nom inconnu tombe sur un cercle plutot que de casser
   le rendu. */
const icone = (nom: string | undefined, taille = 16) => {
  const I = (Lucide as unknown as Record<string, Parameters<typeof createElement>[0]>)[nom ?? ""] ?? Lucide.Circle;
  return renderToStaticMarkup(createElement(I as never, { size: taille, strokeWidth: 2 } as never));
};
type Etape = { icone?: string; texte: string; vous?: boolean };

const dossier = process.argv[2];
if (!dossier) {
  console.error("usage, rapport.mts <dossier contenant entree.json>");
  process.exit(1);
}

const racine = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const entree: Entree & { devis?: { numero?: string }; dateRapport?: string } = JSON.parse(
  readFileSync(join(dossier, "entree.json"), "utf-8")
);
const c = diagnostiquer(entree);
writeFileSync(join(dossier, "calcul.json"), JSON.stringify(c, null, 2), "utf-8");

const r = entree.redaction ?? {};
const parId = new Map(c.lignes.map((l) => [l.id, l]));
const uniteId = new Map(c.unites.map((u) => [u.id, u]));
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const para = (s?: string) => (s ? `<p class="prose">${esc(s)}</p>` : "");

const dateFr = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
/* Le devis part avec le rapport, sous 72 heures, et vaut trente jours a
   compter de cette date. */
const dateRapport = entree.dateRapport ?? entree.dateEntretien;
const validite = (() => {
  const d = new Date(dateRapport + "T12:00:00");
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
})();

const logo = readFileSync(join(racine, "public", "images", "odegia-logo-vert.png")).toString("base64");

/* Frequence ecrite comme le client la dirait. */
/* La frequence est relevee par an, on la redit dans l unite la plus parlante. */
const frequence = (an: number) =>
  an >= 200 ? "tous les jours"
  : an >= 48 ? `${Math.round(an / 52)} par semaine`
  : an >= 12 ? `${Math.round(an / 12)} par mois`
  : `${an} par an`;
const duree = (m: number) => (m >= 60 ? `${heures(m / 60)} h` : `${m} min`);

const dansParcours = (l: LigneDiag) =>
  !!l.parcours && c.unites.some((u) => u.parcours && u.id === l.parcours && u.taches.includes(l.id));
/* Niveau d autonomie, le seul vocabulaire montre au client. Le niveau 4 du
   livre part seul, le niveau 3 attend sa validation. */
const autonomie = (niveau: 3 | 4) => (niveau === 4 ? "100 % autonome" : "Semi-autonome");
const pastille = (l: LigneDiag) => {
  switch (l.verdict) {
    case "supprimer":
      return `<span class="chip chip-ink">À supprimer</span>`;
    case "jugement":
      return `<span class="chip chip-rose">Manuel</span>`;
    case "sur-devis":
      return `<span class="chip chip-ink">Sur devis</span>`;
    default:
      if (l.absorbee && !l.demandeClient && !dansParcours(l)) return `<span class="chip chip-gris">Manuel, à confier</span>`;
      return `<span class="chip chip-vert">${autonomie(l.niveau)}</span>`;
  }
};
const mode = (l: LigneDiag) =>
  l.verdict !== "brique"
    ? ""
    : l.niveau === 3
      ? "Vous validez avant envoi"
      : "Part seule, sans vous";

/* ── 1. Ce que votre administratif vous coute ───────────────────────────── */
/* La page 1 part de ce qui attend le client, decision d Adib du 01/10/2026.
   Un dirigeant decide d automatiser selon les douze mois qui viennent, pas
   selon les douze qui sont passes. Le mesure reste affiche, comme point de
   depart, et tous les calculs suivants portent sur la projection. */
const proj = c.projection;
const parCout = [...c.lignes].sort((a, b) => b.coutAnnuel - a.coutAnnuel);
/* Au-dela de douze taches, les plus legeres se regroupent en une ligne. La
   page 1 garde ce qui pese, la page 2 les reprend toutes une par une. */
const MAX_LIGNES_COUT = proj ? (c.lignes.some((l) => l.plafonnee || l.engage) ? 6 : 9) : 12;
const reste = parCout.length > MAX_LIGNES_COUT + 1 ? parCout.slice(MAX_LIGNES_COUT) : [];
const somme = (ls: LigneDiag[], k: "heuresMois" | "coutAnnuel" | "heuresMoisMesure") => ls.reduce((a, l) => a + l[k], 0);
const cartes = proj
  ? `
    <div class="carte carte-passe"><span class="etiquette">Aujourd'hui</span><span class="valeur">${heures(c.totaux.heuresMoisMesure)} h</span><span class="legende">par mois, ${euros(c.totaux.coutAnnuelMesure)} par an sur les douze derniers mois</span></div>
    <div class="carte"><span class="etiquette">Sur les douze prochains mois</span><span class="valeur">${heures(c.totaux.heuresMois)} h</span><span class="legende">par mois, selon votre estimation</span></div>
    <div class="carte"><span class="etiquette">Ce que ça vous coûtera</span><span class="valeur">${euros(c.totaux.coutAnnuel)}</span><span class="legende">par an, à ${euros(c.parametres.taux)} de l'heure${c.parametres.tauxHypothese ? ", hypothèse de travail" : ""}</span></div>`
  : `
    <div class="carte"><span class="valeur">${heures(c.totaux.heuresMois)} h</span><span class="legende">par mois, toutes tâches relevées</span></div>
    <div class="carte"><span class="valeur">${euros(c.totaux.coutAnnuel)}</span><span class="legende">par an, au taux retenu</span></div>
    <div class="carte"><span class="valeur">${euros(c.parametres.taux)}</span><span class="legende">${c.parametres.tauxHypothese ? "de l'heure, hypothèse de travail faute de taux déclaré" : "de l'heure, votre taux déclaré"}</span></div>`;
/* Le plafond se dit en clair des qu il joue, avec son effet chiffre. Un client
   qui a annonce 27 dossiers doit voir pourquoi le calcul en retient 12. */
const plafonnees = c.lignes.filter((l) => l.plafonnee);
const engagees = c.lignes.filter((l) => l.engage && (l.frequenceAnProchaine ?? l.frequenceAn) > l.frequenceAn);
const heuresEstimees = c.lignes.reduce(
  (a, l) => a + (((l.frequenceAnProchaine ?? l.frequenceAn) * l.dureeMinutes) / 60 / 12) * (1 + (l.bascule ?? 0)),
  0
);
const preuves = [...new Set(engagees.map((l) => l.engage!))].map(esc).join(", ");
const nb = (n: number, mot: string) => `${n} ${mot}${n > 1 ? "s" : ""}`;
const encadrePlafond = plafonnees.length || engagees.length
  ? `<div class="plafond"><span class="etiquette">Un plafond de prudence</span><p>Le calcul retient votre estimation des douze prochains mois, plafonnée à ${c.parametres.PLAFOND_PROJECTION} fois ce qui a été mesuré sur les douze derniers. ${plafonnees.length ? `Le plafond s'applique à ${nb(plafonnees.length, "tâche")}, marquées d'une étoile` : "Il ne s'applique à aucune tâche"}${engagees.length ? `, et pas aux ${nb(engagees.length, "tâche")} dont le volume est engagé, ${preuves}` : ""}. ${plafonnees.length ? `Votre estimation donnait ${heures(heuresEstimees)} h par mois, le calcul en retient ${heures(c.totaux.heuresMois)}. Les chiffres qui suivent sont donc prudents, et se recalculent sans frais dès que le volume se confirme.` : ""}${c.lignes.some((l) => (l.bascule ?? 0) > 0) ? " Les durées comprennent le temps pour s'y remettre et s'en défaire." : ""}</p></div>`
  : "";
const ligneCout = (l: LigneDiag) =>
  `<tr><td>${esc(l.nom)}</td><td>${frequence(l.frequenceAn)}${l.plafonnee ? "*" : ""}</td><td>${duree(l.dureeMinutes)}</td>${proj ? `<td class="n passe">${heures(l.heuresMoisMesure)}</td>` : ""}<td class="n">${heures(l.heuresMois)}</td><td class="n">${euros(l.coutAnnuel)}</td></tr>`;
const partie1 = `
<section class="page">
  <p class="eyebrow">01</p>
  <h1>Ce que votre administratif vous coûte${proj ? ", et ce qu'il vous coûtera" : ""}</h1>
  ${para(r.synthese)}
  <div class="chiffres">${cartes}
  </div>
  <table class="cout ${c.lignes.length > 6 ? "dense" : ""}">
    <thead><tr><th>Tâche</th><th>Rythme</th><th>Durée</th>${proj ? `<th class="n">Auj. h/mois</th><th class="n">À venir h/mois</th><th class="n">À venir €/an</th>` : `<th class="n">h / mois</th><th class="n">€ / an</th>`}</tr></thead>
    <tbody>
      ${parCout.slice(0, reste.length ? MAX_LIGNES_COUT : parCout.length).map(ligneCout).join("")}
      ${reste.length ? `<tr><td colspan="3">${reste.length} autres tâches, chacune sous ${heures(reste[0].heuresMois)} h par mois, détaillées page 2</td>${proj ? `<td class="n passe">${heures(somme(reste, "heuresMoisMesure"))}</td>` : ""}<td class="n">${heures(somme(reste, "heuresMois"))}</td><td class="n">${euros(somme(reste, "coutAnnuel"))}</td></tr>` : ""}
    </tbody>
    <tfoot><tr><td colspan="3">Total</td>${proj ? `<td class="n passe">${heures(c.totaux.heuresMoisMesure)}</td>` : ""}<td class="n">${heures(c.totaux.heuresMois)}</td><td class="n">${euros(c.totaux.coutAnnuel)}</td></tr></tfoot>
  </table>
  ${c.totaux.perteAnnuelleMesuree > 0.5 ? `<div class="plafond"><span class="etiquette">Ce que ces heures ne montrent pas</span><p>Environ <strong>${euros(c.totaux.perteAnnuelleMesuree)} par an</strong> restent dus sans être encaissés aujourd'hui, des forfaits commencés et jamais soldés. Les lignes à 0 min sont des tâches que vous ne faites pas encore, c'est là que cet argent se perd.</p></div>` : ""}
  ${encadrePlafond}
  ${encadrePlafond ? "" : `<p class="note">Durées relevées avec vous${c.lignes.some((l) => (l.bascule ?? 0) > 0) ? ", temps pour s'y remettre et s'en défaire compris" : ""}. ${proj ? "Les pages suivantes partent de votre volume d'aujourd'hui, votre estimation y figure en hausse possible." : "Le coût est celui du temps passé, avant toute automatisation."}</p>`}
</section>`;

/* ── 2. Ce qui s automatise, et ce qui reste a votre main ────────────────── */
const ROUTES: { route: string; titre: string }[] = [
  { route: "automatiser", titre: "Se construit" },
  { route: "deleguer", titre: "Se confie à quelqu'un, avec des instructions écrites" },
  { route: "a-votre-main", titre: "Reste à votre main" },
  { route: "eliminer", titre: "Se supprime" },
];
const orientationDe = (id: string) => c.orientations.find((o) => o.id === id)!;
const groupes2 = ROUTES.map(({ route, titre }) => {
  const ls = c.lignes.filter((l) => orientationDe(l.id).route === route);
  if (!ls.length) return "";
  return `<tr class="groupe"><td colspan="2">${titre}</td></tr>${ls
    .map((l) => {
      const o = orientationDe(l.id);
      const etiquettes = [
        route === "automatiser" ? autonomie(l.niveau).toLowerCase() : "",
        route === "automatiser" ? mode(l).toLowerCase() : "",
        o.documenter ? "règle à écrire d'abord" : "",
      ].filter(Boolean).join(" · ");
      return `<tr><td><strong>${esc(l.nom)}</strong>${etiquettes ? `<span class="sous">${etiquettes}</span>` : ""}</td><td>${l.motif ? esc(l.motif) : ""}</td></tr>`;
    })
    .join("")}`;
}).join("");
const partie2Dense = `
<section class="page">
  <p class="eyebrow">02</p>
  <h1>Ce qui s'automatise, et ce qui reste à votre main</h1>
  ${para(r.automatisable)}
  <table class="dense orientations"><tbody>${groupes2}</tbody></table>
  ${c.lignes.some((l) => l.cadrage && l.verdict === "brique") ? para(r.cadrage) : ""}
  ${para(r.ensuite)}
</section>`;
const partie2 = c.lignes.length > 6 ? partie2Dense : `
<section class="page">
  <p class="eyebrow">02</p>
  <h1>Ce qui s'automatise, et ce qui reste à votre main</h1>
  ${para(r.automatisable)}
  <div class="verdicts">
    ${c.lignes
      .map(
        (l) => `<article class="verdict">
      <div class="verdict-tete"><h3>${esc(l.nom)}</h3>${pastille(l)}</div>
      ${(() => { const o = c.orientations.find((x) => x.id === l.id)!; return o.documenter ? `<p class="mode">Règle à écrire d'abord</p>` : o.route === "deleguer" ? `<p class="mode">À confier à quelqu'un</p>` : ""; })()}
      ${mode(l) && c.orientations.find((x) => x.id === l.id)!.route === "automatiser" ? `<p class="mode">${mode(l)}${dansParcours(l) ? `, avec ${esc((entree.parcours?.[l.parcours!] ?? l.parcours!).charAt(0).toLowerCase() + (entree.parcours?.[l.parcours!] ?? l.parcours!).slice(1))}` : ""}${l.demandeClient && l.absorbee && !dansParcours(l) ? ", à votre demande" : ""}</p>` : ""}
      ${l.motif ? `<p>${esc(l.motif)}</p>` : ""}
    </article>`
      )
      .join("")}
  </div>
  ${c.lignes.some((l) => l.cadrage && l.verdict === "brique") ? para(r.cadrage) : ""}
  ${para(r.ensuite)}
</section>`;

/* ── 3. Ce qu Odegia vous fait economiser ────────────────────────────────── */
/* Aucune mensualite sur cette page, decision d Adib du 17/10/2026. Le client
   voit d abord ce qu il gagne, brut, le prix vient en page 5. */
const tete = c.tete ? uniteId.get(c.tete)! : null;
const solde = (n: number) => `${n >= 0 ? "+" : "−"} ${euros(Math.abs(n))}`;
const candidats = c.candidats.filter((k) => !k.recommande);
const bProj = c.bilanMensuel;
/* Decision d Adib du 19/10/2026. Le rapport part du volume d aujourd hui, la
   projection du client se lit en hausse possible. Sans projection les deux
   vues sont identiques. */
const b = bProj && proj
  ? { ...bProj, heures: bProj.mesure.heures, valeur: bProj.mesure.valeur, encaissement: bProj.mesure.encaissement,
      solde: bProj.mesure.solde, gainAn1: bProj.mesure.gainAn1, valeurHorizon: bProj.mesure.valeurHorizon }
  : bProj;
const ensuiteNet = (x: NonNullable<typeof bProj>) => x === bProj && proj ? bProj.mesure.soldeEnsuite : x.valeur - x.ensuite - x.outils;
const hausse = bProj && proj && bProj.valeur - bProj.mesure.valeur > 0.5;
type UV = { heuresRecuperees: number; gainMensuel: number; encaissementMensuel: number; heuresRecupereesMesure: number; gainMensuelMesure: number; encaissementMensuelMesure: number };
const vue = (u: UV) => (proj ? { heuresRecuperees: u.heuresRecupereesMesure, gainMensuel: u.gainMensuelMesure, encaissementMensuel: u.encaissementMensuelMesure } : u);
/* v2.1, une partie de l economie vient d argent recupere et non de temps. */
const enc = b ? b.encaissement > 0.5 : false;
const accroche = !b
  ? `<div class="accroche accroche-neutre"><p>Au seul calcul du temps, aucune automatisation ne se justifie aujourd'hui.</p></div>`
  : `<div class="accroche"><p>Odegia peut vous faire économiser <strong>${heures(b.heures)} h et ${euros(b.valeur)} par mois</strong>${enc ? `, dont ${euros(b.encaissement)} d'impayés récupérés` : ""}${hausse ? `, à votre volume d'aujourd'hui. Jusqu'à ${euros(bProj!.valeur)} si votre activité suit votre estimation` : ""}.</p></div>`;
const designationClient = (u: { parcours: boolean; taches: string[]; niveau: 3 | 4 }) =>
  `${u.parcours ? `Automatisation de ${u.taches.length} tâches enchaînées` : "Automatisation"}, ${autonomie(u.niveau).toLowerCase()}${u.niveau === 3 ? ", vous validez avant envoi" : ""}`;
/* Une tache qu on ne fait pas aujourd hui n economise rien, elle ajoute un
   service. Le dire plutot qu afficher zero heure et zero euro. */
const economie = (u: { heuresRecuperees: number; gainMensuel: number; encaissementMensuel: number }) =>
  u.gainMensuel < 0.5 ? "Ce que vous ne faites pas aujourd'hui, un service en plus plutôt qu'une économie" :
  `${heures(u.heuresRecuperees)} h économisées par mois · ${u.encaissementMensuel > 0.5 ? `${euros(u.gainMensuel - u.encaissementMensuel)} de temps et ${euros(u.encaissementMensuel)} d'impayés récupérés par mois` : `${euros(u.gainMensuel)} de temps par mois`}`;
const ordreIds = c.positions.length ? c.positions.map((p) => ({ id: p.id, demande: p.demande })) : candidats.map((k) => ({ id: k.id, demande: false }));

const partie3 = `
<section class="page">
  <p class="eyebrow">03</p>
  <h1>Ce qu'Odegia vous fait économiser</h1>
  ${accroche}
  <ol class="ordre">
    ${ordreIds
      .map((p, i) => {
        const l = uniteId.get(p.id)!;
        return `<li class="etape">
        <span class="rang">${i + 1}</span>
        <div>
          <h3>${esc(l.nom)}${p.demande ? ` <span class="delai">à votre demande</span>` : ""}</h3>
          <p class="ligne-chiffres">${designationClient(l)}</p>
          ${l.parcours
            ? `<div class="flux">${l.taches.map((t) => { const x = parId.get(t)! as LigneDiag & { icone?: string }; return `<div class="flux-etape"><span class="flux-icone">${icone(x.icone)}</span><span class="flux-nom">${esc(x.etiquette ?? x.nom)}</span><span class="flux-mode">${x.niveau === 4 ? "100 % autonome" : "vous validez"}</span></div>`; }).join(`<span class="flux-fleche">→</span>`)}</div>`
            : (() => { const x = parId.get(l.taches[0]) as (LigneDiag & { illustration?: Etape[] }) | undefined; return x?.illustration?.length ? `<div class="flux">${x.illustration.map((e) => `<div class="flux-etape ${e.vous ? "flux-vous" : ""}"><span class="flux-icone">${icone(e.icone)}</span><span class="flux-nom">${esc(e.texte)}</span></div>`).join(`<span class="flux-fleche">→</span>`)}</div>` : ""; })()}
          <p class="ligne-chiffres">${economie(vue(l))}${proj && l.gainMensuel - l.gainMensuelMesure > 0.5 ? `, jusqu'à ${euros(l.gainMensuel)} selon votre estimation` : ""}</p>
        </div>
      </li>`;
      })
      .join("")}
  </ol>
  ${c.suivantes.length ? `<p class="note">Ensuite, ${c.suivantes.map((id) => esc(uniteId.get(id)!.nom)).join(", ")}. Elles se reconsidèrent une fois les trois premières en service.</p>` : ""}
</section>`;

/* ── 4. Ce que ca coute, le devis ────────────────────────────────────────── */
const d = c.devis;
const designation = (u: { parcours: boolean; taches: string[]; niveau: 3 | 4 }, suite = "") =>
  `${designationClient(u)}${suite}`;
/* Une seule ligne, decision d Adib du 17/10/2026. Le client achete son
   administratif automatise, pas une liste de taches a prix separes. */
const nTaches = c.recommandees.reduce((a, id) => a + uniteId.get(id)!.taches.length, 0);
const lignesDevis = `<tr><td>Votre administratif automatisé, ${nTaches} tâches<span class="sous">${c.recommandees.map((id) => esc(uniteId.get(id)!.nom)).join(" · ")}</span></td><td class="n">${euros(c.devis.mensualitePleine)}</td></tr>`;
const numero = entree.devis?.numero ?? "à attribuer";
const E = c.parametres.ENGAGEMENT_MOIS;

/* Rien a construire, pas de devis. La page dit ce qui se passe pour le
   diagnostic, offert, ou rembourse s il avait ete paye. */
const offert = !!entree.diagnostic.offert;
const gainNet = b ? `
  <div class="accroche"><p>${b.solde >= 0 ? `Une fois tout en service et Odegia payé, vous gagnez <strong>${euros(b.solde)} par mois</strong>${b.ensuite !== b.mensualite ? " la première année" : ""}.` : `Une fois Odegia payé, il vous manque ${euros(-b.solde)} par mois.`}</p></div>
  <div class="bilan">
    <span class="etiquette">${b.recommande ? "Chaque mois, une fois en service" : `Si vous lanciez ${esc(uniteId.get(c.candidats[0].id)!.nom.toLowerCase())} quand même, chaque mois`}</span>
    <div class="bilan-grille">
      <div><span class="valeur">${euros(b.valeur)}</span><span class="legende">économisés, ${heures(b.heures)} h de temps${enc ? ` et ${euros(b.encaissement)} d'impayés récupérés` : ""}</span></div>
      <div><span class="valeur">${euros(b.mensualite)}</span><span class="legende">payés à Odegia${b.ttc ? " TTC" : ""}, construction et supervision comprises${b.ensuite !== b.mensualite ? `, puis ${euros(b.ensuite)} après ${c.parametres.ENGAGEMENT_MOIS} mois` : ""}</span></div>
      ${c.outils.liste.length ? `<div><span class="valeur">${euros(b.outils)}</span><span class="legende">${b.outils > 0.5 ? "d'outils à votre nom" : "d'outils en plus, ceux qu'il faut sont gratuits, compris ou déjà payés"}</span></div>` : ""}
      <div class="${b.solde >= 0 ? "positif" : "negatif"}"><span class="valeur">${solde(b.solde)}</span><span class="legende">gagnés net chaque mois${b.ensuite !== b.mensualite ? `, la première année, puis ${solde(ensuiteNet(bProj!))}${hausse ? `, ou ${solde(bProj!.valeur - bProj!.ensuite - bProj!.outils)} selon votre estimation` : ""}` : ""}</span></div>
    </div>
    <p class="note">${b.ttc ? `Vous ne récupérez pas la TVA, ces montants comptent donc la mensualité TTC, ${euros(b.mensualite)} au lieu de ${euros(b.mensualite / (1 + c.parametres.TAUX_TVA))} HT. ` : ""}${b.nouveauxClients ? `Un nouveau ${esc(b.nouveauxClients.mot.replace(/s$/, ""))} vous rapporte en moyenne ${euros(b.nouveauxClients.valeur)}. Votre première année Odegia, ${euros(b.coutAn1)}, se paie avec ${Math.ceil(b.nouveauxClients.an1)} de plus, chaque année suivante avec ${Math.ceil(b.nouveauxClients.anSuivant)}. ` : ""}${proj ? "Ces montants partent de votre volume d'aujourd'hui. " : ""}Sur la première année, chaque automatisation ne vous fait économiser qu'à partir de sa livraison${b.debutFacturation === "livraison" ? `, et la mensualité ne court qu'à partir de la première, en semaine ${b.premiereLivraison}` : ", alors que la mensualité court dès la signature"}. Construction comprise, vous gagnez ${solde(b.gainAn1)} sur cette première année.${hausse ? ` Si votre activité suit votre estimation, l'économie monte à ${euros(bProj!.valeur)} par mois et le gain net à ${solde(bProj!.solde)}.` : ""} Sur trois ans, ${euros(b.valeurHorizon)} économisés pour ${euros(b.coutHorizon)} payés à Odegia${b.outils > 0.5 ? " et pour vos outils" : ""}. Vous ne payez rien d'avance pour la construction.</p>
  </div>` : "";
const tableNet = c.positions.length ? `
  <table class="dense">
    <thead><tr><th>Automatisation</th><th class="n">Économisé / mois</th><th class="n">Odegia / mois</th><th class="n">Net / mois</th></tr></thead>
    <tbody>${c.positions.map((p) => { const u = uniteId.get(p.id)!; return `<tr><td>${esc(u.nom)}${p.demande ? `<span class="sous">à votre demande</span>` : ""}</td><td class="n">${euros(u.gainMensuel)}</td><td class="n">${euros(p.mensualite)}</td><td class="n">${solde(p.gainNetMensuel)}</td></tr>`; }).join("")}</tbody>
  </table>
  <p class="note">Montants avant remises, chaque automatisation lue seule. Les remises du devis s'appliquent au total.</p>` : "";
const tableCandidats = !c.positions.length && candidats.length ? `
  <table class="dense candidats">
    <thead><tr><th>Automatisation possible</th><th class="n">H économisées / mois</th><th class="n">Économisé / mois</th><th class="n">Odegia / mois</th><th class="n">Net</th><th class="n">Seuil</th></tr></thead>
    <tbody>${candidats.map((k) => `<tr><td>${esc(uniteId.get(k.id)!.nom)}</td><td class="n">${heures(k.heuresRecuperees)} h</td><td class="n">${euros(k.gainMensuel)}</td><td class="n">${euros(k.mensualite)}</td><td class="n">${solde(k.netMensuel)}</td><td class="n">${k.heuresSeuil === null ? "" : `${heures(k.heuresSeuil)} h`}</td></tr>`).join("")}</tbody>
  </table>
  <p class="note">Seuil, les heures économisées par mois à partir desquelles la mensualité est couverte. Sur deux ans, la première coûte ${euros(candidats[0].cout24)} et fait économiser ${euros(candidats[0].rendu24)}.</p>
  <p class="prose">Ce calcul ne compte que le temps. Il ignore la charge mentale d'une tâche qui revient, et ce que vous feriez des heures libérées. Si ces deux coûts pèsent plus lourd pour vous, vous pouvez lancer une automatisation quand même, en connaissance de cause.</p>` : "";
/* v2.3, les outils a son nom, un par ligne, avec ce qu ils coutent en plus. */
const tableOutils = c.outils.liste.length ? `
  <table class="dense">
    <thead><tr><th>Outil à votre nom</th><th>Pour quoi</th><th class="n">En plus / mois</th></tr></thead>
    <tbody>${c.outils.liste.map((o) => `<tr><td>${esc(o.nom)}</td><td>${esc(o.usage)}</td><td class="n">${o.dejaPaye ? "déjà payé" : o.compris ? "compris" : o.prixMois > 0 ? euros(o.prixMois) : "gratuit"}</td></tr>`).join("")}</tbody>
  </table>` : "";
const partie5Gain = `
<section class="page">
  <p class="eyebrow">05</p>
  <h1>Ce que coûte Odegia, et ce que vous gagnez</h1>
  ${gainNet}
  <p class="note">Temps économisé calculé à ${Math.round(c.parametres.PART_RECUPERABLE * 100)} % du temps relevé, le reste couvre le contrôle et les cas particuliers.${proj ? ` Il part de votre volume d'aujourd'hui, et le « jusqu'à » de votre estimation des douze prochains mois${plafonnees.length ? `, plafonnés à ${c.parametres.PLAFOND_PROJECTION} fois le volume mesuré` : ""}.` : ""}${c.totaux.perteAnnuelle > 0.5 ? ` Aujourd'hui, environ ${euros(c.totaux.perteAnnuelleMesuree)} par an restent dus sans être encaissés. Nous comptons qu'un suivi systématique des échéances en récupère ${Math.round(c.parametres.PART_RECOUVREE * 100)} %, soit environ ${euros(c.totaux.perteAnnuelleMesuree * c.parametres.PART_RECOUVREE / 12)} par mois, une hypothèse prudente, une relance rattrape les oublis et les retards, pas un départ décidé.` : ""}</p>
  ${tableOutils}
  ${tableCandidats}
</section>`;

const partie4Vide = `
<section class="page">
  <p class="eyebrow">06</p>
  <h1>Le devis</h1>
  <div class="accroche accroche-neutre"><p>Le calcul ne recommande aucune automatisation aujourd'hui.</p></div>
  <p class="prose">${offert ? "Ce diagnostic vous a été offert." : `Conformément à notre engagement, le diagnostic de ${euros(entree.diagnostic.prix)} vous est remboursé, l'automatisation n'étant pas la réponse à votre volume actuel.`} La feuille de route qui suit reste valable, et le calcul se refait sans frais le jour où votre volume change.</p>
  ${candidats.length ? (() => {
    const k = candidats[0];
    const u = uniteId.get(k.id)!;
    const ht = entree.remiseGroupe ? Math.round((k.mensualite * (1 - c.parametres.REMISE_GROUPE)) / 5) * 5 : k.mensualite;
    return `<span class="etiquette">Si vous décidez de la lancer quand même, à votre demande</span>
  <table class="devis">
    <thead><tr><th>Désignation</th><th class="n">Par mois, HT</th></tr></thead>
    <tbody><tr><td>${esc(u.nom)}<span class="sous">${designation(u, ", hors recommandation")}</span></td><td class="n">${euros(k.mensualite)}</td></tr>
    ${entree.remiseGroupe ? `<tr class="remise"><td>Remise client du groupe Orbis Optima, pendant les ${E} premiers mois</td><td class="n">− ${euros(k.mensualite - ht)}</td></tr>` : ""}</tbody>
    <tfoot><tr><td>Mensualité HT</td><td class="n">${euros(ht)}</td></tr><tr class="leger"><td>TVA 20 %</td><td class="n">${euros(ht * 0.2)}</td></tr><tr><td>Mensualité TTC</td><td class="n">${euros(ht * 1.2)}</td></tr></tfoot>
  </table>
  <p class="note">Construction et surveillance comprises, rien à payer d'avance. Engagement de ${E} mois, puis résiliable avec trente jours de préavis. Devis valable jusqu'au ${dateFr(validite)}.</p>`;
  })() : ""}
</section>`;
const partie4 = c.recommandees.length === 0 ? partie4Vide : `
<section class="page">
  <p class="eyebrow">06</p>
  <h1>Le devis</h1>
  <div class="parties">
    <div><span class="etiquette">Émetteur</span><p>${LEGAL.editeur}, marque Odegia<br/>${LEGAL.siege}<br/>SIREN ${LEGAL.siren} · TVA ${LEGAL.tva}<br/>${SITE.email}</p></div>
    <div><span class="etiquette">Client</span><p>${esc(entree.client.entite)}<br/>${esc(entree.client.representant)}${entree.client.adresse ? `<br/>${esc(entree.client.adresse)}` : ""}</p></div>
    <div><span class="etiquette">Devis</span><p>N° ${esc(numero)}<br/>Émis le ${dateFr(dateRapport)}<br/>Valable jusqu'au ${dateFr(validite)}</p></div>
  </div>
  <table class="devis">
    <thead><tr><th>Désignation</th><th class="n">Par mois, HT</th></tr></thead>
    <tbody>
      ${lignesDevis}
      ${d.remisePack ? `<tr class="remise"><td>Remise de ${Math.round(c.parametres.REMISE_PACK * 100)} % dès la troisième automatisation</td><td class="n">− ${euros(d.remisePackEuros)}</td></tr>` : ""}
      ${d.remiseGroupe ? `<tr class="remise"><td>${d.remiseGroupeLibelle ? esc(d.remiseGroupeLibelle) : "Remise client du groupe Orbis Optima"}, ${Math.round(d.remiseGroupeTaux * 100)} % pendant les ${E} premiers mois</td><td class="n">− ${euros(d.remiseGroupeEuros)}</td></tr>` : ""}
      ${offert ? `<tr class="remise"><td>Diagnostic d'une valeur de ${euros(entree.diagnostic.prix)}, offert</td><td class="n">inclus</td></tr>` : ""}
    </tbody>
    <tfoot>
      <tr><td>Mensualité HT</td><td class="n">${euros(d.mensualiteHT)}</td></tr>
      <tr class="leger"><td>TVA 20 %</td><td class="n">${euros(d.tva)}</td></tr>
      <tr><td>Mensualité TTC</td><td class="n">${euros(d.mensualiteTTC)}</td></tr>
    </tfoot>
  </table>
  <div class="suivi">
    <span class="etiquette">Ce que la mensualité comprend, et sa durée</span>
    <p><strong>La construction, la supervision, la correction des dérives et les ajustements.</strong> Vous ne payez rien d'avance${c.bilanMensuel?.debutFacturation === "livraison" ? `, la première mensualité est prélevée à la première livraison, et les ${E} mois d'engagement courent à partir de là` : ", la première mensualité est prélevée à la commande"}.${d.creditDiagnostic ? ` Le diagnostic déjà réglé, ${euros(d.creditDiagnostic)}, vaut vos premières mensualités.` : ""}</p>
    <p>Engagement de ${E} mois, soit ${euros(d.engagementHT)} HT.${d.remiseGroupe ? ` À partir du treizième mois, la mensualité est de ${euros(d.mensualiteEnsuiteHT)} HT.` : ""} Ensuite vous arrêtez quand vous voulez, avec trente jours de préavis.</p>
  </div>
  <ul class="conditions">
    <li>Vos abonnements aux outils restent à votre nom et sont réglés par vous.</li>
    <li>Aucun accès à un compte bancaire ni à un moyen de paiement, y compris en lecture.</li>
    <li>Règles et limites de chaque automatisation écrites et validées avec vous avant construction.</li>
    <li>Au terme des ${E} mois d'engagement, vous pouvez reprendre vos automatisations à votre compte. Nous vous les transférons contre des frais de mise en place égaux à ${c.parametres.RACHAT_MENSUALITES} mensualités, soit ${euros(d.mensualiteEnsuiteHT * c.parametres.RACHAT_MENSUALITES)} HT. Vous assurez ensuite vous-même les corrections, mises à jour et améliorations, et la mensualité s'arrête au transfert.</li>
  </ul>
  <div class="accord"><span>Bon pour accord, date et signature</span></div>
</section>`;

/* ── 5. La feuille de route, les quatre temps du livre ─────────────────────── */
const f = c.feuilleDeRoute;
const noms = (ids: string[]) => ids.map((id) => esc(uniteId.get(id)?.nom ?? parId.get(id)!.nom));
const liste = (ids: string[]) =>
  !ids.length ? ""
  : ids.length > 4 ? `<p class="enligne">${noms(ids).join(" · ")}</p>`
  : `<ul class="puces">${noms(ids).map((n) => `<li>${n}</li>`).join("")}</ul>`;
const fmtCadence = (m: number) => (m >= 60 ? `${heures(m / 60)} h` : `${m} min`);
const semaines = (p: { debut: number; fin: number }) =>
  p.debut === p.fin ? `semaine ${p.debut}` : `semaines ${p.debut} à ${p.fin}`;
const fondations = [
  f.eliminer.length ? `<p><strong>Supprimer d'abord.</strong> Ces tâches disparaissent avant toute construction.</p>${liste(f.eliminer)}` : "",
  f.rassembler.length ? `<p><strong>Rassembler les informations</strong> aujourd'hui dispersées, dans une seule base.</p>${liste(f.rassembler)}` : "",
  f.documenter.length ? `<p><strong>Écrire les règles</strong> qui ne le sont nulle part, avant de les confier à un système ou à une personne.</p>${liste(f.documenter)}` : "",
  `<p><strong>Fixer les permissions</strong>, ce que le système envoie seul et ce qu'il vous soumet avant envoi.</p>`,
].join("");
const partie5 = `
<section class="page">
  <p class="eyebrow">04</p>
  <h1>Votre feuille de route</h1>
  ${c.definition ? `<div class="definition"><div><span class="etiquette">Ce que vous produisez</span><p>${esc(c.definition.produit)}</p></div><div><span class="etiquette">Pour qui</span><p>${esc(c.definition.pourQui)}</p></div><div><span class="etiquette">Par quel flux</span><p>${esc(c.definition.fluxDeValeur)}</p></div></div>` : ""}
  ${para(r.feuilleDeRoute)}
  ${para(r.ordre)}
  <p class="note">Délais indicatifs, comptés en semaines à partir de la signature.</p>
  <ol class="temps">
    <li><span class="rang">1</span><div><h3>Les fondations <span class="delai">${semaines(f.calendrier.socle)}</span></h3>${fondations}</div></li>
    <li><span class="rang">2</span><div><h3>La construction ${f.calendrier.briques.length ? `<span class="delai">${semaines({ debut: f.calendrier.briques[0].debut, fin: f.calendrier.briques[f.calendrier.briques.length - 1].fin })}</span>` : ""}</h3>${f.construire.length ? `<p>Dans l'ordre de la page 3.</p><ul class="puces">${f.construire.map((u) => { const cal = f.calendrier.briques.find((x) => x.id === u.id)!; return `<li>${esc(uniteId.get(u.id)!.nom)}, ${autonomie(u.niveau).toLowerCase()}, ${semaines(cal)}</li>`; }).join("")}</ul>` : "<p>Au seul calcul du temps, aucune construction ne se justifie.</p>"}${f.deleguer.length ? `<p><strong>À confier à quelqu'un</strong>, avec des instructions écrites. ${f.construire.length ? "Ces tâches restent hors de la construction, trop légères pour couvrir ce qu'elles coûteraient." : "À ce volume, leur automatisation coûterait plus qu'elle ne fait économiser."}</p>${liste(f.deleguer)}` : ""}</div></li>
    <li><span class="rang">3</span><div><h3>Le calibrage ${f.calendrier.supervision ? `<span class="delai">${semaines(f.calendrier.supervision)}</span>` : ""}</h3><p>${f.calendrier.supervision ? "Il commence dès la première livraison, pendant que la suite se construit, une semaine de mise en place puis quatre de rodage. " : ""}Tout passe par votre validation, et chaque retouche que vous faites sert à modifier et améliorer les règles, jusqu'à ce que le système produise ce que vous auriez fait.</p></div></li>
    <li><span class="rang">4</span><div><h3>La supervision allégée ${f.calendrier.calibrage ? `<span class="delai">dès la semaine ${f.calendrier.calibrage}, en continu</span>` : ""}</h3><p>${f.fileExceptions.length ? "Ce qui attend encore votre accord arrive dans une seule file, au lieu d'être éparpillé dans vos mails. " : ""}Un tableau montre ce qui tourne. Vous le regardez ${[[f.cadence.jour, "par jour"], [f.cadence.semaine, "par semaine"], [f.cadence.mois, "par mois"]].filter(([m]) => (m as number) > 0).map(([m, u]) => `${fmtCadence(m as number)} ${u}`).join(", ")}, et nous corrigeons les écarts mineurs au fil de l'eau.</p></div></li>
  </ol>
  ${f.aVotreMain.length ? `<p class="note"><strong>Reste à votre main, par choix.</strong> ${noms(f.aVotreMain).join(" · ")}</p>` : ""}
</section>`;

/* ── 0. En bref ────────────────────────────────────────────────────────────── */
/* Demande d Adib du 19/10/2026. Une page qui dit tout le rapport en trois
   etapes flechees et peu de mots, ce que l administratif coute, ce qu Odegia
   apporte, ce qu Odegia coute, puis le gain net. Tout se lit par mois, une
   seule unite pour comparer. Les chiffres sont ceux des pages suivantes. */
const coutMois = (proj ? c.totaux.coutAnnuelMesure : c.totaux.coutAnnuel) / 12;
const impayesMois = c.totaux.perteAnnuelleMesuree / 12;
const etapeResume = (n: string, titre: string, valeur: string, legende: string, ton = "") =>
  `<div class="resume-etape ${ton}"><span class="resume-n">${n}</span><span class="etiquette">${titre}</span><span class="resume-valeur">${valeur}</span><span class="legende">${legende}</span></div>`;
const fleche = `<span class="resume-fleche">→</span>`;
const fdr = c.feuilleDeRoute.calendrier;
/* Barres des cartes, meme echelle pour les trois, demande d Adib du
   19/10/2026. Le temps et l argent ont chacun leur couleur, pour que la carte 2
   montre a la fois le temps economise et les revenus recuperes. */
const tempsAujourdhui = coutMois;
const echelle = Math.max(tempsAujourdhui + impayesMois, b ? b.valeur : 0, b ? b.mensualite + b.outils : 0, 1);
const barre = (segments: { v: number; cls: string }[]) =>
  `<div class="barre">${segments.filter((x) => x.v > 0.5).map((x) => `<span class="${x.cls}" style="width:${(100 * x.v / echelle).toFixed(1)}%"></span>`).join("")}</div>`;
const legende = `<div class="legende-barres"><span><i class="seg-temps"></i>Temps administratif</span><span><i class="seg-argent"></i>Revenus, impayés</span><span><i class="seg-odegia"></i>Odegia</span></div>`;
/* Frise de trois mois, une ligne par temps, semaines en abscisse. */
const SEMAINES_FRISE = 13;
const ligneFrise = (nom: string, debut: number, fin: number, continu = false) =>
  `<div class="frise-ligne"><span class="frise-nom">${nom}</span><div class="frise-piste"><span class="frise-barre ${continu ? "frise-continu" : ""}" style="left:${(100 * (debut - 1) / SEMAINES_FRISE).toFixed(1)}%;width:${(100 * (Math.min(fin, SEMAINES_FRISE) - debut + 1) / SEMAINES_FRISE).toFixed(1)}%">${continu ? "en continu →" : `sem. ${debut}${fin > debut ? ` à ${fin}` : ""}`}</span></div></div>`;
const resume0 = `
<section class="page">
  <header class="entete">
    <img src="data:image/png;base64,${logo}" alt="Odegia" class="logo" />
    <div class="meta">
      <span>Diagnostic administratif</span>
      <span>${esc(entree.client.entite)}</span>
      <span>${dateFr(dateRapport)}</span>
    </div>
  </header>
  <p class="eyebrow">En bref</p>
  <h1>Votre diagnostic sur une page</h1>
  <div class="resume">
    ${etapeResume("1", "Ce que vous coûte l'administratif", `${euros(tempsAujourdhui + impayesMois)}`, `par mois aujourd'hui, ${euros(tempsAujourdhui)} de votre temps, ${heures(proj ? c.totaux.heuresMoisMesure : c.totaux.heuresMois)} h${impayesMois > 0.5 ? `, et ${euros(impayesMois)} d'impayés` : ""}`) .replace("</div>", `${barre([{ v: tempsAujourdhui, cls: "seg-temps" }, { v: impayesMois, cls: "seg-argent" }])}</div>`)}
    ${fleche}
    ${b ? etapeResume("2", "Ce qu'Odegia vous apporte", `${euros(b.valeur)}`, `par mois, ${heures(b.heures)} h et ${euros(b.valeur - b.encaissement)} de temps économisés${enc ? `, et ${euros(b.encaissement)} de revenus récupérés grâce aux relances` : ""}`, "resume-vert").replace("</div>", `${barre([{ v: b.valeur - b.encaissement, cls: "seg-temps" }, { v: b.encaissement, cls: "seg-argent" }])}</div>`) : etapeResume("2", "Ce qu'Odegia vous apporte", "—", "aucune automatisation ne se justifie à ce volume")}
    ${fleche}
    ${b ? etapeResume("3", "Ce qu'Odegia vous coûte", `${euros(b.mensualite + b.outils)}`, `par mois${b.ttc ? " TTC, la TVA comprise puisque vous ne la récupérez pas" : ""}${b.ensuite !== b.mensualite ? `, la première année, puis ${euros(b.ensuite + b.outils)}` : ""}, rien à payer d'avance${c.outils.liste.length ? (b.outils > 0.5 ? `, dont ${euros(b.outils)} d'outils à votre nom` : ", vos outils ne vous coûtent rien de plus") : ""}`).replace("</div>", `${barre([{ v: b.mensualite + b.outils, cls: "seg-odegia" }])}</div>`) : etapeResume("3", "Ce qu'Odegia vous coûte", "0 €", "le diagnostic est offert")}
  </div>
  ${b ? legende : ""}
  ${b ? `<div class="resume-net ${b.solde >= 0 ? "" : "resume-negatif"}"><span>Ce que vous gagnez, une fois en service</span><strong>${solde(b.solde)} net par mois</strong>${b.ensuite !== b.mensualite ? `<span>puis ${solde(hausse ? bProj!.valeur - bProj!.ensuite - bProj!.outils : ensuiteNet(bProj!))} par mois sur les ${c.parametres.ENGAGEMENT_MOIS} mois suivants${hausse ? ", selon votre estimation" : ""}</span>` : ""}${b.nouveauxClients ? `<span class="resume-an1">${Math.ceil(b.nouveauxClients.an1)} nouveaux ${esc(b.nouveauxClients.mot)} de plus dans l'année, et votre première année Odegia est payée.</span>` : ""}</div>` : ""}
  ${c.positions.length ? `<div class="resume-bloc"><span class="etiquette">Ce qui s'automatise</span><ul class="resume-chips">${c.positions.map((p) => `<li>${esc(uniteId.get(p.id)!.nom)}</li>`).join("")}</ul></div>` : ""}
  ${fdr.briques.length ? `<div class="resume-bloc"><span class="etiquette">Comment ça se passe, sur trois mois</span><div class="frise">
    <div class="frise-ligne frise-mois"><span class="frise-nom"></span><div class="frise-piste"><span style="left:0;width:30.8%">Mois 1</span><span style="left:30.8%;width:30.8%">Mois 2</span><span style="left:61.5%;width:38.5%">Mois 3</span></div></div>
    ${ligneFrise("Fondations", fdr.socle.debut, fdr.socle.fin)}
    ${ligneFrise("Construction", fdr.briques[0].debut, fdr.briques[fdr.briques.length - 1].fin)}
    ${fdr.supervision ? ligneFrise("Calibrage", fdr.supervision.debut, fdr.supervision.fin) : ""}
    ${fdr.calibrage ? ligneFrise("Supervision allégée", fdr.calibrage, SEMAINES_FRISE, true) : ""}
  </div></div>` : ""}
</section>`;

const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8" />
<title>Diagnostic Odegia, ${esc(entree.client.entite)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@700;800&family=Geist:wght@400;500;600&family=Geist+Mono:wght@500&display=swap" rel="stylesheet" />
<style>
  :root { --ink:#1f2222; --soft:#5c6462; --vert:#0f7a5c; --vert-soft:#e3f7ef; --menthe:#6fdcb8; --rose:#b02472; --rose-soft:#fbeaf3; --banane:#f5d130; --alt:#f3f7f5; }
  @page { size: A4; margin: 16mm 16mm 20mm; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin:0; background:#fff; color:var(--ink); font: 10pt/1.55 "Geist", system-ui, sans-serif; }
  .page { break-after: page; }
  .page:last-child { break-after: auto; }
  .entete { display:flex; justify-content:space-between; align-items:center; padding-bottom:10mm; border-bottom:2px solid var(--ink); margin-bottom:10mm; }
  .logo { height: 11mm; }
  .meta { display:flex; flex-direction:column; align-items:flex-end; font: 500 7.5pt/1.5 "Geist Mono", monospace; text-transform:uppercase; letter-spacing:.12em; color:var(--soft); }
  .eyebrow { font: 500 8pt "Geist Mono", monospace; letter-spacing:.16em; color:var(--vert); margin:0 0 2mm; }
  h1 { font: 800 24pt/1.08 "Outfit", sans-serif; letter-spacing:-.03em; margin:0 0 6mm; text-wrap:balance; }
  h3 { font: 600 11pt/1.3 "Geist", sans-serif; margin:0; }
  .prose { max-width: 150mm; margin: 0 0 6mm; }
  .note { color:var(--soft); font-size:8.5pt; max-width:150mm; margin:5mm 0 0; }
  .chiffres { display:grid; grid-template-columns:repeat(3,1fr); gap:5mm; margin:2mm 0 8mm; }
  .carte { border:2px solid var(--ink); border-radius:14px; padding:5mm; box-shadow:4px 4px 0 var(--ink); display:flex; flex-direction:column; gap:1mm; }
  .carte:first-child { background:var(--vert-soft); }
  .valeur { font: 800 20pt/1 "Outfit", sans-serif; letter-spacing:-.02em; font-variant-numeric: tabular-nums; }
  .legende { font-size:8pt; color:var(--soft); }
  table { width:100%; border-collapse:collapse; font-variant-numeric: tabular-nums; }
  th { text-align:left; font: 500 7.5pt "Geist Mono", monospace; text-transform:uppercase; letter-spacing:.1em; color:var(--soft); border-bottom:2px solid var(--ink); padding:2mm 2mm; }
  td { padding:2.2mm 2mm; border-bottom:1px solid #dfe5e2; vertical-align:top; }
  tfoot td { font-weight:600; border-bottom:none; border-top:2px solid var(--ink); }
  .n { text-align:right; white-space:nowrap; }
  .verdicts + .prose { margin-top:6mm; }
  .verdicts { display:grid; grid-template-columns:1fr 1fr; gap:4mm; }
  .verdict { border:2px solid var(--ink); border-radius:14px; padding:4mm 4.5mm; break-inside:avoid; }
  .verdict p { margin:1.5mm 0 0; font-size:9pt; color:var(--soft); }
  .verdict-tete { display:flex; justify-content:space-between; gap:3mm; align-items:flex-start; }
  .verdict .mode { font: 500 7.5pt "Geist Mono", monospace; text-transform:uppercase; letter-spacing:.08em; color:var(--vert); }
  .chip { flex-shrink:0; font: 600 7.5pt/1 "Geist", sans-serif; padding:1.6mm 2.4mm; border-radius:99px; border:1.5px solid var(--ink); white-space:nowrap; }
  .chip-vert { background:var(--menthe); }
  .chip-rose { background:var(--rose-soft); color:var(--rose); border-color:var(--rose); }
  .chip-ink { background:var(--ink); color:#fff; }
  .chip-gris { background:var(--alt); color:var(--soft); border-color:var(--soft); }
  .accroche { background:var(--banane); border:2px solid var(--ink); border-radius:18px; box-shadow:6px 6px 0 var(--ink); padding:7mm 8mm; margin:0 0 9mm; }
  .accroche p { margin:0; font: 700 17pt/1.25 "Outfit", sans-serif; letter-spacing:-.01em; }
  .accroche strong { font-weight:800; }
  .accroche-neutre { background:var(--alt); box-shadow:4px 4px 0 var(--ink); }
  .accroche-neutre p { font-size:13pt; }
  .ordre { list-style:none; padding:0; margin:0 0 6mm; display:flex; flex-direction:column; gap:4mm; }
  .etape { display:flex; gap:4mm; align-items:flex-start; border-bottom:1px solid #dfe5e2; padding-bottom:4mm; }
  .rang { flex-shrink:0; width:9mm; height:9mm; border-radius:99px; border:2px solid var(--ink); display:flex; align-items:center; justify-content:center; font: 600 9pt "Geist Mono", monospace; background:var(--vert-soft); }
  .etape:first-child .rang { background:var(--banane); }
  .ligne-chiffres { margin:1mm 0 0; font-size:8.5pt; color:var(--soft); font-variant-numeric: tabular-nums; }
  .parties { display:grid; grid-template-columns:1.3fr 1fr 1fr; gap:5mm; margin-bottom:7mm; font-size:8.5pt; }
  .parties p { margin:1mm 0 0; }
  .etiquette { font: 500 7pt "Geist Mono", monospace; text-transform:uppercase; letter-spacing:.12em; color:var(--soft); }
  .sous { display:block; font-size:8pt; color:var(--soft); }
  .remise td { color:var(--vert); }
  .leger td { font-weight:400; border-top:none; color:var(--soft); }
  .suivi { margin:7mm 0 5mm; border:2px solid var(--ink); border-radius:14px; padding:4mm 5mm; background:var(--vert-soft); }
  .suivi p { margin:1mm 0 0; }
  .conditions { margin:0; padding-left:4.5mm; font-size:8.5pt; color:var(--soft); }
  .carte .etiquette { margin-bottom:1mm; }
  .plafond { margin:4mm 0 0; border-left:3px solid var(--banane-deep, #d4ae0a); background:#fdf8e1; padding:2.5mm 4mm; border-radius:0 10px 10px 0; }
  .plafond p { margin:1mm 0 0; font-size:8.6pt; line-height:1.5; }
  .carte-passe { background:var(--alt) !important; }
  .carte-passe + .carte { background:var(--vert-soft); }
  td.passe { color:var(--soft); }
  table.cout td:nth-child(2), table.cout td:nth-child(3) { white-space:nowrap; }
  table.cout th { white-space:nowrap; }
  table.dense td { padding:1.3mm 2mm; font-size:8.8pt; }
  table.orientations td { vertical-align:top; }
  table.orientations td:first-child { width:42%; }
  table.orientations td:last-child { color:var(--soft); font-size:8.3pt; }
  tr.groupe td { font: 500 7.5pt "Geist Mono", monospace; text-transform:uppercase; letter-spacing:.1em; color:var(--vert); border-bottom:2px solid var(--ink); padding-top:4mm; }
  .enligne { margin:1mm 0 0; font-size:8.2pt; line-height:1.45; color:var(--soft); }
  table.candidats { margin:0 0 3mm; }
  .note + .prose { margin-top:5mm; }
  table.candidats td:first-child { width:34%; }
  .bilan { border:2px solid var(--ink); border-radius:14px; padding:4mm 5mm; margin:0 0 7mm; box-shadow:4px 4px 0 var(--ink); }
  .bilan-grille { display:grid; grid-template-columns:repeat(4,1fr); gap:4mm; margin-top:2mm; }
  .bilan-grille > div { display:flex; flex-direction:column; gap:1mm; }
  .bilan-grille .valeur { font-size:17pt; }
  .bilan-grille .positif .valeur { color:var(--vert); }
  .bilan-grille .negatif .valeur { color:var(--rose); }
  .bilan .note { margin-top:3mm; }
  .delai { font: 500 7.5pt "Geist Mono", monospace; letter-spacing:.08em; text-transform:uppercase; color:var(--vert); margin-left:2mm; }
  .definition { display:grid; grid-template-columns:repeat(3,1fr); gap:4mm; border:2px solid var(--ink); border-radius:14px; padding:3mm 4mm; margin:0 0 4mm; background:var(--alt); font-size:9pt; }
  .definition p { margin:1mm 0 0; }
  .temps { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:3mm; }
  .temps > li { display:flex; gap:4mm; align-items:flex-start; border-bottom:1px solid #dfe5e2; padding-bottom:3mm; break-inside:avoid; }
  .temps p { margin:1.2mm 0 0; font-size:9.2pt; }
  .puces { margin:1mm 0 0; padding-left:4.5mm; font-size:9pt; color:var(--soft); }
  /* Devis resserre le 17/10/2026, avec trois briques et deux remises la case de
     signature passait sur une page blanche. */
  table.devis td { padding:1.6mm 2mm; }
  /* Page de resume. */
  .resume { display:flex; align-items:stretch; gap:2mm; margin:4mm 0 5mm; }
  .resume-etape { flex:1; border:2px solid var(--ink); border-radius:14px; padding:4.5mm; box-shadow:4px 4px 0 var(--ink); display:flex; flex-direction:column; gap:1.5mm; background:#fff; }
  .resume-vert { background:var(--vert-soft); }
  .resume-n { font: 800 11pt "Outfit", sans-serif; width:7mm; height:7mm; border-radius:50%; border:2px solid var(--ink); display:flex; align-items:center; justify-content:center; background:var(--banane); }
  .resume-valeur { font: 800 22pt/1 "Outfit", sans-serif; letter-spacing:-.02em; font-variant-numeric: tabular-nums; }
  .resume-fleche { align-self:center; font: 800 18pt "Outfit", sans-serif; }
  .resume-net { border:2px solid var(--ink); border-radius:14px; background:var(--banane); box-shadow:4px 4px 0 var(--ink); padding:5mm 6mm; display:flex; align-items:baseline; gap:4mm; flex-wrap:wrap; margin-bottom:7mm; }
  .resume-net strong { font: 800 22pt/1 "Outfit", sans-serif; }
  .resume-net span { font-size:9pt; }
  .resume-negatif { background:var(--rose-soft); }
  .resume-an1 { flex-basis:100%; font-size:8.5pt; }
  .resume-bloc { margin-bottom:6mm; }
  .resume-chips { list-style:none; padding:0; margin:2mm 0 0; display:flex; flex-wrap:wrap; gap:2mm; }
  .resume-chips li { border:1.5px solid var(--ink); border-radius:999px; padding:1.2mm 3.5mm; font-size:8.5pt; background:var(--vert-soft); }
  .resume-temps { display:flex; align-items:stretch; gap:2mm; margin-top:2mm; }
  .resume-temps > div { flex:1; border:1.5px solid var(--ink); border-radius:10px; padding:2.5mm 3mm; display:flex; flex-direction:column; gap:.5mm; }
  .resume-temps strong { font-size:9pt; }
  .resume-temps > div span { font: 500 7pt "Geist Mono", monospace; text-transform:uppercase; letter-spacing:.08em; color:var(--vert); }
  /* Barres et frise de la page En bref. */
  .barre { display:flex; height:4mm; margin-top:auto; border:1.5px solid var(--ink); border-radius:3px; overflow:hidden; background:#fff; }
  .barre span { display:block; height:100%; }
  .seg-temps, .legende-barres i.seg-temps { background:var(--vert); }
  .seg-argent, .legende-barres i.seg-argent { background:#e8590c; }
  .seg-odegia, .legende-barres i.seg-odegia { background:var(--ink); }
  .legende-barres { display:flex; gap:6mm; font-size:8pt; color:var(--soft); margin:-1mm 0 5mm; }
  .legende-barres span { display:flex; align-items:center; gap:1.5mm; }
  .legende-barres i { display:inline-block; width:3mm; height:3mm; border-radius:1px; }
  .frise { display:flex; flex-direction:column; gap:1.5mm; margin-top:2mm; }
  .frise-ligne { display:grid; grid-template-columns:32mm 1fr; align-items:center; }
  .frise-nom { font-size:8.5pt; font-weight:600; }
  .frise-piste { position:relative; height:6mm; background:var(--alt); border-radius:3px; }
  .frise-mois .frise-piste { background:none; height:4mm; }
  .frise-mois .frise-piste span { position:absolute; top:0; font: 500 6.5pt "Geist Mono", monospace; text-transform:uppercase; letter-spacing:.08em; color:var(--soft); border-left:1px solid #c9d2cf; padding-left:1.5mm; }
  .frise-barre { position:absolute; top:0; height:100%; border:1.5px solid var(--ink); border-radius:3px; background:var(--menthe); font: 500 6.5pt "Geist Mono", monospace; text-transform:uppercase; letter-spacing:.06em; display:flex; align-items:center; padding-left:1.5mm; white-space:nowrap; overflow:hidden; }
  .frise-continu { background:var(--banane); }
  .flux-icone { color:var(--vert); display:flex; }
  .flux-vous { background:var(--banane) !important; }
  /* Schema flechee des taches enchainees, page 3. */
  .flux { display:flex; align-items:stretch; gap:1.5mm; margin:2.5mm 0 2mm; }
  .flux-etape { flex:1; border:1.5px solid var(--ink); border-radius:9px; padding:2mm 2.5mm; background:var(--vert-soft); display:flex; flex-direction:column; justify-content:space-between; gap:1mm; }
  .flux-nom { font: 600 8.5pt/1.25 "Geist", sans-serif; }
  .flux-mode { font: 500 6.5pt "Geist Mono", monospace; text-transform:uppercase; letter-spacing:.08em; color:var(--vert); }
  .flux-fleche { align-self:center; font: 800 13pt "Outfit", sans-serif; color:var(--ink); }
  .accord { margin-top:5mm; border:1.5px dashed var(--soft); border-radius:12px; height:22mm; padding:3mm 4mm; font: 500 7pt "Geist Mono", monospace; text-transform:uppercase; letter-spacing:.12em; color:var(--soft); width:80mm; margin-left:auto; }
</style></head>
<body>${resume0}${partie1}${partie2}${partie3}${partie5}${partie5Gain}${partie4}</body></html>`;

/* Tutoiement pour un client que le fondateur tutoie, decision d Adib du
   19/10/2026. Toute phrase restee au vouvoiement est signalee. */
const htmlFinal = (entree as { tutoiement?: boolean }).tutoiement ? tutoyer(html) : html;
if ((entree as { tutoiement?: boolean }).tutoiement) {
  const restes = restesVouvoiement(htmlFinal);
  if (restes.length) console.error(["VOUVOIEMENT RESTANT", ...restes.map((x) => `- ${x}`)].join("\n"));
}
writeFileSync(join(dossier, "rapport.html"), htmlFinal, "utf-8");

/* ── Etalon, pour Odegia seulement ───────────────────────────────────────── */
const pct = (x: number | null) => (x === null ? "" : `${x > 0 ? "+" : ""}${Math.round(x * 100)} %`);
const etalon = [
  `# Etalon, ${entree.client.entite}, ${entree.dateEntretien}, methode v${c.methode}`,
  "",
  "Document interne, jamais remis au client. Il confronte les baremes supposes de l estimateur a ce que l entretien a mesure.",
  "",
  "| Tache | Catalogue | Bande | Bareme h/mois | Mesure active h/mois | Ecart |",
  "|---|---|---|---|---|---|",
  ...c.lignes.map(
    (l) =>
      `| ${l.nom} | ${l.catalogue ?? "nouvelle"} | ${l.bande ?? ""} | ${l.heuresBareme === null ? "" : heures(l.heuresBareme)} | ${heures(l.heuresActivesMois)} | ${pct(l.ecartBareme)} |`
  ),
  "",
  "## Coherence de l inventaire",
  "",
  c.coherence
    ? `Heures declarees ${Math.round(c.coherence.declarees)} h par an, inventaire ${Math.round(c.coherence.inventaire)} h, ecart ${pct(c.coherence.ecart)}. ${c.coherence.aReprendre ? "**Au-dela de 25 %, inventaire a reprendre avant selection.**" : "Dans la tolerance de 25 %."}`
    : "Non renseignee, champs heuresDeclareesSemaine et inventaireHeuresAn.",
  ...(c.parcoursTropCourts.length ? ["", `Parcours de moins de ${3} taches traites en briques separees, ${c.parcoursTropCourts.join(", ")}.`] : []),
  "",
  "## Temps passe sur ce diagnostic",
  "",
  ...(entree.chrono
    ? [
        "| Etape | Minutes |",
        "|---|---|",
        ...Object.entries(entree.chrono).map(([k, v]) => `| ${k} | ${v} |`),
        `| **total** | **${Object.values(entree.chrono).reduce((s, v) => s + v, 0)}** |`,
        "",
        `Diagnostic d une valeur de ${entree.diagnostic.prix} EUR${entree.diagnostic.offert ? ", offert" : ""}, soit ${Math.round(
          entree.diagnostic.prix /
            (Object.values(entree.chrono).reduce((s, v) => s + v, 0) / 60)
        )} EUR de l heure passee${entree.diagnostic.offert ? ", a regagner sur les mensualites" : ""}.`,
      ]
    : ["Chronometrage non renseigne dans entree.json, champ chrono."]),
  "",
  "## Points de regle a surveiller",
  "",
  ...c.lignes
    .filter((l) => l.paliersMontes)
    .map((l) => `- ${l.nom} monte d un palier, un seul non aux questions de prix. Regle proposee, a valider.`),
  ...(c.agaceEcartee ? ["- La tache la plus agacante est restee hors tete, son solde mensuel est a plus de dix pour cent sous le meilleur. Le rapport doit l expliquer."] : []),
  ...(c.aucuneRecommandation ? ["- Aucune brique recommandee, rien ne rend plus que sa mensualite. Pas de devis, sauf a la demande du client."] : []),
  "",
  `Catalogue de reference, ${TACHES.length} taches de lib/estimator.ts.`,
].join("\n");
writeFileSync(join(dossier, "etalon.md"), etalon, "utf-8");

console.log(
  JSON.stringify(
    {
      heuresMois: Math.round(c.totaux.heuresMois * 10) / 10,
      coutAnnuel: Math.round(c.totaux.coutAnnuel),
      recommandees: c.recommandees,
      gainNetTete: c.gainNetTete === null ? null : Math.round(c.gainNetTete),
      mensualiteHT: c.devis.mensualiteHT,
      mensualiteEnsuiteHT: c.devis.mensualiteEnsuiteHT,
      engagementHT: c.devis.engagementHT,
      ecrit: ["calcul.json", "rapport.html", "etalon.md"],
    },
    null,
    2
  )
);
