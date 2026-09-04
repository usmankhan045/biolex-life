#!/usr/bin/env python3
"""Real themed coloring-page line art for Christmas and New Year, matching the
Pinterest pin promises (holiday motifs, ornaments, fireworks) instead of generic
geometric mandalas. Pure vector, clean black strokes, no fill = ready to color.

Builds:
  christmas-mandala-coloring-page          (holly, baubles, trees, star centre)
  christmas-ornament-mandala-coloring-page (concentric decorated ornaments)
  new-year-mandala-coloring-page           (fireworks, stars, midnight clock)
"""
import math, os, json, sys
sys.path.insert(0, os.path.dirname(__file__))
from gen_art import scallop, dots, ring_of, petal, P
from proof_phase2 import coloring_page, flower
from gen_halloween import wreath, radial, SW

OUT = "public/printables"


# ---------------------------------------------------------------- motifs
def star5(R, inner=0.42):
    pts = []
    for i in range(10):
        rr = R if i % 2 == 0 else R * inner
        a = math.radians(i * 36 - 90)
        pts.append(f"{rr*math.cos(a):.1f} {rr*math.sin(a):.1f}")
    path = f'<path d="M {pts[0]} ' + " ".join("L " + p for p in pts[1:]) + ' Z"/>'
    return f'<g {SW}>{path}</g>'  # keep stroke-only so stars stay colorable


def bauble(r=44, band="dots"):
    """A hanging ornament: cap, loop, globe and a decorated band."""
    g = []
    g.append(f'<circle cx="0" cy="{r*0.2:.1f}" r="{r:.1f}"/>')
    g.append(f'<rect x="-{r*0.22:.1f}" y="{-r*0.95:.1f}" width="{r*0.44:.1f}" height="{r*0.28:.1f}" rx="3"/>')
    g.append(f'<path d="M {-r*0.12:.1f} {-r*0.95:.1f} A {r*0.12:.1f} {r*0.14:.1f} 0 1 1 {r*0.12:.1f} {-r*0.95:.1f}"/>')
    # equator band
    g.append(f'<path d="M {-r*0.92:.1f} {r*0.0:.1f} Q 0 {r*0.16:.1f} {r*0.92:.1f} {r*0.0:.1f}"/>')
    g.append(f'<path d="M {-r*0.86:.1f} {r*0.34:.1f} Q 0 {r*0.5:.1f} {r*0.86:.1f} {r*0.34:.1f}"/>')
    if band == "dots":
        for k in range(7):
            x = -r * 0.72 + (r * 1.44) * k / 6
            g.append(f'<circle cx="{x:.1f}" cy="{r*0.17:.1f}" r="2.4"/>')
    elif band == "zig":
        d = f'M {-r*0.8:.1f} {r*0.17:.1f} '
        for k in range(1, 9):
            x = -r * 0.8 + (r * 1.6) * k / 8
            d += f'L {x:.1f} {r*0.17 + (6 if k%2 else -6):.1f} '
        g.append(f'<path d="{d}"/>')
    # a little bottom flourish
    g.append(f'<path d="M 0 {r*1.16:.1f} l 0 {r*0.14:.1f}"/>')
    return f'<g {SW}>{"".join(g)}</g>'


def holly(s=48):
    """Two spiky holly leaves and a cluster of three berries."""
    def leaf(sgn):
        w, h = s * 0.5, s
        p = [(0, -h)]
        seq = [(0.55, -0.55), (0.35, -0.40), (1.0, -0.15), (0.4, 0.0),
               (1.0, 0.25), (0.30, 0.5), (0, h * 0.5 / h)]
        for fx, fy in seq:
            p.append((sgn * w * fx * 2, h * fy if abs(fy) <= 1 else fy))
        d = f'M {p[0][0]:.1f} {p[0][1]:.1f} ' + " ".join(f'L {x:.1f} {y:.1f}' for x, y in p[1:])
        d += ' Z'
        # midrib
        d += f' M 0 {-h*0.9:.1f} L 0 {h*0.4:.1f}'
        return f'<path d="{d}"/>'
    g = [leaf(-1).replace('rotate', 'rotate')]
    g = [f'<g transform="rotate(-24)">{leaf(-1)}</g>',
         f'<g transform="rotate(24)">{leaf(1)}</g>']
    for cx, cy in ((-8, 6), (8, 6), (0, 16)):
        g.append(f'<circle cx="{cx}" cy="{cy}" r="6.5"/>')
    return f'<g {SW}>{"".join(g)}</g>'


