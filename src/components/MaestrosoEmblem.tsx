import React, { useState } from 'react';

interface MaestrosoEmblemProps {
  className?: string;
  size?: number; // size in px, default 48
  variant?: 'image' | 'vector';
}

/**
 * MaestrosoEmblem
 * Displays the user's uploaded Majestic Crown + Piano Keys emblem,
 * with vector SVG fallback.
 */
export function MaestrosoEmblem({ className = '', size = 48, variant = 'image' }: MaestrosoEmblemProps) {
  const [imgError, setImgError] = useState(false);

  if (variant === 'image' && !imgError) {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-md ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src="/logo.png"
          alt="Maestroso Piano Logo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain drop-shadow-md transition-transform hover:scale-105"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Magenta / Plum Crown Metallic Gradient */}
          <linearGradient id="crownGrad" x1="40" y1="30" x2="160" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C95BA0" />
            <stop offset="45%" stopColor="#963373" />
            <stop offset="75%" stopColor="#6E1E52" />
            <stop offset="100%" stopColor="#4A1037" />
          </linearGradient>

          {/* Crown Highlight Gradient */}
          <linearGradient id="crownHighlight" x1="50" y1="30" x2="150" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EFA4D4" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#AF3F83" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#571440" stopOpacity="0" />
          </linearGradient>

          {/* Piano Key 3D White Gradient */}
          <linearGradient id="whiteKeyGrad" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#F5F3F7" />
            <stop offset="90%" stopColor="#DDD8E2" />
            <stop offset="100%" stopColor="#BCB4C4" />
          </linearGradient>

          {/* Piano Key Inner Shadow/Depth Gradient */}
          <linearGradient id="keyShadowGrad" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E1024" />
            <stop offset="100%" stopColor="#301B3A" />
          </linearGradient>

          {/* Central Musical Note Plum Gradient */}
          <linearGradient id="noteGrad" x1="85" y1="35" x2="125" y2="115" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#DE72B5" />
            <stop offset="35%" stopColor="#B63E88" />
            <stop offset="75%" stopColor="#82205E" />
            <stop offset="100%" stopColor="#54123C" />
          </linearGradient>

          {/* Shield Outline Gradient */}
          <linearGradient id="shieldBorderGrad" x1="50" y1="70" x2="150" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#DE72B5" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#8E2D6A" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3D1231" stopOpacity="0.8" />
          </linearGradient>

          {/* Bevel Drop Shadow Filter */}
          <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0F0513" floodOpacity="0.75" />
          </filter>

          <filter id="glowMagenta" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer subtle backdrop glow */}
        <circle cx="100" cy="100" r="88" fill="url(#noteGrad)" opacity="0.08" />

        {/* ================= 1. PIANO KEYS SHIELD (LOWER EMBLEM) ================= */}
        {/* Shield Outer Container with 3D drop shadow */}
        <g filter="url(#dropShadow)">
          {/* Main shield contour */}
          <path
            d="M 68 76 L 132 76 L 132 128 L 100 154 L 68 128 Z"
            fill="url(#whiteKeyGrad)"
            stroke="url(#shieldBorderGrad)"
            strokeWidth="1.5"
          />

          {/* 3D Chamfer Edge on Shield Bottom */}
          <path
            d="M 68 128 L 100 154 L 132 128 L 128 128 L 100 150 L 72 128 Z"
            fill="#A39BAE"
            opacity="0.8"
          />

          {/* Black Key Cutouts creating the piano keyboard pattern */}
          {/* Black key 1 (Left) */}
          <path
            d="M 78 76 L 86 76 L 86 112 C 86 114 84 116 82 116 C 80 116 78 114 78 112 Z"
            fill="url(#keyShadowGrad)"
          />
          {/* Black key 1 highlight */}
          <path
            d="M 85 78 L 85 111"
            stroke="#634471"
            strokeWidth="0.8"
            opacity="0.6"
          />

          {/* Black key 2 (Right) */}
          <path
            d="M 114 76 L 122 76 L 122 112 C 122 114 120 116 118 116 C 116 116 114 114 114 112 Z"
            fill="url(#keyShadowGrad)"
          />
          {/* Black key 2 highlight */}
          <path
            d="M 121 78 L 121 111"
            stroke="#634471"
            strokeWidth="0.8"
            opacity="0.6"
          />

          {/* Middle dividing key line (gap between white keys) */}
          <line x1="100" y1="76" x2="100" y2="153" stroke="#9E94A8" strokeWidth="1.2" />
        </g>

        {/* ================= 2. REGAL MAJESTIC CROWN (TOP EMBLEM) ================= */}
        <g filter="url(#dropShadow)">
          {/* Crown Peak Pearl Spheres (Left, Center-Left Diamond, Right) */}
          {/* Left Orb */}
          <circle cx="61" cy="65" r="5.5" fill="url(#crownGrad)" stroke="#F0A6D6" strokeWidth="1" />
          <circle cx="59.5" cy="63.5" r="1.8" fill="#FFF" opacity="0.85" />

          {/* Right Orb */}
          <circle cx="139" cy="65" r="5.5" fill="url(#crownGrad)" stroke="#F0A6D6" strokeWidth="1" />
          <circle cx="137.5" cy="63.5" r="1.8" fill="#FFF" opacity="0.85" />

          {/* Center-Left Top Diamond Pip */}
          <path
            d="M 98 48 L 102 52 L 98 56 L 94 52 Z"
            fill="url(#crownGrad)"
            stroke="#F0A6D6"
            strokeWidth="0.8"
          />

          {/* Crown Ribbons & Arch Peaks forming the stylized 'M' */}
          <path
            d="M 61 68 
               C 66 74, 71 85, 82 89 
               C 92 82, 95 62, 98 55 
               L 98 76 
               L 102 76 
               L 102 55 
               C 105 62, 108 82, 118 89 
               C 129 85, 134 74, 139 68 
               L 134 94 
               C 123 88, 118 80, 112 76 
               L 100 84 
               L 88 76 
               C 82 80, 77 88, 66 94 
               Z"
            fill="url(#crownGrad)"
            stroke="url(#crownHighlight)"
            strokeWidth="1.2"
          />

          {/* Crown facet 3D bevel sheen lines */}
          <path
            d="M 61 68 L 82 89 L 88 76"
            stroke="#FFA8DC"
            strokeWidth="1"
            fill="none"
            opacity="0.7"
          />
          <path
            d="M 139 68 L 118 89 L 112 76"
            stroke="#FFA8DC"
            strokeWidth="1"
            fill="none"
            opacity="0.7"
          />
        </g>

        {/* ================= 3. REGAL MUSICAL NOTE (CENTERPIECE) ================= */}
        <g filter="url(#dropShadow)">
          {/* Note Stem rising from center into high crown */}
          <path
            d="M 100 95 L 107 95 L 107 38 C 107 36, 105 34, 103 35 C 101 36, 100 38, 100 41 Z"
            fill="url(#noteGrad)"
          />

          {/* Musical Flag / Tail swooping gracefully to the right */}
          <path
            d="M 107 38 
               C 114 36, 126 44, 125 58 
               C 124 67, 117 73, 117 76 
               C 121 70, 125 62, 124 54 
               C 123 44, 116 41, 107 38 Z"
            fill="url(#noteGrad)"
            stroke="#FFBBE2"
            strokeWidth="0.8"
          />

          {/* Note Head Oval positioned in middle of piano keyboard top */}
          <ellipse
            cx="96"
            cy="104"
            rx="12"
            ry="8.5"
            transform="rotate(-24 96 104)"
            fill="url(#noteGrad)"
            stroke="#FFA4DB"
            strokeWidth="1.2"
          />
          {/* Note Head 3D Highlight sheen */}
          <ellipse
            cx="94.5"
            cy="102"
            rx="7"
            ry="3.5"
            transform="rotate(-24 94.5 102)"
            fill="#FFA4DB"
            opacity="0.5"
          />
        </g>

        {/* ================= 4. BASELINE MINI PIANO DIVIDER ================= */}
        <g transform="translate(46, 168)">
          {/* Central mini keyboard flourish */}
          {/* Left horizontal line with taper */}
          <line x1="0" y1="4" x2="38" y2="4" stroke="url(#noteGrad)" strokeWidth="1.5" strokeLinecap="round" />
          
          {/* Mini keyboard block */}
          <rect x="40" y="0" width="28" height="8" rx="1.5" fill="url(#noteGrad)" />
          {/* Mini white keys */}
          <rect x="42" y="1" width="3.5" height="6" fill="#FFFFFF" rx="0.5" />
          <rect x="47" y="1" width="3.5" height="6" fill="#FFFFFF" rx="0.5" />
          <rect x="52" y="1" width="3.5" height="6" fill="#FFFFFF" rx="0.5" />
          <rect x="57" y="1" width="3.5" height="6" fill="#FFFFFF" rx="0.5" />
          <rect x="62" y="1" width="3.5" height="6" fill="#FFFFFF" rx="0.5" />
          {/* Mini black keys */}
          <rect x="44.5" y="1" width="1.8" height="3.8" fill="#3D1231" />
          <rect x="49.5" y="1" width="1.8" height="3.8" fill="#3D1231" />
          <rect x="59.5" y="1" width="1.8" height="3.8" fill="#3D1231" />
          
          {/* Right horizontal line with taper */}
          <line x1="70" y1="4" x2="108" y2="4" stroke="url(#noteGrad)" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
