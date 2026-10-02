/* Produit le rapport de diagnostic a partir d un dossier client.

     node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/diagnostic/rapport.mts "<dossier>"

   Le dossier contient entree.json, rempli par le skill diagnostic-odegia a
   partir du formulaire et des fiches d entretien. Le script y ecrit
   calcul.json, rapport.html et etalon.md, puis pdf.py transforme le HTML en
   PDF. Les nombres viennent tous de calcul.mts, la prose de entree.json.

   Quatre parties, dans l ordre de la fiche du vault, partie F. */

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { diagnostiquer, type Entree, type LigneDiag } from "./calcul.mts";
import { NOM_PALIER, TACHES, euros, heures } from "../../lib/estimator.ts";
import { LEGAL, SITE } from "../../lib/content.ts";

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
const pastille = (l: LigneDiag) => {
  if (dansParcours(l)) return `<span class="chip chip-vert">Parcours</span>`;
  switch (l.verdict) {
    case "supprimer":
      return `<span class="chip chip-ink">À supprimer</span>`;
    case "jugement":
      return `<span class="chip chip-rose">Reste à votre main</span>`;
    case "sur-devis":
      return `<span class="chip chip-ink">Sur devis</span>`;
    default:
      return l.absorbee
        ? `<span class="chip chip-gris">Volume trop faible</span>`
        : `<span class="chip chip-vert">Brique ${NOM_PALIER[l.palier!]}</span>`;
  }
};
const mode = (l: LigneDiag) =>
  l.verdict !== "brique"
    ? ""
    : l.niveau === 3
      ? "Vous validez avant envoi"
      : "Part seule";

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
  `<tr><td>${esc(l.nom)}</td><td>${frequence(l.frequenceRetenue)}${l.plafonnee ? "*" : ""}</td><td>${duree(l.dureeMinutes)}</td>${proj ? `<td class="n passe">${heures(l.heuresMoisMesure)}</td>` : ""}<td class="n">${heures(l.heuresMois)}</td><td class="n">${euros(l.coutAnnuel)}</td></tr>`;
const partie1 = `
<section class="page">
  <header class="entete">
    <img src="data:image/png;base64,${logo}" alt="Odegia" class="logo" />
    <div class="meta">
      <span>Diagnostic administratif</span>
      <span>${esc(entree.client.entite)}</span>
      <span>${dateFr(dateRapport)}</span>
      <span>Méthode v${c.methode}</span>
    </div>
  </header>
  <p class="eyebrow">01</p>
  <h1>Ce que votre administratif vous coûte${proj ? ", et ce qu'il vous coûtera" : ""}</h1>
  ${para(r.synthese)}
  <div class="chiffres">${cartes}
  </div>
  <table class="cout ${c.lignes.length > 12 ? "dense" : ""}">
    <thead><tr><th>Tâche</th><th>Rythme</th><th>Durée</th>${proj ? `<th class="n">Auj. h/mois</th><th class="n">À venir h/mois</th><th class="n">À venir €/an</th>` : `<th class="n">h / mois</th><th class="n">€ / an</th>`}</tr></thead>
    <tbody>
      ${parCout.slice(0, reste.length ? MAX_LIGNES_COUT : parCout.length).map(ligneCout).join("")}
      ${reste.length ? `<tr><td colspan="3">${reste.length} autres tâches, chacune sous ${heures(reste[0].heuresMois)} h par mois, détaillées page 2</td>${proj ? `<td class="n passe">${heures(somme(reste, "heuresMoisMesure"))}</td>` : ""}<td class="n">${heures(somme(reste, "heuresMois"))}</td><td class="n">${euros(somme(reste, "coutAnnuel"))}</td></tr>` : ""}
    </tbody>
    <tfoot><tr><td colspan="3">Total</td>${proj ? `<td class="n passe">${heures(c.totaux.heuresMoisMesure)}</td>` : ""}<td class="n">${heures(c.totaux.heuresMois)}</td><td class="n">${euros(c.totaux.coutAnnuel)}</td></tr></tfoot>
  </table>
  ${encadrePlafond}
  ${encadrePlafond ? "" : `<p class="note">Durées relevées avec vous${c.lignes.some((l) => (l.bascule ?? 0) > 0) ? ", temps pour s'y remettre et s'en défaire compris" : ""}. ${proj ? "Les pages suivantes se calculent sur les douze prochains mois." : "Le coût est celui du temps passé, avant toute automatisation."}</p>`}
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
        route === "automatiser" ? (dansParcours(l) ? "dans le parcours" : `brique ${NOM_PALIER[l.palier!]}`) : "",
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
</section>`;
const partie2 = c.lignes.length > 8 ? partie2Dense : `
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
      ${mode(l) && c.orientations.find((x) => x.id === l.id)!.route === "automatiser" ? `<p class="mode">${mode(l)}${l.parcours && c.unites.some((u) => u.id === l.parcours) ? `, dans le parcours ${esc(entree.parcours?.[l.parcours] ?? l.parcours)}` : ""}</p>` : ""}
      ${l.motif ? `<p>${esc(l.motif)}</p>` : ""}
    </article>`
      )
      .join("")}
  </div>
  ${c.lignes.some((l) => l.cadrage && l.verdict === "brique") ? para(r.cadrage) : ""}
