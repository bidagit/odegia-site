/* Moteur de l'estimateur public, transposé de la note du vault
   « Odegia - Estimateur en ligne — Spec ».

   Le calcul tourne côté navigateur, aucune donnée ne part avant le
   consentement du dernier écran. Les barèmes sont des hypothèses de travail,
   pas des mesures, et doivent être confrontés au premier chantier réel avant
   d'être figés. */

export type Frequence = "mois" | "semaine" | "jour";

export type TacheDef = {
  id: string;
  /* Formulé dans les mots du visiteur. Ni « brique » ni « processus »
     n'apparaissent jamais à l'écran. */
  label: string;
  bareme: Record<Frequence, number>; // heures par mois
};

export const TACHES: TacheDef[] = [
  { id: "devis", label: "Refaire mes devis à la main", bareme: { mois: 1.5, semaine: 4, jour: 10 } },
  { id: "facturation", label: "Émettre mes factures et courir après les règlements", bareme: { mois: 2, semaine: 5, jour: 12 } },
  { id: "appels-offres", label: "Répondre à des appels d'offres ou des dossiers de subvention", bareme: { mois: 4, semaine: 10, jour: 20 } },
  { id: "onboarding", label: "La paperasse à chaque nouveau client", bareme: { mois: 1.5, semaine: 4, jour: 10 } },
  { id: "rendez-vous", label: "Caler et rappeler des rendez-vous", bareme: { mois: 1, semaine: 3, jour: 8 } },
  { id: "comptes-rendus", label: "Rédiger mes comptes rendus", bareme: { mois: 1, semaine: 3, jour: 8 } },
  { id: "mails", label: "Répondre vingt fois la même chose par mail", bareme: { mois: 2, semaine: 6, jour: 15 } },
  { id: "pieces", label: "Rassembler les pièces pour mon comptable", bareme: { mois: 2, semaine: 4, jour: 8 } },
  { id: "reporting", label: "Savoir où j'en suis sans attendre la fin du mois", bareme: { mois: 2, semaine: 3, jour: 6 } },
];

export const FREQUENCES: { value: Frequence; label: string }[] = [
  { value: "mois", label: "Quelques fois par mois" },
  { value: "semaine", label: "Toutes les semaines" },
  { value: "jour", label: "Tous les jours ou presque" },
];

export const TAILLES = [
  "Fondateur seul",
  "2 à 5 personnes",
  "6 à 20 personnes",
  "Plus de 20 personnes",
];

export const TAUX = [
  { label: "Moins de 40 €", value: 30 },
  { label: "40 à 70 €", value: 55 },
  { label: "70 à 120 €", value: 95 },
  { label: "Plus de 120 €", value: 140 },
  { label: "Je ne sais pas", value: 60 },
];

/* Un parc d'outils connectables divise le coût du chantier, des fichiers posés
   sur un disque le multiplient. « Aucun outil en ligne » bascule tout en
   complexe, au même titre qu'une règle qui n'est écrite nulle part. */
export const OUTILS = [
  { id: "facturation", label: "Un outil de facturation en ligne", enLigne: true },
  { id: "crm", label: "Un CRM", enLigne: true },
  { id: "suite", label: "Google Workspace ou Microsoft 365", enLigne: true },
  { id: "signature", label: "Une signature électronique", enLigne: true },
  { id: "fichiers", label: "Surtout des fichiers Word et Excel sur mon ordinateur", enLigne: false },
  { id: "inconnu", label: "Je ne sais pas trop", enLigne: false },
];

export const DOCUMENTATION = [
  { id: "oui", label: "Oui, c'est documenté", flou: false },
  { id: "partiel", label: "En partie", flou: false },
  { id: "non", label: "Non, c'est dans ma tête", flou: true },
];

export type Reponses = {
  taille: string | null;
  heuresSemaine: number;
  taux: number | null;
  taches: string[];
  frequences: Record<string, Frequence>;
  outils: string[];
  documentation: string | null;
  agace: string | null;
};

export const REPONSES_VIDES: Reponses = {
  taille: null,
  heuresSemaine: 8,
  taux: null,
  taches: [],
  frequences: {},
  outils: [],
  documentation: null,
  agace: null,
};

export const PART_RECUPERABLE = 0.7;
export const PRIX_SIMPLE = 1200;
export const PRIX_COMPLEXE = 2400;
export const PRIX_PACK_TROIS = 2900;
/* En dessous, l'estimateur dit au visiteur de ne rien faire. Refuser une vente
   ici vaut mieux qu'un client qui ne sera jamais rentable. */
export const SEUIL_PLANCHER = 1500;

