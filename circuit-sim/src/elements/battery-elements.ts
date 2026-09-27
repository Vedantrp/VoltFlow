import { LitElement, html, css } from 'lit';

export class VoltFlowBattery9VElement extends LitElement {
  readonly pinInfo = [
    { name: '+', x: 26, y: 12 },
    { name: '-', x: 54, y: 12 },
  ];

  static styles = css`
    :host {
      display: inline-block;
      width: 80px;
      height: 120px;
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
      <svg viewBox="0 0 80 120" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bat9v-body" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#1c1917" />
            <stop offset="40%" stop-color="#292524" />
            <stop offset="70%" stop-color="#1c1917" />
            <stop offset="100%" stop-color="#0c0a09" />
          </linearGradient>
          <linearGradient id="bat9v-gold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#ca8a04" />
            <stop offset="30%" stop-color="#facc15" />
            <stop offset="70%" stop-color="#eab308" />
            <stop offset="100%" stop-color="#a16207" />
          </linearGradient>
          <filter id="bat-shadow" x="-10%" y="-5%" width="120%" height="110%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="rgba(0,0,0,0.5)" />
          </filter>
        </defs>

        <!-- Main Battery Casing -->
        <rect x="4" y="20" width="72" height="96" rx="6" fill="url(#bat9v-body)" stroke="#44403c" stroke-width="1.5" filter="url(#bat-shadow)" />

        <!-- Gold / Copper Top Band -->
        <path d="M 4 26 Q 4 20 10 20 L 70 20 Q 76 20 76 26 L 76 44 L 4 44 Z" fill="url(#bat9v-gold)" />
        <text x="40" y="36" fill="#451a03" font-size="8.5" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle" letter-spacing="1">ALKALINE</text>

        <!-- Positive Snap Terminal (Circular Male Stud) on Left -->
        <circle cx="26" cy="12" r="7" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5" />
        <circle cx="26" cy="12" r="4.5" fill="#94a3b8" />
        <circle cx="26" cy="12" r="2" fill="#475569" />
        <text x="26" y="27" fill="#facc15" font-size="8" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">+</text>

        <!-- Negative Snap Terminal (Octagonal / Hexagonal Female Cup) on Right -->
        <polygon points="54,5 60,8 62,14 59,19 50,19 46,14 48,8" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5" />
        <polygon points="54,7 58,10 60,14 57,17 51,17 48,14 50,10" fill="#64748b" />
        <text x="54" y="27" fill="#94a3b8" font-size="8" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">−</text>

        <!-- Front Body Labels -->
        <text x="40" y="70" fill="#facc15" font-size="22" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">9V</text>
        <text x="40" y="84" fill="#e2e8f0" font-size="8" font-weight="800" font-family="system-ui, sans-serif" text-anchor="middle" letter-spacing="1">VOLTFLOW</text>
        <text x="40" y="96" fill="#78716c" font-size="6" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle">6LR61 / 1604A</text>
        <text x="40" y="106" fill="#ef4444" font-size="5" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle">0% MERCURY & CADMIUM</text>
      </svg>
    `;
  }
}

export class VoltFlowCoinCell3VElement extends LitElement {
  readonly pinInfo = [
    { name: '+', x: 42.5, y: 10 },
    { name: '-', x: 42.5, y: 75 },
  ];

  static styles = css`
    :host {
      display: inline-block;
      width: 85px;
      height: 85px;
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
      <svg viewBox="0 0 85 85" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="cr2032-grad" cx="45%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#f8fafc" />
            <stop offset="50%" stop-color="#cbd5e1" />
            <stop offset="85%" stop-color="#94a3b8" />
            <stop offset="100%" stop-color="#64748b" />
          </radialGradient>
          <filter id="coin-shadow">
            <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.3)" />
          </filter>
        </defs>

        <!-- Outer Beveled Edge -->
        <circle cx="42.5" cy="42.5" r="38" fill="url(#cr2032-grad)" stroke="#64748b" stroke-width="1.5" filter="url(#coin-shadow)" />
        <circle cx="42.5" cy="42.5" r="34" fill="none" stroke="#e2e8f0" stroke-width="0.8" opacity="0.8" />

        <!-- Engraved Typography -->
        <text x="42.5" y="32" fill="#334155" font-size="10" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle" letter-spacing="1">CR2032</text>
        <text x="42.5" y="44" fill="#475569" font-size="8.5" font-weight="800" font-family="system-ui, sans-serif" text-anchor="middle">3V</text>
        <text x="42.5" y="55" fill="#64748b" font-size="6" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle">LITHIUM CELL</text>

        <!-- Positive (+) Marker at Top -->
        <text x="42.5" y="20" fill="#0f172a" font-size="12" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">+</text>

        <!-- Connection Pads -->
        <circle cx="42.5" cy="10" r="3" fill="#38bdf8" stroke="#0284c7" stroke-width="1" />
        <circle cx="42.5" cy="75" r="3" fill="#64748b" stroke="#334155" stroke-width="1" />
      </svg>
    `;
  }
}

