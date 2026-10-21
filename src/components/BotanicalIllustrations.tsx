import React from 'react';

interface IllustrationProps {
  type:
    | 'water-filter'
    | 'friction-fire'
    | 'lean-to-shelter'
    | 'foraging-acorn'
    | 'first-aid-resin'
    | 'night-navigation'
    | 'knots-tarp'
    | 'urban-blackout'
    | 'post-estrela'
    | 'post-geres'
    | 'post-vicentina'
    | 'hero-canopy';
  className?: string;
}

export const BushcraftIllustration: React.FC<IllustrationProps> = ({ type, className = 'w-full h-full' }) => {
  switch (type) {
    case 'water-filter':
      return (
        <svg viewBox="0 0 400 280" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="wf-bg" x1="0" y1="0" x2="400" y2="280" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0D3B4E" />
              <stop offset="55%" stopColor="#1B3429" />
              <stop offset="100%" stopColor="#132119" />
            </linearGradient>
            <radialGradient id="wf-glow" cx="50%" cy="35%" r="55%">
              <stop offset="0%" stopColor="#A8B88A" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#0D3B4E" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="280" fill="url(#wf-bg)" />
          <circle cx="200" cy="110" r="130" fill="url(#wf-glow)" />
          {/* Botanical fern silhouettes in background */}
          <path d="M40 280 C60 200, 100 150, 130 90" stroke="#5A6B44" strokeWidth="1.5" strokeOpacity="0.35" />
          <path d="M360 280 C330 210, 300 160, 275 100" stroke="#5A6B44" strokeWidth="1.5" strokeOpacity="0.35" />
          {/* Cross-section of Tripod Bio-Sand Filter */}
          <path d="M125 250 L185 45 M275 250 L215 45 M200 255 L200 40" stroke="#E6D7C3" strokeOpacity="0.35" strokeWidth="2.5" strokeLinecap="round" />
          {/* Vessel cylinder */}
          <path d="M162 75 L238 75 L224 215 L176 215 Z" fill="#1F2E24" fillOpacity="0.85" stroke="#E6D7C3" strokeOpacity="0.55" strokeWidth="1.5" />
          {/* Layer 1: Coarse gravel & river stones */}
          <path d="M164 95 L236 95 L233 125 L167 125 Z" fill="#5A6B44" fillOpacity="0.45" />
          <circle cx="182" cy="110" r="6" stroke="#E6D7C3" strokeOpacity="0.5" />
          <circle cx="200" cy="108" r="7" stroke="#E6D7C3" strokeOpacity="0.5" />
          <circle cx="218" cy="112" r="5.5" stroke="#E6D7C3" strokeOpacity="0.5" />
          {/* Layer 2: Fine Silica Sand */}
          <path d="M167 125 L233 125 L229 160 L171 160 Z" fill="#E6D7C3" fillOpacity="0.22" />
          {/* Layer 3: Activated Hardwood Charcoal */}
          <path d="M171 160 L229 160 L226 190 L174 190 Z" fill="#0D3B4E" fillOpacity="0.7" />
          {/* Layer 4: Sphagnum Moss & Cloth */}
          <path d="M174 190 L226 190 L224 215 L176 215 Z" fill="#A8B88A" fillOpacity="0.38" />
          {/* Purified water droplet falling into collector */}
          <path d="M200 223 C200 223, 206 231, 206 235 C206 238.5, 203.3 241, 200 241 C196.7 241, 194 238.5, 194 235 C194 231, 200 223, 200 223 Z" fill="#A8B88A" stroke="#E6D7C3" strokeWidth="1.2" />
          {/* Collector cup */}
          <path d="M178 246 L222 246 L218 268 L182 268 Z" stroke="#E6D7C3" strokeOpacity="0.5" strokeWidth="1.4" fill="#0D3B4E" fillOpacity="0.4" />
          {/* Technical callout lines */}
          <line x1="238" y1="110" x2="275" y2="110" stroke="#E6D7C3" strokeOpacity="0.4" strokeDasharray="2 2" />
          <line x1="231" y1="175" x2="275" y2="175" stroke="#C85A3E" strokeOpacity="0.7" strokeDasharray="2 2" />
          <circle cx="275" cy="175" r="3" fill="#C85A3E" />
        </svg>
      );

    case 'friction-fire':
      return (
        <svg viewBox="0 0 400 280" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="ff-bg" x1="0" y1="0" x2="400" y2="280" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#26231D" />
              <stop offset="50%" stopColor="#1F2E24" />
              <stop offset="100%" stopColor="#141E17" />
            </linearGradient>
            <radialGradient id="ff-ember" cx="50%" cy="68%" r="48%">
              <stop offset="0%" stopColor="#C85A3E" stopOpacity="0.55" />
              <stop offset="50%" stopColor="#C85A3E" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#1F2E24" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="280" fill="url(#ff-bg)" />
          <circle cx="200" cy="190" r="130" fill="url(#ff-ember)" />
          {/* Hearth board */}
          <path d="M105 215 L295 215 L310 232 L90 232 Z" fill="#2A392E" stroke="#E6D7C3" strokeOpacity="0.45" strokeWidth="1.5" />
          {/* V-Notch & Glowing Coal */}
          <path d="M192 215 L200 228 L208 215 Z" fill="#C85A3E" />
          <circle cx="200" cy="227" r="9" fill="#C85A3E" fillOpacity="0.85" />
          <circle cx="200" cy="227" r="4" fill="#E6D7C3" />
          {/* Vertical Spindle */}
          <rect x="194" y="72" width="12" height="145" rx="6" fill="#3B4A3E" stroke="#E6D7C3" strokeOpacity="0.6" strokeWidth="1.5" />
          {/* Bearing block at top */}
          <path d="M174 75 C174 58, 226 58, 226 75 Z" fill="#5A6B44" fillOpacity="0.6" stroke="#E6D7C3" strokeOpacity="0.6" strokeWidth="1.5" />
          {/* Curved Bow & Cordage */}
          <path d="M75 148 C135 110, 265 110, 325 148" stroke="#A8B88A" strokeWidth="4" strokeLinecap="round" />
          <line x1="78" y1="148" x2="322" y2="148" stroke="#E6D7C3" strokeWidth="1.5" strokeDasharray="4 2" />
          {/* Rising smoke trails */}
          <path d="M200 205 C184 180, 218 160, 198 130 C182 105, 215 80, 202 45" stroke="#E6D7C3" strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M210 210 C225 185, 195 165, 215 135" stroke="#C85A3E" strokeOpacity="0.5" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );

    case 'lean-to-shelter':
      return (
        <svg viewBox="0 0 400 280" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sh-bg" x1="0" y1="0" x2="400" y2="280" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#14231A" />
              <stop offset="60%" stopColor="#1F2E24" />
              <stop offset="100%" stopColor="#0D3B4E" />
            </linearGradient>
          </defs>
          <rect width="400" height="280" fill="url(#sh-bg)" />
          {/* Pine trees silhouette */}
          <path d="M60 220 L85 110 L110 220 Z" fill="#16241B" />
          <path d="M310 220 L335 95 L360 220 Z" fill="#16241B" />
          {/* Lean-to roof structure */}
          <path d="M95 215 L215 95 L290 215" stroke="#A8B88A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M95 215 L215 95 L255 115 L145 225 Z" fill="#5A6B44" fillOpacity="0.45" stroke="#E6D7C3" strokeOpacity="0.5" strokeWidth="1.5" />
          {/* Foliage thatch ribs */}
          <line x1="125" y1="185" x2="170" y2="195" stroke="#A8B88A" strokeOpacity="0.5" strokeWidth="1.2" />
          <line x1="155" y1="155" x2="198" y2="168" stroke="#A8B88A" strokeOpacity="0.5" strokeWidth="1.2" />
          <line x1="185" y1="125" x2="225" y2="140" stroke="#A8B88A" strokeOpacity="0.5" strokeWidth="1.2" />
          {/* Campfire & Heat Reflector Wall */}
          <circle cx="248" cy="212" r="14" fill="#C85A3E" fillOpacity="0.35" />
          <path d="M242 216 L248 200 L254 216 Z" fill="#C85A3E" />
          {/* Log reflector wall */}
          <circle cx="288" cy="214" r="6" fill="#5A6B44" stroke="#E6D7C3" strokeOpacity="0.6" />
          <circle cx="288" cy="202" r="6" fill="#5A6B44" stroke="#E6D7C3" strokeOpacity="0.6" />
          <circle cx="288" cy="190" r="6" fill="#5A6B44" stroke="#E6D7C3" strokeOpacity="0.6" />
          <circle cx="288" cy="178" r="6" fill="#5A6B44" stroke="#E6D7C3" strokeOpacity="0.6" />
          {/* Thermal reflection arrows */}
          <path d="M275 195 Q235 175 190 185" stroke="#C85A3E" strokeOpacity="0.7" strokeWidth="1.3" strokeDasharray="3 3" />
          <line x1="60" y1="225" x2="340" y2="225" stroke="#E6D7C3" strokeOpacity="0.25" />
        </svg>
      );

    case 'foraging-acorn':
      return (
        <svg viewBox="0 0 400 280" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="280" fill="#1B2A20" />
          <circle cx="200" cy="140" r="105" fill="#5A6B44" fillOpacity="0.18" />
          {/* Botanical Oak Leaf (Quercus suber / Azinheira) */}
          <path
            d="M125 195 C115 165, 130 140, 145 135 C140 115, 160 95, 180 100 C185 80, 215 80, 220 100 C240 95, 260 115, 255 135 C270 140, 285 165, 275 195 C255 205, 220 205, 200 220 C180 205, 145 205, 125 195 Z"
            fill="#5A6B44"
            fillOpacity="0.38"
            stroke="#A8B88A"
            strokeWidth="1.5"
          />
          <line x1="200" y1="88" x2="200" y2="235" stroke="#E6D7C3" strokeOpacity="0.55" strokeWidth="1.6" />
          <line x1="200" y1="130" x2="235" y2="112" stroke="#E6D7C3" strokeOpacity="0.4" strokeWidth="1.2" />
          <line x1="200" y1="155" x2="162" y2="136" stroke="#E6D7C3" strokeOpacity="0.4" strokeWidth="1.2" />
          <line x1="200" y1="175" x2="242" y2="158" stroke="#E6D7C3" strokeOpacity="0.4" strokeWidth="1.2" />
          {/* Acorn illustration */}
          <path d="M180 140 C180 125, 220 125, 220 140 Z" fill="#C85A3E" fillOpacity="0.65" stroke="#E6D7C3" strokeWidth="1.4" />
          <path d="M183 140 L217 140 C217 172, 208 188, 200 194 C192 188, 183 172, 183 140 Z" fill="#E6D7C3" fillOpacity="0.22" stroke="#E6D7C3" strokeWidth="1.4" />
        </svg>
      );

    case 'first-aid-resin':
      return (
        <svg viewBox="0 0 400 280" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="280" fill="#18271F" />
          <circle cx="200" cy="140" r="95" stroke="#E6D7C3" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="4 4" />
          {/* Pine needles & resin drop */}
          <path d="M140 200 L200 85 M155 208 L200 85 M125 190 L200 85" stroke="#A8B88A" strokeOpacity="0.55" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M260 200 L200 85 M245 208 L200 85 M275 190 L200 85" stroke="#A8B88A" strokeOpacity="0.55" strokeWidth="1.5" strokeLinecap="round" />
          {/* Golden-terracotta Pine Resin Drop */}
          <path
            d="M200 105 C200 105, 234 150, 234 174 C234 193, 218.8 208, 200 208 C181.2 208, 166 193, 166 174 C166 150, 200 105, 200 105 Z"
            fill="#C85A3E"
            fillOpacity="0.45"
            stroke="#E6D7C3"
            strokeWidth="1.6"
          />
          {/* Subtle cross inside drop */}
          <path d="M200 158 V186 M186 172 H214" stroke="#E6D7C3" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    case 'night-navigation':
      return (
        <svg viewBox="0 0 400 280" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="280" fill="#0D3B4E" />
          <rect width="400" height="280" fill="#14231A" fillOpacity="0.55" />
          {/* Compass Rose & Polaris */}
          <circle cx="200" cy="140" r="86" stroke="#E6D7C3" strokeOpacity="0.28" strokeWidth="1.2" />
          <circle cx="200" cy="140" r="68" stroke="#A8B88A" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="3 3" />
          {/* Ursa Major constellation points */}
          <polyline
            points="120,185 145,172 168,176 190,162 222,155 228,180 194,185 190,162"
            stroke="#E6D7C3"
            strokeOpacity="0.5"
            strokeWidth="1.2"
            fill="none"
          />
          {/* Pointer line to Polaris */}
          <line x1="228" y1="180" x2="200" y2="78" stroke="#C85A3E" strokeWidth="1.4" strokeDasharray="3 3" />
          {/* North Star Polaris */}
          <circle cx="200" cy="78" r="5" fill="#C85A3E" />
          <path d="M200 62 V94 M184 78 H216" stroke="#E6D7C3" strokeWidth="1.4" />
        </svg>
      );

    case 'knots-tarp':
      return (
        <svg viewBox="0 0 400 280" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="280" fill="#1D2B22" />
          {/* Bowline / Lais de Guia geometric knot diagram */}
          <circle cx="200" cy="140" r="88" stroke="#5A6B44" strokeOpacity="0.3" strokeWidth="1.2" />
          <path
            d="M200 45 L200 120 C200 145, 235 145, 235 120 C235 95, 165 95, 165 135 C165 185, 140 225, 200 235 C260 225, 235 185, 235 145"
            stroke="#E6D7C3"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M200 45 L200 120 C200 145, 235 145, 235 120 C235 95, 165 95, 165 135 C165 185, 140 225, 200 235 C260 225, 235 185, 235 145"
            stroke="#C85A3E"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      );

    case 'urban-blackout':
      return (
        <svg viewBox="0 0 400 280" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="280" fill="#172520" />
          {/* Solar panel + crank radio + water jerrycan minimal line blueprint */}
          <rect x="95" y="95" width="95" height="95" rx="12" fill="#0D3B4E" fillOpacity="0.45" stroke="#A8B88A" strokeWidth="1.5" />
          <line x1="95" y1="127" x2="190" y2="127" stroke="#A8B88A" strokeOpacity="0.4" />
          <line x1="95" y1="158" x2="190" y2="158" stroke="#A8B88A" strokeOpacity="0.4" />
          <line x1="142" y1="95" x2="142" y2="190" stroke="#A8B88A" strokeOpacity="0.4" />
          {/* Emergency Lantern / Radio */}
          <rect x="215" y="105" width="90" height="85" rx="14" fill="#1F2E24" stroke="#E6D7C3" strokeWidth="1.5" />
          <circle cx="248" cy="148" r="18" stroke="#C85A3E" strokeWidth="1.8" />
          <line x1="230" y1="105" x2="285" y2="68" stroke="#E6D7C3" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="285" cy="68" r="4" fill="#C85A3E" />
        </svg>
      );

    case 'post-estrela':
      return (
        <svg viewBox="0 0 480 260" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pe-sky" x1="0" y1="0" x2="0" y2="260" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0D3B4E" />
              <stop offset="65%" stopColor="#1F2E24" />
              <stop offset="100%" stopColor="#121C16" />
            </linearGradient>
          </defs>
          <rect width="480" height="260" fill="url(#pe-sky)" />
          {/* Sun / Golden mist over Serra da Estrela granite peaks */}
          <circle cx="340" cy="82" r="42" fill="#C85A3E" fillOpacity="0.35" />
          <circle cx="340" cy="82" r="22" fill="#E6D7C3" fillOpacity="0.6" />
          {/* Mountain ridges */}
          <path d="M0 190 L110 115 L220 165 L330 95 L480 175 L480 260 L0 260 Z" fill="#25362B" stroke="#A8B88A" strokeOpacity="0.3" />
          <path d="M0 215 L165 150 L290 195 L410 140 L480 190 L480 260 L0 260 Z" fill="#18251D" />
          {/* Bivouac tarp & warm ember glow */}
          <polygon points="180,220 235,182 275,220" fill="#5A6B44" stroke="#E6D7C3" strokeWidth="1.4" />
          <circle cx="255" cy="222" r="8" fill="#C85A3E" />
        </svg>
      );

    case 'post-geres':
      return (
        <svg viewBox="0 0 480 260" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="480" height="260" fill="#16261D" />
          {/* Lush Atlantic forest canopy rays */}
          <polygon points="80,0 160,0 260,260 140,260" fill="#A8B88A" fillOpacity="0.1" />
          <polygon points="210,0 280,0 390,260 290,260" fill="#E6D7C3" fillOpacity="0.08" />
          {/* Stream & boulders */}
          <path d="M180 260 C200 200, 260 185, 240 120" stroke="#0D3B4E" strokeWidth="38" strokeLinecap="round" />
          <path d="M180 260 C200 200, 260 185, 240 120" stroke="#A8B88A" strokeOpacity="0.4" strokeWidth="2" strokeDasharray="6 6" />
          <circle cx="150" cy="200" r="26" fill="#2A3B2F" stroke="#E6D7C3" strokeOpacity="0.2" />
          <circle cx="310" cy="180" r="34" fill="#233328" stroke="#E6D7C3" strokeOpacity="0.2" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 400 280" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="280" fill="#1F2E24" />
          <circle cx="200" cy="140" r="80" stroke="#A8B88A" strokeOpacity="0.3" strokeWidth="1.5" />
        </svg>
      );
  }
};
