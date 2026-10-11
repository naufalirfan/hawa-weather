"use client";

import React from "react";

export type TimePhase = "pagi" | "siang" | "sore" | "malam";

interface WeatherVisualProps {
  phase: TimePhase;
  weatherCode?: number;
  className?: string;
  onClick?: () => void;
  tilt?: { x: number; y: number };
}

export function WeatherVisual({
  phase,
  weatherCode = 0,
  className = "",
  onClick,
  tilt = { x: 0, y: 0 },
}: WeatherVisualProps) {
  const isRain = [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode);
  const isStorm = [95, 96, 99].includes(weatherCode);

  return (
    <div
      onClick={onClick}
      className={`relative select-none cursor-pointer group flex items-center justify-center ${className}`}
      style={{
        perspective: "900px",
      }}
      title="Klik untuk ubah waktu (Pagi/Siang/Sore/Malam)"
    >
      {/* Dynamic ambient backdrop aura */}
      <div
        className="absolute -inset-4 rounded-full blur-3xl opacity-60 transition-all duration-700 pointer-events-none"
        style={{
          background:
            phase === "pagi"
              ? "radial-gradient(circle, rgba(251,146,60,0.45) 0%, rgba(244,114,182,0.2) 50%, transparent 75%)"
              : phase === "siang"
              ? "radial-gradient(circle, rgba(253,224,71,0.5) 0%, rgba(56,189,248,0.25) 50%, transparent 75%)"
              : phase === "sore"
              ? "radial-gradient(circle, rgba(249,115,22,0.5) 0%, rgba(168,85,247,0.3) 50%, transparent 75%)"
              : "radial-gradient(circle, rgba(129,140,248,0.45) 0%, rgba(99,102,241,0.2) 50%, transparent 75%)",
        }}
      />

      {/* Main 3D Container with interactive tilt */}
      <div
        className="relative w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60 transition-transform duration-200 ease-out flex items-center justify-center"
        style={{
          transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        }}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-2xl overflow-visible"
        >
          <defs>
            {/* Gradients for Moon (Malam - purple/violet matching user image) */}
            <linearGradient id="moonGrad" x1="85%" y1="15%" x2="20%" y2="85%">
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="45%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>

            {/* Gradients for Morning Sun (Pagi) */}
            <linearGradient id="pagiSun" x1="30%" y1="10%" x2="70%" y2="90%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="40%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>

            {/* Gradients for Midday Sun (Siang) */}
            <radialGradient id="siangSun" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#FEF08A" />
              <stop offset="70%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </radialGradient>

            {/* Gradients for Sunset Sun (Sore) */}
            <linearGradient id="soreSun" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="30%" stopColor="#FB923C" />
              <stop offset="75%" stopColor="#E11D48" />
              <stop offset="100%" stopColor="#7C2D12" />
            </linearGradient>

            {/* Gradients for 3D Puffy Cloud */}
            <linearGradient id="cloudGrad" x1="30%" y1="10%" x2="70%" y2="90%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="55%" stopColor="#F1F5F9" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>

            {/* Cloud shadow filter */}
            <filter id="cloudShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="-2" dy="8" stdDeviation="6" floodColor="#060913" floodOpacity="0.5" />
            </filter>

            {/* Glow filter */}
            <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ===== 1. MALAM: Crescent Moon (Matched with Reference Image) ===== */}
          {phase === "malam" && (
            <g className="transition-all duration-700 ease-out origin-center">
              {/* Moon Glow Aura */}
              <circle cx="115" cy="85" r="48" fill="url(#moonGrad)" opacity="0.25" filter="url(#softGlow)" />
              
              {/* Crescent Moon Path - Elegant curved crescent */}
              <path
                d="M 132,32 
                   C 152,65 158,105 138,138 
                   C 120,165 78,172 45,138 
                   C 72,154 114,142 126,106 
                   C 134,80 124,52 132,32 Z"
                fill="url(#moonGrad)"
                filter="drop-shadow(0 6px 16px rgba(124, 58, 237, 0.55))"
                className="animate-[pulse_4s_ease-in-out_infinite]"
              />

              {/* Twinkling ambient night stars */}
              <circle cx="42" cy="52" r="2.2" fill="#E0E7FF" className="animate-ping opacity-75" style={{ animationDuration: "3s" }} />
              <circle cx="155" cy="38" r="1.8" fill="#DDD6FE" className="animate-pulse opacity-90" />
              <circle cx="170" cy="75" r="1.6" fill="#DDD6FE" className="animate-pulse opacity-80" />
              <circle cx="34" cy="105" r="2" fill="#E0E7FF" className="animate-ping opacity-60" style={{ animationDuration: "4s" }} />
            </g>
          )}

          {/* ===== 2. PAGI: Dawn Sun rising ===== */}
          {phase === "pagi" && (
            <g className="transition-all duration-700 ease-out origin-center">
              {/* Dawn Horizon Rays */}
              <g opacity="0.4" className="animate-[spin_30s_linear_infinite] origin-[90px_80px]">
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                  <line
                    key={deg}
                    x1="90"
                    y1="80"
                    x2={90 + 64 * Math.cos((deg * Math.PI) / 180)}
                    y2={80 + 64 * Math.sin((deg * Math.PI) / 180)}
                    stroke="#FBBF24"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                  />
                ))}
              </g>
              <circle cx="90" cy="80" r="44" fill="url(#pagiSun)" filter="url(#softGlow)" opacity="0.35" />
              <circle
                cx="90"
                cy="80"
                r="38"
                fill="url(#pagiSun)"
                filter="drop-shadow(0 6px 16px rgba(249, 115, 22, 0.5))"
              />
            </g>
          )}

          {/* ===== 3. SIANG: Radiant Midday Sun ===== */}
          {phase === "siang" && (
            <g className="transition-all duration-700 ease-out origin-center">
              {/* Solar corona halo */}
              <circle
                cx="90"
                cy="78"
                r="46"
                fill="url(#siangSun)"
                opacity="0.3"
                className="animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]"
              />
              {/* Rotating sharp corona rays */}
              <g opacity="0.6" className="animate-[spin_20s_linear_infinite] origin-[90px_78px]">
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                  <line
                    key={deg}
                    x1="90"
                    y1="78"
                    x2={90 + 60 * Math.cos((deg * Math.PI) / 180)}
                    y2={78 + 60 * Math.sin((deg * Math.PI) / 180)}
                    stroke="#FDE047"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                ))}
              </g>
              <circle
                cx="90"
                cy="78"
                r="38"
                fill="url(#siangSun)"
                filter="drop-shadow(0 0 22px rgba(245, 158, 11, 0.65))"
              />
            </g>
          )}

          {/* ===== 4. SORE: Sunset Twilight Sun ===== */}
          {phase === "sore" && (
            <g className="transition-all duration-700 ease-out origin-center">
              <ellipse cx="90" cy="92" rx="64" ry="16" fill="#F97316" opacity="0.3" filter="url(#softGlow)" />
              <circle cx="90" cy="85" r="42" fill="url(#soreSun)" opacity="0.35" filter="url(#softGlow)" />
              <circle
                cx="90"
                cy="85"
                r="38"
                fill="url(#soreSun)"
                filter="drop-shadow(0 6px 18px rgba(225, 29, 72, 0.55))"
              />
            </g>
          )}

          {/* ===== 3D PUFFY CLOUD (Layered in front) ===== */}
          <g
            className="transition-all duration-500 ease-out animate-[drift_6s_ease-in-out_infinite]"
            filter="url(#cloudShadow)"
            transform="translate(16, 12)"
          >
            {/* Puffy Cloud Silhouette */}
            <path
              d="M 68,138 
                 C 50,138 38,126 38,111 
                 C 38,98 48,87 62,86 
                 C 66,70 80,60 98,60 
                 C 115,60 128,70 132,85 
                 C 135,84 139,84 142,84 
                 C 156,84 168,95 168,109 
                 C 168,123 156,134 142,135 
                 C 137,137 122,138 112,138 
                 Z"
              fill="url(#cloudGrad)"
            />

            {/* Cloud Top Soft Lighting Arc */}
            <path
              d="M 63,87 
                 C 67,72 81,62 98,62 
                 C 114,62 127,72 131,86 
                 C 135,85 139,85 142,85 
                 C 153,85 163,93 165,104 
                 C 155,95 140,89 126,89 
                 C 108,89 91,74 63,87 Z"
              fill="#FFFFFF"
              opacity="0.75"
            />
          </g>

          {/* ===== RAINDROPS IF RAINING ===== */}
          {isRain && (
            <g className="animate-[pulse_1.5s_ease-in-out_infinite]" transform="translate(16, 12)">
              {[
                { x: 58, y: 148 },
                { x: 78, y: 154 },
                { x: 98, y: 148 },
                { x: 118, y: 154 },
                { x: 138, y: 148 },
              ].map((drop, i) => (
                <line
                  key={i}
                  x1={drop.x}
                  y1={drop.y}
                  x2={drop.x - 4}
                  y2={drop.y + 12}
                  stroke="#93C5FD"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.85"
                />
              ))}
            </g>
          )}

          {/* ===== LIGHTNING BOLT IF STORM ===== */}
          {isStorm && (
            <path
              d="M 112,150 L 104,168 L 112,168 L 106,186 L 122,164 L 114,164 Z"
              fill="#FDE047"
              filter="drop-shadow(0 0 10px rgba(253, 224, 71, 0.9))"
              className="animate-pulse"
            />
          )}
        </svg>

        {/* Phase Pill Tag */}
        <div className="absolute -bottom-2 px-3 py-0.5 rounded-full glass border border-white/10 text-[10px] font-mono uppercase tracking-wider text-[var(--glow)] shadow-md group-hover:scale-105 transition-transform">
          {phase === "pagi"
            ? "🌅 Pagi"
            : phase === "siang"
            ? "☀️ Siang"
            : phase === "sore"
            ? "🌇 Sore"
            : "🌙 Malam"}
        </div>
      </div>
    </div>
  );
}