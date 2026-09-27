import { LitElement, html, css } from 'lit';

export class VoltFlowRelayModuleElement extends LitElement {
  static properties = {
    active: { type: Boolean },
  };

  active = false;

  readonly pinInfo = [
    { name: 'NO', x: 45, y: 16 },
    { name: 'COM', x: 70, y: 16 },
    { name: 'NC', x: 95, y: 16 },
    { name: 'IN', x: 14, y: 36 },
    { name: 'GND', x: 14, y: 50 },
    { name: 'VCC', x: 14, y: 64 },
  ];

  static styles = css`
    :host {
      display: inline-block;
      width: 140px;
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
    const relayColor = this.active ? '#2563eb' : '#1d4ed8';
    const statusLed = this.active ? '#22c55e' : '#475569';

    return html`
      <svg viewBox="0 0 140 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="relay-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.4)" />
          </filter>
          <linearGradient id="pcb-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0f172a" />
            <stop offset="100%" stop-color="#020617" />
          </linearGradient>
          <linearGradient id="screw-terminal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#15803d" />
            <stop offset="100%" stop-color="#166534" />
          </linearGradient>
        </defs>

        <!-- PCB Substrate -->
        <rect x="2" y="2" width="136" height="96" rx="8" fill="url(#pcb-grad)" stroke="#334155" stroke-width="1.5" filter="url(#relay-shadow)" />
        
        <!-- Corner Mounting Holes -->
        <circle cx="10" cy="10" r="3.5" fill="#1e293b" stroke="#64748b" stroke-width="1" />
        <circle cx="130" cy="10" r="3.5" fill="#1e293b" stroke="#64748b" stroke-width="1" />
        <circle cx="10" cy="90" r="3.5" fill="#1e293b" stroke="#64748b" stroke-width="1" />
        <circle cx="130" cy="90" r="3.5" fill="#1e293b" stroke="#64748b" stroke-width="1" />

        <!-- Silkscreen Header Labels -->
        <text x="70" y="14" fill="#38bdf8" font-size="7" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">5V RELAY MODULE</text>

        <!-- Songle High-Current Relay Cube Body -->
        <rect x="36" y="22" width="68" height="52" rx="3" fill=${relayColor} stroke="#3b82f6" stroke-width="1.2" />
        <!-- Songle Silkscreen Branding -->
        <text x="70" y="38" fill="#ffffff" font-size="8.5" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle" letter-spacing="1">SONGLE</text>
        <text x="70" y="48" fill="#93c5fd" font-size="6" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle">10A 250VAC / 10A 30VDC</text>
        <text x="70" y="58" fill="#bfdbfe" font-size="6" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle">SRD-05VDC-SL-C</text>
        <text x="70" y="68" fill="#60a5fa" font-size="5" font-weight="600" font-family="system-ui, sans-serif" text-anchor="middle">⚡ HIGH VOLTAGE ISOLATED</text>

        <!-- 3-Way Screw Terminal Block at Top (NO, COM, NC) -->
        <rect x="34" y="4" width="72" height="15" rx="2" fill="url(#screw-terminal)" stroke="#14532d" stroke-width="1" />
        <!-- Screw Heads -->
        <circle cx="45" cy="11.5" r="4.5" fill="#94a3b8" stroke="#475569" stroke-width="0.8" />
        <line x1="42.5" y1="11.5" x2="47.5" y2="11.5" stroke="#1e293b" stroke-width="1" />
        <circle cx="70" cy="11.5" r="4.5" fill="#94a3b8" stroke="#475569" stroke-width="0.8" />
        <line x1="67.5" y1="11.5" x2="72.5" y2="11.5" stroke="#1e293b" stroke-width="1" />
        <circle cx="95" cy="11.5" r="4.5" fill="#94a3b8" stroke="#475569" stroke-width="0.8" />
        <line x1="92.5" y1="11.5" x2="97.5" y2="11.5" stroke="#1e293b" stroke-width="1" />
        
        <!-- Labels for Screw Terminals -->
        <text x="45" y="24" fill="#94a3b8" font-size="5.5" font-weight="800" font-family="system-ui, sans-serif" text-anchor="middle">NO</text>
        <text x="70" y="24" fill="#94a3b8" font-size="5.5" font-weight="800" font-family="system-ui, sans-serif" text-anchor="middle">COM</text>
        <text x="95" y="24" fill="#94a3b8" font-size="5.5" font-weight="800" font-family="system-ui, sans-serif" text-anchor="middle">NC</text>

        <!-- 3-Pin Input Header on Left (IN, GND, VCC) -->
        <rect x="8" y="30" width="12" height="40" rx="1.5" fill="#18181b" stroke="#27272a" stroke-width="1" />
        <!-- Gold / Silver Terminal Pins -->
        <circle cx="14" cy="36" r="2.5" fill="#facc15" stroke="#ca8a04" stroke-width="0.7" />
        <circle cx="14" cy="50" r="2.5" fill="#facc15" stroke="#ca8a04" stroke-width="0.7" />
        <circle cx="14" cy="64" r="2.5" fill="#facc15" stroke="#ca8a04" stroke-width="0.7" />
        <text x="23" y="38" fill="#e2e8f0" font-size="5.5" font-weight="800" font-family="system-ui, sans-serif">IN</text>
        <text x="23" y="52" fill="#e2e8f0" font-size="5.5" font-weight="800" font-family="system-ui, sans-serif">GND</text>
        <text x="23" y="66" fill="#e2e8f0" font-size="5.5" font-weight="800" font-family="system-ui, sans-serif">VCC</text>

        <!-- Optocoupler IC (EL817) -->
        <rect x="18" y="78" width="16" height="12" rx="1" fill="#1e293b" stroke="#334155" stroke-width="0.8" />
        <circle cx="21" cy="81" r="1" fill="#64748b" />
        <text x="26" y="86" fill="#64748b" font-size="4" font-weight="700" font-family="monospace">817C</text>

        <!-- SMD Free-Wheeling Diode (D1) -->
        <rect x="112" y="36" width="10" height="6" rx="0.5" fill="#0f172a" stroke="#475569" stroke-width="0.6" />
        <line x1="114" y1="36" x2="114" y2="42" stroke="#cbd5e1" stroke-width="1" />

        <!-- Power LED (Red) -->
        <circle cx="115" cy="62" r="3.5" fill="#ef4444" style=${this.active ? 'filter:drop-shadow(0 0 3px #ef4444)' : ''} />
        <text x="115" y="71" fill="#94a3b8" font-size="4.5" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle">PWR</text>

        <!-- Relay Status LED (Green) -->
        <circle cx="115" cy="80" r="3.5" fill=${statusLed} style=${this.active ? 'filter:drop-shadow(0 0 4px #22c55e)' : ''} />
        <text x="115" y="89" fill="#94a3b8" font-size="4.5" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle">RLY</text>
      </svg>
    `;
  }
}

export class VoltFlowRelay2ChElement extends LitElement {
  static properties = {
    ch1Active: { type: Boolean },
    ch2Active: { type: Boolean },
  };

  ch1Active = false;
  ch2Active = false;

  readonly pinInfo = [
    { name: 'NO1', x: 24, y: 10 },
    { name: 'COM1', x: 54, y: 10 },
    { name: 'NC1', x: 84, y: 10 },
    { name: 'NO2', x: 116, y: 10 },
    { name: 'COM2', x: 146, y: 10 },
    { name: 'NC2', x: 176, y: 10 },
    { name: 'VCC', x: 40, y: 100 },
    { name: 'IN1', x: 80, y: 100 },
    { name: 'IN2', x: 120, y: 100 },
    { name: 'GND', x: 160, y: 100 },
  ];

  static styles = css`
    :host {
      display: inline-block;
      width: 200px;
      height: 110px;
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
      <svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="relay2-shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.4)" />
          </filter>
        </defs>

        <!-- PCB Substrate -->
        <rect x="2" y="2" width="196" height="106" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1.5" filter="url(#relay2-shadow)" />

        <!-- Silkscreen Header Labels -->
        <text x="100" y="24" fill="#38bdf8" font-size="8" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">2-CHANNEL 5V RELAY</text>

        <!-- Channel 1 Songle Cube -->
        <rect x="18" y="32" width="76" height="52" rx="3" fill=${this.ch1Active ? '#2563eb' : '#1d4ed8'} stroke="#3b82f6" stroke-width="1.2" />
        <text x="56" y="52" fill="#ffffff" font-size="8.5" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">SONGLE</text>
        <text x="56" y="63" fill="#93c5fd" font-size="6" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle">CH1 (10A 250V)</text>

        <!-- Channel 2 Songle Cube -->
        <rect x="106" y="32" width="76" height="52" rx="3" fill=${this.ch2Active ? '#2563eb' : '#1d4ed8'} stroke="#3b82f6" stroke-width="1.2" />
        <text x="144" y="52" fill="#ffffff" font-size="8.5" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">SONGLE</text>
        <text x="144" y="63" fill="#93c5fd" font-size="6" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle">CH2 (10A 250V)</text>

        <!-- Screw Terminals at Top -->
        <rect x="10" y="4" width="86" height="14" rx="2" fill="#15803d" stroke="#14532d" stroke-width="1" />
        <circle cx="24" cy="10" r="4" fill="#94a3b8" />
        <circle cx="54" cy="10" r="4" fill="#94a3b8" />
        <circle cx="84" cy="10" r="4" fill="#94a3b8" />

        <rect x="104" y="4" width="86" height="14" rx="2" fill="#15803d" stroke="#14532d" stroke-width="1" />
        <circle cx="116" cy="10" r="4" fill="#94a3b8" />
        <circle cx="146" cy="10" r="4" fill="#94a3b8" />
        <circle cx="176" cy="10" r="4" fill="#94a3b8" />

        <!-- Pins at Bottom Header -->
        <rect x="25" y="93" width="150" height="14" rx="2" fill="#18181b" stroke="#27272a" stroke-width="1" />
        <circle cx="40" cy="100" r="2.5" fill="#facc15" />
        <circle cx="80" cy="100" r="2.5" fill="#facc15" />
        <circle cx="120" cy="100" r="2.5" fill="#facc15" />
        <circle cx="160" cy="100" r="2.5" fill="#facc15" />
        <text x="40" y="90" fill="#94a3b8" font-size="5" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle">VCC</text>
        <text x="80" y="90" fill="#94a3b8" font-size="5" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle">IN1</text>
        <text x="120" y="90" fill="#94a3b8" font-size="5" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle">IN2</text>
        <text x="160" y="90" fill="#94a3b8" font-size="5" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle">GND</text>
      </svg>
    `;
  }
}

if (!customElements.get('voltflow-relay-module')) {
  customElements.define('voltflow-relay-module', VoltFlowRelayModuleElement);
}
if (!customElements.get('voltflow-relay-2ch')) {
  customElements.define('voltflow-relay-2ch', VoltFlowRelay2ChElement);
}
