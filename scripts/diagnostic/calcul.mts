/* Moteur de calcul du diagnostic payant.

   Il importe les constantes de l estimateur au lieu de les recopier. Le rapport
   et l estimation en ligne sortent donc les memes mensualites, la meme remise,
   la meme part recuperable et la meme regle de decision, par construction. Une grille
   recopiee dans un tableur finit toujours par diverger, et le client le voit
   quand il compare les deux documents.

   Ce qui differe de l estimateur, c est la matiere. L estimateur part de
   baremes supposes, le diagnostic part de frequences et de durees relevees en
   entretien. Le bareme reste calcule a cote, a titre d etalon, pour que chaque
   diagnostic serve aussi a corriger l estimateur.

   Aucun chiffre du rapport ne passe par un modele de langage. Le skill
   diagnostic-odegia ecrit la prose, ce fichier ecrit les nombres. */

import {
  TACHES,
  TAILLES,
  MENSUALITE,
  mensualiteDe,
  mensualitePour,
  ENGAGEMENT_MOIS,
  RACHAT_MENSUALITES,
  NOM_PALIER,
  PART_RECUPERABLE,
  REMISE_PACK,
  SEUIL_PACK,
  facteurEffectif,
  type Palier,
  type Frequence,
} from "../../lib/estimator.ts";

/* Version de la methode, inscrite dans chaque calcul et chaque rapport. Elle
   change a chaque regle de decision, definition de mesure ou grille modifiee,
   et le protocole du vault dit ce que chaque version contient. Un rapport se
   relit toujours avec les regles de sa version. */
export const METHODE_VERSION = "2.0";

/* v2.0, decision d Adib du 02/10/2026. Une brique n a plus de prix de chantier
   ni de suivi separe, elle a une mensualite constante, construction et
   surveillance comprises. Tout ce qui se calculait en delai de retour se
   calcule desormais en solde mensuel, ce que la brique rend moins ce qu elle
   coute. Une brique se recommande quand ce solde est positif.

   Remise accordee a tout client deja servi par une autre marque du groupe,
   decision du 26/08/2026. Elle portait sur le premier chantier. Sans chantier,
   elle porte sur la mensualite pendant les douze mois d engagement, puis le
   prix public revient. Une remise sans fin sur du recurrent serait une perte
   permanente. Elle ne s affiche jamais sur le site, une remise publiee
   devenant un prix. D ou sa place ici et non dans estimator.ts. */
export const REMISE_GROUPE = 0.2;

/* Le taux est celui que declare le client, pour chaque acteur, decision du
   01/10/2026. Celui-ci ne s applique que s il ne sait pas le chiffrer, et le
   rapport l annonce alors comme une hypothese. */
export const TAUX_PAR_DEFAUT = 60;

/* Ecart tolere pour que la tache la plus agacante passe en tete. Elle remonte
   si son solde mensuel atteint 90 % du meilleur. Remplace depuis la v2.0 la
   regle « a un mois de retour pres », qui n a plus d objet. Reglage provisoire,
   a confronter aux premiers diagnostics. */
export const TOLERANCE_AGACE = 0.9;

/* Regles v1.1, arretees par Adib le 01/10/2026 apres l essai Chamil.

   Un parcours regroupe des taches qui s enchainent sur la meme occurrence, la
   sortie de l une declenchant la suivante, comme la demande, le devis, le
   dossier, la facture et les relances d une meme inscription. Mesurees une par
   une, aucune ne couvrait sa mensualite, alors qu elles se construisent et
   se surveillent comme un seul systeme. Un parcours se chiffre en une brique
   complexe et porte une seule mensualite. Trois taches au moins, en dessous ce n est
   qu une paire de briques.

   Le controle de coherence compare l inventaire aux heures que le client
   declare. Au-dela de 25 % d ecart, l inventaire est incomplet ou les durees
   sont fausses, et on le reprend avant de selectionner. */
/* Temps de bascule, v1.2, decision d Adib du 01/10/2026. Le temps de se
   remettre dans une tache avant et de s en defaire apres, declare par le
   client pour chaque tache, de 0 a 30 %. Il s ajoute a la duree active et
   compte partout, cout et gain, quel que soit le niveau livre.

   20 % par defaut depuis la v1.3, annonce au client qui corrige tache par
   tache. Plus simple a poser qu une question ouverte sur chaque ligne. */
