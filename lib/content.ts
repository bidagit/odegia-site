/* Source unique du contenu du site Odegia (FR).

   Odegia est la marque d'autonomisation du groupe Orbis Optima. Du grec
   hodegos, celui qui montre la route. On accompagne du niveau 1 au niveau 4,
   puis on rend la barre.

   Le modèle tarifaire vient des notes du vault du 2026-08-24, fiches
   « Odegia - Diagnostic Automatisation Admin » et « Odegia - Estimateur en
   ligne ». Il se compte en briques, pas en forfaits. Diagnostic à 290 EUR,
   brique simple à 1 200 EUR, brique complexe à 2 400 EUR. Ne pas réinventer
   ces montants ici, ils sont l'étalon commercial. */

export const SITE = {
  name: "Odegia",
  parent: "Orbis Optima Group",
  /* odegia.com porte le site, odegia.fr est detenu et doit rediriger vers
     odegia.com en 301 pour eviter le contenu duplique. */
  url: "https://odegia.com",
  urlAlias: "https://odegia.fr",
  email: "contact@odegia.com",
  city: "Paris, France",
  /* Prise de rendez-vous Google Agenda. C'est l'entree du tunnel, et c'est
     aussi la voie propre juridiquement. Depuis le 11/08/2026 la prospection
     telephonique exige un consentement explicite, un creneau choisi par le
     prospect vaut accord expres sur une date et une heure. Un bouton
     « rappelez-moi » ne le vaut pas. */
  booking: "https://calendar.app.google/ygEDt2Z5FZUkbmZP8",
};

/* ── Mentions légales ──────────────────────────────────────────────────────
   Identité reprise du dépôt footonthemoon-site, même éditeur. Deux valeurs
   restent à confirmer sur le Kbis, le capital social et la ville du RCS, et
   l'adresse du siège changera au transfert vers Vélizy, le greffe passant
   alors à Versailles. */
export const LEGAL = {
  editeur: "Orbis Optima SASU",
  forme: "Société par Actions Simplifiée Unipersonnelle",
  capital: "10 000 EUR",
  rcs: "Nanterre 981 792 450",
  siege: "16 rue Paul Rivet, 92350 Le Plessis-Robinson, France",
  directeur: "Adib Bensalem",
  siren: "981 792 450",
  siret: "981 792 450 00018",
  tva: "FR07 981 792 450",
  hebergeur: "OVH SAS",
  hebergeurAdresse: "2 rue Kellermann, 59100 Roubaix, France",
  hebergeurTel: "1007",
  maj: "24 août 2026",
};

export const LEGAL_LINKS = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "CGV", href: "/cgv" },
];

/* Chemins absolus, une ancre nue casserait depuis /estimation ou les pages
   legales, ou elle pointerait une section inexistante. */
export const NAV_LINKS = [
  { label: "Le principe", href: "/#principe" },
  { label: "Niveaux", href: "/#niveaux" },
  { label: "Briques", href: "/#briques" },
  { label: "Tarifs", href: "/#tarifs" },
  { label: "Estimation", href: "/estimation" },
];

export const HERO = {
  eyebrow: "Autonomisation administrative",
  title: ["Votre administratif", "tourne sans vous."],
  claim: "L'IA exécute, vous gouvernez.",
  body: "On mesure ce que votre administratif vous coûte, on automatise tâche par tâche, et on vous rend la barre. Vous n'intervenez plus que sur exception.",
  ctaPrimary: { label: "Réserver 15 minutes", href: SITE.booking },
  ctaSecondary: { label: "Estimer mon coût", href: "/estimation" },
  /* Le rendez-vous de 15 minutes n'est pas un diagnostic gratuit, il sert a
     dire si le diagnostic vaut le coup. Le dire ici evite les rendez-vous
     mal calibres et protege l'offre a 290 EUR. */
  ctaNote: "Quinze minutes pour savoir si un chantier a du sens chez vous. Sans engagement.",
  /* Le hero annonce le gain, jamais le prix. Le prix se lit plus bas, une fois
     que le visiteur a vu ce que son administratif lui coute deja. Les valeurs
     sont derivees du bareme du diagnostic, trois taches hebdomadaires typiques,
     70 % de temps recuperable, 60 EUR de l heure. Ce sont des estimations et le
     site le dit, le bareme n a pas encore ete confronte a un chantier reel. */
  stats: [
    { value: "jusqu'à 20 h", label: "récupérables chaque semaine" },
    { value: "70 %", label: "du temps d'une tâche automatisée, récupéré" },
    { value: "dès 2 mois", label: "pour rembourser votre investissement" },
  ],
  statsNote:
    "Estimations issues de notre grille de diagnostic. Le chiffre qui compte est le vôtre, il sort du rapport.",
};

