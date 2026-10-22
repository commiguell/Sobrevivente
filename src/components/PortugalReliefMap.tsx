import React, { useState } from 'react';

interface PeakInfo {
  name: string;
  region: string;
  altitude: string;
  description: string;
}

export const PORTUGAL_PEAKS: PeakInfo[] = [
  {
    name: 'Pico',
    region: 'Açores (Ilha do Pico)',
    altitude: '2.351 m',
    description: 'Ponto mais alto de todo o território português. Vulcão imponente no Atlântico Norte.',
  },
  {
    name: 'Torre',
    region: 'Serra da Estrela (Centro)',
    altitude: '1.993 m',
    description: 'Ponto mais alto de Portugal Continental. Planalto granítico e clima alpino no inverno.',
  },
  {
    name: 'Pico Ruivo',
    region: 'Madeira (Maciço Central)',
    altitude: '1.862 m',
    description: 'Crista vulcânica escarpada com vales abruptos e microclimas de altitude.',
  },
  {
    name: 'Nevosa',
    region: 'Serra do Gerês (Norte)',
    altitude: '1.548 m',
    description: 'Relevo granítico agreste no único Parque Nacional de Portugal.',
  },
  {
    name: 'São Mamede',
    region: 'Portalegre (Alentejo)',
    altitude: '1.025 m',
    description: 'Oásis orográfico de altitude com transição entre climas atlântico e mediterrânico.',
  },
  {
    name: 'Fóia',
    region: 'Serra de Monchique (Algarve)',
    altitude: '902 m',
    description: 'Maciço sienítico que protege a costa sul dos ventos frios do norte.',
  },
];

interface PortugalReliefMapProps {
  className?: string;
  compact?: boolean;
}