export type LigneResultat = {
  id: string;
  label: string;
  heuresMois: number;
  heuresRecuperees: number;
  gainAnnuel: number;
  complexe: boolean;
  cout: number;
  roiMois: number;
};

export type Resultat = {
  heuresMois: number;
  heuresRecuperees: number;
  coutAnnuel: number;
  taux: number;
  lignes: LigneResultat[];
  recommandees: LigneResultat[];
  coutChantier: number;
  coutBas: number;
  coutHaut: number;
  roiMois: number;
  sousLePlancher: boolean;
};

export function calculer(r: Reponses): Resultat {
  const taux = r.taux ?? 60;

  /* Une tâche est complexe si rien n'est outillé en ligne, ou si la règle
     n'existe nulle part ailleurs que dans la tête du dirigeant. */
  const aucunOutilEnLigne = !r.outils.some(
    (id) => OUTILS.find((o) => o.id === id)?.enLigne
  );
  const regleFloue =
    DOCUMENTATION.find((d) => d.id === r.documentation)?.flou ?? false;
  const complexe = aucunOutilEnLigne || regleFloue;

  const choisies = TACHES.filter((t) => r.taches.includes(t.id));
  const brut = choisies.map((t) => ({
    def: t,
    heures: t.bareme[r.frequences[t.id] ?? "semaine"],
  }));
  const totalBrut = brut.reduce((s, b) => s + b.heures, 0);

  /* Plafond de réalité. Le total ne peut pas dépasser ce que le visiteur vient
     de déclarer à l'écran 2. On ramène proportionnellement, sans le signaler,
     un total qui le contredit détruirait la crédibilité du reste. */
  const plafondMois = r.heuresSemaine * 4.33;
  const facteur = totalBrut > plafondMois && totalBrut > 0 ? plafondMois / totalBrut : 1;

  const lignes: LigneResultat[] = brut.map(({ def, heures }) => {
    const heuresMois = heures * facteur;
    const heuresRecuperees = heuresMois * PART_RECUPERABLE;
    const gainAnnuel = heuresRecuperees * 12 * taux;
    const cout = complexe ? PRIX_COMPLEXE : PRIX_SIMPLE;
    return {
      id: def.id,
      label: def.label,
      heuresMois,
      heuresRecuperees,
      gainAnnuel,
      complexe,
      cout,
      roiMois: gainAnnuel > 0 ? cout / (gainAnnuel / 12) : Infinity,
    };
  });

  const heuresMois = lignes.reduce((s, l) => s + l.heuresMois, 0);
  const heuresRecuperees = lignes.reduce((s, l) => s + l.heuresRecuperees, 0);
  const coutAnnuel = lignes.reduce((s, l) => s + l.gainAnnuel, 0);

  /* Priorisation, règles de calibration de la note de diagnostic. On classe par
     retour croissant, puis la tâche citée comme la plus agaçante ne remonte en
     tête que si son retour reste à un mois près du meilleur. Au-delà, le calcul
     reprend la main. */
  const tri = [...lignes].sort((a, b) => a.roiMois - b.roiMois);
  if (r.agace) {
    const i = tri.findIndex((l) => l.id === r.agace);
    if (i > 0 && tri[i].roiMois - tri[0].roiMois <= 1) {
      const [pref] = tri.splice(i, 1);
      tri.unshift(pref);
    }
  }
  const recommandees = tri.slice(0, 3);

  const nbComplexes = recommandees.filter((l) => l.complexe).length;
  const coutChantier =
    recommandees.length === 3 && nbComplexes === 0
      ? PRIX_PACK_TROIS
      : recommandees.reduce((s, l) => s + l.cout, 0);

  /* Le chiffre mis en avant est celui de la première brique recommandée, jamais
     une moyenne. Une moyenne dilue le meilleur retour et produit un résultat
     systématiquement plus mauvais que celui annoncé en page d'accueil. */
  const premiere = recommandees[0];
  const roiMois = premiere ? Math.ceil(premiere.roiMois) : 0;

  return {
    heuresMois,
    heuresRecuperees,
    coutAnnuel,
    taux,
    lignes,
    recommandees,
    coutChantier,
    coutBas: Math.round((coutChantier * 0.75) / 100) * 100,
    coutHaut: Math.round((coutChantier * 1.25) / 100) * 100,
    roiMois,
    sousLePlancher: coutAnnuel < SEUIL_PLANCHER,
  };
}

export const euros = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));

export const heures = (n: number) =>
  n >= 10 ? Math.round(n).toString() : (Math.round(n * 10) / 10).toString().replace(".", ",");
