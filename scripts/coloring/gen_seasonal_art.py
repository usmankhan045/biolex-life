#!/usr/bin/env python3
"""Generate the seasonal ART printables (coloring pages + typographic wall art)
as branded, print-ready HTML. Pure vector, original, no AI. Writes .html + .meta.json
into public/printables/ for the normal build-printables pipeline to render."""
import math, os, json, sys
sys.path.insert(0, os.path.dirname(__file__))
from gen_art import petal, scallop, ring_of, dots, P

OUT = "public/printables"

# ---------- extra motifs ----------
def star_petal(rin, rout, hw):
    mx=(rin+rout)/2
    d=(f"M {P(rin,-hw)} L {P(mx,-hw*0.5)} L {P(rout,0)} L {P(mx,hw*0.5)} L {P(rin,hw)} "
       f"L {P(rin+(rout-rin)*0.25,0)} Z")
    return f'<path d="{d}"/>'

def diamond(rin, rout, hw):
    mx=(rin+rout)/2
    return f'<path d="M {P(rin,0)} L {P(mx,-hw)} L {P(rout,0)} L {P(mx,hw)} Z"/>'

def mandala_variant(rings):
    g=['<g stroke="#111" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">']
    g.append('<circle cx="0" cy="0" r="384"/><circle cx="0" cy="0" r="376"/>')
    for r in rings:
        t=r[0]
        if t=="petal": g.append(ring_of(petal(r[1],r[2],r[3],vein=r[4],inner=r[5]), r[6], r[7] if len(r)>7 else 0))
        elif t=="star": g.append(ring_of(star_petal(r[1],r[2],r[3]), r[4], r[5] if len(r)>5 else 0))
        elif t=="diamond": g.append(ring_of(diamond(r[1],r[2],r[3]), r[4], r[5] if len(r)>5 else 0))
        elif t=="scallop": g.append(scallop(r[1],r[2],r[3]))
        elif t=="dots": g.append(dots(r[1],r[2],r[3]))
        elif t=="circle": g.append(f'<circle cx="0" cy="0" r="{r[1]}"/>')
    g.append('<circle cx="0" cy="0" r="3"/></g>')
    return "".join(g)

def spiderweb(rings=7, spokes=12):
    g=['<g stroke="#111" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">']
    R=376
    for k in range(spokes):
        a=math.radians(360/spokes*k)
        g.append(f'<path d="M 0 0 L {P(R*math.cos(a),R*math.sin(a))}"/>')
    for i in range(1,rings+1):
        rr=R*i/rings
        pts=[]
        for k in range(spokes):
            a=math.radians(360/spokes*k); pts.append((rr*math.cos(a),rr*math.sin(a)))
        d="M "+P(*pts[0])
        for k in range(1,spokes):
            a0=math.radians(360/spokes*(k-1)); am=math.radians(360/spokes*(k-0.5))
            sag=rr*0.86
            d+=f" Q {P(sag*math.cos(am),sag*math.sin(am))} {P(*pts[k])}"
        am=math.radians(360/spokes*(spokes-0.5)); sag=rr*0.86
        d+=f" Q {P(sag*math.cos(am),sag*math.sin(am))} {P(*pts[0])} Z"
        g.append(f'<path d="{d}"/>')
    g.append('<circle cx="0" cy="0" r="6"/></g>')
    return "".join(g)

# distinct mandala recipes
V_CLASSIC=[("petal",322,372,15,True,False,30),("dots",315,4.5,36),("scallop",300,16,24),
  ("petal",232,300,20,True,True,18),("dots",214,6,18),("scallop",196,-12,24),
  ("petal",120,196,24,True,True,16),("dots",104,7,16),("circle",28),
  ("petal",30,96,16,False,True,12),("petal",12,27,7,False,False,12),("circle",9)]
V_STAR=[("star",318,374,26,24),("dots",305,5,24),("scallop",292,14,32),
  ("star",210,290,34,16),("dots",196,6,16),("petal",120,192,22,True,True,16),
  ("star",70,116,20,12),("circle",30),("petal",14,30,8,False,False,12),("circle",8)]