export function PortugalReliefMap({ className = '', compact = false }: PortugalReliefMapProps) {
  const [selectedPeak, setSelectedPeak] = useState<PeakInfo | null>(null);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Map SVG Canvas */}
      <div className="relative w-full max-w-[380px] aspect-[4/5] flex items-center justify-center">
        <svg
          viewBox="0 0 400 480"
          className="w-full h-full drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
          aria-label="Mapa de relevo de Portugal, Madeira e Açores"
        >
          <defs>
            {/* Gradients for relief elevation levels */}
            <linearGradient id="relief-low" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3b28" />
              <stop offset="100%" stopColor="#172e20" />
            </linearGradient>

            <linearGradient id="relief-mid" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2e553a" />
              <stop offset="100%" stopColor="#24442e" />
            </linearGradient>

            <linearGradient id="relief-high" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f7a55" />
              <stop offset="100%" stopColor="#3b6143" />
            </linearGradient>

            <linearGradient id="relief-alpine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C85A3E" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#8d3d29" stopOpacity="0.85" />
            </linearGradient>

            <radialGradient id="peak-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E6D7C3" stopOpacity="1" />
              <stop offset="40%" stopColor="#A8B88A" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#A8B88A" stopOpacity="0" />
            </radialGradient>

            <pattern id="topo-grid" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(230, 215, 195, 0.05)" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Coordinate grid background */}
          <rect x="0" y="0" width="400" height="480" fill="url(#topo-grid)" />

          {/* =================================================================
              1. MAINLAND PORTUGAL (Continental)
             ================================================================= */}
          <g id="portugal-continental" className="transition-opacity duration-300">
            {/* Base Geographic Outline: Continental Portugal (0 - 200m) */}
            <path
              d="M 235 60
                 C 255 58, 275 62, 290 75
                 C 305 88, 312 110, 310 135
                 C 308 160, 315 180, 305 205
                 C 295 230, 302 260, 298 290
                 C 294 315, 290 340, 275 365
                 C 260 390, 262 410, 250 425
                 C 238 438, 220 440, 195 440
                 C 178 440, 160 435, 155 422
                 C 152 412, 162 398, 165 375
                 C 168 350, 158 335, 152 315
                 C 146 295, 138 275, 150 255
                 C 158 240, 168 228, 172 205
                 C 176 182, 170 160, 180 135
                 C 188 115, 200 90, 210 75
                 Z"
              fill="url(#relief-low)"
              stroke="#A8B88A"
              strokeWidth="1.2"
              strokeOpacity="0.45"
            />

            {/* Shaded Topographic Relief Layers (Curvas de Nível) */}

            {/* Elevation Band 1: 400m+ (Serras do Norte, Centro e Monchique) */}
            <path
              d="M 230 75
                 C 250 72, 280 82, 295 105
                 C 302 120, 298 145, 285 160
                 C 270 175, 255 160, 235 150
                 C 215 140, 205 110, 215 90
                 Z"
              fill="url(#relief-mid)"
              stroke="#A8B88A"
              strokeWidth="0.8"
              strokeDasharray="2,2"
              strokeOpacity="0.6"
            />

            {/* Elevation Band: Serra da Estrela & Cordilheira Central (800m - 1993m) */}
            <path
              d="M 235 180
                 C 265 170, 288 185, 285 210
                 C 282 235, 250 245, 230 235
                 C 215 228, 210 200, 222 188
                 Z"
              fill="url(#relief-high)"
              stroke="#E6D7C3"
              strokeWidth="1"
              strokeOpacity="0.7"
            />

            {/* Highest Relief Core: Torre - Serra da Estrela (1.993m) */}
            <ellipse
              cx="255"
              cy="205"
              rx="18"
              ry="12"
              fill="url(#relief-alpine)"
              stroke="#E6D7C3"
              strokeWidth="1.2"
            />
            {/* Topographic concentric rings in Estrela */}
            <ellipse cx="255" cy="205" rx="10" ry="7" fill="none" stroke="#E6D7C3" strokeWidth="0.8" strokeDasharray="1.5,1.5" />
            <ellipse cx="255" cy="205" rx="4" ry="3" fill="#E6D7C3" />

            {/* Elevation Band: Gerês & Montesinho (Norte > 1200m) */}
            <path
              d="M 232 82
                 C 255 78, 275 90, 270 112
                 C 265 125, 245 128, 232 118
                 C 222 110, 220 92, 232 82
                 Z"
              fill="url(#relief-high)"
              stroke="#A8B88A"
              strokeWidth="0.9"
            />
            <circle cx="248" cy="98" r="3.5" fill="#C85A3E" stroke="#E6D7C3" strokeWidth="1" />

            {/* Elevation Band: Serra de São Mamede (Alentejo 1025m) */}
            <ellipse
              cx="278"
              cy="265"
              rx="14"
              ry="9"
              fill="url(#relief-mid)"
              stroke="#A8B88A"
              strokeWidth="0.8"
            />
            <circle cx="278" cy="265" r="2.5" fill="#E6D7C3" />

            {/* Elevation Band: Serra de Monchique - Fóia 902m (Algarve) */}
            <ellipse
              cx="192"
              cy="410"
              rx="16"
              ry="8"
              fill="url(#relief-high)"
              stroke="#A8B88A"
              strokeWidth="0.9"
            />
            <circle cx="192" cy="410" r="3" fill="#C85A3E" stroke="#E6D7C3" strokeWidth="1" />

            {/* Elevation Band: Serra do Caldeirão */}
            <path
              d="M 215 412 Q 235 410 250 415"
              fill="none"
              stroke="#A8B88A"
              strokeWidth="1.2"
              strokeDasharray="2,2"
              strokeOpacity="0.8"
            />

            {/* Major River Lines: Douro, Tejo, Mondego */}
            <path
              d="M 305 125 Q 260 128 200 135"
              fill="none"
              stroke="#5a8b75"
              strokeWidth="1"
              strokeOpacity="0.6"
            />
            <path
              d="M 270 165 Q 230 170 180 185"
              fill="none"
              stroke="#5a8b75"
              strokeWidth="0.8"
              strokeOpacity="0.5"
            />
            <path
              d="M 298 250 Q 230 270 162 290"
              fill="none"
              stroke="#5a8b75"
              strokeWidth="1.2"
              strokeOpacity="0.65"
            />

            {/* Peak Interactive Marker: Torre 1993m */}
            <g
              className="cursor-pointer group"
              onClick={() => setSelectedPeak(PORTUGAL_PEAKS[1])}
              onMouseEnter={() => setActiveRegion('Serra da Estrela')}
              onMouseLeave={() => setActiveRegion(null)}
            >
              <circle cx="255" cy="205" r="8" fill="url(#peak-glow)" className="animate-pulse" />
              <circle cx="255" cy="205" r="3.5" fill="#E6D7C3" stroke="#16271c" strokeWidth="1" />
              <text
                x="266"
                y="202"
                fill="#E6D7C3"
                fontSize="9"
                fontFamily="ui-monospace, monospace"
                fontWeight="bold"
                className="drop-shadow-md"
              >
                Torre 1.993m
              </text>
            </g>

            {/* Peak Interactive Marker: Nevosa (Gerês) */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedPeak(PORTUGAL_PEAKS[3])}
              onMouseEnter={() => setActiveRegion('Gerês')}
              onMouseLeave={() => setActiveRegion(null)}
            >
              <text
                x="256"
                y="96"
                fill="#A8B88A"
                fontSize="8"
                fontFamily="ui-monospace, monospace"
              >
                Gerês 1.548m
              </text>
            </g>

            {/* Peak Interactive Marker: Monchique (Fóia) */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedPeak(PORTUGAL_PEAKS[5])}
              onMouseEnter={() => setActiveRegion('Algarve')}
              onMouseLeave={() => setActiveRegion(null)}
            >
              <text
                x="150"
                y="402"
                fill="#A8B88A"
                fontSize="8"
                fontFamily="ui-monospace, monospace"
              >
                Fóia 902m
              </text>
            </g>
          </g>

          {/* =================================================================
              2. INSET: ARQUIPÉLAGO DOS AÇORES (Upper Left)
             ================================================================= */}
          <g id="acores-inset" className="transition-all duration-200">
            {/* Inset Border Box */}
            <rect
              x="16"
              y="20"
              width="150"
              height="100"
              rx="12"
              fill="#14261a"
              fillOpacity="0.85"
              stroke="#A8B88A"
              strokeWidth="1"
              strokeOpacity="0.35"
            />
            {/* Header label */}
            <text x="24" y="34" fill="#A8B88A" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600" letterSpacing="0.05em">
              ARQUIPÉLAGO DOS AÇORES
            </text>
            <text x="24" y="44" fill="#E6D7C3" fontSize="7" fillOpacity="0.7">
              Relevo Vulcânico · Atlântico Norte
            </text>

            {/* Islands Relief Representations */}
            {/* Ilha do Pico (With highest point in Portugal - Montanha do Pico 2351m) */}
            <g
              className="cursor-pointer group"
              onClick={() => setSelectedPeak(PORTUGAL_PEAKS[0])}
              onMouseEnter={() => setActiveRegion('Açores (Pico)')}
              onMouseLeave={() => setActiveRegion(null)}
            >
              {/* Island contour */}
              <path
                d="M 68 74 C 75 70, 92 68, 98 73 C 96 79, 82 82, 68 74 Z"
                fill="url(#relief-high)"
                stroke="#A8B88A"
                strokeWidth="0.8"
              />
              {/* Volcanic Cone Relief Rings */}
              <circle cx="82" cy="73" r="7" fill="none" stroke="#E6D7C3" strokeWidth="0.6" strokeDasharray="1.5,1.5" />
              <circle cx="82" cy="73" r="4.5" fill="url(#relief-alpine)" stroke="#E6D7C3" strokeWidth="0.9" />
              <circle cx="82" cy="73" r="9" fill="url(#peak-glow)" className="animate-pulse" />
              <circle cx="82" cy="73" r="2.5" fill="#E6D7C3" />
              {/* Marker text */}
              <text x="56" y="93" fill="#E6D7C3" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="bold">
                ★ Pico 2.351m
              </text>
              <text x="56" y="102" fill="#C85A3E" fontSize="6.5" fontFamily="ui-monospace, monospace">
                Ponto Mais Alto de PT
              </text>
            </g>

            {/* Ilha do Faial */}
            <ellipse cx="54" cy="72" rx="6" ry="4" fill="url(#relief-mid)" stroke="#A8B88A" strokeWidth="0.6" />
            {/* Ilha de São Jorge */}
            <path d="M 72 61 L 94 56 L 93 59 Z" fill="url(#relief-mid)" stroke="#A8B88A" strokeWidth="0.6" />
            {/* Ilha Terceira */}
            <ellipse cx="112" cy="62" rx="7" ry="5" fill="url(#relief-mid)" stroke="#A8B88A" strokeWidth="0.6" />
            {/* Ilha de São Miguel (Caldeiras) */}
            <path d="M 125 78 C 135 75, 148 76, 155 80 C 146 83, 134 82, 125 78 Z" fill="url(#relief-mid)" stroke="#A8B88A" strokeWidth="0.7" />
            <circle cx="138" cy="78" r="2" fill="url(#relief-high)" />
          </g>

          {/* =================================================================
              3. INSET: ARQUIPÉLAGO DA MADEIRA (Lower Left)
             ================================================================= */}
          <g id="madeira-inset" className="transition-all duration-200">
            {/* Inset Border Box */}
            <rect
              x="16"
              y="130"
              width="150"
              height="95"
              rx="12"
              fill="#14261a"
              fillOpacity="0.85"
              stroke="#A8B88A"
              strokeWidth="1"
              strokeOpacity="0.35"
            />
            {/* Header label */}
            <text x="24" y="144" fill="#A8B88A" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600" letterSpacing="0.05em">
              ARQUIPÉLAGO DA MADEIRA
            </text>
            <text x="24" y="154" fill="#E6D7C3" fontSize="7" fillOpacity="0.7">
              Relevo Escarpado · Crista Vulcânica
            </text>

            {/* Ilha da Madeira: Rugged mountain ridge */}
            <g
              className="cursor-pointer group"
              onClick={() => setSelectedPeak(PORTUGAL_PEAKS[2])}
              onMouseEnter={() => setActiveRegion('Madeira (Ruivo)')}
              onMouseLeave={() => setActiveRegion(null)}
            >
              {/* Main island contour */}
              <path
                d="M 44 182
                   C 55 174, 90 172, 110 180
                   C 114 184, 102 192, 75 194
                   C 55 195, 42 190, 44 182
                   Z"
                fill="url(#relief-high)"
                stroke="#A8B88A"
                strokeWidth="0.8"
              />

              {/* Rugged Central Ridge Topo line */}
              <path
                d="M 58 184 Q 78 178 98 184"
                fill="none"
                stroke="#E6D7C3"
                strokeWidth="1.2"
                strokeLinecap="round"
              />

              {/* Peak: Pico Ruivo 1.862m */}
              <circle cx="78" cy="182" r="7" fill="url(#peak-glow)" className="animate-pulse" />
              <circle cx="78" cy="182" r="3.5" fill="#C85A3E" stroke="#E6D7C3" strokeWidth="1" />
              <circle cx="78" cy="182" r="1.5" fill="#E6D7C3" />

              <text x="52" y="206" fill="#E6D7C3" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="bold">
                Pico Ruivo 1.862m
              </text>
              <text x="52" y="214" fill="#A8B88A" fontSize="6.5" fontFamily="ui-monospace, monospace">
                Pico do Arieiro 1.818m
              </text>
            </g>

            {/* Ilha de Porto Santo */}
            <ellipse cx="132" cy="168" rx="6" ry="4" fill="url(#relief-mid)" stroke="#A8B88A" strokeWidth="0.6" />
            <text x="122" y="160" fill="#E6D7C3" fontSize="6" opacity="0.75" fontFamily="ui-monospace, monospace">
              P. Santo
            </text>
            {/* Ilhas Desertas */}
            <path d="M 115 198 L 122 205" stroke="#A8B88A" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          </g>

          {/* Compass Rose / North Indicator */}
          <g transform="translate(365, 35)">
            <circle cx="0" cy="0" r="14" fill="#14261a" stroke="#A8B88A" strokeWidth="0.8" strokeOpacity="0.4" />
            <path d="M 0 -11 L 3 0 L 0 -2 L -3 0 Z" fill="#C85A3E" />
            <path d="M 0 11 L 3 0 L 0 2 L -3 0 Z" fill="#A8B88A" />
            <text x="-3" y="-14" fill="#E6D7C3" fontSize="7" fontFamily="ui-monospace, monospace" fontWeight="bold">
              N
            </text>
          </g>

          {/* Scale Legend (Escala Topográfica) */}
          <g transform="translate(20, 450)">
            <rect x="0" y="0" width="80" height="2" fill="#E6D7C3" opacity="0.8" />
            <rect x="0" y="-3" width="1" height="8" fill="#E6D7C3" opacity="0.8" />
            <rect x="40" y="-3" width="1" height="8" fill="#E6D7C3" opacity="0.8" />
            <rect x="80" y="-3" width="1" height="8" fill="#E6D7C3" opacity="0.8" />
            <text x="0" y="14" fill="#E6D7C3" fontSize="7" fontFamily="ui-monospace, monospace" opacity="0.75">
              0
            </text>
            <text x="35" y="14" fill="#E6D7C3" fontSize="7" fontFamily="ui-monospace, monospace" opacity="0.75">
              50
            </text>
            <text x="70" y="14" fill="#E6D7C3" fontSize="7" fontFamily="ui-monospace, monospace" opacity="0.75">
              100 km
            </text>
          </g>

          {/* Relief Elevation Legend */}
          <g transform="translate(180, 452)">
            <rect x="0" y="0" width="18" height="6" fill="#1e3b28" stroke="#A8B88A" strokeWidth="0.4" />
            <text x="22" y="6" fill="#E6D7C3" fontSize="6.5" opacity="0.7" fontFamily="ui-monospace, monospace">
              &lt;400m
            </text>

            <rect x="60" y="0" width="18" height="6" fill="#2e553a" stroke="#A8B88A" strokeWidth="0.4" />
            <text x="82" y="6" fill="#E6D7C3" fontSize="6.5" opacity="0.7" fontFamily="ui-monospace, monospace">
              800m
            </text>

            <rect x="120" y="0" width="18" height="6" fill="#C85A3E" stroke="#E6D7C3" strokeWidth="0.4" />
            <text x="142" y="6" fill="#E6D7C3" fontSize="6.5" opacity="0.7" fontFamily="ui-monospace, monospace">
              &gt;1.500m
            </text>
          </g>
        </svg>

        {/* Dynamic Peak Tooltip Overlay */}
        {selectedPeak && (
          <div className="absolute bottom-2 left-4 right-4 bg-[#122218]/95 backdrop-blur-md border border-[#A8B88A]/50 rounded-xl p-3 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150 z-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C85A3E] animate-ping" />
                <span className="font-display font-semibold text-sm text-[#E6D7C3]">
                  {selectedPeak.name}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#A8B88A]/20 text-[#A8B88A] font-mono text-xs">
                  {selectedPeak.altitude}
                </span>
              </div>
              <button
                onClick={() => setSelectedPeak(null)}
                className="text-xs text-[#E6D7C3]/60 hover:text-white px-1.5 py-0.5 rounded"
                aria-label="Fechar detalhe do cume"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#A8B88A] font-mono mt-1">{selectedPeak.region}</p>
            <p className="text-[11px] text-[#E6D7C3]/80 mt-1 leading-snug">{selectedPeak.description}</p>
          </div>
        )}
      </div>

      {/* Altitude quick strip */}
      {!compact && (
        <div className="w-full pt-3 px-2 flex items-center justify-between text-[10px] text-[#E6D7C3]/70 font-mono border-t border-white/10">
          <button
            onClick={() => setSelectedPeak(PORTUGAL_PEAKS[0])}
            className="hover:text-[#A8B88A] transition-colors flex items-center gap-1"
          >
            <span>Açores:</span>
            <span className="text-[#C85A3E] font-bold">2.351m</span>
          </button>
          <span aria-hidden="true">·</span>
          <button
            onClick={() => setSelectedPeak(PORTUGAL_PEAKS[1])}
            className="hover:text-[#A8B88A] transition-colors flex items-center gap-1"
          >
            <span>Estrela:</span>
            <span className="text-[#E6D7C3] font-bold">1.993m</span>
          </button>
          <span aria-hidden="true">·</span>
          <button
            onClick={() => setSelectedPeak(PORTUGAL_PEAKS[2])}
            className="hover:text-[#A8B88A] transition-colors flex items-center gap-1"
          >
            <span>Madeira:</span>
            <span className="text-[#A8B88A] font-bold">1.862m</span>
          </button>
        </div>
      )}
    </div>
  );
}
