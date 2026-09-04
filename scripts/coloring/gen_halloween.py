#!/usr/bin/env python3
"""Real Halloween coloring-page line art: original vector motifs (jack-o'-lanterns,
bats, candy corn, ghosts, spider + web) arranged into a genuine Halloween mandala
and a spiderweb mandala. Pure geometry, clean black strokes, no fill = ready to
color. No AI, no IP. Overwrites the two Halloween coloring pages that were
previously generic geometric mandalas.

    python3 scripts/coloring/gen_halloween.py     # writes the two .html files
Then: node scripts/build-printables.mjs halloween-mandala-coloring-page
      node scripts/build-printables.mjs spiderweb-mandala-coloring-page
"""
import math, os, json, sys
sys.path.insert(0, os.path.dirname(__file__))
from gen_art import scallop, dots, ring_of, petal, P
from proof_phase2 import coloring_page

OUT = "public/printables"
SW = 'stroke="#111" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"'


# ---------------------------------------------------------------- motifs
# Each motif is drawn centred on the origin, "up" = -y, at display size.

def jack_o_lantern(w=110, h=96, face=True):
    """A ribbed jack-o'-lantern with stem. Triangle eyes + nose, zig-zag grin."""
    rx, ry = w / 2, h / 2
    g = []
    # stem
    g.append(f'<path d="M {-6} {-ry} C {-8} {-ry-18} {6} {-ry-20} {4} {-ry-2}"/>')
    g.append(f'<path d="M {-2} {-ry-14} C {8} {-ry-22} {18} {-ry-16} {16} {-ry-6}"/>')
    # body: outer + 4 inner ribs (arcs top->bottom)
    g.append(f'<ellipse cx="0" cy="0" rx="{rx:.1f}" ry="{ry:.1f}"/>')
    for dx in (-rx * 0.52, -rx * 0.2, rx * 0.2, rx * 0.52):
        bow = rx * 0.30 if abs(dx) < rx * 0.35 else rx * 0.16
        cx = dx * 1.15
        g.append(f'<path d="M {dx:.1f} {-ry*0.92:.1f} C {cx-bow:.1f} {-ry*0.4:.1f} '
                 f'{cx-bow:.1f} {ry*0.4:.1f} {dx:.1f} {ry*0.92:.1f}"/>')
    if face:
        # eyes (triangles), nose (small triangle), zig-zag mouth
        ey, es = -ry * 0.18, rx * 0.26
        g.append(f'<path d="M {-rx*0.44:.1f} {ey:.1f} L {-rx*0.44+es:.1f} {ey:.1f} '
                 f'L {-rx*0.44+es*0.5:.1f} {ey+es*0.9:.1f} Z"/>')
        g.append(f'<path d="M {rx*0.44:.1f} {ey:.1f} L {rx*0.44-es:.1f} {ey:.1f} '
                 f'L {rx*0.44-es*0.5:.1f} {ey+es*0.9:.1f} Z"/>')
        g.append(f'<path d="M 0 {ey+es*0.35:.1f} L {-es*0.4:.1f} {ey+es*1.05:.1f} '
                 f'L {es*0.4:.1f} {ey+es*1.05:.1f} Z"/>')
        # grin
        my, mw = ry * 0.34, rx * 0.66
        teeth = []
        n = 6
        for i in range(n + 1):
            x = -mw + (2 * mw) * i / n
            y = my + (10 if i % 2 else -10)
            teeth.append(f'{"M" if i == 0 else "L"} {x:.1f} {y:.1f}')
        # bottom lip back
        for i in range(n, -1, -1):
            x = -mw + (2 * mw) * i / n
            y = my + (22 if i % 2 else 10)
            teeth.append(f'L {x:.1f} {y:.1f}')
        g.append(f'<path d="{" ".join(teeth)} Z"/>')
    return f'<g {SW}>{"".join(g)}</g>'


def bat(w=150, h=74):
    """A winged bat: rounded body, ears, two scalloped wings."""
    hw = w / 2
    g = []
    # body + head
    g.append('<ellipse cx="0" cy="6" rx="15" ry="24"/>')
    g.append('<circle cx="0" cy="-22" r="15"/>')
    # ears
    g.append('<path d="M -11 -30 L -16 -46 L -3 -35 Z"/>')
    g.append('<path d="M 11 -30 L 16 -46 L 3 -35 Z"/>')
    # eyes
    g.append('<circle cx="-6" cy="-22" r="2.4"/><circle cx="6" cy="-22" r="2.4"/>')

    def wing(sgn):
        # anchors from shoulder out to tip then scallop back to body bottom
        sx, sy = sgn * 14, -12
        tipx, tipy = sgn * hw, -18
        # top edge up to tip
        d = f'M {sx} {sy} Q {sgn*hw*0.5} {-56} {tipx} {tipy} '
        # scalloped lower edge back toward body (3 scallops)
        pts = [(sgn * hw, -18), (sgn * hw * 0.66, 4), (sgn * hw * 0.36, 14), (sgn * 15, 22)]
        for i in range(len(pts) - 1):
            x0, y0 = pts[i]; x1, y1 = pts[i + 1]
            mx, my = (x0 + x1) / 2, (y0 + y1) / 2
            d += f'Q {mx} {my + 22} {x1} {y1} '
        return f'<path d="{d}Z"/>'

    g.append(wing(-1)); g.append(wing(1))
    return f'<g {SW}>{"".join(g)}</g>'