/* Échelle transposée de l'échelle SAE de conduite automatisée, suivant la
   littérature sur les chaînes logistiques autonomes (Xu et al., 2024).

   sellable, les niveaux que l'on vend réellement. Le 4 reste la cible, mais
   les niveaux 2 et 3 se livrent et se facturent, ils ne sont pas des échecs.
   Le niveau 3 est même le bon niveau quand le coût d'une erreur est élevé. */
export const LEVELS = [
  {
    level: "0",
    title: "Manuel",
    body: "Chaque tâche est réalisée par une personne. Les outils stockent l'information, ils ne produisent rien.",
  },
  {
    level: "1",
    title: "Outillé",
    body: "Modèles, tableurs et macros accélèrent le travail humain. L'exécution reste entièrement humaine.",
  },
  {
    level: "2",
    title: "Automatisé par tâches",
    body: "Une tâche s'exécute seule, de bout en bout. Les enchaînements et les exceptions restent à votre main.",
    sellable: "Une brique isolée",
  },
  {
    level: "3",
    title: "Production automatisée, validation humaine",
    body: "Le système produit tout, vous validez avant envoi. C'est le bon niveau quand une erreur coûte cher.",
    sellable: "Une brique sous contrôle",
  },
  {
    level: "4",
    title: "Autonome sur un domaine",
    body: "Le système décide et agit seul sur un périmètre défini. Vous n'intervenez que sur exception.",
    sellable: "Un domaine complet",
    target: true,
  },
  {
    level: "5",
    title: "Autonome",
    body: "L'exécution entière est portée par des systèmes d'IA. L'humain conçoit le système et le gouverne, il ne l'opère plus.",
  },
];

/* La règle qui décide du niveau livré, reprise de la partie C du diagnostic.
   Elle vaut argument commercial autant que méthode. */
export const LEVEL_RULE = {
  title: "Le niveau n'est pas un objectif, c'est un arbitrage.",
  body: "Nous ne montons pas tout au niveau 4. Le niveau livré dépend du coût d'une erreur non détectée. Faible, la tâche s'exécute de bout en bout. Élevé, le système produit et vous validez avant envoi. Pousser le niveau 4 sur une tâche à fort risque se retournerait contre vous.",
  rows: [
    {
      when: "Le coût d'une erreur est faible",
      then: "Niveau 4, la tâche part sans vous",
    },
    {
      when: "Le coût d'une erreur est élevé",
      then: "Niveau 3, vous validez avant envoi",
    },
    {
      when: "La décision relève du jugement",
      then: "Nous vous le disons franchement",
    },
  ],
};

export const STEPS = [
  {
    numeral: "i",
    title: "Diagnostic",
    body: "Un formulaire de cinq minutes, puis un entretien de 90 minutes sur vos tâches les plus lourdes. Vous recevez un rapport de quatre pages sous 72 heures.",
  },
  {
    numeral: "ii",
    title: "Chiffrage",
    body: "Chaque tâche devient une brique, simple ou complexe, avec son gain annuel et son retour sur investissement en mois. Ce qui ne s'automatise pas est indiqué clairement.",
  },
  {
    numeral: "iii",
    title: "Construction",
    body: "On construit brique par brique, sur vos outils existants. Les abonnements restent à votre nom, et nous n'accédons jamais à vos moyens de paiement.",
  },
  {
    numeral: "iv",
    title: "Gouvernance",
    body: "Le système tourne, vous le gouvernez. On surveille, on corrige les dérives, et on ajoute des briques quand vous êtes prêt.",
  },
];

