/**
 * VoltFlow DHT11 Digital Temperature & Humidity Sensor Module
 * 3-pin PCB Breakout Module (VCC, DATA, GND) with built-in pull-up resistor & power LED
 * 64 × 128 px
 */
import { LitElement, html, css } from 'lit';

export class VoltFlowDHT11Element extends LitElement {
  static properties = {
    temperature: { type: Number },
    humidity: { type: Number },
  };

  temperature = 25;
  humidity = 60;

  readonly pinInfo = [
    { name: 'VCC', x: 16, y: 117 },
    { name: 'OUT', x: 30, y: 117 },
    { name: 'GND', x: 44, y: 117 },
  ];

  static styles = css`
    :host {
      display: inline-block;
      width: 64px;
      height: 128px;
      user-select: none;
    }
    svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }
  `;

  render() {
    return html`
      <svg viewBox="0 0 60 120" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="dht11-pcb-b" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1e1e1e" />
            <stop offset="50%" stop-color="#121212" />
            <stop offset="100%" stop-color="#0a0a0a" />
          </linearGradient>
          <linearGradient id="dht11-casing-b" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38bdf8" />
            <stop offset="40%" stop-color="#0284c7" />
            <stop offset="100%" stop-color="#0369a1" />
          </linearGradient>
          <radialGradient id="dht11-solder-b" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="40%" stop-color="#cbd5e1" />
            <stop offset="85%" stop-color="#64748b" />
            <stop offset="100%" stop-color="#334155" />
          </radialGradient>
          <linearGradient id="dht11-pin-gold-b" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#fef08a" />
            <stop offset="50%" stop-color="#eab308" />
            <stop offset="100%" stop-color="#a16207" />
          </linearGradient>
        </defs>

        <!-- Main Black FR4 PCB Breakout Board -->
        <rect x="2" y="2" width="56" height="116" rx="4" fill="url(#dht11-pcb-b)" stroke="#333333" stroke-width="1" />
        <rect x="4.5" y="4.5" width="51" height="111" rx="2.5" fill="none" stroke="#ffffff" stroke-width="0.6" opacity="0.85" />

        <!-- Mounted Cyan DHT11 Grid Sensor Unit -->
        <rect x="7" y="8" width="46" height="58" rx="3.5" fill="url(#dht11-casing-b)" stroke="#075985" stroke-width="1.2" />

        <!-- 4x4 Grid Matrix of Vent Slots -->
        ${[0, 1, 2, 3].map(
          (row) =>
            html`${[0, 1, 2, 3].map((col) => {
              const x = 11.5 + col * 9.8;
              const y = 12 + row * 10.5;
              return html`
                <g>
                  <rect x="${x}" y="${y}" width="7.2" height="7.2" rx="1.2" fill="#0c4a6e" stroke="#0369a1" stroke-width="0.6" />
                  <rect x="${x + 0.8}" y="${y + 0.8}" width="5.6" height="5.6" rx="0.8" fill="#042f2e" opacity="0.9" />
                </g>
              `;
            })}`
        )}

        <!-- Silkscreen DHT11 Branding on Sensor Housing -->
        <rect x="12" y="52" width="36" height="11" rx="1.5" fill="#075985" stroke="#0284c7" stroke-width="0.5" />
        <text x="30" y="60" fill="#ffffff" font-size="6.5" font-weight="950" font-family="monospace" text-anchor="middle" letter-spacing="0.8">DHT11</text>

        <!-- 4 Solder Pads (Connecting Casing to PCB) -->
        ${[13, 24, 36, 47].map(
          (x) => html`
            <g>
              <circle cx="${x}" cy="70" r="2.8" fill="url(#dht11-solder-b)" stroke="#1e293b" stroke-width="0.6" />
              <circle cx="${x}" cy="70" r="1" fill="#0f172a" />
            </g>
          `
        )}

        <!-- Center Metallic Mounting Hole -->
        <circle cx="30" cy="81" r="5" fill="#0a0a0a" stroke="#cbd5e1" stroke-width="1.2" />
        <circle cx="30" cy="81" r="3.5" fill="#050505" />

        <!-- Onboard SMD Components (103 Resistor & Power LED) -->
        <rect x="9" y="78" width="8" height="5" rx="0.8" fill="#121212" stroke="#475569" stroke-width="0.4" />
        <text x="13" y="81.8" fill="#cbd5e1" font-size="3" font-weight="800" font-family="monospace" text-anchor="middle">103</text>
        <rect x="43" y="78" width="7" height="5" rx="0.8" fill="#ef4444" stroke="#b91c1c" stroke-width="0.4" />
        <circle cx="46.5" cy="80.5" r="1.4" fill="#fca5a5" />

        <!-- Silkscreen Pin Labels -->
        <text x="16" y="93" fill="#ffffff" font-size="6" font-weight="900" font-family="monospace" text-anchor="middle">VCC</text>
        <text x="30" y="93" fill="#ffffff" font-size="6" font-weight="900" font-family="monospace" text-anchor="middle">OUT</text>
        <text x="44" y="93" fill="#ffffff" font-size="6" font-weight="900" font-family="monospace" text-anchor="middle">GND</text>

        <!-- Header Plastic Housing Block -->
        <rect x="8" y="96" width="44" height="9" rx="1.5" fill="#171717" stroke="#333333" stroke-width="0.8" />
        ${[16, 30, 44].map(
          (x) => html`<rect x="${x - 2}" y="97.5" width="4" height="6" rx="0.5" fill="#0a0a0a" stroke="#404040" stroke-width="0.4" />`
        )}

        <!-- 3 Male Connection Pins -->
        ${[16, 30, 44].map(
          (x) => html`
            <g>
              <rect x="${x - 1.2}" y="103" width="2.4" height="15" rx="0.5" fill="url(#dht11-pin-gold-b)" stroke="#854d0e" stroke-width="0.4" />
              <circle cx="${x}" cy="117" r="1.5" fill="#fef08a" stroke="#ca8a04" stroke-width="0.4" />
            </g>
          `
        )}
      </svg>
    `;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('voltflow-dht11')) {
  customElements.define('voltflow-dht11', VoltFlowDHT11Element);
}
