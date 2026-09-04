#!/usr/bin/env python3
"""Zentangle HERO coloring pages: one richly detailed subject (jack-o'-lantern,
ornament, snowflake ...) whose segments are packed with distinct fine patterns,
wrapped in a decorative botanical frame. Aims at the dense, Etsy-style adult
coloring look of the Pinterest pins, as clean printable line art.

Technique: SVG <pattern> fills (auto-clip to each segment path) + a white
"carved" overlay for open areas (faces) + botanical frame + scattered accents.
Verified to render in WeasyPrint.
"""
import math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from proof_phase2 import coloring_page

SW = 'stroke="#111" fill="none" stroke-linecap="round" stroke-linejoin="round"'


# ---------------------------------------------------------------- pattern defs
def pattern_defs():
    P = []
    P.append('<pattern id="z-dots" width="15" height="15" patternUnits="userSpaceOnUse">'
             '<circle cx="7.5" cy="7.5" r="1.7" fill="#111"/></pattern>')
    P.append('<pattern id="z-rings" width="17" height="17" patternUnits="userSpaceOnUse">'
             '<circle cx="8.5" cy="8.5" r="4.2" fill="none" stroke="#111" stroke-width="1"/></pattern>')
    P.append('<pattern id="z-diag" width="13" height="13" patternUnits="userSpaceOnUse">'
             '<path d="M0 13 L13 0" stroke="#111" stroke-width="1.1" fill="none"/></pattern>')
    P.append('<pattern id="z-cross" width="12" height="12" patternUnits="userSpaceOnUse">'
             '<path d="M0 12 L12 0 M0 0 L12 12" stroke="#111" stroke-width="0.9" fill="none"/></pattern>')
    P.append('<pattern id="z-vert" width="12" height="12" patternUnits="userSpaceOnUse">'
             '<path d="M6 0 V12" stroke="#111" stroke-width="1.1" fill="none"/></pattern>')
    P.append('<pattern id="z-wave" width="18" height="12" patternUnits="userSpaceOnUse">'
             '<path d="M0 6 Q4.5 0 9 6 T18 6" stroke="#111" stroke-width="1.1" fill="none"/></pattern>')
    P.append('<pattern id="z-scale" width="20" height="10" patternUnits="userSpaceOnUse">'
             '<path d="M-10 10 A10 10 0 0 1 10 10 M10 10 A10 10 0 0 1 30 10" '
             'stroke="#111" stroke-width="1" fill="none"/></pattern>')
    P.append('<pattern id="z-tear" width="16" height="16" patternUnits="userSpaceOnUse">'
             '<path d="M8 3 C12 7 12 11 8 13 C4 11 4 7 8 3 Z" stroke="#111" stroke-width="0.9" fill="none"/></pattern>')
    P.append('<pattern id="z-plus" width="14" height="14" patternUnits="userSpaceOnUse">'
             '<path d="M7 3 V11 M3 7 H11" stroke="#111" stroke-width="1" fill="none"/></pattern>')
    return '<defs>' + "".join(P) + '</defs>'


FILLS = ["z-diag", "z-dots", "z-scale", "z-vert", "z-cross", "z-wave", "z-rings", "z-tear", "z-plus"]


# ---------------------------------------------------------------- helpers
def leaf(cx, cy, L, W, ang, veins=3):
    g = [f'<g transform="translate({cx} {cy}) rotate({ang})">']
    g.append(f'<path d="M0 0 C {W} {-L*0.3:.0f} {W} {-L*0.7:.0f} 0 {-L} '
             f'C {-W} {-L*0.7:.0f} {-W} {-L*0.3:.0f} 0 0 Z" {SW} stroke-width="1.6"/>')
    g.append(f'<path d="M0 {-L*0.05:.0f} L0 {-L*0.9:.0f}" {SW} stroke-width="1.2"/>')
    for i in range(1, veins + 1):
        t = i / (veins + 1)
        g.append(f'<path d="M0 {-L*t:.0f} q {W*0.5:.0f} {-L*0.08:.0f} {W*0.7:.0f} {-L*0.16:.0f}" {SW} stroke-width="1"/>')
        g.append(f'<path d="M0 {-L*t:.0f} q {-W*0.5:.0f} {-L*0.08:.0f} {-W*0.7:.0f} {-L*0.16:.0f}" {SW} stroke-width="1"/>')
    g.append('</g>')
    return "".join(g)