/* ── Les briques ───────────────────────────────────────────────────────────
   Catalogue repris de la partie E du diagnostic. La colonne « client » est
   formulée dans les mots du dirigeant, jamais en jargon de processus. */
export type Brique = {
  name: string;
  said: string;
};

export const BRIQUES: Brique[] = [
  { name: "Devis", said: "Je refais mes devis à la main à chaque fois" },
  { name: "Facturation", said: "Je cours après mes règlements" },
  {
    name: "Appels d'offres",
    said: "Je réponds à des appels d'offres ou des dossiers de subvention",
  },
  {
    name: "Onboarding client",
    said: "Chaque nouveau client me prend une demi-journée de paperasse",
  },
  {
    name: "Rendez-vous",
    said: "Je passe mon temps à caler et rappeler des rendez-vous",
  },
  { name: "Comptes rendus", said: "Je ne rédige jamais mes comptes rendus" },
  {
    name: "Mails récurrents",
    said: "Je réponds vingt fois la même chose par mail",
  },
  {
    name: "Pièces comptables",
    said: "Mon comptable me relance pour des pièces",
  },
  {
    name: "Reporting",
    said: "Je ne sais pas où j'en suis avant la fin du mois",
  },
];

export const BRIQUE_TYPES = [
  {
    label: "Brique simple",
    price: "1 200 EUR HT",
    criteria: "Règle stable, données déjà structurées, sortie toujours identique.",
  },
  {
    label: "Brique complexe",
    price: "2 400 EUR HT",
    criteria:
      "Règles à écrire, sources multiples, ou validation humaine à intégrer.",
  },
];

/* ── Tarifs ────────────────────────────────────────────────────────────────
   Deux pistes, même unité de compte. La brique vaut le même prix pour tout le
   monde, ce qui change est le volume et l'accompagnement. C'est ce qui rend
   l'entrée accessible à un fondateur seul sans brader la prestation. */

export type Offer = {
  index: string;
  name: string;
  duration: string;
  badge?: string;
  highlight: boolean;
  tagline: string;
  forWho: string;
  deliverables: { text: string; strong: boolean }[];
  price: string;
  priceSuffix: string;
  priceNote: string;
  cta: string;
  /* Absent, l'action retombe sur un mail prerempli. Present, elle pointe la
     prise de rendez-vous, ce qui vaut pour tout ce qui demarre par un echange. */
  ctaHref?: string;
};

export type Track = {
  id: "fondateurs" | "organisations";
  label: string;
  audience: string;
  intro: string;
  offers: Offer[];
};

