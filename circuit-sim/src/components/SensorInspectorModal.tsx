import React from 'react';
import { Sliders, Activity, AlertTriangle, Sun, Moon, Flame, Radio, Circle, Thermometer } from 'lucide-react';
import type { PlacedComponent } from '../types';

interface SensorInspectorProps {
  component: PlacedComponent;
  onUpdateProps: (id: string, props: Record<string, any>) => void;
  isRunning: boolean;
}

function formatResistance(r: number): string {
  if (r >= 1000000) return `${(r / 1000000).toFixed(r % 1000000 === 0 ? 0 : 1)} MΩ`;
  if (r >= 1000) return `${(r / 1000).toFixed(r % 1000 === 0 ? 0 : 1)} kΩ`;
  return `${r} Ω`;
}

export const SensorInspectorModal: React.FC<SensorInspectorProps> = ({
  component,
  onUpdateProps,
  isRunning,
}) => {
  const { id, type, name, props } = component;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        zIndex: 45,
        backgroundColor: '#1e293b',
        border: '1px solid #38bdf8',
        borderRadius: 10,
        padding: '14px 18px',
        width: 320,
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        color: '#f8fafc',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sliders size={16} color="#38bdf8" /> Live Component Inspector
        </span>
        {isRunning && (
          <span style={{ fontSize: 10, fontWeight: 700, backgroundColor: '#059669', color: '#ffffff', padding: '2px 8px', borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Activity size={12} /> LIVE
          </span>
        )}
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, color: '#38bdf8' }}>
        {name}
      </div>

      {/* 0. Resistor Resistance Slider & Multi-Preset Inspector */}
      {type === 'resistor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>
            <span>Resistance Value:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="number"
                min="1"
                max="10000000"
                value={props.resistance ?? 220}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                  onUpdateProps(id, { resistance: val });
                }}
                style={{
                  width: 90,
                  padding: '4px 8px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #38bdf8',
                  borderRadius: 6,
                  color: '#38bdf8',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: 12,
                  textAlign: 'right',
                }}
              />
              <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 12 }}>
                {formatResistance(props.resistance ?? 220)}
              </span>
            </div>
          </div>

          {/* Real-time Smooth Range Slider (10Ω to 1MΩ) */}
          <input
            type="range"
            min="10"
            max="1000000"
            step="10"
            value={props.resistance ?? 220}
            onChange={(e) => onUpdateProps(id, { resistance: parseInt(e.target.value, 10) })}
            style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
          />

          {/* Quick Resistance Preset Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {[
              { label: '220 Ω', val: 220 },
              { label: '330 Ω', val: 330 },
              { label: '1 kΩ', val: 1000 },
              { label: '2.2 kΩ', val: 2200 },
              { label: '4.7 kΩ', val: 4700 },
              { label: '10 kΩ', val: 10000 },
              { label: '100 kΩ', val: 100000 },
              { label: '1 MΩ', val: 1000000 },
            ].map((preset) => {
              const active = (props.resistance ?? 220) === preset.val;
              return (
                <button
                  key={preset.val}
                  onClick={() => onUpdateProps(id, { resistance: preset.val })}
                  style={{
                    padding: '5px 4px',
                    fontSize: 10,
                    fontWeight: 700,
                    borderRadius: 6,
                    border: active ? '1px solid #38bdf8' : '1px solid #334155',
                    backgroundColor: active ? 'rgba(56, 189, 248, 0.2)' : '#0f172a',
                    color: active ? '#38bdf8' : '#cbd5e1',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 1. HC-SR04 Ultrasonic Distance Controls */}
      {type === 'ultrasonic-hcsr04' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>
            <span>Target Distance:</span>
            <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{props.distance ?? 15} cm</span>
          </div>
          <input
            type="range"
            min="2"
            max="400"
            value={props.distance ?? 15}
            onChange={(e) => onUpdateProps(id, { distance: parseInt(e.target.value, 10) })}
            style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
          />
          <div style={{ height: 6, backgroundColor: '#0f172a', borderRadius: 3, overflow: 'hidden', marginTop: 2 }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, ((props.distance ?? 15) / 400) * 100)}%`,
                backgroundColor: (props.distance ?? 15) < 20 ? '#ef4444' : '#10b981',
                transition: 'width 0.15s ease',
              }}
            />
          </div>
          <span style={{ fontSize: 10, color: (props.distance ?? 15) < 20 ? '#f87171' : '#34d399', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {(props.distance ?? 15) < 20 ? <><AlertTriangle size={12} /> Obstacle Alarm Threshold (&lt;20cm)</> : '✓ Safe Clearance Zone (>20cm)'}
          </span>
        </div>
      )}

      {/* 2. MQ-2 & MQ-5 Gas Sensor Controls */}
      {(type === 'gas-sensor' || type === 'mq5-sensor') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>
            <span>Gas Concentration (PPM):</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="number"
                min="0"
                max="1000"
                step="10"
                value={props.gasPpm ?? props.ppm ?? 250}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(1000, parseInt(e.target.value, 10) || 0));
                  onUpdateProps(id, { gasPpm: val, ppm: val });
                }}
                style={{
                  width: 80,
                  padding: '4px 8px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: 6,
                  color: '#f97316',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: 12,
                  textAlign: 'right',
                }}
              />
              <span style={{ color: '#94a3b8', fontSize: 11 }}>PPM</span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {[
              { label: '🍃 Clean Air', val: 200, color: '#10b981' },
              { label: '⚠️ Warning', val: 450, color: '#f59e0b' },
              { label: '🔥 Smoke Hazard', val: 850, color: '#ef4444' },
            ].map((preset) => (
              <button
                key={preset.val}
                onClick={() => onUpdateProps(id, { gasPpm: preset.val, ppm: preset.val })}
                style={{
                  padding: '6px 4px',
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: 6,
                  border: `1px solid ${preset.color}40`,
                  backgroundColor: `${preset.color}15`,
                  color: preset.color,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <span style={{ fontSize: 10, color: (props.gasPpm ?? props.ppm ?? 250) > 400 ? '#f87171' : '#34d399', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {(props.gasPpm ?? props.ppm ?? 250) > 400 ? <><Flame size={12} /> HAZARD: Combustible Smoke Detected!</> : '🍃 Normal Clean Air Levels'}
          </span>
        </div>
      )}

      {/* 3. PIR Motion Sensor Controls */}
      {type === 'pir-sensor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12, color: '#cbd5e1', fontWeight: 600 }}>
            Infrared Motion State:
          </div>
          <button
            onClick={() => onUpdateProps(id, { motionDetected: !props.motionDetected })}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: 'none',
              backgroundColor: props.motionDetected ? '#ef4444' : '#10b981',
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Radio size={14} /> {props.motionDetected ? 'Motion Active (HIGH)' : 'No Motion (LOW)'}
          </button>
        </div>
      )}

      {/* 4. LDR Photoresistor Sensor Controls */}
      {type === 'ldr-sensor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>
            <span>Ambient Light Level:</span>
            <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{props.lightLevel ?? 500} Lux</span>
          </div>
          <input
            type="range"
            min="0"
            max="1000"
            value={props.lightLevel ?? 500}
            onChange={(e) => onUpdateProps(id, { lightLevel: parseInt(e.target.value, 10) })}
            style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
          />
          <span style={{ fontSize: 10, color: (props.lightLevel ?? 500) < 400 ? '#38bdf8' : '#fbbf24', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {(props.lightLevel ?? 500) < 400 ? <><Moon size={12} /> Night / Dark Ambient Mode</> : <><Sun size={12} /> Bright Daylight Ambient Mode</>}
          </span>
        </div>
      )}

      {/* 5. Potentiometer Dial Controls */}
      {type === 'potentiometer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>
            <span>Analog Output:</span>
            <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{props.value ?? 512} / 1023</span>
          </div>
          <input
            type="range"
            min="0"
            max="1023"
            value={props.value ?? 512}
            onChange={(e) => onUpdateProps(id, { value: parseInt(e.target.value, 10) })}
            style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
          />
          <span style={{ fontSize: 10, color: '#94a3b8' }}>
            Voltage Output: {(((props.value ?? 512) / 1023) * 5.0).toFixed(2)}V
          </span>
        </div>
      )}

      {/* 6. Pushbutton Switch Controls */}
      {type === 'pushbutton' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onMouseDown={() => onUpdateProps(id, { pressed: true })}
            onMouseUp={() => onUpdateProps(id, { pressed: false })}
            onTouchStart={() => onUpdateProps(id, { pressed: true })}
            onTouchEnd={() => onUpdateProps(id, { pressed: false })}
            style={{
              padding: '10px 14px',
              borderRadius: 6,
              border: 'none',
              backgroundColor: props.pressed ? '#0284c7' : '#3b82f6',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: props.pressed ? 'inset 0 2px 4px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            <Circle size={14} fill={props.pressed ? '#ffffff' : 'none'} /> {props.pressed ? 'BUTTON PRESSED (LOW)' : 'Press & Hold Button'}
          </button>
        </div>
      )}

      {/* 7. DHT11 & DHT22 Temperature & Humidity Sensor */}
      {(type === 'dht11-sensor' || type === 'dht11' || type === 'dht22') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>
            <span>🌡 Temperature:</span>
            <span style={{ color: '#f97316', fontFamily: 'monospace' }}>{props.temperature ?? 25} °C</span>
          </div>
          <input type="range" min="0" max="50" value={props.temperature ?? 25}
            onChange={(e) => onUpdateProps(id, { temperature: parseInt(e.target.value, 10) })}
            style={{ width: '100%', accentColor: '#f97316', cursor: 'pointer' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginTop: 4 }}>
            <span>💧 Humidity:</span>
            <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{props.humidity ?? 60} %</span>
          </div>
          <input type="range" min="0" max="100" value={props.humidity ?? 60}
            onChange={(e) => onUpdateProps(id, { humidity: parseInt(e.target.value, 10) })}
            style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
          <span style={{ fontSize: 10, color: '#94a3b8' }}>
            Heat Index: {Math.round((props.temperature ?? 25) + 0.33 * ((props.humidity ?? 60) / 100 * 6.105) - 4.0).toFixed(1)} °C
          </span>
        </div>
      )}

      {/* 7d. Soil Moisture Sensor */}
      {(type === 'soil-moisture' || type === 'soil') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>
            <span>🌱 Soil Moisture:</span>
            <span style={{ color: (props.moisture ?? 45) > 60 ? '#38bdf8' : (props.moisture ?? 45) > 25 ? '#10b981' : '#f59e0b', fontFamily: 'monospace', fontWeight: 700 }}>
              {props.moisture ?? 45} %
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={props.moisture ?? 45}
            onChange={(e) => onUpdateProps(id, { moisture: parseInt(e.target.value, 10) })}
            style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
          />
          <div style={{ height: 6, backgroundColor: '#0f172a', borderRadius: 3, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${props.moisture ?? 45}%`,
                backgroundColor: (props.moisture ?? 45) > 60 ? '#38bdf8' : (props.moisture ?? 45) > 25 ? '#10b981' : '#f59e0b',
                transition: 'width 0.15s ease',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>
            <span>Condition: {(props.moisture ?? 45) > 60 ? '💧 Wet / Saturated' : (props.moisture ?? 45) > 25 ? '🌿 Optimal Moist' : '🍂 Dry Soil'}</span>
            <span>ADC: {Math.round(((props.moisture ?? 45) / 100) * 1023)}</span>
          </div>
        </div>
      )}

      {/* 7e. Force / Pressure Sensor (FSR402) */}
      {(type === 'force-sensor' || type === 'pressure-sensor') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>
            <span>⚖️ Applied Force / Pressure:</span>
            <span style={{ color: '#f59e0b', fontFamily: 'monospace', fontWeight: 700 }}>
              {props.force ?? 250} g ({(((props.force ?? 250) * 9.81) / 1000).toFixed(2)} N)
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1000"
            step="10"
            value={props.force ?? 250}
            onChange={(e) => onUpdateProps(id, { force: parseInt(e.target.value, 10) })}
            style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>
            <span>Est. Resistance: {(props.force ?? 250) === 0 ? '> 1 MΩ' : `${Math.round(100000 / Math.max(1, props.force ?? 250))} Ω`}</span>
            <span>Signal: {(props.force ?? 250) === 0 ? 'No Touch' : (props.force ?? 250) > 500 ? 'Hard Press' : 'Light Touch'}</span>
          </div>
        </div>
      )}

      {/* 7f. Flex Sensor */}
      {type === 'flex-sensor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>
            <span>📐 Flex Bend Angle:</span>
            <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 700 }}>
              {props.bend ?? props.angle ?? 0}°
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="90"
            value={props.bend ?? props.angle ?? 0}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              onUpdateProps(id, { bend: val, angle: val });
            }}
            style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>
            <span>Flat (25kΩ) ──► 90° Bend (100kΩ)</span>
            <span>R: {Math.round(25000 + ((props.bend ?? 0) / 90) * 75000)} Ω</span>
          </div>
        </div>
      )}

      {/* 7g. Tilt / Ball Switch Sensor */}
      {type === 'tilt-sensor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>
            <span>🔄 Orientation:</span>
            <span style={{ color: props.tilted ? '#ef4444' : '#10b981', fontFamily: 'monospace', fontWeight: 700 }}>
              {props.tilted ? '⚠️ TILTED (Contact Closed)' : '✓ UPRIGHT (Contact Open)'}
            </span>
          </div>
          <button
            onClick={() => onUpdateProps(id, { tilted: !props.tilted })}
            style={{
              padding: '8px 12px',
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: props.tilted ? '#ef4444' : '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            {props.tilted ? '🔄 Restore Upright Position' : '📐 Tilt Sensor (Trigger Switch)'}
          </button>
        </div>
      )}

      {/* 7h. Parallax PING))) Distance Sensor */}
      {type === 'ultrasonic-ping' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>
            <span>Target Distance:</span>
            <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{props.distance ?? 15} cm</span>
          </div>
          <input
            type="range"
            min="2"
            max="300"
            value={props.distance ?? 15}
            onChange={(e) => onUpdateProps(id, { distance: parseInt(e.target.value, 10) })}
            style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
          />
          <div style={{ height: 6, backgroundColor: '#0f172a', borderRadius: 3, overflow: 'hidden', marginTop: 2 }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, ((props.distance ?? 15) / 300) * 100)}%`,
                backgroundColor: (props.distance ?? 15) < 20 ? '#ef4444' : '#10b981',
                transition: 'width 0.15s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* 7i. Bluetooth HC-05 Module Live Controller */}
      {type === 'bluetooth-hc05' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#cbd5e1' }}>
            <span>Status:</span>
            <span style={{ color: props.connected ? '#10b981' : '#38bdf8', fontWeight: 700, fontFamily: 'monospace' }}>
              {props.connected ? '● CONNECTED' : '○ PAIRING / AT MODE'}
            </span>
          </div>
          <button
            onClick={() => onUpdateProps(id, { connected: !props.connected })}
            style={{
              padding: '6px 12px',
              fontSize: 11,
              fontWeight: 700,
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: props.connected ? '#ef4444' : '#0284c7',
              color: '#ffffff',
            }}
          >
            {props.connected ? 'Disconnect Device' : 'Simulate Phone Pair (Connect)'}
          </button>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="text"
              placeholder="Send UART text (e.g. 1 / 0)..."
              id={`bt-input-${id}`}
              style={{ flex: 1, padding: '4px 8px', borderRadius: 4, border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', fontSize: 11, outline: 'none' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const input = e.currentTarget;
                  if (input.value) {
                    onUpdateProps(id, { lastReceived: input.value, rxTimestamp: Date.now() });
                    input.value = '';
                  }
                }
              }}
            />
            <button
              onClick={() => {
                const el = document.getElementById(`bt-input-${id}`) as HTMLInputElement | null;
                if (el && el.value) {
                  onUpdateProps(id, { lastReceived: el.value, rxTimestamp: Date.now() });
                  el.value = '';
                }
              }}
              style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700, backgroundColor: '#38bdf8', color: '#0f172a', borderRadius: 4, border: 'none', cursor: 'pointer' }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* 7j. MPU6050 6-Axis Motion Sensor */}
      {type === 'mpu6050' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#cbd5e1' }}>
            <span>Pitch (X): {props.pitch ?? 0}°</span>
            <span>Roll (Y): {props.roll ?? 0}°</span>
            <span>Yaw (Z): {props.yaw ?? 0}°</span>
          </div>
          <input
            type="range"
            min="-90"
            max="90"
            value={props.pitch ?? 0}
            onChange={(e) => onUpdateProps(id, { pitch: parseInt(e.target.value, 10) })}
            style={{ width: '100%', accentColor: '#f97316', cursor: 'pointer' }}
          />
          <input
            type="range"
            min="-90"
            max="90"
            value={props.roll ?? 0}
            onChange={(e) => onUpdateProps(id, { roll: parseInt(e.target.value, 10) })}
            style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
          />
        </div>
      )}

      {/* 7b. LM35 Precision Analog Temperature Sensor */}
      {type === 'lm35' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Thermometer size={14} color="#f97316" /> Ambient Temp:
            </span>
            <span style={{ color: '#f97316', fontFamily: 'monospace', fontWeight: 700 }}>
              {props.temperature ?? 25} °C ({(Math.round(((props.temperature ?? 25) * 9) / 5 + 32))} °F)
            </span>
          </div>
          <input
            type="range"
            min="-10"
            max="110"
            value={props.temperature ?? 25}
            onChange={(e) => onUpdateProps(id, { temperature: parseInt(e.target.value, 10) })}
            style={{ width: '100%', accentColor: '#f97316', cursor: 'pointer' }}
          />
          <div style={{ height: 6, backgroundColor: '#0f172a', borderRadius: 3, overflow: 'hidden', marginTop: 2 }}>
            <div
              style={{
                height: '100%',
                width: `${Math.max(0, Math.min(100, (((props.temperature ?? 25) + 10) / 120) * 100))}%`,
                backgroundColor: (props.temperature ?? 25) > 40 ? '#ef4444' : (props.temperature ?? 25) < 15 ? '#38bdf8' : '#10b981',
                transition: 'width 0.15s ease',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>
            <div>VOUT Pin Signal: {(((props.temperature ?? 25) * 10)).toFixed(0)} mV ({((props.temperature ?? 25) * 0.01).toFixed(3)} V)</div>
            <div>ADC Value (0-1023): {Math.max(0, Math.min(1023, Math.round(((props.temperature ?? 25) * 0.01 * 1023) / 5.0)))}</div>
          </div>
        </div>
      )}

      {/* 7c. IR Obstacle Avoidance Sensor Module Controls */}
      {type === 'ir-sensor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Radio size={14} color="#38bdf8" /> Target Distance:
            </span>
            <span style={{ color: (props.distance ?? 10) <= 10 || props.obstacleDetected ? '#ef4444' : '#10b981', fontFamily: 'monospace', fontWeight: 700 }}>
              {props.distance ?? 10} cm
            </span>
          </div>
          <input
            type="range"
            min="2"
            max="30"
            value={props.distance ?? 10}
            onChange={(e) => {
              const dist = parseInt(e.target.value, 10);
              onUpdateProps(id, { distance: dist, obstacleDetected: dist <= 10 });
            }}
            style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
          />
          <div style={{ height: 6, backgroundColor: '#0f172a', borderRadius: 3, overflow: 'hidden', marginTop: 2 }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, (((props.distance ?? 10) / 30) * 100))}%`,
                backgroundColor: (props.distance ?? 10) <= 10 || props.obstacleDetected ? '#ef4444' : '#10b981',
                transition: 'width 0.15s ease',
              }}
            />
          </div>
          <button
            onClick={() => onUpdateProps(id, { obstacleDetected: !props.obstacleDetected })}
            style={{
              padding: '8px 12px',
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: props.obstacleDetected || (props.distance ?? 10) <= 10 ? '#ef4444' : '#10b981',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Radio size={14} />
            {props.obstacleDetected || (props.distance ?? 10) <= 10
              ? '🔴 OBSTACLE DETECTED (OUT = LOW)'
              : '🟢 CLEAR / NO OBSTACLE (OUT = HIGH)'}
          </button>
        </div>
      )}

      {/* 8. Servo Motor angle display */}
      {type === 'servo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>
            <span>⚙️ Servo Angle:</span>
            <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>
              {component.state?.angle !== undefined ? component.state.angle : (props.angle ?? 0)}°
            </span>
          </div>
          <input type="range" min="0" max="180" value={component.state?.angle !== undefined ? component.state.angle : (props.angle ?? 0)}
            onChange={(e) => {
              const newAngle = parseInt(e.target.value, 10);
              onUpdateProps(id, { angle: newAngle });
            }}
            style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
          <span style={{ fontSize: 10, color: '#94a3b8' }}>
            {isRunning ? 'Angle is controlled live by sketch' : 'Drag to manually set position'}
          </span>
        </div>
      )}

      {/* 8b. Stepper Motor angle & step controls */}
      {type === 'stepper-motor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>
            <span>🔄 Stepper Angle:</span>
            <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 700 }}>
              {Math.round(((component.state?.angle !== undefined ? component.state.angle : (props.angle ?? 0)) % 360 + 360) % 360)}°
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
            <span>Step Count:</span>
            <span style={{ color: '#facc15', fontFamily: 'monospace' }}>{component.state?.step ?? props.step ?? 0} steps</span>
          </div>

          <input
            type="range"
            min="0"
            max="360"
            value={((component.state?.angle !== undefined ? component.state.angle : (props.angle ?? 0)) % 360 + 360) % 360}
            onChange={(e) => {
              const newAngle = parseInt(e.target.value, 10);
              onUpdateProps(id, { angle: newAngle, step: Math.round((newAngle / 360) * 200) });
            }}
            style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
          />

          {/* Quick preset step buttons */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[-90, -45, 0, 45, 90, 180, 360].map((deg) => (
              <button
                key={deg}
                onClick={() => {
                  const current = component.state?.angle ?? props.angle ?? 0;
                  const nextAngle = deg === 0 ? 0 : (current + deg) % 360;
                  onUpdateProps(id, { angle: nextAngle, step: (component.state?.step ?? 0) + Math.round((deg / 360) * 200) });
                }}
                style={{
                  flex: 1,
                  minWidth: 36,
                  padding: '4px 0',
                  fontSize: 10,
                  fontWeight: 700,
                  backgroundColor: '#334155',
                  color: '#38bdf8',
                  border: '1px solid #0284c7',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                {deg > 0 ? `+${deg}°` : `${deg}°`}
              </button>
            ))}
          </div>

          <span style={{ fontSize: 10, color: '#94a3b8' }}>
            {isRunning ? 'Motor is stepping dynamically in live simulation' : 'Use controls above for manual step testing'}
          </span>
        </div>
      )}

      {/* 9. 1-Channel 5V Relay Controls */}
      {type === 'relay-5v' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div
            style={{
              backgroundColor: component.state?.active ? 'rgba(16,185,129,0.15)' : 'rgba(30,41,59,0.8)',
              border: `1px solid ${component.state?.active ? '#10b981' : '#475569'}`,
              borderRadius: 6,
              padding: '8px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: component.state?.active ? '#34d399' : '#94a3b8' }}>
              {component.state?.active ? '⚡ COIL ENERGIZED (5V Active)' : '○ COIL IDLE (De-energized)'}
            </div>
            <div style={{ fontSize: 10, color: '#e2e8f0', fontFamily: 'monospace' }}>
              Contact Path: {component.state?.active ? 'COM ──► NO (Circuit Closed)' : 'COM ──► NC (Normal Closed)'}
            </div>
          </div>

          {/* Manual Relay Coil Trigger Override */}
          <button
            onClick={() => onUpdateProps(id, { manualEnergize: !props.manualEnergize })}
            style={{
              padding: '6px 12px',
              fontSize: 11,
              fontWeight: 700,
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: props.manualEnergize ? '#ef4444' : '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}
          >
            {props.manualEnergize ? '🔴 Release Manual Override' : '⚡ Manual Coil Trigger Test'}
          </button>

          {/* Trigger Logic Polarity Selection */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#cbd5e1' }}>
            <span>Trigger Polarity:</span>
            <button
              onClick={() => onUpdateProps(id, { activeLow: !props.activeLow })}
              style={{
                padding: '3px 8px',
                fontSize: 10,
                fontWeight: 700,
                borderRadius: 4,
                border: '1px solid #38bdf8',
                backgroundColor: 'transparent',
                color: '#38bdf8',
                cursor: 'pointer',
              }}
            >
              {props.activeLow ? 'ACTIVE LOW (0V)' : 'ACTIVE HIGH (5V)'}
            </button>
          </div>
        </div>
      )}

      {/* 10. 2-Channel 5V Relay Controls */}
      {type === 'relay-5v-2ch' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Channel 1 */}
          <div
            style={{
              backgroundColor: component.state?.active1 ? 'rgba(16,185,129,0.15)' : 'rgba(30,41,59,0.8)',
              border: `1px solid ${component.state?.active1 ? '#10b981' : '#475569'}`,
              borderRadius: 6,
              padding: '6px 8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: component.state?.active1 ? '#34d399' : '#94a3b8' }}>
                CH1: {component.state?.active1 ? '⚡ ENERGIZED (COM1-NO1)' : '○ IDLE (COM1-NC1)'}
              </div>
            </div>
            <button
              onClick={() => onUpdateProps(id, { manualEnergize1: !props.manualEnergize1 })}
              style={{
                padding: '3px 8px',
                fontSize: 10,
                fontWeight: 700,
                borderRadius: 4,
                border: 'none',
                backgroundColor: props.manualEnergize1 ? '#ef4444' : '#0284c7',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              {props.manualEnergize1 ? 'Release' : 'Test CH1'}
            </button>
          </div>

          {/* Channel 2 */}
          <div
            style={{
              backgroundColor: component.state?.active2 ? 'rgba(16,185,129,0.15)' : 'rgba(30,41,59,0.8)',
              border: `1px solid ${component.state?.active2 ? '#10b981' : '#475569'}`,
              borderRadius: 6,
              padding: '6px 8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: component.state?.active2 ? '#34d399' : '#94a3b8' }}>
                CH2: {component.state?.active2 ? '⚡ ENERGIZED (COM2-NO2)' : '○ IDLE (COM2-NC2)'}
              </div>
            </div>
            <button
              onClick={() => onUpdateProps(id, { manualEnergize2: !props.manualEnergize2 })}
              style={{
                padding: '3px 8px',
                fontSize: 10,
                fontWeight: 700,
                borderRadius: 4,
                border: 'none',
                backgroundColor: props.manualEnergize2 ? '#ef4444' : '#0284c7',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              {props.manualEnergize2 ? 'Release' : 'Test CH2'}
            </button>
          </div>

          {/* Trigger Polarity */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#cbd5e1' }}>
            <span>Trigger Polarity:</span>
            <button
              onClick={() => onUpdateProps(id, { activeLow: !props.activeLow })}
              style={{
                padding: '3px 8px',
                fontSize: 10,
                fontWeight: 700,
                borderRadius: 4,
                border: '1px solid #38bdf8',
                backgroundColor: 'transparent',
                color: '#38bdf8',
                cursor: 'pointer',
              }}
            >
              {props.activeLow ? 'ACTIVE LOW (0V)' : 'ACTIVE HIGH (5V)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
