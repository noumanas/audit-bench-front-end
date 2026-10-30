/**
 * Auth-screen illustration: a pull request rolls up its branch to a merge
 * gate, gets scanned, is held while findings are open (red lamp, "blocked"
 * chip), then the lamp goes green, the gate slides open and the commit
 * merges into main. One 9s loop driven by the .mg-* keyframes in
 * globals.css (shared with PrChecksCard, which narrates the same loop);
 * under prefers-reduced-motion it rests on the "blocked" frame.
 */
export function MergeGateArt({ className }: { className?: string }) {
  return (
    <svg viewBox="30 36 370 386" className={className} aria-hidden="true" fill="none">
      <defs>
        <linearGradient id="mg-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8fb0ff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#8fb0ff" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id="mg-post" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e8ecf4" />
          <stop offset="1" stopColor="#9aa8c4" />
        </linearGradient>
        <linearGradient id="mg-track" gradientUnits="userSpaceOnUse" x1="0" y1="422" x2="0" y2="74">
          <stop offset="0" stopColor="#6d8cf5" stopOpacity="0" />
          <stop offset="0.35" stopColor="#6d8cf5" stopOpacity="0.8" />
          <stop offset="1" stopColor="#8fb0ff" />
        </linearGradient>
        <filter id="mg-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#000" floodOpacity="0.5" />
        </filter>
        <pattern id="mg-hazard" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="12" height="12" fill="#fff" />
          <rect width="6" height="12" fill="#ff3b5c" />
        </pattern>
        <clipPath id="mg-opening">
          <rect x="136" y="188" width="148" height="64" />
        </clipPath>
      </defs>

      {/* main branch */}
      <path d="M-10 74H430" stroke="#4a76f0" strokeWidth="3" strokeLinecap="round" />
      <text x="44" y="58" className="font-mono" fontSize="11" fontWeight="700" fill="#8fb0ff" letterSpacing="1.2">
        MAIN
      </text>
      {[60, 130, 290, 360].map((x) => (
        <circle key={x} cx={x} cy="74" r="6" fill="#10141c" stroke="#4a76f0" strokeWidth="3" />
      ))}
      <circle cx="210" cy="74" r="8" fill="#8fb0ff" />
      <circle cx="210" cy="74" r="8" stroke="#8fb0ff" strokeWidth="2" className="mg-pulse" />

      {/* feature branch track */}
      <path d="M210 422V74" stroke="url(#mg-track)" strokeWidth="3" strokeDasharray="2 7" strokeLinecap="round" />
      <text x="230" y="356" className="font-mono" fontSize="10" fontWeight="700" fill="#8b96ab" letterSpacing="1">
        feat/checkout
      </text>

      {/* gate frame */}
      <g filter="url(#mg-shadow)">
        <rect x="118" y="164" width="184" height="16" rx="8" fill="url(#mg-post)" />
        <rect x="120" y="170" width="16" height="94" rx="6" fill="url(#mg-post)" />
        <rect x="284" y="170" width="16" height="94" rx="6" fill="url(#mg-post)" />
        <rect x="200" y="146" width="20" height="20" rx="6" fill="#e8ecf4" />
      </g>
      <text x="150" y="175.5" className="font-mono" fontSize="7.5" fontWeight="800" fill="#2b5be3" letterSpacing="1.4">
        MERGE
      </text>
      <text x="234" y="175.5" className="font-mono" fontSize="7.5" fontWeight="800" fill="#2b5be3" letterSpacing="1.4">
        GATE
      </text>
      <circle cx="210" cy="152" r="16" fill="#ff5470" className="mg-red mg-glow" />
      <circle cx="210" cy="152" r="16" fill="#3ee08f" className="mg-green mg-glow" />
      <circle cx="210" cy="152" r="6.5" fill="#ff3b5c" stroke="#fff" strokeWidth="2" className="mg-red" />
      <circle cx="210" cy="152" r="6.5" fill="#22c97a" stroke="#fff" strokeWidth="2" className="mg-green" />

      {/* sliding doors, clipped to the opening */}
      <g clipPath="url(#mg-opening)">
        {[
          { x: 136, cls: 'mg-door-l' },
          { x: 210, cls: 'mg-door-r' },
        ].map(({ x, cls }) => (
          <g key={cls} className={cls}>
            <rect x={x + 1} y="189" width="72" height="62" rx="5" fill="url(#mg-glass)" stroke="#8fb0ff" strokeOpacity="0.6" strokeWidth="1.5" />
            <rect x={x + 10} y="200" width="34" height="4" rx="2" fill="#e8ecf4" fillOpacity="0.6" />
            <rect x={x + 10} y="210" width="50" height="4" rx="2" fill="#e8ecf4" fillOpacity="0.35" />
            <rect x={x + 18} y="220" width="28" height="4" rx="2" fill="#e8ecf4" fillOpacity="0.35" />
            <rect x={x + 10} y="230" width="44" height="4" rx="2" fill="#e8ecf4" fillOpacity="0.35" />
            <rect x={x + 1} y="243" width="72" height="8" fill="url(#mg-hazard)" fillOpacity="0.9" />
          </g>
        ))}
        {/* findings flagged on the code */}
        <g className="mg-flag">
          <rect x="144" y="207" width="58" height="8" rx="2" fill="#ff3b5c" fillOpacity="0.7" />
          <rect x="226" y="228" width="50" height="8" rx="2" fill="#ff3b5c" fillOpacity="0.7" />
        </g>
        <rect x="136" y="186" width="148" height="3" fill="#8fb0ff" className="mg-scan" />
      </g>

      {/* PR token */}
      <g className="mg-token">
        <circle cx="210" cy="400" r="17" fill="#fff" filter="url(#mg-shadow)" />
        <g stroke="#2b5be3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="204" cy="394" r="2.4" />
          <circle cx="204" cy="406" r="2.4" />
          <circle cx="216" cy="406" r="2.4" />
          <path d="M204 396.4v7.2M216 403.6V397a3 3 0 0 0-3-3h-4.5m2-2-2 2 2 2" />
        </g>
      </g>

    </svg>
  );
}