export const TRACKS: Track[] = [
  {
    id: "fondateurs",
    label: "Fondateurs et TPE",
    audience: "Solo, ou moins de 10 personnes",
    intro:
      "On traite une à trois briques, choisies dans le catalogue, sur vos outils existants. Tout se fait à distance et le prix est connu d'avance.",
    offers: [
      {
        index: "01",
        name: "Diagnostic",
        duration: "rapport sous 72 h",
        badge: "Par où tout commence",
        highlight: false,
        tagline:
          "Un formulaire de cinq minutes, puis 90 minutes d'entretien sur vos tâches les plus lourdes. Vous repartez avec un rapport qui tient debout tout seul, que vous nous confiiez la suite ou non.",
        forWho:
          "Ceux qui veulent un chiffre avant de décider quoi que ce soit.",
        deliverables: [
          {
            text: "Ce que votre administratif vous coûte, en heures et en euros",
            strong: true,
          },
          {
            text: "Ce qui est automatisable, et ce qui ne l'est pas, avec les raisons",
            strong: true,
          },
          { text: "Trois briques maximum, dans l'ordre où s'y prendre", strong: false },
          { text: "Le retour sur investissement de chacune, en mois", strong: true },
          { text: "Un devis ferme, valable trente jours", strong: false },
        ],
        price: "290 EUR HT",
        priceSuffix: "",
        priceNote: "déduits si vous nous confiez le chantier",
        cta: "Réserver le diagnostic",
        ctaHref: SITE.booking,
      },
      {
        index: "02",
        name: "Briques",
        duration: "à l'unité",
        badge: "Le plus demandé",
        highlight: true,
        tagline:
          "On automatise tâche par tâche. Vous commencez par une seule brique, celle qui vous coûte le plus cher, et vous ajoutez les suivantes quand elle a fait ses preuves.",
        forWho:
          "Ceux qui perdent leurs journées sur une tâche répétitive déjà identifiée.",
        deliverables: [
          { text: "Brique simple à 1 200 EUR, complexe à 2 400 EUR", strong: true },
          { text: "Trois briques simples ensemble, 2 900 EUR", strong: true },
          { text: "Construite sur vos outils, sans les remplacer", strong: false },
          { text: "Niveau 2, 3 ou 4 selon le coût d'une erreur", strong: true },
          { text: "Règles et limites écrites avant construction", strong: false },
          { text: "Vos abonnements restent à votre nom", strong: false },
        ],
        price: "dès 1 200 EUR HT",
        priceSuffix: "/ brique",
        priceNote: "prix ferme, sorti du diagnostic",
        cta: "Choisir mes briques",
      },
      {
        index: "03",
        name: "Suivi",
        duration: "mensuel",
        badge: "La suite",
        highlight: false,
        tagline:
          "Le système est à vous. On le surveille, on corrige les dérives et on l'ajuste quand votre activité change.",
        forWho:
          "Ceux qui ne veulent pas devenir l'administrateur technique de leur propre système.",
        deliverables: [
          { text: "Supervision et correction des dérives", strong: true },
          { text: "Ajustements quand votre offre évolue", strong: false },
          { text: "Support asynchrone sous deux jours ouvrés", strong: false },
          { text: "Revue trimestrielle de votre niveau", strong: false },
        ],
        price: "190 EUR HT",
        priceSuffix: "/ mois",
        priceNote: "sans engagement de durée",
        cta: "Ajouter le suivi",
      },
    ],
  },
  {
    id: "organisations",
    label: "Organisations et PME",
    audience: "Associations, ESS, écoles, collectivités et PME",
    intro:
      "Périmètre ouvert, plusieurs briques couvrant un domaine entier, et des contraintes propres au secteur, marchés publics, subventions et pièces justificatives.",
    offers: [
      {
        index: "01",
        name: "Diagnostic étendu",
        duration: "2 semaines",
        badge: "Par où tout commence",
        highlight: false,
        tagline:
          "Le même instrument, élargi aux processus qui vivent hors des outils, et aux personnes qui les portent. Entretiens avec chaque fonction concernée.",
        forWho:
          "Les structures dont l'administratif est réparti entre plusieurs personnes.",
        deliverables: [
          { text: "Entretiens par fonction, pas seulement la direction", strong: false },
          { text: "Niveau d'autonomie mesuré sur six dimensions", strong: true },
          { text: "Cartographie des tâches et de leurs volumes", strong: false },
          { text: "Chiffrage du coût de l'exécution manuelle", strong: true },
          { text: "Plan séquencé, brique par brique", strong: false },
        ],
        price: "sur devis",
        priceSuffix: "",
        priceNote: "à partir de 1 200 EUR HT, déduits du chantier",
        cta: "Demander un diagnostic",
        ctaHref: SITE.booking,
      },
      {
        index: "02",
        name: "Domaine complet",
        duration: "selon périmètre",
        badge: "Le moteur",
        highlight: true,
        tagline:
          "Plusieurs briques couvrant un domaine entier, monté au niveau 4. Il décide et agit seul, vous n'intervenez plus que sur exception.",
        forWho:
          "Les structures qui veulent qu'une fonction entière tourne sans mobiliser quelqu'un en permanence.",
        deliverables: [
          { text: "Même unité de compte, la brique", strong: true },
          { text: "1 200 EUR la simple, 2 400 EUR la complexe", strong: true },
          { text: "Intégration à vos outils existants", strong: false },
          { text: "Tableau de bord, alertes et garde-fous", strong: true },
          { text: "Formation de vos équipes à la gouvernance", strong: false },
          { text: "Briques nouvelles créées si besoin", strong: false },
        ],
        price: "dès 2 900 EUR HT",
        priceSuffix: "",
        priceNote: "le devis compte les briques, il n'y a pas de forfait caché",
        cta: "Chiffrer un domaine",
      },
      {
        index: "03",
        name: "Gouvernance",
        duration: "mensuel",
        badge: "La suite",
        highlight: false,
        tagline:
          "Le système est à vous. On le surveille, on traite ce qu'il ne sait pas trancher, et on étend son périmètre.",
        forWho:
          "Les structures déjà déployées qui veulent monter en autonomie sans recruter une équipe technique.",
        deliverables: [
          { text: "Supervision continue et traitement des alertes", strong: true },
          { text: "Arbitrage des exceptions escaladées", strong: false },
          { text: "Extension progressive à de nouveaux domaines", strong: true },
          { text: "Revue trimestrielle du niveau atteint", strong: false },
        ],
        price: "sur devis",
        priceSuffix: "",
        priceNote: "calé sur le nombre de briques en service",
        cta: "Parler de la gouvernance",
      },
    ],
  },
];

