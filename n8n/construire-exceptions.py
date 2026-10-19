# -*- coding: utf-8 -*-
"""Construit le workflow n8n « Odegia — Exceptions » et le pose sur l'instance.

Workflow d'erreur commun a tous les workflows clients d'Odegia. Chaque workflow
client le declare dans ses reglages (settings.errorWorkflow). A chaque echec il
ecrit une ligne dans la table NocoDB « Odegia Exceptions », et alerte Adib sur
Telegram a l'apparition seulement, jamais a la repetition d'une exception deja
ouverte. Un workflow du client de recette, « Client fictif Odegia », n'alerte
jamais.

Convention de nom des workflows clients, lue par le noeud Mise en forme
    Odegia | <client> | <brique> | <libelle>

  python construire-exceptions.py            construit et pose (cree ou met a jour)
  python construire-exceptions.py --export   ecrit seulement odegia-exceptions.json

L'identifiant de conversation Telegram est relu dans le workflow Messagerie de
l'assistant, seule source, et n'est jamais ecrit dans l'export versionne.
Cle API n8n, C:\\dev\\annuaire-essms\\.env.n8n. Rien n'est affiche de secret."""
import json, os, re, sys, urllib.request

ICI = os.path.dirname(os.path.abspath(__file__))
API = "https://n8n.orbisoptima.com/api/v1"
NOM = "Odegia \u2014 Exceptions"
TABLE = "mf6mqbnkrlcpixt"
CRED_NOCO = {"nocoDbApiToken": {"id": "iipCm2r1fUmLt79K", "name": "NocoDB Orbis"}}
CRED_TG = {"telegramApi": {"id": "RBOIIPMFDZbPIqH4", "name": "Telegram Assistant"}}
BRIQUES = ["fondations", "devis", "onboarding", "facturation", "comptes-rendus", "reporting",
           "rendez-vous", "mails", "pieces", "appels-offres"]


def cle():
    for l in open(r"C:\dev\annuaire-essms\.env.n8n", encoding="utf-8"):
        if l.startswith("N8N_API_KEY="):
            return l.split("=", 1)[1].strip()
    raise SystemExit("cle n8n introuvable")


def appel(methode, chemin, corps=None):
    r = urllib.request.Request(API + chemin, method=methode,
                               data=json.dumps(corps).encode() if corps is not None else None,
                               headers={"X-N8N-API-KEY": cle(), "Content-Type": "application/json",
                                        "Accept": "application/json"})
    return json.load(urllib.request.urlopen(r))


def chat_id():
    """Relu dans le noeud Valider du workflow Messagerie de l'assistant."""
    for w in appel("GET", "/workflows?limit=250")["data"]:
        for n in w.get("nodes", []):
            m = re.search(r"const CHAT_ID = '(-?\d+)'", n.get("parameters", {}).get("jsCode", ""))
            if m and n.get("name") == "Valider":
                return m.group(1)
    raise SystemExit("CHAT_ID introuvable dans le workflow Messagerie")


MISE_EN_FORME = r"""// Ce que n8n transmet d'un workflow client en echec, mis a plat pour NocoDB.
// Nom attendu du workflow client, « Odegia | <client> | <brique> | <libelle> ».
const crypto = require('crypto');
const e = $input.first().json;
const wf = e.workflow || {};
const ex = e.execution || {};
const err = ex.error || {};
const nom = String(wf.name || '');
const parts = nom.split(' | ').map(s => s.trim());
const client = parts[0] === 'Odegia' && parts[1] ? parts[1] : 'inconnu';
const BRIQUES = __BRIQUES__;
const brique = BRIQUES.includes(parts[2]) ? parts[2] : 'inconnue';
const etape = String(ex.lastNodeExecuted || (err.node && err.node.name) || '');
// n8n coupe le texte d'une erreur de code au premier deux-points, entre message
// et description. Les deux se recollent pour garder la phrase entiere.
const message = [err.message, err.description].filter(Boolean).join(' | ').slice(0, 2000)
  || 'erreur sans message';
// La signature ignore les nombres, un identifiant ou une heure dans le message
// ne doit pas faire passer la meme panne pour une nouvelle.
const signature = crypto.createHash('sha256')
  .update([wf.id || '', etape, message.replace(/\d+/g, '#').slice(0, 300)].join('|'))
  .digest('hex').slice(0, 32);
return [{ json: {
  Titre: `${client}, ${brique}, ${etape || 'étape inconnue'}`.slice(0, 250),
  Client: client, Brique: brique, Workflow: nom, 'Workflow id': String(wf.id || ''),
  'Exécution': ex.url || '', 'Étape en échec': etape, Message: message,
  Signature: signature, Statut: 'ouverte', Survenue: new Date().toISOString(),
  _fictif: client === 'Client fictif Odegia',
} }];"""

NOUVELLE = r"""// Alerte a l'apparition seulement. Une exception de meme signature encore
// ouverte veut dire qu'Adib est deja prevenu. Si NocoDB ne repond pas, la
// reponse n'a pas de liste et l'exception passe pour nouvelle, mieux vaut
// une alerte de trop qu'une panne muette.
// Le noeud NocoDB rend une ligne par exception trouvee, et un objet vide quand
// il n'y en a aucune, grace a alwaysOutputData.
if ($input.all().some(i => i.json && i.json.Id)) return [];
// Seules les colonnes de la table partent, les champs en _ restent ici.
const d = $('Mise en forme').first().json;
return [{ json: Object.fromEntries(Object.entries(d).filter(([k]) => !k.startsWith('_'))) }];"""

