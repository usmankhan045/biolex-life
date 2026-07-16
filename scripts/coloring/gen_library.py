#!/usr/bin/env python3
"""Phase 2/3 ART LIBRARY: builds the full set of original coloring pages and
printable wall art (pure vector, no AI) into public/printables/. Prints a JSON
catalog (slug, category, title, description) for the content manifest."""
import math, os, json, sys
sys.path.insert(0, os.path.dirname(__file__))
from gen_art import petal, scallop, ring_of, dots, P
from proof_phase2 import (coloring_page, wallart_page, flower, floral_mandala,
                          botanical_branch, abstract_lineart,
                          boho_sunmoon, midcentury)
from gen_coloring_v2 import rose_detailed, peony, owl, butterfly_detailed

OUT = "public/printables"
CATALOG = []  # (slug, category, title, description, kind)

# ============ COLORING: mandala recipes ============
def star_petal(rin, rout, hw):
    mx = (rin + rout) / 2
    return f'<path d="M {P(rin,-hw)} L {P(mx,-hw*0.5)} L {P(rout,0)} L {P(mx,hw*0.5)} L {P(rin,hw)} L {P(rin+(rout-rin)*0.25,0)} Z"/>'

def diamond(rin, rout, hw):
    mx = (rin + rout) / 2
    return f'<path d="M {P(rin,0)} L {P(mx,-hw)} L {P(rout,0)} L {P(mx,hw)} Z"/>'

def mandala_recipe(rings):
    g = ['<g stroke="#111" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">']
    g.append('<circle r="384"/><circle r="374"/>')
    for r in rings:
        t = r[0]
        if t == "petal":   g.append(ring_of(petal(r[1], r[2], r[3], r[4], r[5]), r[6], r[7] if len(r) > 7 else 0))
        elif t == "star":  g.append(ring_of(star_petal(r[1], r[2], r[3]), r[4], r[5] if len(r) > 5 else 0))
        elif t == "diam":  g.append(ring_of(diamond(r[1], r[2], r[3]), r[4], r[5] if len(r) > 5 else 0))
        elif t == "scal":  g.append(scallop(r[1], r[2], r[3]))
        elif t == "dots":  g.append(dots(r[1], r[2], r[3]))
        elif t == "flow":  # ring of daisies
            for k in range(r[3]):
                a = math.radians(360 / r[3] * k)
                g.append(flower(r[1] * math.cos(a), r[1] * math.sin(a), r[2], r[4] if len(r) > 4 else 8, 7))
        elif t == "circ":  g.append(f'<circle r="{r[1]}"/>')
        elif t == "bloom": g.append(flower(0, 0, r[1], r[2], r[3]))
    g.append('<circle r="3"/></g>')
    return ("".join(g), "-410 -410 820 820", None)

MANDALAS = {
    "mandala-coloring-page": ("Mandala",
        [("petal",322,372,15,True,False,30),("dots",315,4.5,36),("scal",300,16,24),
         ("petal",232,300,20,True,True,18),("dots",214,6,18),("scal",196,-12,24),
         ("petal",120,196,24,True,True,16),("dots",104,7,16),("circ",28),
         ("petal",30,96,16,False,True,12),("bloom",26,12,7)]),
    "rosette-mandala-coloring-page": ("Rosette Mandala",
        [("scal",372,-14,40),("dots",352,5,40),("petal",250,344,22,True,True,20),
         ("dots",232,6,20),("diam",196,232,16,24),("petal",118,196,26,True,True,18),
         ("scal",104,10,24),("petal",34,100,17,False,True,14),("circ",28),("bloom",26,10,8)]),
    "geometric-mandala-coloring-page": ("Geometric Mandala",
        [("diam",320,374,20,24),("dots",305,5,24),("star",228,304,30,12),("scal",212,-12,36),
         ("diam",150,210,18,12),("star",78,146,26,12),("dots",64,6,12),("circ",30),("star",8,26,7,10)]),
    "lace-mandala-coloring-page": ("Lace Mandala",
        [("scal",372,-10,48),("dots",356,4,48),("scal",330,12,36),("petal",240,320,18,True,True,24),
         ("dots",224,5,24),("scal",208,-10,36),("petal",120,200,22,True,True,18),("scal",104,10,30),
         ("petal",34,98,15,False,True,14),("circ",26),("bloom",24,12,8)]),
    "sunburst-mandala-coloring-page": ("Sunburst Mandala",
        [("star",300,374,30,36),("dots",286,5,36),("petal",200,282,24,True,True,18),("dots",184,6,18),
         ("star",120,180,26,18),("scal",104,10,24),("petal",34,100,17,False,True,12),("circ",26),("bloom",24,12,10)]),
    "kaleidoscope-mandala-coloring-page": ("Kaleidoscope Mandala",
        [("diam",330,374,18,30),("dots",315,4,30),("petal",240,315,20,True,True,20),("diam",210,240,14,20),
         ("star",130,206,28,20),("dots",114,6,20),("petal",34,110,18,False,True,14),("circ",28),("bloom",26,12,10)]),
}

