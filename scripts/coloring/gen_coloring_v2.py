#!/usr/bin/env python3
"""Upgraded, intricate coloring pages: detailed rose/peony, zentangle owl, and a
detailed butterfly, following the popular 'highly detailed adult coloring' style."""
import math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from proof_phase2 import coloring_page
from gen_art import petal, ring_of, dots

def bloom(layers, center_r=30, seeds=10):
    """Clean, non-overlapping layered flower from concentric petal rings."""
    g=['<g stroke="#111" stroke-width="2.3" fill="none" stroke-linecap="round" stroke-linejoin="round">']
    for i,(rin,rout,n,hw,vein,inner) in enumerate(layers):
        phase=(360/n)/2 if i%2 else 0
        g.append(ring_of(petal(rin,rout,hw,vein=vein,inner=inner), n, phase=phase))
    g.append(f'<circle r="{center_r}"/>')
    g.append(dots(center_r*0.58, 4, seeds))
    g.append('<circle r="6"/>')
    g.append('</g>')
    return ("".join(g), "-410 -410 820 820", None)

def rose_detailed():
    # rounded, cupped petals in tight concentric rings = a full rose bloom
    body, vb, h = bloom([
        (18,64,6,24,False,False),(52,124,8,26,True,False),(112,196,10,26,True,True),
        (184,278,12,24,True,True),(264,356,14,20,True,True),
    ], center_r=20, seeds=6)
    # add outer leaves
    leaves=""
    for s in (-1,1):
        leaves+=(f'<g transform="translate({s*252} 262) rotate({s*46})" stroke="#111" stroke-width="2.3" fill="none" stroke-linecap="round" stroke-linejoin="round">'
                 f'<path d="M0 0 C 30 -46 104 -42 156 0 C 104 42 30 46 0 0 Z"/><path d="M14 0 H 142"/>'
                 + "".join(f'<path d="M {30+j*26} 0 l 16 {-12 if s>0 else 12}"/>' for j in range(4)) + '</g>')
    return (body[:-4] + leaves + "</g>", vb, h)

def peony():
    return bloom([
        (0,70,8,26,False,False),(56,142,10,28,True,True),(122,220,12,28,True,True),
        (200,300,14,24,True,True),(282,372,16,20,True,True),
    ], center_r=30, seeds=12)

def owl():
    g=['<g stroke="#111" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round">']
    g.append('<path d="M 0 -298 C -128 -298 -212 -206 -212 -86 C -212 66 -150 262 0 282 C 150 262 212 66 212 -86 C 212 -206 128 -298 0 -298 Z"/>')
    g.append('<path d="M -150 -250 L -196 -334 L -104 -280"/><path d="M 150 -250 L 196 -334 L 104 -280"/>')
    g.append('<path d="M 0 -256 C -150 -256 -178 -52 -84 -22 C -30 -4 30 -4 84 -22 C 178 -52 150 -256 0 -256 Z"/>')
    for ex in (-74,74):
        for r in (56,40,22): g.append(f'<circle cx="{ex}" cy="-150" r="{r}"/>')
        g.append(f'<circle cx="{ex}" cy="-150" r="8" fill="#111"/>')
        for la in range(-2,3): g.append(f'<path d="M {ex+la*18} -208 l {la*3} -16"/>')
    g.append('<path d="M 0 -118 L -24 -92 L 0 -64 L 24 -92 Z"/><path d="M 0 -64 L 0 -34"/>')
    for s in (-1,1):
        g.append(f'<path d="M {s*180} -104 C {s*236} 6 {s*212} 150 {s*118} 208 C {s*150} 104 {s*152} 4 {s*162} -86 Z"/>')
        for fy in (-40,14,66,118,166): g.append(f'<path d="M {s*172} {fy} q {s*44} 10 {s*58} 42"/>')
    for row,y in enumerate([-6,34,74,114,154,194,232]):
        n=6 if row%2 else 5
        span=200 if row%2 else 170
        for k in range(n):
            x=-span/2 + (k*span/(n-1) if n>1 else 0)
            g.append(f'<path d="M {x-22} {y} a 22 17 0 0 0 44 0"/>')
    g.append('<path d="M -52 280 v 26 M -70 306 h 36 M 52 280 v 26 M 34 306 h 36"/>')
    g.append('</g>')
    return ("".join(g), "-300 -360 600 704", "6.7in")