def tendril(cx, cy, ang, size, sgn=1):
    return (f'<g transform="translate({cx} {cy}) rotate({ang})">'
            f'<path d="M0 0 C {sgn*size*0.4:.0f} {-size*0.5:.0f} {sgn*size*1.1:.0f} {-size*0.3:.0f} '
            f'{sgn*size*0.9:.0f} {-size*0.9:.0f} C {sgn*size*0.75:.0f} {-size*1.25:.0f} '
            f'{sgn*size*1.05:.0f} {-size*1.4:.0f} {sgn*size*1.25:.0f} {-size*1.25:.0f}" '
            f'{SW} stroke-width="1.5"/></g>')


def frame():
    """Rounded double border with small corner flourishes."""
    g = [f'<g {SW} stroke-width="1.6">']
    g.append('<rect x="-388" y="-388" width="776" height="776" rx="18"/>')
    g.append('<rect x="-378" y="-378" width="756" height="756" rx="14" stroke-width="1"/>')
    for sx in (-1, 1):
        for sy in (-1, 1):
            x, y = sx * 366, sy * 366
            g.append(f'<g transform="translate({x} {y}) scale({sx} {sy})">'
                     f'<path d="M-46 0 q 30 0 46 -46 M0 -46 q 0 30 -46 46" stroke-width="1.3"/>'
                     f'<circle cx="-30" cy="-30" r="3.4" fill="#111" stroke="none"/></g>')
    g.append('</g>')
    return "".join(g)


def star(cx, cy, r):
    pts = []
    for i in range(10):
        rr = r if i % 2 == 0 else r * 0.42
        a = math.radians(i * 36 - 90)
        pts.append(f"{cx+rr*math.cos(a):.1f} {cy+rr*math.sin(a):.1f}")
    return f'<path d="M {pts[0]} ' + " ".join("L " + p for p in pts[1:]) + f' Z" {SW} stroke-width="1.3"/>'


def spark(cx, cy, r):
    return (f'<g {SW} stroke-width="1.2"><path d="M{cx} {cy-r} L{cx} {cy+r} M{cx-r} {cy} L{cx+r} {cy} '
            f'M{cx-r*0.6:.0f} {cy-r*0.6:.0f} L{cx+r*0.6:.0f} {cy+r*0.6:.0f} '
            f'M{cx-r*0.6:.0f} {cy+r*0.6:.0f} L{cx+r*0.6:.0f} {cy-r*0.6:.0f}"/></g>')


# ---------------------------------------------------------------- pumpkin hero
def pumpkin_segments(cx=0, cy=44, W=322, H=214):
    """Squat ribbed pumpkin. Ribs meet a small rounded cap top/bottom (not a
    sharp point) so the silhouette reads round, not football-shaped."""
    top, bot = cy - H, cy + H
    capx = W * 0.12  # ribs converge to a small cap, not a single point
    bulges = [-W, -W*0.62, -W*0.22, W*0.22, W*0.62, W]
    segs = []
    for i in range(len(bulges) - 1):
        ba, bb = bulges[i], bulges[i + 1]
        # cap x-position scales with how outer the rib is, so the top/bottom round off
        ta, tb = capx * ba / W, capx * bb / W
        d = (f'M {cx+ta} {top} '
             f'C {cx+ba} {top+0.30*H:.0f} {cx+ba} {bot-0.30*H:.0f} {cx+ta} {bot} '
             f'C {cx+ta*0.4:.0f} {bot+0.05*H:.0f} {cx+tb*0.4:.0f} {bot+0.05*H:.0f} {cx+tb} {bot} '
             f'C {cx+bb} {bot-0.30*H:.0f} {cx+bb} {top+0.30*H:.0f} {cx+tb} {top} '
             f'C {cx+tb*0.4:.0f} {top-0.05*H:.0f} {cx+ta*0.4:.0f} {top-0.05*H:.0f} {cx+ta} {top} Z')
        segs.append(d)
    return segs, (top, bot)


