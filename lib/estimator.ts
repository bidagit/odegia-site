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
  /* Le palier est une propriété de la tâche, pas du contexte, et il mesure
     l'effort de construction et non les heures gagnées.

     La ligne de partage entre simple et intermédiaire est le coût d'une erreur.
     Un rendez-vous mal calé se rattrape, une facture fausse ou un mail
     maladroit parti au nom du client, non. C'est la règle du niveau selon le
     coût de l'erreur, appliquée au prix.

     Trois paliers depuis le 27/08/2026. Auparavant tout valait 1 200 sauf les
     appels d'offres, ce qui faisait facturer un lien de réservation au prix
     d'un moteur de facturation. */
  palier: Palier;
  /* Comment la charge suit l effectif. Un tableau de bord reste unique quand le
     volume de mails suit les personnes, et une facture suit le nombre de
     clients plus que celui des salaries. */
  sensibilite: Sensibilite;
};

export type Sensibilite = "forte" | "moyenne" | "faible";

export type Palier = "simple" | "intermediaire" | "complexe";

export const TACHES: TacheDef[] = [
  { id: "devis", label: "Refaire mes devis à la main", bareme: { mois: 3, semaine: 7, jour: 16 }, sensibilite: "moyenne", palier: "intermediaire" },
  /* Facturation passee en simple le 01/10/2026, decision d Adib. L erreur y
     coute cher, mais elle se couvre par la validation avant envoi, le niveau 3,
     et non par le prix. */
  { id: "facturation", label: "Émettre mes factures et courir après les règlements", bareme: { mois: 3, semaine: 8, jour: 18 }, sensibilite: "moyenne", palier: "simple" },
  { id: "appels-offres", label: "Répondre à des appels d'offres ou des dossiers de subvention", bareme: { mois: 6, semaine: 15, jour: 30 }, sensibilite: "moyenne", palier: "complexe" },
  { id: "onboarding", label: "La paperasse à chaque nouveau client", bareme: { mois: 3, semaine: 7, jour: 16 }, sensibilite: "moyenne", palier: "intermediaire" },
  { id: "rendez-vous", label: "Caler et rappeler des rendez-vous", bareme: { mois: 2, semaine: 5, jour: 12 }, sensibilite: "forte", palier: "simple" },
  { id: "comptes-rendus", label: "Rédiger mes comptes rendus", bareme: { mois: 2, semaine: 5, jour: 12 }, sensibilite: "forte", palier: "simple" },
  { id: "mails", label: "Répondre vingt fois la même chose par mail", bareme: { mois: 3, semaine: 10, jour: 22 }, sensibilite: "forte", palier: "intermediaire" },
  { id: "pieces", label: "Rassembler les pièces pour mon comptable", bareme: { mois: 3, semaine: 7, jour: 13 }, sensibilite: "forte", palier: "simple" },
  { id: "reporting", label: "Savoir où j'en suis sans attendre la fin du mois", bareme: { mois: 3, semaine: 5, jour: 10 }, sensibilite: "faible", palier: "intermediaire" },
];

export const FREQUENCES: { value: Frequence; label: string }[] = [
  { value: "mois", label: "Quelques fois par mois" },
  { value: "semaine", label: "Toutes les semaines" },
  { value: "jour", label: "Tous les jours ou presque" },
];

/* ── Effet de l effectif sur la charge ─────────────────────────────────────
   Ajoute le 28/08/2026. La question sur la taille etait posee depuis l origine
   et n entrait dans aucun calcul, si bien que l estimateur donnait le meme
   volume administratif a un fondateur seul et a une entreprise de quarante
   personnes. Les baremes etaient a l echelle du fondateur et plafonnaient a
   149 h par mois, quoi que le visiteur declare.

   **Ces coefficients sont estimes, pas mesures.** Ils tiennent lieu de reglage
   provisoire jusqu au premier chantier chronometre, celui d Alteria, apres quoi
   ils doivent etre confrontes au reel et corriges. La meme reserve vaut pour les
   baremes eux-memes, ecrite en tete de ce fichier.

   La progression est deliberement sous-lineaire. Dix personnes ne produisent pas
   dix fois l administratif d une seule, le contexte se partage, les outils se
   mutualisent et une part du travail est fixe. */
