import React from 'react';

interface HospitalLogoProps {
  className?: string;
  showShadow?: boolean;
}

export const HospitalLogo: React.FC<HospitalLogoProps> = ({
  className = 'w-10 h-10',
  showShadow = true,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className={`${className} select-none aspect-square`}
      aria-label="ตราสัญลักษณ์ โรงพยาบาลท่าคันโท"
    >
      <defs>
        {/* Background sky-blue gradient */}
        <linearGradient id="hlBgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#b2e9ff" />
          <stop offset="40%" stopColor="#9ee2ff" />
          <stop offset="100%" stopColor="#8fdcfe" />
        </linearGradient>

        {/* Sun rays orange gradients */}
        <linearGradient id="hlRayLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffb347" />
          <stop offset="60%" stopColor="#ff8c1a" />
          <stop offset="100%" stopColor="#f56e00" />
        </linearGradient>
        <linearGradient id="hlRayDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f56e00" />
          <stop offset="70%" stopColor="#d44b00" />
          <stop offset="100%" stopColor="#a83800" />
        </linearGradient>

        {/* Terracotta ceramic trim gradients */}
        <linearGradient id="hlTerraTrim" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#692209" />
          <stop offset="25%" stopColor="#943914" />
          <stop offset="50%" stopColor="#bc5222" />
          <stop offset="75%" stopColor="#943914" />
          <stop offset="100%" stopColor="#5a1c06" />
        </linearGradient>

        {/* Vase White Ceramic body 3D radial gradient */}
        <radialGradient id="hlVaseGlaze" cx="42%" cy="38%" r="62%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#f8fafc" />
          <stop offset="75%" stopColor="#e2edf5" />
          <stop offset="100%" stopColor="#cbdbe6" />
        </radialGradient>

        {/* Vase neck cylindrical lighting */}
        <linearGradient id="hlNeckGlaze" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c5d8e6" />
          <stop offset="28%" stopColor="#f4f8fb" />
          <stop offset="55%" stopColor="#ffffff" />
          <stop offset="85%" stopColor="#e2edf5" />
          <stop offset="100%" stopColor="#b4c9d8" />
        </linearGradient>

        {/* Ministry of Health Gold emblem gradient */}
        <linearGradient id="hlMophGold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="35%" stopColor="#f59e0b" />
          <stop offset="80%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>

        <linearGradient id="hlTorchFlame" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="45%" stopColor="#ea580c" />
          <stop offset="80%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>

        {/* Serpent Emerald Green 3D gradient */}
        <linearGradient id="hlSnakeBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="30%" stopColor="#10b981" />
          <stop offset="70%" stopColor="#047857" />
          <stop offset="100%" stopColor="#064e3b" />
        </linearGradient>

        {/* Ribbon 3D Emerald gradient */}
        <linearGradient id="hlRibbon3D" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="30%" stopColor="#0d9488" />
          <stop offset="70%" stopColor="#0f766e" />
          <stop offset="100%" stopColor="#042f2e" />
        </linearGradient>

        {/* Orange Flame Accent inside ribbon wings */}
        <linearGradient id="hlRibbonFlame" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#c2410c" />
          <stop offset="50%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>

        {showShadow && (
          <>
            <filter id="hlSoft3DShadow" x="-12%" y="-12%" width="124%" height="124%">
              <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#0c4a6e" floodOpacity="0.32" />
            </filter>
            <filter id="hlVaseSoftShadow" x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#022c22" floodOpacity="0.25" />
            </filter>
            <filter id="hlWhiteTextShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#022c22" floodOpacity="0.85" />
            </filter>
          </>
        )}

        {/* Text Path for Ribbon: perfectly symmetrical curve centered at x=256 */}
        <path id="hlRibbonPath" d="M 124,374 C 182,442 330,442 388,374" fill="none" />
      </defs>

      {/* 1. Background (Rounded square, exactly like user PNG) */}
      <rect width="512" height="512" rx="36" fill="url(#hlBgGrad)" />

      {/* 2. Symmetrical 13 Sunburst Rays (Fan arch centered at (256, 235)) */}
      <g filter={showShadow ? 'url(#hlSoft3DShadow)' : undefined}>
        {/* Ray 1 (Far Left, -75 deg) */}
        <polygon points="106,170 162,154 159,165" fill="url(#hlRayDark)" />
        <polygon points="106,170 162,154 153,145" fill="url(#hlRayLight)" />

        {/* Ray 2 (-62.5 deg) */}
        <polygon points="115,135 174,133 168,144" fill="url(#hlRayDark)" />
        <polygon points="115,135 174,133 164,124" fill="url(#hlRayLight)" />

        {/* Ray 3 (-50 deg) */}
        <polygon points="134,104 191,116 183,127" fill="url(#hlRayDark)" />
        <polygon points="134,104 191,116 182,106" fill="url(#hlRayLight)" />

        {/* Ray 4 (-37.5 deg) */}
        <polygon points="159,77 210,103 200,114" fill="url(#hlRayDark)" />
        <polygon points="159,77 210,103 202,93" fill="url(#hlRayLight)" />

        {/* Ray 5 (-25 deg) */}
        <polygon points="191,56 229,95 218,104" fill="url(#hlRayDark)" />
        <polygon points="191,56 229,95 223,84" fill="url(#hlRayLight)" />

        {/* Ray 6 (-12.5 deg) */}
        <polygon points="223,43 247,91 236,98" fill="url(#hlRayDark)" />
        <polygon points="223,43 247,91 243,80" fill="url(#hlRayLight)" />

        {/* Ray 7 (Center Ray, 0 deg straight up) */}
        <polygon points="256,36 262,90 252,90" fill="url(#hlRayDark)" />
        <polygon points="256,36 252,90 248,80" fill="url(#hlRayLight)" />

        {/* Ray 8 (+12.5 deg) */}
        <polygon points="289,43 276,91 269,98" fill="url(#hlRayLight)" />
        <polygon points="289,43 276,91 273,80" fill="url(#hlRayDark)" />

        {/* Ray 9 (+25 deg) */}
        <polygon points="321,56 283,95 276,104" fill="url(#hlRayLight)" />
        <polygon points="321,56 283,95 289,84" fill="url(#hlRayDark)" />

        {/* Ray 10 (+37.5 deg) */}
        <polygon points="353,77 302,103 294,114" fill="url(#hlRayLight)" />
        <polygon points="353,77 302,103 310,93" fill="url(#hlRayDark)" />

        {/* Ray 11 (+50 deg) */}
        <polygon points="378,104 321,116 313,127" fill="url(#hlRayLight)" />
        <polygon points="378,104 321,116 330,106" fill="url(#hlRayDark)" />

        {/* Ray 12 (+62.5 deg) */}
        <polygon points="397,135 338,133 332,144" fill="url(#hlRayLight)" />
        <polygon points="397,135 338,133 348,124" fill="url(#hlRayDark)" />

        {/* Ray 13 (+75 deg) */}
        <polygon points="406,170 350,154 347,165" fill="url(#hlRayLight)" />
        <polygon points="406,170 350,154 359,145" fill="url(#hlRayDark)" />
      </g>

      {/* 3. Traditional Khon Tho Ceramic Vase (คนโท ท่าคันโท) */}
      <g filter={showShadow ? 'url(#hlVaseSoftShadow)' : undefined}>
        {/* Base Pedestal (Terracotta Brown) */}
        <ellipse cx="256" cy="386" rx="72" ry="16" fill="url(#hlTerraTrim)" />
        <path d="M 184,386 C 184,396 328,396 328,386 L 324,374 C 324,364 188,364 188,374 Z" fill="#692209" />
        <ellipse cx="256" cy="374" rx="66" ry="13" fill="url(#hlTerraTrim)" />

        {/* Vase Outer Ceramic Shadow Silhouette */}
        <path
          d="M 232,122 
             C 220,140 226,180 206,220 
             C 176,260 156,310 188,358 
             C 206,376 306,376 324,358 
             C 356,310 336,260 306,220 
             C 286,180 292,140 280,122 Z"
          fill="#5a1c06"
          opacity="0.25"
        />

        {/* White Glazed Ceramic Bulbous Body */}
        <path
          d="M 234,124 
             C 224,142 228,182 208,222 
             C 178,262 160,312 192,356 
             C 210,374 302,374 320,356 
             C 352,312 334,262 304,222 
             C 284,182 288,142 278,124 Z"
          fill="url(#hlVaseGlaze)"
        />

        {/* Slender Neck cylindrical gloss layer */}
        <path
          d="M 235,126 
             C 228,144 238,186 235,216 
             C 245,220 267,220 277,216 
             C 274,186 284,144 277,126 Z"
          fill="url(#hlNeckGlaze)"
        />

        {/* Lower Terracotta Neck Collar Ring (Transition to Body) */}
        <ellipse cx="256" cy="204" rx="34" ry="7.5" fill="url(#hlTerraTrim)" />
        <ellipse cx="256" cy="202" rx="31" ry="5.5" fill="#fef08a" opacity="0.4" />

        {/* Upper Terracotta Lip & Mouth Rim */}
        <ellipse cx="256" cy="125" rx="38" ry="11" fill="url(#hlTerraTrim)" />
        {/* Inner Mouth Dark Cavity */}
        <ellipse cx="256" cy="123" rx="33" ry="8.5" fill="#3a1104" />
        <ellipse cx="256" cy="122" rx="25" ry="6" fill="#1e0701" />
      </g>

      {/* 4. Ministry of Public Health Emblem (ตรากระทรวงสาธารณสุข) */}
      <g id="hlMophEmblem" filter={showShadow ? 'url(#hlSoft3DShadow)' : undefined}>
        {/* Golden Spread Wings Left */}
        <path
          d="M 252,274 C 238,260 216,246 192,254 C 198,266 210,272 218,278 C 202,272 188,276 196,288 C 206,294 218,296 226,298 C 214,298 204,306 212,316 C 222,318 238,310 250,296 Z"
          fill="url(#hlMophGold)"
          stroke="#b45309"
          strokeWidth="1.5"
        />

        {/* Golden Spread Wings Right */}
        <path
          d="M 260,274 C 274,260 296,246 320,254 C 314,266 302,272 294,278 C 310,272 324,276 316,288 C 306,294 294,296 286,298 C 298,298 308,306 300,316 C 290,318 274,310 262,296 Z"
          fill="url(#hlMophGold)"
          stroke="#b45309"
          strokeWidth="1.5"
        />

        {/* Torch / Staff Vertical Rod (Gold) */}
        <rect x="252" y="260" width="8" height="98" rx="4" fill="#92400e" />
        <rect x="253.5" y="260" width="5" height="98" rx="2.5" fill="url(#hlMophGold)" />
        <path d="M 246,265 L 266,265 L 261,274 L 251,274 Z" fill="url(#hlMophGold)" stroke="#b45309" strokeWidth="1" />

        {/* Burning Fire Flame (Red, Orange, Yellow) */}
        <path
          d="M 256,230 C 245,242 245,252 248,264 C 252,266 260,266 264,264 C 267,252 267,242 256,230 Z"
          fill="url(#hlTorchFlame)"
        />
        <path
          d="M 256,238 C 250,246 250,254 252,262 C 254,263 258,263 260,262 C 262,254 262,246 256,238 Z"
          fill="#fef08a"
          opacity="0.9"
        />

        {/* Entwined 3D Green Serpent */}
        <path
          d="M 244,282 C 238,276 268,274 266,288 C 264,296 242,294 246,308"
          fill="none"
          stroke="url(#hlSnakeBody)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 246,308 C 250,320 268,316 266,330 C 264,340 244,338 254,354"
          fill="none"
          stroke="url(#hlSnakeBody)"
          strokeWidth="7.5"
          strokeLinecap="round"
        />
        {/* Serpent Head with eye */}
        <ellipse cx="239" cy="279" rx="5.5" ry="4" fill="#047857" transform="rotate(-25 239 279)" />
        <circle cx="237" cy="278" r="1.2" fill="#fef08a" />
        <circle cx="237" cy="278" r="0.6" fill="#0f172a" />
        {/* Serpent Tail */}
        <path d="M 254,354 L 257,363" stroke="#047857" strokeWidth="4.5" strokeLinecap="round" />
      </g>

      {/* 5. 3D Emerald Curved Ribbon Banner with "โรงพยาบาลท่าคันโท" */}
      <g filter={showShadow ? 'url(#hlSoft3DShadow)' : undefined}>
        {/* Left Ribbon Back Fold Wing with Orange Flame Tip */}
        <path d="M 108,356 L 72,374 L 76,420 L 118,404 Z" fill="#064e3b" />
        <path d="M 72,374 L 54,324 L 92,348 Z" fill="#0d9488" />
        <path d="M 94,380 C 86,366 112,352 118,386 C 110,400 100,390 94,380 Z" fill="url(#hlRibbonFlame)" stroke="#c2410c" strokeWidth="1.5" />

        {/* Right Ribbon Back Fold Wing with Orange Flame Tip */}
        <path d="M 404,356 L 440,374 L 436,420 L 394,404 Z" fill="#064e3b" />
        <path d="M 440,374 L 458,324 L 420,348 Z" fill="#0d9488" />
        <path d="M 418,380 C 426,366 400,352 394,386 C 402,400 412,390 418,380 Z" fill="url(#hlRibbonFlame)" stroke="#c2410c" strokeWidth="1.5" />

        {/* Front Curved Main Ribbon Body (Emerald Green 3D) */}
        <path
          d="M 88,370 C 138,448 374,448 424,370 L 442,408 C 384,496 128,496 70,408 Z"
          fill="url(#hlRibbon3D)"
          stroke="#0f766e"
          strokeWidth="1.5"
        />

        {/* 3D Bevel Top Highlight */}
        <path
          d="M 88,370 C 138,448 374,448 424,370"
          fill="none"
          stroke="#34d399"
          strokeWidth="3"
          opacity="0.85"
        />
        {/* 3D Bevel Bottom Rim */}
        <path
          d="M 70,408 C 128,496 384,496 442,408"
          fill="none"
          stroke="#022c22"
          strokeWidth="2.5"
          opacity="0.9"
        />

        {/* Perfectly Centered Curved Thai Text: "โรงพยาบาลท่าคันโท" */}
        <text
          fontFamily="'Prompt', 'Sarabun', 'Noto Sans Thai', sans-serif"
          fontWeight="800"
          fontSize="29"
          fill="#ffffff"
          letterSpacing="1.5"
          filter={showShadow ? 'url(#hlWhiteTextShadow)' : undefined}
        >
          <textPath href="#hlRibbonPath" startOffset="50%" textAnchor="middle">
            โรงพยาบาลท่าคันโท
          </textPath>
        </text>
      </g>
    </svg>
  );
};