def jack_face(cx=0, cy=40):
    g = [f'<g stroke="#111" stroke-width="2" fill="#fff" stroke-linejoin="round">']
    # eyes (triangles), nose, toothy grin — white fill carves the pattern out
    g.append(f'<path d="M {cx-92} {cy-30} L {cx-40} {cy-46} L {cx-46} {cy+6} Z"/>')
    g.append(f'<path d="M {cx+92} {cy-30} L {cx+40} {cy-46} L {cx+46} {cy+6} Z"/>')
    g.append(f'<path d="M {cx} {cy-6} L {cx-26} {cy+30} L {cx+26} {cy+30} Z"/>')
    # grin
    mw, my = 140, cy + 70
    top = [f'M {cx-mw} {my}']
    n = 7
    for i in range(1, n + 1):
        x = cx - mw + 2 * mw * i / n
        top.append(f'L {x:.0f} {my + (30 if i % 2 else 6):.0f}')
    for i in range(n - 1, -1, -1):
        x = cx - mw + 2 * mw * i / n
        top.append(f'L {x:.0f} {my + (54 if i % 2 else 30):.0f}')
    g.append(f'<path d="{" ".join(top)} Z"/>')
    g.append('</g>')
    return "".join(g)


def pumpkin_hero():
    segs, (top, bot) = pumpkin_segments()
    fills = ["z-scale", "z-diag", "z-dots", "z-dots", "z-diag", "z-scale"]
    g = []
    # faint radiating background web behind the pumpkin
    g.append(f'<g {SW} stroke-width="0.8">')
    for k in range(24):
        a = math.radians(360 / 24 * k)
        g.append(f'<path d="M {330*math.cos(a):.0f} {330*math.sin(a):.0f} L {385*math.cos(a):.0f} {385*math.sin(a):.0f}"/>')
    for rr in (300, 330, 360):
        g.append(f'<circle r="{rr}" stroke-dasharray="2 6"/>')
    g.append('</g>')
    # segment fills (pattern) then crisp outlines
    for d, f in zip(segs, fills):
        g.append(f'<path d="{d}" fill="url(#{f})" stroke="none"/>')
    for d in segs:
        g.append(f'<path d="{d}" {SW} stroke-width="2.2"/>')
    # outer silhouette emphasis
    g.append(f'<path d="{segs[0]}" {SW} stroke-width="2.6"/><path d="{segs[-1]}" {SW} stroke-width="2.6"/>')
    # carved face
    g.append(jack_face())
    # stem
    g.append(f'<path d="M -14 {top+6:.0f} C -22 {top-46:.0f} 20 {top-52:.0f} 14 {top+2:.0f}" {SW} stroke-width="2.4" fill="url(#z-vert)"/>')
    g.append(f'<path d="M 6 {top-30:.0f} C 26 {top-54:.0f} 52 {top-40:.0f} 48 {top-14:.0f}" {SW} stroke-width="2"/>')
    # tendrils + leaves at the top
    g.append(tendril(40, top - 6, 20, 60, 1))
    g.append(tendril(-40, top - 6, -20, 60, -1))
    g.append(leaf(70, top + 10, 90, 34, 40))
    g.append(leaf(-70, top + 10, 90, 34, -40))
    # scattered accents + a couple bats in the corners
    for cx, cy, r in [(-330, -300, 12), (330, -300, 10), (-340, 300, 9), (330, 320, 12)]:
        g.append(star(cx, cy, r))
    for bx, by, s in [(-320, -250, 1), (320, -250, -1)]:
        g.append(f'<g transform="translate({bx} {by}) scale({s} 1)" {SW} stroke-width="1.6">'
                 '<path d="M0 0 q -14 -12 -30 -6 q 8 2 6 14 q 12 -8 24 2 q 12 -10 24 -2 q -2 -12 6 -14 q -16 -6 -30 6 Z"/>'
                 '<circle cx="0" cy="-2" r="6"/></g>')
    return (pattern_defs() + "".join(g), "-410 -410 820 820", None)


