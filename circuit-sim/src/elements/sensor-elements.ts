import { LitElement, html, css } from 'lit';

/**
 * VoltFlow DHT11 Digital Temperature & Humidity Sensor
 * Iconic cyan/blue ventilation grille casing, 4-pin (VCC, DATA, NC, GND)
 * 57 × 117 px
 */
export class VoltFlowDHT11Element extends LitElement {
  static properties = {
    temperature: { type: Number },
    humidity: { type: Number },
  };

  temperature = 25;
  humidity = 60;

  readonly pinInfo = [
    { name: 'VCC', x: 15, y: 114.9 },
    { name: 'DATA', x: 24.5, y: 114.9 },
    { name: 'NC', x: 34.1, y: 114.9 },
    { name: 'GND', x: 43.8, y: 114.9 },
  ];

  static styles = css`
    :host {
      display: inline-block;
      width: 57px;
      height: 117px;
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
      <svg viewBox="0 0 57 117" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="dht11-shadow" x="-10%" y="-5%" width="120%" height="110%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="rgba(0,0,0,0.4)" />
          </filter>
          <linearGradient id="dht11-body" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38bdf8" />
            <stop offset="40%" stop-color="#0284c7" />
            <stop offset="100%" stop-color="#0369a1" />
          </linearGradient>
          <linearGradient id="dht11-lead" x1="0%" y1="0%" x2="0%" y2="1">
            <stop offset="0%" stop-color="#f8fafc" />
            <stop offset="50%" stop-color="#cbd5e1" />
            <stop offset="100%" stop-color="#64748b" />
          </linearGradient>
        </defs>

        <!-- 4 Metal Connecting Terminal Leads at Bottom -->
        ${[15, 24.5, 34.1, 43.8].map(
          (x) => html`
            <rect x="${x - 1.2}" y="85" width="2.4" height="30" rx="0.8" fill="url(#dht11-lead)" stroke="#475569" stroke-width="0.4" />
            <circle cx="${x}" cy="114.9" r="1.8" fill="#e2e8f0" stroke="#64748b" stroke-width="0.5" />
          `
        )}

        <!-- Top Mounting Tab / Hole -->
        <path d="M 20 6 C 20 2 37 2 37 6 L 37 12 L 20 12 Z" fill="#0284c7" stroke="#0369a1" stroke-width="1" />
        <circle cx="28.5" cy="7" r="3" fill="#0f172a" stroke="#075985" stroke-width="0.8" />

        <!-- Main Cyan / Sky-Blue Plastic Casing Body -->
        <rect x="2" y="10" width="53" height="78" rx="5" fill="url(#dht11-body)" stroke="#075985" stroke-width="1.5" filter="url(#dht11-shadow)" />

        <!-- Front Grille Recessed Window -->
        <rect x="7" y="15" width="43" height="42" rx="3" fill="#075985" stroke="#0c4a6e" stroke-width="1" />

        <!-- Ventilation Louver Slots (Horizontal Grid Matrix) -->
        ${[18, 22, 26, 30, 34, 38, 42, 46, 50, 54].map(
          (y) => html`
            <g>
              <line x1="9" y1="${y}" x2="27" y2="${y}" stroke="#0369a1" stroke-width="1.8" stroke-linecap="round" />
              <line x1="30" y1="${y}" x2="48" y2="${y}" stroke="#0369a1" stroke-width="1.8" stroke-linecap="round" />
            </g>
          `
        )}

        <!-- Internal Humidity Sensing Polymer Grid Dots -->
        <circle cx="28.5" cy="36" r="2.5" fill="#38bdf8" opacity="0.8" />

        <!-- Silkscreen DHT11 Branding -->
        <rect x="8" y="60" width="41" height="15" rx="2" fill="#075985" stroke="#0284c7" stroke-width="0.8" />
        <text x="28.5" y="71" fill="#ffffff" font-size="8.5" font-weight="950" font-family="ui-monospace, monospace" text-anchor="middle" letter-spacing="1">DHT11</text>
        <text x="28.5" y="77" fill="#7dd3fc" font-size="4.5" font-weight="800" font-family="system-ui, sans-serif" text-anchor="middle">HUMIDITY &amp; TEMP</text>

        <!-- Pin Labels across Bottom Base -->
        <rect x="6" y="79" width="45" height="7" rx="1.5" fill="#0c4a6e" />
        <text x="15" y="84.5" fill="#bae6fd" font-size="3.5" font-weight="900" font-family="monospace" text-anchor="middle">VCC</text>
        <text x="24.5" y="84.5" fill="#bae6fd" font-size="3.5" font-weight="900" font-family="monospace" text-anchor="middle">DAT</text>
        <text x="34.1" y="84.5" fill="#7dd3fc" font-size="3.5" font-weight="900" font-family="monospace" text-anchor="middle">NC</text>
        <text x="43.8" y="84.5" fill="#bae6fd" font-size="3.5" font-weight="900" font-family="monospace" text-anchor="middle">GND</text>
      </svg>
    `;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('voltflow-dht11')) {
  customElements.define('voltflow-dht11', VoltFlowDHT11Element);
}