export const EFFECTIF_REF: Record<string, number> = {
  "Fondateur seul": 1,
  "2 à 5 personnes": 3,
  "6 à 20 personnes": 12,
  "Plus de 20 personnes": 30,
};

/* Part de la charge qui suit reellement chaque personne supplementaire.
   Forte, ce qui nait des personnes, reunions, comptes rendus, mails, notes de
   frais et pieces sociales. Moyenne, ce qui suit le volume de clients et de
   dossiers plus que l effectif, devis, factures, onboarding, appels d offres.
   Faible, ce qui reste a peu pres fixe, un tableau de bord servant l entreprise
   entiere quelle que soit sa taille. */
export const COEFFICIENT_EFFECTIF: Record<Sensibilite, number> = {
  forte: 0.35,
  moyenne: 0.2,
  faible: 0.05,
};

/* Multiplicateur applique au bareme d une tache. Vaut 1 pour un fondateur seul,
   ce qui laisse le modele historique inchange sur la piste d entree. */
export const facteurEffectif = (
  taille: string | null,
  sensibilite: Sensibilite
) => {
  const n = EFFECTIF_REF[taille ?? ""] ?? 1;
  return 1 + COEFFICIENT_EFFECTIF[sensibilite] * (n - 1);
};

/* Plafond du curseur d heures, derive du modele lui-meme plutot que fixe a la
   main. Il vaut ce que les neuf taches peuvent produire au rythme le plus
   intense pour cet effectif, arrondi a la dizaine superieure. Un plafond fixe a
   30 h bloquait toute PME sous le total que le modele savait calculer, et un
   plafond arbitrairement haut aurait laisse declarer un chiffre que le calcul ne
   pouvait pas atteindre. */
export const plafondHeuresSemaine = (taille: string | null) => {
  const total = TACHES.reduce(
    (somme, t) => somme + t.bareme.jour * facteurEffectif(taille, t.sensibilite),
    0
  );
  return Math.max(30, Math.ceil(total / 4.33 / 10) * 10);
};

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

/* ── Mensualité unique, depuis le 02/10/2026, décision d'Adib ──────────────
   Une brique n'a plus de prix de chantier ni de suivi séparé. Elle a une
   mensualité constante, construction et surveillance comprises, qui court tant
   que la brique tourne. Le prix d'entrée était le frein, remarque faite par un
   prospect et recoupée par des devis restés sans suite.

   Les trois montants amortissent l'ancien prix de chantier sur trois ans et y
   ajoutent l'ancien suivi, 600/36 + 40, 1 200/36 + 70, 2 400/36 + 120, arrondis.
   Le palier garde son sens, il suit ce que coûte une erreur. */
export const MENSUALITE: Record<Palier, number> = {
  simple: 60,
  intermediaire: 100,
  complexe: 190,
};
export const mensualiteDe = (p: Palier) => MENSUALITE[p];

/* Chaque brique engage douze mois, puis se résilie avec trente jours de
   préavis. Après ces douze mois le client peut la racheter pour six
   mensualités, elle lui reste alors acquise, sans surveillance. */
export const ENGAGEMENT_MOIS = 12;
export const RACHAT_MENSUALITES = 6;
/* Ce que vaut le diagnostic. Il est offert dès que l'estimation en ligne est
   positive, depuis le 02/10/2026. Payé, il vaut les premières mensualités à
   hauteur de son montant. */
export const DIAGNOSTIC = 500;

/* ── Anciens prix, internes ────────────────────────────────────────────────
   Le prix de chantier et le suivi par palier ne sont plus des prix publics.
   Ils restent ici le temps que la chaîne du diagnostic, scripts/diagnostic,
   soit migrée vers la mensualité. Le site ne les affiche plus nulle part. */