def rosette(cx, cy, R, petals=12):
    g = [f'<g {SW} stroke-width="1.6">']
    for k in range(petals):
        a = 360 / petals * k
        g.append(f'<g transform="translate({cx} {cy}) rotate({a})">'
                 f'<path d="M0 {-R*0.24:.0f} C {R*0.22:.0f} {-R*0.5:.0f} {R*0.22:.0f} {-R*0.9:.0f} 0 {-R} '
                 f'C {-R*0.22:.0f} {-R*0.9:.0f} {-R*0.22:.0f} {-R*0.5:.0f} 0 {-R*0.24:.0f} Z"/>'
                 f'<path d="M0 {-R*0.34:.0f} L0 {-R*0.86:.0f}"/></g>')
    g.append(f'<circle cx="{cx}" cy="{cy}" r="{R*0.22:.0f}"/>')
    g.append(f'<circle cx="{cx}" cy="{cy}" r="{R*0.1:.0f}" fill="url(#z-dots)"/></g>')
    return "".join(g)


def holly_sprig(cx, cy, ang):
    g = [f'<g transform="translate({cx} {cy}) rotate({ang})" {SW} stroke-width="1.6">']
    for s, rot in ((1, 18), (-1, -18), (1, -42)):
        g.append(f'<g transform="rotate({rot})"><path d="M0 0 '
                 'L 10 -14 L 4 -20 L 16 -30 L 8 -36 L 20 -48 L 6 -50 L 0 -64 '
                 'L -6 -50 L -20 -48 L -8 -36 L -16 -30 L -4 -20 L -10 -14 Z"/>'
                 '<path d="M0 -6 L0 -56"/></g>')
    for bx, by in ((-7, 4), (7, 4), (0, 12)):
        g.append(f'<circle cx="{bx}" cy="{by}" r="5.5"/>')
    g.append('</g>')
    return "".join(g)


def ornament_hero():
    cx, cy, R = 0, 40, 236
    bands = [(R, "z-scale"), (194, "z-diag"), (152, "z-dots"), (100, None)]
    g = [pattern_defs()]
    # concentric pattern bands (white circles erase inward to make annuli)
    for i, (r, pat) in enumerate(bands):
        if pat:
            g.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#{pat})" stroke="none"/>')
        nxt = bands[i + 1][0] if i + 1 < len(bands) else 0
        g.append(f'<circle cx="{cx}" cy="{cy}" r="{nxt}" fill="#fff" stroke="none"/>')
    # band outlines + bead rows on the boundaries
    for r, _ in bands:
        g.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" {SW} stroke-width="2"/>')
    for r in (R, 194, 152):
        n = max(24, int(r / 8))
        for k in range(n):
            a = math.radians(360 / n * k)
            g.append(f'<circle cx="{cx+r*math.cos(a):.1f}" cy="{cy+r*math.sin(a):.1f}" r="1.6" fill="#111"/>')
    g.append(f'<circle cx="{cx}" cy="{cy}" r="{R}" {SW} stroke-width="2.8"/>')
    # centre rosette
    g.append(rosette(cx, cy, 92, 12))
    # cap + hanger + bow
    topy = cy - R
    g.append(f'<rect x="-26" y="{topy-34:.0f}" width="52" height="40" rx="6" {SW} stroke-width="2.2" fill="url(#z-vert)"/>')
    g.append(f'<path d="M-26 {topy-20:.0f} H26 M-26 {topy-8:.0f} H26" {SW} stroke-width="1.2"/>')
    g.append(f'<path d="M-13 {topy-34:.0f} A18 20 0 1 1 13 {topy-34:.0f}" {SW} stroke-width="2.2"/>')
    g.append(f'<path d="M0 {topy-54:.0f} L0 -392" {SW} stroke-width="1.4"/>')
    # holly at the shoulders
    g.append(holly_sprig(-120, topy + 60, -40))
    g.append(holly_sprig(120, topy + 60, 40))
    # scattered sparkles + corner accents
    for x, y, r in [(-330, -300, 12), (330, -300, 12), (-330, 320, 10), (330, 320, 10)]:
        g.append(star(x, y, r))
    for x, y, r in [(-300, 60, 7), (300, 60, 7), (-250, 300, 6), (250, 300, 6)]:
        g.append(spark(x, y, r))
    g.append(frame())
    return ("".join(g), "-410 -410 820 820", None)