# ============ COLORING: florals ============
def flower_bouquet():
    g = ['<g stroke="#111" stroke-width="2.3" fill="none" stroke-linecap="round" stroke-linejoin="round">']
    # jar
    g.append('<path d="M -150 120 Q -170 120 -168 160 L -150 320 Q -145 350 -110 350 L 110 350 Q 145 350 150 320 L 168 160 Q 170 120 150 120 Z"/>')
    g.append('<path d="M -150 120 L -160 90 Q -160 70 -140 70 L 140 70 Q 160 70 160 90 L 150 120"/>')
    g.append('<path d="M -140 200 H 140" stroke-opacity="0.5"/>')
    # stems + blooms
    for x, h, fr in [(-90,-40,42),(0,-120,54),(90,-30,40),(-40,-80,36),(45,-90,38)]:
        g.append(f'<path d="M {x} 120 C {x+10} {40} {x-8} {h+60} {x} {h}"/>')
        g.append(flower(x, h, fr, 8, fr*0.28))
    for x, h in [(-120,10),(120,4)]:
        g.append(f'<path d="M {x*0.6} 130 C {x*0.7} 60 {x} 40 {x} {h}"/>')
        # leaf
        g.append(f'<g transform="translate({x} {h}) rotate({-30 if x<0 else 30})"><path d="M0 0 C 16 -18 44 -16 60 0 C 44 16 16 18 0 0 Z"/></g>')
    g.append('</g>')
    return ("".join(g), "-410 -410 820 820", None)

def rose():
    g = ['<g stroke="#111" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round">']
    # spiral rose center
    g.append('<circle r="18"/>')
    for i, r in enumerate([40, 72, 108, 148, 192, 238, 286, 336]):
        n = 5 + i
        for k in range(n):
            a = math.radians(360 / n * k + i * 18)
            hw = r * 0.5
            g.append(f'<g transform="rotate({math.degrees(a)}) translate({r*0.62} 0)"><path d="M 0 {-hw} Q {r*0.5} {-hw*1.4} {r*0.7} 0 Q {r*0.5} {hw*1.4} 0 {hw} Q {-r*0.12} 0 0 {-hw} Z"/></g>')
    # a couple leaves
    for s in (-1, 1):
        g.append(f'<g transform="translate({s*300} 300) rotate({s*40})"><path d="M0 0 C 30 -40 90 -36 130 0 C 90 36 30 40 0 0 Z"/><path d="M10 0 H 118"/></g>')
    g.append('</g>')
    return ("".join(g), "-410 -410 820 820", None)

def daisy_wreath():
    g = ['<g stroke="#111" stroke-width="2.3" fill="none" stroke-linecap="round" stroke-linejoin="round">']
    R = 250
    for k in range(14):
        a = math.radians(360 / 14 * k)
        g.append(flower(R * math.cos(a), R * math.sin(a), 46, 10, 12))
    # leaves between
    for k in range(14):
        a = math.radians(360 / 14 * (k + 0.5))
        x, y = (R + 6) * math.cos(a), (R + 6) * math.sin(a)
        g.append(f'<g transform="translate({x:.1f} {y:.1f}) rotate({math.degrees(a)+90:.1f})"><path d="M0 0 C 12 -20 40 -18 54 0 C 40 18 12 20 0 0 Z"/></g>')
    g.append('</g>')
    return ("".join(g), "-410 -410 820 820", None)

