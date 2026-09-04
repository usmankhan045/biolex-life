#!/usr/bin/env python3
"""Upscale wall-art source PNGs to 300 DPI print size (2400x3000 for 8x10).

ChatGPT ignores requested dimensions and always returns ~1122x1402, so every
generated print is upscaled here instead. LANCZOS resampling suits the flat /
painterly illustration style; a light unsharp mask restores edge definition
lost in the resample. Idempotent: files already at target size are skipped.
"""
import sys
from pathlib import Path
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets"
TARGET_W, TARGET_H = 2400, 3000
DPI = 300

def upscale(path: Path) -> str:
    im = Image.open(path)
    if im.size == (TARGET_W, TARGET_H):
        return "skip"
    im = im.convert("RGB")
    # Match the 4:5 target ratio by cropping the long side centrally, so the
    # print is never letterboxed or distorted.
    tr = TARGET_W / TARGET_H
    w, h = im.size
    if abs(w / h - tr) > 0.001:
        if w / h > tr:
            new_w = int(h * tr)
            im = im.crop(((w - new_w) // 2, 0, (w - new_w) // 2 + new_w, h))
        else:
            new_h = int(w / tr)
            im = im.crop((0, (h - new_h) // 2, w, (h - new_h) // 2 + new_h))
    im = im.resize((TARGET_W, TARGET_H), Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=2, percent=55, threshold=3))
    im.save(path, "PNG", dpi=(DPI, DPI), optimize=True)
    return "done"

def main():
    files = sorted(SRC.rglob("*.png"))
    if not files:
        sys.exit(f"no PNGs under {SRC}")
    done = skipped = 0
    for f in files:
        r = upscale(f)
        done, skipped = (done + 1, skipped) if r == "done" else (done, skipped + 1)
        print(f"  {r:5}  {f.relative_to(SRC)}")
    print(f"\n{done} upscaled, {skipped} already at {TARGET_W}x{TARGET_H}")

if __name__ == "__main__":
    main()
