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
};

export type Palier = "simple" | "intermediaire" | "complexe";

export const TACHES: TacheDef[] = [
  { id: "devis", label: "Refaire mes devis à la main", bareme: { mois: 3, semaine: 7, jour: 16 }, palier: "intermediaire" },
  { id: "facturation", label: "Émettre mes factures et courir après les règlements", bareme: { mois: 3, semaine: 8, jour: 18 }, palier: "intermediaire" },
  { id: "appels-offres", label: "Répondre à des appels d'offres ou des dossiers de subvention", bareme: { mois: 6, semaine: 15, jour: 30 }, palier: "complexe" },
  { id: "onboarding", label: "La paperasse à chaque nouveau client", bareme: { mois: 3, semaine: 7, jour: 16 }, palier: "intermediaire" },
  { id: "rendez-vous", label: "Caler et rappeler des rendez-vous", bareme: { mois: 2, semaine: 5, jour: 12 }, palier: "simple" },
  { id: "comptes-rendus", label: "Rédiger mes comptes rendus", bareme: { mois: 2, semaine: 5, jour: 12 }, palier: "simple" },
  { id: "mails", label: "Répondre vingt fois la même chose par mail", bareme: { mois: 3, semaine: 10, jour: 22 }, palier: "intermediaire" },
  { id: "pieces", label: "Rassembler les pièces pour mon comptable", bareme: { mois: 3, semaine: 7, jour: 13 }, palier: "simple" },
  { id: "reporting", label: "Savoir où j'en suis sans attendre la fin du mois", bareme: { mois: 3, semaine: 5, jour: 10 }, palier: "intermediaire" },
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
/* Trois paliers depuis le 27/08/2026. Le tarif unique à 1 200 faisait facturer
   un lien de réservation au prix d'un moteur de facturation, ce qui se voyait
   et décrédibilisait toute la grille. */
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

/* Remise de parc, en pourcentage et non en montant fixe. Le forfait à 2 900 EUR
   supposait trois briques à 1 200. Avec des paliers mixtes il devenait absurde,
   trois simples valant 1 800 à l'unité et 2 900 en pack.

   À 20 %, trois intermédiaires donnent 2 880 EUR, soit l'ancien forfait à vingt
   euros près, et tout mélange se calcule seul. La remise s'affiche, un rabais
   que le client ignore ne sert personne. */
export const REMISE_PACK = 0.2;
export const SEUIL_PACK = 3;

/* En dessous, l'estimateur dit au visiteur de ne rien faire. Le seuil porte sur
   le coût annuel de son administratif, pas sur le prix d'un chantier. Abaissé de
   1 500 à 900 le 27/08/2026, en même temps que l'arrivée de la brique à 600, un
   administratif à 1 000 EUR par an pouvant désormais trouver son compte. */
export const SEUIL_PLANCHER = 900;

/* Suivi mensuel, indexé à la brique depuis le 25/08/2026. Il entre dans le
   calcul du retour, ce qui n'était pas le cas avant cette date. L'estimateur
   comparait un coût d'achat unique à un gain brut et ignorait la charge
   récurrente, ce qui raccourcissait tous les retours affichés.

   Dégressif, 190 EUR pour la première brique puis 150 pour chacune des
   suivantes. La première porte la relation, le compte et la revue mensuelle,
   les suivantes n'ajoutent que leur propre surveillance, et le prix suit cette
   asymétrie. Le socle est passé par 300 dans la journée du 25/08/2026, un
   niveau qui rendait la brique unique presque invendable, puis par un palier
   190 puis 200 qui inversait la dégressivité sans le vouloir. */
/* Socle abaissé de 300 à 190 EUR le 25/08/2026. À 300, une brique achetée
   seule devait libérer 7,3 h par mois pour se rembourser, et six des huit
   tâches du catalogue étaient refusées à 60 EUR de l'heure. Le niveau 2 était
   donc vendable en principe et rare en pratique. À 190, le seuil tombe à 5 h
   par mois et la porte d'entrée redevient franchissable. */
export const SUIVI_PREMIERE = 190;
/* Abaissee de 150 a 100 le 28/08/2026. La premiere brique porte la relation, le
   compte et la revue mensuelle, les suivantes n ajoutent que leur surveillance
   propre. Creuser l ecart rend le parc plus attractif que la brique isolee, ce
   qui est le sens commercial voulu. */
export const SUIVI_SUIVANTE = 100;

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
  palier: Palier;
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
  /* Somme des briques avant remise, pour pouvoir afficher le rabais. */
  coutPlein: number;
  remiseAppliquee: boolean;
  remiseEuros: number;
  coutBas: number;
  coutHaut: number;
  /* Suivi mensuel du périmètre recommandé, une fois le chantier livré. */
  suiviMensuel: number;
  /* Gain mensuel du périmètre une fois le suivi déduit. */
  gainNetPerimetre: number;
  /* La brique de tête ne couvre pas le socle, elle ne se vend donc
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
    const cout = prixDe(def.palier);
    /* Le suivi de la brique se déduit du gain avant de calculer le retour. Une
       brique qui libère 100 EUR de temps par mois et coûte 100 EUR de suivi ne
       rembourse rien, quel que soit son prix d'achat. */
    /* Deux lectures selon la position de la brique, le socle en première et la
       part marginale ensuite. Pour le tri et le filtre on retient la moins
       chère des deux, une brique méritant d'être gardée dès qu'elle se
       rembourse dans sa position la plus favorable. Le minimum plutôt que la
       part marginale, pour que le filtre reste juste quel que soit le sens de
       la dégressivité. Une lecture figée sur l'une des deux valeurs écarterait
       des briques qui tiennent très bien dans l'autre position. */
    const suiviLePlusFavorable = Math.min(SUIVI_PREMIERE, SUIVI_SUIVANTE);
    const gainNetMensuel = gainAnnuel / 12 - suiviLePlusFavorable;
    const roiMois = gainNetMensuel > 0 ? cout / gainNetMensuel : Infinity;
    return {
      id: def.id,
      label: def.label,
      heuresMois,
      heuresRecuperees,
      gainAnnuel,
      palier: def.palier,
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

  /* Le prix plein sert à afficher la remise. Un rabais que le client ignore ne
     produit aucun effet commercial, et l'ancien forfait à 2 900 masquait
     exactement cela, 700 EUR offerts sans que personne ne le sache. */
  const coutPlein = recommandees.reduce((s, l) => s + l.cout, 0);
  const remiseAppliquee = recommandees.length >= SEUIL_PACK;
  const coutChantier = remiseAppliquee
    ? Math.round((coutPlein * (1 - REMISE_PACK)) / 10) * 10
    : coutPlein;
  const remiseEuros = coutPlein - coutChantier;

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
    coutPlein,
    remiseAppliquee,
    remiseEuros,
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
