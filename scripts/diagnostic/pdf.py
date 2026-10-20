# -*- coding: utf-8 -*-
"""Transforme rapport.html en rapport.pdf, et photographie chaque page.

    python scripts/diagnostic/pdf.py "<dossier>"

Le PDF est ce que le client recoit. Les PNG servent a relire le rendu page par
page avant l envoi, une table qui deborde ou une page blanche ne se voient pas
dans le HTML. Meme outil que les captures du compagnon parcours, Playwright et
Chromium, deja installes sur le poste.
"""
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

dossier = Path(sys.argv[1]).resolve()
# v2.5, un second document peut sortir du meme dossier, le document d accueil.
NOM = sys.argv[2] if len(sys.argv) > 2 else "rapport"
html = dossier / f"{NOM}.html"
pdf = dossier / f"{NOM}.pdf"

PIED = (
    '<div style="width:100%;font:7px Geist Mono,monospace;letter-spacing:.12em;'
    'text-transform:uppercase;color:#5c6462;padding:0 16mm;display:flex;'
    'justify-content:space-between"><span>Odegia · document confidentiel</span>'
    '<span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>'
)

# Un rapport ouvert dans un lecteur PDF est verrouille sous Windows. Plutot que
# d echouer, la nouvelle version s ecrit a cote avec l heure dans le nom, et
# produire.sh la retrouve par dernier-rapport.txt.
try:
    open(pdf, "ab").close()
except PermissionError:
    from datetime import datetime
    # Une seule version de secours a la fois, les precedentes partent dans
    # archives avant d en ecrire une nouvelle.
    for ancien in dossier.glob(f"{NOM}-*.pdf"):
        (dossier / "archives").mkdir(exist_ok=True)
        ancien.replace(dossier / "archives" / f"{NOM}-{datetime.now():%Y-%m-%d}-{ancien.stem.split('-')[-1]}.pdf")
    pdf = dossier / f"{NOM}-{datetime.now():%H%M}.pdf"
    print(f"{NOM}.pdf est ouvert ailleurs, nouvelle version dans {pdf.name}")

with sync_playwright() as p:
    nav = p.chromium.launch()
    page = nav.new_page()
    page.goto(html.as_uri(), wait_until="networkidle")
    # Les polices Google arrivent apres le DOM, un PDF tire trop tot sort en
    # police de secours sans prevenir.
    page.evaluate("document.fonts.ready")
    page.pdf(
        path=str(pdf),
        format="A4",
        print_background=True,
        prefer_css_page_size=True,
        display_header_footer=True,
        header_template="<span></span>",
        footer_template=PIED,
    )
    nav.close()

(dossier / ("dernier-rapport.txt" if NOM == "rapport" else f"dernier-{NOM}.txt")).write_text(pdf.name, encoding="utf-8")
print(f"ecrit {pdf}")

# Un seul rapport a la racine du dossier client, demande d Adib du 19/10/2026.
# Des que rapport.pdf s ecrit de nouveau, les versions de secours nees d un
# verrou partent dans archives, datees, au lieu de s empiler a cote.
if pdf.name == f"{NOM}.pdf":
    from datetime import date
    for ancien in dossier.glob(f"{NOM}-*.pdf"):
        (dossier / "archives").mkdir(exist_ok=True)
        cible = dossier / "archives" / f"{NOM}-{date.today():%Y-%m-%d}-{ancien.stem.split('-')[-1]}.pdf"
        ancien.replace(cible)
        print(f"archive {ancien.name} -> archives/{cible.name}")
