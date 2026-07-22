#!/usr/bin/env python3
"""Upgrade the seasonal coloring pages: give each a DISTINCT, detailed mandala
(fixes the duplicate Halloween=Star, NewYear=Christmas designs)."""
import math, os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from gen_library import mandala_recipe
from proof_phase2 import coloring_page
from gen_art import P

def spiderweb(rings=9, spokes=16):
    g = ['<g stroke="#111" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">']
    R = 376
    for k in range(spokes):
        a = math.radians(360/spokes*k)
        g.append(f'<path d="M 0 0 L {P(R*math.cos(a),R*math.sin(a))}"/>')
    for i in range(1, rings+1):
        rr = R*i/rings
        pts = [(rr*math.cos(math.radians(360/spokes*k)), rr*math.sin(math.radians(360/spokes*k))) for k in range(spokes)]
        d = "M " + P(*pts[0])
        for k in range(1, spokes):
            am = math.radians(360/spokes*(k-0.5)); sag = rr*0.84
            d += f" Q {P(sag*math.cos(am),sag*math.sin(am))} {P(*pts[k])}"
        am = math.radians(360/spokes*(spokes-0.5)); sag = rr*0.84
        d += f" Q {P(sag*math.cos(am),sag*math.sin(am))} {P(*pts[0])} Z"
        g.append(f'<path d="{d}"/>')
    # little spider
    g.append('<circle cx="150" cy="-150" r="14"/><circle cx="150" cy="-128" r="9"/>')
    for s in (-1,1):
        for dy in (-6,4,14):
            g.append(f'<path d="M {150+s*10} {-140+dy} q {s*26} {-6} {s*40} {8}"/>')
    g.append('<circle r="6"/></g>')
    return ("".join(g), "-410 -410 820 820", None)

# distinct, detailed recipes (motif types: petal star diam scal dots flow circ bloom)
# Only star + snowflake stay geometric here (they already read as star / snowflake).
# christmas / ornament / new-year use REAL themed motifs via gen_seasonal_v2.py, and
# halloween / spiderweb use gen_halloween.py — both called at the end of this script.
# Do NOT add generic geometric recipes for those five here; they must stay themed.
R = {
 "star-mandala-coloring-page": ("Star Mandala",
    [("star",300,374,40,8),("dots",286,6,16),("petal",210,286,30,True,True,16),
     ("star",150,208,30,16),("dots",134,6,16),("petal",40,120,20,False,True,12),
     ("star",10,36,10,8),("circ",8)]),
 "snowflake-mandala-coloring-page": ("Snowflake Mandala",
    [("star",300,372,26,12),("dots",286,5,12),("diam",210,296,22,12),("star",140,208,28,6),
     ("dots",124,6,12),("diam",56,132,18,6),("star",6,50,14,6),("circ",8)]),
}
EYE = {"halloween-mandala-coloring-page":"Barrio Vibe · Halloween Coloring Page",
       "spiderweb-mandala-coloring-page":"Barrio Vibe · Halloween Coloring Page",
       "snowflake-mandala-coloring-page":"Barrio Vibe · Winter Coloring Page"}

OUT = "public/printables"
for slug, (title, rings) in R.items():
    art = mandala_recipe(rings)
    open(f"{OUT}/{slug}.html","w").write(coloring_page(title, EYE.get(slug,"Barrio Vibe · Free Coloring Page"), art))
# Themed pages: real motifs instead of generic geometry.
import gen_halloween      # jack-o'-lanterns, bats, candy corn, spider + web
import gen_seasonal_v2    # holly, ornaments, trees, fireworks, midnight clock
import gen_zentangle      # dense HERO zentangle pages (highest quality; wins last)
gen_halloween.main()
gen_seasonal_v2.main()
# gen_zentangle upgrades a subset to dense, pin-quality hero art. It runs LAST so
# its slugs override the simpler versions above. Currently: ornament, snowflake,
# halloween mandala. More slugs move here as their hero art is built.
gen_zentangle.build_real()
print("regenerated seasonal coloring pages (zentangle heroes + themed motifs)")
