import { LitElement, html, css } from 'lit';

/**
 * VoltFlow Stepper Motor (NEMA 17 Bipolar)
 * 140 × 140 px, 4-Pin terminal header (A+, A-, B+, B-)
 * Interactive step / angle rotation indicators
 */
export class VoltFlowStepperMotorElement extends LitElement {
  static properties = {
    angle: { type: Number },
    step: { type: Number },
    speed: { type: Number },
    isRunning: { type: Boolean },
  };

  angle = 0;
  step = 0;
  speed = 0;
  isRunning = false;

  readonly pinInfo = [
    { name: 'A+', x: 25, y: 130 },
    { name: 'A-', x: 55, y: 130 },
    { name: 'B+', x: 85, y: 130 },
    { name: 'B-', x: 115, y: 130 },
  ];

  static styles = css`
    :host {
      display: inline-block;
      width: 140px;
      height: 140px;
      user-select: none;
    }
    svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }
  `;

  render() {
    const rotAngle = (this.angle % 360 + 360) % 360;

    return html`
      <svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="nema-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="rgba(0,0,0,0.45)" />
          </filter>
          <linearGradient id="nema-body" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#334155" />
            <stop offset="50%" stop-color="#1e293b" />
            <stop offset="100%" stop-color="#0f172a" />
          </linearGradient>
          <linearGradient id="nema-metal-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f8fafc" />
            <stop offset="40%" stop-color="#cbd5e1" />
            <stop offset="80%" stop-color="#94a3b8" />
            <stop offset="100%" stop-color="#64748b" />
          </linearGradient>
        </defs>

        <!-- Main Square Body Casing -->
        <rect x="6" y="6" width="128" height="114" rx="8" fill="url(#nema-body)" stroke="#0f172a" stroke-width="2" filter="url(#nema-shadow)" />

        <!-- 4 Metallic Corner Screws / Flanges -->
        ${[
          { cx: 16, cy: 16 },
          { cx: 124, cy: 16 },
          { cx: 16, cy: 110 },
          { cx: 124, cy: 110 },
        ].map(
          (c) => html`
            <circle cx="${c.cx}" cy="${c.cy}" r="5.5" fill="#475569" stroke="#334155" stroke-width="1" />
            <circle cx="${c.cx}" cy="${c.cy}" r="3.2" fill="#0f172a" />
          `
        )}

        <!-- Outer Silver Raised Rotor Plate -->
        <circle cx="70" cy="63" r="42" fill="url(#nema-metal-ring)" stroke="#475569" stroke-width="1.5" />
        <circle cx="70" cy="63" r="35" fill="#1e293b" stroke="#0f172a" stroke-width="1" />

        <!-- 12 Compass Degree Ticks (Every 30°) -->
        ${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
          (deg) => html`
            <line
              x1="70"
              y1="29"
              x2="70"
              y2="33"
              stroke="#64748b"
              stroke-width="1.2"
              transform="rotate(${deg} 70 63)"
            />
          `
        )}

        <!-- Center Rotatable D-Shaft & Pointer Arm -->
        <g transform="rotate(${rotAngle} 70 63)">
          <!-- D-Cut Shaft Hub -->
          <circle cx="70" cy="63" r="14" fill="url(#nema-metal-ring)" stroke="#475569" stroke-width="1" />
          <!-- Flat D-cut side -->
          <path d="M 64 51 L 76 51 A 14 14 0 0 1 64 51 Z" fill="#475569" />

          <!-- Bright Red Shaft Pointer Arm -->
          <path d="M 67 63 L 73 63 L 71 30 L 69 30 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="0.8" />
          <circle cx="70" cy="30" r="2.5" fill="#fef08a" />
          <circle cx="70" cy="63" r="4" fill="#0f172a" stroke="#475569" stroke-width="1" />
        </g>

        <!-- Silkscreen Brand & Angle Badge -->
        <rect x="25" y="10" width="90" height="16" rx="3" fill="#0f172a" stroke="#3b82f6" stroke-width="1" />
        <text x="70" y="21" fill="#38bdf8" font-size="8.5" font-weight="900" font-family="monospace" text-anchor="middle">
          STEPPER ${Math.round(rotAngle)}°
        </text>

        <!-- Bottom 4-Pin Connector Header (A+, A-, B+, B-) -->
        <rect x="15" y="118" width="110" height="18" rx="2" fill="#09090b" stroke="#27272a" stroke-width="1" />
        ${[
          { x: 25, label: 'A+' },
          { x: 55, label: 'A-' },
          { x: 85, label: 'B+' },
          { x: 115, label: 'B-' },
        ].map(
          (p) => html`
            <g>
              <rect x="${p.x - 3.5}" y="120" width="7" height="12" rx="1" fill="#facc15" stroke="#ca8a04" stroke-width="0.6" />
              <text x="${p.x}" y="114" fill="#94a3b8" font-size="6" font-weight="800" font-family="monospace" text-anchor="middle">
                ${p.label}
              </text>
            </g>
          `
        )}
      </svg>
    `;
  }
}

if (!customElements.get('voltflow-stepper-motor')) {
  customElements.define('voltflow-stepper-motor', VoltFlowStepperMotorElement);
}