def snowflake_arm(L=372):
    g = [f'<g {SW} stroke-width="2">']
    g.append(f'<path d="M0 0 L {L} 0"/>')
    for t, bl, ba, sub in [(0.30, 64, 42, True), (0.46, 92, 40, True),
                           (0.62, 74, 38, True), (0.78, 54, 34, False), (0.90, 34, 30, False)]:
        bx = L * t
        rad = math.radians(ba)
        for s in (1, -1):
            ex, ey = bx + bl * math.cos(rad), s * bl * math.sin(rad)
            g.append(f'<path d="M {bx:.0f} 0 L {ex:.0f} {ey:.0f}"/>')
            # arrow tip
            g.append(f'<path d="M {ex:.0f} {ey:.0f} l {-10*math.cos(rad)+6*math.sin(rad):.0f} {s*(-10*math.sin(rad)-6*math.cos(rad)):.0f} '
                     f'M {ex:.0f} {ey:.0f} l {-10*math.cos(rad)-6*math.sin(rad):.0f} {s*(-10*math.sin(rad)+6*math.cos(rad)):.0f}"/>')
            if sub:
                mx, my = bx + bl * 0.5 * math.cos(rad), s * bl * 0.5 * math.sin(rad)
                g.append(f'<path d="M {mx:.0f} {my:.0f} l {18*math.cos(rad):.0f} {s*18*math.sin(rad)+14:.0f}"/>')
        # diamond bead on the spine
        g.append(f'<path d="M {bx-10:.0f} 0 L {bx:.0f} -9 L {bx+10:.0f} 0 L {bx:.0f} 9 Z"/>')
    # feathered tip
    g.append(f'<path d="M {L-40:.0f} 0 L {L-18:.0f} 16 L {L:.0f} 0 L {L-18:.0f} -16 Z"/>')
    g.append('</g>')
    return "".join(g)


def snowflake_hero():
    g = [pattern_defs(), f'<g {SW}>']
    one = snowflake_arm(374)
    for k in range(6):
        g.append(f'<g transform="rotate({60*k})">{one}</g>')
    # central hexagon medallion with pattern
    hp = [(40 * math.cos(math.radians(60 * k)), 40 * math.sin(math.radians(60 * k))) for k in range(6)]
    hexd = "M " + " L ".join(f"{x:.0f} {y:.0f}" for x, y in hp) + " Z"
    g.append(f'<path d="{hexd}" fill="url(#z-dots)" stroke="none"/>')
    g.append(f'<path d="{hexd}" stroke-width="2"/>')
    g.append('<circle r="16"/><circle r="6"/>')
    g.append('</g>')
    # small snowflakes + sparkles scattered
    small = f'<g {SW} stroke-width="1.3">' + "".join(
        f'<g transform="rotate({60*k})"><path d="M0 0 L20 0 M14 0 l-6 5 M14 0 l-6 -5"/></g>' for k in range(6)) + '</g>'
    for x, y in [(-320, -300), (320, -300), (-320, 300), (320, 300)]:
        g.append(f'<g transform="translate({x} {y}) scale(0.8)">{small}</g>')
    for x, y, r in [(-360, 0, 8), (360, 0, 8), (0, -372, 7), (0, 372, 7)]:
        g.append(spark(x, y, r))
    g.append(frame())
    return ("".join(g), "-410 -410 820 820", None)


def annulus(r_out, r_in, pat, cx=0, cy=0):
    return (f'<circle cx="{cx}" cy="{cy}" r="{r_out}" fill="url(#{pat})" stroke="none"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{r_in}" fill="#fff" stroke="none"/>')


def zpetal_ring(rin, rout, hw, pat, count, phase=0):
    mx = (rin + rout) / 2
    d = (f'M {rin} {-hw} Q {mx} {-hw*1.7:.0f} {rout} 0 Q {mx} {hw*1.7:.0f} {rin} {hw} '
         f'Q {rin+(rout-rin)*0.12:.0f} 0 {rin} {-hw} Z')
    out = []
    for k in range(count):
        a = 360 / count * k + phase
        out.append(f'<g transform="rotate({a})"><path d="{d}" fill="url(#{pat})" stroke="none"/>'
                   f'<path d="{d}" {SW} stroke-width="1.8"/></g>')
    return "".join(out)


