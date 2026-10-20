#!/usr/bin/env bash
# Produit le rapport de diagnostic d un dossier client, calcul, HTML, PDF.
#
#   bash scripts/diagnostic/produire.sh "/p/1. ORBIS/Odegia/Diagnostics/2026-10 Alteria"
#
# S arrete au premier echec. Les nombres sortent de calcul.mts, qui importe les
# constantes de lib/estimator.ts, la prose sort de entree.json.
# v2.5, avec rapportCourt le dossier recoit aussi accueil.pdf, le document
# d accueil, et ses images accueil-page-N.png.
set -euo pipefail
cd "$(dirname "$0")/../.."
DOSSIER="${1:?dossier requis}"
rm -f "$DOSSIER/accueil.html"
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/diagnostic/rapport.mts "$DOSSIER"
python scripts/diagnostic/pdf.py "$DOSSIER"
# Une image par page, a relire avant tout envoi.
rm -f "$DOSSIER"/page-*.png "$DOSSIER"/accueil-page-*.png
pdftoppm -r 70 -png "$DOSSIER/$(cat "$DOSSIER/dernier-rapport.txt")" "$DOSSIER/page"
if [ -f "$DOSSIER/accueil.html" ]; then
  python scripts/diagnostic/pdf.py "$DOSSIER" accueil
  pdftoppm -r 70 -png "$DOSSIER/$(cat "$DOSSIER/dernier-accueil.txt")" "$DOSSIER/accueil-page"
fi
ls "$DOSSIER"/page-*.png "$DOSSIER"/accueil-page-*.png 2>/dev/null