export const BASCULE_MAX = 0.3;
export const BASCULE_DEFAUT = 0.2;

/* Cadence de supervision du livre, chapitre 11, en minutes. Elle se fixe par
   client au diagnostic, champ cadence d entree.json, decision du 01/10/2026,
   proportionnee a son volume. Celle du livre ne vaut que par defaut. Une valeur
   a zero disparait de la phrase du rapport. */
export const CADENCE_LIVRE = { jour: 15, semaine: 45, mois: 120 };

/* Projection, v1.4, decision d Adib du 01/10/2026. Une brique se paie sur
   l avenir, le verdict se calcule donc sur l estimation du client pour les
   douze prochains mois, plafonnee a quatre fois le volume mesure. Le plafond
   protege contre l optimisme d un client qui veut se soulager. Passe de deux a
   trois pour ne pas ecarter une startup en forte croissance, puis a quatre le
   01/10/2026, decision d Adib. Le cout de la
   partie 1 reste celui du volume mesure, c est ce que le client paie deja. */
export const PLAFOND_PROJECTION = 4;
/* v1.7, decision d Adib du 01/10/2026. Le plafond tombe pour une tache dont le
   volume est engage, preuve a l appui, dates fixees, inscriptions recues,
   contrats signes. La preuve s ecrit dans le champ engage, elle est reprise
   dans le rapport. Une annonce sans preuve reste plafonnee. */

/* Delais de la feuille de route, en semaines, v1.5. HYPOTHESES, jamais
   mesurees, a confronter au premier chantier chronometre. Le socle compte une
   semaine par tranche de quatre regles a ecrire ou sources a rassembler, la
   construction une duree par palier, enchainees, la supervision une semaine de
   mise en place puis quatre de rodage ou tout passe par validation. */
export const SEMAINES_SOCLE_PAR = 4;
export const SEMAINES_SOCLE_MAX = 6;
export const SEMAINES_PALIER: Record<Palier, number> = { simple: 1, intermediaire: 2, complexe: 4 };
export const SEMAINES_SUPERVISION = 1;
export const SEMAINES_RODAGE = 4;
/* Horizon de la comparaison longue du rapport, temps rendu contre mensualites. */
export const HORIZON_MOIS = 36;

export const PALIER_PARCOURS: Palier = "complexe";
export const TACHES_MIN_PARCOURS = 3;
export const ECART_COHERENCE_MAX = 0.25;

const ORDRE_PALIERS: Palier[] = ["simple", "intermediaire", "complexe"];

export type TacheDiag = {
  id: string;
  /* Le nom que le client donne a la tache, repris tel quel dans le devis. */
  nom: string;
  /* Identifiant d une tache du catalogue de l estimateur, ou null pour une
     brique nouvelle, chiffree en complexe par regle. */
  catalogue: string | null;
  declencheur: string;
  entrees: string;
  sortie: string;
  destinataire: string;
  acteur: string;
  /* Nombre d occurrences sur douze mois, saisonnalite comprise, et duree
     active d une occurrence typique. Unite annuelle unique depuis la v1.0,
     une activite par sejours ou par saisons n entrait pas dans un releve
     mensuel. Definitions completes dans le glossaire du protocole. */
  frequenceAn: number;
  /* Estimation du client pour les douze prochains mois, v1.4. Absente, le
     volume mesure est reconduit. */
  frequenceAnProchaine?: number;
  /* Preuve que le volume a venir est engage, v1.7. Presente, pas de plafond. */
  engage?: string;
  dureeMinutes: number;
  /* Temps de bascule declare, 0, 0.1, 0.2 ou 0.3, v1.2. Absent, 0.2. */
  bascule?: number;
  /* La regle est-elle ecrite quelque part, v1.3. Non, la tache se documente
     avant de s automatiser ou de se deleguer. */
  regleEcrite?: boolean;
  /* Taux propre a l acteur quand ce n est pas le dirigeant. */
  tauxActeur?: number;
  /* Les quatre questions de la partie C. */
  regle: boolean;
  donneesExistent: boolean;
  sortieStandard: boolean;
  coutErreur: "faible" | "eleve";
  /* Eliminer avant d automatiser. Une tache qui peut disparaitre ne se
     construit pas, elle se supprime, et le rapport le dit. */
  aSupprimer?: boolean;
  /* Phrase ecrite par le skill, raison du verdict dans les mots du client. */
  motif?: string;
  /* Identifiant du parcours auquel la tache appartient, v1.1. */
  parcours?: string;
};

