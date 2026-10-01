# -*- coding: utf-8 -*-
"""Transcrit l enregistrement d un entretien de diagnostic, en local.

    python scripts/diagnostic/transcrire.py "<dossier>/entretien.m4a"

Tout reste sur le poste, aucun audio client ne part chez un service tiers.
faster-whisper et le modele medium sont deja installes. Sur ce PC sans carte
graphique, compter a peu pres la duree de l enregistrement. La sortie est un
texte horodate a cote de l audio, transcription.txt.
"""
import sys
from pathlib import Path
from faster_whisper import WhisperModel

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

audio = Path(sys.argv[1]).resolve()
sortie = audio.with_name("transcription.txt")
modele = WhisperModel("medium", device="cpu", compute_type="int8")
segments, info = modele.transcribe(str(audio), language="fr", vad_filter=True)
with open(sortie, "w", encoding="utf-8") as f:
    for s in segments:
        m, sec = divmod(int(s.start), 60)
        ligne = f"[{m:02d}:{sec:02d}] {s.text.strip()}"
        f.write(ligne + "\n")
        print(ligne, flush=True)
print(f"ecrit {sortie}, {info.duration / 60:.0f} min d audio")
