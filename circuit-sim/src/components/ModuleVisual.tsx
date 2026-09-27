import React from 'react';
import type { PlacedComponent } from '../types';

export type ModuleVisualType =
  | 'dht11-sensor'
  | 'bluetooth-hc05'
  | 'battery-9v'
  | 'coin-cell-3v'
  | 'battery-4x-aa'
  | 'battery-1.5v-aa'
  | 'breadboard-power-supply'
  | 'slide-switch'
  | 'diode-1n4007'
  | 'transistor-npn'
  | 'capacitor-electrolytic'
  | 'capacitor-ceramic'
  | 'inductor'
  | 'zener-diode'
  | 'flex-sensor'
  | 'force-sensor'
  | 'ultrasonic-ping'
  | 'soil-moisture'
  | 'tilt-sensor'
  | 'keypad-4x4'
  | 'dip-switch-4'
  | 'dip-switch-6'
  | 'led-rgb'
  | 'light-bulb'
  | 'neopixel'
  | 'neopixel-ring-12'
  | 'neopixel-ring-16'
  | 'dc-motor'
  | 'dc-motor-encoder'
  | 'gear-motor'
  | 'ir-remote'
  | 'segment-7'
  | 'segment-7-4digit'
  | 'lcd1602-i2c'
  | 'lcd1602'
  | 'ne555'
  | 'opamp'
  | 'pir-sensor'
  | 'relay-5v'
  | 'relay-5v-2ch'
  | 'stepper-motor';

export function hasModuleVisual(type: string): type is ModuleVisualType {
  return [
    'relay-5v',
    'relay-5v-2ch',
    'dht11-sensor',
    'bluetooth-hc05',
    'battery-9v',
    'coin-cell-3v',
    'battery-4x-aa',
    'battery-1.5v-aa',
    'breadboard-power-supply',
    'slide-switch',
    'diode-1n4007',
    'transistor-npn',
    'capacitor-electrolytic',
    'capacitor-ceramic',
    'inductor',
    'zener-diode',
    'flex-sensor',
    'force-sensor',
    'ultrasonic-ping',
    'soil-moisture',
    'tilt-sensor',
    'keypad-4x4',
    'dip-switch-4',
    'dip-switch-6',
    'led-rgb',
    'light-bulb',
    'neopixel',
    'neopixel-ring-12',
    'neopixel-ring-16',
    'dc-motor',
    'dc-motor-encoder',
    'gear-motor',
    'ir-remote',
    'segment-7',
    'segment-7-4digit',
    'lcd1602-i2c',
    'lcd1602',
    'ne555',
    'opamp',
    'pir-sensor',
    'stepper-motor',
  ].includes(type);
}

interface ModuleVisualProps {
  type: ModuleVisualType;
  comp?: PlacedComponent;
  isSelected?: boolean;
  isRunning?: boolean;
  onToggleSwitch?: () => void;
}

const terminalStyle: React.CSSProperties = {
  width: 7,
  height: 7,
  borderRadius: '50%',
  backgroundColor: '#d1d5db',
  border: '1px solid #64748b',
  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.7)',
};

