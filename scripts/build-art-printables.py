#!/usr/bin/env python3
"""Wrap each generated art PNG in a print-ready HTML page and render it to PDF.

The art in assets/ is 2400x3000 (4:5 at 300 DPI). Wall art is placed on a
letter page at 8x10in so it trims to a standard frame size; coloring pages get
a slim margin so the line work stays inside a home printer's printable area.

Idempotent: skips a slug whose PDF is newer than its source PNG.
"""
import base64, json, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
OUT = ROOT / "public" / "printables"
FOOT = "Biolex · Free Printable"

CSS = """@page{size:letter portrait;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:8.5in;height:11in;position:relative;overflow:hidden;background:#FFF;
 display:flex;flex-direction:column;align-items:center;justify-content:center}
img{display:block}
.foot{position:absolute;bottom:0.30in;left:0;right:0;text-align:center;
 font-family:Georgia,serif;font-size:8.5pt;letter-spacing:3px;
 text-transform:uppercase;color:#B0A090}"""

def build(png: Path, slug: str, kind: str) -> None:
    pdf = OUT / f"{slug}.pdf"
    if pdf.exists() and pdf.stat().st_mtime > png.stat().st_mtime:
        print(f"  skip   {slug}")
        return
    b64 = base64.b64encode(png.read_bytes()).decode()
    # Wall art trims to 8x10; coloring pages sit slightly larger with a safe margin.
    dims = 'width="8in" height="10in"' if kind == "wall-art" else 'width="7.5in" height="9.375in"'
    html = (f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head>'
            f'<body><div class="page">'
            f'<img src="data:image/png;base64,{b64}" {dims}>'
            f'<div class="foot">{FOOT}</div></div></body></html>')
    src = OUT / f"{slug}.html"
    src.write_text(html)
    subprocess.run(["weasyprint", str(src), str(pdf)], check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"  built  {slug}")

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    jobs = []
    for p in sorted((ASSETS / "wall-art").rglob("*.png")):
        jobs.append((p, f"{p.stem}-wall-art", "wall-art"))
    for p in sorted((ASSETS / "coloring").glob("*.png")):
        jobs.append((p, p.stem, "coloring"))
    if not jobs:
        sys.exit("no source art found")
    for png, slug, kind in jobs:
        build(png, slug, kind)
    print(f"\n{len(jobs)} printables processed")

if __name__ == "__main__":
    main()