def candy_corn(w=42, h=64):
    """Rounded triangle candy corn with two band lines (point up)."""
    hw, hh = w / 2, h / 2
    g = []
    g.append(f'<path d="M 0 {-hh} Q {hw*0.5} {-hh} {hw*0.62} {-hh*0.2} '
             f'L {hw} {hh} Q {hw*0.6} {hh*1.2} 0 {hh*1.2} '
             f'Q {-hw*0.6} {hh*1.2} {-hw} {hh} '
             f'L {-hw*0.62} {-hh*0.2} Q {-hw*0.5} {-hh} 0 {-hh} Z"/>')
    g.append(f'<path d="M {-hw*0.42:.1f} {-hh*0.1:.1f} Q 0 {-hh*0.02:.1f} {hw*0.42:.1f} {-hh*0.1:.1f}"/>')
    g.append(f'<path d="M {-hw*0.78:.1f} {hh*0.55:.1f} Q 0 {hh*0.68:.1f} {hw*0.78:.1f} {hh*0.55:.1f}"/>')
    return f'<g {SW}>{"".join(g)}</g>'


def ghost(w=70, h=96):
    """A friendly sheet ghost with a wavy hem, two eyes and an O mouth."""
    hw, hh = w / 2, h / 2
    g = []
    hem = f'M {-hw} {hh*0.7:.1f} '
    n = 4
    for i in range(n + 1):
        x = -hw + (2 * hw) * i / n
        y = hh - (0 if i % 2 else 18)
        hem += f'{"L" if i else "M"} {x:.1f} {y:.1f} ' if i else f'L {x:.1f} {y:.1f} '
    body = (f'M {-hw} {hh*0.7:.1f} L {-hw} {-hh*0.1:.1f} '
            f'Q {-hw} {-hh} 0 {-hh} Q {hw} {-hh} {hw} {-hh*0.1:.1f} L {hw} {hh*0.7:.1f} ')
    # wavy hem
    wave = ''
    for i in range(n, -1, -1):
        x = -hw + (2 * hw) * i / n
        y = hh - (0 if i % 2 else 20)
        wave += f'{"L" if i == n else "Q"} '
        if i == n:
            wave += f'{x:.1f} {y:.1f} '
        else:
            xm = x + (2 * hw) / n / 2
            wave += f'{xm:.1f} {hh+10:.1f} {x:.1f} {y:.1f} '
    g.append(f'<path d="{body}{wave}Z"/>')
    g.append(f'<ellipse cx="{-hw*0.32:.1f}" cy="{-hh*0.28:.1f}" rx="7" ry="10"/>')
    g.append(f'<ellipse cx="{hw*0.32:.1f}" cy="{-hh*0.28:.1f}" rx="7" ry="10"/>')
    g.append(f'<ellipse cx="0" cy="{hh*0.08:.1f}" rx="6" ry="9"/>')
    return f'<g {SW}>{"".join(g)}</g>'


def spider(body=30):
    """A round spider with eight bent legs, drawn centred at origin."""
    g = []
    g.append(f'<ellipse cx="0" cy="{body*0.5:.1f}" rx="{body:.1f}" ry="{body*0.82:.1f}"/>')
    g.append(f'<circle cx="0" cy="{-body*0.55:.1f}" r="{body*0.5:.1f}"/>')
    g.append(f'<circle cx="{-body*0.16:.1f}" cy="{-body*0.6:.1f}" r="2.6"/>')
    g.append(f'<circle cx="{body*0.16:.1f}" cy="{-body*0.6:.1f}" r="2.6"/>')
    for sgn in (-1, 1):
        for i, yy in enumerate((-0.1, 0.3, 0.7, 1.1)):
            y0 = body * yy
            g.append(f'<path d="M {sgn*body*0.7:.1f} {y0:.1f} '
                     f'Q {sgn*body*1.7:.1f} {y0-14:.1f} {sgn*body*2.0:.1f} {y0+10:.1f} '
                     f'Q {sgn*body*2.1:.1f} {y0+22:.1f} {sgn*body*2.35:.1f} {y0+30:.1f}"/>')
    return f'<g {SW}>{"".join(g)}</g>'


def web_medallion(R=112, rings=5, spokes=12):
    """A small radial spiderweb medallion for the mandala centre."""
    g = []
    for k in range(spokes):
        a = math.radians(360 / spokes * k)
        g.append(f'<path d="M 0 0 L {P(R*math.cos(a), R*math.sin(a))}"/>')
    for i in range(1, rings + 1):
        rr = R * i / rings
        pts = [(rr * math.cos(math.radians(360 / spokes * k)),
                rr * math.sin(math.radians(360 / spokes * k))) for k in range(spokes)]
        d = "M " + P(*pts[0])
        for k in range(1, spokes):
            am = math.radians(360 / spokes * (k - 0.5)); sag = rr * 0.82
            d += f" Q {P(sag*math.cos(am), sag*math.sin(am))} {P(*pts[k])}"
        am = math.radians(360 / spokes * (spokes - 0.5)); sag = rr * 0.82
        d += f" Q {P(sag*math.cos(am), sag*math.sin(am))} {P(*pts[0])} Z"
        g.append(f'<path d="{d}"/>')
    return f'<g {SW}>{"".join(g)}</g>'


