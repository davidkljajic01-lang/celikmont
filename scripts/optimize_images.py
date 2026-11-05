"""Optimizira pozadinske slike u public/img/ (WebP + JPEG, više širina).
Pokretanje: python scripts/optimize_images.py
Datoteka se traži po imenu bilo gdje u mapi slike/ (osim slike/projekti),
pa slike možeš slobodno premještati po mapama.
Fotografije projekata obrađuje scripts/build_projects.py."""
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).parent.parent
src, out = root / "slike", root / "public" / "img"
out.mkdir(parents=True, exist_ok=True)

JOBS = [
    # pozadina naslovnog dijela
    ("hero", "1.jpeg", [800, 1280, 1920]),
    # pozadine za "Na što možete računati"
    ("kljuc-u-ruke", "WhatsApp Image 2026-10-15 at 07.32.55.jpeg", [800, 1200]),
    ("konstrukcija-statika", "WhatsApp Image 2026-10-15 at 07.32.54.jpeg", [800, 1200]),
    ("montaza-dizalica", "WhatsApp Image 2026-10-15 at 07.32.52(3).jpeg", [800, 1200]),
    # radiona
    ("radiona-hero", "radiona 3.jpeg", [800, 1200]),
    ("radiona-zavarivanje", "radiona 1.jpeg", [800, 1200]),
    # slika 2 je story format sa sivim/crvenim trakama: režemo srednji dio (left, top, right, bottom)
    ("radiona-cnc", "radiona 2.jpeg", [800, 1200], (0, 520, 1152, 1398)),
]


def find(filename):
    hits = [p for p in src.rglob(filename) if "projekti" not in p.relative_to(src).parts]
    if not hits:
        raise SystemExit(f"Nije pronađena slika: {filename}")
    return hits[0]


for name, filename, widths, *crop in JOBS:
    path = find(filename)
    im = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
    if crop:
        im = im.crop(crop[0])
    for w in widths:
        w = min(w, im.width)
        r = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        r.save(out / f"{name}-{w}.webp", quality=78, method=6)
        r.save(out / f"{name}-{w}.jpg", quality=80, optimize=True, progressive=True)
    print(f"{name:24} {path.relative_to(src)}")