# ============ COLORING: patterns ============
def hearts_pattern():
    g = ['<g stroke="#111" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round">']
    def heart(cx, cy, s):
        return f'<path d="M {cx} {cy+s*0.9} C {cx-s*1.3} {cy-s*0.3} {cx-s*0.6} {cy-s*1.1} {cx} {cy-s*0.4} C {cx+s*0.6} {cy-s*1.1} {cx+s*1.3} {cy-s*0.3} {cx} {cy+s*0.9} Z"/>'
    for r in range(-3, 4):
        for c in range(-3, 4):
            x = c * 108 + (54 if r % 2 else 0)
            y = r * 100
            if x*x + y*y < 360*360:
                g.append(heart(x, y, 34))
    g.append('<circle r="384" fill="none"/></g>')
    return ("".join(g), "-410 -410 820 820", None)

def geometric_tessellation():
    g = ['<g stroke="#111" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">']
    R = 44
    for r in range(-6, 7):
        for c in range(-6, 7):
            cx = c * R * 1.5
            cy = r * R * 1.732 + (R * 0.866 if c % 2 else 0)
            if cx*cx + cy*cy < 372*372:
                pts = [f"{cx+R*math.cos(math.radians(60*k)):.1f} {cy+R*math.sin(math.radians(60*k)):.1f}" for k in range(6)]
                g.append(f'<path d="M {pts[0]} ' + " ".join("L " + p for p in pts[1:]) + ' Z"/>')
    g.append('<circle r="384"/></g>')
    return ("".join(g), "-410 -410 820 820", None)

def star_pattern():
    g = ['<g stroke="#111" stroke-width="2.3" fill="none" stroke-linecap="round" stroke-linejoin="round">']
    def star(cx, cy, r):
        pts = []
        for i in range(10):
            rr = r if i % 2 == 0 else r * 0.42
            a = math.radians(i * 36 - 90)
            pts.append(f"{cx+rr*math.cos(a):.1f} {cy+rr*math.sin(a):.1f}")
        return f'<path d="M {pts[0]} ' + " ".join("L " + p for p in pts[1:]) + ' Z"/>'
    for r in range(-3, 4):
        for c in range(-3, 4):
            x = c * 108 + (54 if r % 2 else 0); y = r * 104
            if x*x + y*y < 356*356:
                g.append(star(x, y, 40))
    g.append('<circle r="384"/></g>')
    return ("".join(g), "-410 -410 820 820", None)

# ============ COLORING: simple animals ============
def ladybug():
    g = ['<g stroke="#111" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round">']
    g.append('<ellipse cx="0" cy="20" rx="230" ry="250"/>')
    g.append('<path d="M 0 -228 A 230 250 0 0 0 0 268" />')  # center split
    g.append('<path d="M 0 -232 C -70 -260 -150 -250 -170 -200 C -120 -180 -60 -190 0 -212 C 60 -190 120 -180 170 -200 C 150 -250 70 -260 0 -232 Z"/>')  # head
    g.append('<circle cx="-70" cy="-220" r="10"/><circle cx="70" cy="-220" r="10"/>')
    for cx, cy, r in [(-120,-60,34),(120,-60,34),(-140,90,30),(140,90,30),(-90,200,26),(90,200,26)]:
        g.append(f'<circle cx="{cx}" cy="{cy}" r="{r}"/>')
    for s in (-1, 1):
        for dy in (-40, 40, 120):
            g.append(f'<path d="M {s*230} {20+dy} q {s*70} {10} {s*90} {40}"/>')
    g.append('</g>')
    return ("".join(g), "-300 -300 600 600", "6in")