export const PRIX: Record<Palier, number> = {
  simple: 600,
  intermediaire: 1200,
  complexe: 2400,
};
export const prixDe = (p: Palier) => PRIX[p];

/* Nommage unique des paliers, repris par le site et par l'email d'estimation. */
export const NOM_PALIER: Record<Palier, string> = {
  simple: "simple",
  intermediaire: "intermédiaire",
  complexe: "complexe",
};

/* Remise de parc, en pourcentage et non en montant fixe, pour que tout mélange
   de paliers se calcule seul. Depuis le 02/10/2026 elle porte sur la
   mensualité, trois intermédiaires donnent 240 EUR par mois au lieu de 300.
   La remise s'affiche, un rabais que le client ignore ne sert personne. */
export const REMISE_PACK = 0.2;
export const SEUIL_PACK = 3;

/* La mensualité d'un parc, pleine puis remisée, arrondie aux cinq euros. */
export const mensualitePour = (paliers: Palier[]) => {
  const pleine = paliers.reduce((s, p) => s + mensualiteDe(p), 0);
  const remise = paliers.length >= SEUIL_PACK;
  const nette = remise ? Math.round((pleine * (1 - REMISE_PACK)) / 5) * 5 : pleine;
  return { pleine, nette, remise };
};

/* En dessous, l'estimateur dit au visiteur de ne rien faire. Le seuil porte sur
   le coût annuel de son administratif, pas sur le prix d'un chantier. Abaissé de
   1 500 à 900 le 27/08/2026, en même temps que l'arrivée de la brique à 600, un
   administratif à 1 000 EUR par an pouvant désormais trouver son compte. */
export const SEUIL_PLANCHER = 900;

/* Suivi mensuel, par palier depuis le 01/10/2026, décision d'Adib. Il entre
   dans le calcul du retour depuis le 25/08/2026.

   Chaque brique porte son propre suivi, sans socle, au palier de sa
   construction. Surveiller un lien de réservation ne coûte presque rien,
   surveiller une facturation demande du travail, et le prix suit cette
   différence comme le prix du chantier la suit déjà.

   Avant, un socle de 190 EUR pour la première brique puis 100 par brique en
   plus. Sur trois ans une brique simple coûtait onze fois son prix en suivi,
   et une tâche devait déjà prendre 4,5 h par mois pour qu'une brique seule se
   rembourse en deux ans. Au palier, il en faut 1,4 h pour une simple. */
export const SUIVI_PAR_PALIER: Record<Palier, number> = {
  simple: 40,
  intermediaire: 70,
  complexe: 120,
};
export const suiviDe = (p: Palier) => SUIVI_PAR_PALIER[p];

/* Le suivi d'un parc, somme des suivis de ses briques. */
export const suiviMensuelPour = (paliers: Palier[]) =>
  paliers.reduce((s, p) => s + suiviDe(p), 0);

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
  palier: Palier;
  /* Ce que la brique coûte chaque mois, construction et surveillance
     comprises. */
  mensualite: number;
  /* Ce que la brique rapporte chaque mois une fois sa mensualité payée. */
  gainNetMensuel: number;
  /* Vrai quand la mensualité absorbe le gain. La brique coûterait alors plus
     qu'elle ne rapporte et ne se recommande pas. */
  absorbee: boolean;
};

