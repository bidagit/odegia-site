import { NextResponse } from "next/server";
import { calculer, type Reponses } from "@/lib/estimator";

/* Réception de l'estimation, puis transmission à n8n.

   Le site ne stocke rien et n'envoie aucun email lui-même. Il valide, recalcule
   le résultat côté serveur, et pousse le tout vers un webhook n8n qui se charge
   de l'email transactionnel, de l'enregistrement dans NocoDB et, quand le
   visiteur l'a demandé, de la création du contact côté Brevo.

   C'est la règle d'architecture du groupe, tout ce qui touche le client vit
   dans n8n et NocoDB plutôt que dans un dépôt de site, sans quoi la deuxième
   marque qui en a besoin réécrit la même chose.

   Le résultat est recalculé ici plutôt que repris du navigateur. Un visiteur
   peut poster ce qu'il veut, et le rapport envoyé doit correspondre au barème
   réel. */

export const runtime = "nodejs";

const WEBHOOK = process.env.N8N_ESTIMATION_WEBHOOK;

/* Garde-fou de volume, en mémoire du processus. Suffisant pour écarter un
   script bavard, sans prétendre remplacer un vrai limiteur. */
const RECENTS = new Map<string, number[]>();
const FENETRE_MS = 60_000;
const MAX_PAR_FENETRE = 5;

function tropDeRequetes(ip: string) {
  const maintenant = Date.now();
  const passees = (RECENTS.get(ip) ?? []).filter((t) => maintenant - t < FENETRE_MS);
  passees.push(maintenant);
  RECENTS.set(ip, passees);
  if (RECENTS.size > 500) RECENTS.clear();
  return passees.length > MAX_PAR_FENETRE;
}

const emailValide = (v: unknown) =>
  typeof v === "string" && v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "inconnue";
  if (tropDeRequetes(ip)) {
    return NextResponse.json({ ok: false, raison: "trop_de_requetes" }, { status: 429 });
  }

  let corps: unknown;
  try {
    corps = await req.json();
  } catch {
    return NextResponse.json({ ok: false, raison: "corps_illisible" }, { status: 400 });
  }

  const { email, prenom, optin, reponses } = (corps ?? {}) as {
    email?: unknown;
    prenom?: unknown;
    optin?: unknown;
    reponses?: Reponses;
  };

  if (!emailValide(email)) {
    return NextResponse.json({ ok: false, raison: "email_invalide" }, { status: 400 });
  }
  if (!reponses || !Array.isArray(reponses.taches) || reponses.taches.length === 0) {
    return NextResponse.json({ ok: false, raison: "reponses_absentes" }, { status: 400 });
  }

  /* Sans webhook configuré, on le dit franchement au lieu de laisser croire
     que l'email est parti. C'est l'état du jour, tant que le flux n8n n'existe
     pas, et l'écran de résultat s'adapte à cette réponse. */
  if (!WEBHOOK) {
    return NextResponse.json({ ok: false, raison: "non_configure" }, { status: 503 });
  }

  const resultat = calculer(reponses);

  try {
    const r = await fetch(WEBHOOK, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        source: "odegia-estimateur",
        recuLe: new Date().toISOString(),
        email,
        prenom: typeof prenom === "string" ? prenom.slice(0, 80) : "",
        /* Consentement de prospection, séparé du service demandé. Il vaut pour
           la séquence Brevo, jamais pour l'envoi de l'estimation elle-même. */
        optinProspection: optin === true,
        reponses,
        resultat,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) {
      return NextResponse.json({ ok: false, raison: "webhook_en_erreur" }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ ok: false, raison: "webhook_injoignable" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
