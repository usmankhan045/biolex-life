#!/usr/bin/env python3
"""Elevated printable wall art, original decorative SVG (wreaths, line trees,
boho arches, celestial motifs) + layered typography. No AI. Overwrites the 6
wall-art HTML files + meta so the existing pipeline re-renders them."""
import math, json, os
OUT="public/printables"

def P(x,y): return f"{x:.2f} {y:.2f}"

# ---------- motifs ----------
def leaf(length, width):
 return (f'<path d="M0 0 Q {P(length*0.5,-width)} {P(length,0)} '
 f'Q {P(length*0.5,width)} 0 0 Z"/><path d="M {P(length*0.14,0)} L {P(length*0.82,0)}"/>')

def wreath(R, count=26, leaf_len=None, berry="#C4826E", stroke="#5C7A60"):
 leaf_len = leaf_len or R*0.42
 g=[f'<g fill="none" stroke="{stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">']
 step=360/count
 for k in range(count):
 a=k*step
 # two leaves per node, tangential, alternating slight tilt
 g.append(f'<g transform="rotate({a}) translate({R} 0) rotate(100)"><g transform="scale({0.9 if k%2 else 1})">{leaf(leaf_len,leaf_len*0.34)}</g></g>')
 g.append(f'<g transform="rotate({a}) translate({R} 0) rotate(-140)"><g transform="scale(0.7)">{leaf(leaf_len,leaf_len*0.32)}</g></g>')
 g.append('</g>')
 # berry clusters
 b=[f'<g fill="{berry}" stroke="none">']
 for k in range(0,count,6):
 a=math.radians(k*step+step*0.5)
 for dx,dy,r in [(0,0,5.5),(11,6,4),(-9,7,3.6)]:
 bx=(R+2)*math.cos(a); by=(R+2)*math.sin(a)
 b.append(f'<circle cx="{bx+dx:.1f}" cy="{by+dy:.1f}" r="{r}"/>')
 b.append('</g>')
 return "".join(g)+"".join(b)

def line_tree(h, tiers=5, stroke="#5C7A60"):
 g=[f'<g fill="none" stroke="{stroke}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">']
 top=-h/2
 for i in range(tiers):
 t=i/(tiers-1)
 y=top + h*0.16 + t*h*0.78
 w=18 + t*t*130
 yy=y - (h*0.78/tiers)*0.65
 g.append(f'<path d="M 0 {yy:.1f} L {-w:.1f} {y:.1f} Q 0 {y-8:.1f} {w:.1f} {y:.1f} Z"/>')
 g.append(f'<path d="M 0 {top+h*0.86:.1f} L 0 {top+h*0.98:.1f}"/>') # trunk
 g.append('</g>')
 # star topper
 g.append(f'<g transform="translate(0 {top:.1f})">{star(15,"#5B34E0")}</g>')
 return "".join(g)

def star(r, fill):
 pts=[]
 for i in range(8):
 rr=r if i%2==0 else r*0.4
 a=math.radians(i*45-90)
 pts.append(f"{rr*math.cos(a):.1f} {rr*math.sin(a):.1f}")
 return f'<path d="M {pts[0]} '+ " ".join("L "+p for p in pts[1:]) +' Z" fill="{}" stroke="none"/>'.format(fill)

def sparkle(cx,cy,r,fill):
 return (f'<path d="M {cx} {cy-r} C {cx+r*0.18} {cy-r*0.18} {cx+r*0.18} {cy-r*0.18} {cx+r} {cy} '
 f'C {cx+r*0.18} {cy+r*0.18} {cx+r*0.18} {cy+r*0.18} {cx} {cy+r} '
 f'C {cx-r*0.18} {cy+r*0.18} {cx-r*0.18} {cy+r*0.18} {cx-r} {cy} '
 f'C {cx-r*0.18} {cy-r*0.18} {cx-r*0.18} {cy-r*0.18} {cx} {cy-r} Z" fill="{fill}" stroke="none"/>')

def snowflake(cx,cy,r,stroke):
 g=[f'<g transform="translate({cx} {cy})" fill="none" stroke="{stroke}" stroke-width="1.5" stroke-linecap="round">']
 for k in range(6):
 a=k*60
 g.append(f'<g transform="rotate({a})"><path d="M 0 0 L 0 {-r}"/><path d="M 0 {-r*0.55} L {r*0.28} {-r*0.78} M 0 {-r*0.55} L {-r*0.28} {-r*0.78}"/></g>')
 g.append('</g>')
 return "".join(g)