</section>`;

/* ── 3. L ordre dans lequel s y prendre ──────────────────────────────────── */
const tete = c.tete ? uniteId.get(c.tete)! : null;
const accroche = !tete
  ? `<div class="accroche accroche-neutre"><p>Au seul calcul du temps, aucune automatisation ne se justifie aujourd'hui.</p></div>`
  : `<div class="accroche"><p>${tete.parcours ? "Votre parcours" : "Votre première brique"} vous laisse <strong>${euros(c.gainNetTete ?? 0)} par mois</strong>, mensualité payée.</p></div>`;

/* Sans automatisation recommandee, les chiffres des plus proches, pour que le
   client decide lui-meme s il passe outre. */
const candidats = c.candidats.filter((k) => !k.recommande);
const solde = (n: number) => `${n >= 0 ? "+" : "−"} ${euros(Math.abs(n))}`;
const tableCandidats = !tete && candidats.length ? `
  <table class="dense candidats">
    <thead><tr><th>Automatisation possible</th><th class="n">H rendues / mois</th><th class="n">Temps rendu / mois</th><th class="n">Mensualité</th><th class="n">Solde</th><th class="n">Seuil</th></tr></thead>
    <tbody>${candidats.map((k) => `<tr><td>${esc(uniteId.get(k.id)!.nom)}</td><td class="n">${heures(k.heuresRecuperees)} h</td><td class="n">${euros(k.gainMensuel)}</td><td class="n">${euros(k.mensualite)}</td><td class="n">${solde(k.netMensuel)}</td><td class="n">${k.heuresSeuil === null ? "" : `${heures(k.heuresSeuil)} h`}</td></tr>`).join("")}</tbody>
  </table>
  <p class="note">Solde, le temps rendu chaque mois moins la mensualité. Seuil, les heures rendues par mois à partir desquelles la mensualité est couverte. Sur deux ans, la première coûte ${euros(candidats[0].cout24)} et rend ${euros(candidats[0].rendu24)} de temps.</p>
  <p class="prose">Ce calcul ne compte que le temps. Il ignore la charge mentale d'une tâche qui revient, et ce que vous feriez des heures libérées. Si ces deux coûts pèsent plus lourd pour vous, vous pouvez lancer une automatisation quand même, en connaissance de cause. Le devis correspondant est en page 4.</p>` : "";

/* Chaque mois, ce que le client recupere et ce qu il paie. C est la
   comparaison qu il fait de tete, autant la lui donner. */