export const ModuleVisual: React.FC<ModuleVisualProps> = ({ type, comp, isSelected, isRunning, onToggleSwitch }) => {
  // 1. DHT11 Sensor
  if (type === 'dht11-sensor') {
    return (
      <div
        aria-label="DHT11 temperature and humidity sensor"
        role="img"
        style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none', userSelect: 'none' }}
      >
        <div
          style={{
            position: 'absolute',
            left: '14%',
            right: '14%',
            top: '7%',
            bottom: '23%',
            borderRadius: 6,
            background: 'linear-gradient(135deg, #38bdf8 0%, #0e7490 55%, #155e75 100%)',
            border: '2px solid #075985',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.36), 0 3px 6px rgba(2,132,199,0.3)',
          }}
        >
          <div style={{ position: 'absolute', left: '12%', right: '12%', top: '15%', display: 'grid', gap: 3 }}>
            {[0, 1, 2, 3, 4].map((slot) => (
              <div key={slot} style={{ height: 2, borderRadius: 4, backgroundColor: 'rgba(8,47,73,0.62)' }} />
            ))}
          </div>
          <span
            style={{
              position: 'absolute',
              bottom: '12%',
              width: '100%',
              textAlign: 'center',
              color: '#e0f2fe',
              fontSize: 9,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontWeight: 900,
              letterSpacing: 0.7,
              textShadow: '0 1px 1px rgba(8,47,73,0.7)',
            }}
          >
            DHT11
          </span>
        </div>
        <div
          style={{
            position: 'absolute',
            left: '14%',
            right: '14%',
            bottom: '6%',
            height: '15%',
            padding: '0 7%',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            alignItems: 'center',
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: 3,
          }}
        >
          {['VCC', 'DATA', 'GND'].map((pin) => (
            <div key={pin} style={{ display: 'grid', justifyItems: 'center', gap: 1 }}>
              <div style={terminalStyle} />
              <span style={{ fontSize: 5, lineHeight: 1, color: '#cbd5e1', fontWeight: 800 }}>{pin}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Bluetooth HC-05 Module
  if (type === 'bluetooth-hc05') {
    const pinNames = ['STATE', 'RXD', 'TXD', 'GND', 'VCC', 'EN'];
    return (
      <div
        aria-label="Bluetooth HC-05 module"
        role="img"
        style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none', userSelect: 'none' }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '6% 5% 18%',
            borderRadius: 6,
            background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 48%, #1e3a8a 100%)',
            border: '2px solid #1e3a8a',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 3px 7px rgba(30,64,175,0.32)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '8%',
              top: '12%',
              width: '24%',
              height: '56%',
              border: '2px solid #fbbf24',
              borderBottom: 'none',
              borderRadius: '12px 12px 0 0',
              opacity: 0.9,
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: '10%',
              top: '14%',
              width: '47%',
              height: '56%',
              display: 'grid',
              placeItems: 'center',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #7dd3fc, #0ea5e9)',
              border: '1px solid #bae6fd',
              color: '#082f49',
              fontSize: 9,
              fontWeight: 950,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              letterSpacing: 0.2,
            }}
          >
            HC-05
          </div>
          <span
            style={{
              position: 'absolute',
              left: '10%',
              bottom: '8%',
              color: '#bfdbfe',
              fontSize: 5,
              fontWeight: 800,
              letterSpacing: 0.6,
            }}
          >
            BLUETOOTH
          </span>
        </div>
        <div
          style={{
            position: 'absolute',
            left: '7%',
            right: '7%',
            bottom: '3%',
            height: '17%',
            padding: '0 4%',
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            alignItems: 'center',
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: 3,
          }}
        >
          {pinNames.map((pin) => (
            <div key={pin} style={{ display: 'grid', justifyItems: 'center', gap: 1 }}>
              <div style={terminalStyle} />
              <span style={{ fontSize: 4.5, lineHeight: 1, color: '#cbd5e1', fontWeight: 800 }}>{pin}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2b. 5V Relay Module (1-Channel)
  if (type === 'relay-5v') {
    const isActive = Boolean(comp?.state?.active || comp?.props?.active);
    return (
      <div
        aria-label="5V 1-Channel Relay Module"
        role="img"
        style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none', userSelect: 'none' }}
      >
        {/* PCB Substrate */}
        <div style={{ position: 'absolute', inset: '4%', borderRadius: 8, backgroundColor: '#0b1120', border: '2px solid #334155', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
          {/* Screw Terminal at Top */}
          <div style={{ position: 'absolute', left: '25%', right: '25%', top: '6%', height: '18%', backgroundColor: '#15803d', border: '1px solid #14532d', borderRadius: 4, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            {['NO', 'COM', 'NC'].map((lbl) => (
              <div key={lbl} style={{ display: 'grid', justifyItems: 'center', gap: 1 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#94a3b8', border: '1px solid #475569' }} />
                <span style={{ fontSize: 4.5, color: '#fff', fontWeight: 900 }}>{lbl}</span>
              </div>
            ))}
          </div>

          {/* Songle Cube */}
          <div style={{ position: 'absolute', left: '26%', right: '26%', top: '28%', bottom: '20%', backgroundColor: isActive ? '#2563eb' : '#1d4ed8', border: '1px solid #3b82f6', borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#ffffff', fontSize: 7, fontWeight: 900, letterSpacing: 0.5 }}>SONGLE</span>
            <span style={{ color: '#93c5fd', fontSize: 4.5, fontWeight: 700 }}>5VDC RELAY</span>
          </div>

          {/* Input Header on Left */}
          <div style={{ position: 'absolute', left: '6%', top: '30%', bottom: '30%', width: '14%', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center' }}>
            {['IN', 'GND', 'VCC'].map((pin) => (
              <div key={pin} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#facc15' }} />
              </div>
            ))}
          </div>

          {/* LED Status */}
          <div style={{ position: 'absolute', right: '10%', bottom: '25%', width: 6, height: 6, borderRadius: '50%', backgroundColor: isActive ? '#22c55e' : '#475569', boxShadow: isActive ? '0 0 6px #22c55e' : 'none' }} />
        </div>
      </div>
    );
  }

  // 2c. 5V Relay Module (2-Channel)
  if (type === 'relay-5v-2ch') {
    const ch1 = Boolean(comp?.state?.ch1Active || comp?.props?.ch1Active);
    const ch2 = Boolean(comp?.state?.ch2Active || comp?.props?.ch2Active);
    return (
      <div
        aria-label="5V 2-Channel Relay Module"
        role="img"
        style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none', userSelect: 'none' }}
      >
        <div style={{ position: 'absolute', inset: '4%', borderRadius: 8, backgroundColor: '#0b1120', border: '2px solid #334155', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
          {/* Top Terminals */}
          <div style={{ position: 'absolute', left: '8%', right: '8%', top: '6%', height: '18%', backgroundColor: '#15803d', border: '1px solid #14532d', borderRadius: 4, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            {['NO1', 'COM1', 'NC1', 'NO2', 'COM2', 'NC2'].map((lbl) => (
              <div key={lbl} style={{ display: 'grid', justifyItems: 'center', gap: 1 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#94a3b8' }} />
                <span style={{ fontSize: 4, color: '#fff', fontWeight: 900 }}>{lbl}</span>
              </div>
            ))}
          </div>

          {/* 2 Cubes */}
          <div style={{ position: 'absolute', left: '10%', right: '10%', top: '28%', bottom: '24%', display: 'flex', gap: 6 }}>
            <div style={{ flex: 1, backgroundColor: ch1 ? '#2563eb' : '#1d4ed8', border: '1px solid #3b82f6', borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 6, fontWeight: 900 }}>SONGLE</span>
              <span style={{ color: '#93c5fd', fontSize: 4, fontWeight: 700 }}>CH1</span>
            </div>
            <div style={{ flex: 1, backgroundColor: ch2 ? '#2563eb' : '#1d4ed8', border: '1px solid #3b82f6', borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 6, fontWeight: 900 }}>SONGLE</span>
              <span style={{ color: '#93c5fd', fontSize: 4, fontWeight: 700 }}>CH2</span>
            </div>
          </div>

          {/* Bottom Header */}
          <div style={{ position: 'absolute', left: '15%', right: '15%', bottom: '6%', height: '14%', backgroundColor: '#18181b', borderRadius: 2, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            {['VCC', 'IN1', 'IN2', 'GND'].map((pin) => (
              <div key={pin} style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#facc15' }} />
                <span style={{ fontSize: 4, color: '#cbd5e1', fontWeight: 800 }}>{pin}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. 9V Alkaline Battery (PP3 / 6F22)
  if (type === 'battery-9v') {
    return (
      <div
        aria-label="9V Alkaline Battery"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: '#0f172a',
          borderRadius: 8,
          border: `2px solid ${isSelected ? '#38bdf8' : '#334155'}`,
          overflow: 'hidden',
          boxShadow: isSelected ? '0 0 16px rgba(56,189,248,0.5)' : '0 4px 14px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          userSelect: 'none',
        }}
      >
        {/* Top Metallic Snap Terminals Area */}
        <div
          style={{
            height: 24,
            background: 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
            borderBottom: '2px solid #475569',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 18px',
          }}
        >
          {/* Positive Octagonal Snap Connector (+) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: 14,
                height: 14,
                backgroundColor: '#f59e0b',
                border: '2px solid #b45309',
                borderRadius: 3,
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#78350f' }} />
            </div>
          </div>

          {/* Negative Circular Snap Stud (-) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: 13,
                height: 13,
                borderRadius: '50%',
                backgroundColor: '#cbd5e1',
                border: '2px solid #64748b',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8), 0 1px 2px rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#475569' }} />
            </div>
          </div>
        </div>

        {/* Gold Accent Collar */}
        <div
          style={{
            height: 12,
            background: 'linear-gradient(90deg, #d97706 0%, #fbbf24 45%, #f59e0b 80%, #b45309 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
          }}
        >
          <span style={{ fontSize: 9, fontWeight: 900, color: '#ef4444' }}>+</span>
          <span style={{ fontSize: 10, fontWeight: 900, color: '#0f172a' }}>−</span>
        </div>

        {/* Battery Main Body */}
        <div
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 70%, #020617 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 8,
            position: 'relative',
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 950,
              color: '#fbbf24',
              letterSpacing: 1,
              textShadow: '0 2px 4px rgba(0,0,0,0.7)',
              lineHeight: 1,
            }}
          >
            9V
          </div>
          <div style={{ fontSize: 7, fontWeight: 800, color: '#94a3b8', letterSpacing: 1.5, marginTop: 4 }}>
            ALKALINE
          </div>
          <div style={{ fontSize: 6, fontWeight: 700, color: '#64748b', marginTop: 2 }}>
            6F22 / PP3
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 6,
              fontSize: 5.5,
              fontWeight: 700,
              color: '#38bdf8',
              letterSpacing: 0.5,
            }}
          >
            VOLTFLOW POWER
          </div>
        </div>
      </div>
    );
  }

  // 4. 3V Coin Cell Battery (CR2032)
  if (type === 'coin-cell-3v') {
    return (
      <div
        aria-label="3V CR2032 Coin Cell Battery"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #e2e8f0 40%, #cbd5e1 70%, #94a3b8 100%)',
          border: `2px solid ${isSelected ? '#38bdf8' : '#94a3b8'}`,
          boxShadow: isSelected ? '0 0 16px rgba(56,189,248,0.5)' : '0 3px 12px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
      >
        {/* Outer Bevel Ring */}
        <div
          style={{
            position: 'absolute',
            inset: 4,
            borderRadius: '50%',
            border: '1px dashed rgba(100,116,139,0.5)',
            pointerEvents: 'none',
          }}
        />

        {/* Top Positive Solder Tab Marker */}
        <span style={{ position: 'absolute', top: 5, fontSize: 11, fontWeight: 900, color: '#ef4444' }}>+</span>

        <div style={{ fontSize: 12, fontWeight: 950, color: '#1e293b', letterSpacing: 0.5, marginTop: 4 }}>
          CR2032
        </div>
        <div style={{ fontSize: 8, fontWeight: 800, color: '#334155', marginTop: 1 }}>
          3V LITHIUM
        </div>
        <div style={{ fontSize: 6, fontWeight: 700, color: '#64748b', letterSpacing: 0.5, marginTop: 2 }}>
          CELL
        </div>

        {/* Bottom Negative Marker */}
        <span style={{ position: 'absolute', bottom: 4, fontSize: 12, fontWeight: 900, color: '#475569' }}>−</span>
      </div>
    );
  }

  // 5. 4x AA Battery Pack (6V)
  if (type === 'battery-4x-aa') {
    return (
      <div
        aria-label="4x AA Battery Pack"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: '#111827',
          borderRadius: 6,
          border: `2px solid ${isSelected ? '#38bdf8' : '#374151'}`,
          padding: '6px 8px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: isSelected ? '0 0 16px rgba(56,189,248,0.5)' : '0 4px 12px rgba(0,0,0,0.5)',
          userSelect: 'none',
        }}
      >
        {/* 4 AA Battery Slots */}
        {[1, 2, 3, 4].map((slot) => (
          <div
            key={slot}
            style={{
              height: 14,
              borderRadius: 3,
              background: 'linear-gradient(90deg, #1e293b 0%, #334155 40%, #f59e0b 85%, #d97706 100%)',
              border: '1px solid #475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 6px',
            }}
          >
            <span style={{ fontSize: 6.5, fontWeight: 800, color: '#cbd5e1' }}>AA 1.5V</span>
            <div style={{ width: 4, height: 7, backgroundColor: '#fef08a', borderRadius: 1 }} />
          </div>
        ))}

        {/* Right Output Leads */}
        <div
          style={{
            position: 'absolute',
            right: 2,
            top: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 22,
          }}
        >
          <div style={{ fontSize: 7, fontWeight: 900, color: '#ef4444' }}>+6V</div>
          <div style={{ fontSize: 7, fontWeight: 900, color: '#94a3b8' }}>GND</div>
        </div>
      </div>
    );
  }

  // 6. Single 1.5V AA Battery
  if (type === 'battery-1.5v-aa') {
    return (
      <div
        aria-label="1.5V AA Battery"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: '#0f172a',
          borderRadius: 6,
          border: `2px solid ${isSelected ? '#38bdf8' : '#334155'}`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isSelected ? '0 0 16px rgba(56,189,248,0.5)' : '0 3px 10px rgba(0,0,0,0.5)',
          userSelect: 'none',
        }}
      >
        {/* Positive Button Nub */}
        <div
          style={{
            height: 12,
            background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 8, fontWeight: 900, color: '#ffffff' }}>+</span>
        </div>

        {/* Main Battery Cylinder */}
        <div
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 4,
          }}
        >
          <span style={{ fontSize: 9, fontWeight: 900, color: '#fbbf24' }}>1.5V</span>
          <span style={{ fontSize: 7, fontWeight: 800, color: '#94a3b8', marginTop: 2 }}>AA</span>
        </div>

        {/* Negative Bottom Base */}
        <div
          style={{
            height: 10,
            backgroundColor: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 9, fontWeight: 900, color: '#f8fafc' }}>−</span>
        </div>
      </div>
    );
  }

  // 7. Breadboard Power Supply Module (MB102)
  if (type === 'breadboard-power-supply') {
    const isPowered = (comp?.props?.powered !== false) && (isRunning ?? true);
    return (
      <div
        aria-label="MB102 Breadboard Power Supply"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: '#090d16',
          borderRadius: 8,
          border: `2px solid ${isSelected ? '#38bdf8' : '#1e293b'}`,
          padding: '4px 6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: isSelected ? '0 0 16px rgba(56,189,248,0.5)' : '0 4px 14px rgba(0,0,0,0.6)',
          userSelect: 'none',
        }}
      >
        {/* Left: DC Jack & USB Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div
            style={{
              width: 22,
              height: 16,
              backgroundColor: '#1e293b',
              borderRadius: 3,
              border: '1px solid #475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#020617' }} />
          </div>
          <span style={{ fontSize: 6, fontWeight: 800, color: '#94a3b8' }}>DC 7-12V</span>
        </div>

        {/* Center: Push Switch & Power LED */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 3,
              backgroundColor: '#dc2626',
              border: '1px solid #ef4444',
              boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#991b1b' }} />
          </div>

          {/* LED Indicator */}
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: isPowered ? '#10b981' : '#334155',
              boxShadow: isPowered ? '0 0 8px #10b981' : 'none',
            }}
          />
          <span style={{ fontSize: 6, fontWeight: 800, color: isPowered ? '#34d399' : '#64748b' }}>
            {isPowered ? 'ON' : 'OFF'}
          </span>
        </div>

        {/* Right Output Rails Info */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 6.5, fontWeight: 800, color: '#ef4444' }}>5V</span>
            <span style={{ fontSize: 6.5, fontWeight: 800, color: '#94a3b8' }}>GND</span>
          </div>
          <span style={{ fontSize: 6, fontWeight: 900, color: '#38bdf8' }}>MB102</span>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 6.5, fontWeight: 800, color: '#f59e0b' }}>3.3V</span>
            <span style={{ fontSize: 6.5, fontWeight: 800, color: '#94a3b8' }}>GND</span>
          </div>
        </div>
      </div>
    );
  }

  // 8. SPDT Slide Switch
  if (type === 'slide-switch') {
    const isRight = comp?.props?.state === 'right';
    return (
      <div
        aria-label="SPDT Slide Switch"
        role="img"
        onClick={onToggleSwitch}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: '#94a3b8',
          borderRadius: 4,
          border: `1.5px solid ${isSelected ? '#38bdf8' : '#64748b'}`,
          padding: 3,
          display: 'flex',
          alignItems: 'center',
          boxShadow: isSelected ? '0 0 12px rgba(56,189,248,0.5)' : '0 2px 8px rgba(0,0,0,0.4)',
          userSelect: 'none',
          cursor: 'pointer',
        }}
      >
        {/* Center Slot */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 18,
            backgroundColor: '#0f172a',
            borderRadius: 3,
            border: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* Slider Actuator Knob */}
          <div
            style={{
              position: 'absolute',
              left: isRight ? 'calc(100% - 20px)' : '2px',
              width: 18,
              height: 14,
              backgroundColor: '#e2e8f0',
              borderRadius: 2,
              border: '1px solid #cbd5e1',
              boxShadow: '0 1px 4px rgba(0,0,0,0.6)',
              transition: 'left 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
            }}
          >
            <div style={{ width: 1.5, height: 8, backgroundColor: '#94a3b8' }} />
            <div style={{ width: 1.5, height: 8, backgroundColor: '#94a3b8' }} />
          </div>
        </div>
      </div>
    );
  }

  // 9. 1N4007 Rectifier Diode
  if (type === 'diode-1n4007') {
    return (
      <div
        aria-label="1N4007 Diode"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
      >
        {/* Left Axial Lead Wire */}
        <div style={{ position: 'absolute', left: 4, right: '50%', height: 2.5, backgroundColor: '#cbd5e1' }} />
        {/* Right Axial Lead Wire */}
        <div style={{ position: 'absolute', left: '50%', right: 4, height: 2.5, backgroundColor: '#cbd5e1' }} />

        {/* Cylinder Body (DO-41) */}
        <div
          style={{
            position: 'relative',
            width: 38,
            height: 18,
            backgroundColor: '#090d16',
            borderRadius: 3,
            border: `1px solid ${isSelected ? '#38bdf8' : '#334155'}`,
            display: 'flex',
            alignItems: 'center',
            boxShadow: isSelected ? '0 0 10px rgba(56,189,248,0.5)' : '0 2px 6px rgba(0,0,0,0.5)',
          }}
        >
          {/* Label */}
          <span style={{ fontSize: 6, fontWeight: 800, color: '#cbd5e1', paddingLeft: 4 }}>1N4007</span>

          {/* Silver Cathode Band */}
          <div
            style={{
              position: 'absolute',
              right: 4,
              top: 0,
              bottom: 0,
              width: 5,
              backgroundColor: '#e2e8f0',
              borderRadius: '0 1px 1px 0',
            }}
          />
        </div>
      </div>
    );
  }

  // 10. NPN Transistor (2N2222 / BC547)
  if (type === 'transistor-npn') {
    return (
      <div
        aria-label="2N2222 NPN Transistor"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
      >
        {/* TO-92 Molded Body */}
        <div
          style={{
            width: 36,
            height: 32,
            backgroundColor: '#090d16',
            border: `1.5px solid ${isSelected ? '#38bdf8' : '#334155'}`,
            borderRadius: '16px 16px 4px 4px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isSelected ? '0 0 10px rgba(56,189,248,0.5)' : '0 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          <span style={{ fontSize: 6.5, fontWeight: 900, color: '#f8fafc' }}>2N2222</span>
          <span style={{ fontSize: 5.5, fontWeight: 800, color: '#38bdf8' }}>NPN</span>
        </div>

        {/* Lead Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', width: 40, marginTop: 4, fontSize: 6, fontWeight: 900, color: '#94a3b8' }}>
          <span>C</span>
          <span>B</span>
          <span>E</span>
        </div>
      </div>
    );
  }

  // 11. Electrolytic Capacitor
  if (type === 'capacitor-electrolytic') {
    return (
      <div
        aria-label="Electrolytic Capacitor"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          userSelect: 'none',
        }}
      >
        {/* Aluminum Can Body */}
        <div
          style={{
            width: 36,
            height: 44,
            background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
            borderRadius: 4,
            border: `1.5px solid ${isSelected ? '#38bdf8' : '#3b82f6'}`,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingLeft: 4,
            boxShadow: isSelected ? '0 0 12px rgba(56,189,248,0.5)' : '0 3px 8px rgba(0,0,0,0.4)',
          }}
        >
          <span style={{ fontSize: 6.5, fontWeight: 900, color: '#ffffff' }}>100µF</span>
          <span style={{ fontSize: 5.5, fontWeight: 700, color: '#93c5fd' }}>16V</span>

          {/* White Negative Stripe on Right Side */}
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: 8,
              backgroundColor: '#e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-around',
            }}
          >
            <span style={{ fontSize: 7, fontWeight: 950, color: '#1e293b' }}>−</span>
            <span style={{ fontSize: 7, fontWeight: 950, color: '#1e293b' }}>−</span>
          </div>
        </div>
      </div>
    );
  }

  // 12. Ceramic Disc Capacitor
  if (type === 'capacitor-ceramic') {
    return (
      <div
        aria-label="Ceramic Disc Capacitor"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          userSelect: 'none',
        }}
      >
        {/* Disc Body */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #ea580c 0%, #c2410c 100%)',
            border: `1.5px solid ${isSelected ? '#38bdf8' : '#9a3412'}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isSelected ? '0 0 10px rgba(56,189,248,0.5)' : '0 2px 6px rgba(0,0,0,0.4)',
          }}
        >
          <span style={{ fontSize: 7, fontWeight: 900, color: '#fef08a' }}>104</span>
          <span style={{ fontSize: 5, fontWeight: 700, color: '#ffffff' }}>50V</span>
        </div>
      </div>
    );
  }

  // 13. Inductor (Axial Molded 100µH)
  if (type === 'inductor') {
    return (
      <div
        aria-label="Inductor"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
      >
        {/* Silver Leads */}
        <div style={{ position: 'absolute', left: 2, right: 2, height: 3, background: 'linear-gradient(180deg, #f8fafc 0%, #cbd5e1 50%, #64748b 100%)', borderRadius: 1.5 }} />
        {/* Molded Body */}
        <div
          style={{
            position: 'relative',
            width: 38,
            height: 18,
            borderRadius: 7,
            background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 45%, #0369a1 80%, #082f49 100%)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
            border: '0.8px solid #0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            padding: '0 4px',
            zIndex: 2,
            overflow: 'hidden',
          }}
        >
          {/* Specular gloss strip */}
          <div style={{ position: 'absolute', top: 1, left: 0, right: 0, height: 4, background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 100%)' }} />
          {/* 4 Bands: Brown, Black, Brown, Silver */}
          <div style={{ width: 3, height: '100%', backgroundColor: '#78350f', zIndex: 3 }} />
          <div style={{ width: 3, height: '100%', backgroundColor: '#18181b', zIndex: 3 }} />
          <div style={{ width: 3, height: '100%', backgroundColor: '#78350f', zIndex: 3 }} />
          <div style={{ width: 3, height: '100%', backgroundColor: '#cbd5e1', zIndex: 3 }} />
        </div>
      </div>
    );
  }

  // 14. Zener Diode
  if (type === 'zener-diode') {
    return (
      <div
        aria-label="Zener Diode"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
      >
        {/* Axial Lead */}
        <div style={{ position: 'absolute', left: 4, right: 4, height: 2, backgroundColor: '#94a3b8' }} />
        {/* Glass DO-35 Body */}
        <div
          style={{
            width: 24,
            height: 12,
            borderRadius: 3,
            background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)',
            border: `1px solid ${isSelected ? '#facc15' : '#0369a1'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingLeft: 3,
            zIndex: 2,
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          {/* Black Cathode Band */}
          <div style={{ width: 4, height: '100%', backgroundColor: '#09090b', borderRadius: '1px 0 0 1px' }} />
        </div>
      </div>
    );
  }

  // 15. Flex Sensor
  if (type === 'flex-sensor') {
    return (
      <div
        aria-label="Flex Sensor"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none',
        }}
      >
        {/* Long Beige Substrate Body */}
        <div
          style={{
            width: 16,
            flex: 1,
            backgroundColor: '#fef3c7',
            border: '1.5px solid #d97706',
            borderRadius: '4px 4px 0 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '4px 0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          }}
        >
          {[...Array(14)].map((_, i) => (
            <div key={i} style={{ width: 10, height: 3, backgroundColor: '#475569', borderRadius: 1 }} />
          ))}
        </div>
        {/* Bottom Pin Leads */}
        <div style={{ display: 'flex', gap: 6, paddingBottom: 2 }}>
          <div style={{ width: 2, height: 10, backgroundColor: '#94a3b8' }} />
          <div style={{ width: 2, height: 10, backgroundColor: '#94a3b8' }} />
        </div>
      </div>
    );
  }

  // 16. Force Sensor (FSR)
  if (type === 'force-sensor') {
    return (
      <div
        aria-label="Force Sensitive Resistor"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          userSelect: 'none',
        }}
      >
        {/* Round Pressure Head */}
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 40%, #cbd5e1 0%, #94a3b8 60%, #64748b 100%)',
            border: `2px solid ${isSelected ? '#38bdf8' : '#475569'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ width: 22, height: 22, borderRadius: '50%', border: '1px dashed #475569' }} />
        </div>
        {/* Thin Flexible Neck */}
        <div style={{ width: 8, height: 50, backgroundColor: '#bae6fd', border: '1px solid #38bdf8', borderTop: 'none' }} />
        {/* Bottom Solder Tabs */}
        <div style={{ display: 'flex', gap: 4 }}>
          <div style={{ width: 2, height: 12, backgroundColor: '#94a3b8' }} />
          <div style={{ width: 2, height: 12, backgroundColor: '#94a3b8' }} />
        </div>
      </div>
    );
  }

  // 17. Ultrasonic Distance Sensor (PING)))
  if (type === 'ultrasonic-ping') {
    return (
      <div
        aria-label="Parallax PING))) Ultrasonic Sensor"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: '#0f4c5c',
          borderRadius: 8,
          border: `2px solid ${isSelected ? '#38bdf8' : '#0a3642'}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 8px',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          userSelect: 'none',
        }}
      >
        {/* Header silkscreen */}
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: 6.5, fontWeight: 900, color: '#e2e8f0' }}>
          <span>PARALLAX</span>
          <span style={{ color: '#38bdf8' }}>PING)))</span>
          <span>REV C</span>
        </div>

        {/* Dual Ultrasonic Transducers */}
        <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', alignItems: 'center' }}>
          {[0, 1].map((idx) => (
            <div
              key={idx}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 40% 40%, #e2e8f0 0%, #94a3b8 70%, #64748b 100%)',
                border: '2px solid #cbd5e1',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6), 0 2px 5px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#ca8a04', border: '1px solid #eab308' }} />
            </div>
          ))}
        </div>

        {/* Pin labels at bottom */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, fontSize: 6.5, fontWeight: 900, color: '#cbd5e1' }}>
          <span>GND</span>
          <span>5V</span>
          <span>SIG</span>
        </div>
      </div>
    );
  }

  // 18. Soil Moisture Sensor
  if (type === 'soil-moisture') {
    return (
      <div
        aria-label="Soil Moisture Sensor"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          userSelect: 'none',
        }}
      >
        {/* Red FR4 Circuit Board Head */}
        <div
          style={{
            width: 38,
            height: 38,
            backgroundColor: '#dc2626',
            borderRadius: 6,
            border: `2px solid ${isSelected ? '#38bdf8' : '#991b1b'}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: 3,
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ fontSize: 6, fontWeight: 900, color: '#ffffff' }}>SOIL</div>
          {/* Surface Mount IC */}
          <div style={{ width: 12, height: 8, backgroundColor: '#09090b', borderRadius: 2 }} />
          {/* Status LED */}
          <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: isRunning ? '#4ade80' : '#7f1d1d' }} />
        </div>

        {/* Dual Silver PCB Immersion Prongs */}
        <div style={{ display: 'flex', gap: 8, flex: 1, paddingTop: 2 }}>
          <div
            style={{
              width: 8,
              height: '100%',
              backgroundColor: '#e2e8f0',
              border: '1.5px solid #94a3b8',
              borderRadius: '0 0 4px 4px',
              borderTop: 'none',
            }}
          />
          <div
            style={{
              width: 8,
              height: '100%',
              backgroundColor: '#e2e8f0',
              border: '1.5px solid #94a3b8',
              borderRadius: '0 0 4px 4px',
              borderTop: 'none',
            }}
          />
        </div>
      </div>
    );
  }

  // Stepper Motor
  if (type === 'stepper-motor') {
    return (
      <div
        aria-label="Stepper Motor (NEMA 17)"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            width: '85%',
            height: '85%',
            borderRadius: 8,
            background: 'linear-gradient(135deg, #334155 0%, #1e293b 50%, #0f172a 100%)',
            border: `2px solid ${isSelected ? '#38bdf8' : '#0f172a'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
          }}
        >
          {/* Outer Rotor Ring */}
          <div
            style={{
              width: '60%',
              height: '60%',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 50%, #64748b 100%)',
              border: '1.5px solid #475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* Center D-Shaft Hub */}
            <div
              style={{
                width: '45%',
                height: '45%',
                borderRadius: '50%',
                backgroundColor: '#1e293b',
                border: '1px solid #0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 3,
                  height: '70%',
                  backgroundColor: '#ef4444',
                  borderRadius: 1,
                  transform: `rotate(${comp?.state?.angle ?? comp?.props?.angle ?? 0}deg)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 19. Tilt Sensor (SW-200D)
  if (type === 'tilt-sensor') {
    return (
      <div
        aria-label="Tilt Sensor SW-200D"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
      >
        {/* Axial Silver Leads */}
        <div style={{ position: 'absolute', left: 4, right: 4, height: 2, backgroundColor: '#94a3b8' }} />
        {/* Green Heat-shrink Cylinder Body */}
        <div
          style={{
            width: 44,
            height: 16,
            borderRadius: 4,
            background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 60%, #15803d 100%)',
            border: `1.5px solid ${isSelected ? '#38bdf8' : '#14532d'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }}
        >
          <span style={{ fontSize: 7, fontWeight: 900, color: '#ffffff', letterSpacing: 0.5 }}>SW-200D</span>
        </div>
      </div>
    );
  }

  // 20. 4x4 Matrix Keypad
  if (type === 'keypad-4x4') {
    const keys = [
      ['1', '2', '3', 'A'],
      ['4', '5', '6', 'B'],
      ['7', '8', '9', 'C'],
      ['*', '0', '#', 'D'],
    ];
    return (
      <div
        aria-label="4x4 Matrix Keypad"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: '#1e293b',
          borderRadius: 8,
          border: `2px solid ${isSelected ? '#38bdf8' : '#0f172a'}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 8,
          boxShadow: '0 6px 14px rgba(0,0,0,0.4)',
          userSelect: 'none',
        }}
      >
        {/* Keypad Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, width: '100%', flex: 1 }}>
          {keys.flat().map((k, i) => (
            <div
              key={i}
              style={{
                backgroundColor: '#0284c7',
                color: '#ffffff',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 900,
                border: '1px solid #0369a1',
                boxShadow: '0 2px 0 #075985',
                cursor: 'pointer',
              }}
            >
              {k}
            </div>
          ))}
        </div>
        {/* Bottom Flexible Ribbon Cable Tail */}
        <div style={{ width: 44, height: 10, backgroundColor: '#0f172a', borderRadius: 2, marginTop: 4, border: '1px solid #334155' }} />
      </div>
    );
  }

  // 21. DIP Switch SPST x 4
  if (type === 'dip-switch-4') {
    return (
      <div
        aria-label="DIP Switch SPST x 4"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: '#0284c7',
          borderRadius: 6,
          border: `2px solid ${isSelected ? '#facc15' : '#0369a1'}`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '4px 6px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          userSelect: 'none',
        }}
      >
        <div style={{ fontSize: 7, fontWeight: 900, color: '#ffffff' }}>ON</div>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              style={{
                width: 7,
                height: 18,
                backgroundColor: '#0f172a',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                padding: 1,
              }}
            >
              <div style={{ width: '100%', height: 7, backgroundColor: '#ffffff', borderRadius: 1 }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: 6.5, fontWeight: 900, color: '#ffffff' }}>
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
        </div>
      </div>
    );
  }

  // 22. DIP Switch SPST x 6
  if (type === 'dip-switch-6') {
    return (
      <div
        aria-label="DIP Switch SPST x 6"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: '#dc2626',
          borderRadius: 6,
          border: `2px solid ${isSelected ? '#facc15' : '#991b1b'}`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '4px 6px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          userSelect: 'none',
        }}
      >
        <div style={{ fontSize: 7, fontWeight: 900, color: '#ffffff' }}>ON</div>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div
              key={num}
              style={{
                width: 7,
                height: 18,
                backgroundColor: '#0f172a',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                padding: 1,
              }}
            >
              <div style={{ width: '100%', height: 7, backgroundColor: '#ffffff', borderRadius: 1 }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: 6.5, fontWeight: 900, color: '#ffffff' }}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>
      </div>
    );
  }

  // 23. RGB LED (4 Leads)
  if (type === 'led-rgb') {
    return (
      <div
        aria-label="RGB LED 4-Pin"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          userSelect: 'none',
        }}
      >
        {/* Frosted Lens Dome */}
        <div
          style={{
            width: 26,
            height: 32,
            borderRadius: '13px 13px 4px 4px',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(226,232,240,0.85) 100%)',
            border: `1.5px solid ${isSelected ? '#38bdf8' : '#94a3b8'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isRunning ? '0 0 16px rgba(56,189,248,0.8)' : '0 2px 6px rgba(0,0,0,0.2)',
          }}
        >
          {/* Internal LED Anode/Cathode Cup */}
          <div style={{ width: 10, height: 8, border: '1px solid #64748b', borderTop: 'none', borderRadius: '0 0 3px 3px' }} />
        </div>
        {/* 4 Downward Spreading Pin Legs (R, Common, G, B) */}
        <div style={{ display: 'flex', gap: 5, marginTop: -1 }}>
          <div style={{ width: 2, height: 26, backgroundColor: '#94a3b8' }} />
          <div style={{ width: 2, height: 30, backgroundColor: '#94a3b8' }} />
          <div style={{ width: 2, height: 26, backgroundColor: '#94a3b8' }} />
          <div style={{ width: 2, height: 26, backgroundColor: '#94a3b8' }} />
        </div>
      </div>
    );
  }

  // 24. Light Bulb
  if (type === 'light-bulb') {
    const isLit = isRunning && (comp?.state?.active || comp?.state?.lit);
    return (
      <div
        aria-label="Incandescent Light Bulb"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          userSelect: 'none',
        }}
      >
        {/* Glass Bulb Envelope */}
        <div
          style={{
            width: 36,
            height: 44,
            borderRadius: '18px 18px 10px 10px',
            background: isLit
              ? 'radial-gradient(circle at 50% 40%, #fef08a 0%, #facc15 70%, #eab308 100%)'
              : 'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.9) 0%, rgba(226,232,240,0.7) 100%)',
            border: `1.5px solid ${isLit ? '#facc15' : '#cbd5e1'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isLit ? '0 0 24px 8px rgba(250,204,21,0.8)' : '0 2px 6px rgba(0,0,0,0.15)',
          }}
        >
          {/* Filament */}
          <div style={{ width: 8, height: 12, border: `1.5px solid ${isLit ? '#ffffff' : '#64748b'}`, borderBottom: 'none', borderRadius: '4px 4px 0 0' }} />
        </div>
        {/* Edison Screw Base */}
        <div
          style={{
            width: 18,
            height: 18,
            background: 'repeating-linear-gradient(180deg, #475569, #475569 3px, #334155 3px, #334155 6px)',
            borderRadius: '0 0 4px 4px',
            border: '1px solid #1e293b',
          }}
        />
        {/* Solder Tip Contact */}
        <div style={{ width: 8, height: 4, backgroundColor: '#94a3b8', borderRadius: '0 0 3px 3px' }} />
      </div>
    );
  }

  // 25. NeoPixel Single Breakout
  if (type === 'neopixel') {
    return (
      <div
        aria-label="NeoPixel WS2812 Breakout"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: '#0f172a',
          borderRadius: 6,
          border: `1.5px solid ${isSelected ? '#38bdf8' : '#334155'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          userSelect: 'none',
        }}
      >
        {/* Central 5050 RGB LED Package */}
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 3,
            backgroundColor: '#ffffff',
            border: '1px solid #94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isRunning ? '0 0 14px rgba(56,189,248,0.9)' : 'none',
          }}
        >
          <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#0284c7' }} />
        </div>
      </div>
    );
  }

  // 26. NeoPixel Ring 12
  if (type === 'neopixel-ring-12') {
    return (
      <div
        aria-label="NeoPixel Ring 12"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          backgroundColor: '#0f172a',
          border: `2px solid ${isSelected ? '#38bdf8' : '#334155'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          userSelect: 'none',
        }}
      >
        {/* Center Hole */}
        <div style={{ width: '45%', height: '45%', borderRadius: '50%', backgroundColor: '#f8fafc', border: '1.5px solid #cbd5e1' }} />
        {/* 12 WS2812 SMD LEDs */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 360) / 12;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: 8,
                height: 8,
                backgroundColor: '#ffffff',
                border: '1px solid #94a3b8',
                borderRadius: 1,
                transform: `rotate(${angle}deg) translate(32px) rotate(-${angle}deg)`,
                boxShadow: isRunning ? '0 0 6px rgba(56,189,248,0.8)' : 'none',
              }}
            />
          );
        })}
      </div>
    );
  }

  // 27. NeoPixel Ring 16
  if (type === 'neopixel-ring-16') {
    return (
      <div
        aria-label="NeoPixel Ring 16"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          backgroundColor: '#0f172a',
          border: `2px solid ${isSelected ? '#38bdf8' : '#334155'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          userSelect: 'none',
        }}
      >
        {/* Center Hole */}
        <div style={{ width: '52%', height: '52%', borderRadius: '50%', backgroundColor: '#f8fafc', border: '1.5px solid #cbd5e1' }} />
        {/* 16 WS2812 SMD LEDs */}
        {[...Array(16)].map((_, i) => {
          const angle = (i * 360) / 16;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: 8,
                height: 8,
                backgroundColor: '#ffffff',
                border: '1px solid #94a3b8',
                borderRadius: 1,
                transform: `rotate(${angle}deg) translate(42px) rotate(-${angle}deg)`,
                boxShadow: isRunning ? '0 0 6px rgba(56,189,248,0.8)' : 'none',
              }}
            />
          );
        })}
      </div>
    );
  }

  // 28. DC Motor
  if (type === 'dc-motor') {
    return (
      <div
        aria-label="Standard DC Motor"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
      >
        {/* Cylindrical Metal Motor Can */}
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #f1f5f9 0%, #cbd5e1 60%, #94a3b8 100%)',
            border: `2px solid ${isSelected ? '#38bdf8' : '#64748b'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          }}
        >
          {/* Central Motor Shaft */}
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#334155',
              border: '1.5px solid #0f172a',
              boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.5)',
            }}
          />
        </div>
        {/* Terminal Solder Lugs */}
        <div style={{ position: 'absolute', bottom: 4, display: 'flex', gap: 20 }}>
          <div style={{ width: 4, height: 8, backgroundColor: '#ca8a04', borderRadius: 1 }} />
          <div style={{ width: 4, height: 8, backgroundColor: '#ca8a04', borderRadius: 1 }} />
        </div>
      </div>
    );
  }

  // 29. DC Motor with Encoder
  if (type === 'dc-motor-encoder') {
    return (
      <div
        aria-label="DC Motor with Optical Encoder"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
      >
        {/* Cylindrical Motor Body */}
        <div
          style={{
            width: 50,
            height: 44,
            borderRadius: 6,
            background: 'linear-gradient(180deg, #e2e8f0 0%, #94a3b8 100%)',
            border: `2px solid ${isSelected ? '#38bdf8' : '#64748b'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          }}
        >
          {/* Rear Black Encoder Disc Housing */}
          <div style={{ width: 44, height: 18, backgroundColor: '#09090b', borderRadius: 3, border: '1px solid #334155' }} />
        </div>
        {/* 6-Pin Ribbon Cable */}
        <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
          {['#ef4444', '#09090b', '#3b82f6', '#22c55e', '#eab308', '#ffffff'].map((c, i) => (
            <div key={i} style={{ width: 3, height: 8, backgroundColor: c, borderRadius: 1 }} />
          ))}
        </div>
      </div>
    );
  }

  // 30. Hobby TT Gearmotor
  if (type === 'gear-motor') {
    return (
      <div
        aria-label="Yellow TT Hobby Gearmotor"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
      >
        {/* Rectangular Yellow Gearbox Housing */}
        <div
          style={{
            width: 38,
            height: 70,
            backgroundColor: '#eab308',
            borderRadius: 6,
            border: `2px solid ${isSelected ? '#38bdf8' : '#ca8a04'}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 4,
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          }}
        >
          {/* White Output Axle Spindle */}
          <div style={{ width: 14, height: 14, backgroundColor: '#ffffff', borderRadius: 3, border: '1px solid #cbd5e1' }} />
          {/* Motor Can visible behind */}
          <div style={{ width: 28, height: 26, backgroundColor: '#cbd5e1', borderRadius: 4, border: '1px solid #94a3b8' }} />
        </div>
        {/* Dual Wire Terminals */}
        <div style={{ display: 'flex', gap: 14, marginTop: -2 }}>
          <div style={{ width: 3, height: 8, backgroundColor: '#ca8a04' }} />
          <div style={{ width: 3, height: 8, backgroundColor: '#ca8a04' }} />
        </div>
      </div>
    );
  }

  // 31. IR Remote Control
  if (type === 'ir-remote') {
    return (
      <div
        aria-label="IR Remote Control"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: '#1e293b',
          borderRadius: 8,
          border: `2px solid ${isSelected ? '#38bdf8' : '#0f172a'}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '6px 4px',
          boxShadow: '0 6px 14px rgba(0,0,0,0.4)',
          userSelect: 'none',
        }}
      >
        {/* Top IR LED Emitter */}
        <div style={{ width: 6, height: 4, backgroundColor: '#ef4444', borderRadius: '3px 3px 0 0', marginTop: -6 }} />
        {/* Power Button */}
        <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ef4444', marginTop: 4, border: '1px solid #b91c1c' }} />
        {/* Keypad Buttons Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, marginTop: 8, width: '80%' }}>
          {[...Array(15)].map((_, i) => (
            <div key={i} style={{ height: 7, backgroundColor: '#475569', borderRadius: 2 }} />
          ))}
        </div>
      </div>
    );
  }

  // 32. 7-Segment Single Digit Display
  if (type === 'segment-7') {
    return (
      <div
        aria-label="7 Segment Display"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: '#18181b',
          borderRadius: 6,
          border: `2px solid ${isSelected ? '#38bdf8' : '#27272a'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
          userSelect: 'none',
        }}
      >
        {/* 7 Segment Figure 8 Pattern */}
        <div style={{ position: 'relative', width: 22, height: 38 }}>
          {/* Segment A */}
          <div style={{ position: 'absolute', top: 0, left: 2, right: 2, height: 3, backgroundColor: '#3f3f46', borderRadius: 1 }} />
          {/* Segment B */}
          <div style={{ position: 'absolute', top: 2, right: 0, width: 3, height: 16, backgroundColor: '#3f3f46', borderRadius: 1 }} />
          {/* Segment C */}
          <div style={{ position: 'absolute', bottom: 2, right: 0, width: 3, height: 16, backgroundColor: '#3f3f46', borderRadius: 1 }} />
          {/* Segment D */}
          <div style={{ position: 'absolute', bottom: 0, left: 2, right: 2, height: 3, backgroundColor: '#3f3f46', borderRadius: 1 }} />
          {/* Segment E */}
          <div style={{ position: 'absolute', bottom: 2, left: 0, width: 3, height: 16, backgroundColor: '#3f3f46', borderRadius: 1 }} />
          {/* Segment F */}
          <div style={{ position: 'absolute', top: 2, left: 0, width: 3, height: 16, backgroundColor: '#3f3f46', borderRadius: 1 }} />
          {/* Segment G */}
          <div style={{ position: 'absolute', top: 18, left: 2, right: 2, height: 3, backgroundColor: '#3f3f46', borderRadius: 1 }} />
          {/* Decimal Point DP */}
          <div style={{ position: 'absolute', bottom: 0, right: -6, width: 3, height: 3, borderRadius: '50%', backgroundColor: '#3f3f46' }} />
        </div>
      </div>
    );
  }

  // 33. 4-Digit 7-Segment Display (TM1637)
  if (type === 'segment-7-4digit') {
    return (
      <div
        aria-label="4-Digit 7-Segment Display Module"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: '#09090b',
          borderRadius: 8,
          border: `2px solid ${isSelected ? '#38bdf8' : '#27272a'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '4px 8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
          userSelect: 'none',
        }}
      >
        {[0, 1, 2, 3].map((d) => (
          <React.Fragment key={d}>
            <div style={{ width: 18, height: 30, backgroundColor: '#18181b', borderRadius: 3, border: '1px solid #27272a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: isRunning ? '#ef4444' : '#3f3f46', fontFamily: 'monospace' }}>8</span>
            </div>
            {d === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: isRunning ? '#ef4444' : '#3f3f46' }} />
                <div style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: isRunning ? '#ef4444' : '#3f3f46' }} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // 34. LCD 16x2 with I2C Backpack
  if (type === 'lcd1602-i2c' || type === 'lcd1602') {
    const rawText = comp?.state?.text || comp?.props?.text;
    const splitText = typeof rawText === 'string' ? rawText.split('\n') : [];
    const line1 = comp?.state?.line1 ?? comp?.props?.line1 ?? splitText[0] ?? 'VoltFlow Studio';
    const line2 = comp?.state?.line2 ?? comp?.props?.line2 ?? splitText[1] ?? '';

    return (
      <div
        aria-label="LCD 16x2 Display"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: '#15803d',
          borderRadius: 6,
          border: `2px solid ${isSelected ? '#38bdf8' : '#166534'}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 6,
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          userSelect: 'none',
        }}
      >
        {/* Blue Backlight Screen Glass */}
        <div
          style={{
            width: '92%',
            height: '75%',
            backgroundColor: isRunning ? '#1d4ed8' : '#1e3a8a',
            borderRadius: 4,
            border: '2px solid #0f172a',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            padding: '4px 6px',
            fontFamily: 'monospace',
            color: '#ffffff',
            boxShadow: isRunning ? 'inset 0 0 10px rgba(59,130,246,0.8)' : 'inset 0 0 6px rgba(0,0,0,0.6)',
          }}
        >
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>{line1}</div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>{line2}</div>
        </div>

        {/* 4-Pin I2C Header Silkscreen at bottom */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '92%', gap: 10, fontSize: 6.5, fontWeight: 900, color: '#fef08a' }}>
          <span>GND</span>
          <span>VCC</span>
          <span>SDA</span>
          <span>SCL</span>
        </div>
      </div>
    );
  }

  // 35. NE555 Timer & LM741 Op-Amp IC DIP-8
  if (type === 'ne555' || type === 'opamp') {
    const label = type === 'ne555' ? 'NE555' : 'LM741';
    return (
      <div
        aria-label={`${label} IC`}
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: '#1e293b',
          borderRadius: 4,
          border: `2px solid ${isSelected ? '#38bdf8' : '#0f172a'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
          color: '#f8fafc',
          fontFamily: 'monospace',
          fontWeight: 800,
          fontSize: 12,
          letterSpacing: 1,
          userSelect: 'none',
        }}
      >
        <div style={{ position: 'absolute', left: 2, top: '50%', transform: 'translateY(-50%)', width: 6, height: 12, borderRadius: '0 6px 6px 0', backgroundColor: '#0f172a' }} />
        <div style={{ position: 'absolute', left: 8, bottom: 6, width: 4, height: 4, borderRadius: '50%', backgroundColor: '#64748b' }} />
        {label}
      </div>
    );
  }

  // 35. Parallax PIR Motion Sensor Rev B (matches Tinkercad format 1:1)
  if (type === 'pir-sensor') {
    const isMotion = isRunning && (Boolean(comp?.props?.motionDetected) || Boolean(comp?.state?.motionDetected));

    // 12 radial facet wedge sectors for the 3D Fresnel dome
    const facets = Array.from({ length: 12 }, (_, i) => {
      const a1 = (i * 30 * Math.PI) / 180;
      const a2 = ((i + 1) * 30 * Math.PI) / 180;
      const rIn = 13.5;
      const rOut = 32;
      const cx = 62;
      const cy = 42;

      const xIn1 = (cx + rIn * Math.cos(a1)).toFixed(2);
      const yIn1 = (cy + rIn * Math.sin(a1)).toFixed(2);
      const xIn2 = (cx + rIn * Math.cos(a2)).toFixed(2);
      const yIn2 = (cy + rIn * Math.sin(a2)).toFixed(2);

      const xOut1 = (cx + rOut * Math.cos(a1)).toFixed(2);
      const yOut1 = (cy + rOut * Math.sin(a1)).toFixed(2);
      const xOut2 = (cx + rOut * Math.cos(a2)).toFixed(2);
      const yOut2 = (cy + rOut * Math.sin(a2)).toFixed(2);

      const d = `M ${xIn1} ${yIn1} L ${xOut1} ${yOut1} A ${rOut} ${rOut} 0 0 1 ${xOut2} ${yOut2} L ${xIn2} ${yIn2} A ${rIn} ${rIn} 0 0 0 ${xIn1} ${yIn1} Z`;
      const isEven = i % 2 === 0;

      return (
        <path
          key={i}
          d={d}
          fill={isEven ? 'rgba(255, 255, 255, 0.42)' : 'rgba(226, 232, 240, 0.16)'}
          stroke="rgba(148, 163, 184, 0.4)"
          strokeWidth="0.65"
        />
      );
    });

    return (
      <div
        aria-label="Parallax PIR Motion Sensor Rev B"
        role="img"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          userSelect: 'none',
          filter: isSelected ? 'drop-shadow(0 0 5px #38bdf8)' : 'drop-shadow(0 3px 6px rgba(0,0,0,0.45))',
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 124 98" style={{ overflow: 'visible' }}>
          <defs>
            {/* PCB Matte Green Gradient */}
            <linearGradient id="pirPcbGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0e5c26" />
              <stop offset="100%" stopColor="#09461b" />
            </linearGradient>

            {/* 3D Fresnel Dome Radial Shading */}
            <radialGradient id="pirLensGrad" cx="42%" cy="40%" r="58%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#f8fafc" />
              <stop offset="70%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </radialGradient>

            {/* Mounting Hole Metallic Washer Gradient */}
            <radialGradient id="pirWasherGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#e2e8f0" />
              <stop offset="85%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#64748b" />
            </radialGradient>

            {/* Silver Pin Gradient */}
            <linearGradient id="pirPinGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#cbd5e1" />
              <stop offset="70%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
          </defs>

          {/* 1. Main PCB Dark Green Board */}
          <rect
            x="0"
            y="0"
            width="124"
            height="84"
            rx="2.5"
            ry="2.5"
            fill="url(#pirPcbGrad)"
            stroke={isSelected ? '#38bdf8' : '#063815'}
            strokeWidth="1.2"
          />

          {/* 2. Left Mounting Hole (Silver collar + dark hole) */}
          <g id="pir-mount-left">
            <circle cx="10" cy="42" r="6.8" fill="url(#pirWasherGrad)" stroke="#64748b" strokeWidth="0.6" />
            <polygon
              points="10,36.5 13.9,38.1 15.5,42 13.9,45.9 10,47.5 6.1,45.9 4.5,42 6.1,38.1"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="0.5"
            />
            <circle cx="10" cy="42" r="3.2" fill="#0f172a" stroke="#334155" strokeWidth="0.5" />
          </g>

          {/* 3. Right Mounting Hole (Silver collar + dark hole) */}
          <g id="pir-mount-right">
            <circle cx="114" cy="42" r="6.8" fill="url(#pirWasherGrad)" stroke="#64748b" strokeWidth="0.6" />
            <polygon
              points="114,36.5 117.9,38.1 119.5,42 117.9,45.9 114,47.5 110.1,45.9 108.5,42 110.1,38.1"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="0.5"
            />
            <circle cx="114" cy="42" r="3.2" fill="#0f172a" stroke="#334155" strokeWidth="0.5" />
          </g>

          {/* 4. Top-Left Silkscreen (3 test pads with G, +, L) */}
          <g id="pir-silkscreen-left-top">
            <text x="5" y="14" fill="#ffffff" fontSize="5.5" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="end">G</text>
            <circle cx="10" cy="12" r="2.2" fill="#0e5c26" stroke="#ffffff" strokeWidth="0.8" />
            <circle cx="10" cy="12" r="0.8" fill="#ca8a04" />

            <text x="5" y="21" fill="#ffffff" fontSize="6.5" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="end">+</text>
            <circle cx="10" cy="19" r="2.2" fill="#0e5c26" stroke="#ffffff" strokeWidth="0.8" />
            <circle cx="10" cy="19" r="0.8" fill="#ca8a04" />

            <text x="5" y="28" fill="#ffffff" fontSize="5.5" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="end">L</text>
            <circle cx="10" cy="26" r="2.2" fill="#0e5c26" stroke="#ffffff" strokeWidth="0.8" />
            <circle cx="10" cy="26" r="0.8" fill="#ca8a04" />
          </g>

          {/* 5. Bottom-Left Silkscreen ("PARALLAX" vertically) */}
          <text
            x="11"
            y="76"
            fill="#ffffff"
            fontSize="6.2"
            fontWeight="900"
            fontFamily="system-ui, sans-serif"
            letterSpacing="0.8"
            transform="rotate(-90 11 76)"
            textAnchor="start"
            style={{ pointerEvents: 'none' }}
          >
            PARALLAX
          </text>

          {/* 6. Top-Right Silkscreen ("PIR Sensor" & "Rev B" vertically) */}
          <text
            x="111"
            y="11"
            fill="#ffffff"
            fontSize="5.5"
            fontWeight="800"
            fontFamily="system-ui, sans-serif"
            letterSpacing="0.3"
            transform="rotate(90 111 11)"
            textAnchor="start"
            style={{ pointerEvents: 'none' }}
          >
            PIR Sensor
          </text>
          <text
            x="117"
            y="13"
            fill="#ffffff"
            fontSize="5.2"
            fontWeight="800"
            fontFamily="system-ui, sans-serif"
            transform="rotate(90 117 13)"
            textAnchor="start"
            style={{ pointerEvents: 'none' }}
          >
            Rev B
          </text>

          {/* 7. Bottom-Right Silkscreen ("555-28027" vertically) */}
          <text
            x="114"
            y="54"
            fill="#ffffff"
            fontSize="5.8"
            fontWeight="900"
            fontFamily="system-ui, sans-serif"
            letterSpacing="0.4"
            transform="rotate(90 114 54)"
            textAnchor="start"
            style={{ pointerEvents: 'none' }}
          >
            555-28027
          </text>

          {/* 8. Center Square Bezel (Light Mint-White Mounting Base Plate) */}
          <rect
            x="24"
            y="5"
            width="76"
            height="74"
            rx="3.5"
            ry="3.5"
            fill="#eef7f0"
            stroke="#c8e4d0"
            strokeWidth="1"
          />

          {/* 9. Fresnel Lens 3D Convex Dome */}
          <g id="pir-fresnel-lens">
            {/* Outer Dome Base */}
            <circle
              cx="62"
              cy="42"
              r="32"
              fill="url(#pirLensGrad)"
              stroke="#d1d5db"
              strokeWidth="1.2"
              filter={isMotion ? 'drop-shadow(0 0 6px rgba(34,197,94,0.85))' : undefined}
            />

            {/* 12 Radial Facet Wedge Sectors */}
            {facets}

            {/* Concentric Middle Ring */}
            <circle cx="62" cy="42" r="22" fill="none" stroke="rgba(148, 163, 184, 0.35)" strokeWidth="0.75" />

            {/* Concentric Inner Hub Ring */}
            <circle cx="62" cy="42" r="13.5" fill="url(#pirLensGrad)" stroke="rgba(148, 163, 184, 0.55)" strokeWidth="0.8" />

            {/* Center Dimple / Pip */}
            <circle cx="62" cy="42" r="4" fill="#e2e8f0" stroke="rgba(148, 163, 184, 0.7)" strokeWidth="0.6" />
            <circle cx="62" cy="42" r="1.5" fill="#cbd5e1" />

            {/* Glossy Specular Highlight Crescent along Bottom-Left Edge */}
            <path
              d="M 37,42 A 25,25 0 0,0 58,66 A 29,29 0 0,1 33,42 Z"
              fill="rgba(255, 255, 255, 0.72)"
            />

            {/* Subtle Top-Right Rim Reflection */}
            <path
              d="M 62,11 A 31,31 0 0,1 91,38 A 31,31 0 0,0 65,13 Z"
              fill="rgba(255, 255, 255, 0.35)"
            />

            {/* Active Motion Detection Indicator Glow */}
            {isMotion && (
              <circle
                cx="62"
                cy="42"
                r="32"
                fill="none"
                stroke="#22c55e"
                strokeWidth="2.5"
                opacity="0.9"
              />
            )}
          </g>

          {/* 10. Bottom Pin Header (Black Plastic Shroud) */}
          <rect
            x="47"
            y="81"
            width="30"
            height="5"
            rx="1"
            ry="1"
            fill="#18181b"
            stroke="#09090b"
            strokeWidth="0.8"
          />
          {/* Header 3 Pin Recesses */}
          <rect x="50.5" y="81.5" width="3" height="3" fill="#27272a" />
          <rect x="60.5" y="81.5" width="3" height="3" fill="#27272a" />
          <rect x="70.5" y="81.5" width="3" height="3" fill="#27272a" />

          {/* 11. Three Protruding Silver Metallic Pins */}
          <rect x="51" y="86" width="2" height="11" rx="0.5" fill="url(#pirPinGrad)" />
          <rect x="61" y="86" width="2" height="11" rx="0.5" fill="url(#pirPinGrad)" />
          <rect x="71" y="86" width="2" height="11" rx="0.5" fill="url(#pirPinGrad)" />
        </svg>
      </div>
    );
  }

  return null;
};

