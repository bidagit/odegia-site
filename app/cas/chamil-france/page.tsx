import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { SITE } from "@/lib/content";

/* Etude de cas Chamil France, premier terrain d Odegia.

   Publiee le 01/10/2026 avec l accord du bureau de l association. Les
   chiffres viennent du rapport de diagnostic du meme jour, methode v1.9,
   suivi par palier, dossier
   P:\1. ORBIS\Odegia\Diagnostics\2026-10 Chamil France\. Aucune donnee de
   beneficiaire.

   Le cas parle des 12 prochains mois, decision d Adib du 01/10/2026, un
   dirigeant decidant sur ce qui l attend. Les chiffres s ecrivent en chiffres.
   L encadre sur le lien entre le fondateur et l association a ete retire le
   meme jour, decision d Adib. */

/* Un nombre et son unite ne se separent jamais en fin de ligne. */
const nb = (s: string) => s.replace(/(\d) (?=\d|\u20ac|h\b|mois\b|min)/g, "$1\u00a0");

const TITLE = "Chamil France, étude de cas";
const DESCRIPTION =
  "Une association de séjours de répit diagnostiquée selon la méthode Odegia. Ce que son administratif va coûter sur les 12 prochains mois, ce qui se construit, ce qui reste à la main du bureau.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/cas/chamil-france" },
  openGraph: {
    type: "article",
    siteName: "Odegia",
    title: `${TITLE} | Odegia`,
    description: DESCRIPTION,
    locale: "fr_FR",
  },
};

const CHIFFRES = [
  { valeur: "18,3 h", legende: "d'administratif par mois sur les 12 prochains mois" },
  { valeur: "13 188 €", legende: "par an, au taux de 60 € de l'heure retenu par l'association" },
  { valeur: "9 mois", legende: "pour rembourser l'investissement Odegia" },
];

/* Inventaire des 23 taches, genere depuis calcul.json du diagnostic, trie par
   heures a venir. Les acteurs sont nommes par leur role, jamais par leur
   prenom. Une etoile marque une tache dont le volume a ete plafonne. */
const INVENTAIRE = [
  { tache: "Tenir le registre des inscrits", qui: "Secrétaire générale", rythme: "2 par semaine", duree: "10 min", heures: "1,7", plafond: false, orientation: "parcours" },
  { tache: "Établir les contrats des éducatrices", qui: "Trésorier", rythme: "1 par mois", duree: "1 h", heures: "1,6", plafond: true, orientation: "à confier" },
  { tache: "Construire le programme et les activités", qui: "Secrétaire générale", rythme: "3 par an", duree: "5 h", heures: "1,5", plafond: false, orientation: "à la main" },
  { tache: "Répondre aux questions des familles avant préinscription", qui: "Secrétaire générale", rythme: "3 par mois", duree: "20 min", heures: "1,3", plafond: true, orientation: "parcours" },
  { tache: "Envoyer le dossier d'inscription et réunir les pièces", qui: "Secrétaire générale", rythme: "1 par mois", duree: "45 min", heures: "1,2", plafond: true, orientation: "parcours" },
  { tache: "Tenir la comptabilité", qui: "Trésorier", rythme: "1 par mois", duree: "1 h", heures: "1,2", plafond: false, orientation: "à confier" },
  { tache: "Rédiger le bilan éducatif", qui: "Éducatrices", rythme: "1 par mois", duree: "45 min", heures: "1,2", plafond: true, orientation: "à confier" },
  { tache: "Trouver le véhicule du séjour", qui: "Secrétaire générale", rythme: "3 par an", duree: "3 h", heures: "0,9", plafond: false, orientation: "à confier" },
  { tache: "Récupérer et rendre le véhicule", qui: "Secrétaire générale", rythme: "3 par an", duree: "3 h", heures: "0,9", plafond: false, orientation: "à confier" },
  { tache: "Relancer les impayés", qui: "Secrétaire générale", rythme: "3 par mois", duree: "15 min", heures: "0,9", plafond: false, orientation: "parcours" },
  { tache: "Établir un devis", qui: "Trésorier", rythme: "2 par mois", duree: "20 min", heures: "0,7", plafond: true, orientation: "parcours" },
  { tache: "Informer les familles avant le départ", qui: "Secrétaire générale", rythme: "3 par an", duree: "2 h", heures: "0,6", plafond: false, orientation: "parcours" },
  { tache: "Rédiger les PV du bureau", qui: "Trésorier", rythme: "4 par an", duree: "1,5 h", heures: "0,6", plafond: false, orientation: "à confier" },
  { tache: "Gérer la caisse et les avances", qui: "Trésorier", rythme: "3 par an", duree: "2 h", heures: "0,6", plafond: false, orientation: "à la main" },
  { tache: "Répartir les éducateurs et les participants", qui: "Secrétaire générale", rythme: "3 par an", duree: "2 h", heures: "0,6", plafond: false, orientation: "à la main" },
  { tache: "Établir une facture", qui: "Trésorier", rythme: "1 par mois", duree: "20 min", heures: "0,5", plafond: true, orientation: "parcours" },
  { tache: "Suivre les paiements et les acomptes", qui: "Trésorier", rythme: "3 par mois", duree: "10 min", heures: "0,5", plafond: true, orientation: "parcours" },
  { tache: "Caler l'entretien médical avec la coordinatrice", qui: "Coordinatrice des soins", rythme: "1 par mois", duree: "15 min", heures: "0,4", plafond: true, orientation: "parcours" },
  { tache: "Payer les billets", qui: "Trésorier", rythme: "3 par an", duree: "1 h", heures: "0,3", plafond: false, orientation: "à la main" },
  { tache: "Payer l'hébergement", qui: "Trésorier", rythme: "3 par an", duree: "1 h", heures: "0,3", plafond: false, orientation: "à la main" },
  { tache: "Divers logistique", qui: "Secrétaire générale", rythme: "3 par an", duree: "1 h", heures: "0,3", plafond: false, orientation: "à la main" },
  { tache: "Demander un témoignage après le séjour", qui: "Secrétaire générale", rythme: "1 par mois", duree: "10 min", heures: "0,3", plafond: true, orientation: "parcours" },
  { tache: "Remercier un donateur ou un adhérent", qui: "Trésorier", rythme: "1 par mois", duree: "10 min", heures: "0,2", plafond: false, orientation: "à confier" },
];

