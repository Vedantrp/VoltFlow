import { LitElement, html, css } from 'lit';

export class VoltFlowNodeMCUElement extends LitElement {
  readonly pinInfo = [
    { name: 'A0', x: 6, y: 32 },
    { name: 'RSV1', x: 6, y: 44 },
    { name: 'RSV2', x: 6, y: 56 },
    { name: 'SD3', x: 6, y: 68 },
    { name: 'SD2', x: 6, y: 80 },
    { name: 'SD1', x: 6, y: 92 },
    { name: 'CMD', x: 6, y: 104 },
    { name: 'SD0', x: 6, y: 116 },
    { name: 'CLK', x: 6, y: 128 },
    { name: 'GND1', x: 6, y: 140 },
    { name: '3V3_1', x: 6, y: 152 },
    { name: 'EN', x: 6, y: 164 },
    { name: 'RST', x: 6, y: 176 },
    { name: 'GND2', x: 6, y: 188 },
    { name: 'VIN', x: 6, y: 200 },

    { name: 'D0', x: 114, y: 32 },
    { name: 'D1', x: 114, y: 44 },
    { name: 'D2', x: 114, y: 56 },
    { name: 'D3', x: 114, y: 68 },
    { name: 'D4', x: 114, y: 80 },
    { name: '3V3_2', x: 114, y: 92 },
    { name: 'GND3', x: 114, y: 104 },
    { name: 'D5', x: 114, y: 116 },
    { name: 'D6', x: 114, y: 128 },
    { name: 'D7', x: 114, y: 140 },
    { name: 'D8', x: 114, y: 152 },
    { name: 'RX', x: 114, y: 164 },
    { name: 'TX', x: 114, y: 176 },
    { name: 'GND4', x: 114, y: 188 },
    { name: '3V3_3', x: 114, y: 200 },
  ];

  static styles = css`
    :host {
      display: inline-block;
      width: 120px;
      height: 215px;
      user-select: none;
    }
    svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }
  `;

  render() {
    const leftPins = [
      'A0', 'RSV', 'RSV', 'SD3', 'SD2', 'SD1', 'CMD', 'SD0', 'CLK', 'GND', '3V3', 'EN', 'RST', 'GND', 'VIN'
    ];
    const rightPins = [
      'D0', 'D1', 'D2', 'D3', 'D4', '3V3', 'GND', 'D5', 'D6', 'D7', 'D8', 'RX', 'TX', 'GND', '3V3'
    ];

    return html`
      <svg viewBox="0 0 120 215" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="nodemcu-shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="rgba(0,0,0,0.6)" />
          </filter>
          <linearGradient id="shield-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#f1f5f9" />
            <stop offset="60%" stop-color="#cbd5e1" />
            <stop offset="100%" stop-color="#94a3b8" />
          </linearGradient>
        </defs>

        <!-- Matte Black PCB Body -->
        <rect x="2" y="2" width="116" height="211" rx="8" fill="#0b1120" stroke="#1e293b" stroke-width="1.5" filter="url(#nodemcu-shadow)" />

        <!-- Gold Meander Antenna at Top -->
        <path d="M 22 8 L 98 8 L 98 22 L 22 22 L 22 15 L 90 15" fill="none" stroke="#eab308" stroke-width="1.8" stroke-linecap="round" />
        <rect x="20" y="4" width="80" height="20" fill="none" stroke="#ca8a04" stroke-width="0.8" stroke-dasharray="3,3" />

        <!-- ESP-12E Metallic RF Shield Can -->
        <rect x="18" y="32" width="84" height="85" rx="4" fill="url(#shield-grad)" stroke="#64748b" stroke-width="1.5" />
        <circle cx="26" cy="40" r="3" fill="#64748b" />
        <text x="60" y="52" fill="#1e293b" font-size="9" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle" letter-spacing="1">ESP8266MOD</text>
        <text x="60" y="63" fill="#475569" font-size="6.5" font-weight="800" font-family="system-ui, sans-serif" text-anchor="middle">ISM 2.4GHz</text>
        <text x="60" y="73" fill="#64748b" font-size="5.5" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle">PA +25dBm</text>
        <text x="60" y="83" fill="#475569" font-size="5" font-weight="600" font-family="system-ui, sans-serif" text-anchor="middle">802.11 b/g/n Wi-Fi</text>
        <text x="60" y="100" fill="#1e293b" font-size="7" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">NodeMCU</text>

        <!-- CP2102 USB to UART Bridge IC -->
        <rect x="46" y="128" width="28" height="28" rx="2" fill="#1e293b" stroke="#334155" stroke-width="1" />
        <circle cx="50" cy="132" r="1.5" fill="#475569" />
        <text x="60" y="144" fill="#94a3b8" font-size="5.5" font-weight="900" font-family="monospace" text-anchor="middle">CP2102</text>

        <!-- RST & FLASH Tactile Buttons -->
        <rect x="16" y="166" width="10" height="10" rx="1.5" fill="#334155" stroke="#475569" stroke-width="0.8" />
        <circle cx="21" cy="171" r="2.5" fill="#e2e8f0" />
        <text x="21" y="184" fill="#94a3b8" font-size="5" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">RST</text>

        <rect x="94" y="166" width="10" height="10" rx="1.5" fill="#334155" stroke="#475569" stroke-width="0.8" />
        <circle cx="99" cy="171" r="2.5" fill="#0284c7" />
        <text x="99" y="184" fill="#94a3b8" font-size="5" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">FLASH</text>

        <!-- Micro-USB Female Connector at Bottom -->
        <rect x="44" y="196" width="32" height="17" rx="3" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.2" />
        <rect x="50" y="202" width="20" height="7" rx="1" fill="#0f172a" />

        <!-- Left Header Pins & Labels (15 pins) -->
        ${leftPins.map((label, idx) => {
          const y = 32 + idx * 12;
          return html`
            <circle cx="6" cy="${y}" r="3" fill="#facc15" stroke="#ca8a04" stroke-width="0.8" />
            <text x="14" y="${y + 2}" fill="#94a3b8" font-size="5.5" font-weight="800" font-family="system-ui, sans-serif">${label}</text>
          `;
        })}

        <!-- Right Header Pins & Labels (15 pins) -->
        ${rightPins.map((label, idx) => {
          const y = 32 + idx * 12;
          return html`
            <circle cx="114" cy="${y}" r="3" fill="#facc15" stroke="#ca8a04" stroke-width="0.8" />
            <text x="106" y="${y + 2}" fill="#94a3b8" font-size="5.5" font-weight="800" font-family="system-ui, sans-serif" text-anchor="end">${label}</text>
          `;
        })}
      </svg>
    `;
  }
}

if (!customElements.get('voltflow-nodemcu-esp8266')) {
  customElements.define('voltflow-nodemcu-esp8266', VoltFlowNodeMCUElement);
}
