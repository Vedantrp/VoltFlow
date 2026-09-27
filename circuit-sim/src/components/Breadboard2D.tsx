import React from 'react';

interface Breadboard2DProps {
  type: 'breadboard-mini' | 'breadboard-half' | 'breadboard-full';
  width: number;
  height: number;
}

/**
 * Tinkercad-exact 2.5D Solderless Breadboard Renderer
 * Features:
 * - Real ABS plastic texture with 3D bevel and drop shadow
 * - Dovetail interlocking tabs on perimeter
 * - Inset central DIP divider trough with depth shadow
 * - Dual spring-clip leaf terminals inside every tie-point socket hole
 * - Authentic red (+) and blue (-) power rails
 * - Crisp row numbers and column letters
 */
export const Breadboard2D: React.FC<Breadboard2DProps> = ({ type, width, height }) => {
  // Shared clip hole renderer for Tinkercad realism
  const renderClipHole = (x: number, y: number, key: string, size = 4) => {
    const half = size / 2;
    return (
      <g key={key}>
        {/* Beveled plastic hole frame */}
        <rect
          x={x - half}
          y={y - half}
          width={size}
          height={size}
          rx={0.8}
          fill="#1e293b"
          stroke="#94a3b8"
          strokeWidth={0.5}
        />
        {/* Internal metallic spring clip leaf pair */}
        <path
          d={`M ${x - half + 0.9} ${y - half + 0.8} Q ${x - half + 1.4} ${y} ${x - half + 0.9} ${y + half - 0.8}`}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth={0.6}
        />
        <path
          d={`M ${x + half - 0.9} ${y - half + 0.8} Q ${x + half - 1.4} ${y} ${x + half - 0.9} ${y + half - 0.8}`}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth={0.6}
        />
      </g>
    );
  };

  // 1. MINI BREADBOARD (170 tie points, 17 cols x 10 rows)
  if (type === 'breadboard-mini') {
    const cols = 17;
    const startX = 22;
    const stepX = 9.3;

    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 200 120"
        style={{
          pointerEvents: 'none',
          overflow: 'visible',
          filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.35)) drop-shadow(0 1px 3px rgba(0,0,0,0.2))',
        }}
      >
        <defs>
          <linearGradient id="miniBbBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="15%" stopColor="#f8fafc" />
            <stop offset="85%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
          <linearGradient id="troughGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="50%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
        </defs>

        {/* 3D Chamfer Base Shadow */}
        <rect x="0" y="2" width="200" height="118" rx="7" fill="#94a3b8" />

        {/* Interlocking Dovetail Tabs */}
        {/* Left tabs */}
        <path d="M 0 35 L -4 38 L -4 52 L 0 55 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.8" />
        <path d="M 0 65 L -4 68 L -4 82 L 0 85 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.8" />
        {/* Right tabs */}
        <path d="M 200 35 L 204 38 L 204 52 L 200 55 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.8" />
        <path d="M 200 65 L 204 68 L 204 82 L 200 85 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.8" />

        {/* Main Ivory ABS Plastic Body */}
        <rect
          x="0"
          y="0"
          width="200"
          height="118"
          rx="6"
          fill="url(#miniBbBody)"
          stroke="#cbd5e1"
          strokeWidth="1.2"
        />

        {/* Center Recessed IC Trough */}
        <rect x="10" y="55" width="180" height="9" rx="1.5" fill="url(#troughGrad)" stroke="#94a3b8" strokeWidth="0.5" />
        <text
          x="100"
          y="61.5"
          fill="#64748b"
          fontSize="5.5"
          fontWeight="800"
          fontFamily="system-ui, sans-serif"
          letterSpacing="0.6"
          textAnchor="middle"
        >
          MINI BREADBOARD 170
        </text>

        {/* Row Labels (a-e, f-j) */}
        {['a', 'b', 'c', 'd', 'e'].map((letter, i) => (
          <text
            key={`lbl-t-${letter}`}
            x="9"
            y={20.5 + i * 7.5}
            fill="#475569"
            fontSize="6.5"
            fontWeight="700"
            fontFamily="monospace"
          >
            {letter}
          </text>
        ))}
        {['f', 'g', 'h', 'i', 'j'].map((letter, i) => (
          <text
            key={`lbl-b-${letter}`}
            x="9"
            y={70.5 + i * 7.5}
            fill="#475569"
            fontSize="6.5"
            fontWeight="700"
            fontFamily="monospace"
          >
            {letter}
          </text>
        ))}

        {/* Column Numbers (1, 5, 10, 15, 17) */}
        {[1, 5, 10, 15, 17].map((num) => {
          const posX = startX + (num - 1) * stepX;
          return (
            <React.Fragment key={`col-num-${num}`}>
              <text x={posX} y="11" fill="#475569" fontSize="6.5" fontWeight="700" fontFamily="sans-serif" textAnchor="middle">
                {num}
              </text>
              <text x={posX} y="112" fill="#475569" fontSize="6.5" fontWeight="700" fontFamily="sans-serif" textAnchor="middle">
                {num}
              </text>
            </React.Fragment>
          );
        })}

        {/* Sockets with Internal Spring Clips */}
        {Array.from({ length: cols }).map((_, col) => {
          const posX = startX + col * stepX;
          return (
            <g key={`col-${col}`}>
              {/* Bank A (Rows a-e) */}
              {Array.from({ length: 5 }).map((_, row) => {
                const posY = 18 + row * 7.5;
                return renderClipHole(posX, posY, `hole-t-${col}-${row}`, 3.8);
              })}
              {/* Bank B (Rows f-j) */}
              {Array.from({ length: 5 }).map((_, row) => {
                const posY = 68 + row * 7.5;
                return renderClipHole(posX, posY, `hole-b-${col}-${row}`, 3.8);
              })}
            </g>
          );
        })}
      </svg>
    );
  }

  // 2. FULL BREADBOARD (830 tie points, 63 cols)
  if (type === 'breadboard-full') {
    const cols = 63;
    const startX = 25;
    const stepX = 10;

    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 680 180"
        style={{
          pointerEvents: 'none',
          overflow: 'visible',
          filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.38)) drop-shadow(0 2px 5px rgba(0,0,0,0.2))',
        }}
      >
        <defs>
          <linearGradient id="fullBbBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="10%" stopColor="#f8fafc" />
            <stop offset="85%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
          <linearGradient id="troughFull" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="50%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
        </defs>

        {/* 3D Chamfer Depth */}
        <rect x="0" y="3" width="680" height="177" rx="8" fill="#94a3b8" />

        {/* Dovetail interlocking tabs */}
        <path d="M 0 50 L -6 54 L -6 76 L 0 80 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
        <path d="M 0 100 L -6 104 L -6 126 L 0 130 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
        <path d="M 680 50 L 686 54 L 686 76 L 680 80 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
        <path d="M 680 100 L 686 104 L 686 126 L 680 130 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />

        {/* Main Ivory ABS Body */}
        <rect
          x="0"
          y="0"
          width="680"
          height="177"
          rx="7"
          fill="url(#fullBbBody)"
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />

        {/* Top Power Rails (Red + and Blue -) */}
        <line x1="18" y1="14" x2="662" y2="14" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        <line x1="18" y1="28" x2="662" y2="28" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
        <text x="8" y="17.5" fill="#ef4444" fontSize="11" fontWeight="900" fontFamily="sans-serif">+</text>
        <text x="8" y="31.5" fill="#3b82f6" fontSize="11" fontWeight="900" fontFamily="sans-serif">-</text>
        <text x="671" y="17.5" fill="#ef4444" fontSize="11" fontWeight="900" fontFamily="sans-serif">+</text>
        <text x="671" y="31.5" fill="#3b82f6" fontSize="11" fontWeight="900" fontFamily="sans-serif">-</text>

        {/* Center Recessed IC Trough */}
        <rect x="12" y="85" width="656" height="10" rx="2" fill="url(#troughFull)" stroke="#94a3b8" strokeWidth="0.6" />
        <text
          x="340"
          y="92.5"
          fill="#64748b"
          fontSize="7.5"
          fontWeight="800"
          fontFamily="system-ui, sans-serif"
          letterSpacing="0.8"
          textAnchor="middle"
        >
          FULL SOLDERLESS BREADBOARD (830 TIE-POINTS)
        </text>

        {/* Bottom Power Rails (Red + and Blue -) */}
        <line x1="18" y1="148" x2="662" y2="148" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        <line x1="18" y1="162" x2="662" y2="162" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
        <text x="8" y="151.5" fill="#ef4444" fontSize="11" fontWeight="900" fontFamily="sans-serif">+</text>
        <text x="8" y="165.5" fill="#3b82f6" fontSize="11" fontWeight="900" fontFamily="sans-serif">-</text>
        <text x="671" y="151.5" fill="#ef4444" fontSize="11" fontWeight="900" fontFamily="sans-serif">+</text>
        <text x="671" y="165.5" fill="#3b82f6" fontSize="11" fontWeight="900" fontFamily="sans-serif">-</text>

        {/* Row Labels (a-e, f-j) */}
        {['a', 'b', 'c', 'd', 'e'].map((letter, i) => (
          <React.Fragment key={`lbl-top-${letter}`}>
            <text x="12" y={41.5 + i * 8.5} fill="#475569" fontSize="7.5" fontWeight="700" fontFamily="monospace">{letter}</text>
            <text x="668" y={41.5 + i * 8.5} fill="#475569" fontSize="7.5" fontWeight="700" fontFamily="monospace" textAnchor="end">{letter}</text>
          </React.Fragment>
        ))}
        {['f', 'g', 'h', 'i', 'j'].map((letter, i) => (
          <React.Fragment key={`lbl-bot-${letter}`}>
            <text x="12" y={103.5 + i * 8.5} fill="#475569" fontSize="7.5" fontWeight="700" fontFamily="monospace">{letter}</text>
            <text x="668" y={103.5 + i * 8.5} fill="#475569" fontSize="7.5" fontWeight="700" fontFamily="monospace" textAnchor="end">{letter}</text>
          </React.Fragment>
        ))}

        {/* Column Numbers */}
        {[1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 63].map((num) => {
          const posX = startX + (num - 1) * stepX;
          return (
            <React.Fragment key={`col-num-${num}`}>
              <text x={posX} y="10" fill="#475569" fontSize="6.5" fontWeight="700" fontFamily="sans-serif" textAnchor="middle">{num}</text>
              <text x={posX} y="174" fill="#475569" fontSize="6.5" fontWeight="700" fontFamily="sans-serif" textAnchor="middle">{num}</text>
            </React.Fragment>
          );
        })}

        {/* Spring Clip Holes */}
        {Array.from({ length: cols }).map((_, col) => {
          const posX = startX + col * stepX;
          return (
            <g key={`col-${col}`}>
              {renderClipHole(posX, 14, `vcc-t-${col}`, 4)}
              {renderClipHole(posX, 28, `gnd-t-${col}`, 4)}

              {Array.from({ length: 5 }).map((_, row) => renderClipHole(posX, 39 + row * 8.5, `h-t-${col}-${row}`, 4))}
              {Array.from({ length: 5 }).map((_, row) => renderClipHole(posX, 101 + row * 8.5, `h-b-${col}-${row}`, 4))}

              {renderClipHole(posX, 148, `vcc-b-${col}`, 4)}
              {renderClipHole(posX, 162, `gnd-b-${col}`, 4)}
            </g>
          );
        })}
      </svg>
    );
  }

  // 3. HALF / MEDIUM BREADBOARD (400 tie points, 30 cols)
  const cols = 30;
  const startX = 30;
  const stepX = 9.5;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 340 180"
      style={{
        pointerEvents: 'none',
        overflow: 'visible',
        filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.38)) drop-shadow(0 2px 5px rgba(0,0,0,0.2))',
      }}
    >
      <defs>
        <linearGradient id="halfBbBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="12%" stopColor="#f8fafc" />
          <stop offset="85%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
        <linearGradient id="troughHalf" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="50%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>

      {/* 3D Chamfer Depth Base */}
      <rect x="0" y="3" width="340" height="177" rx="8" fill="#94a3b8" />

      {/* Dovetail tabs on sides */}
      <path d="M 0 50 L -5 54 L -5 76 L 0 80 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
      <path d="M 0 100 L -5 104 L -5 126 L 0 130 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
      <path d="M 340 50 L 345 54 L 345 76 L 340 80 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
      <path d="M 340 100 L 345 104 L 345 126 L 340 130 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />

      {/* Main Ivory Body */}
      <rect
        x="0"
        y="0"
        width="340"
        height="177"
        rx="7"
        fill="url(#halfBbBody)"
        stroke="#cbd5e1"
        strokeWidth="1.5"
      />

      {/* Top Power Rails (Red + and Blue -) */}
      <line x1="18" y1="14" x2="322" y2="14" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="28" x2="322" y2="28" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
      <text x="8" y="17.5" fill="#ef4444" fontSize="11" fontWeight="900" fontFamily="sans-serif">+</text>
      <text x="8" y="31.5" fill="#3b82f6" fontSize="11" fontWeight="900" fontFamily="sans-serif">-</text>
      <text x="331" y="17.5" fill="#ef4444" fontSize="11" fontWeight="900" fontFamily="sans-serif">+</text>
      <text x="331" y="31.5" fill="#3b82f6" fontSize="11" fontWeight="900" fontFamily="sans-serif">-</text>

      {/* Center Recessed IC Trough */}
      <rect x="14" y="85" width="312" height="10" rx="2" fill="url(#troughHalf)" stroke="#94a3b8" strokeWidth="0.6" />
      <text
        x="170"
        y="92.5"
        fill="#64748b"
        fontSize="7"
        fontWeight="800"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.8"
        textAnchor="middle"
      >
        MEDIUM SOLDERLESS BREADBOARD (400 TIE-POINTS)
      </text>

      {/* Bottom Power Rails (Red + and Blue -) */}
      <line x1="18" y1="148" x2="322" y2="148" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="162" x2="322" y2="162" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
      <text x="8" y="151.5" fill="#ef4444" fontSize="11" fontWeight="900" fontFamily="sans-serif">+</text>
      <text x="8" y="165.5" fill="#3b82f6" fontSize="11" fontWeight="900" fontFamily="sans-serif">-</text>
      <text x="331" y="151.5" fill="#ef4444" fontSize="11" fontWeight="900" fontFamily="sans-serif">+</text>
      <text x="331" y="165.5" fill="#3b82f6" fontSize="11" fontWeight="900" fontFamily="sans-serif">-</text>

      {/* Row Labels (a-e, f-j) */}
      {['a', 'b', 'c', 'd', 'e'].map((letter, i) => (
        <React.Fragment key={`lbl-top-${letter}`}>
          <text x="12" y={41.5 + i * 8.5} fill="#475569" fontSize="7.5" fontWeight="700" fontFamily="monospace">{letter}</text>
          <text x="328" y={41.5 + i * 8.5} fill="#475569" fontSize="7.5" fontWeight="700" fontFamily="monospace" textAnchor="end">{letter}</text>
        </React.Fragment>
      ))}
      {['f', 'g', 'h', 'i', 'j'].map((letter, i) => (
        <React.Fragment key={`lbl-bot-${letter}`}>
          <text x="12" y={103.5 + i * 8.5} fill="#475569" fontSize="7.5" fontWeight="700" fontFamily="monospace">{letter}</text>
          <text x="328" y={103.5 + i * 8.5} fill="#475569" fontSize="7.5" fontWeight="700" fontFamily="monospace" textAnchor="end">{letter}</text>
        </React.Fragment>
      ))}

      {/* Column Numbers */}
      {[1, 5, 10, 15, 20, 25, 30].map((num) => {
        const posX = startX + (num - 1) * stepX;
        return (
          <React.Fragment key={`col-num-${num}`}>
            <text x={posX} y="10" fill="#475569" fontSize="6.5" fontWeight="700" fontFamily="sans-serif" textAnchor="middle">{num}</text>
            <text x={posX} y="174" fill="#475569" fontSize="6.5" fontWeight="700" fontFamily="sans-serif" textAnchor="middle">{num}</text>
          </React.Fragment>
        );
      })}

      {/* Spring Clip Holes */}
      {Array.from({ length: cols }).map((_, col) => {
        const posX = startX + col * stepX;
        return (
          <g key={`col-${col}`}>
            {renderClipHole(posX, 14, `vcc-t-${col}`, 4)}
            {renderClipHole(posX, 28, `gnd-t-${col}`, 4)}

            {Array.from({ length: 5 }).map((_, row) => renderClipHole(posX, 39 + row * 8.5, `h-t-${col}-${row}`, 4))}
            {Array.from({ length: 5 }).map((_, row) => renderClipHole(posX, 101 + row * 8.5, `h-b-${col}-${row}`, 4))}

            {renderClipHole(posX, 148, `vcc-b-${col}`, 4)}
            {renderClipHole(posX, 162, `gnd-b-${col}`, 4)}
          </g>
        );
      })}
    </svg>
  );
};