const CONSTRUIT = [
  "Répondre aux questions des familles avant préinscription",
  "Établir un devis",
  "Envoyer le dossier d'inscription et réunir les pièces",
  "Caler l'entretien médical avec la coordinatrice",
  "Établir une facture",
  "Suivre les paiements et les acomptes",
  "Relancer les impayés",
  "Informer les familles avant le départ",
  "Demander un témoignage après le séjour",
  "Tenir le registre des inscrits",
];

const CONFIE = [
  "Tenir la comptabilité",
  "Rédiger les PV du bureau",
  "Établir les contrats des éducatrices",
  "Rédiger le bilan éducatif",
  "Remercier un donateur",
  "Trouver et récupérer le véhicule",
];

const A_LA_MAIN = [
  "Payer les billets et l'hébergement",
  "Gérer la caisse et les avances",
  "Construire le programme du séjour",
  "Associer un éducateur à chaque participant",
];

const TEMPS = [
  {
    titre: "Le socle",
    delai: "semaines 1 à 4",
    texte:
      "Écrire la FAQ et les 13 règles qui ne l'étaient nulle part. Rassembler dans une seule base les pièces, les paiements et les demandes, aujourd'hui éparpillés dans les mails.",
  },
  {
    titre: "La construction",
    delai: "semaines 5 à 8",
    texte:
      "Le parcours d'inscription, de la première question d'une famille au témoignage après le séjour. Un assistant sur le site en est la porte d'entrée. Le bureau valide chaque devis, chaque facture et chaque convocation avant envoi.",
  },
  {
    titre: "La supervision",
    delai: "semaines 9 à 13",
    texte:
      "Tout ce qui attend une validation arrive dans une seule file. 10 minutes par semaine et 30 par mois suffisent au volume de l'association.",
  },
  {
    titre: "Le calibrage",
    delai: "dès la semaine 14",
    texte:
      "Chaque semaine, la part de ce que le système produit et que le bureau accepte sans retouche. Quand elle baisse, on corrige les règles.",
  },
];

const LECONS = [
  {
    titre: "Construit avant d'être mesuré.",
    texte:
      "Avec 4 dossiers par an, la méthode aurait dit d'écrire les règles et d'attendre. Le parcours ne devient rentable qu'avec les 3 séjours des 12 prochains mois.",
  },
  {
    titre: "Sans supervision.",
    texte:
      "Sans file d'exceptions ni revue régulière, un formulaire en panne est passé inaperçu pendant 3 mois. 10 minutes par semaine devant un tableau l'auraient vu le premier jour.",
  },
  {
    titre: "Sans feuille de route.",
    texte:
      "Les automatisations bénévoles ont été montées une à une, au fil des besoins, sans socle commun ni ordre. La méthode les remet dans une séquence où chaque temps prépare le suivant, le socle avant la construction, la supervision avant le calibrage.",
  },
];