TABLE_RL = {"projectId": "pz1q8vemmvpi4jg", "table": TABLE}

MESSAGE = r"""// Apres un noeud HTTP, on relit Mise en forme. Le client de recette n'alerte jamais.
const d = $('Mise en forme').first().json;
if (d._fictif) return [];
const CHAT_ID = '__CHAT_ID__';
if (!CHAT_ID) throw new Error('CHAT_ID non renseigne dans le noeud Message');
const h = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const texte = `<b>Odegia, exception</b>\n${h(d.Client)}, brique ${h(d.Brique)}\n` +
  `Étape ${h(d['Étape en échec'] || 'inconnue')}\n${h(d.Message).slice(0, 600)}\n\n` +
  `Workflow ${h(d.Workflow)}\nFile d'exceptions dans NocoDB Orbis.`;
return [{ json: { chatId: CHAT_ID, texte } }];"""


def workflow(cid):
    return {
        "name": NOM,
        "nodes": [
            {"id": "e1", "name": "Erreur", "type": "n8n-nodes-base.errorTrigger", "typeVersion": 1,
             "position": [0, 0], "parameters": {}},
            {"id": "e2", "name": "Mise en forme", "type": "n8n-nodes-base.code", "typeVersion": 2,
             "position": [220, 0],
             "parameters": {"jsCode": MISE_EN_FORME.replace("__BRIQUES__", json.dumps(BRIQUES))}},
            # Le credential NocoDB Orbis refuse le noeud HTTP generique, d'ou le noeud natif.
            {"id": "e3", "name": "Deja ouverte", "type": "n8n-nodes-base.nocoDb", "typeVersion": 3,
             "position": [440, 0], "onError": "continueRegularOutput", "alwaysOutputData": True,
             "credentials": CRED_NOCO,
             "parameters": {"authentication": "nocoDbApiToken", "operation": "getAll", **TABLE_RL,
                            "returnAll": False, "limit": 1,
                            "options": {"where": "=(Signature,eq,{{ $json.Signature }})~and(Statut,neq,close)"}}},
            {"id": "e4", "name": "Nouvelle", "type": "n8n-nodes-base.code", "typeVersion": 2,
             "position": [660, 0], "parameters": {"jsCode": NOUVELLE}},
            {"id": "e5", "name": "Enregistrer", "type": "n8n-nodes-base.nocoDb", "typeVersion": 3,
             "position": [880, 0], "onError": "continueRegularOutput", "credentials": CRED_NOCO,
             "parameters": {"authentication": "nocoDbApiToken", "operation": "create", **TABLE_RL,
                            "dataToSend": "autoMapInputData"}},
            {"id": "e6", "name": "Message", "type": "n8n-nodes-base.code", "typeVersion": 2,
             "position": [1100, 0], "parameters": {"jsCode": MESSAGE.replace("__CHAT_ID__", cid)}},
            {"id": "e7", "name": "Telegram", "type": "n8n-nodes-base.telegram", "typeVersion": 1.2,
             "position": [1320, 0], "credentials": CRED_TG,
             "parameters": {"chatId": "={{ $json.chatId }}", "text": "={{ $json.texte }}",
                            "additionalFields": {"appendAttribution": False,
                                                 "disable_web_page_preview": True,
                                                 "parse_mode": "HTML"}}},
        ],
        "connections": {
            "Erreur": {"main": [[{"node": "Mise en forme", "type": "main", "index": 0}]]},
            "Mise en forme": {"main": [[{"node": "Deja ouverte", "type": "main", "index": 0}]]},
            "Deja ouverte": {"main": [[{"node": "Nouvelle", "type": "main", "index": 0}]]},
            "Nouvelle": {"main": [[{"node": "Enregistrer", "type": "main", "index": 0}]]},
            "Enregistrer": {"main": [[{"node": "Message", "type": "main", "index": 0}]]},
            "Message": {"main": [[{"node": "Telegram", "type": "main", "index": 0}]]},
        },
        "settings": {"executionOrder": "v1", "timezone": "Europe/Paris"},
    }


def main():
    json.dump(workflow(""), open(os.path.join(ICI, "odegia-exceptions.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)
    print("export ecrit, odegia-exceptions.json, sans CHAT_ID")
    if "--export" in sys.argv:
        return
    wf = workflow(chat_id())
    existant = [w for w in appel("GET", "/workflows?limit=250")["data"] if w["name"] == NOM]
    if existant:
        r = appel("PUT", "/workflows/%s" % existant[0]["id"], wf)
        print("mis a jour", r["id"])
    else:
        r = appel("POST", "/workflows", wf)
        print("cree", r["id"])
    # Sur n8n 2.x seule la version publiee tourne, un workflow d'erreur reste muet
    # tant qu'il n'est pas active. Desactiver puis activer publie la version posee.
    if r.get("active"):
        appel("POST", "/workflows/%s/deactivate" % r["id"])
    appel("POST", "/workflows/%s/activate" % r["id"])
    print("publie et actif")


if __name__ == "__main__":
    main()