def bee():
    g = ['<g stroke="#111" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round">']
    g.append('<ellipse cx="0" cy="40" rx="150" ry="200"/>')
    for y in (-70, 0, 70, 140):
        g.append(f'<path d="M {-150*math.cos(math.asin(min(1,abs(y-40)/200))):.0f} {y} A 150 200 0 0 0 {150*math.cos(math.asin(min(1,abs(y-40)/200))):.0f} {y}" />' if abs(y-40) < 200 else '')
    g.append('<circle cx="0" cy="-190" r="60"/>')
    g.append('<circle cx="-22" cy="-200" r="8"/><circle cx="22" cy="-200" r="8"/>')
    g.append('<path d="M -20 -240 C -40 -280 -60 -300 -80 -300" /><path d="M 20 -240 C 40 -280 60 -300 80 -300"/>')
    g.append('<circle cx="-80" cy="-300" r="8"/><circle cx="80" cy="-300" r="8"/>')
    g.append('<ellipse cx="-150" cy="-40" rx="110" ry="70" transform="rotate(-30 -150 -40)"/>')
    g.append('<ellipse cx="150" cy="-40" rx="110" ry="70" transform="rotate(30 150 -40)"/>')
    g.append('</g>')
    return ("".join(g), "-300 -330 600 660", None)

# ============ WALL ART: quote engine ============
FONTS_Q = ""  # templates already load fonts

def quote(slug, small, big_html, tag, desc, script_word=None, bg="#FBF8F2", accent="#7A9E7E", motif="sprig"):
    motif_svg = {
        "sprig": '<svg width="1.5in" height="0.7in" viewBox="0 0 120 60" fill="none" stroke="%s" stroke-width="1.6" stroke-linecap="round"><path d="M10 30 H110"/><path d="M35 30 C40 16 55 12 62 10 M35 30 C40 44 55 48 62 50"/><path d="M60 30 C66 18 80 15 86 13 M60 30 C66 42 80 45 86 47"/><circle cx="110" cy="30" r="3" fill="#C4826E" stroke="none"/></svg>' % accent,
        "sun": '<svg width="1.1in" height="1.1in" viewBox="-40 -40 80 80"><circle r="16" fill="none" stroke="%s" stroke-width="2"/>%s</svg>' % (accent, "".join('<path d="M %.0f %.0f L %.0f %.0f" stroke="%s" stroke-width="2" stroke-linecap="round"/>' % (24*math.cos(math.radians(a)),24*math.sin(math.radians(a)),34*math.cos(math.radians(a)),34*math.sin(math.radians(a)),accent) for a in range(0,360,30))),
        "heart": '<svg width="0.9in" height="0.8in" viewBox="-30 -26 60 56" fill="none" stroke="#C4826E" stroke-width="2.2" stroke-linecap="round"><path d="M0 24 C -34 -6 -16 -28 0 -8 C 16 -28 34 -6 0 24 Z"/></svg>',
        "none": "",
    }[motif]
    inner = f'''<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:1in">
      <div style="margin-bottom:0.3in">{motif_svg}</div>
      {f'<div class="cormo" style="font-style:italic;font-size:22pt;color:{accent};margin-bottom:8px">{small}</div>' if small else ''}
      <div style="font-family:'Playfair Display',serif;font-weight:700;font-size:{56 if len(str(big_html))<26 else 44}pt;line-height:1.0;letter-spacing:0.5px;color:#2D2D2D">{big_html}</div>
      {f'<div class="script" style="font-size:44pt;color:#C4826E;margin-top:6px">{script_word}</div>' if script_word else ''}
      {f'<div class="cormo" style="margin-top:0.28in;font-size:12pt;letter-spacing:6px;text-transform:uppercase;color:#8A7A6A">{tag}</div>' if tag else ''}
    </div>'''
    html, _ = wallart_page(slug, desc, inner, bg=bg)
    open(f"{OUT}/{slug}.html", "w").write(html)
    open(f"{OUT}/{slug}.meta.json", "w").write(json.dumps({"description": desc, "orientation": "portrait"}))
    CATALOG.append((slug, "printable-wall-art", None, desc, "wallart"))

