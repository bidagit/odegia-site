#!/usr/bin/env bash
# Deploie le site et releve tout de suite ce que le lecteur verra.
#
#   scripts/deployer.sh "message de commit sur une ligne"
#
# La chaine s arrete au premier echec, et le releve des redites et des renvois
# sans geste tourne sur tous les etats de scripts/parcours-etats.txt apres la
# mise en ligne, dans le meme resultat que le deploiement. Il devient
# impossible de deployer sans lire le releve. Meme mecanique que sur
# l annuaire depuis le 18 septembre 2026.
set -euo pipefail
cd "$(dirname "$0")/.."
MSG="${1:?message de commit requis}"
npx.cmd tsc --noEmit
# La sortie du build va dans un fichier, pas dans un tube vers grep -q. Le
# 18 septembre 2026, grep -q fermait le tube des la ligne trouvee, npm mourait
# sur ce tube ferme, et pipefail faisait echouer cinq deploiements sans un mot.
JOURNAL="${TMP:-/tmp}/deployer-$$.log"
npm.cmd run build > "$JOURNAL" 2>&1 || { tail -40 "$JOURNAL"; exit 1; }
grep -qE "Compiled successfully" "$JOURNAL" || { tail -40 "$JOURNAL"; exit 1; }
git add -A
# Rien a committer n est pas une erreur, le deploiement peut rejouer un commit deja fait.
git diff --cached --quiet || git commit -q -m "$MSG

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git push -q origin main
ssh ubuntu@51.77.211.7 "cd /home/ubuntu/odegia-site && git pull -q && docker compose -f docker-compose.prod.yml up -d --build 2>&1 | tail -1"
# Le conteneur repond 502 pendant qu il demarre, et un releve lance trop tot lit
# du vide. On attend la premiere page avant de lire quoi que ce soit.
for i in $(seq 1 40); do curl -sf -o /dev/null https://odegia.com/ && break; sleep 3; done
curl -sf -o /dev/null https://odegia.com/ || { echo "le site ne repond toujours pas"; exit 1; }
echo "== Releve des redites et des renvois sans geste, tous les etats"
python "$HOME/.claude/skills/parcours/scripts/redondances.py" --site https://odegia.com --etats scripts/parcours-etats.txt
echo "== Captures de tous les etats, a regarder une par une dans captures/"
python "$HOME/.claude/skills/parcours/scripts/captures.py" --site https://odegia.com --etats scripts/parcours-etats.txt --dossier captures