def butterfly_detailed():
    g=['<g stroke="#111" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">']
    def wing(sx):
        w=[f'<g transform="scale({sx} 1)">']
        # upper wing scalloped
        w.append('<path d="M 14 -24 C 66 -168 250 -196 282 -66 C 292 -6 224 30 128 34 C 62 38 20 22 14 -24 Z"/>')
        # scallop the outer edge
        w.append('<path d="M 128 34 q 30 -20 40 -50 q 30 -12 44 -34 q 34 -6 50 -30"/>')
        # inner cells + eyespots
        w.append('<circle cx="176" cy="-104" r="34"/><circle cx="176" cy="-104" r="18"/><circle cx="176" cy="-104" r="6"/>')
        w.append('<circle cx="96" cy="-52" r="18"/><circle cx="96" cy="-52" r="8"/>')
        w.append('<path d="M 232 -68 C 258 -42 256 -8 226 6"/>')
        w.append('<path d="M 60 -6 q 40 -8 78 -50" stroke-opacity="0.9"/>')
        for i in range(5): w.append(f'<circle cx="{60+i*18}" cy="{-4-i*2}" r="4"/>')
        # lower wing
        w.append('<path d="M 16 34 C 96 46 196 66 196 152 C 196 214 118 232 74 190 C 42 160 20 96 16 34 Z"/>')
        w.append('<path d="M 74 190 q 20 -22 26 -50 q 26 -10 34 -34"/>')
        w.append('<circle cx="100" cy="126" r="22"/><circle cx="100" cy="126" r="10"/>')
        w.append('<path d="M 58 74 q 44 8 66 54"/>')
        for i in range(4): w.append(f'<circle cx="{54+i*16}" cy="{60+i*4}" r="4"/>')
        w.append('</g>')
        return "".join(w)
    g.append(wing(1)); g.append(wing(-1))
    # body segmented
    g.append('<ellipse cx="0" cy="6" rx="15" ry="78"/>')
    for by in range(-56,80,20): g.append(f'<path d="M -14 {by} q 14 8 28 0"/>')
    g.append('<circle cx="0" cy="-78" r="16"/>')
    g.append('<path d="M -8 -92 C -30 -132 -50 -158 -78 -172"/><circle cx="-78" cy="-172" r="7"/>')
    g.append('<path d="M 8 -92 C 30 -132 50 -158 78 -172"/><circle cx="78" cy="-172" r="7"/>')
    g.append('</g>')
    return ("".join(g), "-410 -240 820 500", "4.9in")

PIECES={
 "rose-coloring-page":("Rose",rose_detailed(),"A detailed layered rose coloring page with cupped petals, leaves, and sepals, an elegant intricate page to color."),
 "peony-coloring-page":("Peony",peony(),"A lush, highly detailed peony coloring page of layered petals radiating from the center, a satisfying floral to color."),
 "owl-coloring-page":("Owl",owl(),"A zentangle-style owl coloring page with feather rows, patterned wings, and big eyes, a detailed animal page to color."),
 "butterfly-coloring-page":("Butterfly",butterfly_detailed(),"A detailed butterfly coloring page with patterned wings, eyespots, and a segmented body, an intricate symmetrical page to color."),
}
if __name__=="__main__":
    OUT="public/printables"
    for slug,(title,art,desc) in PIECES.items():
        open(f"{OUT}/{slug}.html","w").write(coloring_page(title,"Biolex · Free Coloring Page",art))
        import json; open(f"{OUT}/{slug}.meta.json","w").write(json.dumps({"description":desc,"orientation":"portrait"}))
    print("wrote",len(PIECES),"upgraded coloring pages")