def halloween_mandala_hero():
    from gen_halloween import bat, jack_o_lantern, candy_corn, wreath, radial, web_medallion, spider
    import gen_art as GA
    g = [pattern_defs(), f'<g {SW} stroke-width="2"><circle r="384"/><circle r="374"/></g>']
    # decorated outer rim band
    g.append(annulus(372, 342, "z-scale"))
    g.append(f'<g {SW} stroke-width="1.6"><circle r="372"/><circle r="342"/></g>')
    g.append(f'<g {SW} stroke-width="1">')
    for k in range(48):
        a = math.radians(360 / 48 * k)
        g.append(f'<path d="M {342*math.cos(a):.0f} {342*math.sin(a):.0f} L {372*math.cos(a):.0f} {372*math.sin(a):.0f}"/>')
    g.append('</g>')
    # ring of bats
    g.append(wreath(bat(w=120, h=60), 316, 12))
    # lace
    g.append(f'<g {SW} stroke-width="1.4">{GA.scallop(292, 12, 36)}{GA.dots(278, 4, 36)}</g>')
    # pattern-filled petal ring (density)
    g.append(zpetal_ring(196, 276, 24, "z-diag", 16))
    g.append(f'<g {SW} stroke-width="1.2">{GA.dots(180, 5, 32)}</g>')
    # ring of small jack-o'-lanterns
    g.append(wreath(jack_o_lantern(86, 76), 148, 10, phase=18))
    # inner band + centre pumpkin-face medallion
    g.append(annulus(104, 78, "z-dots"))
    g.append(f'<g {SW} stroke-width="1.6"><circle r="104"/><circle r="78"/></g>')
    g.append(web_medallion(R=74, rings=4, spokes=12))
    g.append(f'<g transform="translate(0 2)">{spider(body=16)}</g>')
    return ("".join(g), "-410 -410 820 820", None)


def spiderweb_hero():
    from gen_halloween import bat, spider, wreath
    g = [pattern_defs(), f'<g {SW} stroke-width="2"><circle r="384"/><circle r="374"/></g>']
    # decorated rim
    g.append(annulus(372, 344, "z-scale"))
    g.append(f'<g {SW} stroke-width="1.5"><circle r="372"/><circle r="344"/></g>')
    # web
    R, spokes, rings = 340, 16, 11
    web = [f'<g {SW} stroke-width="1.7">']
    for k in range(spokes):
        a = math.radians(360 / spokes * k)
        web.append(f'<path d="M 0 0 L {R*math.cos(a):.1f} {R*math.sin(a):.1f}"/>')
    for i in range(1, rings + 1):
        rr = R * i / rings
        pts = [(rr * math.cos(math.radians(360 / spokes * k)), rr * math.sin(math.radians(360 / spokes * k))) for k in range(spokes)]
        d = "M %.1f %.1f" % pts[0]
        for k in range(1, spokes):
            am = math.radians(360 / spokes * (k - 0.5)); sag = rr * 0.85
            d += " Q %.1f %.1f %.1f %.1f" % (sag*math.cos(am), sag*math.sin(am), pts[k][0], pts[k][1])
        am = math.radians(360 / spokes * (spokes - 0.5)); sag = rr * 0.85
        d += " Q %.1f %.1f %.1f %.1f Z" % (sag*math.cos(am), sag*math.sin(am), pts[0][0], pts[0][1])
        web.append(f'<path d="{d}"/>')
    web.append('</g>')
    g.append("".join(web))
    # dew drops on two rings
    for ri in (4, 8):
        rr = R * (ri + 0.5) / rings
        for k in range(spokes):
            a = math.radians(360 / spokes * (k + 0.5))
            g.append(f'<circle cx="{rr*math.cos(a):.1f}" cy="{rr*math.sin(a):.1f}" r="3.4" {SW} stroke-width="1.2"/>')
    # bat ring + centre spider
    g.append(wreath(bat(w=104, h=52), 322, 12, phase=15))
    g.append(f'<g transform="translate(0 0) scale(1.7)">{spider(body=30)}</g>')
    for x, y, r in [(-330, -300, 11), (330, -300, 11), (-330, 320, 9), (330, 320, 9)]:
        g.append(star(x, y, r))
    g.append(frame())
    return ("".join(g), "-410 -410 820 820", None)