export class VoltFlowBattery15VAAElement extends LitElement {
  readonly pinInfo = [
    { name: '+', x: 21, y: 8 },
    { name: '-', x: 21, y: 92 },
  ];

  static styles = css`
    :host {
      display: inline-block;
      width: 42px;
      height: 100px;
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
      <svg viewBox="0 0 42 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="aa-body" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#1e293b" />
            <stop offset="35%" stop-color="#334155" />
            <stop offset="70%" stop-color="#1e293b" />
            <stop offset="100%" stop-color="#0f172a" />
          </linearGradient>
          <linearGradient id="aa-gold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#ca8a04" />
            <stop offset="40%" stop-color="#facc15" />
            <stop offset="100%" stop-color="#a16207" />
          </linearGradient>
        </defs>

        <!-- Positive Pip / Nub at Top -->
        <rect x="16" y="4" width="10" height="6" rx="1.5" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1" />

        <!-- Cylindrical Battery Body -->
        <rect x="4" y="10" width="34" height="82" rx="3" fill="url(#aa-body)" stroke="#475569" stroke-width="1.2" />

        <!-- Gold Shoulder -->
        <rect x="4" y="10" width="34" height="22" fill="url(#aa-gold)" />
        <text x="21" y="24" fill="#451a03" font-size="7" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">+</text>

        <!-- Labels -->
        <text x="21" y="52" fill="#facc15" font-size="11" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">1.5V</text>
        <text x="21" y="64" fill="#ffffff" font-size="8" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">AA</text>
        <text x="21" y="74" fill="#94a3b8" font-size="5" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle">ALKALINE</text>

        <!-- Negative Base Terminal -->
        <rect x="6" y="88" width="30" height="4" fill="#cbd5e1" />
        <text x="21" y="91" fill="#475569" font-size="6" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">−</text>
      </svg>
    `;
  }
}

export class VoltFlowBattery4xAAElement extends LitElement {
  readonly pinInfo = [
    { name: '+', x: 112, y: 28 },
    { name: '-', x: 112, y: 58 },
  ];

  static styles = css`
    :host {
      display: inline-block;
      width: 120px;
      height: 85px;
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
      <svg viewBox="0 0 120 85" xmlns="http://www.w3.org/2000/svg">
        <!-- Molded ABS Black Plastic Holder -->
        <rect x="2" y="2" width="104" height="81" rx="5" fill="#0f172a" stroke="#334155" stroke-width="1.5" />

        <!-- 4 Battery Bays -->
        <rect x="6" y="6" width="96" height="16" rx="2" fill="#1e293b" stroke="#475569" stroke-width="0.8" />
        <text x="50" y="17" fill="#facc15" font-size="7" font-weight="800" font-family="system-ui, sans-serif" text-anchor="middle">AA 1.5V CELL 1</text>

        <rect x="6" y="25" width="96" height="16" rx="2" fill="#1e293b" stroke="#475569" stroke-width="0.8" />
        <text x="50" y="36" fill="#facc15" font-size="7" font-weight="800" font-family="system-ui, sans-serif" text-anchor="middle">AA 1.5V CELL 2</text>

        <rect x="6" y="44" width="96" height="16" rx="2" fill="#1e293b" stroke="#475569" stroke-width="0.8" />
        <text x="50" y="55" fill="#facc15" font-size="7" font-weight="800" font-family="system-ui, sans-serif" text-anchor="middle">AA 1.5V CELL 3</text>

        <rect x="6" y="63" width="96" height="16" rx="2" fill="#1e293b" stroke="#475569" stroke-width="0.8" />
        <text x="50" y="74" fill="#facc15" font-size="7" font-weight="800" font-family="system-ui, sans-serif" text-anchor="middle">AA 1.5V CELL 4</text>

        <!-- Red (+6V) Wire Lead extending to right -->
        <path d="M 104 28 C 107 28 109 28 112 28" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round" />
        <circle cx="112" cy="28" r="3" fill="#ef4444" stroke="#fca5a5" stroke-width="1" />
        <text x="100" y="24" fill="#ef4444" font-size="6.5" font-weight="900" font-family="system-ui, sans-serif">+6V</text>

        <!-- Black (GND) Wire Lead extending to right -->
        <path d="M 104 58 C 107 58 109 58 112 58" fill="none" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />
        <circle cx="112" cy="58" r="3" fill="#1e293b" stroke="#64748b" stroke-width="1" />
        <text x="100" y="54" fill="#94a3b8" font-size="6.5" font-weight="900" font-family="system-ui, sans-serif">GND</text>
      </svg>
    `;
  }
}