def sunburst(r0,r1,count,stroke):
 g=[f'<g fill="none" stroke="{stroke}" stroke-width="2" stroke-linecap="round">']
 for k in range(count):
 a=math.radians(360/count*k)
 rr1 = r1 if k%2==0 else r0+(r1-r0)*0.6
 g.append(f'<path d="M {r0*math.cos(a):.1f} {r0*math.sin(a):.1f} L {rr1*math.cos(a):.1f} {rr1*math.sin(a):.1f}"/>')
 g.append('</g>')
 return "".join(g)

FONTS='''<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;0,900;1,500;1,700&family=Cormorant+Garamond:ital,wght@0,500;1,500&family=Pinyon+Script&display=swap" rel="stylesheet">'''

def page(inner, bg="#FBF8F2"):
 return f'''<!doctype html><html><head><meta charset="utf-8">{FONTS}
<style>@page{{size:letter portrait;margin:0}}*{{box-sizing:border-box;margin:0;padding:0}}
body{{-webkit-print-color-adjust:exact}}
.page{{width:8.5in;height:11in;position:relative;overflow:hidden;background:{bg};
 display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}}
svg{{display:block}}
.script{{font-family:'Pinyon Script',cursive}}
.serif{{font-family:'Playfair Display',serif}}
.cormo{{font-family:'Cormorant Garamond',serif}}
.foot{{position:absolute;bottom:0.28in;left:0;right:0;text-align:center;font-family:'Cormorant Garamond',serif;
 font-size:9pt;letter-spacing:3px;text-transform:uppercase;color:#B0A090}}
</style></head><body><div class="page">{inner}</div></body></html>'''

# ---------- 6 elevated designs ----------
def joy():
 art=f'<svg width="5in" height="5in" viewBox="-230 -230 460 460">{wreath(155,26)}</svg>'
 inner=f'''<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
 <div class="cormo" style="font-style:italic;font-size:21pt;color:#7A9E7E;letter-spacing:2px;margin-bottom:0.14in">let there be</div>
 <div style="position:relative;width:5in;height:5in">
 <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">{art}</div>
 <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><span class="serif" style="font-weight:900;font-size:90pt;color:#2D2D2D;line-height:1">Joy</span></div>
 </div>
 <div class="cormo" style="margin-top:0.14in;font-size:13pt;letter-spacing:6px;text-transform:uppercase;color:#8A7A6A">Merry Christmas</div>
 </div>
 <div class="foot">Biolex · Free Printable</div>'''
 return page(inner)

def merry():
 tree=f'<svg width="3.2in" height="4.6in" viewBox="-170 -235 340 470">{line_tree(430,6)}</svg>'
 inner=f'''<div style="display:flex;flex-direction:column;align-items:center;gap:0.18in">
 {tree}
 <div style="display:flex;flex-direction:column;align-items:center;line-height:0.98">
 <span class="serif" style="font-weight:900;font-size:52pt;color:#2D2D2D">Merry</span>
 <span class="script" style="font-size:64pt;color:#C4826E;margin:-6px 0 -8px">&amp; Bright</span>
 </div>
 <div class="cormo" style="font-size:11pt;letter-spacing:6px;text-transform:uppercase;color:#7A9E7E">Season's Greetings</div>
 </div><div class="foot">Biolex · Free Printable</div>'''
 return page(inner)

def snow():
 flakes="".join([snowflake(x,y,s,"#8FB0D4") for x,y,s in
 [(-260,-330,34),(210,-300,26),(-180,-150,20),(280,-120,30),(-300,60,24),
 (250,120,22),(-230,300,30),(190,320,34),(-90,-360,18),(120,-380,22)]])
 inner=f'''<svg style="position:absolute;inset:0" width="8.5in" height="11in" viewBox="-408 -528 816 1056"><rect x="-380" y="-500" width="760" height="1000" rx="6" fill="none" stroke="#8FB0D4" stroke-width="1.5"/>{flakes}</svg>
 <div style="position:relative;display:flex;flex-direction:column;align-items:center;gap:2px">
 <span class="cormo" style="font-style:italic;font-size:22pt;color:#6B8FAE">oh, the weather outside</span>
 <span class="serif" style="font-weight:700;font-size:70pt;color:#2D3A46;line-height:0.95">Let It<br>Snow</span>
 <span class="cormo" style="margin-top:8px;font-size:12pt;letter-spacing:6px;text-transform:uppercase;color:#8AA6C0">Let It Snow, Let It Snow</span>
 </div><div class="foot" style="color:#8AA6C0">Biolex · Free Printable</div>'''
 return page(inner, bg="#FAFBFC")

