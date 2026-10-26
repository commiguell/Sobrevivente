#!/usr/bin/env python3
"""Gera os logos das 11 comunas do Liechtenstein (SVG) no estilo do logo principal."""
import base64, os, sys

FONT = sys.argv[1] if len(sys.argv) > 1 else "Cinzel.ttf"
OUT = sys.argv[2] if len(sys.argv) > 2 else "public/logos/liechtenstein"
os.makedirs(OUT, exist_ok=True)
font_b64 = base64.b64encode(open(FONT, "rb").read()).decode()

AZ, GU, OR, AR, SA, VE = "#0b4ea2", "#d21f26", "#f5c400", "#ffffff", "#141414", "#1e7b3c"
LINE = 'stroke="#3a2a05" stroke-width="2.5" stroke-linejoin="round"'

def wave(y, amp=10, n=4, x0=-10, x1=310):
    step = (x1 - x0) / (n * 2)
    d = f"M{x0},{y}"
    for i in range(n * 2):
        sgn = -1 if i % 2 == 0 else 1
        d += f" q{step/2},{sgn*amp*2} {step},0"
    return d

def wave_band(y, h, amp=10, n=4, fill=AR):
    step = 320 / (n * 2)
    back = " ".join(f"q{-step/2},{(1 if j % 2 == 0 else -1)*amp*2} {-step},0" for j in range(n * 2))
    return f'<path d="{wave(y, amp, n)} L310,{y+h} {back} Z" fill="{fill}"/>'

def ear(x, y, s=1.0, fill=OR):
    """Espiga de trigo vertical; (x,y) = base do caule."""
    g = [f'<g transform="translate({x},{y}) scale({s})">',
         f'<path d="M0,0 V-150" stroke="{fill}" stroke-width="7" stroke-linecap="round"/>',
         f'<path d="M0,0 V-150" stroke="#3a2a05" stroke-width="1.5" opacity=".5"/>']
    for i in range(6):
        yy = -70 - i * 17
        for side in (-1, 1):
            g.append(f'<ellipse cx="{side*11}" cy="{yy}" rx="9" ry="17" transform="rotate({side*28} {side*11} {yy})" fill="{fill}" {LINE}/>')
    g.append(f'<ellipse cx="0" cy="-178" rx="8" ry="18" fill="{fill}" {LINE}/>')
    g.append('</g>')
    return "".join(g)

def rose(x, y, r=34):
    p = [f'<g transform="translate({x},{y})">']
    for i in range(5):
        p.append(f'<g transform="rotate({i*72})"><path d="M0,{-r*0.15} L{-r*0.12},{-r*0.85} L0,{-r*1.08} L{r*0.12},{-r*0.85}Z" fill="{VE}"/></g>')
    for i in range(5):
        p.append(f'<g transform="rotate({i*72+36})"><circle cx="0" cy="{-r*0.55}" r="{r*0.48}" fill="{AR}" {LINE}/></g>')
    p.append(f'<circle r="{r*0.33}" fill="{OR}" {LINE}/>')
    p.append('</g>')
    return "".join(p)

def star6(x, y, r):
    pts = []
    import math
    for i in range(12):
        a = math.radians(-90 + i * 30)
        rr = r if i % 2 == 0 else r * 0.55
        pts.append(f"{x+rr*math.cos(a):.1f},{y+rr*math.sin(a):.1f}")
    return f'<polygon points="{" ".join(pts)}" fill="{OR}" {LINE}/>'

def hat(x, y, s=1.0):
    """Chapéu principesco (Fürstenhut) vermelho."""
    return f'''<g transform="translate({x},{y}) scale({s})">
<path d="M-38,10 C-42,-25 -20,-48 0,-50 C20,-48 42,-25 38,10Z" fill="{GU}" stroke="{GU}" stroke-width="2"/>
<path d="M-38,10 C-36,-30 -14,-44 0,-50 M38,10 C36,-30 14,-44 0,-50 M0,-50 V10" stroke="#fff" stroke-width="4" fill="none"/>
<circle cx="0" cy="-58" r="7" fill="{GU}"/><path d="M0,-75 V-62 M-6,-70 H6" stroke="{GU}" stroke-width="4"/>
<rect x="-44" y="8" width="88" height="22" rx="4" fill="{GU}"/>
<g fill="#fff"><circle cx="-28" cy="19" r="4"/><circle cx="-9" cy="19" r="4"/><circle cx="10" cy="19" r="4"/><circle cx="29" cy="19" r="4"/></g>
</g>'''