/* La valeur du temps rendu face au cout d Odegia, demande d Adib du 01/10/2026,
   en montants annuels depuis le meme jour, plus parlants qu un mois.
   Le plateau penche du cote le plus lourd, l angle suit l ecart relatif et se
   borne a 12 degres pour rester lisible. Les deux blocs ont une hauteur
   proportionnelle a leur montant. Dessin en SVG, sans bibliotheque, aux
   couleurs de la charte. */
function Balancoire({ valeur, cout }: { valeur: number; cout: number }) {
  const ecart = (valeur - cout) / (valeur + cout);
  const angle = -Math.max(-12, Math.min(12, ecart * 45));
  const max = Math.max(valeur, cout);
  const hV = 70 + (60 * valeur) / max;
  const hC = 70 + (60 * cout) / max;
  const euro = (n: number) => `${n.toLocaleString("fr-FR")} €`;
  return (
    <svg
      viewBox="0 0 640 280"
      className="h-auto w-full"
      role="img"
      aria-label={`Valeur du temps rendu ${euro(valeur)} par mois, face au coût d'Odegia ${euro(cout)} par mois. La balance penche du côté du temps rendu.`}
    >
      <line x1="40" y1="262" x2="600" y2="262" stroke="var(--color-ink)" strokeOpacity="0.15" strokeWidth="2" />
      <polygon points="320,186 284,262 356,262" fill="var(--color-banane)" stroke="var(--color-ink)" strokeWidth="3" strokeLinejoin="round" />
      <g transform={`rotate(${angle} 320 186)`}>
        <rect x="56" y="176" width="528" height="16" rx="8" fill="var(--color-ink)" />
        <g>
          <rect x="74" y={176 - hV} width="190" height={hV} rx="16" fill="var(--color-vert-vif)" stroke="var(--color-ink)" strokeWidth="3" />
          <text x="169" y={176 - hV + 46} textAnchor="middle" className="display" fontSize="38" fill="var(--color-ink)">
            {euro(valeur)}
          </text>
          <text x="169" y={176 - hV + 74} textAnchor="middle" fontSize="19" fill="var(--color-ink)">
            temps rendu
          </text>
        </g>
        <g>
          <rect x="376" y={176 - hC} width="190" height={hC} rx="16" fill="var(--color-rose-soft)" stroke="var(--color-ink)" strokeWidth="3" />
          <text x="471" y={176 - hC + 46} textAnchor="middle" className="display" fontSize="38" fill="var(--color-ink)">
            {euro(cout)}
          </text>
          <text x="471" y={176 - hC + 74} textAnchor="middle" fontSize="19" fill="var(--color-ink)">
            coût Odegia
          </text>
        </g>
      </g>
    </svg>
  );
}

