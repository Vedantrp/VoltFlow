import { LitElement, html, css } from 'lit';

/**
 * VoltFlow HC-05 Bluetooth 2.0+EDR UART Serial Pass-Through Module
 * 220 × 90 px, 6-pin breakout board (STATE, RXD, TXD, GND, VCC, EN)
 */
export class VoltFlowBluetoothHC05Element extends LitElement {
  static properties = {
    connected: { type: Boolean },
    state: { type: String },
  };

  connected = false;
  state = 'disconnected';

  readonly pinInfo = [
    { name: 'STATE', x: 0, y: 15 },
    { name: 'RXD', x: 0, y: 30 },
    { name: 'TXD', x: 0, y: 45 },
    { name: 'GND', x: 0, y: 60 },
    { name: 'VCC', x: 0, y: 75 },
    { name: 'EN', x: 0, y: 88 },
  ];

  static styles = css`
    :host {
      display: inline-block;
      width: 220px;
      height: 90px;
      user-select: none;
    }
    svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }
    @keyframes ledBlink {
      0%, 100% { opacity: 0.9; }
      50% { opacity: 0.2; }
    }
    .led-active {
      animation: ledBlink 0.8s ease-in-out infinite;
    }
  `;

  render() {
    return html`
      <svg viewBox="0 0 220 90" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="hc05-shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="rgba(0,0,0,0.5)" />
          </filter>
          <linearGradient id="hc05-pcb-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#1d4ed8" />
            <stop offset="48%" stop-color="#1e40af" />
            <stop offset="100%" stop-color="#1e3a8a" />
          </linearGradient>
          <linearGradient id="hc05-chip-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#7dd3fc" />
            <stop offset="100%" stop-color="#0ea5e9" />
          </linearGradient>
          <linearGradient id="hc05-daughterboard" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#0f172a" />
            <stop offset="100%" stop-color="#020617" />
          </linearGradient>
        </defs>

        <!-- Base Breakout Board (Dark Blue PCB) -->
        <rect x="2" y="2" width="216" height="86" rx="6" fill="url(#hc05-pcb-grad)" stroke="#1e3a8a" stroke-width="1.8" filter="url(#hc05-shadow)" />

        <!-- Mounting Holes -->
        <circle cx="210" cy="10" r="3" fill="#1e293b" stroke="#64748b" stroke-width="0.8" />
        <circle cx="210" cy="80" r="3" fill="#1e293b" stroke="#64748b" stroke-width="0.8" />

        <!-- HC-05 SMD Daughterboard Module -->
        <rect x="26" y="8" width="168" height="74" rx="4" fill="url(#hc05-daughterboard)" stroke="#334155" stroke-width="1.2" />

        <!-- Solder Castellations along Daughterboard Edges -->
        ${[16, 28, 40, 52, 64, 74].map(
          (y) => html`
            <rect x="23.5" y="${y}" width="4" height="6" rx="1.5" fill="#facc15" stroke="#ca8a04" stroke-width="0.5" />
            <rect x="192.5" y="${y}" width="4" height="6" rx="1.5" fill="#facc15" stroke="#ca8a04" stroke-width="0.5" />
          `
        )}

        <!-- Gold Serpentine Trace / Meander Antenna at Top-Right -->
        <g id="hc05-antenna">
          <path
            d="M 134 16 L 184 16 L 184 32 L 140 32 L 140 24 L 178 24"
            fill="none"
            stroke="#fbbf24"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <rect x="130" y="12" width="58" height="24" fill="none" stroke="#eab308" stroke-width="0.8" stroke-dasharray="2,2" opacity="0.6" />
        </g>

        <!-- Main CSR BC417 Bluetooth Baseband IC Badge -->
        <rect x="36" y="16" width="88" height="42" rx="3" fill="url(#hc05-chip-grad)" stroke="#bae6fd" stroke-width="1.2" />
        <text x="80" y="34" fill="#082f49" font-size="11" font-weight="950" font-family="ui-monospace, monospace" text-anchor="middle" letter-spacing="0.5">HC-05</text>
        <text x="80" y="45" fill="#0369a1" font-size="5.5" font-weight="800" font-family="system-ui, sans-serif" text-anchor="middle" letter-spacing="0.8">BLUETOOTH 2.0+EDR</text>
        <text x="80" y="53" fill="#0284c7" font-size="4.5" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle">2.4GHz CSR BC417</text>

        <!-- 26.000 MHz Crystal Oscillator (Silver Metal Can) -->
        <rect x="36" y="62" width="22" height="14" rx="2" fill="#e2e8f0" stroke="#94a3b8" stroke-width="0.8" />
        <text x="47" y="71" fill="#475569" font-size="4" font-weight="800" font-family="monospace" text-anchor="middle">26.000</text>

        <!-- 3.3V LDO Voltage Regulator (662K / RT9193) -->
        <rect x="68" y="64" width="18" height="12" rx="1.5" fill="#18181b" stroke="#3f3f46" stroke-width="0.7" />
        <text x="77" y="72" fill="#a1a1aa" font-size="3.5" font-weight="700" font-family="monospace" text-anchor="middle">662K</text>

        <!-- KEY / EN Push Button -->
        <rect x="94" y="64" width="14" height="12" rx="2" fill="#334155" stroke="#475569" stroke-width="0.8" />
        <circle cx="101" cy="70" r="3.5" fill="#0284c7" stroke="#38bdf8" stroke-width="0.6" />
        <text x="101" y="81" fill="#bfdbfe" font-size="4" font-weight="700" text-anchor="middle">KEY</text>

        <!-- Blue/Red Status LED (LED2 / STATE) -->
        <circle cx="158" cy="54" r="3.5" fill="#38bdf8" stroke="#0284c7" stroke-width="0.8" class="led-active" />
        <circle cx="158" cy="54" r="7" fill="#38bdf8" opacity="0.3" class="led-active" />
        <text x="158" y="68" fill="#bfdbfe" font-size="4.5" font-weight="800" text-anchor="middle">STATE</text>

        <!-- Silkscreen Module Branding -->
        <text x="160" y="80" fill="#93c5fd" font-size="5" font-weight="800" font-family="system-ui, sans-serif" text-anchor="middle" letter-spacing="0.5">FC-114</text>

        <!-- Left 6-Pin Header Block (STATE, RXD, TXD, GND, VCC, EN) -->
        <rect x="2" y="8" width="16" height="74" rx="2" fill="#0f172a" stroke="#334155" stroke-width="1" />
        ${[
          { label: 'STATE', y: 15 },
          { label: 'RXD', y: 30 },
          { label: 'TXD', y: 45 },
          { label: 'GND', y: 60 },
          { label: 'VCC', y: 75 },
          { label: 'EN', y: 88 },
        ].map(
          (pin) => html`
            <g>
              <circle cx="7" cy="${pin.y}" r="2.8" fill="#facc15" stroke="#ca8a04" stroke-width="0.8" />
              <circle cx="7" cy="${pin.y}" r="1.2" fill="#1e293b" />
              <text x="19" y="${pin.y + 2}" fill="#e2e8f0" font-size="5" font-weight="800" font-family="system-ui, sans-serif">${pin.label}</text>
            </g>
          `
        )}
      </svg>
    `;
  }
}