def poinsettia(cx, cy, R):
    g = [f'<g {SW} stroke-width="1.8">']
    for layer, (rr, n, pat, off) in enumerate([(R, 8, "z-diag", 0), (R*0.66, 8, "z-vert", 22.5)]):
        hw = rr * 0.3
        for k in range(n):
            a = 360 / n * k + off
            d = (f'M 0 0 L {-hw:.0f} {-rr*0.5:.0f} L 0 {-rr:.0f} L {hw:.0f} {-rr*0.5:.0f} Z')
            g.append(f'<g transform="translate({cx} {cy}) rotate({a})">'
                     f'<path d="{d}" fill="url(#{pat})" stroke="none"/>'
                     f'<path d="{d}" {SW} stroke-width="1.8"/>'
                     f'<path d="M 0 0 L 0 {-rr*0.92:.0f}" {SW} stroke-width="1"/></g>')
    # berry cluster centre
    for bx, by in [(0, 0), (-12, -8), (12, -8), (-8, 10), (8, 10), (0, -16), (0, 14)]:
        g.append(f'<circle cx="{cx+bx}" cy="{cy+by}" r="6" {SW} stroke-width="1.4"/>')
    g.append('</g>')
    return "".join(g)


def christmas_mandala_hero():
    from gen_seasonal_v2 import bauble
    import gen_art as GA
    g = [pattern_defs(), f'<g {SW} stroke-width="2"><circle r="384"/><circle r="374"/></g>']
    g.append(annulus(372, 344, "z-scale"))
    g.append(f'<g {SW} stroke-width="1.5"><circle r="372"/><circle r="344"/></g>')
    g.append(f'<g {SW} stroke-width="1">')
    for k in range(48):
        a = math.radians(360 / 48 * k)
        g.append(f'<path d="M {344*math.cos(a):.0f} {344*math.sin(a):.0f} L {372*math.cos(a):.0f} {372*math.sin(a):.0f}"/>')
    g.append('</g>')
    from gen_zentangle import holly_sprig as _hs  # local reuse
    g.append(_wreath_holly(316, 10))
    g.append(f'<g {SW} stroke-width="1.4">{GA.scallop(292, 12, 36)}{GA.dots(278, 4, 36)}</g>')
    g.append(zpetal_ring(196, 276, 24, "z-diag", 16))
    g.append(f'<g {SW} stroke-width="1.2">{GA.dots(180, 5, 24)}</g>')
    g.append(_wreath_bauble(bauble, 150, 10))
    g.append(f'<g {SW} stroke-width="1.4">{GA.scallop(120, 10, 24)}</g>')
    g.append(poinsettia(0, 0, 104))
    return ("".join(g), "-410 -410 820 820", None)


def newyear_hero():
    from gen_seasonal_v2 import firework, clock, star5
    import gen_art as GA
    g = [pattern_defs(), f'<g {SW} stroke-width="2"><circle r="384"/><circle r="374"/></g>']
    g.append(annulus(372, 344, "z-cross"))
    g.append(f'<g {SW} stroke-width="1.5"><circle r="372"/><circle r="344"/></g>')
    # firework ring (radial)
    for k in range(12):
        a = 360 / 12 * k
        g.append(f'<g transform="rotate({a}) translate(316 0) rotate(90)">{firework(46, 12)}</g>')
    g.append(f'<g {SW} stroke-width="1.3">{GA.dots(272, 5, 24)}{GA.scallop(258, -10, 24)}</g>')
    g.append(zpetal_ring(180, 250, 22, "z-diag", 16))
    # star ring (outline)
    for k in range(12):
        a = math.radians(360 / 12 * k + 15)
        g.append(f'<g transform="translate({150*math.cos(a):.0f} {150*math.sin(a):.0f})">{star5(24)}</g>')
    g.append(f'<g {SW} stroke-width="1.3">{GA.scallop(112, 10, 24)}</g>')
    # centre clock medallion with a patterned band
    g.append(annulus(104, 92, "z-dots"))
    g.append(clock(88))
    return ("".join(g), "-410 -410 820 820", None)


