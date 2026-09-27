import { LitElement, html, css } from 'lit';

export class VoltFlowDiodeElement extends LitElement {
  readonly pinInfo = [
    { name: 'A', x: 6, y: 12 },
    { name: 'C', x: 59, y: 12 },
  ];

  static styles = css`
    :host {
      display: inline-block;
      width: 65px;
      height: 24px;
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
      <svg viewBox="0 0 65 24" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lead-silver" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#f1f5f9" />
            <stop offset="50%" stop-color="#94a3b8" />
            <stop offset="100%" stop-color="#475569" />
          </linearGradient>
          <linearGradient id="diode-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#27272a" />
            <stop offset="50%" stop-color="#09090b" />
            <stop offset="100%" stop-color="#18181b" />
          </linearGradient>
        </defs>

        <!-- Axial Leads -->
        <rect x="0" y="10.5" width="20" height="3" fill="url(#lead-silver)" rx="1.5" />
        <rect x="45" y="10.5" width="20" height="3" fill="url(#lead-silver)" rx="1.5" />

        <!-- Black Epoxy Diode Body -->
        <rect x="18" y="4" width="29" height="16" rx="3" fill="url(#diode-body)" stroke="#3f3f46" stroke-width="0.8" />

        <!-- Silver Cathode Band -->
        <rect x="39" y="4" width="5" height="16" fill="#cbd5e1" />

        <!-- Silkscreen Text -->
        <text x="28" y="14" fill="#71717a" font-size="5" font-weight="900" font-family="monospace">1N4007</text>
      </svg>
    `;
  }
}

export class VoltFlowZenerDiodeElement extends LitElement {
  readonly pinInfo = [
    { name: 'A', x: 6, y: 12 },
    { name: 'C', x: 59, y: 12 },
  ];

  static styles = css`
    :host {
      display: inline-block;
      width: 65px;
      height: 24px;
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
      <svg viewBox="0 0 65 24" xmlns="http://www.w3.org/2000/svg">
        <!-- Axial Leads -->
        <rect x="0" y="10.5" width="20" height="3" fill="#cbd5e1" rx="1.5" />
        <rect x="45" y="10.5" width="20" height="3" fill="#cbd5e1" rx="1.5" />

        <!-- DO-35 Glass Body (Orange / Red) -->
        <rect x="18" y="5" width="29" height="14" rx="2" fill="#ea580c" stroke="#c2410c" stroke-width="0.8" opacity="0.9" />

        <!-- Black Cathode Band -->
        <rect x="39" y="5" width="5" height="14" fill="#09090b" />
      </svg>
    `;
  }
}

export class VoltFlowTransistorNPNElement extends LitElement {
  readonly pinInfo = [
    { name: 'C', x: 14, y: 55 },
    { name: 'B', x: 25, y: 55 },
    { name: 'E', x: 36, y: 55 },
  ];

  static styles = css`
    :host {
      display: inline-block;
      width: 50px;
      height: 65px;
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
      <svg viewBox="0 0 50 65" xmlns="http://www.w3.org/2000/svg">
        <!-- 3 Solder Pin Legs (Collector, Base, Emitter) -->
        <rect x="12" y="32" width="4" height="26" fill="#cbd5e1" rx="1" />
        <rect x="23" y="32" width="4" height="26" fill="#cbd5e1" rx="1" />
        <rect x="34" y="32" width="4" height="26" fill="#cbd5e1" rx="1" />

        <!-- TO-92 Curved Black Plastic Body (Top View / Front D-Shape) -->
        <path d="M 8 32 C 8 10, 42 10, 42 32 Z" fill="#18181b" stroke="#3f3f46" stroke-width="1.2" />
        <rect x="8" y="28" width="34" height="6" fill="#27272a" rx="1" />

        <!-- Part Number Silkscreen -->
        <text x="25" y="24" fill="#a1a1aa" font-size="5" font-weight="900" font-family="monospace" text-anchor="middle">2N2222</text>

        <!-- Pin Labels -->
        <text x="14" y="63" fill="#94a3b8" font-size="5" font-weight="800" font-family="system-ui, sans-serif" text-anchor="middle">C</text>
        <text x="25" y="63" fill="#94a3b8" font-size="5" font-weight="800" font-family="system-ui, sans-serif" text-anchor="middle">B</text>
        <text x="36" y="63" fill="#94a3b8" font-size="5" font-weight="800" font-family="system-ui, sans-serif" text-anchor="middle">E</text>
      </svg>
    `;
  }
}

export class VoltFlowCapacitorElectrolyticElement extends LitElement {
  readonly pinInfo = [
    { name: '+', x: 18, y: 62 },
    { name: '-', x: 32, y: 62 },
  ];

  static styles = css`
    :host {
      display: inline-block;
      width: 50px;
      height: 70px;
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
      <svg viewBox="0 0 50 70" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cap-body" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#1e293b" />
            <stop offset="40%" stop-color="#334155" />
            <stop offset="70%" stop-color="#1e293b" />
            <stop offset="100%" stop-color="#0f172a" />
          </linearGradient>
        </defs>

        <!-- Radial Lead Wires (Positive Long, Negative Short) -->
        <rect x="16.5" y="44" width="3" height="22" fill="#cbd5e1" rx="1" />
        <rect x="30.5" y="44" width="3" height="22" fill="#cbd5e1" rx="1" />

        <!-- Aluminum Cylindrical Can -->
        <rect x="8" y="4" width="34" height="42" rx="4" fill="url(#cap-body)" stroke="#475569" stroke-width="1.2" />

        <!-- Silver Negative Stripe along Right Edge -->
        <rect x="29" y="4" width="9" height="42" fill="#cbd5e1" />
        <text x="33.5" y="18" fill="#0f172a" font-size="8" font-weight="900" text-anchor="middle">−</text>
        <text x="33.5" y="32" fill="#0f172a" font-size="8" font-weight="900" text-anchor="middle">−</text>

        <!-- Capacity Value Label -->
        <text x="18" y="24" fill="#ffffff" font-size="6" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">100µF</text>
        <text x="18" y="34" fill="#94a3b8" font-size="5" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle">16V</text>
      </svg>
    `;
  }
}

if (!customElements.get('voltflow-diode-1n4007')) {
  customElements.define('voltflow-diode-1n4007', VoltFlowDiodeElement);
}
if (!customElements.get('voltflow-zener-diode')) {
  customElements.define('voltflow-zener-diode', VoltFlowZenerDiodeElement);
}
if (!customElements.get('voltflow-transistor-npn')) {
  customElements.define('voltflow-transistor-npn', VoltFlowTransistorNPNElement);
}
if (!customElements.get('voltflow-capacitor-electrolytic')) {
  customElements.define('voltflow-capacitor-electrolytic', VoltFlowCapacitorElectrolyticElement);
}