export type Resultat = {
  heuresMois: number;
  heuresRecuperees: number;
  coutAnnuel: number;
  taux: number;
  lignes: LigneResultat[];
  recommandees: LigneResultat[];
  /* Somme des mensualités avant remise, pour pouvoir afficher le rabais. */
  mensualitePleine: number;
  /* Mensualité du périmètre recommandé, remise de parc déduite. */
  mensualite: number;
  remiseAppliquee: boolean;
  /* Ce que la remise retire chaque mois. */
  remiseEuros: number;
  /* Valeur du temps rendu chaque mois par le périmètre recommandé. */
  gainMensuel: number;
  /* Le même, mensualité déduite. C'est le chiffre mis en avant. */
  gainNetPerimetre: number;
  /* Aucune brique ne rapporte plus que sa mensualité. Le dire franchement vaut
     mieux que de vendre une automatisation qui coûte plus que la main. */
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
  /* Le bareme est celui d un fondateur seul, l effectif l etire selon la
     sensibilite de la tache. Sans ce facteur, l estimateur donnait le meme
     volume administratif a une personne et a quarante. */
  const brut = choisies.map((t) => ({
    def: t,
    heures:
      t.bareme[r.frequences[t.id] ?? "semaine"] *
      facteurEffectif(r.taille, t.sensibilite),
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
    const mensualite = mensualiteDe(def.palier);
    /* Une seule comparaison décide, ce que la brique rend chaque mois contre ce
       qu'elle coûte chaque mois. Il n'y a plus de chantier à rembourser, donc
       plus de délai de retour. */
    const gainNetMensuel = gainAnnuel / 12 - mensualite;
    return {
      id: def.id,
      label: def.label,
      heuresMois,
      heuresRecuperees,
      gainAnnuel,
      palier: def.palier,
      mensualite,
      gainNetMensuel,
      absorbee: gainNetMensuel <= 0,
    };
  });

  const heuresMois = lignes.reduce((s, l) => s + l.heuresMois, 0);
  const heuresRecuperees = lignes.reduce((s, l) => s + l.heuresRecuperees, 0);
  const coutAnnuel = lignes.reduce((s, l) => s + l.gainAnnuel, 0);

  /* Priorisation. On classe par gain net décroissant, la brique qui laisse le
     plus dans la poche du client passe en premier. La tâche citée comme la plus
     agaçante ne remonte en tête que si son gain net reste à dix pour cent du
     meilleur. Au-delà, le calcul reprend la main. L'ancienne règle disait « à un
     mois de retour près », elle n'a plus d'objet sans prix de chantier, et ce
     seuil de dix pour cent est un réglage provisoire à confronter aux premiers
     diagnostics. */
  /* Une brique dont la mensualité absorbe le gain ne se recommande pas, même si
     le visiteur l'a citée comme la plus agaçante. On l'écarte avant le tri
     plutôt que de la classer dernière, sans quoi elle remonterait dès que le
     visiteur n'a coché que trois tâches. */
  const tri = lignes
    .filter((l) => !l.absorbee)
    .sort((a, b) => b.gainNetMensuel - a.gainNetMensuel);
  if (r.agace) {
    const i = tri.findIndex((l) => l.id === r.agace);
    if (i > 0 && tri[i].gainNetMensuel >= 0.9 * tri[0].gainNetMensuel) {
      const [pref] = tri.splice(i, 1);
      tri.unshift(pref);
    }
  }
  const recommandees = tri.slice(0, 3);

  /* La mensualité pleine sert à afficher la remise. Un rabais que le client
     ignore ne produit aucun effet commercial. */
  const parc = mensualitePour(recommandees.map((l) => l.palier));

  /* Le chiffre mis en avant est celui du périmètre recommandé dans son
     ensemble, remise comprise, celui que le client retrouvera sur sa facture. */
  const gainMensuel = recommandees.reduce((s, l) => s + l.gainAnnuel / 12, 0);
  const gainNetPerimetre = gainMensuel - parc.nette;

  return {
    heuresMois,
    heuresRecuperees,
    coutAnnuel,
    taux,
    lignes,
    recommandees,
    mensualitePleine: parc.pleine,
    mensualite: parc.nette,
    remiseAppliquee: parc.remise,
    remiseEuros: parc.pleine - parc.nette,
    gainMensuel,
    gainNetPerimetre,
    aucunRetour: recommandees.length === 0 || gainNetPerimetre <= 0,
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