def banner(x, y, s=1.0, fill=AR):
    """Bandeira de igreja dos Montfort (Kirchenfahne)."""
    return f'''<g transform="translate({x},{y}) scale({s})" fill="{fill}">
<rect x="-44" y="-62" width="88" height="10"/>
<circle cx="-30" cy="-68" r="7" fill="none" stroke="{fill}" stroke-width="4"/>
<circle cx="0" cy="-68" r="7" fill="none" stroke="{fill}" stroke-width="4"/>
<circle cx="30" cy="-68" r="7" fill="none" stroke="{fill}" stroke-width="4"/>
<path d="M-44,-52 H44 V10 H-44Z"/><path d="M-44,8 h24 v44 a12,10 0 0 1 -24,0Z M-12,8 h24 v44 a12,10 0 0 1 -24,0Z M20,8 h24 v44 a12,10 0 0 1 -24,0Z"/>
</g>'''

ARMS = {}

GRIFO = [
    "M78,76 C62,74 50,82 46,98 C54,90 62,92 66,98 L84,98 Z",
    "M108,72 L128,42 L122,80 Z",
    "M98,66 C114,66 124,78 122,92 C120,104 108,110 96,110 C84,108 76,98 76,88 C76,76 86,66 98,66 Z",
    "M86,100 C92,130 100,150 112,170 L150,150 C140,130 125,105 116,80 Z",
    "M140,150 C148,100 185,60 248,20 C246,44 240,58 232,68 C252,64 264,58 278,46 C272,76 256,88 240,96 "
    "C258,98 270,96 286,88 C276,116 254,126 232,130 C244,136 256,138 270,136 C252,160 228,168 196,170 Z",
    "M108,150 C130,135 165,140 185,175 C205,210 210,245 195,265 C180,280 160,272 150,250 C140,225 125,205 108,190 Z",
    "M128,158 L98,146 L86,130 L78,136 L86,148 L68,144 L68,153 L86,156 L72,165 L78,172 L98,162 L124,180 Z",
    "M132,192 L100,196 L86,184 L79,190 L88,200 L70,202 L72,211 L90,209 L80,220 L88,225 L102,212 L136,216 Z",
    "M158,248 C150,270 140,290 128,305 L106,306 L100,322 L140,321 L148,308 C164,292 178,272 184,256 Z",
    "M186,250 C198,272 204,295 206,312 L194,320 L198,334 L234,332 L226,314 C222,290 214,265 205,244 Z",
    "M196,252 C232,264 254,242 250,212 C248,196 258,184 274,186 C266,172 244,178 238,196 C234,222 222,236 196,236 Z",
    "M270,190 C280,178 288,182 290,170 C298,184 290,196 278,198 Z",
]
ARMS["balzers"] = ("Balzers", f'''
<rect width="300" height="360" fill="{AZ}"/>
<g fill="#3a2a05" stroke="#3a2a05" stroke-width="7" stroke-linejoin="round">{"".join(f'<path d="{d}"/>' for d in GRIFO)}</g>
<g fill="{OR}">{"".join(f'<path d="{d}"/>' for d in GRIFO)}</g>
<g fill="none" stroke="#8a6200" stroke-width="2.5" stroke-linecap="round">
 <path d="M162,140 C185,110 210,88 238,70 M175,150 C200,128 222,116 245,104 M188,160 C210,150 230,142 250,136"/>
 <path d="M118,182 C135,200 150,230 160,250"/>
</g>
<path d="M52,94 C46,100 40,100 36,104" stroke="{GU}" stroke-width="4" fill="none" stroke-linecap="round"/>
<circle cx="94" cy="84" r="5" fill="{SA}"/>
''')