export class VoltFlowBreadboardPowerSupplyElement extends LitElement {
  readonly pinInfo = [
    { name: 'VCC_TOP', x: 110, y: 12 },
    { name: 'GND_TOP', x: 122, y: 12 },
    { name: 'VCC_BOT', x: 110, y: 48 },
    { name: 'GND_BOT', x: 122, y: 48 },
  ];

  static styles = css`
    :host {
      display: inline-block;
      width: 130px;
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
      <svg viewBox="0 0 130 60" xmlns="http://www.w3.org/2000/svg">
        <!-- Green PCB Substrate -->
        <rect x="2" y="2" width="126" height="56" rx="4" fill="#15803d" stroke="#166534" stroke-width="1.5" />

        <!-- DC Barrel Jack at Left -->
        <rect x="4" y="16" width="22" height="28" rx="2" fill="#0f172a" stroke="#334155" stroke-width="1" />
        <circle cx="15" cy="30" r="5" fill="#334155" />
        <circle cx="15" cy="30" r="2.5" fill="#cbd5e1" />

        <!-- Push Button Power Switch -->
        <rect x="32" y="20" width="14" height="20" rx="1.5" fill="#e2e8f0" stroke="#94a3b8" stroke-width="0.8" />
        <rect x="35" y="24" width="8" height="12" fill="#ef4444" rx="1" />

        <!-- 3.3V and 5V Regulators (AMS1117) -->
        <rect x="54" y="12" width="14" height="12" rx="1" fill="#1e293b" />
        <text x="61" y="21" fill="#94a3b8" font-size="4" font-weight="700" font-family="monospace" text-anchor="middle">5.0V</text>

        <rect x="54" y="34" width="14" height="12" rx="1" fill="#1e293b" />
        <text x="61" y="43" fill="#94a3b8" font-size="4" font-weight="700" font-family="monospace" text-anchor="middle">3.3V</text>

        <!-- MB102 Silkscreen -->
        <text x="84" y="33" fill="#ffffff" font-size="8" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">MB102</text>

        <!-- Output Pins for Breadboard Rails -->
        <rect x="105" y="6" width="22" height="12" rx="1" fill="#0f172a" stroke="#334155" stroke-width="0.8" />
        <circle cx="110" cy="12" r="2.5" fill="#facc15" />
        <circle cx="122" cy="12" r="2.5" fill="#94a3b8" />

        <rect x="105" y="42" width="22" height="12" rx="1" fill="#0f172a" stroke="#334155" stroke-width="0.8" />
        <circle cx="110" cy="48" r="2.5" fill="#facc15" />
        <circle cx="122" cy="48" r="2.5" fill="#94a3b8" />
      </svg>
    `;
  }
}

if (!customElements.get('voltflow-battery-9v')) {
  customElements.define('voltflow-battery-9v', VoltFlowBattery9VElement);
}
if (!customElements.get('voltflow-coin-cell-3v')) {
  customElements.define('voltflow-coin-cell-3v', VoltFlowCoinCell3VElement);
}
if (!customElements.get('voltflow-battery-1-5v-aa')) {
  customElements.define('voltflow-battery-1-5v-aa', VoltFlowBattery15VAAElement);
}
if (!customElements.get('voltflow-battery-4x-aa')) {
  customElements.define('voltflow-battery-4x-aa', VoltFlowBattery4xAAElement);
}
if (!customElements.get('voltflow-breadboard-power-supply')) {
  customElements.define('voltflow-breadboard-power-supply', VoltFlowBreadboardPowerSupplyElement);
}