def tree(s=64):
    """A small tiered Christmas tree topped with a star."""
    g = []
    tiers = [(-s*0.9, s*0.42, -s*0.35), (-s*0.35, s*0.62, s*0.08), (s*0.08, s*0.82, s*0.5)]
    for top, half, base in tiers:
        g.append(f'<path d="M 0 {top:.1f} L {-half:.1f} {base:.1f} L {half:.1f} {base:.1f} Z"/>')
    g.append(f'<rect x="-{s*0.1:.1f}" y="{s*0.5:.1f}" width="{s*0.2:.1f}" height="{s*0.22:.1f}"/>')
    g.append(f'<g transform="translate(0 {-s*1.02:.1f})">{star5(s*0.22)}</g>')
    return f'<g {SW}>{"".join(g)}</g>'


def bell(s=44):
    g = []
    g.append(f'<path d="M 0 {-s*0.9:.1f} '
             f'C {-s*0.2:.1f} {-s*0.86:.1f} {-s*0.28:.1f} {-s*0.6:.1f} {-s*0.4:.1f} {-s*0.2:.1f} '
             f'C {-s*0.56:.1f} {s*0.2:.1f} {-s*0.7:.1f} {s*0.5:.1f} {-s*0.82:.1f} {s*0.62:.1f} '
             f'L {s*0.82:.1f} {s*0.62:.1f} '
             f'C {s*0.7:.1f} {s*0.5:.1f} {s*0.56:.1f} {s*0.2:.1f} {s*0.4:.1f} {-s*0.2:.1f} '
             f'C {s*0.28:.1f} {-s*0.6:.1f} {s*0.2:.1f} {-s*0.86:.1f} 0 {-s*0.9:.1f} Z"/>')
    g.append(f'<circle cx="0" cy="{-s*0.98:.1f}" r="{s*0.1:.1f}"/>')
    g.append(f'<path d="M {-s*0.82:.1f} {s*0.62:.1f} Q 0 {s*0.8:.1f} {s*0.82:.1f} {s*0.62:.1f}"/>')
    g.append(f'<circle cx="0" cy="{s*0.78:.1f}" r="{s*0.14:.1f}"/>')
    return f'<g {SW}>{"".join(g)}</g>'


def firework(R=60, spikes=12):
    g = []
    for k in range(spikes):
        a = math.radians(360 / spikes * k)
        x1, y1 = R * 0.22 * math.cos(a), R * 0.22 * math.sin(a)
        x2, y2 = R * math.cos(a), R * math.sin(a)
        g.append(f'<path d="M {x1:.1f} {y1:.1f} L {x2:.1f} {y2:.1f}"/>')
        g.append(f'<circle cx="{x2:.1f}" cy="{y2:.1f}" r="3"/>')
    g.append(f'<circle cx="0" cy="0" r="{R*0.16:.1f}"/>')
    return f'<g {SW}>{"".join(g)}</g>'


