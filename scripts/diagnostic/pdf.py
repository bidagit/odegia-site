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
html = dossier / "rapport.html"
pdf = dossier / "rapport.pdf"

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
    pdf = dossier / f"rapport-{datetime.now():%H%M}.pdf"
    print(f"rapport.pdf est ouvert ailleurs, nouvelle version dans {pdf.name}")

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

(dossier / "dernier-rapport.txt").write_text(pdf.name, encoding="utf-8")
print(f"ecrit {pdf}")