export const FAQ = [
  {
    q: "Pourquoi vendre des briques plutôt qu'un forfait ?",
    a: "Parce qu'un forfait oblige à acheter un périmètre entier avant d'avoir vu quoi que ce soit. Une brique est une tâche, elle a son prix, son gain annuel et son retour sur investissement. Vous en achetez une, vous la voyez tourner, puis vous décidez de la suite. C'est aussi pourquoi nous préférons cadrer un périmètre plutôt que de partir sur un « automatisez-moi tout », plus difficile à tenir des deux côtés.",
  },
  {
    q: "Faut-il viser le niveau 4 partout ?",
    a: "Non, et ce ne serait pas souhaitable sur certaines tâches. Le niveau livré dépend du coût d'une erreur non détectée. Quand il est faible, la tâche part sans vous, c'est le niveau 4. Quand il est élevé, le système produit tout et vous validez avant envoi, c'est le niveau 3, et il se vend aussi bien. Une brique isolée qui tourne seule est déjà du niveau 2, et elle vous rend vos heures.",
  },
  {
    q: "Que se passe-t-il si une tâche n'est pas automatisable ?",
    a: "Nous l'indiquons dans le rapport, avec la raison. Si votre décision relève du jugement plutôt que d'une règle, l'automatisation tiendrait mal dans le temps. Vous dire ce qui ne s'automatise pas fait partie du travail que vous payez, et cela vous évite d'investir au mauvais endroit.",
  },
  {
    q: "En quoi est-ce différent d'une prestation d'automatisation ?",
    a: "Automatiser, c'est exécuter plus vite une décision déjà prise par une personne. À partir du niveau 4, c'est le système qui prend la décision opérationnelle sur son périmètre. La différence se voit sur votre agenda, pas sur la facture d'outillage.",
  },
  {
    q: "Faut-il changer nos outils ?",
    a: "Non. Nous construisons autour de votre existant, facturation, messagerie, agenda, tableurs. Les abonnements restent à votre nom et sont payés par vous. Remplacer vos outils allongerait le projet de plusieurs mois sans rien apporter à votre autonomie.",
  },
  {
    q: "Accédez-vous à nos comptes bancaires ?",
    a: "Non, à aucun moment, y compris en lecture seule, et cet engagement figure au contrat. L'IA exécute, l'humain gouverne. Un système qui prépare un ordre de paiement le soumet à une personne, il ne le déclenche pas.",
  },
  {
    q: "Nos données sortent-elles de la structure ?",
    a: "Cela dépend du domaine traité et de votre niveau de sensibilité. Lorsque la confidentialité l'impose, nous déployons des modèles exécutés localement. Ce choix se décide au diagnostic, avant toute construction.",
  },
];
