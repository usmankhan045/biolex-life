#!/usr/bin/env python3
"""Generate original, colorable SVG line-art (mandalas, snowflakes, wreaths).
Pure geometry -> clean black strokes, no fill = ready to color. No AI, no IP."""
import math, sys, json

def P(x, y): return f"{x:.2f},{y:.2f}"

def petal(rin, rout, hw, vein=True, inner=True):
    """A teardrop petal along +x axis (tip outward), stroke-only."""
    mx = (rin + rout) / 2
    d = (f"M {P(rin,-hw)} Q {P(mx,-hw*1.7)} {P(rout,0)} "
         f"Q {P(mx,hw*1.7)} {P(rin,hw)} "
         f"Q {P(rin+ (rout-rin)*0.12, 0)} {P(rin,-hw)} Z")
    parts = [f'<path d="{d}"/>']
    if vein:
        parts.append(f'<path d="M {P(rin+4,0)} L {P(rout-6,0)}"/>')
    if inner:
        im, iw = mx, hw*0.5
        parts.append(f'<path d="M {P(rin+8,-iw)} Q {P(im,-iw*1.6)} {P(rout-10,0)} '
                     f'Q {P(im,iw*1.6)} {P(rin+8,iw)} Z"/>')
    return "".join(parts)

def scallop(radius, bump, count):
    """A lacy ring of arcs (scallops) at `radius`, `count` bumps."""
    step = 360/count; segs=[]
    for k in range(count):
        a0 = math.radians(k*step); a1 = math.radians((k+1)*step)
        x0,y0 = radius*math.cos(a0), radius*math.sin(a0)
        x1,y1 = radius*math.cos(a1), radius*math.sin(a1)
        am = math.radians((k+0.5)*step); rr = radius+bump
        cx,cy = rr*math.cos(am), rr*math.sin(am)
        segs.append(f'<path d="M {P(x0,y0)} Q {P(cx,cy)} {P(x1,y1)}"/>')
    return "".join(segs)

def ring_of(motif_svg, count, phase=0):
    step = 360/count; out=[]
    for k in range(count):
        out.append(f'<g transform="rotate({k*step+phase})">{motif_svg}</g>')
    return "".join(out)

def dots(radius, r, count):
    step=360/count; out=[]
    for k in range(count):
        a=math.radians(k*step)
        out.append(f'<circle cx="{radius*math.cos(a):.2f}" cy="{radius*math.sin(a):.2f}" r="{r}"/>')
    return "".join(out)

def mandala():
    g=['<g stroke="#111" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">']
    g.append('<circle cx="0" cy="0" r="384"/>')
    g.append('<circle cx="0" cy="0" r="376"/>')
    g.append(ring_of(petal(322,372,15,vein=True,inner=False), 30))
    g.append(dots(315,4.5,36))
    g.append(scallop(300,16,24))
    g.append(ring_of(petal(232,300,20,vein=True,inner=True), 18))
    g.append(dots(214,6,18))
    g.append(scallop(196,-12,24))
    g.append(ring_of(petal(120,196,24,vein=True,inner=True), 16))
    g.append(dots(104,7,16))
    g.append(ring_of(petal(30,96,16,vein=False,inner=True), 12))
    g.append('<circle cx="0" cy="0" r="28"/>')
    g.append(ring_of(petal(12,27,7,vein=False,inner=False), 12))
    g.append('<circle cx="0" cy="0" r="9"/>')
    g.append('<circle cx="0" cy="0" r="3"/>')
    g.append('</g>')
    return "".join(g)

def snowflake():
    """6-fold snowflake, straight arms with branches — colorable line art."""
    g=['<g stroke="#111" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round">']
    arm=[]
    L=370
    arm.append(f'<path d="M 0 0 L {L} 0"/>')                       # spine
    for t,bl,ba in [(0.30,70,38),(0.50,95,42),(0.70,80,36),(0.86,52,30)]:
        bx=L*t
        rad=math.radians(ba)
        for s in (1,-1):
            ex=bx+bl*math.cos(rad); ey=s*bl*math.sin(rad)
            arm.append(f'<path d="M {P(bx,0)} L {P(ex,ey)}"/>')
            # little fork at branch tip
            fx=ex+14*math.cos(rad); fy=ey+ s*14*math.sin(rad)
            arm.append(f'<path d="M {P(ex,ey)} L {P(fx,fy)}"/>')
        arm.append(f'<circle cx="{bx:.1f}" cy="0" r="4"/>')
    # tip diamond
    arm.append(f'<path d="M {P(L-30,0)} L {P(L-15,14)} L {P(L,0)} L {P(L-15,-14)} Z"/>')
    one="".join(arm)
    g.append(ring_of(one,6))
    # hex center
    hp=[]
    for k in range(6):
        a=math.radians(60*k); hp.append(P(34*math.cos(a),34*math.sin(a)))
    g.append(f'<path d="M {hp[0]} '+ " ".join("L "+p for p in hp[1:]) +' Z"/>')
    g.append(ring_of(petal(0,30,10,vein=False,inner=False),6,phase=30))
    g.append('<circle cx="0" cy="0" r="6"/>')
    g.append('</g>')
    return "".join(g)

STYLES={"mandala":mandala,"snowflake":snowflake}

def svg(style):
    body=STYLES[style]()
    return (f'<svg viewBox="-410 -410 820 820" xmlns="http://www.w3.org/2000/svg" '
            f'width="820" height="820">{body}</svg>')

if __name__=="__main__":
    style=sys.argv[1] if len(sys.argv)>1 else "mandala"
    out=sys.argv[2] if len(sys.argv)>2 else f"/tmp/{style}.svg"
    open(out,"w").write(svg(style))
    print("wrote",out)