def clock(R=90):
    g = []
    g.append(f'<circle r="{R:.1f}"/><circle r="{R*0.9:.1f}"/>')
    for k in range(12):
        a = math.radians(30 * k)
        r1 = R * 0.78 if k % 3 else R * 0.72
        g.append(f'<path d="M {R*0.9*math.cos(a):.1f} {R*0.9*math.sin(a):.1f} '
                 f'L {r1*math.cos(a):.1f} {r1*math.sin(a):.1f}"/>')
    # hands at midnight (both up)
    g.append(f'<path d="M 0 0 L 0 {-R*0.55:.1f}"/><path d="M 0 0 L 0 {-R*0.72:.1f}"/>')
    g.append('<circle r="4"/>')
    return f'<g {SW}>{"".join(g)}</g>'


# ---------------------------------------------------------------- pages
def christmas_mandala():
    g = [f'<g {SW}><circle r="384"/><circle r="376"/></g>']
    g.append(wreath(holly(46), 350, 12))
    g.append(f'<g {SW}>{scallop(300, 14, 30)}{dots(286, 5, 30)}</g>')
    g.append(wreath(bauble(42, "dots"), 232, 10))
    g.append(f'<g {SW}>{dots(176, 6, 20)}</g>')
    g.append(wreath(tree(46), 150, 10, phase=18))
    g.append(f'<g {SW}>{scallop(96, 10, 20)}{flower(0, 0, 76, 12, 26)}</g>')
    g.append(f'<g transform="translate(0 0)">{star5(26)}</g>')
    return ("".join(g), "-410 -410 820 820", None)


def christmas_ornament_mandala():
    g = [f'<g {SW}><circle r="384"/><circle r="376"/></g>']
    g.append(wreath(bauble(46, "zig"), 336, 12))
    g.append(f'<g {SW}>{scallop(280, 13, 36)}{dots(266, 5, 36)}</g>')
    g.append(wreath(bauble(50, "dots"), 210, 10))
    g.append(f'<g {SW}>{scallop(150, 11, 24)}{dots(138, 5, 24)}</g>')
    g.append(wreath(bauble(34, "zig"), 92, 8))
    g.append(f'<g {SW}>{flower(0, 0, 44, 10, 16)}<circle r="9"/></g>')
    return ("".join(g), "-410 -410 820 820", None)


def new_year_mandala():
    g = [f'<g {SW}><circle r="384"/><circle r="376"/></g>']
    g.append(radial(firework(58, 12), 320, 12))
    g.append(f'<g {SW}>{dots(286, 5, 24)}{scallop(272, -10, 24)}</g>')
    g.append(wreath(star5(30), 214, 12, phase=15))
    g.append(f'<g {SW}>{dots(162, 6, 24)}</g>')
    g.append(radial(firework(40, 10), 138, 12))
    g.append(f'<g {SW}>{scallop(104, 10, 24)}</g>')
    g.append(clock(88))
    return ("".join(g), "-410 -410 820 820", None)


PAGES = [
    ("christmas-mandala-coloring-page", "Christmas Mandala",
     "Biolex · Christmas Coloring Page", christmas_mandala,
     "A Christmas mandala coloring page of holly, ornaments, and little trees around a poinsettia center. Original holiday line art to print and color."),
    ("christmas-ornament-mandala-coloring-page", "Ornament Mandala",
     "Biolex · Christmas Coloring Page", christmas_ornament_mandala,
     "An intricate ornament mandala coloring page for adults: three rings of decorated baubles around a central bloom. Original line art to color."),
    ("new-year-mandala-coloring-page", "New Year Mandala",
     "Biolex · New Year Coloring Page", new_year_mandala,
     "A New Year mandala coloring page of fireworks and stars circling a clock at midnight. Original line art to print and color."),
]


def main():
    os.makedirs(OUT, exist_ok=True)
    for slug, title, eyebrow, fn, desc in PAGES:
        open(f"{OUT}/{slug}.html", "w").write(coloring_page(title, eyebrow, fn()))
        open(f"{OUT}/{slug}.meta.json", "w").write(json.dumps({"description": desc, "orientation": "portrait"}))
        print("wrote", slug)


if __name__ == "__main__":
    main()
