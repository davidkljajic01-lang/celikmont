"""Ugrađuje vektorski logo u index.html i generira favicon.
Pokretanje: python build.py"""
import re
from pathlib import Path

root = Path(__file__).parent
svg = (root / "assets" / "logo.svg").read_text(encoding="utf-8")
d = re.search(r' d="([^"]+)"', svg).group(1)

html = (root / "src" / "index.template.html").read_text(encoding="utf-8")
(root / "index.html").write_text(html.replace("{{LOGO_PATH}}", d), encoding="utf-8")

(root / "assets" / "favicon.svg").write_text(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -110 531 531">'
    '<rect x="-20" y="-110" width="531" height="531" rx="80" fill="#1d3a2a"/>'
    '<clipPath id="m"><rect width="491" height="312"/></clipPath>'
    f'<path clip-path="url(#m)" fill="#fff" fill-rule="evenodd" d="{d}"/></svg>',
    encoding="utf-8",
)
print("index.html i favicon.svg generirani")