ARMS["eschen"] = ("Eschen", f'''
<rect width="300" height="360" fill="{AZ}"/>
{wave_band(215, 48, 12, 3)}
<g fill="{AR}" stroke="#9aa7b8" stroke-width="2" stroke-linejoin="round">
 <path d="M150,130 C130,90 115,60 120,25 C140,50 160,70 175,105 Z"/>
 <path d="M175,118 C200,80 235,55 268,48 C255,85 225,112 192,130 Z"/>
 <path d="M95,128 C110,108 150,108 200,120 C230,128 250,142 262,160 C240,152 222,150 208,152 C190,165 150,168 120,158 C108,154 98,146 95,128Z"/>
 <circle cx="96" cy="124" r="17"/>
</g>
<path d="M80,122 L64,128 L80,132Z" fill="{GU}"/>
<path d="M66,128 C60,126 52,130 46,124 M66,128 C58,134 52,140 44,138" stroke="#2f8a3a" stroke-width="4" fill="none" stroke-linecap="round"/>
<circle cx="92" cy="120" r="3" fill="{SA}"/>
<path d="M145,162 L138,182 M160,163 L158,184" stroke="{GU}" stroke-width="4" stroke-linecap="round"/>
''')

ARMS["gamprin"] = ("Gamprin", f'''
<rect width="300" height="360" fill="{AZ}"/>
<path d="M-20,-10 C40,30 50,90 110,130 C170,170 200,180 240,240 C270,285 280,320 320,350" stroke="#3a2a05" stroke-width="68" fill="none"/>
<path d="M-20,-10 C40,30 50,90 110,130 C170,170 200,180 240,240 C270,285 280,320 320,350" stroke="{OR}" stroke-width="62" fill="none"/>
{rose(215, 85, 38)}
{rose(80, 245, 38)}
''')

ARMS["mauren"] = ("Mauren", f'''
<rect width="300" height="360" fill="{OR}"/>
<polygon points="0,0 300,0 0,330" fill="{SA}"/>
<g transform="translate(108,112) rotate(45)" fill="{OR}" {LINE}>
 <path d="M-14,-90 h28 v-6 a24,24 0 1 0 -28,0Z" transform="translate(0,0)"/>
 <rect x="-7" y="-92" width="14" height="150"/>
 <path d="M7,20 h28 v12 h-12 v8 h12 v14 h-28Z"/>
 <path d="M-7,20 h-28 v12 h12 v8 h-12 v14 h28Z"/>
</g>
<g transform="translate(108,112) rotate(45)"><circle cx="0" cy="-114" r="10" fill="{SA}"/></g>
''')

ARMS["planken"] = ("Planken", f'''
<rect width="300" height="360" fill="{VE}"/>
<polygon points="0,0 300,0 300,40 0,300" fill="{AR}"/>
{star6(95, 95, 52)}
''')

ARMS["ruggell"] = ("Ruggell", f'''
<rect width="300" height="360" fill="{GU}"/>
<rect y="268" width="300" height="100" fill="{AZ}"/>
{wave_band(250, 30, 10, 3)}
<g fill="none" stroke-linecap="round">
 <path d="M150,225 C150,180 110,160 70,150 C52,146 46,128 60,122" stroke="#3a2a05" stroke-width="15"/>
 <path d="M150,225 C150,180 190,160 230,150 C248,146 254,128 240,122" stroke="#3a2a05" stroke-width="15"/>
 <path d="M150,225 C150,180 110,160 70,150 C52,146 46,128 60,122" stroke="{OR}" stroke-width="10"/>
 <path d="M150,225 C150,180 190,160 230,150 C248,146 254,128 240,122" stroke="{OR}" stroke-width="10"/>
</g>
{ear(150, 235, 1.0)}
''')

ARMS["schaan"] = ("Schaan", f'''
<rect width="300" height="360" fill="{GU}"/>
<rect width="125" height="360" fill="{AZ}"/>
<rect x="125" width="45" height="360" fill="{AR}"/>
{ear(62, 290, 1.1)}
<g fill="none" stroke="{AR}" stroke-width="13">
 <path d="M170,100 q16,-14 32,0 t32,0 t32,0 t32,0"/>
 <path d="M170,150 q16,-14 32,0 t32,0 t32,0 t32,0"/>
 <path d="M170,200 q16,-14 32,0 t32,0 t32,0 t32,0"/>
</g>
''')

merlons = "".join(f'<rect x="{x}" y="160" width="36" height="40" fill="{SA}"/>' for x in range(12, 300, 72))
ARMS["schellenberg"] = ("Schellenberg", f'''
<rect width="300" height="360" fill="{OR}"/>
<rect width="300" height="62" fill="{SA}"/>
<rect y="105" width="300" height="58" fill="{SA}"/>
{merlons}
''')