export type Entree = {
  client: {
    nom: string;
    entite: string;
    representant: string;
    adresse?: string;
    activite: string;
    taille: string;
  };
  dateEntretien: string;
  taux: number | null;
  agace: string | null;
  pertes: string | null;
  remiseGroupe: boolean;
  /* offert, le cas courant depuis le 02/10/2026. deduit, un diagnostic paye
     dont le montant vaut les premieres mensualites. */
  diagnostic: { prix: number; deduit: boolean; offert?: boolean };
  taches: TacheDiag[];
  /* Etape 0 du livre, v1.3. Ce que l organisation produit, pour qui, et par
     quel flux principal la valeur se fabrique. */
  definition?: { produit: string; pourQui: string; fluxDeValeur: string };
  cadence?: { jour: number; semaine: number; mois: number };
  /* Nom de chaque parcours, par identifiant, v1.1. */
  parcours?: Record<string, string>;
  /* Controle de coherence, v1.1. Heures declarees au questionnaire, et somme
     des heures par an de l inventaire de la page 3. */
  heuresDeclareesSemaine?: number;
  inventaireHeuresAn?: number;
  redaction?: Record<string, string>;
  chrono?: Record<string, number>;
};

export type Unite = {
  id: string;
  nom: string;
  parcours: boolean;
  taches: string[];
  palier: Palier;
  mensualite: number;
  niveau: 3 | 4;
  heuresMois: number;
  heuresRecuperees: number;
  gainMensuel: number;
  /* Ce que l unite rend chaque mois une fois sa mensualite payee. */
  gainNetMensuel: number;
  /* La mensualite absorbe le gain, l unite ne se recommande pas. */
  absorbee: boolean;
};

export type Verdict = "brique" | "supprimer" | "jugement" | "sur-devis";

export type LigneDiag = TacheDiag & {
  taux: number;
  /* Frequence retenue pour le verdict, estimation plafonnee. */
  frequenceRetenue: number;
  plafonnee: boolean;
  /* Volume mesure, pour la partie 1 et l etalon. */
  heuresMoisMesure: number;
  coutAnnuelMesure: number;
  /* Heures actives seules, sans bascule, pour l etalon et la coherence. */
  heuresActivesMois: number;
  heuresMois: number;
  coutAnnuel: number;
  verdict: Verdict;
  palier: Palier | null;
  paliersMontes: number;
  cadrage: boolean;
  niveau: 3 | 4;
  heuresRecuperees: number;
  gainMensuel: number;
  mensualite: number;
  gainNetMensuel: number;
  absorbee: boolean;
  /* Etalon, jamais montre au client. */
  bande: Frequence | null;
  heuresBareme: number | null;
  ecartBareme: number | null;
};

/* Bande de frequence de l estimateur la plus proche de la frequence relevee.
   Quelques fois par mois, toutes les semaines, tous les jours ou presque. */
export const bandeDe = (frequenceAn: number): Frequence =>
  frequenceAn >= 144 ? "jour" : frequenceAn >= 48 ? "semaine" : "mois";

const arrondi5 = (n: number) => Math.round(n / 5) * 5;

