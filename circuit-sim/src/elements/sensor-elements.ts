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
    { name: 'VCC', x: 3, y: 16 },
    { name: 'OUT', x: 3, y: 30 },
    { name: 'GND', x: 3, y: 44 },
  ];

  static styles = css`
    :host {
      display: inline-block;
      width: 120px;
      height: 60px;
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
      <svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
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
          <linearGradient id="dht11-pin-gold-b" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#a16207" />
            <stop offset="50%" stop-color="#eab308" />
            <stop offset="100%" stop-color="#fef08a" />
          </linearGradient>
        </defs>

        <!-- 1. Connection Pins on Left -->
        ${[16, 30, 44].map(
          (y) => html`
            <g>
              <rect x="0" y="${y - 1.2}" width="16" height="2.4" rx="0.5" fill="url(#dht11-pin-gold-b)" stroke="#854d0e" stroke-width="0.4" />
              <circle cx="3" cy="${y}" r="1.5" fill="#fef08a" stroke="#ca8a04" stroke-width="0.4" />
            </g>
          `
        )}

        <!-- 2. Header Socket Block -->
        <rect x="15" y="8" width="9" height="44" rx="1.5" fill="#171717" stroke="#333333" stroke-width="0.8" />
        ${[16, 30, 44].map(
          (y) => html`<rect x="16.5" y="${y - 2}" width="6" height="4" rx="0.5" fill="#0a0a0a" stroke="#404040" stroke-width="0.4" />`
        )}

        <!-- 3. Main Black FR4 PCB Breakout Board -->
        <rect x="22" y="2" width="96" height="56" rx="4" fill="url(#dht11-pcb-b)" stroke="#333333" stroke-width="1" />
        <rect x="24.5" y="4.5" width="91" height="51" rx="2.5" fill="none" stroke="#ffffff" stroke-width="0.6" opacity="0.85" />

        <!-- 4. Silkscreen Labels -->
        <text x="27" y="19" fill="#ffffff" font-size="6.5" font-weight="900" font-family="monospace" text-anchor="start">VCC</text>
        <text x="27" y="33" fill="#ffffff" font-size="6.5" font-weight="900" font-family="monospace" text-anchor="start">OUT</text>
        <text x="27" y="47" fill="#ffffff" font-size="6.5" font-weight="900" font-family="monospace" text-anchor="start">GND</text>

        <!-- 5. Mounting Hole -->
        <circle cx="49" cy="30" r="5" fill="#0a0a0a" stroke="#cbd5e1" stroke-width="1.2" />
        <circle cx="49" cy="30" r="3.5" fill="#050505" />

        <!-- 6. 4 Soldered Pads -->
        ${[13, 24, 36, 47].map(
          (y) => html`
            <g>
              <circle cx="61" cy="${y}" r="2.6" fill="url(#dht11-solder-b)" stroke="#1e293b" stroke-width="0.5" />
              <circle cx="61" cy="${y}" r="0.9" fill="#0f172a" />
            </g>
          `
        )}

        <!-- 7. Right Cyan Sensor Unit -->
        <rect x="66" y="7" width="48" height="46" rx="3.5" fill="url(#dht11-casing-b)" stroke="#075985" stroke-width="1.2" />

        <!-- 4x4 Grid Vent Slots -->
        ${[0, 1, 2, 3].map(
          (row) =>
            html`${[0, 1, 2, 3].map((col) => {
              const x = 70.5 + col * 10.2;
              const y = 11 + row * 9.5;
              return html`
                <g>
                  <rect x="${x}" y="${y}" width="7" height="6.8" rx="1.2" fill="#0c4a6e" stroke="#0369a1" stroke-width="0.6" />
                  <rect x="${x + 0.8}" y="${y + 0.8}" width="5.4" height="5.2" rx="0.8" fill="#042f2e" opacity="0.9" />
                </g>
              `;
            })}`
        )}
      </svg>
    `;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('voltflow-dht11')) {
  customElements.define('voltflow-dht11', VoltFlowDHT11Element);
}