def gather():
 arch=f'''<svg width="5.4in" height="8.4in" viewBox="-300 -450 600 940">
 <path d="M -262 470 L -262 -170 A 262 262 0 0 1 262 -170 L 262 470 Z" fill="#F3DFD6" stroke="#B87A5E" stroke-width="3.5"/>
 <g transform="translate(0 -186)" opacity="0.92">{sunburst(0,120,20,"#B87A5E")}</g>
 <circle cx="0" cy="-186" r="30" fill="#FBF3EC" stroke="#B87A5E" stroke-width="3.5"/></svg>'''
 inner=f'''<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">
 <div style="position:relative;width:5.4in;height:8.4in">
 <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">{arch}</div>
 <div style="position:absolute;left:0;right:0;bottom:1.15in;display:flex;flex-direction:column;align-items:center">
 <span class="cormo" style="font-size:13pt;letter-spacing:7px;text-transform:uppercase;color:#8A6A55">come let us</span>
 <span class="script" style="font-size:82pt;color:#B04A2E;line-height:0.85;margin-top:2px">gather</span>
 </div>
 </div>
 </div><div class="foot" style="color:#B98F76">Biolex · Free Printable</div>'''
 return page(inner, bg="#FBF3EC")

def believe():
 stars="".join([sparkle(x,y,s,"#E7C86A") for x,y,s in
 [(-150,-250,16),(160,-230,22),(-210,-90,12),(220,-40,14),(-120,120,10),(180,180,18),(-190,240,14)]])
 moon='<path d="M 40 0 A 46 46 0 1 1 -8 -44 A 36 36 0 1 0 40 0 Z" fill="#E7C86A" stroke="none"/>'
 inner=f'''<div style="position:absolute;inset:0;background:#241B3A"></div>
 <svg style="position:absolute;inset:0" width="8.5in" height="11in" viewBox="-408 -528 816 1056">
 <rect x="-372" y="-492" width="744" height="984" rx="6" fill="none" stroke="#6E5EA6" stroke-width="1.5"/>
 <g transform="translate(150 -300)">{moon}</g>{stars}
 <g transform="translate(0 300)" opacity="0.85">{sunburst(0,120,24,"#6E5EA6")}</g>
 </svg>
 <div style="position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;color:#F3EEFB">
 <span class="cormo" style="font-style:italic;font-size:22pt;color:#C9F24E">this season, simply</span>
 <span class="serif" style="font-weight:900;font-size:78pt;line-height:0.95">Believe</span>
 <span class="cormo" style="margin-top:6px;font-size:12pt;letter-spacing:7px;text-transform:uppercase;color:#B7A8E0">Hope · Wonder · Joy</span>
 </div><div class="foot" style="color:#8B7CBE">Biolex · Free Printable</div>'''
 return page(inner, bg="#241B3A")

def newchapter():
 inner=f'''<svg style="position:absolute;inset:0" width="8.5in" height="11in" viewBox="-408 -528 816 1056">
 <g transform="translate(0 -20)">{sunburst(150,340,40,"#C9A24E")}</g>
 <ellipse cx="0" cy="-20" rx="262" ry="168" fill="#FBF7EE"/>
 {''.join(sparkle(x,y,s,"#5B34E0") for x,y,s in [(-262,-372,18),(262,-344,14),(-312,250,14),(292,312,18),(-140,392,12),(150,-430,12)])}
 </svg>
 <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
 <span class="cormo" style="font-size:13pt;letter-spacing:8px;text-transform:uppercase;color:#8A7A6A">here's to a</span>
 <span class="serif" style="font-weight:900;font-size:58pt;color:#2D2D2D;line-height:0.95;margin:8px 0">New<br>Chapter</span>
 <span class="script" style="font-size:44pt;color:#C4826E">twenty · twenty-seven</span>
 </div><div class="foot">Biolex · Free Printable</div>'''
 return page(inner, bg="#FBF7EE")

DESIGNS={
 "joy-wall-art":(joy,"An original Joy Christmas printable wall art wrapped in a hand-drawn botanical wreath, elegant holiday decor to print and frame."),
 "merry-and-bright-wall-art":(merry,"A Merry & Bright Christmas printable wall art with a line-art tree and script lettering, timeless decor to print and frame."),
 "let-it-snow-wall-art":(snow,"A Let It Snow winter printable wall art framed by falling snowflakes, cozy seasonal decor to print and frame."),
 "gather-wall-art":(gather,"A boho Gather printable wall art with an arch and sun-rays in warm tones, statement decor to print and frame."),
 "believe-wall-art":(believe,"A celestial Believe Christmas printable wall art with a moon and stars on deep night-violet, magical decor to print and frame."),
 "new-chapter-wall-art":(newchapter,"A New Chapter New Year printable wall art with a golden sunburst and stars, a bold fresh-start print to frame."),
}
def main():
 for slug,(fn,desc) in DESIGNS.items():
 open(f"{OUT}/{slug}.html","w").write(fn())
 open(f"{OUT}/{slug}.meta.json","w").write(json.dumps({"description":desc,"orientation":"portrait"}))
 print("wrote",len(DESIGNS),"elevated wall-art designs")
if __name__=="__main__": main()