QUOTES = [
    ("home-sweet-home-wall-art", "", "Home<br>Sweet<br>Home", "", "A classic Home Sweet Home printable wall art in elegant serif type, timeless entryway decor to frame.", None, "#FBF8F2", "#7A9E7E", "sprig"),
    ("gather-quote-wall-art", "come let us", "Gather", "Together", "A warm Gather printable wall art, understated serif decor for the dining room or entryway.", None, "#FBF3EC", "#B87A5E", "sprig"),
    ("grateful-wall-art", "always", "Grateful", "Thankful · Blessed", "A simple Grateful printable wall art, cozy serif decor to print and frame.", None, "#FBF8F2", "#7A9E7E", "sprig"),
    ("hello-sunshine-wall-art", "", "Hello<br>Sunshine", "", "A cheerful Hello Sunshine printable wall art with a hand-drawn sun, bright decor for a kitchen or nursery.", None, "#FCF7EC", "#C9A24E", "sun"),
    ("good-vibes-only-wall-art", "", "Good<br>Vibes<br>Only", "", "A breezy Good Vibes Only printable wall art, modern decor for a bedroom or dorm.", None, "#FBF8F2", "#7A9E7E", "none"),
    ("but-first-coffee-wall-art", "", "But First,", "coffee", "A playful But First Coffee printable wall art for the kitchen, serif and script pairing to frame.", "coffee", "#F6EEE4", "#8A6A55", "none"),
    ("wash-brush-floss-wall-art", "", "Wash<br>Brush<br>Floss", "Bathroom", "A tidy Wash Brush Floss printable wall art set for the bathroom, clean serif decor to frame.", None, "#FBF8F2", "#6B8FAE", "none"),
    ("you-are-so-loved-wall-art", "little one, you are", "So Loved", "", "A tender You Are So Loved printable wall art for the nursery, soft serif and script decor to frame.", "so loved", "#FBF6F2", "#C4826E", "heart"),
    ("you-can-do-hard-things-wall-art", "remember, you", "Can Do<br>Hard Things", "", "A motivating You Can Do Hard Things printable wall art for an office or study, bold serif decor.", None, "#FBF8F2", "#5B34E0", "none"),
    ("make-it-happen-wall-art", "", "Make It<br>Happen", "Office", "A punchy Make It Happen printable wall art for the desk, modern serif decor to frame.", None, "#FBF8F2", "#5B34E0", "none"),
    ("this-is-us-wall-art", "", "This Is Us", "Our Home", "A warm This Is Us printable wall art for the living room gallery wall, serif decor to frame.", None, "#FBF8F2", "#7A9E7E", "sprig"),
    ("rise-and-shine-wall-art", "", "Rise &<br>Shine", "", "A sunny Rise and Shine printable wall art for the bedroom, serif and a hand-drawn sun to frame.", None, "#FCF7EC", "#C9A24E", "sun"),
    ("let-love-grow-wall-art", "", "Let Love<br>Grow", "", "A sweet Let Love Grow printable wall art with a botanical accent, decor for a bedroom or nursery.", None, "#FBF8F2", "#7A9E7E", "sprig"),
    ("adventure-awaits-wall-art", "", "Adventure<br>Awaits", "Explore", "An inspiring Adventure Awaits printable wall art for a kid's room or office, serif decor to frame.", None, "#F6F2EA", "#7A9E7E", "none"),
    ("be-still-wall-art", "", "Be Still", "& Know", "A calming Be Still printable wall art, minimalist serif decor for a bedroom or reading nook.", None, "#FBF8F2", "#8B7BA0", "sprig"),
]

# ============ WALL ART: illustrated variants ============
def boho_rainbow():
    arcs = ""
    cols = ["#C4826E", "#B87A5E", "#C9A24E", "#7A9E7E", "#8B7BA0"]
    for i, c in enumerate(cols):
        r = 60 + i * 34
        arcs += f'<path d="M {-r} 40 A {r} {r} 0 0 1 {r} 40" fill="none" stroke="{c}" stroke-width="16" stroke-linecap="round"/>'
    art = f'<svg width="5in" height="4.6in" viewBox="-230 -230 460 300"><g>{arcs}</g><path d="M -60 40 v 40 M 60 40 v 40" stroke="#8A6A55" stroke-width="6" stroke-linecap="round"/></svg>'
    inner = f'''<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">{art}
      <div class="script" style="font-size:48pt;color:#B04A2E;margin-top:0.2in">be a rainbow</div>
      <div class="cormo" style="font-size:11pt;letter-spacing:6px;text-transform:uppercase;color:#8A7A6A;margin-top:6px">in someone's cloud</div></div>'''
    html, desc = wallart_page("boho-rainbow-wall-art", "A boho rainbow printable wall art in earthy tones, cheerful decor for a nursery or kid's room.", inner, bg="#FBF3EC")
    return ("boho-rainbow-wall-art", html, desc)