def blade(y):
    return (f'<path d="M30,{y+18} C80,{y-38} 200,{y-40} 275,{y-8} C270,{y+2} 266,{y+4} 258,{y+4} '
            f'C200,{y-14} 110,{y-10} 46,{y+30} Z" fill="{AR}" stroke="#9aa7b8" stroke-width="2"/>')
ARMS["triesen"] = ("Triesen", f'''
<rect width="300" height="360" fill="{AZ}"/>
{blade(95)}{blade(175)}{blade(255)}
''')

ARMS["triesenberg"] = ("Triesenberg", f'''
<rect width="300" height="360" fill="{AZ}"/>
<path d="M-10,370 V285 C-10,255 30,240 60,262 C70,225 120,205 150,228 C180,205 230,225 240,262 C270,240 310,255 310,285 V370Z" fill="{OR}" {LINE}/>
<g fill="{OR}" {LINE}>
 <path d="M150,40 C125,40 110,62 108,100 C106,140 100,165 78,182 H222 C200,165 194,140 192,100 C190,62 175,40 150,40Z"/>
 <rect x="138" y="22" width="24" height="22" rx="6"/>
 <circle cx="150" cy="196" r="15"/>
</g>
<path d="M82,170 H218" stroke="#3a2a05" stroke-width="2" opacity=".5"/>
''')

ARMS["vaduz"] = ("Vaduz", f'''
<rect width="300" height="360" fill="{AR}"/>
<rect x="150" width="150" height="170" fill="{GU}"/>
<rect y="170" width="150" height="190" fill="{GU}"/>
{hat(75, 105, 1.05)}
{banner(225, 100, 0.95)}
{banner(75, 270, 0.95)}
{hat(225, 255, 1.05)}
''')

SHIELD = "M0,0 H300 V200 C300,290 220,330 150,360 C80,330 0,290 0,200 Z"

def crown():
    pearls = "".join(f'<circle cx="{x}" cy="{y}" r="7" fill="url(#pearl)"/>' for x, y in
                     [(-78, -10), (-60, -48), (-30, -72), (0, -80), (30, -72), (60, -48), (78, -10)])
    return f'''<g transform="translate(500,226) scale(1.12)">
<path d="M-82,0 C-90,-60 -45,-95 0,-98 C45,-95 90,-60 82,0Z" fill="#b5121b"/>
<path d="M-82,0 C-90,-60 -45,-95 0,-98 C45,-95 90,-60 82,0Z" fill="url(#velvet)"/>
<g fill="none" stroke="url(#gold)" stroke-width="12" stroke-linecap="round">
 <path d="M-78,-4 C-80,-55 -40,-82 0,-88 C40,-82 80,-55 78,-4"/>
 <path d="M-40,-4 C-44,-45 -20,-80 0,-88 C20,-80 44,-45 40,-4"/>
 <path d="M0,-4 V-88"/>
</g>
{pearls}
<circle cx="0" cy="-108" r="17" fill="url(#gold)" stroke="#5a3e08" stroke-width="2"/>
<path d="M0,-158 V-122 M-14,-144 H14" stroke="url(#gold)" stroke-width="10" stroke-linecap="round"/>
<rect x="-98" y="-8" width="196" height="42" rx="8" fill="url(#gold)" stroke="#5a3e08" stroke-width="2.5"/>
<g stroke="#5a3e08" stroke-width="1.5">
 <ellipse cx="-62" cy="13" rx="11" ry="9" fill="#1d4fb8"/><ellipse cx="62" cy="13" rx="11" ry="9" fill="#1d4fb8"/>
 <rect x="-12" y="3" width="24" height="20" rx="3" fill="#c3141e"/>
 <circle cx="-32" cy="13" r="6" fill="url(#pearl)"/><circle cx="32" cy="13" r="6" fill="url(#pearl)"/>
 <circle cx="-88" cy="13" r="5" fill="url(#pearl)"/><circle cx="88" cy="13" r="5" fill="url(#pearl)"/>
</g>
</g>'''