V_ORNAMENT=[("scallop",372,-14,40),("dots",352,5,40),("petal",250,344,22,True,True,20),
  ("dots",232,6,20),("diamond",196,232,16,24),("petal",118,196,26,True,True,18),
  ("scallop",104,10,24),("petal",34,100,17,False,True,14),("circle",28),
  ("star",8,26,7,10),("circle",8)]
V_SNOW=[("diamond",320,374,20,24),("dots",305,5,24),("star",228,304,30,12),
  ("scallop",212,-12,36),("diamond",150,210,18,12),("star",78,146,26,12),
  ("dots",64,6,12),("circle",30),("petal",12,28,7,False,False,6),("circle",8)]

# ---------- templates ----------
def coloring_html(title, eyebrow, art_svg):
    return f'''<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Lato:wght@400;700&display=swap" rel="stylesheet">
<style>@page{{size:letter portrait;margin:0}}*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:'Lato',sans-serif;color:#2D2D2D;background:#fff;-webkit-print-color-adjust:exact}}
.page{{width:8.5in;height:11in;position:relative;padding:0.5in;overflow:hidden}}
.frame{{position:absolute;inset:0.34in;border:1.5px solid #cfd8cf;border-radius:14px}}
.frame2{{position:absolute;inset:0.40in;border:1px solid #e5e0d6;border-radius:11px}}
.head{{text-align:center;position:relative;z-index:2;margin-top:0.05in}}
.eyebrow{{font-size:8pt;letter-spacing:3px;text-transform:uppercase;color:#7A9E7E;font-weight:700}}
h1{{font-family:'Playfair Display',serif;font-size:26pt;font-weight:700;margin:5px 0 2px}}
.sub{{font-family:'Playfair Display',serif;font-style:italic;font-size:9.5pt;color:#8A7A6A}}
.art{{display:flex;align-items:center;justify-content:center;margin-top:0.12in}}
.art svg{{width:6.8in;height:6.8in}}
.foot{{position:absolute;bottom:0.5in;left:0.5in;right:0.5in;display:flex;justify-content:space-between;align-items:center;font-size:7.5pt;z-index:2}}
.foot .l{{font-style:italic;color:#B0A090}}.foot .r{{font-weight:700;color:#7A9E7E}}</style></head><body>
<div class="page"><div class="frame"></div><div class="frame2"></div>
<div class="head"><div class="eyebrow">{eyebrow}</div><h1>{title}</h1><div class="sub">Color it your way — pencils, markers, or paint</div></div>
<div class="art"><svg viewBox="-410 -410 820 820" xmlns="http://www.w3.org/2000/svg">{art_svg}</svg></div>
<div class="foot"><span class="l">Free printable — print as many as you like</span><span class="r">paperposy.com</span></div>
</div></body></html>'''

SPRIG='''<svg class="sprig" viewBox="0 0 120 60" fill="none" stroke="#7A9E7E" stroke-width="1.6" stroke-linecap="round">
<path d="M10 30 H110"/><path d="M30 30 C34 18 46 14 52 12 M30 30 C34 42 46 46 52 48"/>
<path d="M50 30 C54 18 66 14 72 12 M50 30 C54 42 66 46 72 48"/><path d="M70 30 C74 20 84 17 90 15 M70 30 C74 40 84 43 90 45"/>
<circle cx="110" cy="30" r="3" fill="#C4826E" stroke="none"/></svg>'''

def wallart_html(small, big_html, tag, bg="#FBF8F2", frame="#7A9E7E"):
    return f'''<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Cormorant+Garamond:ital,wght@0,500;1,500&display=swap" rel="stylesheet">
<style>@page{{size:letter portrait;margin:0}}*{{box-sizing:border-box;margin:0;padding:0}}
body{{-webkit-print-color-adjust:exact}}
.page{{width:8.5in;height:11in;position:relative;padding:0.9in;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:{bg}}}
.frame{{position:absolute;inset:0.6in;border:1.4px solid {frame};border-radius:2px}}
.sprig{{width:1.5in;margin:0 auto 0.35in;opacity:0.85}}
.small{{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:22pt;color:{frame};margin-bottom:6px}}
.big{{font-family:'Playfair Display',serif;font-weight:700;font-size:60pt;line-height:0.98;color:#2D2D2D;letter-spacing:1px}}
.amp{{font-style:italic;font-weight:400;color:#C4826E}}
.rule{{width:1.4in;height:1px;background:#C4B5A5;margin:0.3in auto}}
.tag{{font-family:'Cormorant Garamond',serif;font-size:12pt;letter-spacing:5px;text-transform:uppercase;color:#8A7A6A}}</style></head><body>
<div class="page"><div class="frame"></div>{SPRIG}
<div class="small">{small}</div><div class="big">{big_html}</div><div class="rule"></div><div class="tag">{tag}</div></div></body></html>'''