/**
 * VoltFlow ESP-01 ESP8266 Wi-Fi Transceiver Module
 * 80 × 60 px, 2×4 pin header (TX, EN, RST, VCC, GND, GPIO2, GPIO0, RX)
 */
export class VoltFlowESP01Element extends LitElement {
  readonly pinInfo = [
    { name: 'TX', x: 15, y: 15 },
    { name: 'CH_PD', x: 35, y: 15 },
    { name: 'RST', x: 55, y: 15 },
    { name: 'VCC', x: 70, y: 15 },
    { name: 'GND', x: 15, y: 45 },
    { name: 'GPIO2', x: 35, y: 45 },
    { name: 'GPIO0', x: 55, y: 45 },
    { name: 'RX', x: 70, y: 45 },
  ];

  static styles = css`
    :host {
      display: inline-block;
      width: 80px;
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
      <svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="esp01-shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.6)" />
          </filter>
        </defs>

        <!-- Matte Black PCB Body -->
        <rect x="2" y="2" width="76" height="56" rx="4" fill="#09090b" stroke="#27272a" stroke-width="1.2" filter="url(#esp01-shadow)" />

        <!-- Gold Serpentine Trace Antenna at Top -->
        <path d="M 10 6 L 70 6 L 70 12 L 14 12 L 14 10 L 66 10" fill="none" stroke="#eab308" stroke-width="1.2" stroke-linecap="round" />

        <!-- ESP8266EX SoC QFN Package -->
        <rect x="24" y="20" width="22" height="22" rx="1.5" fill="#18181b" stroke="#3f3f46" stroke-width="0.8" />
        <circle cx="27" cy="23" r="0.8" fill="#71717a" />
        <text x="35" y="32" fill="#cbd5e1" font-size="3.8" font-weight="900" font-family="monospace" text-anchor="middle">ESP8266</text>
        <text x="35" y="37" fill="#71717a" font-size="2.8" font-weight="700" font-family="monospace" text-anchor="middle">EX</text>

        <!-- 1MB SPI Flash Memory (Winbond) -->
        <rect x="50" y="22" width="16" height="18" rx="1" fill="#18181b" stroke="#3f3f46" stroke-width="0.7" />
        <text x="58" y="32" fill="#71717a" font-size="3" font-weight="700" font-family="monospace" text-anchor="middle">25Q80</text>

        <!-- 26MHz Crystal -->
        <rect x="8" y="24" width="12" height="14" rx="1" fill="#cbd5e1" stroke="#94a3b8" stroke-width="0.6" />
        <text x="14" y="32" fill="#475569" font-size="2.5" font-weight="800" text-anchor="middle">26.0</text>

        <!-- Power & TX/RX LEDs -->
        <circle cx="12" cy="48" r="1.5" fill="#ef4444" />
        <circle cx="18" cy="48" r="1.5" fill="#3b82f6" />

        <!-- 2x4 Header (Top Row: TX, EN, RST, VCC / Bottom Row: GND, GPIO2, GPIO0, RX) -->
        <rect x="10" y="10" width="64" height="8" rx="1" fill="#18181b" stroke="#3f3f46" stroke-width="0.5" opacity="0.7" />
        <rect x="10" y="42" width="64" height="8" rx="1" fill="#18181b" stroke="#3f3f46" stroke-width="0.5" opacity="0.7" />

        ${[
          { x: 15, y: 15, name: 'TX' },
          { x: 35, y: 15, name: 'EN' },
          { x: 55, y: 15, name: 'RST' },
          { x: 70, y: 15, name: 'VCC' },
          { x: 15, y: 45, name: 'GND' },
          { x: 35, y: 45, name: 'IO2' },
          { x: 55, y: 45, name: 'IO0' },
          { x: 70, y: 45, name: 'RX' },
        ].map(
          (p) => html`
            <circle cx="${p.x}" cy="${p.y}" r="2.2" fill="#facc15" stroke="#ca8a04" stroke-width="0.6" />
            <circle cx="${p.x}" cy="${p.y}" r="0.9" fill="#09090b" />
          `
        )}

        <!-- Silkscreen Header Labels -->
        <text x="40" y="56" fill="#38bdf8" font-size="4.5" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">AI-THINKER ESP-01</text>
      </svg>
    `;
  }
}

// Auto-register elements with CustomElements registry
if (typeof customElements !== 'undefined') {
  if (!customElements.get('voltflow-bluetooth-hc05')) {
    customElements.define('voltflow-bluetooth-hc05', VoltFlowBluetoothHC05Element);
  }
  if (!customElements.get('voltflow-esp-01')) {
    customElements.define('voltflow-esp-01', VoltFlowESP01Element);
  }
}
