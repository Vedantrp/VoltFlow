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
    { name: 'VCC', x: 18, y: 125 },
    { name: 'DATA', x: 32, y: 125 },
    { name: 'GND', x: 46, y: 125 },
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
      <svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="dht11-mod-shadow" x="-10%" y="-5%" width="120%" height="110%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="rgba(0,0,0,0.5)" />
          </filter>
          <linearGradient id="dht11-pcb" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1e293b" />
            <stop offset="60%" stop-color="#0f172a" />
            <stop offset="100%" stop-color="#0284c7" />
          </linearGradient>
          <linearGradient id="dht11-casing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38bdf8" />
            <stop offset="50%" stop-color="#0284c7" />
            <stop offset="100%" stop-color="#0369a1" />
          </linearGradient>
          <linearGradient id="dht11-pin-gold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#fef08a" />
            <stop offset="50%" stop-color="#eab308" />
            <stop offset="100%" stop-color="#ca8a04" />
          </linearGradient>
        </defs>

        <!-- Main PCB Breakout Board Base -->
        <rect x="2" y="2" width="60" height="116" rx="6" fill="url(#dht11-pcb)" stroke="#0284c7" stroke-width="1.2" filter="url(#dht11-mod-shadow)" />

        <!-- PCB Corner Mounting Hole -->
        <circle cx="32" cy="10" r="3.5" fill="#090d16" stroke="#475569" stroke-width="0.8" />

        <!-- Mounted Cyan DHT11 Sensor Casing Unit -->
        <rect x="7" y="18" width="50" height="66" rx="4" fill="url(#dht11-casing)" stroke="#075985" stroke-width="1.2" />

        <!-- Front Grille Recessed Window -->
        <rect x="11" y="23" width="42" height="34" rx="2" fill="#075985" stroke="#0c4a6e" stroke-width="0.8" />

        <!-- Ventilation Louvers (Horizontal Lines) -->
        ${[26, 30, 34, 38, 42, 46, 50, 54].map(
          (y) => html`
            <g>
              <line x1="13" y1="${y}" x2="30" y2="${y}" stroke="#0369a1" stroke-width="1.6" stroke-linecap="round" />
              <line x1="33" y1="${y}" x2="49" y2="${y}" stroke="#0369a1" stroke-width="1.6" stroke-linecap="round" />
            </g>
          `
        )}

        <!-- Silkscreen DHT11 Branding on Sensor Housing -->
        <rect x="12" y="61" width="40" height="13" rx="1.5" fill="#075985" />
        <text x="32" y="70" fill="#ffffff" font-size="7.5" font-weight="900" font-family="ui-monospace, monospace" text-anchor="middle" letter-spacing="0.8">DHT11</text>

        <!-- On-Board SMD Components: Pull-Up Resistor (103) & Power Indicator LED -->
        <rect x="10" y="88" width="10" height="6" rx="1" fill="#1e293b" stroke="#64748b" stroke-width="0.5" />
        <text x="15" y="92.5" fill="#94a3b8" font-size="3.5" font-weight="800" font-family="monospace" text-anchor="middle">103</text>

        <!-- Power Indicator LED (Red SMD) -->
        <rect x="44" y="88" width="8" height="6" rx="1" fill="#ef4444" stroke="#dc2626" stroke-width="0.5" />
        <circle cx="48" cy="91" r="1.8" fill="#fca5a5" />

        <!-- Silkscreen PCB Labels -->
        <text x="32" y="94" fill="#38bdf8" font-size="5" font-weight="800" font-family="sans-serif" text-anchor="middle">MODULE</text>

        <!-- 3 Male Connection Pins at Bottom Header -->
        ${[18, 32, 46].map(
          (x) => html`
            <rect x="${x - 1.5}" y="104" width="3" height="22" rx="0.5" fill="url(#dht11-pin-gold)" stroke="#854d0e" stroke-width="0.4" />
            <circle cx="${x}" cy="125" r="1.8" fill="#fef08a" stroke="#ca8a04" stroke-width="0.5" />
          `
        )}

        <!-- Pin Labels across PCB Bottom -->
        <rect x="6" y="97" width="52" height="7" rx="1.5" fill="#0f172a" stroke="#334155" stroke-width="0.5" />
        <text x="18" y="102.5" fill="#f8fafc" font-size="4" font-weight="900" font-family="monospace" text-anchor="middle">VCC</text>
        <text x="32" y="102.5" fill="#38bdf8" font-size="4" font-weight="900" font-family="monospace" text-anchor="middle">DAT</text>
        <text x="46" y="102.5" fill="#f8fafc" font-size="4" font-weight="900" font-family="monospace" text-anchor="middle">GND</text>
      </svg>
    `;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('voltflow-dht11')) {
  customElements.define('voltflow-dht11', VoltFlowDHT11Element);
}