# ---------- catalogue ----------
COLORING=[
 ("christmas-mandala-coloring-page","Christmas Mandala","Paper Posy · Free Coloring Page",mandala_variant(V_CLASSIC),"A calming original Christmas mandala coloring page with layered petal and scallop rings. Print on letter paper and color it your way."),
 ("christmas-ornament-mandala-coloring-page","Ornament Mandala","Paper Posy · Christmas Coloring Page",mandala_variant(V_ORNAMENT),"An intricate ornament-style Christmas mandala coloring page for adults, with delicate scalloped and diamond detail."),
 ("snowflake-mandala-coloring-page","Snowflake Mandala","Paper Posy · Winter Coloring Page",mandala_variant(V_SNOW),"A crisp snowflake mandala coloring page built from stars and diamonds — a wintry design to color in."),
 ("star-mandala-coloring-page","Star Mandala","Paper Posy · Free Coloring Page",mandala_variant(V_STAR),"A bold star-burst mandala coloring page with pointed petals — festive for Christmas or a New Year."),
 ("halloween-mandala-coloring-page","Halloween Mandala","Paper Posy · Halloween Coloring Page",mandala_variant(V_STAR),"A spooky-season Halloween mandala coloring page with sharp star petals — original line art to color."),
 ("spiderweb-mandala-coloring-page","Spiderweb","Paper Posy · Halloween Coloring Page",spiderweb(7,12),"A symmetrical spiderweb coloring page for Halloween — concentric webs and radial spokes to color in."),
 ("new-year-mandala-coloring-page","New Year Mandala","Paper Posy · Free Coloring Page",mandala_variant(V_CLASSIC),"A fresh-start New Year mandala coloring page — a mindful way to welcome the new year."),
]
WALLART=[
 ("merry-and-bright-wall-art","have yourself a",'Merry <span class="amp">&amp;</span><br>Bright',"Christmas","Elegant Merry & Bright Christmas printable wall art in classic serif type — print, frame, and hang."),
 ("joy-wall-art","let there be",'Joy',"Christmas","Minimalist Joy Christmas printable wall art with a hand-drawn sprig — timeless holiday decor to print and frame."),
 ("let-it-snow-wall-art","oh the weather outside",'Let It<br>Snow',"Winter","A cozy Let It Snow printable wall art in serif type — simple winter decor you can print and frame at home."),
 ("gather-wall-art","come let us",'Gather',"Together","A warm Gather printable wall art — understated serif decor for the holiday table or entryway."),
 ("believe-wall-art","this season, simply",'Believe',"Christmas","A quiet Believe Christmas printable wall art in elegant type — minimalist holiday decor to print and frame."),
 ("new-chapter-wall-art","here's to a",'New<br>Chapter',"New Year","A fresh New Chapter printable wall art for the new year — clean serif decor to print, frame, and start fresh."),
]

def main():
    os.makedirs(OUT, exist_ok=True)
    made=[]
    for slug,title,eyebrow,art,desc in COLORING:
        open(f"{OUT}/{slug}.html","w").write(coloring_html(title,eyebrow,art))
        open(f"{OUT}/{slug}.meta.json","w").write(json.dumps({"description":desc,"orientation":"portrait"}))
        made.append((slug,"coloring-pages"))
    for slug,small,big,tag,desc in WALLART:
        open(f"{OUT}/{slug}.html","w").write(wallart_html(small,big,tag))
        open(f"{OUT}/{slug}.meta.json","w").write(json.dumps({"description":desc,"orientation":"portrait"}))
        made.append((slug,"printable-wall-art"))
    print(json.dumps(made))

if __name__=="__main__": main()
