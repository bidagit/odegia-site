/* Passage du rapport au tutoiement, demande d Adib du 19/10/2026 pour Alteria.

   Le rapport s ecrit au vouvoiement, la norme pour un client. Un client que le
   fondateur tutoie deja, comme Siham, le recoit au tutoiement par le champ
   tutoiement d entree.json. La conversion se fait sur des phrases entieres,
   jamais mot a mot, parce que « vous validez » devient « tu valides » et
   « votre charte » devient « ta charte ». Les phrases les plus longues passent
   d abord. Une phrase au vouvoiement absente de cette table reste telle quelle,
   le controle de produire.sh la signale. */

const TABLE: [string, string][] = [
  ["Vos devis et le suivi de chaque coaché", "Tes devis et le suivi de chaque coaché"],
  ["la TVA comprise puisque vous ne la récupérez pas", "la TVA comprise puisque tu ne la récupères pas"],
  ["Vous ne récupérez pas la TVA", "Tu ne récupères pas la TVA"],
  ["et votre première année Odegia est payée", "et ta première année Odegia est payée"],
  ["vous rapporte en moyenne", "te rapporte en moyenne"],
  ["Votre première année Odegia", "Ta première année Odegia"],
  ["Ce que votre administratif vous coûte, et ce qu'il vous coûtera", "Ce que ton administratif te coûte, et ce qu'il te coûtera"],
  ["Votre administratif vous prend", "Ton administratif te prend"],
  ["si vous doublez le nombre de vos coachés", "si tu doubles le nombre de tes coachés"],
  ["Vos factures aux établissements et votre comptabilité y entrent à votre demande", "Tes factures aux établissements et ta comptabilité y entrent à ta demande"],
  ["Le devis vous arrive prêt, vous le validez avant envoi", "Le devis t'arrive prêt, tu le valides avant envoi"],
  ["Vos notes vivent dans des chemises et dans votre mémoire", "Tes notes vivent dans des chemises et dans ta mémoire"],
  ["Vous cochez ce qui est payé, chaque échéance se suit, et chaque relance vous est soumise", "Tu coches ce qui est payé, chaque échéance se suit, et chaque relance t'est soumise"],
  ["Il vous arrive prêt, à la charte d'Alteria, et vous le relisez", "Il t'arrive prêt, à la charte d'Alteria, et tu le relis"],
  ["Vous n'avez personne à qui la confier, elle entre donc au plan à votre demande", "Tu n'as personne à qui la confier, elle entre donc au plan à ta demande"],
  ["Vous ne savez pas aujourd'hui ce que l'activité vous rapporte", "Tu ne sais pas aujourd'hui ce que l'activité te rapporte"],
  ["vos coachés donnent leur accord avant tout enregistrement, et vous relisez chaque bilan", "tes coachés donnent leur accord avant tout enregistrement, et tu relis chaque bilan"],
  ["Tout commence par écrire votre charte, ce que vous expliquez", "Tout commence par écrire ta charte, ce que tu expliques"],
  ["Tout passe par votre validation, et chaque retouche que vous faites", "Tout passe par ta validation, et chaque retouche que tu fais"],
  ["Il part de votre volume d'aujourd'hui, et le « jusqu'à » de votre estimation", "Il part de ton volume d'aujourd'hui, et le « jusqu'à » de ton estimation"],
  ["partent de votre volume d'aujourd'hui, votre estimation y figure", "partent de ton volume d'aujourd'hui, ton estimation y figure"],
  ["Vos abonnements aux outils restent à votre nom et sont réglés par vous", "Tes abonnements aux outils restent à ton nom et sont réglés par toi"],
  ["vous pouvez reprendre vos automatisations à votre compte", "tu peux reprendre tes automatisations à ton compte"],
  ["Une fois tout en service et Odegia payé, vous gagnez", "Une fois tout en service et Odegia payé, tu gagnes"],
  ["Ce que coûte Odegia, et ce que vous gagnez", "Ce que coûte Odegia, et ce que tu gagnes"],
  ["vos outils ne vous coûtent rien de plus", "tes outils ne te coûtent rien de plus"],
  ["Ensuite vous arrêtez quand vous voulez", "Ensuite tu arrêtes quand tu veux"],
  ["Vous assurez ensuite vous-même", "Tu assures ensuite toi-même"],
  ["si votre activité suit votre estimation", "si ton activité suit ton estimation"],
  ["Si votre activité suit votre estimation", "Si ton activité suit ton estimation"],
  ["Ce que vous coûte l'administratif", "Ce que te coûte l'administratif"],
  ["Ce qu'Odegia vous fait économiser", "Ce qu'Odegia te fait économiser"],
  ["Odegia peut vous faire économiser", "Odegia peut te faire économiser"],
  ["Ce que vous ne faites pas aujourd'hui", "Ce que tu ne fais pas aujourd'hui"],
  ["que vous ne faites pas encore", "que tu ne fais pas encore"],
  ["Ce qu'Odegia vous apporte", "Ce qu'Odegia t'apporte"],
  ["Ce qu'Odegia vous coûte", "Ce qu'Odegia te coûte"],
  ["Ce qui vous coûte le plus", "Ce qui te coûte le plus"],
  ["Ce que ça vous coûtera", "Ce que ça te coûtera"],
  ["Ce que vous gagnez", "Ce que tu gagnes"],
  ["Ce que vous produisez", "Ce que tu produis"],
  ["Construction comprise, vous gagnez", "Construction comprise, tu gagnes"],
  ["Vous ne payez rien d'avance", "Tu ne paies rien d'avance"],
  ["Vous expliquez de tête", "Tu expliques de tête"],
  ["Vous le regardez", "Tu le regardes"],
  ["ce qui vous agace le plus", "ce qui t'agace le plus"],
  ["ce qu'il vous soumet avant envoi", "ce qu'il te soumet avant envoi"],
  ["ce que vous auriez fait", "ce que tu aurais fait"],
  ["ne vous fait économiser", "ne te fait économiser"],
  ["vous donne le point d'étape", "te donne le point d'étape"],
  ["validées avec vous avant construction", "validées avec toi avant construction"],
  ["Nous vous les transférons", "Nous te les transférons"],
  ["Durées relevées avec vous", "Durées relevées avec toi"],
  ["obligatoire pour vous", "obligatoire pour toi"],
  ["part seule, sans vous", "part seule, sans toi"],
  ["vous validez avant envoi", "tu valides avant envoi"],
  ["vous validez", "tu valides"],
  ["Votre diagnostic sur une page", "Ton diagnostic sur une page"],
  ["Votre feuille de route", "Ta feuille de route"],
  ["Votre administratif automatisé", "Ton administratif automatisé"],
  ["Une fois votre charte écrite", "Une fois ta charte écrite"],
  ["Ce qui attend encore votre accord", "Ce qui attend encore ton accord"],
  ["Ces montants partent de votre volume", "Ces montants partent de ton volume"],
  ["à votre volume d'aujourd'hui", "à ton volume d'aujourd'hui"],
  ["un tableau de vos recettes et de vos impayés", "un tableau de tes recettes et de tes impayés"],
  ["alimente votre tableau de bord", "alimente ton tableau de bord"],
  ["Le prix suit votre base horaire", "Le prix suit ta base horaire"],
  ["Google, votre abonnement actuel", "Google, ton abonnement actuel"],
  ["Toutes vos tâches", "Toutes tes tâches"],
  ["Vos conventions restent", "Tes conventions restent"],
  ["Vos documents réunis", "Tes documents réunis"],
  ["vos notes se réunissent", "tes notes se réunissent"],
  ["éparpillé dans vos mails", "éparpillé dans tes mails"],
  ["Reste à votre main", "Reste à ta main"],
  ["reste à votre main", "reste à ta main"],
  ["d'outils à votre nom", "d'outils à ton nom"],
  ["Outil à votre nom", "Outil à ton nom"],
  ["votre taux déclaré", "ton taux déclaré"],
  ["selon votre estimation", "selon ton estimation"],
  ["de votre temps", "de ton temps"],
  ["à votre demande", "à ta demande"],
];

export function tutoyer(html: string): string {
  const i = html.indexOf("<body>");
  let corps = html.slice(i);
  for (const [a, b] of [...TABLE].sort((x, y) => y[0].length - x[0].length)) {
    corps = corps.split(a).join(b);
  }
  return html.slice(0, i) + corps;
}

/* Les phrases encore au vouvoiement, pour le controle. */
export function restesVouvoiement(html: string): string[] {
  const texte = html.slice(html.indexOf("<body>")).replace(/<svg[\s\S]*?<\/svg>/g, "").replace(/<[^>]+>/g, "\n");
  return [...new Set(texte.match(/[^.!?\n]*(?<![-\w])(vous|votre|vos|Vous|Votre|Vos)\b[^.!?\n]*/g) ?? [])].map((x) => x.trim());
}