const b = c.bilanMensuel;
const bilan = b ? `
  <div class="bilan">
    <span class="etiquette">${b.recommande ? "Chaque mois, une fois en service" : `Si vous lanciez ${esc(uniteId.get(c.candidats[0].id)!.nom.toLowerCase())} quand même, chaque mois`}</span>
    <div class="bilan-grille">
      <div><span class="valeur">${heures(b.heures)} h</span><span class="legende">de temps rendu</span></div>
      <div><span class="valeur">${euros(b.valeur)}</span><span class="legende">valeur de ce temps</span></div>
      <div><span class="valeur">${euros(b.mensualite)}</span><span class="legende">de mensualité, construction et surveillance comprises${b.ensuite !== b.mensualite ? `, puis ${euros(b.ensuite)} après ${c.parametres.ENGAGEMENT_MOIS} mois` : ""}</span></div>
      <div class="${b.solde >= 0 ? "positif" : "negatif"}"><span class="valeur">${solde(b.solde)}</span><span class="legende">de solde, temps rendu moins ce que vous payez</span></div>
    </div>
    <p class="note">Sur trois ans, ${euros(b.valeurHorizon)} de temps rendu pour ${euros(b.coutHorizon)} de mensualités. Vous ne payez rien d'avance pour la construction.</p>
  </div>` : "";

const partie3 = `
<section class="page">
  <p class="eyebrow">03</p>
  <h1>L'ordre dans lequel s'y prendre</h1>
  ${accroche}
  ${bilan}
  ${tableCandidats}
  <ol class="ordre">
    ${c.positions
      .map((p, i) => {
        const l = uniteId.get(p.id)!;
        return `<li class="etape">
        <span class="rang">${i + 1}</span>
        <div>
          <h3>${esc(l.nom)}</h3>
          ${l.parcours ? `<p class="ligne-chiffres">Regroupe ${l.taches.map((t) => { const n = parId.get(t)!.nom; return esc(n.charAt(0).toLowerCase() + n.slice(1)); }).join(", ")}</p>` : ""}
          <p class="ligne-chiffres">${heures(l.heuresRecuperees)} h rendues par mois · ${euros(l.gainMensuel)} de temps par mois · mensualité ${euros(p.mensualite)} · solde ${solde(p.gainNetMensuel)}</p>
        </div>
      </li>`;
      })
      .join("")}
  </ol>
  ${para(r.ordre)}
  ${c.suivantes.length ? `<p class="note">Ensuite, ${c.suivantes.map((id) => esc(uniteId.get(id)!.nom)).join(", ")}. Elles se reconsidèrent une fois les trois premières en service.</p>` : ""}
  ${para(r.ensuite)}
  <p class="note">Temps rendu calculé à ${Math.round(c.parametres.PART_RECUPERABLE * 100)} % du temps relevé, le reste couvre le contrôle et les cas particuliers. Le solde est la valeur de ce temps moins la mensualité.${proj ? ` Il se calcule sur les douze prochains mois tels que vous les estimez, plafonnés à ${c.parametres.PLAFOND_PROJECTION} fois le volume mesuré.` : ""}</p>
</section>`;

/* ── 4. Ce que ca coute, le devis ────────────────────────────────────────── */
const d = c.devis;
const designation = (u: { parcours: boolean; palier: keyof typeof NOM_PALIER; niveau: 3 | 4 }, suite = "") =>
  `${u.parcours ? "Parcours" : "Brique"} ${NOM_PALIER[u.palier]}, ${u.niveau === 3 ? "validation avant envoi" : "exécution autonome"}${suite}`;
const lignesDevis = c.recommandees
  .map((id) => {
    const l = uniteId.get(id)!;
    return `<tr><td>${esc(l.nom)}<span class="sous">${designation(l)}</span></td><td class="n">${euros(l.mensualite)}</td></tr>`;
  })
  .join("");
const numero = entree.devis?.numero ?? "à attribuer";
const E = c.parametres.ENGAGEMENT_MOIS;
const R = c.parametres.RACHAT_MENSUALITES;