def scrolls():
    one = '''<g transform="translate(-28,10) scale(1.05)" fill="none" stroke-linecap="round">
<path d="M-168,-120 C-215,-110 -235,-60 -205,-30 C-185,-12 -158,-28 -170,-50 C-178,-64 -198,-55 -192,-42"/>
<path d="M-165,40 C-225,40 -248,100 -215,140 C-190,170 -148,150 -160,118 C-168,98 -195,108 -186,126"/>
</g>'''
    return (f'<g transform="translate(500,425)" stroke="#4a3205" stroke-width="22">{one}'
            f'<g transform="scale(-1,1)">{one}</g></g>'
            f'<g transform="translate(500,425)" stroke="url(#goldH)" stroke-width="14">{one}'
            f'<g transform="scale(-1,1)">{one}</g></g>')

def svg(slug, name, body):
    n = len(name)
    fs = min(100, 840 / (0.8 * n))
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
<title>{name}</title>
<defs>
<style>@font-face{{font-family:"Cinzel";font-weight:700;src:url(data:font/ttf;base64,{font_b64}) format("truetype");}}</style>
<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
 <stop offset="0" stop-color="#fff3b0"/><stop offset=".25" stop-color="#e8c25a"/><stop offset=".5" stop-color="#a87a1e"/>
 <stop offset=".72" stop-color="#f4d878"/><stop offset="1" stop-color="#8a6116"/></linearGradient>
<linearGradient id="goldH" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0" stop-color="#fff0a8"/><stop offset=".45" stop-color="#d9ac40"/><stop offset=".6" stop-color="#9c6e18"/><stop offset="1" stop-color="#f2cf6a"/></linearGradient>
<linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
 <stop offset="0" stop-color="#fff6c2"/><stop offset=".2" stop-color="#e4b94c"/><stop offset=".45" stop-color="#8c6214"/>
 <stop offset=".65" stop-color="#f6dc84"/><stop offset=".85" stop-color="#b8892a"/><stop offset="1" stop-color="#6e4c0c"/></linearGradient>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0" stop-color="#1c3f9e"/><stop offset=".47" stop-color="#2a50b5"/>
 <stop offset=".53" stop-color="#d3202c"/><stop offset="1" stop-color="#9c0f18"/></linearGradient>
<radialGradient id="shine" cx=".38" cy=".3" r=".75">
 <stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/>
 <stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient>
<radialGradient id="velvet" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#ff6b6b" stop-opacity=".55"/><stop offset="1" stop-color="#4a0006" stop-opacity=".5"/></radialGradient>
<radialGradient id="pearl" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#e8e2d0"/><stop offset="1" stop-color="#9c937a"/></radialGradient>
<linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>
<clipPath id="sc"><path d="{SHIELD}"/></clipPath>
<path id="arc" d="M{500-378},500 A378,378 0 0 0 {500+378},500"/>
<filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#000" flood-opacity=".55"/></filter>
</defs>
<circle cx="500" cy="500" r="492" fill="#3d2a06"/>
<circle cx="500" cy="500" r="486" fill="url(#ring)"/>
<circle cx="500" cy="500" r="462" fill="none" stroke="#fff4c0" stroke-width="2" opacity=".7"/>
<circle cx="500" cy="500" r="452" fill="#3d2a06"/>
<circle cx="500" cy="500" r="446" fill="url(#bg)"/>
<circle cx="500" cy="500" r="446" fill="url(#shine)"/>
<g filter="url(#sh)">
{scrolls()}
<g transform="translate(320,236) scale(1.2)">
 <g clip-path="url(#sc)">{body}<path d="{SHIELD}" fill="url(#gloss)"/></g>
 <path d="{SHIELD}" fill="none" stroke="#4a3205" stroke-width="17"/>
 <path d="{SHIELD}" fill="none" stroke="url(#gold)" stroke-width="11"/>
</g>
{crown()}
</g>
<g filter="url(#sh)" font-family="Cinzel, serif" font-weight="700" font-size="{fs:.0f}" letter-spacing="3">
<text fill="url(#goldH)" stroke="#3d2a06" stroke-width="7" stroke-linejoin="round" paint-order="stroke"><textPath href="#arc" startOffset="50%" text-anchor="middle">{name.upper()}</textPath></text>
</g>
</svg>'''

for slug, (name, body) in ARMS.items():
    with open(os.path.join(OUT, f"{slug}.svg"), "w") as f:
        f.write(svg(slug, name, body))
print("ok", len(ARMS))
