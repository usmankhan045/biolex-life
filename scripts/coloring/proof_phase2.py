#!/usr/bin/env python3
"""Phase 2/3 art proofs: new coloring + wall-art styles. Pure vector, original."""
import math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from gen_art import petal, scallop, ring_of, dots, P

OUT="public/printables"

# ---------- new motifs ----------
def flower(cx, cy, pet_r, n, hole=6, stroke="#111"):
    g=[f'<g transform="translate({cx} {cy})">']
    step=360/n
    for k in range(n):
        g.append(f'<g transform="rotate({k*step})"><path d="M {P(hole,0)} '
                 f'Q {P(hole+pet_r*0.5,-pet_r*0.5)} {P(hole+pet_r,0)} '
                 f'Q {P(hole+pet_r*0.5,pet_r*0.5)} {P(hole,0)} Z"/></g>')
    g.append(f'<circle cx="0" cy="0" r="{hole}"/></g>')
    return "".join(g)

def floral_mandala():
    g=['<g stroke="#111" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">']
    g.append('<circle r="384"/><circle r="374"/>')
    # outer ring of daisies
    step=360/12
    for k in range(12):
        a=math.radians(k*step)
        g.append(flower(330*math.cos(a),330*math.sin(a),34,8,7))
    g.append(scallop(286,16,24))
    g.append(ring_of(petal(196,280,30,vein=True,inner=True),18))
    g.append(dots(180,7,18))
    # mid ring of small flowers
    for k in range(9):
        a=math.radians(360/9*k)
        g.append(flower(150*math.cos(a),150*math.sin(a),30,6,7))
    g.append('<circle r="70"/>')
    g.append(flower(0,0,58,10,16))  # center bloom
    g.append('</g>')
    return g_wrap(g)

def butterfly():
    g=['<g stroke="#111" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round">']
    # right wings (mirrored for left)
    def wing_side(sx):
        w=[f'<g transform="scale({sx} 1)">']
        # upper wing
        w.append('<path d="M 14 -20 C 60 -150 220 -180 250 -70 C 260 -20 200 20 120 26 C 60 30 20 20 14 -20 Z"/>')
        # lower wing
        w.append('<path d="M 16 30 C 90 40 180 60 180 140 C 180 200 110 220 70 180 C 40 150 20 90 16 30 Z"/>')
        # inner deco: circles + teardrops
        w.append('<circle cx="150" cy="-90" r="26"/><circle cx="150" cy="-90" r="12"/>')
        w.append('<circle cx="90" cy="-40" r="14"/>')
        w.append('<path d="M 210 -60 C 232 -40 232 -10 208 0"/>')
        w.append('<circle cx="95" cy="120" r="18"/><circle cx="95" cy="120" r="8"/>')
        w.append('<path d="M 60 70 C 100 80 120 110 110 150"/>')
        w.append('</g>')
        return "".join(w)
    g.append(wing_side(1)); g.append(wing_side(-1))
    # body
    g.append('<ellipse cx="0" cy="10" rx="12" ry="70"/>')
    g.append('<circle cx="0" cy="-70" r="14"/>')
    g.append('<path d="M -6 -82 C -30 -120 -44 -150 -70 -165"/><circle cx="-70" cy="-165" r="6"/>')
    g.append('<path d="M 6 -82 C 30 -120 44 -150 70 -165"/><circle cx="70" cy="-165" r="6"/>')
    g.append('<path d="M 0 -40 L 0 70"/>')
    g.append('</g>')
    return g_wrap(g, vb="-410 -230 820 470", h="4.6in")

def g_wrap(g, vb="-410 -410 820 820", h=None):
    return ("".join(g), vb, h)

# ---------- wall-art vector art ----------
def botanical_branch():
    # 3 elegant stems with leaves (line art) in deep sage
    def stem(cx, cy, ln, curve, scale, n):
        s=[f'<g transform="translate({cx} {cy}) scale({scale})" stroke="#5C7A60" stroke-width="2.2" fill="none" stroke-linecap="round">']
        s.append(f'<path d="M 0 0 C {curve} {-ln*0.4} {-curve} {-ln*0.75} 0 {-ln}"/>')
        for i in range(n):
            t=(i+1)/(n+1); y=-ln*t
            xoff=curve*math.sin(t*math.pi)*(1-t)
            side=1 if i%2 else -1
            s.append(f'<g transform="translate({xoff} {y}) rotate({side*30})">'
                     f'<path d="M0 0 C {P(20,-15)} {P(50,-13)} {P(64,0)} C {P(50,13)} {P(20,15)} 0 0 Z"/>'
                     f'<path d="M6 0 L 56 0"/></g>')
        s.append('</g>')
        return "".join(s)
    art=f'<svg width="4.2in" height="6.4in" viewBox="-150 -430 300 470">{stem(0,10,410,60,1,9)}{stem(-46,10,300,44,0.8,7)}{stem(46,6,330,-50,0.85,7)}</svg>'
    return wallart_page("botanical", "Simple line-art botanical branches, an elegant minimalist print to frame.", inner=f'''
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
        {art}
        <div class="cormo" style="margin-top:0.1in;font-size:11pt;letter-spacing:7px;text-transform:uppercase;color:#8A7A6A">Botanical</div>
      </div>''')

