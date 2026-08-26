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
  /* La complexité est une propriété de la tâche, pas du contexte. Seuls les
     appels d'offres la portent, sources multiples, règles à écrire et
     validation humaine obligatoire. Tout le reste est du chantier simple, y
     compris les devis, dont la règle est stable et la sortie unique. */
  complexe: boolean;
};

export const TACHES: TacheDef[] = [
  { id: "devis", label: "Refaire mes devis à la main", bareme: { mois: 3, semaine: 7, jour: 16 }, complexe: false },
  { id: "facturation", label: "Émettre mes factures et courir après les règlements", bareme: { mois: 3, semaine: 8, jour: 18 }, complexe: false },
  { id: "appels-offres", label: "Répondre à des appels d'offres ou des dossiers de subvention", bareme: { mois: 6, semaine: 15, jour: 30 }, complexe: true },
  { id: "onboarding", label: "La paperasse à chaque nouveau client", bareme: { mois: 3, semaine: 7, jour: 16 }, complexe: false },
  { id: "rendez-vous", label: "Caler et rappeler des rendez-vous", bareme: { mois: 2, semaine: 5, jour: 12 }, complexe: false },
  { id: "comptes-rendus", label: "Rédiger mes comptes rendus", bareme: { mois: 2, semaine: 5, jour: 12 }, complexe: false },
  { id: "mails", label: "Répondre vingt fois la même chose par mail", bareme: { mois: 3, semaine: 10, jour: 22 }, complexe: false },
  { id: "pieces", label: "Rassembler les pièces pour mon comptable", bareme: { mois: 3, semaine: 7, jour: 13 }, complexe: false },
  { id: "reporting", label: "Savoir où j'en suis sans attendre la fin du mois", bareme: { mois: 3, semaine: 5, jour: 10 }, complexe: false },
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

/* Part du temps d'une tâche automatisée réellement récupérée. Relevée de 0,70
   à 0,80 le 25/08/2026, décision d'Adib, hypothèse de travail assumée pour le
   premier estimateur et à confronter aux premiers chantiers. Ce n'est pas un
   paramètre commercial, c'est une mesure, et elle n'a jamais été mesurée. La
   valeur retenue est affichée au visiteur pour qu'il puisse la contester. */
export const PART_RECUPERABLE = 0.8;
export const PRIX_SIMPLE = 1200;
/* Portée de 2 400 à 2 600 le 25/08/2026. Le pack de trois briques simples
   étant descendu à 2 400, une brique complexe valait exactement le même prix
   que trois simples, ce qui se lisait mal à quelques centimètres près sur la
   page tarifs. */
export const PRIX_COMPLEXE = 2600;
/* Abaissé de 2 900 à 2 400 le 25/08/2026 pour que le profil cible, un
   indépendant à 60 EUR de l'heure, passe le seuil de rentabilité. */
export const PRIX_PACK_TROIS = 2400;
/* En dessous, l'estimateur dit au visiteur de ne rien faire. Refuser une vente
   ici vaut mieux qu'un client qui ne sera jamais rentable. */
export const SEUIL_PLANCHER = 1500;

/* Suivi mensuel, indexé à la brique et dégressif depuis le 25/08/2026. Il entre
   dans le calcul du retour, ce qui n'était pas le cas avant cette date.
   L'estimateur comparait un coût d'achat unique à un gain brut et ignorait la
   charge récurrente, ce qui raccourcissait tous les retours affichés.

   Dégressif parce que la première brique porte la relation, le compte et la
   revue mensuelle, les suivantes n'ajoutent que leur propre surveillance. */
export const SUIVI_PREMIERE = 300;
export const SUIVI_SUIVANTE = 200;

/* Le suivi d'un parc de n briques. */
export const suiviMensuelPour = (n: number) =>
  n <= 0 ? 0 : SUIVI_PREMIERE + SUIVI_SUIVANTE * (n - 1);

/* Plafond de retour au-delà duquel une brique ne se recommande pas. Une tâche
   qui met plus de dix-huit mois à se rembourser ne vaut pas le chantier, la
   situation du client aura changé avant. Sans ce plafond, l'estimateur affiche
   des retours à quarante mois, qui sont arithmétiquement justes et
   commercialement absurdes.

   Porté de 18 à 24 mois le 25/08/2026. À 18, le seuil excluait le cœur de la
   cible, un indépendant à 60 EUR de l'heure avec trois tâches hebdomadaires
   sortait à 20,7 mois. Vingt-quatre mois écarte toujours l'absurde sans écarter
   le profil visé. */
export const SEUIL_RETOUR_MOIS = 24;

export type LigneResultat = {
  id: string;
  label: string;
  heuresMois: number;
  heuresRecuperees: number;
  gainAnnuel: number;
  complexe: boolean;
  cout: number;
  /* Gain mensuel une fois le suivi de la brique déduit. C'est lui qui rembourse
     le chantier, le gain brut ne rembourse rien. */
  gainNetMensuel: number;
  roiMois: number;
  /* Vrai quand le suivi absorbe le gain. La brique ne se rembourse alors jamais
     et il faut le dire, plutôt que d'afficher un retour à plusieurs années. */
  absorbee: boolean;
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
  /* Suivi mensuel du périmètre recommandé, une fois le chantier livré. */
  suiviMensuel: number;
  /* Gain mensuel du périmètre une fois le suivi déduit. */
  gainNetPerimetre: number;
  /* La brique de tête ne couvre pas le socle de 300 EUR, elle ne se vend donc
     pas seule. Le périmètre reste valable, mais il faut le dire. */
  teteNonViableSeule: boolean;
  roiMois: number;
  /* Aucune des briques recommandées ne se rembourse une fois le suivi déduit.
     Le dire franchement vaut mieux que d'étirer un chiffre. */
  aucunRetour: boolean;
  sousLePlancher: boolean;
  cadrageAlourdi: boolean;
};

export function calculer(r: Reponses): Resultat {
  const taux = r.taux ?? 60;

  /* Le contexte n'inflige plus de surcoût. Un parc d'outils pauvre ou des
     règles non écrites allongent le cadrage, mais ne transforment pas une tâche
     simple en chantier complexe. On le signale dans le résultat, sans toucher au
     prix, et le diagnostic tranche pour de bon. */
  const aucunOutilEnLigne = !r.outils.some(
    (id) => OUTILS.find((o) => o.id === id)?.enLigne
  );
  const regleFloue =
    DOCUMENTATION.find((d) => d.id === r.documentation)?.flou ?? false;
  const cadrageAlourdi = aucunOutilEnLigne || regleFloue;

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
    const cout = def.complexe ? PRIX_COMPLEXE : PRIX_SIMPLE;
    /* Le suivi de la brique se déduit du gain avant de calculer le retour. Une
       brique qui libère 100 EUR de temps par mois et coûte 100 EUR de suivi ne
       rembourse rien, quel que soit son prix d'achat. */
    /* Deux lectures selon la position de la brique. En première, elle porte le
       socle de 300 EUR. En position suivante, elle ne porte que les 200 EUR de
       sa propre surveillance. On garde ici la lecture marginale pour le tri et
       le filtre, la première brique est rechargée plus bas. */
    const gainNetMensuel = gainAnnuel / 12 - SUIVI_SUIVANTE;
    const roiMois = gainNetMensuel > 0 ? cout / gainNetMensuel : Infinity;
    return {
      id: def.id,
      label: def.label,
      heuresMois,
      heuresRecuperees,
      gainAnnuel,
      complexe: def.complexe,
      cout,
      gainNetMensuel,
      roiMois,
      absorbee: gainNetMensuel <= 0 || roiMois > SEUIL_RETOUR_MOIS,
    };
  });

  const heuresMois = lignes.reduce((s, l) => s + l.heuresMois, 0);
  const heuresRecuperees = lignes.reduce((s, l) => s + l.heuresRecuperees, 0);
  const coutAnnuel = lignes.reduce((s, l) => s + l.gainAnnuel, 0);

  /* Priorisation, règles de calibration de la note de diagnostic. On classe par
     retour croissant, puis la tâche citée comme la plus agaçante ne remonte en
     tête que si son retour reste à un mois près du meilleur. Au-delà, le calcul
     reprend la main. */
  /* Une brique dont le suivi absorbe le gain ne se recommande pas, même si le
     visiteur l'a citée comme la plus agaçante. On l'écarte avant le tri plutôt
     que de la classer dernière, sans quoi elle remonterait dès que le visiteur
     n'a coché que trois tâches. */
  const tri = lignes.filter((l) => !l.absorbee).sort((a, b) => a.roiMois - b.roiMois);
  if (r.agace) {
    const i = tri.findIndex((l) => l.id === r.agace);
    if (i > 0 && tri[i].roiMois - tri[0].roiMois <= 1) {
      const [pref] = tri.splice(i, 1);
      tri.unshift(pref);
    }
  }
  /* La brique de tête porte le socle. Si elle ne le couvre pas, elle ne peut
     pas être vendue seule, et l'estimateur doit le dire plutôt que d'afficher un
     retour calculé au tarif marginal. */
  const recommandees = tri.slice(0, 3);
  const tete = recommandees[0];
  const gainTeteAvecSocle = tete
    ? tete.gainAnnuel / 12 - SUIVI_PREMIERE
    : 0;
  const teteNonViableSeule = !!tete && gainTeteAvecSocle <= 0;

  const nbComplexes = recommandees.filter((l) => l.complexe).length;
  const coutChantier =
    recommandees.length === 3 && nbComplexes === 0
      ? PRIX_PACK_TROIS
      : recommandees.reduce((s, l) => s + l.cout, 0);

  /* Le chiffre mis en avant est celui de la première brique recommandée, jamais
     une moyenne. Une moyenne dilue le meilleur retour et produit un résultat
     systématiquement plus mauvais que celui annoncé en page d'accueil. */
  /* Le retour affiché est celui du périmètre recommandé dans son ensemble, et
     non celui d'une brique isolée au tarif marginal. Avec un suivi dégressif,
     un retour par brique donnerait un chiffre que le client ne retrouverait
     jamais sur sa facture. */
  const gainMensuelRecommande = recommandees.reduce(
    (s, l) => s + l.gainAnnuel / 12,
    0
  );
  const suiviMensuel = suiviMensuelPour(recommandees.length);
  const gainNetPerimetre = gainMensuelRecommande - suiviMensuel;
  const roiMois =
    gainNetPerimetre > 0 ? Math.ceil(coutChantier / gainNetPerimetre) : 0;

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
    suiviMensuel,
    gainNetPerimetre,
    roiMois,
    teteNonViableSeule,
    aucunRetour:
      recommandees.length === 0 ||
      gainNetPerimetre <= 0 ||
      roiMois > SEUIL_RETOUR_MOIS,
    sousLePlancher: coutAnnuel < SEUIL_PLANCHER,
    cadrageAlourdi,
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