def boho_arch():
    art = f'''<svg width="5in" height="7in" viewBox="-230 -360 460 760">
      <path d="M -180 380 L -180 -140 A 180 180 0 0 1 180 -140 L 180 380 Z" fill="#F2DDD5" stroke="none"/>
      <path d="M -120 380 L -120 -80 A 120 120 0 0 1 120 -80 L 120 380 Z" fill="#E9C9BC" stroke="none"/>
      <path d="M -60 380 L -60 -20 A 60 60 0 0 1 60 -20 L 60 380 Z" fill="#DCB3A2" stroke="none"/>
    </svg>'''
    inner = f'<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">{art}</div>'
    html, desc = wallart_page("boho-arch-wall-art", "A boho nested-arch printable wall art in warm terracotta tones, minimalist modern decor to frame.", inner, bg="#FBF3EC", framed=False)
    return ("boho-arch-wall-art", html, desc)

def mid_century_2():
    art = f'''<svg width="5.4in" height="6.8in" viewBox="0 0 340 430">
      <rect width="340" height="430" fill="#F2ECE0"/>
      <path d="M 0 300 Q 170 200 340 300 L 340 430 L 0 430 Z" fill="#7A9E7E"/>
      <circle cx="250" cy="110" r="60" fill="#C4826E"/>
      <path d="M 40 110 a 46 46 0 1 1 0 0.1 Z" fill="none" stroke="#2D2D2D" stroke-width="3"/>
      <circle cx="86" cy="110" r="46" fill="#C9A24E"/>
      <path d="M 60 250 q 40 -60 80 0 t 80 0" fill="none" stroke="#2D2D2D" stroke-width="3"/>
    </svg>'''
    inner = f'<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">{art}</div>'
    html, desc = wallart_page("mid-century-sun-wall-art", "A mid-century modern sun and hills printable wall art in the house palette, framable retro art.", inner, bg="#F2ECE0", framed=False)
    return ("mid-century-sun-wall-art", html, desc)

def celestial_stars():
    def spark(cx, cy, r):
        return f'<path d="M {cx} {cy-r} C {cx+r*0.18} {cy-r*0.18} {cx+r*0.18} {cy-r*0.18} {cx+r} {cy} C {cx+r*0.18} {cy+r*0.18} {cx+r*0.18} {cy+r*0.18} {cx} {cy+r} C {cx-r*0.18} {cy+r*0.18} {cx-r*0.18} {cy+r*0.18} {cx-r} {cy} C {cx-r*0.18} {cy-r*0.18} {cx-r*0.18} {cy-r*0.18} {cx} {cy-r} Z" fill="#C9A24E" stroke="none"/>'
    stars = "".join(spark(x, y, s) for x, y, s in [(-120,-160,20),(130,-130,14),(-160,20,12),(150,60,18),(-90,150,10),(90,180,16),(0,-60,26)])
    moon = '<path d="M 40 0 A 60 60 0 1 1 -12 -56 A 46 46 0 1 0 40 0 Z" fill="#C9A24E" stroke="none"/>'
    art = f'<svg width="5in" height="6in" viewBox="-230 -240 460 460"><g transform="translate(130 -170)">{moon}</g>{stars}</svg>'
    inner = f'''<div style="position:absolute;inset:0;background:#241B3A"></div>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#F3EEFB">{art}
      <div style="font-family:'Playfair Display',serif;font-weight:700;font-size:34pt;margin-top:0.1in">Shoot for the Moon</div>
      <div class="cormo" style="font-size:12pt;letter-spacing:6px;text-transform:uppercase;color:#B7A8E0;margin-top:8px">Stardust &amp; Dreams</div></div>'''
    html, desc = wallart_page("celestial-moon-wall-art", "A celestial moon and stars printable wall art on deep night-violet, dreamy decor for a bedroom.", inner, bg="#241B3A")
    return ("celestial-moon-wall-art", html, desc)