def abstract_lineart():
    # minimalist mountain landscape line art with a soft sun
    art=f'''<svg width="5.4in" height="6in" viewBox="-230 -210 460 420">
      <circle cx="86" cy="-118" r="46" fill="#E8B7A0" stroke="none"/>
      <path d="M -226 150 L -96 -66 L -18 34 L 58 -44 L 150 60 L 226 150 Z" fill="none" stroke="#2D2D2D" stroke-width="3" stroke-linejoin="round"/>
      <path d="M -226 168 L -70 18 L 34 120 L 120 40 L 226 160" fill="none" stroke="#7A9E7E" stroke-width="3" stroke-linejoin="round"/>
      <path d="M -196 180 H 196" stroke="#2D2D2D" stroke-width="2"/>
      <path d="M -150 -120 q 9 -8 18 0 q 9 -8 18 0" fill="none" stroke="#2D2D2D" stroke-width="2"/>
      <path d="M -108 -100 q 7 -6 14 0 q 7 -6 14 0" fill="none" stroke="#2D2D2D" stroke-width="2"/>
    </svg>'''
    return wallart_page("mountains", "A minimalist mountain landscape line-art print, calm modern wall decor to frame.", inner=f'''
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
        {art}
        <div class="cormo" style="margin-top:0.15in;font-size:12pt;letter-spacing:6px;text-transform:uppercase;color:#8A7A6A">The Mountains Are Calling</div>
      </div>''', bg="#FBF8F2")

def boho_sunmoon():
    rays=""
    for k in range(24):
        a=math.radians(360/24*k); r0,r1=44,(78 if k%2==0 else 62)
        rays+=f'<path d="M {P(r0*math.cos(a),r0*math.sin(a))} L {P(r1*math.cos(a),r1*math.sin(a))}" stroke="#B87A5E" stroke-width="2.4"/>'
    # moon phases row: crescent, half, full, half, crescent (clean + symmetric)
    phases=""
    xs=[-150,-75,0,75,150]
    R=22
    for i,x in enumerate(xs):
        phases+=f'<circle cx="{x}" cy="150" r="{R}" fill="none" stroke="#7A9E7E" stroke-width="2.4"/>'
        top=f'{x} {150-R}'; bot=f'{x} {150+R}'
        if i==2:
            phases+=f'<circle cx="{x}" cy="150" r="{R}" fill="#7A9E7E" stroke="none"/>'
        elif i==1:
            phases+=f'<path d="M {top} A {R} {R} 0 0 1 {bot} Z" fill="#7A9E7E" stroke="none"/>'
        elif i==3:
            phases+=f'<path d="M {top} A {R} {R} 0 0 0 {bot} Z" fill="#7A9E7E" stroke="none"/>'
        elif i==0:
            phases+=f'<path d="M {top} A {R} {R} 0 0 1 {bot} A {R*0.55} {R} 0 0 0 {top} Z" fill="#7A9E7E" stroke="none"/>'
        elif i==4:
            phases+=f'<path d="M {top} A {R} {R} 0 0 0 {bot} A {R*0.55} {R} 0 0 1 {top} Z" fill="#7A9E7E" stroke="none"/>'
    art=f'''<svg width="5in" height="6.4in" viewBox="-230 -260 460 520">
      <circle cx="0" cy="-90" r="42" fill="#F2DDD5" stroke="#B87A5E" stroke-width="2.4"/>{rays}
      {phases}
    </svg>'''
    return wallart_page("boho", "A boho sun and moon-phase print in warm earthy tones, statement decor to frame.", inner=f'''
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
        {art}
        <div class="script" style="font-size:40pt;color:#B04A2E;margin-top:-0.1in">to the moon</div>
      </div>''', bg="#FBF3EC")