# ---------------------------------------------------------------- placement
def wreath(motif, R, count, phase=0):
    """Ring of upright copies (kept vertical, like a wreath)."""
    out = []
    for k in range(count):
        ang = 360 / count * k + phase
        out.append(f'<g transform="rotate({ang}) translate({R} 0) rotate({-ang})">{motif}</g>')
    return "".join(out)


def radial(motif, R, count, phase=0, spin=90):
    """Ring of copies rotated to point outward (spin=90 => top faces out)."""
    out = []
    for k in range(count):
        ang = 360 / count * k + phase
        out.append(f'<g transform="rotate({ang}) translate({R} 0) rotate({spin})">{motif}</g>')
    return "".join(out)


# ---------------------------------------------------------------- pages
def halloween_mandala():
    g = [f'<g {SW}><circle r="384"/><circle r="376"/></g>']
    # outer bat border
    g.append(wreath(bat(w=140, h=70), 352, 12))
    # lace ring
    g.append(f'<g {SW}>{scallop(300, 15, 30)}{dots(286, 5, 30)}</g>')
    # main pumpkin wreath
    g.append(wreath(jack_o_lantern(104, 92), 236, 10))
    g.append(f'<g {SW}>{dots(176, 6, 20)}</g>')
    # candy-corn ring pointing outward
    g.append(radial(candy_corn(40, 60), 150, 16, spin=-90))
    # scallop frame around centre
    g.append(f'<g {SW}>{scallop(120, 12, 24)}</g>')
    # centre spiderweb medallion + spider
    g.append(web_medallion(R=104, rings=5, spokes=12))
    g.append(f'<g transform="translate(0 4)">{spider(body=20)}</g>')
    return ("".join(g), "-410 -410 820 820", None)


def spiderweb_mandala():
    g = [f'<g {SW}><circle r="384"/></g>']
    # full web
    R, rings, spokes = 372, 9, 16
    parts = [f'<g {SW}>']
    for k in range(spokes):
        a = math.radians(360 / spokes * k)
        parts.append(f'<path d="M 0 0 L {P(R*math.cos(a), R*math.sin(a))}"/>')
    for i in range(1, rings + 1):
        rr = R * i / rings
        pts = [(rr * math.cos(math.radians(360 / spokes * k)),
                rr * math.sin(math.radians(360 / spokes * k))) for k in range(spokes)]
        d = "M " + P(*pts[0])
        for k in range(1, spokes):
            am = math.radians(360 / spokes * (k - 0.5)); sag = rr * 0.84
            d += f" Q {P(sag*math.cos(am), sag*math.sin(am))} {P(*pts[k])}"
        am = math.radians(360 / spokes * (spokes - 0.5)); sag = rr * 0.84
        d += f" Q {P(sag*math.cos(am), sag*math.sin(am))} {P(*pts[0])} Z"
        parts.append(f'<path d="{d}"/>')
    # dew drops on the outermost ring
    for k in range(spokes):
        a = math.radians(360 / spokes * (k + 0.5))
        rr = R * (rings - 0.5) / rings
        parts.append(f'<circle cx="{rr*math.cos(a):.1f}" cy="{rr*math.sin(a):.1f}" r="4"/>')
    parts.append('</g>')
    g.append("".join(parts))
    # ring of small bats around the outside
    g.append(wreath(bat(w=96, h=48), 344, 10, phase=18))
    # a spider descending on a thread from the top
    g.append(f'<g {SW}><path d="M 0 -384 L 0 -150"/></g>')
    g.append(f'<g transform="translate(0 -108)">{spider(body=30)}</g>')
    return ("".join(g), "-410 -410 820 820", None)


def main():
    os.makedirs(OUT, exist_ok=True)
    pages = [
        ("halloween-mandala-coloring-page", "Halloween Mandala",
         "Biolex · Halloween Coloring Page", halloween_mandala(),
         "A Halloween mandala coloring page ringed with jack-o'-lanterns, bats, and candy corn around a spider-web center. Original line art to print and color."),
        ("spiderweb-mandala-coloring-page", "Spiderweb Mandala",
         "Biolex · Halloween Coloring Page", spiderweb_mandala(),
         "A spiderweb mandala coloring page with a full web, a dangling spider, and a border of little bats. Original Halloween line art to color."),
    ]
    for slug, title, eyebrow, art, desc in pages:
        open(f"{OUT}/{slug}.html", "w").write(coloring_page(title, eyebrow, art))
        open(f"{OUT}/{slug}.meta.json", "w").write(json.dumps({"description": desc, "orientation": "portrait"}))
        print("wrote", slug)


if __name__ == "__main__":
    main()