# ============ build everything ============
def emit_coloring(slug, title, art, desc):
    open(f"{OUT}/{slug}.html", "w").write(coloring_page(title, "Barrio Vibe · Free Coloring Page", art))
    open(f"{OUT}/{slug}.meta.json", "w").write(json.dumps({"description": desc, "orientation": "portrait"}))
    CATALOG.append((slug, "coloring-pages", title, desc, "coloring"))

def main():
    os.makedirs(OUT, exist_ok=True)
    # mandalas
    for slug, (title, rings) in MANDALAS.items():
        emit_coloring(slug, title, mandala_recipe(rings), f"An intricate original {title.lower()} coloring page for adults and older kids, clean line art to print and color.")
    # florals
    emit_coloring("floral-mandala-coloring-page", "Floral Mandala", floral_mandala(), "A calming floral mandala coloring page of layered daisies and petals, original line art to color.")
    emit_coloring("flower-bouquet-coloring-page", "Flower Bouquet", flower_bouquet(), "A cheerful flower-bouquet-in-a-jar coloring page, an easy, satisfying page for all ages to color.")
    emit_coloring("rose-coloring-page", "Rose", rose_detailed(), "A detailed layered rose coloring page with cupped petals and leaves, an intricate floral to color.")
    emit_coloring("peony-coloring-page", "Peony", peony(), "A lush layered peony coloring page of petals radiating from the center, a highly detailed floral to color.")
    emit_coloring("daisy-wreath-coloring-page", "Daisy Wreath", daisy_wreath(), "A pretty daisy-wreath coloring page, a wreath of simple flowers and leaves to color.")
    # patterns
    emit_coloring("hearts-pattern-coloring-page", "Hearts Pattern", hearts_pattern(), "A repeating hearts pattern coloring page, a relaxing all-over design to color in.")
    emit_coloring("geometric-pattern-coloring-page", "Geometric Pattern", geometric_tessellation(), "A geometric honeycomb pattern coloring page, a modern tessellation to color.")
    emit_coloring("star-pattern-coloring-page", "Star Pattern", star_pattern(), "A repeating star pattern coloring page, a fun all-over design for kids and adults to color.")
    # animals (detailed / zentangle)
    emit_coloring("butterfly-coloring-page", "Butterfly", butterfly_detailed(), "A detailed butterfly coloring page with patterned wings, eyespots, and a segmented body, an intricate symmetrical page to color.")
    emit_coloring("owl-coloring-page", "Owl", owl(), "A zentangle-style owl coloring page with feather rows, patterned wings, and big eyes, a detailed animal page to color.")

    # wall art: illustrated (proven from proof_phase2)
    for fn in (botanical_branch, abstract_lineart, boho_sunmoon, midcentury):
        html, desc = fn()
        slug = {"botanical_branch": "botanical-branch-wall-art", "abstract_lineart": "mountains-line-art-wall-art",
                "boho_sunmoon": "boho-sun-moon-wall-art", "midcentury": "mid-century-shapes-wall-art"}[fn.__name__]
        open(f"{OUT}/{slug}.html", "w").write(html)
        open(f"{OUT}/{slug}.meta.json", "w").write(json.dumps({"description": desc, "orientation": "portrait"}))
        CATALOG.append((slug, "printable-wall-art", None, desc, "wallart"))
    # wall art: more illustrated variants
    for maker in (boho_rainbow, boho_arch, mid_century_2, celestial_stars):
        slug, html, desc = maker()
        open(f"{OUT}/{slug}.html", "w").write(html)
        open(f"{OUT}/{slug}.meta.json", "w").write(json.dumps({"description": desc, "orientation": "portrait"}))
        CATALOG.append((slug, "printable-wall-art", None, desc, "wallart"))
    # wall art: quotes
    for q in QUOTES:
        quote(*q)

    print(json.dumps(CATALOG))
    n_c = len([c for c in CATALOG if c[1] == "coloring-pages"])
    n_w = len([c for c in CATALOG if c[1] == "printable-wall-art"])
    print(f"\nLIBRARY: {len(CATALOG)} pieces = {n_c} coloring + {n_w} wall art", file=sys.stderr)

if __name__ == "__main__":
    main()