export function diagnostiquer(e: Entree) {
  if (!TAILLES.includes(e.client.taille)) {
    throw new Error(
      `taille inconnue "${e.client.taille}", attendu l une de ${TAILLES.join(" | ")}`
    );
  }
  const tauxClient = e.taux ?? TAUX_PAR_DEFAUT;

  const lignes: LigneDiag[] = e.taches.map((t) => {
    const def = t.catalogue ? TACHES.find((x) => x.id === t.catalogue) : null;
    if (t.catalogue && !def) {
      throw new Error(`tache ${t.id}, catalogue "${t.catalogue}" inconnu`);
    }
    const taux = t.tauxActeur ?? tauxClient;
    if (!(t.frequenceAn >= 0) || !(t.dureeMinutes >= 0)) {
      throw new Error(`tache ${t.id}, frequenceAn et dureeMinutes sont obligatoires`);
    }
    const bascule = Math.min(Math.max(t.bascule ?? BASCULE_DEFAUT, 0), BASCULE_MAX);
    const estimee = t.frequenceAnProchaine ?? t.frequenceAn;
    /* Sans historique, rien a plafonner, l estimation passe telle quelle et
       l etalon le signale. */
    const plafond = t.engage || t.frequenceAn <= 0 ? Infinity : t.frequenceAn * PLAFOND_PROJECTION;
    const frequenceRetenue = Math.min(estimee, plafond);
    const plafonnee = estimee > plafond;
    const heuresActivesMois = (t.frequenceAn * t.dureeMinutes) / 60 / 12;
    const heuresMoisMesure = heuresActivesMois * (1 + bascule);
    const heuresMois = ((frequenceRetenue * t.dureeMinutes) / 60 / 12) * (1 + bascule);
    const coutAnnuel = heuresMois * 12 * taux;
    const coutAnnuelMesure = heuresMoisMesure * 12 * taux;

    /* Le verdict suit l ordre de la fiche. Supprimer passe devant tout, puis la
       question d entree, regle ou jugement, puis les deux questions de prix. */
    const non = Number(!t.donneesExistent) + Number(!t.sortieStandard);
    let verdict: Verdict = "brique";
    if (t.aSupprimer) verdict = "supprimer";
    else if (!t.regle) verdict = "jugement";
    else if (non === 2) verdict = "sur-devis";

    /* Palier de depart, celui du catalogue, ou complexe pour une brique
       nouvelle. Un seul non aux questions de prix le monte d un cran.
       Validee par Adib le 01/10/2026, methode v1.0. Elle transpose aux trois
       paliers la regle du 25/08, ou un seul oui faisait passer de simple a
       complexe dans une grille qui n avait que deux marches. */
    const base: Palier = def ? def.palier : "complexe";
    const paliersMontes = verdict === "brique" && non === 1 ? 1 : 0;
    const palier: Palier | null =
      verdict === "brique"
        ? ORDRE_PALIERS[Math.min(ORDRE_PALIERS.indexOf(base) + paliersMontes, 2)]
        : null;

    const heuresRecuperees = heuresMois * PART_RECUPERABLE;
    const gainMensuel = heuresRecuperees * taux;
    /* Meme lecture que l estimateur depuis la v2.0, ce que la brique rend
       chaque mois contre ce qu elle coute chaque mois. */
    const mensualite = palier ? mensualiteDe(palier) : 0;
    const gainNetMensuel = gainMensuel - mensualite;

    const bande = def ? bandeDe(t.frequenceAn) : null;
    const heuresBareme = def && bande
      ? def.bareme[bande] * facteurEffectif(e.client.taille, def.sensibilite)
      : null;

    return {
      ...t,
      bascule,
      taux,
      frequenceRetenue,
      plafonnee,
      heuresMoisMesure,
      coutAnnuelMesure,
      heuresActivesMois,
      heuresMois,
      coutAnnuel,
      verdict,
      palier,
      paliersMontes,
      cadrage: non === 1,
      niveau: t.coutErreur === "eleve" ? 3 : 4,
      heuresRecuperees,
      gainMensuel,
      mensualite,
      gainNetMensuel,
      absorbee: verdict === "brique" && gainNetMensuel <= 0,
      bande,
      heuresBareme,
      /* L estimateur ne connait que le temps actif, l etalon compare donc a lui. */
      ecartBareme: heuresBareme ? heuresActivesMois / heuresBareme - 1 : null,
    };
  });

  /* Unites de construction, v1.1. Une tache automatisable hors parcours est
     sa propre brique. Les taches d un meme parcours, verdict brique, n en
     forment qu une. Celles qui relevent du jugement ou se suppriment restent
     hors du parcours, il ne les automatise pas. */
  const groupes = new Map<string, LigneDiag[]>();
  /* Une tache sur devis appartient au parcours dont elle fait partie, v1.6,
     decision d Adib du 01/10/2026. Ses donnees dispersees et sa sortie variable
     demandent un travail de structuration que la mensualite d un parcours
     complexe couvre deja. Cas d origine, les questions des familles de Chamil avant
     preinscription, porte d entree du parcours. */
  const dansUnParcours = (l: LigneDiag) => (l.verdict === "brique" || l.verdict === "sur-devis") && !!l.parcours;
  for (const l of lignes) {
    if (dansUnParcours(l)) {
      groupes.set(l.parcours!, [...(groupes.get(l.parcours!) ?? []), l]);
    }
  }
  const parcoursRetenus = new Set(
    [...groupes].filter(([, ls]) => ls.length >= TACHES_MIN_PARCOURS).map(([id]) => id)
  );
  const unites: Unite[] = [];
  for (const l of lignes) {
    if (l.parcours && parcoursRetenus.has(l.parcours) && dansUnParcours(l)) continue;
    if (l.verdict !== "brique") continue;
    unites.push({
      id: l.id, nom: l.nom, parcours: false, taches: [l.id], palier: l.palier!,
      mensualite: l.mensualite, niveau: l.niveau, heuresMois: l.heuresMois,
      heuresRecuperees: l.heuresRecuperees, gainMensuel: l.gainMensuel,
      gainNetMensuel: l.gainNetMensuel, absorbee: l.absorbee,
    });
  }
  for (const id of parcoursRetenus) {
    const ls = groupes.get(id)!;
    const mensualite = mensualiteDe(PALIER_PARCOURS);
    const gainMensuel = ls.reduce((a, l) => a + l.gainMensuel, 0);
    const gainNetMensuel = gainMensuel - mensualite;
    unites.push({
      id, nom: e.parcours?.[id] ?? id, parcours: true, taches: ls.map((l) => l.id),
      palier: PALIER_PARCOURS, mensualite,
      /* Une seule etape a cout d erreur eleve suffit pour que le client valide. */
      niveau: ls.some((l) => l.niveau === 3) ? 3 : 4,
      heuresMois: ls.reduce((a, l) => a + l.heuresMois, 0),
      heuresRecuperees: ls.reduce((a, l) => a + l.heuresRecuperees, 0),
      gainMensuel, gainNetMensuel,
      absorbee: gainNetMensuel <= 0,
    });
  }
  const uniteDe = (tacheId: string) => unites.find((u) => u.taches.includes(tacheId));

  /* Priorisation, identique a l estimateur, sur les unites et non plus sur les
     taches. Le plus gros solde mensuel d abord. */
  const tri = unites.filter((u) => !u.absorbee).sort((a, b) => b.gainNetMensuel - a.gainNetMensuel);
  let agaceRemontee = false;
  let agaceEcartee = false;
  const agace = e.agace ? uniteDe(e.agace)?.id : undefined;
  if (agace) {
    const i = tri.findIndex((u) => u.id === agace);
    if (i > 0 && tri[i].gainNetMensuel >= TOLERANCE_AGACE * tri[0].gainNetMensuel) {
      tri.unshift(tri.splice(i, 1)[0]);
      agaceRemontee = true;
    } else if (i > 0) {
      agaceEcartee = true;
    }
  }
  const recommandees = tri.slice(0, 3);
  const suivantes = tri.slice(3);
  const tete = recommandees[0] ?? null;

  /* Le chiffre de tete, ce que la premiere brique laisse chaque mois une fois
     sa mensualite payee. C est le seul chiffre en gras du rapport. */
  const gainNetTete = tete ? tete.gainNetMensuel : null;

  /* Chaque brique a sa place dans l ordre, avec sa mensualite et son solde. */
  const positions = recommandees.map((l) => ({
    id: l.id, mensualite: l.mensualite, gainNetMensuel: l.gainNetMensuel,
  }));

  /* La mensualite du perimetre. Remise de parc d abord, sans fin, puis remise
     du groupe pendant les douze mois d engagement seulement. */
  const parc = mensualitePour(recommandees.map((u) => u.palier), true);
  const mensualiteEnsuite = parc.nette;
  const mensualiteEngagement = e.remiseGroupe
    ? arrondi5(mensualiteEnsuite * (1 - REMISE_GROUPE))
    : mensualiteEnsuite;
  /* Un diagnostic paye vaut les premieres mensualites, a hauteur de son prix. */
  const creditDiagnostic = e.diagnostic.deduit && !e.diagnostic.offert ? e.diagnostic.prix : 0;

  const gainMensuelPerimetre = recommandees.reduce((s, l) => s + l.gainMensuel, 0);
  const gainNetPerimetre = gainMensuelPerimetre - mensualiteEngagement;

  const heuresMois = lignes.reduce((s, l) => s + l.heuresMois, 0);
  const coutAnnuel = lignes.reduce((s, l) => s + l.coutAnnuel, 0);

  /* Orientation de chaque tache, les quatre routes du livre, v1.3. Une tache
     a regle qui ne couvre pas sa mensualite a ce volume se delegue, avec
     des instructions ecrites. Documenter d abord vaut pour toute tache dont la
     regle n est ecrite nulle part, quelle que soit la suite. */
  const retenues = new Set([...recommandees, ...suivantes].map((u) => u.id));
  const orientations = lignes.map((l) => {
    let route: "eliminer" | "a-votre-main" | "automatiser" | "deleguer";
    if (l.verdict === "supprimer") route = "eliminer";
    else if (l.verdict === "jugement") route = "a-votre-main";
    else route = retenues.has(uniteDe(l.id)?.id ?? "") ? "automatiser" : "deleguer";
    const documenter = route !== "eliminer" && route !== "a-votre-main" && l.regleEcrite === false;
    return { id: l.id, route, documenter };
  });

  /* Feuille de route en quatre temps, ordre du livre. Socle, execution,
     supervision, calibrage. Le socle liste ce qui doit exister avant de
     construire, il ne se saute pas. */
  const dansRoute = (r: string) => orientations.filter((o) => o.route === r).map((o) => o.id);
  const feuilleDeRoute = {
    eliminer: dansRoute("eliminer"),
    rassembler: lignes
      .filter((l) => !l.donneesExistent && ["automatiser", "deleguer"].includes(orientations.find((o) => o.id === l.id)!.route))
      .map((l) => l.id),
    documenter: orientations.filter((o) => o.documenter).map((o) => o.id),
    construire: recommandees.map((u) => ({ id: u.id, niveau: u.niveau })),
    ensuite: suivantes.map((u) => u.id),
    deleguer: dansRoute("deleguer"),
    aVotreMain: dansRoute("a-votre-main"),
    fileExceptions: recommandees.filter((u) => u.niveau === 3).map((u) => u.id),
    cadence: e.cadence ?? CADENCE_LIVRE,
    /* Calendrier en semaines depuis la signature. */
    calendrier: (() => {
      const nSocle = new Set([...dansRoute("eliminer"),
        ...lignes.filter((l) => !l.donneesExistent).map((l) => l.id),
        ...orientations.filter((o) => o.documenter).map((o) => o.id)]).size;
      const socle = Math.min(SEMAINES_SOCLE_MAX, Math.max(1, Math.ceil(nSocle / SEMAINES_SOCLE_PAR)));
      let t = socle;
      const briques = recommandees.map((u) => {
        const debut = t + 1;
        t += SEMAINES_PALIER[u.palier];
        return { id: u.id, debut, fin: t };
      });
      const supervision = briques.length ? { debut: briques[0].fin + 1, fin: briques[0].fin + SEMAINES_SUPERVISION + SEMAINES_RODAGE } : null;
      const calibrage = supervision ? supervision.fin + 1 : null;
      return { socle: { debut: 1, fin: socle }, briques, supervision, calibrage };
    })(),
  };

  /* Ce que le client recupere et ce qu il paie, chaque mois. Sur le perimetre
     recommande, ou a defaut sur l automatisation la plus proche, pour qu il
     puisse passer outre en connaissance de cause. */
  const avecGroupe = (m: number) => (e.remiseGroupe ? arrondi5(m * (1 - REMISE_GROUPE)) : m);
  const bilanMensuel = (() => {
    const base = recommandees.length
      ? { recommande: true, heures: recommandees.reduce((a, u) => a + u.heuresRecuperees, 0), valeur: gainMensuelPerimetre, mensualite: mensualiteEngagement, ensuite: mensualiteEnsuite }
      : unites.length
        ? (() => {
            const u = [...unites].sort((a, b) => b.gainMensuel - a.gainMensuel)[0];
            return { recommande: false, heures: u.heuresRecuperees, valeur: u.gainMensuel, mensualite: avecGroupe(u.mensualite), ensuite: u.mensualite };
          })()
        : null;
    if (!base) return null;
    return { ...base, solde: base.valeur - base.mensualite,
      valeurHorizon: base.valeur * HORIZON_MOIS,
      coutHorizon: base.mensualite * ENGAGEMENT_MOIS + base.ensuite * (HORIZON_MOIS - ENGAGEMENT_MOIS) };
  })();

  /* Les automatisations les plus proches du seuil, recommandees ou non,
     chacune lue seule. Le calcul ne compte que le temps rendu, ni la charge
     mentale ni l usage du temps libere. Le client doit pouvoir passer outre en
     connaissance de cause, d ou les chiffres complets et le seuil qui ferait
     basculer le verdict. */
  const candidats = [...unites]
    .sort((a, b) => b.gainMensuel - a.gainMensuel)
    .slice(0, 3)
    .map((u) => {
      const valeurHeure = u.heuresRecuperees > 0 ? u.gainMensuel / u.heuresRecuperees : 0;
      return {
        id: u.id,
        recommande: recommandees.some((r) => r.id === u.id),
        mensualite: u.mensualite,
        heuresRecuperees: u.heuresRecuperees,
        gainMensuel: u.gainMensuel,
        netMensuel: u.gainNetMensuel,
        /* Heures rendues par mois a partir desquelles la mensualite est
           couverte, au taux de ses propres taches. */
        heuresSeuil: valeurHeure > 0 ? u.mensualite / valeurHeure : null,
        /* Sur deux ans, ce qu elle coute et ce qu elle rend en temps. */
        cout24: 24 * u.mensualite,
        rendu24: 24 * u.gainMensuel,
      };
    });

  const coherence =
    e.heuresDeclareesSemaine && e.inventaireHeuresAn
      ? (() => {
          const declarees = e.heuresDeclareesSemaine * 52;
          const ecart = e.inventaireHeuresAn / declarees - 1;
          return { declarees, inventaire: e.inventaireHeuresAn, ecart, aReprendre: Math.abs(ecart) > ECART_COHERENCE_MAX };
        })()
      : null;

  return {
    methode: METHODE_VERSION,
    genereLe: new Date().toISOString(),
    parametres: {
      MENSUALITE,
      NOM_PALIER,
      PART_RECUPERABLE,
      REMISE_PACK,
      SEUIL_PACK,
      REMISE_GROUPE,
      ENGAGEMENT_MOIS,
      RACHAT_MENSUALITES,
      HORIZON_MOIS,
      BASCULE_MAX,
      PLAFOND_PROJECTION,
      tauxHypothese: e.taux === null,
      taux: tauxClient,
    },
    totaux: {
      heuresMois,
      coutAnnuel,
      heuresMoisMesure: lignes.reduce((a, l) => a + l.heuresMoisMesure, 0),
      coutAnnuelMesure: lignes.reduce((a, l) => a + l.coutAnnuelMesure, 0),
    },
    projection: lignes.some((l) => l.frequenceRetenue !== l.frequenceAn),
    coherence,
    lignes,
    unites,
    candidats,
    orientations,
    feuilleDeRoute,
    bilanMensuel,
    definition: e.definition ?? null,
    parcoursTropCourts: [...groupes.keys()].filter((id) => !parcoursRetenus.has(id)),
    recommandees: recommandees.map((l) => l.id),
    suivantes: suivantes.map((l) => l.id),
    agaceRemontee,
    agaceEcartee,
    tete: tete?.id ?? null,
    gainNetTete,
    positions,
    /* Rien ne rend plus que sa mensualite. Le rapport le dit et ne propose
       aucun devis, sauf a la demande du client. */
    aucuneRecommandation: recommandees.length === 0,
    devis: {
      mensualitePleine: parc.pleine,
      remisePack: parc.remise,
      remisePackEuros: parc.pleine - mensualiteEnsuite,
      remiseGroupe: e.remiseGroupe,
      remiseGroupeEuros: mensualiteEnsuite - mensualiteEngagement,
      /* Ce que le client paie chaque mois pendant l engagement, puis ensuite. */
      mensualiteHT: mensualiteEngagement,
      mensualiteEnsuiteHT: mensualiteEnsuite,
      tva: Math.round(mensualiteEngagement * 0.2 * 100) / 100,
      mensualiteTTC: Math.round(mensualiteEngagement * 1.2 * 100) / 100,
      engagementMois: ENGAGEMENT_MOIS,
      engagementHT: mensualiteEngagement * ENGAGEMENT_MOIS,
      creditDiagnostic,
      /* Rachat possible au terme de l engagement, au prix public. */
      rachatHT: mensualiteEnsuite * RACHAT_MENSUALITES,
    },
    perimetre: { gainMensuel: gainMensuelPerimetre, gainNetMensuel: gainNetPerimetre },
  };
}

export type Calcul = ReturnType<typeof diagnostiquer>;