function Liste({ titre, items, ton }: { titre: string; items: string[]; ton: string }) {
  return (
    <div className={`rounded-[20px] border-2 border-ink p-6 ${ton}`}>
      <h3 className="text-[15.5px] font-semibold tracking-[-0.01em]">{titre}</h3>
      <ol className="mt-3 space-y-1.5 text-[13.5px] leading-[1.6] text-ink-soft">
        {items.map((item, i) => (
          <li key={item} className="flex gap-2.5">
            <span className="w-5 shrink-0 text-right font-mono text-[12px] text-ink/45">{i + 1}</span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function Page() {
  return (
    <div className="border-t border-ink/10">
      <section className="bg-vert-soft pb-16 pt-14 md:pb-20">
        <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
          {/* Mention speciale, demande d Adib du 01/10/2026. Le retour sur 3 ans,
              13 939 EUR de temps rendu pour 6 720 EUR investis, se dit x2 plutot
              qu en pourcentage. Pastille de cote sur grand ecran, en ligne sur
              mobile. */}
          <div
            className="ombre-dure absolute right-8 top-0 hidden h-[168px] w-[168px] rotate-6 flex-col items-center justify-center rounded-full border-2 border-ink bg-banane text-center lg:flex"
          >
            <span className="display text-[46px] leading-none tracking-[-0.03em]">×2</span>
            <span className="mt-1.5 px-5 text-[11.5px] leading-[1.35] text-ink">
              l&apos;investissement rendu en temps, sur 3 ans
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Logo 2026 de l association, fond blanc retire, ajoute le
                01/10/2026 a la demande d Adib. */}
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-paper">
              <Image
                src="/images/chamil-france-logo.png"
                alt="Logo de Chamil France"
                width={256}
                height={275}
                className="h-9 w-auto"
              />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
              Étude de cas
            </span>
          </div>
          <h1 className="display mt-4 text-[34px] leading-[1.08] tracking-[-0.03em] md:text-[48px]">
            Chamil France
            <br />
            <span className="text-vert">le diagnostic, avant de construire.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-[1.7] text-ink-soft">
            Une association loi 1901 qui organise des séjours de répit pour des
            personnes en situation de handicap, au Maroc et en France, avec un
            éducateur pour chaque participant. 3 bénévoles au bureau, et 3
            séjours à 9 participants sur les 12 prochains mois.
          </p>
          <p className="mt-5 flex w-fit items-center gap-2 rounded-full border-2 border-ink bg-banane px-4 py-1.5 text-[13px] font-medium text-ink lg:hidden">
            <span className="display text-[18px] leading-none">×2</span>
            l&apos;investissement rendu en temps, sur 3 ans
          </p>
          <a
            href="https://chamilinternational.org"
            target="_blank"
            rel="noopener"
            className="mt-4 inline-flex lg:mt-5 items-center gap-1.5 rounded-full border-2 border-ink bg-paper px-4 py-2 text-[13.5px] font-medium text-ink transition-colors hover:bg-vert-vif"
          >
            Découvrir les séjours de Chamil France
            <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
          </a>
          <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {CHIFFRES.map((c) => (
              <div
                key={c.valeur}
                className="ombre-dure-sm rounded-[20px] border-2 border-ink bg-paper p-5"
              >
                <span className="display block text-[28px] leading-none tracking-[-0.02em]">
                  {nb(c.valeur)}
                </span>
                <span className="mt-2 block text-[12.5px] leading-[1.5] text-ink-soft">
                  {nb(c.legende)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <h2 className="display text-[26px] leading-[1.12] tracking-[-0.02em] md:text-[32px]">
            D&apos;abord bénévole, puis repris avec la méthode
          </h2>
          <p className="mt-4 text-[14.5px] leading-[1.75] text-ink-soft">
            Au printemps 2026, les premières automatisations de l&apos;association
            ont été montées à titre bénévole, sans diagnostic et sans
            supervision. Le chantier a ensuite été repris par Odegia, avec sa
            méthode propriétaire, en commençant par ce qu&apos;elle place avant
            toute construction, le diagnostic.
          </p>
          <h2 className="display mt-12 text-[26px] leading-[1.12] tracking-[-0.02em] md:text-[32px]">
            Ce que le diagnostic a mesuré
          </h2>
          <p className="mt-4 text-[14.5px] leading-[1.75] text-ink-soft">
            23 tâches relevées, de la première question d&apos;une famille au
            bilan éducatif après le séjour. Sur les 12 prochains mois, 3 séjours
            à 9 participants, elles prendront {nb("18,3 h")} par mois au
            bureau, soit {nb("13 188 €")} par an au taux de {nb("60 €")} de
            l&apos;heure que l&apos;association a retenu. C&apos;est presque le
            double des 12 derniers mois, {nb("9,3 h")} par mois pour 2 séjours.
          </p>
          <p className="mt-4 text-[14.5px] leading-[1.75] text-ink-soft">
            La logistique des séjours en prendra {nb("6 h")} par mois,
            l&apos;inscription des familles l&apos;essentiel du reste. Pour les
            tâches qui suivent le nombre de participants, le calcul ne retient
            jamais plus de 4 fois le volume passé, faute d&apos;inscriptions
            déjà reçues. Les chiffres qui suivent sont donc prudents.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-5xl px-5 sm:px-8">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            L&apos;inventaire, sur les 12 prochains mois
          </span>
          <div className="mt-3 overflow-x-auto rounded-[20px] border-2 border-ink bg-paper">
            <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b-2 border-ink font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-soft">
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-2 py-3 font-medium">Tâche</th>
                  <th className="px-2 py-3 font-medium">Qui</th>
                  <th className="px-2 py-3 font-medium">Rythme</th>
                  <th className="px-2 py-3 font-medium">Durée</th>
                  <th className="px-2 py-3 text-right font-medium">h / mois</th>
                  <th className="px-4 py-3 font-medium">Orientation</th>
                </tr>
              </thead>
              <tbody>
                {INVENTAIRE.map((t, i) => (
                  <tr key={t.tache} className="border-b border-ink/10 last:border-b-0">
                    <td className="px-4 py-2.5 font-mono text-[11.5px] text-ink/45">{i + 1}</td>
                    <td className="px-2 py-2.5">{t.tache}</td>
                    <td className="px-2 py-2.5 text-ink-soft">{t.qui}</td>
                    <td className="whitespace-nowrap px-2 py-2.5 text-ink-soft">{t.rythme}{t.plafond ? "*" : ""}</td>
                    <td className="whitespace-nowrap px-2 py-2.5 text-ink-soft">{nb(t.duree)}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums">{t.heures}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[11.5px] font-medium ${
                          t.orientation === "parcours"
                            ? "border-ink bg-vert-vif text-ink"
                            : t.orientation === "à la main"
                              ? "border-rose bg-rose-soft text-rose"
                              : "border-ink/25 bg-paper-alt text-ink-soft"
                        }`}
                      >
                        {t.orientation}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-ink font-semibold">
                  <td className="px-4 py-3" />
                  <td className="px-2 py-3" colSpan={4}>Total</td>
                  <td className="px-2 py-3 text-right tabular-nums">18,3</td>
                  <td className="px-4 py-3" />
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="mt-3 text-[12.5px] leading-[1.6] text-ink-soft">
            Durées actives relevées en entretien, temps pour s&apos;y remettre et
            s&apos;en défaire compris. L&apos;étoile marque un volume plafonné à 4
            fois celui des 12 derniers mois.
          </p>
        </div>
      </section>

      <section className="border-t border-ink/10 bg-paper-alt/45 py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <h2 className="display text-[26px] leading-[1.12] tracking-[-0.02em] md:text-[32px]">
            Ce qu&apos;il a tranché
          </h2>
          <p className="mt-4 max-w-2xl text-[14.5px] leading-[1.75] text-ink-soft">
            10 tâches s&apos;enchaînent sur le même dossier. Mesurées une par
            une, aucune ne remboursait son suivi. Regroupées en un seul
            parcours, elles se construisent et se surveillent comme un seul
            système.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            <Liste titre="Se construit, en un parcours" items={CONSTRUIT} ton="bg-vert-soft" />
            <Liste titre="Se confie à un bénévole, avec des instructions écrites" items={CONFIE} ton="bg-paper" />
            <Liste titre="Reste à la main du bureau" items={A_LA_MAIN} ton="bg-paper" />
          </div>
          <p className="mt-5 max-w-2xl text-[13px] leading-[1.7] text-ink-soft">
            Aucun système ne touche à l&apos;argent de l&apos;association, par
            principe. Le programme et l&apos;association d&apos;un éducateur à
            un participant relèvent du jugement de l&apos;équipe.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <h2 className="display text-[26px] leading-[1.12] tracking-[-0.02em] md:text-[32px]">
            Le parcours, chaque année
          </h2>
          <div className="ombre-dure mt-8 rounded-[20px] border-2 border-ink bg-paper p-5 md:p-8">
            <p className="text-center text-[12.5px] text-ink-soft">
              {nb("Chaque année, coût d'Odegia = suivi de 1 440 € et chantier de 2 400 € étalé sur 3 ans, soit 800 €")}
            </p>
            <Balancoire valeur={4646} cout={2240} />
            <div className="mt-4 grid grid-cols-2 gap-6 border-t border-ink/10 pt-5">
              <div>
                <span className="display block text-[26px] leading-none">{nb("77 h")}</span>
                <span className="mt-2 block text-[12.5px] text-ink-soft">de temps rendu au bureau chaque année</span>
              </div>
              <div>
                <span className="display block text-[26px] leading-none text-vert">{nb("+2 406 €")}</span>
                <span className="mt-2 block text-[12.5px] text-ink-soft">par an en faveur de l&apos;association</span>
              </div>
            </div>
          </div>
          <p className="mt-5 max-w-2xl text-[13px] leading-[1.7] text-ink-soft">
            Sur 3 ans, {nb("13 939 €")} de temps rendu pour {nb("6 720 €")}{" "}
            payés, chantier et suivi compris. Le chantier se rembourse en{" "}
            {nb("9 mois")}, et ce délai raccourcit à chaque séjour de plus.
          </p>
        </div>
      </section>

      <section className="border-t border-ink/10 bg-vert-soft py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <h2 className="display text-[26px] leading-[1.12] tracking-[-0.02em] md:text-[32px]">
            La feuille de route
          </h2>
          <ol className="mt-8 flex flex-col items-stretch lg:flex-row">
            {TEMPS.map((t, i) => (
              <li key={t.titre} className="flex flex-col items-center lg:flex-1 lg:flex-row">
                <div className="flex w-full flex-1 flex-col rounded-[20px] border-2 border-ink bg-paper p-5 lg:h-full">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-banane font-mono text-[12px] font-semibold">
                    {i + 1}
                  </span>
                  <h3 className="mt-3 text-[15.5px] font-semibold tracking-[-0.01em]">{t.titre}</h3>
                  <span className="mt-1 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-vert">
                    {t.delai}
                  </span>
                  <p className="mt-2 text-[13px] leading-[1.65] text-ink-soft">{nb(t.texte)}</p>
                </div>
                {i < TEMPS.length - 1 && (
                  <span aria-hidden="true" className="flex shrink-0 items-center justify-center py-2 text-ink lg:px-2 lg:py-0">
                    <ArrowDown className="h-6 w-6 lg:hidden" strokeWidth={2.5} />
                    <ArrowRight className="hidden h-6 w-6 lg:block" strokeWidth={2.5} />
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <h2 className="display text-[26px] leading-[1.12] tracking-[-0.02em] md:text-[32px]">
            Ce que la méthode a changé
          </h2>
          <p className="mt-4 max-w-2xl text-[14.5px] leading-[1.75] text-ink-soft">
            Le diagnostic a été fait sur l&apos;état de l&apos;association avant
            tout chantier. Il montre ce que la version bénévole avait laissé de
            côté, et que la méthode traite en premier.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {LECONS.map((l) => (
              <div key={l.titre} className="rounded-[20px] border-2 border-ink p-6">
                <h3 className="text-[15.5px] font-semibold leading-[1.35] tracking-[-0.01em]">{l.titre}</h3>
                <p className="mt-2 text-[13.5px] leading-[1.7] text-ink-soft">{nb(l.texte)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Temoignage de la presidente de Chamil France, ajoute le 01/10/2026 a
          la demande d Adib. Coquilles corrigees, sens inchange. Texte valide par
          Atika le 01/10/2026, il porte sur les automatisations deja en place. */}
      <section className="border-t border-ink/10 py-16 md:py-20">
        <figure className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="ombre-dure relative rounded-[24px] border-2 border-ink bg-paper p-8 md:p-10">
            <span aria-hidden="true" className="display absolute -top-7 left-8 text-[72px] leading-none text-vert">
              &laquo;
            </span>
            <blockquote className="display text-[21px] leading-[1.4] tracking-[-0.01em] md:text-[25px]">
              Grâce à Odegia, on a pu économiser un temps monstre sur
              l&apos;administratif, qu&apos;on peut désormais consacrer à la relation
              avec nos partenaires et à la participation aux événements locaux. La
              méthode Odegia, c&apos;est vraiment le jour et la nuit.
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <Image
                src="/images/atika-chamil-france.webp"
                alt="Atika, présidente de Chamil France"
                width={320}
                height={320}
                className="h-14 w-14 shrink-0 rounded-full border-2 border-ink object-cover"
              />
              <span className="text-[14px] leading-[1.4]">
                <span className="font-semibold">Atika</span>
                <br />
                <span className="text-ink-soft">Présidente de Chamil France</span>
              </span>
            </figcaption>
          </div>
        </figure>
      </section>

      <section className="bg-vert-soft py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <h2 className="display text-[26px] leading-[1.12] tracking-[-0.02em] md:text-[32px]">
            Le même diagnostic, sur votre administratif.
          </h2>
          <p className="mt-4 text-[14.5px] leading-[1.7] text-ink-soft">
            Un entretien, un rapport sous 72 heures, une feuille de route datée.
            Et la réponse franche quand le volume ne justifie pas encore de
            construire.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={SITE.booking}
              target="_blank"
              rel="noopener noreferrer"
              className="bouton-relief ombre-dure-sm inline-block rounded-full border-2 border-ink bg-banane px-6 py-3.5 text-[14px] font-semibold text-ink"
            >
              Réserver 15 minutes
            </a>
            <Link
              href="/estimation"
              className="inline-block rounded-full border border-ink/15 px-6 py-3.5 text-[14px] font-medium transition-colors hover:border-vert hover:text-vert"
            >
              Estimer mon coût
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