/* Rien a construire, pas de devis. La page dit ce qui se passe pour le
   diagnostic, offert, ou rembourse s il avait ete paye. */
const offert = !!entree.diagnostic.offert;
const partie4Vide = `
<section class="page">
  <p class="eyebrow">04</p>
  <h1>Ce que ça coûte</h1>
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
  <p class="eyebrow">04</p>
  <h1>Ce que ça coûte</h1>
  <div class="parties">
    <div><span class="etiquette">Émetteur</span><p>${LEGAL.editeur}, marque Odegia<br/>${LEGAL.siege}<br/>SIREN ${LEGAL.siren} · TVA ${LEGAL.tva}<br/>${SITE.email}</p></div>
    <div><span class="etiquette">Client</span><p>${esc(entree.client.entite)}<br/>${esc(entree.client.representant)}${entree.client.adresse ? `<br/>${esc(entree.client.adresse)}` : ""}</p></div>
    <div><span class="etiquette">Devis</span><p>N° ${esc(numero)}<br/>Émis le ${dateFr(dateRapport)}<br/>Valable jusqu'au ${dateFr(validite)}</p></div>
  </div>
  <table class="devis">
    <thead><tr><th>Désignation</th><th class="n">Par mois, HT</th></tr></thead>
    <tbody>
      ${lignesDevis}
      ${d.remisePack ? `<tr class="remise"><td>Remise de parc, ${Math.round(c.parametres.REMISE_PACK * 100)} % dès la troisième brique</td><td class="n">− ${euros(d.remisePackEuros)}</td></tr>` : ""}
      ${d.remiseGroupe ? `<tr class="remise"><td>Remise client du groupe Orbis Optima, pendant les ${E} premiers mois</td><td class="n">− ${euros(d.remiseGroupeEuros)}</td></tr>` : ""}
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
    <p><strong>La construction, la surveillance, la correction des dérives et les ajustements.</strong> Vous ne payez rien d'avance, la première mensualité est prélevée à la commande.${d.creditDiagnostic ? ` Le diagnostic déjà réglé, ${euros(d.creditDiagnostic)}, vaut vos premières mensualités.` : ""}</p>
    <p>Engagement de ${E} mois, soit ${euros(d.engagementHT)} HT.${d.remiseGroupe ? ` À partir du treizième mois, la mensualité est de ${euros(d.mensualiteEnsuiteHT)} HT.` : ""} Ensuite vous arrêtez avec trente jours de préavis, ou vous rachetez ${c.recommandees.length > 1 ? "ces briques" : "cette brique"} pour ${R} mensualités, ${euros(d.rachatHT)} HT, et ${c.recommandees.length > 1 ? "elles vous restent acquises" : "elle vous reste acquise"}.</p>
  </div>
  <ul class="conditions">
    <li>Vos abonnements aux outils restent à votre nom et sont réglés par vous.</li>
    <li>Aucun accès à un compte bancaire ni à un moyen de paiement, y compris en lecture.</li>
    <li>Règles et limites de chaque brique écrites et validées avec vous avant construction.</li>
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
const socle = [
  f.eliminer.length ? `<p><strong>Supprimer d'abord.</strong> Ces tâches disparaissent avant toute construction.</p>${liste(f.eliminer)}` : "",
  f.rassembler.length ? `<p><strong>Rassembler les informations</strong> aujourd'hui dispersées, dans une seule base.</p>${liste(f.rassembler)}` : "",
  f.documenter.length ? `<p><strong>Écrire les règles</strong> qui ne le sont nulle part, avant de les confier à un système ou à une personne.</p>${liste(f.documenter)}` : "",
  `<p><strong>Fixer les permissions</strong>, ce que le système envoie seul et ce qu'il vous soumet avant envoi.</p>`,
].join("");
const partie5 = `
<section class="page">
  <p class="eyebrow">05</p>
  <h1>Votre feuille de route</h1>
  ${c.definition ? `<div class="definition"><div><span class="etiquette">Ce que vous produisez</span><p>${esc(c.definition.produit)}</p></div><div><span class="etiquette">Pour qui</span><p>${esc(c.definition.pourQui)}</p></div><div><span class="etiquette">Par quel flux</span><p>${esc(c.definition.fluxDeValeur)}</p></div></div>` : ""}
  ${para(r.feuilleDeRoute)}
  <p class="note">Délais indicatifs, comptés en semaines à partir de la signature.</p>
  <ol class="temps">
    <li><span class="rang">1</span><div><h3>Le socle <span class="delai">${semaines(f.calendrier.socle)}</span></h3>${socle}</div></li>
    <li><span class="rang">2</span><div><h3>La construction ${f.calendrier.briques.length ? `<span class="delai">${semaines({ debut: f.calendrier.briques[0].debut, fin: f.calendrier.briques[f.calendrier.briques.length - 1].fin })}</span>` : ""}</h3>${f.construire.length ? `<p>Dans l'ordre de la page 3.</p><ul class="puces">${f.construire.map((u) => { const cal = f.calendrier.briques.find((x) => x.id === u.id)!; return `<li>${esc(uniteId.get(u.id)!.nom)}, ${u.niveau === 3 ? "vous validez avant envoi" : "part seule"}, ${semaines(cal)}</li>`; }).join("")}</ul>` : "<p>Au seul calcul du temps, aucune construction ne se justifie.</p>"}${f.deleguer.length ? `<p><strong>À confier à quelqu'un</strong>, avec des instructions écrites. ${f.construire.length ? "Ces tâches restent hors de la construction, trop légères pour couvrir leur mensualité." : "À ce volume, leur automatisation coûterait plus qu'elle ne rend."}</p>${liste(f.deleguer)}` : ""}</div></li>
    <li><span class="rang">3</span><div><h3>La supervision ${f.calendrier.supervision ? `<span class="delai">${semaines(f.calendrier.supervision)}</span>` : ""}</h3>${f.calendrier.supervision ? `<p>Une semaine de mise en place après la première livraison, puis quatre semaines de rodage où tout passe par votre validation.</p>` : ""}<p>${f.fileExceptions.length ? "Tout ce qui attend votre validation arrive dans une seule file, au lieu d'être éparpillé dans vos mails. " : ""}Un tableau montre ce qui tourne. Vous le regardez ${[[f.cadence.jour, "par jour"], [f.cadence.semaine, "par semaine"], [f.cadence.mois, "par mois"]].filter(([m]) => (m as number) > 0).map(([m, u]) => `${fmtCadence(m as number)} ${u}`).join(", ")}, et vous ne touchez plus à l'exécution.</p></div></li>
    <li><span class="rang">4</span><div><h3>Le calibrage ${f.calendrier.calibrage ? `<span class="delai">dès la semaine ${f.calendrier.calibrage}, en continu</span>` : ""}</h3><p>Chaque semaine, la part de ce que le système produit et que vous acceptez sans retouche. Quand elle baisse, on corrige les règles. C'est ce qui rend le système plus juste de mois en mois au lieu de le laisser dériver.</p></div></li>
  </ol>
  ${f.aVotreMain.length ? `<p class="note"><strong>Reste à votre main, par choix.</strong> ${noms(f.aVotreMain).join(" · ")}</p>` : ""}
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
  .accord { margin-top:9mm; border:1.5px dashed var(--soft); border-radius:12px; height:26mm; padding:3mm 4mm; font: 500 7pt "Geist Mono", monospace; text-transform:uppercase; letter-spacing:.12em; color:var(--soft); width:80mm; margin-left:auto; }
</style></head>
<body>${partie1}${partie2}${partie3}${partie4}${partie5}</body></html>`;

writeFileSync(join(dossier, "rapport.html"), html, "utf-8");

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