def _wreath_holly(R, count):
    out = []
    for k in range(count):
        ang = 360 / count * k
        out.append(f'<g transform="rotate({ang}) translate({R} 0) rotate({-ang})">{holly_sprig(0, 0, 0)}</g>')
    return "".join(out)


def _wreath_bauble(bauble_fn, R, count):
    out = []
    for k in range(count):
        ang = 360 / count * k
        out.append(f'<g transform="rotate({ang}) translate({R} 0) rotate({-ang})">{bauble_fn(40, "dots")}</g>')
    return "".join(out)


# key -> (title in PDF, eyebrow, builder)
HEROES = {
    "pumpkin": ("Halloween Pumpkin", "Biolex · Halloween Coloring Page", pumpkin_hero),
    "ornament": ("Christmas Ornament", "Biolex · Christmas Coloring Page", ornament_hero),
    "snowflake": ("Snowflake", "Biolex · Winter Coloring Page", snowflake_hero),
    "halloween-mandala": ("Halloween Mandala", "Biolex · Halloween Coloring Page", halloween_mandala_hero),
    "spiderweb": ("Spiderweb Mandala", "Biolex · Halloween Coloring Page", spiderweb_hero),
    "christmas-mandala": ("Christmas Mandala", "Biolex · Christmas Coloring Page", christmas_mandala_hero),
    "newyear": ("New Year Mandala", "Biolex · New Year Coloring Page", newyear_hero),
}

# slug -> (key, PDF title, eyebrow, site description)
REAL = {
    "christmas-ornament-mandala-coloring-page": (
        "ornament", "Ornament Mandala", "Biolex · Christmas Coloring Page",
        "An intricate ornament mandala coloring page: a bauble of concentric patterned bands around a central rosette, with holly and berries. Detailed line art to print and color."),
    "snowflake-mandala-coloring-page": (
        "snowflake", "Snowflake Mandala", "Biolex · Winter Coloring Page",
        "A detailed snowflake mandala coloring page with six branching crystal arms and a patterned center. Intricate winter line art to print and color."),
    "halloween-mandala-coloring-page": (
        "halloween-mandala", "Halloween Mandala", "Biolex · Halloween Coloring Page",
        "A detailed Halloween mandala coloring page: pattern-filled petals ringed with bats and jack-o'-lanterns around a spider-web center. Intricate line art to print and color."),
    "spiderweb-mandala-coloring-page": (
        "spiderweb", "Spiderweb Mandala", "Biolex · Halloween Coloring Page",
        "A detailed spiderweb mandala coloring page with a full sagged web, dew drops, a bat ring, and a spider at the center. Intricate Halloween line art to print and color."),
    "christmas-mandala-coloring-page": (
        "christmas-mandala", "Christmas Mandala", "Biolex · Christmas Coloring Page",
        "A detailed Christmas mandala coloring page: a patterned poinsettia center ringed with holly, ornaments, and pattern-filled petals. Intricate holiday line art to print and color."),
    "new-year-mandala-coloring-page": (
        "newyear", "New Year Mandala", "Biolex · New Year Coloring Page",
        "A detailed New Year mandala coloring page of fireworks and stars around a midnight clock, with pattern-filled petals. Intricate line art to print and color."),
}

import json


def build_real():
    OUT = "public/printables"
    for slug, (key, title, eyebrow, desc) in REAL.items():
        fn = HEROES[key][2]
        open(f"{OUT}/{slug}.html", "w").write(coloring_page(title, eyebrow, fn()))
        open(f"{OUT}/{slug}.meta.json", "w").write(json.dumps({"description": desc, "orientation": "portrait"}))
        print("wrote", slug)


def main():
    # proofs to /tmp
    for key, (title, eyebrow, fn) in HEROES.items():
        open(f"/tmp/zen-{key}.html", "w").write(coloring_page(title, eyebrow, fn()))
        print("wrote /tmp/zen-" + key + ".html")


if __name__ == "__main__":
    import sys
    build_real() if "--real" in sys.argv else main()