def midcentury():
    art=f'''<svg width="5.4in" height="6.8in" viewBox="0 0 340 430">
      <rect x="0" y="0" width="340" height="430" fill="#FBF7EE"/>
      <circle cx="120" cy="120" r="82" fill="#7A9E7E"/>
      <path d="M 150 300 A 100 100 0 0 1 350 300 Z" fill="#C4826E"/>
      <path d="M 40 250 C 40 200 120 200 120 260 C 120 330 30 340 40 250 Z" fill="#8B7BA0"/>
      <circle cx="255" cy="90" r="40" fill="none" stroke="#2D2D2D" stroke-width="3"/>
      <path d="M 20 360 H 200" stroke="#2D2D2D" stroke-width="3"/>
      <circle cx="250" cy="200" r="14" fill="#C9A24E"/>
    </svg>'''
    return wallart_page("shapes", "A mid-century modern abstract shapes print in the house palette, framable art.", inner=f'''
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">{art}</div>''', bg="#FBF7EE", framed=False)

# ---------- templates ----------
FONTS='''<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Cormorant+Garamond:ital@0;1&family=Pinyon+Script&display=swap" rel="stylesheet">'''

def coloring_page(title, eyebrow, art):
    body, vb, h = art
    hh = h or "6.8in"
    return f'''<!doctype html><html><head><meta charset="utf-8">{FONTS}
<style>@page{{size:letter portrait;margin:0}}*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:'Cormorant Garamond',serif;color:#2D2D2D;background:#fff;-webkit-print-color-adjust:exact}}
.page{{width:8.5in;height:11in;position:relative;padding:0.5in;overflow:hidden}}
.frame{{position:absolute;inset:0.34in;border:1.5px solid #cfd8cf;border-radius:14px}}
.frame2{{position:absolute;inset:0.40in;border:1px solid #e5e0d6;border-radius:11px}}
.head{{text-align:center;position:relative;z-index:2;margin-top:0.05in}}
.eyebrow{{font-family:'Cormorant Garamond',serif;font-size:11pt;letter-spacing:3px;text-transform:uppercase;color:#7A9E7E;font-weight:600}}
h1{{font-family:'Playfair Display',serif;font-size:26pt;font-weight:700;margin:4px 0 2px}}
.sub{{font-style:italic;font-size:11pt;color:#8A7A6A}}
.art{{display:flex;align-items:center;justify-content:center;margin-top:0.12in}}
.art svg{{width:6.8in;height:{hh}}}
.foot{{position:absolute;bottom:0.5in;left:0.5in;right:0.5in;display:flex;justify-content:space-between;font-size:9pt;z-index:2}}
.foot .l{{font-style:italic;color:#B0A090}}.foot .r{{font-weight:700;color:#7A9E7E}}</style></head><body>
<div class="page"><div class="frame"></div><div class="frame2"></div>
<div class="head"><div class="eyebrow">{eyebrow}</div><h1>{title}</h1><div class="sub">Color it your way, pencils, markers, or paint</div></div>
<div class="art"><svg viewBox="{vb}" xmlns="http://www.w3.org/2000/svg">{body}</svg></div>
<div class="foot"><span class="l">Free printable, print as many as you like</span><span class="r">barriovibe.com</span></div>
</div></body></html>'''

def wallart_page(tag, desc, inner, bg="#FBF8F2", framed=True):
    frame='<div style="position:absolute;inset:0.6in;border:1.4px solid #7A9E7E;border-radius:2px"></div>' if framed else ''
    html=f'''<!doctype html><html><head><meta charset="utf-8">{FONTS}
<style>@page{{size:letter portrait;margin:0}}*{{box-sizing:border-box;margin:0;padding:0}}body{{-webkit-print-color-adjust:exact}}
.page{{width:8.5in;height:11in;position:relative;overflow:hidden;background:{bg}}}
.script{{font-family:'Pinyon Script',cursive}}.cormo{{font-family:'Cormorant Garamond',serif}}
.foot{{position:absolute;bottom:0.28in;left:0;right:0;text-align:center;font-family:'Cormorant Garamond',serif;font-size:9pt;letter-spacing:3px;text-transform:uppercase;color:#B0A090}}
</style></head><body><div class="page">{frame}{inner}<div class="foot">Barrio Vibe · Free Printable</div></div></body></html>'''
    return (html, desc)

# ---------- emit ----------
COLORING={"floral-mandala-coloring-page":("Floral Mandala","Barrio Vibe · Free Coloring Page",floral_mandala()),
          "butterfly-coloring-page":("Butterfly","Barrio Vibe · Free Coloring Page",butterfly())}
WALLART={"botanical-branch-wall-art":botanical_branch(),"abstract-line-art-wall-art":abstract_lineart(),
         "boho-sun-moon-wall-art":boho_sunmoon(),"mid-century-abstract-wall-art":midcentury()}

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for slug, (title, eb, art) in COLORING.items():
        open(f"{OUT}/{slug}.html", "w").write(coloring_page(title, eb, art))
    for slug, (html, desc) in WALLART.items():
        open(f"{OUT}/{slug}.html", "w").write(html)
    print("wrote", len(COLORING) + len(WALLART), "proofs")
