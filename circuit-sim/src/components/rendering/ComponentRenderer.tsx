import React from 'react';
import type { PlacedComponent, ComponentDefinition } from '../../types';

interface ComponentRendererProps {
  comp: PlacedComponent;
  compDef?: ComponentDefinition;
  isSelected: boolean;
  isRunning: boolean;
  onToggleSwitch?: () => void;
}

/**
 * ── VoltFlow Tinkercad-Exact Component Rendering System ────────────────────────
 * 100% scalable 2.5D physical artwork matching Tinkercad Circuits component models:
 * - Solder mask depth, drop shadows, and silkscreen geometry
 * - Exact materials: translucent LED epoxy, ceramic resistor waist, brushed metal plates,
 *   ABS breadboards with spring clips, Songle relay cubes, and molded servo housings
 * - Live dynamic states: rotating servo horn, glowing LED dies, sliding switch handles,
 *   potentiometer indicator angles, and animated ultrasonic sound pulses
 */
export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  comp,
  isSelected,
  isRunning,
  onToggleSwitch,
}) => {
  const { type, props, state } = comp;

  switch (type) {
    case 'arduino-uno':
      return <ArduinoUnoRenderer isSelected={isSelected} isRunning={isRunning} />;

    case 'arduino-nano':
      return <ArduinoNanoRenderer isSelected={isSelected} isRunning={isRunning} />;

    case 'esp32-devkit':
      return <ESP32Renderer isSelected={isSelected} isRunning={isRunning} />;

    case 'nodemcu-esp8266':
      return <NodeMCURenderer isSelected={isSelected} isRunning={isRunning} />;

    case 'pir-sensor':
      return <PIRSensorRenderer isSelected={isSelected} isRunning={isRunning} isMotion={Boolean(props?.motionDetected || state?.motionDetected)} />;

    case 'servo':
      return <ServoMotorRenderer isSelected={isSelected} isRunning={isRunning} angle={state?.angle ?? props?.angle ?? 90} />;

    case 'stepper-motor':
      return (
        <StepperMotorRenderer
          isSelected={isSelected}
          isRunning={isRunning}
          angle={state?.angle ?? props?.angle ?? 0}
          step={state?.step ?? props?.step ?? 0}
        />
      );

    case 'led':
      return (
        <LEDRenderer
          isSelected={isSelected}
          isRunning={isRunning}
          color={props?.color || 'red'}
          isOn={Boolean(isRunning && (state?.ledOn || props?.value))}
          brightness={state?.brightness ?? props?.brightness ?? 1}
          burnedOut={Boolean(state?.burnedOut || props?.burnedOut)}
        />
      );

    case 'resistor':
      return <ResistorRenderer isSelected={isSelected} resistance={props?.resistance ?? 220} />;

    case 'pushbutton':
      return <PushbuttonRenderer isSelected={isSelected} isPressed={Boolean(props?.pressed || state?.pressed)} color={props?.color || 'blue'} />;

    case 'potentiometer':
      return <PotentiometerRenderer isSelected={isSelected} value={props?.value ?? 512} />;

    case 'battery-9v':
      return <Battery9VRenderer isSelected={isSelected} />;

    case 'coin-cell-3v':
      return <CoinCellRenderer isSelected={isSelected} />;

    case 'battery-1.5v-aa':
      return <BatteryAARenderer isSelected={isSelected} />;

    case 'battery-4x-aa':
      return <BatteryPack4xAARenderer isSelected={isSelected} />;

    case 'buzzer':
      return <PiezoBuzzerRenderer isSelected={isSelected} isSounding={Boolean(isRunning && (state?.sounding || state?.active))} />;

    case 'slide-switch':
      return <SlideSwitchRenderer isSelected={isSelected} switchState={props?.state || 'left'} onToggle={onToggleSwitch} />;


    case 'diode-1n4007':
    case 'zener-diode':
      return <DiodeRenderer isSelected={isSelected} isZener={type === 'zener-diode'} />;

    case 'transistor-npn':
      return <TransistorRenderer isSelected={isSelected} />;

    case 'capacitor-electrolytic':
      return <CapacitorElectrolyticRenderer isSelected={isSelected} capacitance={props?.capacitance || '100µF'} />;

    case 'capacitor-ceramic':
      return <CapacitorCeramicRenderer isSelected={isSelected} />;

    case 'lcd1602':
    case 'lcd1602-i2c':
      return <LCD1602Renderer isSelected={isSelected} isRunning={isRunning} text={state?.text || props?.text || 'VoltFlow Studio'} />;

    case 'esp-01':
      return <ESP01Renderer isSelected={isSelected} isRunning={isRunning} />;

    case 'bluetooth-hc05':
      return <BluetoothHC05Renderer isSelected={isSelected} isRunning={isRunning} />;

    case 'dc-motor':
      return <DCMotorRenderer isSelected={isSelected} isRunning={isRunning} />;

    case 'dc-motor-encoder':
      return <DCMotorEncoderRenderer isSelected={isSelected} isRunning={isRunning} />;

    case 'gear-motor':
      return <GearMotorRenderer isSelected={isSelected} isRunning={isRunning} />;

    case 'dip-switch-4':
      return <DIPSwitch4Renderer isSelected={isSelected} />;

    case 'dip-switch-6':
      return <DIPSwitch6Renderer isSelected={isSelected} />;

    case 'flex-sensor':
      return <FlexSensorRenderer isSelected={isSelected} />;

    case 'force-sensor':
      return <ForceSensorRenderer isSelected={isSelected} />;

    case 'inductor':
      return <InductorRenderer isSelected={isSelected} />;

    case 'light-bulb':
      return <LightBulbRenderer isSelected={isSelected} isRunning={isRunning} isOn={Boolean(isRunning && (state?.on || state?.ledOn || props?.value))} />;

    case 'soil-moisture':
      return <SoilMoistureRenderer isSelected={isSelected} isRunning={isRunning} />;

    case 'ir-sensor':
      return <IRSensorRenderer isSelected={isSelected} isRunning={isRunning} />;

    case 'lm35':
      return <LM35Renderer isSelected={isSelected} />;

    case 'ne555':
      return <DIP8ICRenderer isSelected={isSelected} label="NE555" isActive={Boolean(isRunning && (state?.active || state?.outLevel))} />;

    case 'opamp':
      return <DIP8ICRenderer isSelected={isSelected} label="LM741" isActive={Boolean(isRunning && (state?.active || state?.outLevel))} />;

    case 'ultrasonic-ping':
      return <UltrasonicPingRenderer isSelected={isSelected} isRunning={isRunning} distance={props?.distance ?? 15} />;

    case 'dht11-sensor':
      return <DHT11Renderer isSelected={isSelected} />;

    case 'mpu6050':
      return <MPU6050Renderer isSelected={isSelected} isRunning={isRunning} />;

    case 'relay-5v':
      return <Relay5VRenderer isSelected={isSelected} isRunning={isRunning} active={Boolean(state?.active || props?.active)} />;

    case 'relay-5v-2ch':
      return <Relay5V2ChRenderer isSelected={isSelected} isRunning={isRunning} ch1Active={Boolean(state?.ch1Active || props?.ch1Active)} ch2Active={Boolean(state?.ch2Active || props?.ch2Active)} />;

    case 'uln2003a':
      return (
        <ULN2003Renderer
          isSelected={isSelected}
          isRunning={isRunning}
          ledA={Boolean(state?.ledA || props?.ledA)}
          ledB={Boolean(state?.ledB || props?.ledB)}
          ledC={Boolean(state?.ledC || props?.ledC)}
          ledD={Boolean(state?.ledD || props?.ledD)}
        />
      );

    default:
      return null;
  }
};

export function hasCustom2DRenderer(type: string): boolean {
  return [
    'arduino-nano',
    'nodemcu-esp8266',
    'pir-sensor',
    'servo',
    'led',
    'resistor',
    'pushbutton',
    'potentiometer',
    'battery-9v',
    'coin-cell-3v',
    'battery-1.5v-aa',
    'battery-4x-aa',
    'buzzer',
    'slide-switch',
    'relay-5v',
    'relay-5v-2ch',
    'diode-1n4007',
    'zener-diode',
    'transistor-npn',
    'capacitor-electrolytic',
    'capacitor-ceramic',
    'lcd1602',
    'esp-01',
    'bluetooth-hc05',
    'mpu6050',
    'dc-motor',
    'dc-motor-encoder',
    'gear-motor',
    'dip-switch-4',
    'dip-switch-6',
    'flex-sensor',
    'force-sensor',
    'inductor',
    'light-bulb',
    'soil-moisture',
    'ir-sensor',
    'lm35',
    'ultrasonic-ping',
    'dht11-sensor',
    'stepper-motor',
    'esp32-devkit',
    'lcd1602-i2c',
    'uln2003a',
    'ne555',
    'opamp',
  ].includes(type);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. ARDUINO UNO R3 (Exact 100% Wokwi Vector Design Matching User Image)
// Dimension: 275.5 × 200 px (Pins aligned to catalog coordinates)
// ─────────────────────────────────────────────────────────────────────────────
const ArduinoUnoRenderer: React.FC<{ isSelected: boolean; isRunning: boolean }> = ({ isRunning }) => {
  return (
    <svg
      width="275.5"
      height="200"
      viewBox="0 0 275.5 200"
      style={{
        overflow: 'visible',
        filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.35))',
      }}
    >
      <defs>
        {/* Wokwi Flat Teal Blue PCB */}
        <linearGradient id="wokwiUnoPcb" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2b75a0" />
          <stop offset="100%" stopColor="#22648c" />
        </linearGradient>

        {/* Metal Silver Gradients */}
        <linearGradient id="metalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e6e6e6" />
          <stop offset="50%" stopColor="#cccccc" />
          <stop offset="100%" stopColor="#b3b3b3" />
        </linearGradient>

        {/* Cable / Molded USB Plug Gradients */}
        <linearGradient id="usbCableGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3b3b3b" />
          <stop offset="50%" stopColor="#262626" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>

        {/* Capacitor Disc (Silver Top, Black Bottom) */}
        <radialGradient id="alCapGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#e2e8f0" />
          <stop offset="75%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </radialGradient>

        <linearGradient id="headerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#27272a" />
          <stop offset="30%" stopColor="#18181b" />
          <stop offset="100%" stopColor="#09090b" />
        </linearGradient>
      </defs>

      {/* ==================== 1. CONNECTED USB CABLE (Left extension x=0..45) ==================== */}
      <g id="usb-cable">
        {/* Black Strain Relief Boot */}
        <rect x="0" y="93" width="18" height="14" rx="7" fill="#1e1e1e" />
        <rect x="14" y="90" width="3" height="20" rx="1" fill="#262626" />
        <rect x="18" y="88" width="3" height="24" rx="1" fill="#2d2d2d" />
        <rect x="22" y="86" width="3" height="28" rx="1" fill="#262626" />

        {/* Main Molded Plug Handle */}
        <rect x="25" y="70" width="28" height="60" rx="4" fill="url(#usbCableGrad)" stroke="#171717" strokeWidth="1" />
        <rect x="29" y="76" width="20" height="48" rx="2" fill="#222222" opacity="0.6" stroke="#111111" strokeWidth="0.8" />

        {/* USB Trident Icon */}
        <g transform="translate(39, 100)" stroke="#71717a" strokeWidth="1.2" fill="none">
          <line x1="0" y1="10" x2="0" y2="-6" />
          <path d="M 0,3 Q -5,0 -5,-3" />
          <path d="M 0,1 Q 5,-2 5,-5" />
          <circle cx="0" cy="-8" r="1.2" fill="#71717a" />
          <rect x="-6" y="-6" width="2.4" height="2.4" fill="#71717a" />
          <polygon points="5,-7 3.5,-4.5 6.5,-4.5" fill="#71717a" />
        </g>

        {/* Metal USB Type-B Plug Collar (inserted into PCB jack) */}
        <rect x="53" y="75" width="18" height="50" rx="1.5" fill="url(#metalGrad)" stroke="#64748b" strokeWidth="0.8" />
      </g>

      {/* ==================== 2. MAIN PCB BOARD ==================== */}
      {/* Complete PCB Board Outline starting at x=37 */}
      <path
        d="M 37 23 L 37 4 Q 40 0 46 0 L 261 0 Q 269 0 272 5 L 280 25 L 280 148 L 272 156 L 272 192 Q 268 200 260 200 L 46 200 Q 37 200 37 192 L 37 186 L 37 23 Z"
        fill="url(#wokwiUnoPcb)"
        stroke="#1d597c"
        strokeWidth="1.8"
      />

      {/* 4 Plated Metallic Mounting Holes */}
      {[
        { cx: 78, cy: 13 },
        { cx: 75, cy: 190 },
        { cx: 270, cy: 40 },
        { cx: 270, cy: 165 },
      ].map((hole, i) => (
        <g key={i}>
          <circle cx={hole.cx} cy={hole.cy} r="5.5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
          <circle cx={hole.cx} cy={hole.cy} r="3.2" fill="#1e293b" />
        </g>
      ))}

      {/* ==================== 3. HARDWARE COMPONENTS ==================== */}

      {/* Silver USB Type-B Female Jack Receptacle (Left Edge) */}
      <g>
        <rect x="25" y="24" width="40" height="42" rx="2" fill="url(#metalGrad)" stroke="#475569" strokeWidth="1.2" />
        <rect x="25" y="32" width="30" height="26" rx="2" fill="#334155" />
        <rect x="25" y="35" width="24" height="20" rx="1.5" fill="#0f172a" />
        <rect x="33" y="41" width="10" height="8" rx="1" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
      </g>

      {/* Black DC Barrel Power Jack (Bottom Left) */}
      <g>
        <rect x="29" y="142" width="38" height="42" rx="3" fill="#18181b" stroke="#27272a" strokeWidth="1.5" />
        <rect x="29" y="149" width="30" height="28" rx="2" fill="#000000" />
        <circle cx="40" cy="163" r="5.5" fill="#0f172a" stroke="#27272a" strokeWidth="1.5" />
        <circle cx="40" cy="163" r="2.5" fill="#d97706" />
        {/* Solder Tabs */}
        <rect x="65" y="144" width="6" height="4" rx="0.8" fill="#cbd5e1" />
        <rect x="65" y="176" width="6" height="4" rx="0.8" fill="#cbd5e1" />
      </g>

      {/* Reset Button (Top Left) */}
      <g>
        <rect x="70" y="8" width="18" height="18" rx="2" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
        <circle cx="79" cy="17" r="6" fill="#cbd5e1" />
        <circle cx="79" cy="17" r="4.5" fill="#c84b31" stroke="#9a3412" strokeWidth="0.5" />
      </g>

      {/* SPK16.000G Crystal Oscillator */}
      <g>
        <rect x="160" y="55" width="26" height="13" rx="6.5" fill="url(#metalGrad)" stroke="#64748b" strokeWidth="0.8" />
        <text x="173" y="63" fill="#334155" fontSize="3.8" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
          SPK16.000G
        </text>
      </g>

      {/* 2 Cylindrical Aluminum Electrolytic Capacitors (Silver/Black split circles) */}
      {/* Capacitor 1 */}
      <g transform="translate(122, 168)">
        <rect x="-10" y="-10" width="20" height="20" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="0.8" />
        <circle cx="0" cy="0" r="9" fill="url(#alCapGrad)" stroke="#475569" strokeWidth="0.8" />
        <path d="M -9 0 A 9 9 0 0 1 0 -9 L 0 0 Z" fill="#18181b" opacity="0.85" />
        <text x="1" y="2" fill="#0f172a" fontSize="3.8" fontWeight="900" fontFamily="monospace" textAnchor="middle">47</text>
        <text x="1" y="6" fill="#0f172a" fontSize="3" fontWeight="800" fontFamily="monospace" textAnchor="middle">25V</text>
      </g>
      {/* Capacitor 2 */}
      <g transform="translate(144, 168)">
        <rect x="-10" y="-10" width="20" height="20" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="0.8" />
        <circle cx="0" cy="0" r="9" fill="url(#alCapGrad)" stroke="#475569" strokeWidth="0.8" />
        <path d="M -9 0 A 9 9 0 0 1 0 -9 L 0 0 Z" fill="#18181b" opacity="0.85" />
        <text x="1" y="2" fill="#0f172a" fontSize="3.8" fontWeight="900" fontFamily="monospace" textAnchor="middle">47</text>
        <text x="1" y="6" fill="#0f172a" fontSize="3" fontWeight="800" fontFamily="monospace" textAnchor="middle">16V</text>
      </g>

      {/* Voltage Regulator SOT-223 */}
      <g transform="translate(162, 162)">
        <rect x="0" y="0" width="16" height="12" rx="1" fill="#18181b" stroke="#27272a" strokeWidth="0.6" />
        <rect x="4" y="-3" width="8" height="3" fill="#cbd5e1" />
        <rect x="2" y="12" width="3" height="3" fill="#cbd5e1" />
        <rect x="6.5" y="12" width="3" height="3" fill="#cbd5e1" />
        <rect x="11" y="12" width="3" height="3" fill="#cbd5e1" />
        <text x="8" y="8" fill="#94a3b8" fontSize="3" fontWeight="900" fontFamily="monospace" textAnchor="middle">1117</text>
      </g>

      {/* Horizontal ATmega328P DIP-28 IC Socket + Chip (Middle Right) */}
      <g transform="translate(165, 112)">
        {/* Black DIP Socket Body */}
        <rect x="0" y="0" width="86" height="30" rx="2" fill="#171717" stroke="#0d0d0d" strokeWidth="1" />

        {/* 28 Silver DIP Pins (14 Top, 14 Bottom) */}
        {Array.from({ length: 14 }).map((_, i) => (
          <React.Fragment key={i}>
            <rect x={4 + i * 5.8} y="-3.5" width="2.4" height="4.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.3" />
            <rect x={4 + i * 5.8} y="29" width="2.4" height="4.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.3" />
          </React.Fragment>
        ))}

        {/* Inner ATmega328P Chip Body */}
        <rect x="2" y="2" width="82" height="26" rx="1.5" fill="#262626" stroke="#171717" strokeWidth="0.8" />
        {/* Left Notch */}
        <path d="M 2 11 A 4 4 0 0 1 2 19 Z" fill="#171717" />
        {/* Pin 1 Dimple */}
        <circle cx="9" cy="22" r="1.2" fill="#52525b" />
        {/* Faint Laser Chip Text */}
        <text x="44" y="17" fill="#e2e8f0" fontSize="5.5" fontWeight="900" fontFamily="monospace" letterSpacing="0.8" textAnchor="middle">
          ATMEGA328P-PU
        </text>
      </g>

      {/* SMD Passives & USB-Serial IC */}
      <g>
        <rect x="80" y="88" width="30" height="18" rx="1.5" fill="#18181b" stroke="#27272a" strokeWidth="0.8" />
        <circle cx="83" cy="91" r="0.8" fill="#71717a" />
        <text x="95" y="99" fill="#e2e8f0" fontSize="4.5" fontWeight="900" fontFamily="monospace" textAnchor="middle">CH340G</text>
      </g>

      {/* Column of SMD Indicator LEDs (ON, L, TX, RX) */}
      <g transform="translate(108, 64)">
        {/* ON LED (Green) */}
        <rect x="0" y="0" width="4" height="2.5" rx="0.4" fill={isRunning ? '#22c55e' : '#14532d'} />
        {isRunning && <circle cx="2" cy="1.2" r="3" fill="#22c55e" opacity="0.6" />}
        <text x="6" y="2.5" fill="#ffffff" fontSize="3" fontWeight="900">ON</text>

        {/* L LED (Orange) */}
        <rect x="0" y="6" width="4" height="2.5" rx="0.4" fill={isRunning ? '#f59e0b' : '#78350f'} />
        {isRunning && <circle cx="2" cy="7.2" r="3" fill="#f59e0b" opacity="0.6" />}
        <text x="6" y="8.5" fill="#ffffff" fontSize="3" fontWeight="900">L</text>

        {/* TX LED */}
        <rect x="0" y="12" width="4" height="2.5" rx="0.4" fill="#cbd5e1" />
        <text x="6" y="14.5" fill="#ffffff" fontSize="3" fontWeight="900">TX</text>

        {/* RX LED */}
        <rect x="0" y="18" width="4" height="2.5" rx="0.4" fill="#cbd5e1" />
        <text x="6" y="20.5" fill="#ffffff" fontSize="3" fontWeight="900">RX</text>
      </g>

      {/* ==================== 4. WHITE SILKSCREEN LOGOS & LABELS ==================== */}

      {/* ARDUINO INFINITY LOGO (Circle with ∞ containing - and +) */}
      <g transform="translate(196, 44)" stroke="#ffffff" fill="none">
        <circle cx="12" cy="12" r="11" strokeWidth="1.6" />
        <circle cx="7.5" cy="12" r="3.5" strokeWidth="1.2" />
        <line x1="5.5" y1="12" x2="9.5" y2="12" strokeWidth="1.2" />
        <circle cx="16.5" cy="12" r="3.5" strokeWidth="1.2" />
        <line x1="14.5" y1="12" x2="18.5" y2="12" strokeWidth="1.2" />
        <line x1="16.5" y1="10" x2="16.5" y2="14" strokeWidth="1.2" />
      </g>
      {/* ARDUINO Text */}
      <text x="208" y="65" fill="#ffffff" fontSize="6" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.8" textAnchor="middle">
        ARDUINO
      </text>

      {/* UNO Badge (Inside Oval Badge) */}
      <g transform="translate(230, 40)">
        <rect x="0" y="0" width="24" height="14" rx="7" fill="none" stroke="#ffffff" strokeWidth="1.4" />
        <text x="12" y="10" fill="#ffffff" fontSize="7.5" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.5" textAnchor="middle">
          UNO
        </text>
      </g>

      {/* Header Section Silkscreen Headers */}
      <text x="195" y="27" fill="#ffffff" fontSize="5.2" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
        DIGITAL (PWM ~)
      </text>
      <text x="155" y="156" fill="#ffffff" fontSize="5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
        POWER
      </text>
      <line x1="170" y1="152" x2="210" y2="152" stroke="#ffffff" strokeWidth="0.8" />
      <text x="195" y="159" fill="#ffffff" fontSize="5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
        ANALOG IN
      </text>

      {/* ==================== 5. FEMALE HEADERS & RECEPTACLES ==================== */}

      {/* Top Female Header Strips (Digital Pins) */}
      <rect x="100" y="2" width="77" height="14" rx="1" fill="url(#headerGrad)" stroke="#09090b" strokeWidth="1" />
      <rect x="185" y="2" width="75" height="14" rx="1" fill="url(#headerGrad)" stroke="#09090b" strokeWidth="1" />

      {/* Top Header Receptacle Holes */}
      {[
        106, 115.5, 125, 134.5, 144, 153.5, 163, 173,
        189, 198.5, 208, 217.5, 227, 236.5, 246, 255.5
      ].map((px, i) => (
        <rect key={`top-pin-${i}`} x={px - 2.5} y="4.5" width="5" height="5" rx="0.6" fill="#000000" stroke="#3f3f46" strokeWidth="0.8" />
      ))}

      {/* Top Header Silkscreen Labels */}
      <g fill="#ffffff" fontSize="4.5" fontWeight="800" fontFamily="monospace">
        <text x="106" y="22" textAnchor="middle">AREF</text>
        <text x="115.5" y="22" textAnchor="middle">GND</text>
        <text x="125" y="22" textAnchor="middle">13</text>
        <text x="134.5" y="22" textAnchor="middle">12</text>
        <text x="144" y="22" textAnchor="middle">~11</text>
        <text x="153.5" y="22" textAnchor="middle">~10</text>
        <text x="163" y="22" textAnchor="middle">~9</text>
        <text x="173" y="22" textAnchor="middle">8</text>

        <text x="189" y="22" textAnchor="middle">7</text>
        <text x="198.5" y="22" textAnchor="middle">~6</text>
        <text x="208" y="22" textAnchor="middle">~5</text>
        <text x="217.5" y="22" textAnchor="middle">4</text>
        <text x="227" y="22" textAnchor="middle">~3</text>
        <text x="236.5" y="22" textAnchor="middle">2</text>
        <text x="246" y="22" textAnchor="middle">TX1</text>
        <text x="255.5" y="22" textAnchor="middle">RX0</text>
      </g>

      {/* Bottom Female Header Strips (Power & Analog Pins) */}
      <rect x="127" y="184" width="65" height="14" rx="1" fill="url(#headerGrad)" stroke="#09090b" strokeWidth="1" />
      <rect x="204" y="184" width="56" height="14" rx="1" fill="url(#headerGrad)" stroke="#09090b" strokeWidth="1" />

      {/* Bottom Header Receptacle Holes */}
      {[
        131, 140.5, 150, 160, 169.5, 179, 188.5,
        208, 217.5, 227, 236.5, 246, 255.5
      ].map((px, i) => (
        <rect key={`bot-pin-${i}`} x={px - 2.5} y="188.5" width="5" height="5" rx="0.6" fill="#000000" stroke="#3f3f46" strokeWidth="0.8" />
      ))}

      {/* Bottom Header Silkscreen Labels */}
      <g fill="#ffffff" fontSize="4.2" fontWeight="800" fontFamily="monospace">
        <text x="131" y="180" textAnchor="middle" transform="rotate(-90 131 180)">IOREF</text>
        <text x="140.5" y="180" textAnchor="middle" transform="rotate(-90 140.5 180)">RESET</text>
        <text x="150" y="180" textAnchor="middle" transform="rotate(-90 150 180)">3.3V</text>
        <text x="160" y="180" textAnchor="middle" transform="rotate(-90 160 180)">5V</text>
        <text x="169.5" y="180" textAnchor="middle" transform="rotate(-90 169.5 180)">GND</text>
        <text x="179" y="180" textAnchor="middle" transform="rotate(-90 179 180)">GND</text>
        <text x="188.5" y="180" textAnchor="middle" transform="rotate(-90 188.5 180)">Vin</text>

        <text x="208" y="180" textAnchor="middle" transform="rotate(-90 208 180)">A0</text>
        <text x="217.5" y="180" textAnchor="middle" transform="rotate(-90 217.5 180)">A1</text>
        <text x="227" y="180" textAnchor="middle" transform="rotate(-90 227 180)">A2</text>
        <text x="236.5" y="180" textAnchor="middle" transform="rotate(-90 236.5 180)">A3</text>
        <text x="246" y="180" textAnchor="middle" transform="rotate(-90 246 180)">A4</text>
        <text x="255.5" y="180" textAnchor="middle" transform="rotate(-90 255.5 180)">A5</text>
      </g>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. ARDUINO NANO R3 (Tinkercad-Exact 2.5D Physical Realistic SVG)
// Dimension: 170 × 70 px
// ─────────────────────────────────────────────────────────────────────────────
const ArduinoNanoRenderer: React.FC<{ isSelected: boolean; isRunning: boolean }> = ({ isRunning }) => {
  return (
    <svg
      width="170"
      height="70"
      viewBox="0 0 170 70"
      style={{
        overflow: 'visible',
        filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.4))',
      }}
    >
      <defs>
        <linearGradient id="nanoPcb" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00979C" />
          <stop offset="100%" stopColor="#006567" />
        </linearGradient>
      </defs>

      {/* PCB Solder Mask */}
      <rect x="0" y="2" width="170" height="66" rx="4" fill="#004345" />
      <rect x="0" y="0" width="170" height="66" rx="4" fill="url(#nanoPcb)" stroke="#005d5f" strokeWidth="1.5" />

      {/* Mini-USB Jack on left */}
      <rect x="0" y="21" width="22" height="26" rx="2" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
      <rect x="0" y="25" width="16" height="18" rx="1.5" fill="#0f172a" />

      {/* ATmega328P TQFP-32 Chip at 45° angle */}
      <g transform="translate(85, 33) rotate(45)">
        <rect x="-11" y="-11" width="22" height="22" rx="1" fill="#18181b" stroke="#27272a" strokeWidth="1" />
        <circle cx="-7" cy="-7" r="1.5" fill="#64748b" />
        <text x="0" y="3" fill="#e2e8f0" fontSize="4.5" fontWeight="900" fontFamily="monospace" textAnchor="middle">328P</text>
      </g>

      {/* Reset Tactile Button */}
      <rect x="122" y="27" width="14" height="14" rx="2" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.8" />
      <circle cx="129" cy="34" r="4" fill="#ef4444" />

      {/* 16MHz Crystal */}
      <rect x="52" y="28" width="16" height="12" rx="3" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.8" />

      {/* Live Power and L LEDs */}
      <rect x="146" y="26" width="4" height="3" fill={isRunning ? '#22c55e' : '#14532d'} />
      {isRunning && <circle cx="148" cy="27.5" r="3.5" fill="#22c55e" opacity="0.6" />}
      <text x="148" y="23" fill="#ffffff" fontSize="4" fontWeight="800" textAnchor="middle">POW</text>

      {/* Top 15 Header Pins (x: 19.7..154.1, y: 4.8) */}
      {Array.from({ length: 15 }).map((_, i) => {
        const x = 19.7 + i * 9.6;
        return (
          <g key={`top-pin-${i}`}>
            <rect x={x - 2.8} y="2" width="5.6" height="5.6" rx="0.8" fill="#18181b" stroke="#3f3f46" strokeWidth="0.8" />
            <circle cx={x} cy="4.8" r="1.8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
          </g>
        );
      })}

      {/* Bottom 15 Header Pins (x: 19.7..154.1, y: 62.4) */}
      {Array.from({ length: 15 }).map((_, i) => {
        const x = 19.7 + i * 9.6;
        return (
          <g key={`bot-pin-${i}`}>
            <rect x={x - 2.8} y="59.6" width="5.6" height="5.6" rx="0.8" fill="#18181b" stroke="#3f3f46" strokeWidth="0.8" />
            <circle cx={x} cy="62.4" r="1.8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
          </g>
        );
      })}

      <text x="85" y="16" fill="#ffffff" fontSize="6.5" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.8" textAnchor="middle">ARDUINO NANO</text>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ESP32 DEV-KIT V1 (30-Pin Dual-Core Wi-Fi & Bluetooth Microcontroller)
// Dimension: 107 × 201 px
// ─────────────────────────────────────────────────────────────────────────────
const ESP32Renderer: React.FC<{ isSelected: boolean; isRunning: boolean }> = ({ isSelected, isRunning }) => {
  const leftPins = ['EN', 'VP', 'VN', 'D34', 'D35', 'D32', 'D33', 'D25', 'D26', 'D27', 'D14', 'D12', 'D13', 'GND', 'VIN'];
  const rightPins = ['D23', 'D22', 'TX0', 'RX0', 'D21', 'D19', 'D18', 'D5', 'TX2', 'RX2', 'D4', 'D2', 'D15', 'GND', '3V3'];
  const pinYs = [24, 34, 44, 53.1, 62.9, 72.2, 81.7, 91.3, 101, 110.8, 120, 130.4, 139.5, 149, 158.5];

  return (
    <svg
      width="107"
      height="201"
      viewBox="0 0 107 201"
      style={{
        overflow: 'visible',
        filter: isSelected
          ? 'drop-shadow(0 0 16px rgba(56, 189, 248, 0.85)) drop-shadow(0 8px 20px rgba(0,0,0,0.5))'
          : 'drop-shadow(0 6px 14px rgba(0,0,0,0.45))',
      }}
    >
      <defs>
        <linearGradient id="esp32Pcb" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="50%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <linearGradient id="esp32Shield" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#e2e8f0" />
          <stop offset="75%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
      </defs>

      {/* Main Black Matte PCB Board */}
      <rect x="2" y="2" width="103" height="197" rx="6" fill="url(#esp32Pcb)" stroke="#334155" strokeWidth="1.5" />
      <rect x="3.5" y="3.5" width="100" height="194" rx="4.5" fill="none" stroke="#475569" strokeWidth="0.5" opacity="0.4" />

      {/* Gold Meander PCB Antenna at Top */}
      <path
        d="M 38 6 L 68 6 L 68 12 L 38 12 L 38 18 L 68 18 L 68 24 L 38 24"
        fill="none"
        stroke="#facc15"
        strokeWidth="1.8"
        strokeLinecap="square"
      />

      {/* ESP-WROOM-32 Metallic RF Shield Can */}
      <rect x="18" y="28" width="70" height="74" rx="2" fill="url(#esp32Shield)" stroke="#475569" strokeWidth="0.8" />
      <rect x="20" y="30" width="66" height="70" rx="1.5" fill="url(#esp32Shield)" stroke="#94a3b8" strokeWidth="0.5" />

      {/* Shield Markings */}
      <text x="53" y="48" fill="#1e293b" fontSize="7" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.5">
        ESP-WROOM-32
      </text>
      <text x="53" y="58" fill="#334155" fontSize="4.5" fontWeight="800" fontFamily="monospace" textAnchor="middle">
        Espressif Systems
      </text>
      <text x="53" y="66" fill="#475569" fontSize="3.8" fontWeight="700" fontFamily="monospace" textAnchor="middle">
        FCC ID: 2AC7Z-ESPWROOM32
      </text>
      <text x="53" y="74" fill="#475569" fontSize="3.8" fontWeight="700" fontFamily="monospace" textAnchor="middle">
        KCC-CRM-esp-ESP-WROOM-32
      </text>
      <text x="53" y="86" fill="#1e293b" fontSize="6.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
        CE  FC  RoHS
      </text>

      {/* Silkscreen Brand Label */}
      <text x="53" y="116" fill="#ffffff" fontSize="6" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.5">
        ESP32 DEVKIT V1
      </text>

      {/* CP2102 USB Bridge IC */}
      <rect x="42" y="132" width="22" height="22" rx="1.5" fill="#18181b" stroke="#334155" strokeWidth="0.8" />
      <circle cx="45" cy="135" r="1" fill="#71717a" />
      <text x="53" y="145" fill="#e2e8f0" fontSize="4" fontWeight="900" fontFamily="monospace" textAnchor="middle">CP2102</text>

      {/* Status & Power LEDs */}
      <circle cx="28" cy="125" r="2.5" fill={isRunning ? '#ef4444' : '#7f1d1d'} stroke="#f87171" strokeWidth="0.5" />
      <text x="28" y="120" fill="#cbd5e1" fontSize="3.5" fontWeight="800" textAnchor="middle">PWR</text>
      <circle cx="78" cy="125" r="2.5" fill={isRunning ? '#38bdf8' : '#0369a1'} stroke="#60a5fa" strokeWidth="0.5" />
      <text x="78" y="120" fill="#cbd5e1" fontSize="3.5" fontWeight="800" textAnchor="middle">COM</text>

      {/* EN & BOOT Tactile Push Buttons */}
      <g>
        <rect x="18" y="165" width="14" height="12" rx="1.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.6" />
        <circle cx="25" cy="171" r="3.5" fill="#18181b" />
        <text x="25" y="183" fill="#ffffff" fontSize="4" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">EN</text>

        <rect x="74" y="165" width="14" height="12" rx="1.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.6" />
        <circle cx="81" cy="171" r="3.5" fill="#18181b" />
        <text x="81" y="183" fill="#ffffff" fontSize="4" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">BOOT</text>
      </g>

      {/* Micro-USB Port at Bottom Center */}
      <rect x="40" y="174" width="26" height="22" rx="2" fill="url(#esp32Shield)" stroke="#475569" strokeWidth="0.8" />
      <rect x="44" y="182" width="18" height="12" rx="1" fill="#09090b" stroke="#334155" strokeWidth="0.5" />
      <rect x="47" y="186" width="12" height="4" rx="0.5" fill="#facc15" opacity="0.8" />

      {/* Left 15 Header Pins (x: 5, y: 24..158.5) */}
      {leftPins.map((lbl, i) => {
        const y = pinYs[i];
        return (
          <g key={`left-${lbl}-${i}`}>
            <rect x="2" y={y - 2.8} width="5.6" height="5.6" rx="0.8" fill="#18181b" stroke="#3f3f46" strokeWidth="0.8" />
            <circle cx="5" cy={y} r="1.8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
            <text x="12" y={y + 1.5} fill="#ffffff" fontSize="3.8" fontWeight="800" fontFamily="monospace">
              {lbl}
            </text>
          </g>
        );
      })}

      {/* Right 15 Header Pins (x: 101.3, y: 24..158.5) */}
      {rightPins.map((lbl, i) => {
        const y = pinYs[i];
        return (
          <g key={`right-${lbl}-${i}`}>
            <rect x="98.5" y={y - 2.8} width="5.6" height="5.6" rx="0.8" fill="#18181b" stroke="#3f3f46" strokeWidth="0.8" />
            <circle cx="101.3" cy={y} r="1.8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
            <text x="94" y={y + 1.5} fill="#ffffff" fontSize="3.8" fontWeight="800" fontFamily="monospace" textAnchor="end">
              {lbl}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// 3. ESP8266 NODEMCU V2 (Authentic Pinout & Aesthetic)
// Dimension: 120 × 215 px
// ─────────────────────────────────────────────────────────────────────────────
const NodeMCURenderer: React.FC<{ isSelected: boolean; isRunning: boolean }> = ({ isSelected, isRunning }) => {
  const leftPins = ['A0', 'RSV', 'RSV', 'SD3', 'SD2', 'SD1', 'CMD', 'SD0', 'CLK', 'GND', '3V3', 'EN', 'RST', 'GND', 'VIN'];
  const rightPins = ['D0', 'D1', 'D2', 'D3', 'D4', '3V3', 'GND', 'D5', 'D6', 'D7', 'D8', 'RX', 'TX', 'GND', '3V3'];

  return (
    <svg
      width="120"
      height="215"
      viewBox="0 0 120 215"
      style={{
        overflow: 'visible',
        filter: isSelected
          ? 'drop-shadow(0 0 16px rgba(56, 189, 248, 0.75)) drop-shadow(0 8px 20px rgba(0,0,0,0.5))'
          : 'drop-shadow(0 6px 14px rgba(0,0,0,0.45))',
      }}
    >
      <defs>
        <linearGradient id="nodePcb" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#090d16" />
        </linearGradient>
        <linearGradient id="rfShield" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#e2e8f0" />
          <stop offset="80%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="120" height="215" rx="7" fill="url(#nodePcb)" stroke="#334155" strokeWidth="1.8" />

      {/* Gold PCB Meander Antenna */}
      <path
        d="M 28 6 L 28 24 L 36 24 L 36 10 L 44 10 L 44 24 L 52 24 L 52 10 L 60 10 L 60 24 L 68 24 L 68 10 L 76 10 L 76 24 L 84 24 L 84 10 L 92 10 L 92 24"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="2.4"
        strokeLinecap="square"
      />

      {/* Silver Metal RF Shield with FCC / ESP8266 Laser Markings */}
      <rect x="23" y="32" width="74" height="84" rx="3" fill="url(#rfShield)" stroke="#64748b" strokeWidth="1" />
      <text x="60" y="55" fill="#0f172a" fontSize="7.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.5">ESP8266MOD</text>
      <text x="60" y="68" fill="#334155" fontSize="5.5" fontWeight="700" textAnchor="middle">ISM 2.4GHz</text>
      <text x="60" y="78" fill="#475569" fontSize="5" fontWeight="600" textAnchor="middle">Wi-Fi 802.11 b/g/n</text>
      <text x="60" y="88" fill="#64748b" fontSize="4.5" fontWeight="600" textAnchor="middle">AI-THINKER / FCC</text>

      {/* Micro-USB Jack */}
      <rect x="42" y="196" width="36" height="19" rx="3" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
      <rect x="50" y="202" width="20" height="8" rx="1" fill="#09090b" />

      {/* Dual Tactile Push Buttons: RST & FLASH */}
      <g>
        <rect x="16" y="184" width="10" height="10" rx="1.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.8" />
        <circle cx="21" cy="189" r="2.8" fill="#18181b" />
        <text x="21" y="180" fill="#94a3b8" fontSize="4" fontWeight="800" textAnchor="middle">RST</text>
      </g>
      <g>
        <rect x="94" y="184" width="10" height="10" rx="1.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.8" />
        <circle cx="99" cy="189" r="2.8" fill="#18181b" />
        <text x="99" y="180" fill="#94a3b8" fontSize="4" fontWeight="800" textAnchor="middle">FLASH</text>
      </g>

      {/* Live Status LEDs */}
      <rect x="32" y="122" width="6" height="4" rx="0.5" fill={isRunning ? '#ef4444' : '#7f1d1d'} />
      {isRunning && <circle cx="35" cy="124" r="5" fill="#ef4444" opacity="0.4" />}
      <rect x="82" y="122" width="6" height="4" rx="0.5" fill={isRunning ? '#38bdf8' : '#0369a1'} />
      {isRunning && <circle cx="85" cy="124" r="5" fill="#38bdf8" opacity="0.5" />}

      {/* CP2102 Bridge Chip */}
      <rect x="45" y="140" width="30" height="24" rx="2" fill="#18181b" stroke="#27272a" strokeWidth="0.8" />
      <text x="60" y="154" fill="#a1a1aa" fontSize="5" fontWeight="900" fontFamily="monospace" textAnchor="middle">CP2102</text>

      {/* Left 15 Header Pins & Labels */}
      {leftPins.map((pinName, i) => {
        const y = 32 + i * 12;
        return (
          <g key={`left-pin-${i}`}>
            <rect x="2" y={y - 4} width="8" height="8" rx="1" fill="#18181b" stroke="#3f3f46" strokeWidth="0.8" />
            <circle cx="6" cy={y} r="2.2" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
            <text x="12" y={y + 2.5} fill="#cbd5e1" fontSize="5" fontWeight="800" fontFamily="monospace">
              {pinName}
            </text>
          </g>
        );
      })}

      {/* Right 15 Header Pins & Labels */}
      {rightPins.map((pinName, i) => {
        const y = 32 + i * 12;
        return (
          <g key={`right-pin-${i}`}>
            <rect x="110" y={y - 4} width="8" height="8" rx="1" fill="#18181b" stroke="#3f3f46" strokeWidth="0.8" />
            <circle cx="114" cy={y} r="2.2" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
            <text x="108" y={y + 2.5} fill="#cbd5e1" fontSize="5" fontWeight="800" fontFamily="monospace" textAnchor="end">
              {pinName}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 3b. HC-05 BLUETOOTH 2.0 MODULE (Authentic Photo-Exact Design)
// Dimension: 140 × 70 px
// ─────────────────────────────────────────────────────────────────────────────
const BluetoothHC05Renderer: React.FC<{ isSelected: boolean; isRunning: boolean }> = ({ isRunning }) => {
  return (
    <svg
      width="140"
      height="70"
      viewBox="0 0 140 70"
      style={{
        overflow: 'visible',
        filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.45))',
      }}
    >
      <defs>
        <linearGradient id="hc05BluePcb" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="50%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#172554" />
        </linearGradient>
        <linearGradient id="hc05GreenDaughter" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#16a34a" />
          <stop offset="60%" stopColor="#15803d" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>
      </defs>

      {/* Main Blue Carrier PCB */}
      <rect x="2" y="2" width="136" height="66" rx="5" fill="url(#hc05BluePcb)" stroke="#1e3a8a" strokeWidth="1.5" />

      {/* White Silk Specs & Labels on Blue Board */}
      <text x="28" y="16" fill="#bfdbfe" fontSize="4.5" fontWeight="800" fontFamily="sans-serif">Level: 3.3V</text>
      <text x="28" y="60" fill="#bfdbfe" fontSize="4.5" fontWeight="800" fontFamily="sans-serif">Power: 3.6V-6V</text>

      {/* Tiny KEY / EN Tactile Push Button */}
      <rect x="20" y="8" width="10" height="10" rx="1.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.6" />
      <circle cx="25" cy="13" r="3" fill="#18181b" />
      <text x="25" y="6" fill="#e0f2fe" fontSize="3.5" fontWeight="800" textAnchor="middle">KEY</text>

      {/* Blue / Red Live Blinking Status LED */}
      <circle cx="25" cy="35" r="3" fill={isRunning ? '#38bdf8' : '#1e3a8a'} stroke="#0284c7" strokeWidth="0.8" />
      {isRunning && (
        <circle cx="25" cy="35" r="5" fill="#38bdf8" opacity="0.6">
          <animate attributeName="opacity" values="0.8;0.2;0.8" dur="0.8s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Green SMD Daughterboard Core Module */}
      <rect x="38" y="6" width="94" height="58" rx="3" fill="url(#hc05GreenDaughter)" stroke="#166534" strokeWidth="1.2" />

      {/* Gold Solder Castellations along Top, Bottom, and Left of Green Core */}
      {[12, 20, 28, 36, 44, 52].map((y) => (
        <rect key={`left-cast-${y}`} x="36.5" y={y - 2} width="3" height="4" rx="0.8" fill="#facc15" stroke="#ca8a04" strokeWidth="0.4" />
      ))}
      {[44, 52, 60, 68, 76, 84, 92, 100].map((x) => (
        <React.Fragment key={`tb-cast-${x}`}>
          <rect x={x - 2} y="4.5" width="4" height="3" rx="0.8" fill="#facc15" stroke="#ca8a04" strokeWidth="0.4" />
          <rect x={x - 2} y="62.5" width="4" height="3" rx="0.8" fill="#facc15" stroke="#ca8a04" strokeWidth="0.4" />
        </React.Fragment>
      ))}

      {/* CSR BC417 Bluetooth Baseband IC (Dark Square QFN) */}
      <rect x="44" y="14" width="28" height="28" rx="1.5" fill="#18181b" stroke="#27272a" strokeWidth="0.8" />
      <circle cx="47" cy="17" r="1" fill="#71717a" />
      <text x="58" y="27" fill="#a1a1aa" fontSize="4.5" fontWeight="900" fontFamily="monospace" textAnchor="middle">CSR</text>
      <text x="58" y="34" fill="#71717a" fontSize="3.5" fontWeight="700" fontFamily="monospace" textAnchor="middle">BC417</text>

      {/* Flash Memory Chip with Gold Chevron Sticker (Matching User Photos!) */}
      <rect x="76" y="14" width="24" height="24" rx="1.5" fill="#18181b" stroke="#27272a" strokeWidth="0.8" />
      {/* Golden Chevron / V sticker */}
      <polygon points="78,16 88,26 84,30 76,22" fill="#eab308" opacity="0.9" />
      <polygon points="98,16 88,26 92,30 100,22" fill="#ca8a04" opacity="0.9" />

      {/* 26MHz Crystal Oscillator Can */}
      <rect x="48" y="46" width="18" height="11" rx="2.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.6" />
      <text x="57" y="53.5" fill="#334155" fontSize="3.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">26.000</text>

      {/* Gold Serpentine / Meander PCB Antenna (Far Right End) */}
      <g transform="translate(106, 12)">
        <rect x="0" y="0" width="22" height="46" rx="2" fill="#0f3d1e" stroke="#166534" strokeWidth="0.6" />
        <path
          d="M 4 4 L 18 4 L 18 10 L 4 10 L 4 16 L 18 16 L 18 22 L 4 22 L 4 28 L 18 28 L 18 34 L 4 34 L 4 40 L 18 40"
          fill="none"
          stroke="#eab308"
          strokeWidth="1.8"
          strokeLinecap="square"
        />
      </g>

      {/* 6-Pin Right-Angle Header on Left (STATE, RXD, TXD, GND, VCC, EN) */}
      <rect x="2" y="6" width="8" height="58" rx="1.5" fill="#18181b" stroke="#000000" strokeWidth="0.8" />
      {[
        { y: 12, lbl: 'STATE' },
        { y: 22, lbl: 'RXD' },
        { y: 32, lbl: 'TXD' },
        { y: 42, lbl: 'GND' },
        { y: 52, lbl: 'VCC' },
        { y: 62, lbl: 'EN' },
      ].map((p, i) => (
        <g key={i}>
          <rect x="0" y={p.y - 1.5} width="6" height="3" rx="0.8" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.5" />
          <circle cx="6" cy={p.y} r="2.2" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.8" />
          <text x="12" y={p.y + 2.5} fill="#ffffff" fontSize="4.5" fontWeight="900" fontFamily="monospace">
            {p.lbl}
          </text>
        </g>
      ))}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 3c. ESP-01S WI-FI MODULE (2x4 Header)
// Dimension: 90 × 60 px
// ─────────────────────────────────────────────────────────────────────────────
const ESP01Renderer: React.FC<{ isSelected: boolean; isRunning: boolean }> = ({ isRunning }) => {
  return (
    <svg
      width="90"
      height="60"
      viewBox="0 0 90 60"
      style={{
        overflow: 'visible',
        filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.4))',
      }}
    >
      {/* Black PCB */}
      <rect x="2" y="2" width="86" height="56" rx="4" fill="#18181b" stroke="#27272a" strokeWidth="1.5" />

      {/* Gold PCB Antenna on Left */}
      <path
        d="M 8 8 L 26 8 L 26 16 L 8 16 L 8 24 L 26 24 L 26 32 L 8 32 L 8 40 L 26 40 L 26 48 L 8 48"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="1.8"
        strokeLinecap="square"
      />

      {/* ESP8266EX QFN chip */}
      <rect x="34" y="14" width="22" height="22" rx="1.5" fill="#09090b" stroke="#334155" strokeWidth="0.8" />
      <text x="45" y="24" fill="#94a3b8" fontSize="4" fontWeight="900" fontFamily="monospace" textAnchor="middle">ESP8266</text>
      <text x="45" y="30" fill="#64748b" fontSize="3.5" fontWeight="700" fontFamily="monospace" textAnchor="middle">EX</text>

      {/* Status LED */}
      <circle cx="50" cy="46" r="2.2" fill={isRunning ? '#38bdf8' : '#0369a1'} />

      {/* 2x4 Dual-Row Male Header on Right */}
      <rect x="64" y="10" width="22" height="40" rx="2" fill="#09090b" stroke="#27272a" strokeWidth="0.8" />
      {[16, 26, 36, 46].map((y, i) => (
        <React.Fragment key={i}>
          <circle cx="70" cy={y} r="2.2" fill="#facc15" stroke="#ca8a04" strokeWidth="0.7" />
          <circle cx="80" cy={y} r="2.2" fill="#facc15" stroke="#ca8a04" strokeWidth="0.7" />
        </React.Fragment>
      ))}
      <text x="45" y="52" fill="#71717a" fontSize="4" fontWeight="800" textAnchor="middle">ESP-01S</text>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 3d. MPU6050 6-AXIS GYRO & ACCELEROMETER MODULE
// Dimension: 120 × 65 px
// ─────────────────────────────────────────────────────────────────────────────
const MPU6050Renderer: React.FC<{ isSelected: boolean; isRunning: boolean }> = ({ isRunning }) => {
  return (
    <svg
      width="120"
      height="65"
      viewBox="0 0 120 65"
      style={{
        overflow: 'visible',
        filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.4))',
      }}
    >
      {/* Deep Blue PCB */}
      <rect x="2" y="2" width="116" height="61" rx="5" fill="#1e3a8a" stroke="#1d4ed8" strokeWidth="1.5" />
      <text x="60" y="12" fill="#bfdbfe" fontSize="5.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">GY-521 / MPU-6050</text>

      {/* MPU6050 QFN Sensor IC */}
      <rect x="46" y="16" width="28" height="28" rx="2" fill="#18181b" stroke="#27272a" strokeWidth="0.8" />
      <circle cx="49" cy="19" r="1.2" fill="#facc15" />
      <text x="60" y="29" fill="#f8fafc" fontSize="5" fontWeight="900" fontFamily="monospace" textAnchor="middle">MPU</text>
      <text x="60" y="36" fill="#94a3b8" fontSize="4" fontWeight="700" fontFamily="monospace" textAnchor="middle">6050</text>

      {/* Axis Marker Arrows */}
      <path d="M 82 24 L 92 24 L 90 22 M 92 24 L 90 26" stroke="#facc15" strokeWidth="1" />
      <text x="96" y="25" fill="#facc15" fontSize="4" fontWeight="800">X</text>
      <path d="M 82 24 L 82 14 L 80 16 M 82 14 L 84 16" stroke="#facc15" strokeWidth="1" />
      <text x="82" y="11" fill="#facc15" fontSize="4" fontWeight="800">Y</text>

      {/* Power LED */}
      <circle cx="20" cy="20" r="2.5" fill={isRunning ? '#22c55e' : '#14532d'} />

      {/* 8-Pin Header at Bottom (VCC, GND, SCL, SDA, XDA, XCL, AD0, INT) */}
      <rect x="8" y="48" width="104" height="14" rx="1.5" fill="#09090b" stroke="#27272a" strokeWidth="0.8" />
      {[
        { x: 14, lbl: 'VCC' },
        { x: 27, lbl: 'GND' },
        { x: 40, lbl: 'SCL' },
        { x: 53, lbl: 'SDA' },
        { x: 66, lbl: 'XDA' },
        { x: 79, lbl: 'XCL' },
        { x: 92, lbl: 'AD0' },
        { x: 105, lbl: 'INT' },
      ].map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy="55" r="2.2" fill="#facc15" stroke="#ca8a04" strokeWidth="0.7" />
          <text x={p.x} y="46" fill="#cbd5e1" fontSize="4" fontWeight="800" fontFamily="monospace" textAnchor="middle">
            {p.lbl}
          </text>
        </g>
      ))}
    </svg>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// 4. HC-SR04 ULTRASONIC SENSOR
// Dimension: 170 × 100 px
// ─────────────────────────────────────────────────────────────────────────────
export const HCSR04Renderer: React.FC<{ isSelected: boolean; isRunning: boolean; distance: number }> = ({ isRunning, distance }) => {
  return (
    <svg
      width="170"
      height="100"
      viewBox="0 0 170 100"
      style={{
        overflow: 'visible',
        filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.45))',
      }}
    >
      <defs>
        <linearGradient id="hcsrPcb" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <radialGradient id="speakerCan" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#cbd5e1" />
          <stop offset="90%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#334155" />
        </radialGradient>
      </defs>

      <rect x="0" y="10" width="170" height="78" rx="6" fill="url(#hcsrPcb)" stroke="#1e3a8a" strokeWidth="1.8" />

      {/* Live Distance Readout Badge */}
      {isRunning && (
        <g>
          <path d="M 35 15 A 30 30 0 0 1 55 15" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" opacity="0.8">
            <animate attributeName="opacity" values="0.9;0.1;0.9" dur="1s" repeatCount="indefinite" />
          </path>
          <rect x="65" y="14" width="40" height="13" rx="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
          <text x="85" y="23" fill="#38bdf8" fontSize="7" fontWeight="900" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
            {Math.round(distance)} cm
          </text>
        </g>
      )}

      {/* Transducers */}
      {[{ cx: 45, lbl: 'T' }, { cx: 125, lbl: 'R' }].map((can, i) => (
        <g key={i}>
          <circle cx={can.cx} cy="48" r="28" fill="url(#speakerCan)" stroke="#475569" strokeWidth="2" />
          <circle cx={can.cx} cy="48" r="22" fill="#1e293b" />
          <circle cx={can.cx} cy="48" r="16" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="3 2" />
          <circle cx={can.cx} cy="48" r="10" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx={can.cx} cy="48" r="4" fill="#64748b" />
          <text x={can.cx} y="84" fill="#ffffff" fontSize="8" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">{can.lbl}</text>
        </g>
      ))}

      {/* Crystal */}
      <rect x="79" y="32" width="12" height="24" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.8" />
      <text x="85" y="64" fill="#ffffff" fontSize="6.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">HC-SR04</text>

      {/* Bottom Pins (VCC, TRIG, ECHO, GND at y: 94.5) */}
      <rect x="65" y="85" width="42" height="6" rx="1" fill="#18181b" stroke="#000000" strokeWidth="0.8" />
      {[
        { x: 71.3, lbl: 'VCC' },
        { x: 81.3, lbl: 'TRIG' },
        { x: 91.3, lbl: 'ECHO' },
        { x: 101.3, lbl: 'GND' },
      ].map((pin, i) => (
        <g key={i}>
          <rect x={pin.x - 1.2} y="88" width="2.4" height="11" rx="0.6" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.5" />
          <circle cx={pin.x} cy="94.5" r="2.2" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.8" />
        </g>
      ))}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. PIR MOTION SENSOR (Exact Match to User Image 2)
// Dimension: 124 × 120 px, Pins: + (44, 114), D (62, 114), - (80, 114)
// ─────────────────────────────────────────────────────────────────────────────
const PIRSensorRenderer: React.FC<{ isSelected: boolean; isRunning: boolean; isMotion: boolean }> = ({ isRunning, isMotion }) => {
  return (
    <svg
      width="124"
      height="120"
      viewBox="0 0 124 120"
      style={{
        overflow: 'visible',
        filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.45))',
      }}
    >
      <defs>
        {/* Hexagonal Pattern for Honeycomb Dome */}
        <pattern id="pirHexPattern" width="12" height="20.78" patternUnits="userSpaceOnUse">
          <path
            d="M 6 0 L 12 3.46 L 12 10.39 L 6 13.85 L 0 10.39 L 0 3.46 Z M 0 17.32 L 6 20.78 L 12 17.32"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="0.7"
            strokeOpacity="0.6"
          />
        </pattern>
        <radialGradient id="pirDomeShading" cx="42%" cy="40%" r="58%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="45%" stopColor="#f1f5f9" stopOpacity="0.65" />
          <stop offset="80%" stopColor="#cbd5e1" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.75" />
        </radialGradient>
      </defs>

      {/* Green Info '?' Circle at top left */}
      <g transform="translate(36, 0)">
        <circle cx="10" cy="10" r="9" fill="none" stroke="#22c55e" strokeWidth="2" />
        <text x="10" y="14" fill="#22c55e" fontSize="12" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">?</text>
      </g>

      {/* Deep Royal Navy Blue PCB */}
      <rect x="8" y="20" width="108" height="74" rx="2" fill="#1e3a8a" stroke="#172554" strokeWidth="1.2" />

      {/* 2 Side Dark Mounting Holes */}
      <circle cx="18" cy="57" r="6" fill="#334155" stroke="#1e293b" strokeWidth="1" />
      <circle cx="106" cy="57" r="6" fill="#334155" stroke="#1e293b" strokeWidth="1" />

      {/* Central Square Translucent Bezel Base */}
      <rect x="25" y="22" width="74" height="65" rx="1.5" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.8" opacity="0.9" />

      {/* Honeycomb Fresnel Dome */}
      <circle cx="62" cy="54" r="30" fill="url(#pirDomeShading)" stroke="#cbd5e1" strokeWidth="1" />
      <circle cx="62" cy="54" r="29.5" fill="url(#pirHexPattern)" />

      {/* Crescent Specular Highlight on Upper-Right */}
      <path
        d="M 62 26 C 76 26 88 38 88 54 C 88 43 78 32 66 28 Z"
        fill="#ffffff"
        opacity="0.75"
      />
      <path
        d="M 45 78 C 36 70 34 50 42 38 C 36 48 38 68 50 78 Z"
        fill="#ffffff"
        opacity="0.35"
      />

      {/* Silkscreen: +  D  - at bottom of PCB */}
      <text x="44" y="89" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">+</text>
      <text x="62" y="89" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">D</text>
      <text x="80" y="89" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">-</text>

      {/* 3 Downward Metallic Lead Pins */}
      {[44, 62, 80].map((px, i) => (
        <g key={i}>
          <rect x={px - 1.6} y="94" width="3.2" height="18" rx="1" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.6" />
        </g>
      ))}

      {/* Motion Active Glow Ring */}
      {isMotion && isRunning && (
        <circle cx="62" cy="54" r="32" fill="none" stroke="#22c55e" strokeWidth="3" opacity="0.85">
          <animate attributeName="r" values="30;36;30" dur="1.2s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. SG90 MICRO SERVO (Photorealistic Micro Servo Hardware)
// Dimension: 95 × 95 px
// ─────────────────────────────────────────────────────────────────────────────
const ServoMotorRenderer: React.FC<{ isSelected: boolean; isRunning: boolean; angle: number }> = ({ isSelected, angle }) => {
  const clamped = Math.max(0, Math.min(180, angle));

  return (
    <svg
      width="95"
      height="95"
      viewBox="0 0 95 95"
      style={{
        overflow: 'visible',
        filter: isSelected
          ? 'drop-shadow(0 0 14px rgba(56,189,248,0.85)) drop-shadow(0 6px 14px rgba(0,0,0,0.45))'
          : 'drop-shadow(0 6px 14px rgba(0,0,0,0.45))',
      }}
    >
      <defs>
        {/* Photorealistic Cyan Molded Plastic Casing */}
        <linearGradient id="sg90PlasticGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="35%" stopColor="#0284c7" />
          <stop offset="75%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#075985" />
        </linearGradient>

        <linearGradient id="sg90EarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#075985" />
        </linearGradient>

        <linearGradient id="sg90HornGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#f8fafc" />
          <stop offset="85%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
      </defs>

      {/* Main Molded Cyan Plastic Casing */}
      <rect x="18" y="24" width="58" height="42" rx="3" fill="url(#sg90PlasticGrad)" stroke="#075985" strokeWidth="1.2" />
      {/* Top Molded Bevel Edge Highlight */}
      <line x1="20" y1="25" x2="74" y2="25" stroke="#ffffff" strokeWidth="0.8" opacity="0.4" />
      {/* Molded Case Seam Line */}
      <line x1="18" y1="46" x2="76" y2="46" stroke="#0c4a6e" strokeWidth="0.8" opacity="0.6" />

      {/* Mounting Flange Ears (Left & Right) */}
      <rect x="6" y="36" width="82" height="9" rx="1.5" fill="url(#sg90EarGrad)" stroke="#075985" strokeWidth="1" />
      {/* Metal Eyelet Screw Holes */}
      <circle cx="10" cy="40.5" r="2.5" fill="#0f172a" stroke="#0284c7" strokeWidth="0.6" />
      <circle cx="10" cy="40.5" r="1.5" fill="#020617" />
      <circle cx="84" cy="40.5" r="2.5" fill="#0f172a" stroke="#0284c7" strokeWidth="0.6" />
      <circle cx="84" cy="40.5" r="1.5" fill="#020617" />

      {/* Silkscreen Label */}
      <text x="36" y="58" fill="#ffffff" fontSize="6.5" fontWeight="900" fontFamily="sans-serif">
        SG90
      </text>
      <text x="36" y="63" fill="#bae6fd" fontSize="3.8" fontWeight="800" fontFamily="sans-serif">
        9g Micro Servo
      </text>

      {/* Rotating Molded White Servo Horn */}
      <g transform={`translate(56, 42) rotate(${clamped - 90})`}>
        {/* Double-arm Horn Body */}
        <path
          d="M -5 -22 L 5 -22 C 7 -10 7 10 5 22 L -5 22 C -7 10 -7 -10 -5 -22 Z"
          fill="url(#sg90HornGrad)"
          stroke="#94a3b8"
          strokeWidth="0.8"
        />
        {/* Central Hub Disc */}
        <circle cx="0" cy="0" r="8" fill="url(#sg90HornGrad)" stroke="#94a3b8" strokeWidth="0.8" />
        {/* Central Metal Screw Head */}
        <circle cx="0" cy="0" r="3.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.6" />
        <circle cx="0" cy="0" r="2.2" fill="#94a3b8" />
        <line x1="-1.5" y1="0" x2="1.5" y2="0" stroke="#334155" strokeWidth="0.8" />
        <line x1="0" y1="-1.5" x2="0" y2="1.5" stroke="#334155" strokeWidth="0.8" />

        {/* 4 Small Arm Mounting Holes */}
        {[-17, -11, 11, 17].map((dy) => (
          <circle key={dy} cx="0" cy={dy} r="1.4" fill="#64748b" stroke="#475569" strokeWidth="0.4" />
        ))}
      </g>

      {/* 3-Wire Molded Ribbon Cable (Brown, Red, Orange) */}
      <path d="M 38 66 Q 28 76 20 82" fill="none" stroke="#78350f" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M 44 66 Q 38 76 40 82" fill="none" stroke="#dc2626" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M 50 66 Q 48 76 60 82" fill="none" stroke="#ea580c" strokeWidth="2.8" strokeLinecap="round" />

      {/* DuPont 3-Pin Female Socket Block (GND 20, VCC 40, PWM 60 at y: 86) */}
      <rect x="10" y="80" width="60" height="12" rx="2" fill="#18181b" stroke="#09090b" strokeWidth="1" />
      {[20, 40, 60].map((px, i) => (
        <g key={i}>
          <rect x={px - 3.5} y="82" width="7" height="8" rx="0.8" fill="#27272a" stroke="#18181b" strokeWidth="0.4" />
          <circle cx={px} cy="86" r="2.2" fill="#09090b" stroke="#ca8a04" strokeWidth="1" />
        </g>
      ))}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 6b. NEMA 17 STEPPER MOTOR
// Dimension: 140 × 140 px
// ─────────────────────────────────────────────────────────────────────────────
const StepperMotorRenderer: React.FC<{
  isSelected: boolean;
  isRunning: boolean;
  angle: number;
  step?: number;
}> = ({ isSelected, angle }) => {
  const normAngle = ((angle % 360) + 360) % 360;

  return (
    <svg
      width="140"
      height="140"
      viewBox="0 0 140 140"
      style={{
        overflow: 'visible',
        filter: isSelected
          ? 'drop-shadow(0 0 16px rgba(56,189,248,0.85)) drop-shadow(0 6px 14px rgba(0,0,0,0.5))'
          : 'drop-shadow(0 6px 14px rgba(0,0,0,0.45))',
      }}
    >
      <defs>
        <linearGradient id="stepperBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="40%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="stepperMetalRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="40%" stopColor="#cbd5e1" />
          <stop offset="80%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
      </defs>

      {/* Main Square Casing Body */}
      <rect x="6" y="6" width="128" height="114" rx="8" fill="url(#stepperBody)" stroke="#0f172a" strokeWidth="2" />

      {/* 4 Corner Bolts */}
      {[
        { cx: 16, cy: 16 },
        { cx: 124, cy: 16 },
        { cx: 16, cy: 110 },
        { cx: 124, cy: 110 },
      ].map((c, i) => (
        <g key={i}>
          <circle cx={c.cx} cy={c.cy} r="5.5" fill="#475569" stroke="#334155" strokeWidth="1" />
          <circle cx={c.cx} cy={c.cy} r="3.2" fill="#0f172a" />
        </g>
      ))}

      {/* Outer Raised Metallic Rotor Ring */}
      <circle cx="70" cy="63" r="42" fill="url(#stepperMetalRing)" stroke="#475569" strokeWidth="1.5" />
      <circle cx="70" cy="63" r="35" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />

      {/* 12 Compass Degree Ticks */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <line
          key={deg}
          x1="70"
          y1="29"
          x2="70"
          y2="33"
          stroke="#64748b"
          strokeWidth="1.2"
          transform={`rotate(${deg} 70 63)`}
        />
      ))}

      {/* Rotatable Shaft & D-Cut Indicator Arm */}
      <g transform={`rotate(${normAngle} 70 63)`}>
        {/* Metal Hub */}
        <circle cx="70" cy="63" r="14" fill="url(#stepperMetalRing)" stroke="#475569" strokeWidth="1" />
        {/* D-Flat Cutout */}
        <path d="M 64 51 L 76 51 A 14 14 0 0 1 64 51 Z" fill="#475569" />

        {/* Pointer Arm Indicator */}
        <path d="M 67 63 L 73 63 L 71 30 L 69 30 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="0.8" />
        <circle cx="70" cy="30" r="2.5" fill="#fef08a" />
        <circle cx="70" cy="63" r="4" fill="#0f172a" stroke="#475569" strokeWidth="1" />
      </g>

      {/* Readout Header Badge */}
      <rect x="25" y="10" width="90" height="16" rx="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
      <text x="70" y="21" fill="#38bdf8" fontSize="8.5" fontWeight="900" fontFamily="monospace" textAnchor="middle">
        STEPPER {Math.round(normAngle)}°
      </text>

      {/* Bottom Terminal Pins (A+, A-, B+, B-) */}
      <rect x="15" y="118" width="110" height="18" rx="2" fill="#09090b" stroke="#27272a" strokeWidth="1" />
      {[
        { x: 25, label: 'A+' },
        { x: 55, label: 'A-' },
        { x: 85, label: 'B+' },
        { x: 115, label: 'B-' },
      ].map((p, i) => (
        <g key={i}>
          <rect x={p.x - 3.5} y="120" width="7" height="12" rx="1" fill="#facc15" stroke="#ca8a04" strokeWidth="0.6" />
          <text x={p.x} y="114" fill="#94a3b8" fontSize="6" fontWeight="800" fontFamily="monospace" textAnchor="middle">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. 5MM DOMED LED (Exact Match to User Image 4 with Green Solder Rings)
// Dimension: 40 × 50 px, Anode (25, 44), Cathode (15, 44)
// ─────────────────────────────────────────────────────────────────────────────
const LEDRenderer: React.FC<{
  isSelected: boolean;
  isRunning: boolean;
  color: string;
  isOn: boolean;
  brightness?: number;
  burnedOut?: boolean;
}> = ({
  isSelected,
  color,
  isOn,
  brightness = 1,
  burnedOut = false,
}) => {
  const getPalette = () => {
    switch (color?.toLowerCase()) {
      case 'green':
        return {
          onCore: '#ffffff',
          onBody: '#22c55e',
          onGlow: '#22c55e',
          offBody: '#065f46',
          offBase: '#022c22',
          border: '#15803d',
        };
      case 'blue':
        return {
          onCore: '#ffffff',
          onBody: '#3b82f6',
          onGlow: '#3b82f6',
          offBody: '#1e40af',
          offBase: '#0f172a',
          border: '#1d4ed8',
        };
      case 'yellow':
        return {
          onCore: '#ffffff',
          onBody: '#eab308',
          onGlow: '#eab308',
          offBody: '#854d0e',
          offBase: '#451a03',
          border: '#a16207',
        };
      case 'orange':
        return {
          onCore: '#ffffff',
          onBody: '#f97316',
          onGlow: '#f97316',
          offBody: '#9a3412',
          offBase: '#431407',
          border: '#c2410c',
        };
      case 'white':
        return {
          onCore: '#ffffff',
          onBody: '#ffffff',
          onGlow: '#ffffff',
          offBody: '#e2e8f0',
          offBase: '#94a3b8',
          border: '#cbd5e1',
        };
      case 'red':
      default:
        return {
          onCore: '#ffffff',
          onBody: '#ef4444',
          onGlow: '#ef4444',
          offBody: '#991b1b',
          offBase: '#450a0a',
          border: '#b91c1c',
        };
    }
  };
  const pal = getPalette();

  const effectiveGlowRadius = 28 * (0.4 + 0.6 * brightness);
  const glowOpacity = Math.min(1, 0.2 + 0.8 * brightness);

  return (
    <svg
      width="40"
      height="50"
      viewBox="0 0 40 50"
      style={{
        overflow: 'visible',
        filter: burnedOut
          ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))'
          : isOn
          ? `drop-shadow(0 0 ${Math.max(4, 14 * brightness)}px ${pal.onGlow}) drop-shadow(0 0 ${Math.max(8, 28 * brightness)}px ${pal.onGlow}) drop-shadow(0 4px 8px rgba(0,0,0,0.5))`
          : 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
      }}
    >
      <defs>
        {/* Wokwi / Tinkercad Signature Multi-Stage Light Halo Bloom when ON */}
        <radialGradient id={`ledGlowAura-${color}-${isOn ? 'on' : 'off'}`} cx="50%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="25%" stopColor={pal.onGlow} stopOpacity={0.95 * glowOpacity} />
          <stop offset="60%" stopColor={pal.onGlow} stopOpacity={0.5 * glowOpacity} />
          <stop offset="100%" stopColor={pal.onGlow} stopOpacity="0" />
        </radialGradient>

        {/* 5mm Translucent Dome 3D Shading */}
        <radialGradient id={`ledDomeGrad-${color}-${isOn ? 'on' : 'off'}`} cx="38%" cy="28%" r="72%">
          <stop offset="0%" stopColor={isOn ? '#ffffff' : pal.border} stopOpacity={isOn ? 0.98 : 0.5} />
          <stop offset="35%" stopColor={isOn ? pal.onBody : pal.offBody} stopOpacity={isOn ? 0.95 : 0.82} />
          <stop offset="85%" stopColor={isOn ? pal.onBody : pal.offBase} stopOpacity={1} />
          <stop offset="100%" stopColor={isOn ? pal.border : '#18181b'} stopOpacity={1} />
        </radialGradient>
      </defs>

      {/* Outer Radial Light Halo (Pulsing bloom overlay when ON and not burned out) */}
      {isOn && !burnedOut && (
        <circle cx="20" cy="17" r={effectiveGlowRadius} fill={`url(#ledGlowAura-${color}-on)`} style={{ pointerEvents: 'none' }}>
          <animate attributeName="opacity" values={`${glowOpacity * 0.88};${glowOpacity};${glowOpacity * 0.88}`} dur="1s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Metallic Wire Leads (Cathode Left: Straight, Anode Right: Bent Step, Tinkercad/Wokwi standard) */}
      <line x1="15" y1="28" x2="15" y2="44" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 25 28 L 25 34 L 27 38 L 25 44" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />

      {/* Solder Connection Rings */}
      <circle cx="15" cy="44" r="3.2" fill="#22c55e" stroke="#16a34a" strokeWidth="1" />
      <circle cx="25" cy="44" r="3.2" fill="#22c55e" stroke="#16a34a" strokeWidth="1" />

      {/* Base Flange Ring (With Cathode Flat Edge Notch on Left) */}
      <path
        d="M 10 26 L 10 29 Q 10 30.5 12.5 30.5 L 27.5 30.5 Q 30 30.5 30 29 L 30 26 Z"
        fill={burnedOut ? '#27272a' : isOn ? pal.onBody : pal.offBase}
        stroke={burnedOut ? '#09090b' : isOn ? pal.border : '#3f3f46'}
        strokeWidth="0.8"
      />

      {/* Main 5mm Epoxy Dome Body */}
      <path
        d="M 11 26 C 11 7 29 7 29 26 Z"
        fill={burnedOut ? '#27272a' : `url(#ledDomeGrad-${color}-${isOn ? 'on' : 'off'})`}
        stroke={burnedOut ? '#18181b' : isOn ? pal.onGlow : '#52525b'}
        strokeWidth={isOn && !burnedOut ? 1.6 : 1}
      />

      {/* Internal Leadframe (Cathode Anvil & Anode Post inside translucent epoxy) */}
      <path d="M 15 26 L 15 19 L 18 16 L 18 26 Z" fill={burnedOut ? '#09090b' : isOn ? '#ffffff' : '#94a3b8'} opacity={burnedOut ? 0.9 : isOn ? 0.95 : 0.6} />
      <path d="M 24 26 L 24 15 L 26 15 L 26 26 Z" fill={burnedOut ? '#09090b' : isOn ? '#ffffff' : '#cbd5e1'} opacity={burnedOut ? 0.9 : isOn ? 0.95 : 0.7} />

      {/* Semiconductor White-Hot Die Core Spot */}
      {!burnedOut && (
        <circle cx="19.5" cy="17" r={isOn ? 3.2 * brightness : 1.3} fill={isOn ? '#ffffff' : '#f1f5f9'} opacity={isOn ? 1 : 0.85} />
      )}
      {isOn && !burnedOut && <circle cx="19.5" cy="17" r={5.5 * brightness} fill="#ffffff" opacity={0.65 * brightness} />}

      {/* Burned Out Over-Voltage Smoked Scorch & Explosion Symbol (💥) */}
      {burnedOut && (
        <g>
          <circle cx="20" cy="18" r="7" fill="#09090b" opacity="0.85" />
          <circle cx="20" cy="18" r="4" fill="#3f3f46" opacity="0.6" />
          <path d="M 17 14 L 20 18 L 22 13" stroke="#71717a" strokeWidth="0.8" />
          <path d="M 20 18 L 24 22" stroke="#71717a" strokeWidth="0.8" />
          <text x="20" y="8" fontSize="13" textAnchor="middle" style={{ pointerEvents: 'none' }}>
            💥
          </text>
        </g>
      )}

      {/* Specular Top Glass Curve Reflection Highlight */}
      {!burnedOut && (
        <path
          d="M 15 18 C 15 11 23 11 25 15"
          fill="none"
          stroke="#ffffff"
          strokeWidth={isOn ? 2.2 : 1.5}
          strokeLinecap="round"
          opacity={isOn ? 0.98 : 0.65}
        />
      )}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. THROUGH-HOLE AXIAL RESISTOR (Exact Match to User Image 4 with Green Rings)
// Dimension: 80 × 18 px, Pin 1 (4, 9), Pin 2 (76, 9)
// ─────────────────────────────────────────────────────────────────────────────
const ResistorRenderer: React.FC<{ isSelected: boolean; resistance: number }> = ({ resistance }) => {
  const colors: Record<number, string> = {
    0: '#000000', 1: '#854d0e', 2: '#ef4444', 3: '#f97316', 4: '#eab308',
    5: '#22c55e', 6: '#3b82f6', 7: '#a855f7', 8: '#6b7280', 9: '#ffffff',
  };
  const val = Math.max(1, Math.round(resistance || 220));
  const str = val.toString();
  const b1 = colors[parseInt(str[0]) || 2];
  const b2 = colors[str.length > 1 ? parseInt(str[1]) : 0];
  const zeros = Math.max(0, str.length - 2);
  const b3 = zeros === 0 ? '#000000' : zeros === 1 ? '#854d0e' : zeros === 2 ? '#ef4444' : zeros === 3 ? '#f97316' : '#eab308';

  return (
    <svg
      width="80"
      height="18"
      viewBox="0 0 80 18"
      style={{
        overflow: 'visible',
        filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.3))',
      }}
    >
      <defs>
        <linearGradient id="resistorBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="35%" stopColor="#fde047" />
          <stop offset="70%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#a16207" />
        </linearGradient>
      </defs>

      {/* Silver Axial Lead Wire running through */}
      <line x1="4" y1="9" x2="76" y2="9" stroke="#cbd5e1" strokeWidth="2.4" strokeLinecap="round" />

      {/* Bright Green Pin Connection Rings (Matching Image 4) */}
      <circle cx="4" cy="9" r="3.2" fill="#22c55e" stroke="#16a34a" strokeWidth="1" />
      <circle cx="76" cy="9" r="3.2" fill="#22c55e" stroke="#16a34a" strokeWidth="1" />

      {/* Ceramic Contoured Body (Bulbous ends and central waist) */}
      <path
        d="M 22 4 C 24 4 25 6 30 6 C 35 6 36 4 54 4 C 56 4 57 6 57 9 C 57 12 56 14 54 14 C 36 14 35 12 30 12 C 25 12 24 14 22 14 C 20 14 19 12 19 9 C 19 6 20 4 22 4 Z"
        fill="url(#resistorBody)"
        stroke="#ca8a04"
        strokeWidth="0.8"
      />

      {/* 4 Standard EIA Color Bands */}
      <rect x="25" y="4.5" width="3.5" height="9" fill={b1} rx="0.5" />
      <rect x="32" y="5.5" width="3.5" height="7" fill={b2} rx="0.5" />
      <rect x="39" y="5.5" width="3.5" height="7" fill={b3} rx="0.5" />
      {/* 5% Gold tolerance band */}
      <rect x="49" y="4.5" width="3.5" height="9" fill="#d97706" stroke="#fbbf24" strokeWidth="0.5" rx="0.5" />

      {/* Top Specular Glaze Highlight */}
      <line x1="22" y1="5.5" x2="54" y2="5.5" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. TACTILE PUSHBUTTON (Exact Match to User Image 4 with 4 Green Solder Rings)
// Dimension: 67 × 75 px, Pins: 1a (23.5, 6), 1b (43.5, 6), 2a (23.5, 69), 2b (43.5, 69)
// ─────────────────────────────────────────────────────────────────────────────
const PushbuttonRenderer: React.FC<{ isSelected: boolean; isPressed: boolean; color: string }> = ({
  isPressed,
  color,
}) => {
  const btnColor = color === 'red' ? '#ef4444' : color === 'blue' ? '#3b82f6' : '#15803d';

  return (
    <svg
      width="67"
      height="75"
      viewBox="0 0 67 75"
      style={{
        overflow: 'visible',
        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.3))',
      }}
    >
      {/* 4 Vertical Metallic Terminal Legs */}
      <line x1="23.5" y1="6" x2="23.5" y2="20" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      <line x1="43.5" y1="6" x2="43.5" y2="20" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      <line x1="23.5" y1="55" x2="23.5" y2="69" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      <line x1="43.5" y1="55" x2="43.5" y2="69" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />

      {/* Bright Green Pin Connection Rings (Matching Image 4) */}
      <circle cx="23.5" cy="6" r="3.2" fill="#22c55e" stroke="#16a34a" strokeWidth="1" />
      <circle cx="43.5" cy="6" r="3.2" fill="#22c55e" stroke="#16a34a" strokeWidth="1" />
      <circle cx="23.5" cy="69" r="3.2" fill="#22c55e" stroke="#16a34a" strokeWidth="1" />
      <circle cx="43.5" cy="69" r="3.2" fill="#22c55e" stroke="#16a34a" strokeWidth="1" />

      {/* Stainless Steel Square Body with Double Outline */}
      <rect x="13.5" y="19" width="40" height="37" rx="3" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
      <rect x="16.5" y="22" width="34" height="31" rx="2" fill="#09090b" stroke="#52525b" strokeWidth="1.2" />

      {/* 4 Corner Dimple Rivets */}
      <circle cx="18" cy="24" r="1.5" fill="#e2e8f0" />
      <circle cx="49" cy="24" r="1.5" fill="#e2e8f0" />
      <circle cx="18" cy="51" r="1.5" fill="#e2e8f0" />
      <circle cx="49" cy="51" r="1.5" fill="#e2e8f0" />

      {/* Large Round Green Plunger Button Cap */}
      <circle cx="33.5" cy="37.5" r={isPressed ? 13.5 : 15} fill={btnColor} stroke="#14532d" strokeWidth="1.2" />
      <circle cx="31" cy="35" r="5" fill="#ffffff" opacity="0.3" />
    </svg>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// 10. ROTARY POTENTIOMETER (Tinkercad-Exact Dial & Terminal Lugs)
// Dimension: 78 × 78 px, Pins: GND (29, 68.5), SIG (39, 68.5), VCC (49, 68.5)
// ─────────────────────────────────────────────────────────────────────────────
const PotentiometerRenderer: React.FC<{ isSelected: boolean; value: number }> = ({ isSelected, value }) => {
  // Value 0..1023 (or legacy 0..100) maps to -135° to +135° rotation
  const normalizedVal = value <= 100 ? (value / 100) * 1023 : value;
  const rot = -135 + Math.min(1.0, Math.max(0, normalizedVal / 1023)) * 270;

  return (
    <svg
      width="78"
      height="78"
      viewBox="0 0 78 78"
      style={{
        overflow: 'visible',
        filter: isSelected
          ? 'drop-shadow(0 0 14px rgba(56, 189, 248, 0.8)) drop-shadow(0 4px 10px rgba(0,0,0,0.4))'
          : 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
      }}
    >
      {/* 3 Bottom Solder Lug Terminals */}
      {[29, 39, 49].map((px, i) => (
        <g key={i}>
          <rect x={px - 2.5} y="54" width="5" height="17" rx="1.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.8" />
          <circle cx={px} cy="68.5" r="1.8" fill="#1e293b" />
        </g>
      ))}

      {/* Blue Cylindrical Pot Body */}
      <circle cx="39" cy="34" r="28" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
      <circle cx="39" cy="34" r="23" fill="#0369a1" />

      {/* Rotating Knurled Dial & Pointer Notch */}
      <g transform={`translate(39, 34) rotate(${rot})`}>
        <circle cx="0" cy="0" r="17" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
        {/* Pointer indicator line */}
        <line x1="0" y1="-17" x2="0" y2="-6" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="0" cy="0" r="5" fill="#94a3b8" />
      </g>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 11. 9V ALKALINE BATTERY (Tinkercad-Exact PP3 Battery & Snap Terminals)
// Dimension: 80 × 120 px, Pins: + (26, 12), - (54, 12)
// ─────────────────────────────────────────────────────────────────────────────
const Battery9VRenderer: React.FC<{ isSelected: boolean }> = ({ isSelected }) => {
  return (
    <svg
      width="80"
      height="120"
      viewBox="0 0 80 120"
      style={{
        overflow: 'visible',
        filter: isSelected
          ? 'drop-shadow(0 0 16px rgba(56, 189, 248, 0.8)) drop-shadow(0 8px 16px rgba(0,0,0,0.5))'
          : 'drop-shadow(0 6px 14px rgba(0,0,0,0.4))',
      }}
    >
      <defs>
        <linearGradient id="batJacket" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="60%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
      </defs>

      {/* Battery Body Jacket */}
      <rect x="6" y="24" width="68" height="92" rx="6" fill="url(#batJacket)" stroke={isSelected ? '#38bdf8' : '#334155'} strokeWidth="1.5" />

      {/* Gold Band Accent */}
      <rect x="6" y="70" width="68" height="12" fill="#eab308" />
      <text x="40" y="79" fill="#0f172a" fontSize="8" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">9V ALKALINE</text>

      {/* Top Terminal Block */}
      <rect x="14" y="16" width="52" height="12" rx="3" fill="#64748b" stroke="#334155" strokeWidth="1" />

      {/* Octagonal Female Terminal (+) at x: 26, y: 12 */}
      <polygon points="22,6 30,6 34,10 34,18 30,22 22,22 18,18 18,10" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
      <circle cx="26" cy="14" r="3" fill="#0f172a" />
      <text x="26" y="32" fill="#ef4444" fontSize="8" fontWeight="900" textAnchor="middle">+</text>

      {/* Solid Circular Male Stud (-) at x: 54, y: 12 */}
      <circle cx="54" cy="14" r="7" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
      <circle cx="54" cy="14" r="4.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
      <text x="54" y="32" fill="#38bdf8" fontSize="8" fontWeight="900" textAnchor="middle">-</text>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 12. 3V COIN CELL CR2032 (Tinkercad-Exact Stamped Disc & Socket Clip)
// Dimension: 85 × 85 px, Pins: + (42.5, 10), - (42.5, 75)
// ─────────────────────────────────────────────────────────────────────────────
const CoinCellRenderer: React.FC<{ isSelected: boolean }> = ({ isSelected }) => {
  return (
    <svg
      width="85"
      height="85"
      viewBox="0 0 85 85"
      style={{
        overflow: 'visible',
        filter: isSelected
          ? 'drop-shadow(0 0 14px rgba(56, 189, 248, 0.8)) drop-shadow(0 4px 10px rgba(0,0,0,0.4))'
          : 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))',
      }}
    >
      <defs>
        <radialGradient id="coinGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#e2e8f0" />
          <stop offset="85%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </radialGradient>
      </defs>

      {/* Stamped Metallic Disc */}
      <circle cx="42.5" cy="42.5" r="34" fill="url(#coinGrad)" stroke={isSelected ? '#38bdf8' : '#64748b'} strokeWidth="1.5" />
      <circle cx="42.5" cy="42.5" r="30" fill="none" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3 3" />

      {/* Stamped Silkscreen Markings */}
      <text x="42.5" y="32" fill="#475569" fontSize="14" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">+</text>
      <text x="42.5" y="44" fill="#334155" fontSize="7.5" fontWeight="900" fontFamily="monospace" letterSpacing="0.8" textAnchor="middle">CR2032</text>
      <text x="42.5" y="54" fill="#64748b" fontSize="5.5" fontWeight="700" fontFamily="sans-serif" textAnchor="middle">3V LITHIUM</text>

      {/* Terminal Contact Clips */}
      <rect x="38" y="6" width="9" height="8" rx="1.5" fill="#f59e0b" stroke="#ca8a04" strokeWidth="0.8" />
      <rect x="38" y="71" width="9" height="8" rx="1.5" fill="#94a3b8" stroke="#475569" strokeWidth="0.8" />
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 13. 1.5V AA BATTERY & 4x AA BATTERY PACK
// ─────────────────────────────────────────────────────────────────────────────
const BatteryAARenderer: React.FC<{ isSelected: boolean }> = ({ isSelected }) => {
  return (
    <svg width="42" height="100" viewBox="0 0 42 100" style={{ overflow: 'visible', filter: isSelected ? 'drop-shadow(0 0 12px rgba(56, 189, 248, 0.8))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))' }}>
      {/* Top Positive Nub */}
      <rect x="16" y="4" width="10" height="6" rx="2" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.8" />
      {/* Battery Body */}
      <rect x="4" y="10" width="34" height="80" rx="3" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
      <rect x="4" y="10" width="34" height="24" rx="2" fill="#ca8a04" />
      <text x="21" y="24" fill="#000000" fontSize="6" fontWeight="900" textAnchor="middle">+</text>
      <text x="21" y="60" fill="#ffffff" fontSize="6.5" fontWeight="900" textAnchor="middle">1.5V AA</text>
    </svg>
  );
};

const BatteryPack4xAARenderer: React.FC<{ isSelected: boolean }> = ({ isSelected }) => {
  return (
    <svg width="120" height="85" viewBox="0 0 120 85" style={{ overflow: 'visible', filter: isSelected ? 'drop-shadow(0 0 14px rgba(56, 189, 248, 0.8))' : 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))' }}>
      <rect x="4" y="4" width="104" height="77" rx="5" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
      {/* 4 Cells Compartment Ribs */}
      {[22, 48, 74].map((y) => (
        <line key={y} x1="6" y1={y} x2="106" y2={y} stroke="#3f3f46" strokeWidth="1" />
      ))}
      <text x="55" y="46" fill="#71717a" fontSize="7" fontWeight="800" textAnchor="middle">4x AA (6.0V)</text>
      {/* Red and Black Flying Leads */}
      <path d="M 108 28 L 116 28" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 108 58 L 116 58" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 14. PIEZO BUZZER
// Dimension: 60 × 60 px, Pins: - (20, 52), + (40, 52)
// ─────────────────────────────────────────────────────────────────────────────
const PiezoBuzzerRenderer: React.FC<{ isSelected: boolean; isSounding: boolean }> = ({ isSelected, isSounding }) => {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" style={{ overflow: 'visible', filter: isSelected ? 'drop-shadow(0 0 12px rgba(56, 189, 248, 0.8))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))' }}>
      <circle cx="30" cy="30" r="26" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
      <circle cx="30" cy="30" r="20" fill="#09090b" />
      <circle cx="30" cy="30" r="6" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
      <text x="44" y="22" fill="#ffffff" fontSize="8" fontWeight="900">+</text>
      {isSounding && (
        <g>
          <circle cx="30" cy="30" r="28" fill="none" stroke="#f59e0b" strokeWidth="2.5" opacity="0.9">
            <animate attributeName="r" values="26;34;26" dur="0.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0.2;0.9" dur="0.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="30" cy="30" r="34" fill="none" stroke="#fbbf24" strokeWidth="1.8" opacity="0.6">
            <animate attributeName="r" values="28;40;28" dur="0.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="0.4s" repeatCount="indefinite" />
          </circle>
        </g>
      )}
      {/* Pins at y: 52 */}
      <circle cx="20" cy="52" r="2.2" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.8" />
      <circle cx="40" cy="52" r="2.2" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.8" />
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 15. SPDT SLIDE SWITCH (Tinkercad-Exact Metal Box & Slide Toggle)
// Dimension: 65 × 35 px, Pins: 1 (14, 28), COM (32.5, 28), 2 (51, 28)
// ─────────────────────────────────────────────────────────────────────────────
const SlideSwitchRenderer: React.FC<{ isSelected: boolean; switchState: string; onToggle?: () => void }> = ({
  isSelected,
  switchState,
  onToggle,
}) => {
  const isRight = switchState === 'right';

  return (
    <svg
      width="65"
      height="35"
      viewBox="0 0 65 35"
      style={{
        overflow: 'visible',
        cursor: 'pointer',
        filter: isSelected
          ? 'drop-shadow(0 0 12px rgba(56, 189, 248, 0.8))'
          : 'drop-shadow(0 3px 6px rgba(0,0,0,0.3))',
      }}
      onClick={onToggle}
    >
      {/* 3 Bottom Pins */}
      {[14, 32.5, 51].map((px, i) => (
        <line key={i} x1={px} y1="20" x2={px} y2="30" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
      ))}

      {/* Silver Metal Switch Frame */}
      <rect x="6" y="8" width="53" height="15" rx="2" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />

      {/* Recessed Slot */}
      <rect x="14" y="11" width="37" height="9" rx="2" fill="#09090b" />

      {/* Black Ridged Slide Handle */}
      <g transform={`translate(${isRight ? 36 : 14}, 9)`}>
        <rect x="0" y="0" width="15" height="13" rx="2" fill="#18181b" stroke="#3f3f46" strokeWidth="0.8" />
        <line x1="4" y1="3" x2="4" y2="10" stroke="#52525b" strokeWidth="1" />
        <line x1="7.5" y1="3" x2="7.5" y2="10" stroke="#52525b" strokeWidth="1" />
        <line x1="11" y1="3" x2="11" y2="10" stroke="#52525b" strokeWidth="1" />
      </g>
    </svg>
  );
};



// ─────────────────────────────────────────────────────────────────────────────
// 17. DISCRETE SEMICONDUCTORS (Diodes, Transistor, Capacitors)
// ─────────────────────────────────────────────────────────────────────────────
const DiodeRenderer: React.FC<{ isSelected: boolean; isZener?: boolean }> = ({ isSelected, isZener }) => {
  return (
    <svg width="65" height="24" viewBox="0 0 65 24" style={{ overflow: 'visible', filter: isSelected ? 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.8))' : 'drop-shadow(0 2px 5px rgba(0,0,0,0.3))' }}>
      <line x1="6" y1="12" x2="59" y2="12" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      <rect x="18" y="7" width="28" height="10" rx="2" fill={isZener ? '#ea580c' : '#18181b'} stroke="#3f3f46" strokeWidth="0.8" />
      {/* Silver Cathode Band */}
      <rect x="40" y="7" width="4" height="10" fill="#e2e8f0" />
    </svg>
  );
};

const TransistorRenderer: React.FC<{ isSelected: boolean }> = ({ isSelected }) => {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" style={{ overflow: 'visible', filter: isSelected ? 'drop-shadow(0 0 12px rgba(56, 189, 248, 0.8))' : 'drop-shadow(0 3px 6px rgba(0,0,0,0.3))' }}>
      {/* 3 Leads (C 15, B 30, E 45 at y: 50) */}
      {[15, 30, 45].map((px, i) => (
        <line key={i} x1={px} y1="34" x2={px} y2="52" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      ))}
      {/* TO-92 Curved Black Package */}
      <path d="M 12 16 C 12 34 48 34 48 16 Z" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
      <text x="30" y="24" fill="#a1a1aa" fontSize="5" fontWeight="900" fontFamily="monospace" textAnchor="middle">2N2222</text>
    </svg>
  );
};

const CapacitorElectrolyticRenderer: React.FC<{ isSelected: boolean; capacitance: string }> = ({ isSelected, capacitance }) => {
  return (
    <svg width="50" height="70" viewBox="0 0 50 70" style={{ overflow: 'visible', filter: isSelected ? 'drop-shadow(0 0 12px rgba(56, 189, 248, 0.8))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))' }}>
      {/* Leads (+ 18, - 32 at y: 62) */}
      <line x1="18" y1="46" x2="18" y2="64" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="46" x2="32" y2="64" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      {/* Cylindrical Aluminum Can with Blue PVC Sleeve */}
      <rect x="8" y="8" width="34" height="42" rx="4" fill="#1d4ed8" stroke="#1e40af" strokeWidth="1" />
      {/* White Negative Stripe */}
      <rect x="30" y="8" width="9" height="42" fill="#ffffff" opacity="0.85" />
      <text x="34.5" y="22" fill="#000000" fontSize="7" fontWeight="900" textAnchor="middle">-</text>
      <text x="34.5" y="36" fill="#000000" fontSize="7" fontWeight="900" textAnchor="middle">-</text>
      <text x="18" y="32" fill="#ffffff" fontSize="5" fontWeight="800" fontFamily="monospace">{capacitance}</text>
    </svg>
  );
};

const CapacitorCeramicRenderer: React.FC<{ isSelected: boolean }> = ({ isSelected }) => {
  return (
    <svg width="46" height="55" viewBox="0 0 46 55" style={{ overflow: 'visible', filter: isSelected ? 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.8))' : 'drop-shadow(0 3px 6px rgba(0,0,0,0.3))' }}>
      <line x1="16" y1="32" x2="16" y2="50" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="32" x2="30" y2="50" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      {/* Orange-Tan Ceramic Disc */}
      <circle cx="23" cy="22" r="15" fill="#ea580c" stroke="#c2410c" strokeWidth="1" />
      <text x="23" y="25" fill="#ffffff" fontSize="6.5" fontWeight="900" fontFamily="monospace" textAnchor="middle">104</text>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 18. LCD 1602 DISPLAY (Tinkercad-Exact Blue Backlit Character Matrix)
// Dimension: 230 × 110 px, Pins: GND (4, 98), VCC (14, 98), SDA (24, 98), SCL (34, 98)
// ─────────────────────────────────────────────────────────────────────────────
const LCD1602Renderer: React.FC<{ isSelected: boolean; isRunning: boolean; text: string }> = ({ isSelected, isRunning, text }) => {
  return (
    <svg
      width="230"
      height="110"
      viewBox="0 0 230 110"
      style={{
        overflow: 'visible',
        filter: isSelected
          ? 'drop-shadow(0 0 16px rgba(56, 189, 248, 0.8)) drop-shadow(0 8px 18px rgba(0,0,0,0.5))'
          : 'drop-shadow(0 6px 14px rgba(0,0,0,0.4))',
      }}
    >
      {/* Dark Green PCB Backing */}
      <rect x="0" y="0" width="230" height="106" rx="4" fill="#14532d" stroke="#166534" strokeWidth="1.5" />
      {/* 4 Corner Brass Mounting Holes */}
      <circle cx="8" cy="8" r="3" fill="#ca8a04" />
      <circle cx="222" cy="8" r="3" fill="#ca8a04" />
      <circle cx="8" cy="98" r="3" fill="#ca8a04" />
      <circle cx="222" cy="98" r="3" fill="#ca8a04" />

      {/* Black Metal Screen Bezel */}
      <rect x="22" y="16" width="186" height="74" rx="3" fill="#09090b" stroke="#27272a" strokeWidth="1.2" />

      {/* Blue Backlit LCD Glass */}
      <rect
        x="32"
        y="24"
        width="166"
        height="58"
        rx="2"
        fill={isRunning ? '#1d4ed8' : '#0f172a'}
        stroke="#1e3a8a"
        strokeWidth="1"
      />

      {/* Dot-Matrix Character Display */}
      {isRunning && (
        <text
          x="42"
          y="46"
          fill="#ffffff"
          fontSize="11"
          fontWeight="900"
          fontFamily="monospace"
          letterSpacing="1"
          filter="drop-shadow(0 0 4px #60a5fa)"
        >
          {text.slice(0, 16).padEnd(16, ' ')}
        </text>
      )}

      {/* 4-Pin I2C Header at bottom left (GND 4, VCC 14, SDA 24, SCL 34 at y: 98) */}
      {[4, 14, 24, 34].map((px, i) => (
        <g key={i}>
          <rect x={px - 2.5} y="92" width="5" height="12" rx="1" fill="#18181b" stroke="#3f3f46" strokeWidth="0.8" />
          <circle cx={px} cy="98" r="1.8" fill="#ca8a04" />
        </g>
      ))}
      <text x="4" y="90" fill="#ffffff" fontSize="4.5" fontWeight="800">I2C</text>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DC Motor (75 × 75 px)
// ─────────────────────────────────────────────────────────────────────────────
const DCMotorRenderer: React.FC<{ isSelected: boolean; isRunning: boolean }> = ({ isSelected, isRunning }) => {
  return (
    <svg width="75" height="75" viewBox="0 0 75 75"
      style={{ overflow: 'visible', filter: isSelected ? 'drop-shadow(0 0 14px rgba(56,189,248,0.8))' : 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}>
      <defs>
        <radialGradient id="motorBody" cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="40%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#334155" />
        </radialGradient>
      </defs>
      {/* Motor cylindrical body */}
      <ellipse cx="37" cy="37" rx="34" ry="34" fill="url(#motorBody)" stroke={isSelected ? '#38bdf8' : '#475569'} strokeWidth="2" />
      {/* Motor shaft */}
      <rect x="34" y="0" width="8" height="20" rx="4" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
      {/* Vent slots */}
      {[25, 35, 45, 55].map((y) => (
        <rect key={y} x="18" y={y} width="40" height="2.5" rx="1" fill="#64748b" opacity="0.5" />
      ))}
      {/* Center label */}
      <circle cx="37" cy="37" rx="16" ry="16" r="16" fill="#1e293b" stroke="#334155" strokeWidth="1" />
      <text x="37" y="41" fill="#e2e8f0" fontSize="7" fontWeight="900" textAnchor="middle" fontFamily="monospace">DC</text>
      {/* Rotation animation when running */}
      {isRunning && <circle cx="37" cy="37" r="28" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="8 4" opacity="0.5"><animateTransform attributeName="transform" type="rotate" from="0 37 37" to="360 37 37" dur="0.4s" repeatCount="indefinite" /></circle>}
      {/* Terminals */}
      <rect x="22" y="60" width="8" height="14" rx="2" fill="#dc2626" stroke="#991b1b" strokeWidth="0.8" />
      <text x="26" y="71" fill="#fff" fontSize="5" fontWeight="900" textAnchor="middle">+</text>
      <rect x="45" y="60" width="8" height="14" rx="2" fill="#1e293b" stroke="#000" strokeWidth="0.8" />
      <text x="49" y="71" fill="#fff" fontSize="5" fontWeight="900" textAnchor="middle">−</text>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DC Motor with Encoder (75 × 85 px)
// ─────────────────────────────────────────────────────────────────────────────
const DCMotorEncoderRenderer: React.FC<{ isSelected: boolean; isRunning: boolean }> = ({ isSelected, isRunning }) => {
  return (
    <svg width="75" height="85" viewBox="0 0 75 85"
      style={{ overflow: 'visible', filter: isSelected ? 'drop-shadow(0 0 14px rgba(56,189,248,0.8))' : 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}>
      {/* Motor body (reuse DCMotor look) */}
      <ellipse cx="37" cy="37" rx="33" ry="33" fill="#94a3b8" stroke={isSelected ? '#38bdf8' : '#475569'} strokeWidth="2" />
      <ellipse cx="37" cy="37" rx="22" ry="22" fill="#334155" />
      <ellipse cx="37" cy="37" rx="15" ry="15" fill="#1e293b" stroke="#475569" strokeWidth="1" />
      <text x="37" y="41" fill="#e2e8f0" fontSize="6" fontWeight="900" textAnchor="middle" fontFamily="monospace">DC+ENC</text>
      {/* Shaft */}
      <rect x="34" y="0" width="6" height="18" rx="3" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
      {/* Encoder disc on back */}
      <ellipse cx="37" cy="69" rx="18" ry="8" fill="#0f172a" stroke="#334155" strokeWidth="1" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        return <line key={angle} x1={37 + 10 * Math.cos(rad)} y1={69 + 5 * Math.sin(rad)} x2={37 + 16 * Math.cos(rad)} y2={69 + 7.5 * Math.sin(rad)} stroke="#64748b" strokeWidth="1.5" />;
      })}
      {isRunning && <ellipse cx="37" cy="69" rx="18" ry="8" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.5"><animate attributeName="opacity" values="0.5;0.1;0.5" dur="0.3s" repeatCount="indefinite" /></ellipse>}
      {/* Terminals */}
      {[15, 26, 37, 48, 59].map((x, i) => (
        <g key={i}>
          <rect x={x - 4} y="76" width="8" height="9" rx="1.5" fill="#18181b" stroke="#3f3f46" strokeWidth="0.7" />
          <circle cx={x} cy="78" r="1.5" fill="#facc15" />
        </g>
      ))}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Hobby Gear Motor TT (80 × 110 px)
// ─────────────────────────────────────────────────────────────────────────────
const GearMotorRenderer: React.FC<{ isSelected: boolean; isRunning: boolean }> = ({ isSelected, isRunning }) => {
  return (
    <svg width="80" height="110" viewBox="0 0 80 110"
      style={{ overflow: 'visible', filter: isSelected ? 'drop-shadow(0 0 14px rgba(56,189,248,0.8))' : 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}>
      <defs>
        <linearGradient id="gearMotorBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      {/* Yellow body rectangle */}
      <rect x="4" y="10" width="72" height="70" rx="8" fill="url(#gearMotorBody)" stroke={isSelected ? '#38bdf8' : '#b45309'} strokeWidth="2" />
      {/* Gearbox details */}
      <rect x="14" y="18" width="52" height="54" rx="4" fill="#b45309" opacity="0.4" />
      {/* Gear icon */}
      <circle cx="40" cy="45" r="18" fill="#92400e" stroke="#f59e0b" strokeWidth="2" />
      <circle cx="40" cy="45" r="10" fill="#78350f" stroke="#fbbf24" strokeWidth="1.5" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const r = (a * Math.PI) / 180;
        return <rect key={a} x={40 + 14 * Math.cos(r) - 3} y={45 + 14 * Math.sin(r) - 3} width="6" height="6" rx="1" fill="#f59e0b" transform={`rotate(${a}, ${40 + 14 * Math.cos(r)}, ${45 + 14 * Math.sin(r)})`} />;
      })}
      {isRunning && <circle cx="40" cy="45" r="18" fill="none" stroke="#fef08a" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.6"><animateTransform attributeName="transform" type="rotate" from="0 40 45" to="360 40 45" dur="0.5s" repeatCount="indefinite" /></circle>}
      {/* Dual shaft */}
      <rect x="34" y="0" width="12" height="16" rx="4" fill="#94a3b8" stroke="#475569" strokeWidth="1.2" />
      <rect x="34" y="84" width="12" height="16" rx="4" fill="#94a3b8" stroke="#475569" strokeWidth="1.2" />
      {/* Terminals */}
      <rect x="22" y="95" width="10" height="13" rx="2" fill="#dc2626" stroke="#991b1b" strokeWidth="0.8" />
      <text x="27" y="105" fill="#fff" fontSize="6" fontWeight="900" textAnchor="middle">+</text>
      <rect x="46" y="95" width="10" height="13" rx="2" fill="#1e293b" stroke="#000" strokeWidth="0.8" />
      <text x="51" y="105" fill="#fff" fontSize="6" fontWeight="900" textAnchor="middle">−</text>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DIP Switch 4-pole (70 × 55 px)
// ─────────────────────────────────────────────────────────────────────────────
const DIPSwitch4Renderer: React.FC<{ isSelected: boolean }> = ({ isSelected }) => {
  const positions = [14, 26, 38, 50];
  return (
    <svg width="70" height="55" viewBox="0 0 70 55"
      style={{ overflow: 'visible', filter: isSelected ? 'drop-shadow(0 0 12px rgba(56,189,248,0.8))' : 'drop-shadow(0 3px 8px rgba(0,0,0,0.4))' }}>
      {/* Blue housing */}
      <rect x="4" y="4" width="62" height="40" rx="4" fill="#1d4ed8" stroke={isSelected ? '#38bdf8' : '#1e3a8a'} strokeWidth="1.8" />
      {/* ON label */}
      <text x="8" y="14" fill="#ffffff" fontSize="5.5" fontWeight="900" fontFamily="monospace">ON</text>
      {/* Switch slides */}
      {positions.map((x, i) => (
        <g key={i}>
          <rect x={x - 4} y="14" width="8" height="22" rx="2" fill="#0f172a" stroke="#3f3f46" strokeWidth="0.8" />
          <rect x={x - 3} y="15" width="6" height="10" rx="1.5" fill="#e2e8f0" />
          <text x={x} y="44" fill="#93c5fd" fontSize="5" fontWeight="800" textAnchor="middle">{i + 1}</text>
        </g>
      ))}
      {/* Bottom pins */}
      {positions.map((x, i) => (
        <g key={`pin-${i}`}>
          <rect x={x - 1.5} y="44" width="3" height="10" rx="1" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.5" />
        </g>
      ))}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DIP Switch 6-pole (95 × 55 px)
// ─────────────────────────────────────────────────────────────────────────────
const DIPSwitch6Renderer: React.FC<{ isSelected: boolean }> = ({ isSelected }) => {
  const positions = [14, 26, 38, 50, 62, 74];
  return (
    <svg width="95" height="55" viewBox="0 0 95 55"
      style={{ overflow: 'visible', filter: isSelected ? 'drop-shadow(0 0 12px rgba(56,189,248,0.8))' : 'drop-shadow(0 3px 8px rgba(0,0,0,0.4))' }}>
      {/* Red housing */}
      <rect x="4" y="4" width="87" height="40" rx="4" fill="#dc2626" stroke={isSelected ? '#38bdf8' : '#991b1b'} strokeWidth="1.8" />
      <text x="8" y="14" fill="#ffffff" fontSize="5.5" fontWeight="900" fontFamily="monospace">ON</text>
      {positions.map((x, i) => (
        <g key={i}>
          <rect x={x - 4} y="14" width="8" height="22" rx="2" fill="#0f172a" stroke="#3f3f46" strokeWidth="0.8" />
          <rect x={x - 3} y="25" width="6" height="10" rx="1.5" fill="#e2e8f0" />
          <text x={x} y="44" fill="#fca5a5" fontSize="5" fontWeight="800" textAnchor="middle">{i + 1}</text>
        </g>
      ))}
      {positions.map((x, i) => (
        <rect key={`pin-${i}`} x={x - 1.5} y="44" width="3" height="10" rx="1" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.5" />
      ))}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Flex Sensor (35 × 120 px)
// ─────────────────────────────────────────────────────────────────────────────
const FlexSensorRenderer: React.FC<{ isSelected: boolean }> = ({ isSelected }) => {
  return (
    <svg width="35" height="120" viewBox="0 0 35 120"
      style={{ overflow: 'visible', filter: isSelected ? 'drop-shadow(0 0 12px rgba(56,189,248,0.8))' : 'drop-shadow(0 3px 8px rgba(0,0,0,0.4))' }}>
      {/* Flex strip body */}
      <rect x="10" y="4" width="15" height="100" rx="4" fill="#fef3c7" stroke={isSelected ? '#38bdf8' : '#d97706'} strokeWidth="1.5" />
      {/* Resistive ink lines */}
      {[12, 20, 28, 36, 44, 52, 60, 68, 76, 84].map((y) => (
        <rect key={y} x="12" y={y} width="11" height="1.5" rx="0.5" fill="#78350f" opacity="0.7" />
      ))}
      <text x="17.5" y="8" fill="#92400e" fontSize="4.5" fontWeight="900" textAnchor="middle" fontFamily="monospace">FLEX</text>
      {/* Terminal ends */}
      <rect x="11" y="108" width="5" height="10" rx="1" fill="#94a3b8" stroke="#64748b" strokeWidth="0.8" />
      <rect x="19" y="108" width="5" height="10" rx="1" fill="#94a3b8" stroke="#64748b" strokeWidth="0.8" />
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Force Sensor FSR402 (48 × 110 px)
// ─────────────────────────────────────────────────────────────────────────────
const ForceSensorRenderer: React.FC<{ isSelected: boolean }> = ({ isSelected }) => {
  return (
    <svg width="48" height="110" viewBox="0 0 48 110"
      style={{ overflow: 'visible', filter: isSelected ? 'drop-shadow(0 0 12px rgba(56,189,248,0.8))' : 'drop-shadow(0 3px 8px rgba(0,0,0,0.4))' }}>
      {/* Sensing disc */}
      <circle cx="24" cy="28" r="22" fill="#fef9c3" stroke={isSelected ? '#38bdf8' : '#ca8a04'} strokeWidth="1.5" />
      <circle cx="24" cy="28" r="18" fill="#fef08a" stroke="#eab308" strokeWidth="0.8" />
      <circle cx="24" cy="28" r="12" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
      <text x="24" y="32" fill="#78350f" fontSize="6" fontWeight="900" textAnchor="middle" fontFamily="monospace">FSR</text>
      {/* Tail strip */}
      <rect x="20" y="50" width="8" height="55" rx="3" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
      {[54, 62, 70, 78].map((y) => (
        <rect key={y} x="22" y={y} width="4" height="1" rx="0.3" fill="#78350f" opacity="0.6" />
      ))}
      {/* Terminals */}
      <rect x="16" y="100" width="5" height="10" rx="1" fill="#94a3b8" stroke="#64748b" strokeWidth="0.8" />
      <rect x="27" y="100" width="5" height="10" rx="1" fill="#94a3b8" stroke="#64748b" strokeWidth="0.8" />
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Inductor Axial Molded 100µH (70 × 26 px - Authentic 3D Cylindrical Aesthetic)
// ─────────────────────────────────────────────────────────────────────────────
const InductorRenderer: React.FC<{ isSelected: boolean }> = ({ isSelected }) => {
  return (
    <svg
      width="70"
      height="26"
      viewBox="0 0 70 26"
      style={{
        overflow: 'visible',
        filter: isSelected
          ? 'drop-shadow(0 0 12px rgba(56,189,248,0.85)) drop-shadow(0 2px 6px rgba(0,0,0,0.5))'
          : 'drop-shadow(0 3px 8px rgba(0,0,0,0.45)) drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
      }}
    >
      <defs>
        {/* Shiny Silver Wire Lead Gradient */}
        <linearGradient id="indLeadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="35%" stopColor="#e2e8f0" />
          <stop offset="70%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        {/* 3D Cylindrical Molded Body Gradient (Authentic Cyan-Teal Epoxy) */}
        <linearGradient id="indBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="25%" stopColor="#0ea5e9" />
          <stop offset="55%" stopColor="#0284c7" />
          <stop offset="85%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#082f49" />
        </linearGradient>

        {/* Specular Highlight along cylinder length */}
        <linearGradient id="indGlossGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      {/* Realistic Metallic Wire Leads */}
      <rect x="0" y="11.2" width="18" height="3.6" rx="1.8" fill="url(#indLeadGrad)" stroke="#475569" strokeWidth="0.5" />
      <rect x="52" y="11.2" width="18" height="3.6" rx="1.8" fill="url(#indLeadGrad)" stroke="#475569" strokeWidth="0.5" />

      {/* Pin Contact Terminals */}
      <circle cx="4" cy="13" r="2.2" fill="#f8fafc" stroke="#64748b" strokeWidth="0.6" />
      <circle cx="66" cy="13" r="2.2" fill="#f8fafc" stroke="#64748b" strokeWidth="0.6" />

      {/* Left End Bulge Cap */}
      <rect x="15" y="3.5" width="7" height="19" rx="3.5" fill="url(#indBodyGrad)" stroke={isSelected ? '#38bdf8' : '#0369a1'} strokeWidth="0.8" />

      {/* Right End Bulge Cap */}
      <rect x="48" y="3.5" width="7" height="19" rx="3.5" fill="url(#indBodyGrad)" stroke={isSelected ? '#38bdf8' : '#0369a1'} strokeWidth="0.8" />

      {/* Main Molded Cylindrical Body */}
      <rect x="18" y="4.5" width="34" height="17" rx="2" fill="url(#indBodyGrad)" stroke={isSelected ? '#38bdf8' : '#0369a1'} strokeWidth="0.8" />

      {/* 4-Band EIA Color Code (100 µH ±10%): Brown, Black, Brown, Silver */}
      {/* Band 1: 1 (Brown) */}
      <rect x="23" y="4.5" width="3.2" height="17" rx="0.5" fill="#78350f" stroke="#451a03" strokeWidth="0.3" />
      {/* Band 2: 0 (Black) */}
      <rect x="28.5" y="4.5" width="3.2" height="17" rx="0.5" fill="#18181b" stroke="#09090b" strokeWidth="0.3" />
      {/* Band 3: ×10 (Brown Multiplier = 100 µH) */}
      <rect x="34" y="4.5" width="3.2" height="17" rx="0.5" fill="#78350f" stroke="#451a03" strokeWidth="0.3" />
      {/* Band 4: ±10% (Silver Tolerance) */}
      <rect x="42.5" y="4.5" width="3.2" height="17" rx="0.5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.3" />

      {/* 3D Cylindrical Specular Gloss Overlay */}
      <rect x="16" y="4.5" width="38" height="6.5" rx="1.5" fill="url(#indGlossGrad)" opacity="0.75" />

      {/* Laser-etched Subtext below body */}
      <text x="35" y="25" fill="#94a3b8" fontSize="4.5" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="0.5">100µH</text>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Light Bulb (55 × 75 px)
// ─────────────────────────────────────────────────────────────────────────────
const LightBulbRenderer: React.FC<{ isSelected: boolean; isRunning: boolean; isOn: boolean }> = ({ isSelected, isOn }) => {
  return (
    <svg width="55" height="75" viewBox="0 0 55 75"
      style={{ overflow: 'visible', filter: isSelected ? 'drop-shadow(0 0 14px rgba(56,189,248,0.8))' : isOn ? 'drop-shadow(0 0 18px rgba(253,224,71,0.9))' : 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))' }}>
      <defs>
        <radialGradient id="bulbGlass" cx="38%" cy="30%" r="65%">
          <stop offset="0%" stopColor={isOn ? '#fef9c3' : '#e2e8f0'} />
          <stop offset="60%" stopColor={isOn ? '#fde047' : '#94a3b8'} />
          <stop offset="100%" stopColor={isOn ? '#f59e0b' : '#475569'} />
        </radialGradient>
      </defs>
      {/* Glass bulb shape */}
      <path d="M 27.5 55 C 6 55 6 28 27.5 12 C 49 28 49 55 27.5 55 Z" fill="url(#bulbGlass)" stroke={isSelected ? '#38bdf8' : '#64748b'} strokeWidth="1.5" />
      {/* Filament */}
      <path d="M 20 44 L 24 38 L 28 44 L 32 38 L 35 44" fill="none" stroke={isOn ? '#f97316' : '#64748b'} strokeWidth="1.5" strokeLinecap="round" />
      {isOn && <path d="M 20 44 L 24 38 L 28 44 L 32 38 L 35 44" fill="none" stroke="#fef08a" strokeWidth="0.8" strokeLinecap="round" opacity="0.8" />}
      {/* Base screw cap */}
      <rect x="17" y="53" width="21" height="8" rx="1" fill="#64748b" stroke="#475569" strokeWidth="1" />
      {[57, 61, 64].map((y) => (
        <rect key={y} x="17" y={y} width="21" height="2" rx="0.5" fill="#475569" />
      ))}
      {/* Leads */}
      <rect x="18" y="66" width="5" height="9" rx="1" fill="#94a3b8" />
      <rect x="32" y="66" width="5" height="9" rx="1" fill="#94a3b8" />
      {/* Glow */}
      {isOn && <ellipse cx="27.5" cy="33" rx="22" ry="20" fill="rgba(253,224,71,0.25)" />}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Soil Moisture Sensor (55 × 120 px)
// ─────────────────────────────────────────────────────────────────────────────
const SoilMoistureRenderer: React.FC<{ isSelected: boolean; isRunning: boolean }> = ({ isSelected, isRunning }) => {
  return (
    <svg width="55" height="120" viewBox="0 0 55 120"
      style={{ overflow: 'visible', filter: isSelected ? 'drop-shadow(0 0 14px rgba(56,189,248,0.8))' : 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))' }}>
      {/* PCB Header area */}
      <rect x="2" y="2" width="51" height="35" rx="4" fill="#15803d" stroke={isSelected ? '#38bdf8' : '#14532d'} strokeWidth="1.5" />
      <text x="27" y="22" fill="#ffffff" fontSize="5.5" fontWeight="900" textAnchor="middle" fontFamily="monospace">SOIL</text>
      <text x="27" y="30" fill="#86efac" fontSize="4.5" fontWeight="700" textAnchor="middle">MOISTURE</text>
      {/* Status LED */}
      <circle cx="44" cy="10" r="3" fill={isRunning ? '#22c55e' : '#166534'} />
      {/* 3-pin header */}
      {[16, 27.5, 39].map((x, i) => (
        <g key={i}>
          <rect x={x - 3.5} y="2" width="7" height="8" rx="1" fill="#18181b" stroke="#3f3f46" strokeWidth="0.8" />
          <circle cx={x} cy="6" r="1.8" fill="#facc15" />
        </g>
      ))}
      {/* Dual electrode prongs */}
      <rect x="14" y="37" width="10" height="78" rx="3" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.2" />
      <rect x="31" y="37" width="10" height="78" rx="3" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.2" />
      {/* Electrode tip */}
      <path d="M 14 110 L 19 120 L 24 110 Z" fill="#94a3b8" />
      <path d="M 31 110 L 36 120 L 41 110 Z" fill="#94a3b8" />
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// IR Obstacle Avoidance Sensor Module (Exact Match to User Photo)
// Dimension: 180 × 64 px, Pins: VCC (180, 18), GND (180, 30), OUT (180, 42)
// ─────────────────────────────────────────────────────────────────────────────
const IRSensorRenderer: React.FC<{ isSelected: boolean; isRunning: boolean }> = ({ isSelected, isRunning }) => {
  return (
    <svg
      width="180"
      height="64"
      viewBox="0 0 180 64"
      style={{
        overflow: 'visible',
        filter: isSelected
          ? 'drop-shadow(0 0 14px rgba(56,189,248,0.85)) drop-shadow(0 4px 10px rgba(0,0,0,0.45))'
          : 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))',
      }}
    >
      <defs>
        {/* Deep Royal Blue PCB Gradient matching user photo */}
        <linearGradient id="irBluePcb" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="40%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>

        {/* Black Glossy Photodiode Gradient */}
        <linearGradient id="irBlackLed" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3f3f46" />
          <stop offset="25%" stopColor="#18181b" />
          <stop offset="80%" stopColor="#09090b" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>

        {/* Clear Translucent Emitter LED Gradient */}
        <linearGradient id="irClearLed" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="35%" stopColor="#e2e8f0" stopOpacity="0.75" />
          <stop offset="70%" stopColor="#cbd5e1" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.8" />
        </linearGradient>

        {/* Shiny Silver Pin Gradient */}
        <linearGradient id="irSilverPin" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#e2e8f0" />
          <stop offset="70%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>

        {/* Blue Trimpot Gradient */}
        <linearGradient id="irTrimpotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>

      {/* 1. FRONT SENSOR LEADS & BULBS (Left Side) */}
      {/* Top Sensor: Black IR Photodiode Receiver */}
      <g>
        {/* Silver Terminal Wire Leads extending to PCB */}
        <line x1="22" y1="16" x2="48" y2="16" stroke="#cbd5e1" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="22" y1="24" x2="48" y2="24" stroke="#cbd5e1" strokeWidth="1.8" strokeLinecap="round" />
        {/* Solder Joints on PCB Edge */}
        <rect x="46" y="14" width="4" height="4" rx="1" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.5" />
        <rect x="46" y="22" width="4" height="4" rx="1" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.5" />

        {/* Black Glossy 5mm Domed Epoxy Bulb */}
        <rect x="18" y="13" width="4" height="14" rx="1" fill="#18181b" stroke="#09090b" strokeWidth="0.5" />
        <path d="M 18 14 C 4 14 4 26 18 26 Z" fill="url(#irBlackLed)" stroke="#09090b" strokeWidth="0.8" />
        {/* Specular Highlight on Black Bulb */}
        <path d="M 17 16 C 8 16 8 20 12 20" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      </g>

      {/* Bottom Sensor: Clear / Translucent IR Transmitter LED */}
      <g>
        {/* Silver Terminal Wire Leads extending to PCB */}
        <line x1="22" y1="40" x2="48" y2="40" stroke="#cbd5e1" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="22" y1="48" x2="48" y2="48" stroke="#cbd5e1" strokeWidth="1.8" strokeLinecap="round" />
        {/* Solder Joints on PCB Edge */}
        <rect x="46" y="38" width="4" height="4" rx="1" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.5" />
        <rect x="46" y="46" width="4" height="4" rx="1" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.5" />

        {/* Clear 5mm Domed Epoxy Bulb with Internal Lead Frame */}
        <rect x="18" y="37" width="4" height="14" rx="1" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.5" />
        <path d="M 18 38 C 4 38 4 50 18 50 Z" fill="url(#irClearLed)" stroke="#94a3b8" strokeWidth="0.8" />
        {/* Internal Metallic Lead Frame (Anvil & Post) */}
        <path d="M 17 44 L 12 42 L 12 46 L 17 48 Z" fill="#64748b" opacity="0.75" />
        <line x1="17" y1="41" x2="12" y2="42" stroke="#fbbf24" strokeWidth="0.6" />
        {/* Specular Highlight on Clear Bulb */}
        <path d="M 17 40 C 8 40 8 44 12 44" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
        {/* Subtle Infrared Purple Beam Glow when running */}
        {isRunning && (
          <circle cx="10" cy="44" r="8" fill="rgba(168,85,247,0.25)">
            <animate attributeName="r" values="6;10;6" dur="1s" repeatCount="indefinite" />
          </circle>
        )}
      </g>

      {/* 2. MAIN BLUE PCB BOARD */}
      <rect x="46" y="8" width="110" height="48" rx="2.5" fill="#172554" transform="translate(0, 1.5)" />
      <rect x="46" y="8" width="110" height="48" rx="2.5" fill="url(#irBluePcb)" stroke="#1d4ed8" strokeWidth="1" />

      {/* SMD Components: Column 1 - Ceramic Capacitors (0805 Brown) */}
      {[13, 22, 31, 40].map((y) => (
        <g key={`cap-${y}`}>
          <rect x="52" y={y} width="9" height="5" rx="0.6" fill="#78350f" stroke="#451a03" strokeWidth="0.4" />
          <rect x="52" y={y} width="2" height="5" rx="0.4" fill="#cbd5e1" />
          <rect x="59" y={y} width="2" height="5" rx="0.4" fill="#cbd5e1" />
        </g>
      ))}

      {/* SMD Components: Column 2 - Resistors (0805 Black with 103 markings) */}
      {[13, 22, 31, 40].map((y) => (
        <g key={`res-${y}`}>
          <rect x="63" y={y} width="9" height="5" rx="0.6" fill="#18181b" stroke="#09090b" strokeWidth="0.4" />
          <rect x="63" y={y} width="2" height="5" rx="0.4" fill="#cbd5e1" />
          <rect x="70" y={y} width="2" height="5" rx="0.4" fill="#cbd5e1" />
        </g>
      ))}

      {/* 3. BLUE 3296 MULTITURN POTENTIOMETER (Upper-Middle) */}
      <g>
        <rect x="75" y="11" width="22" height="19" rx="1.5" fill="url(#irTrimpotGrad)" stroke="#1d4ed8" strokeWidth="0.8" />
        {/* Brass / Silver Adjustment Screw */}
        <circle cx="86" cy="20.5" r="5.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.6" />
        <circle cx="86" cy="20.5" r="3.5" fill="#e2e8f0" />
        {/* Crosshead Slot */}
        <line x1="83.5" y1="20.5" x2="88.5" y2="20.5" stroke="#334155" strokeWidth="0.9" strokeLinecap="round" />
        <line x1="86" y1="18" x2="86" y2="23" stroke="#334155" strokeWidth="0.9" strokeLinecap="round" />
        {/* Scale tick markings */}
        <text x="78" y="16" fill="#bfdbfe" fontSize="3.5" fontWeight="900" fontFamily="sans-serif">+</text>
        <text x="92" y="16" fill="#bfdbfe" fontSize="3.5" fontWeight="900" fontFamily="sans-serif">-</text>
      </g>

      {/* 4. LM393 DUAL COMPARATOR IC (Lower-Middle) */}
      <g>
        <rect x="76" y="34" width="20" height="16" rx="1" fill="#18181b" stroke="#09090b" strokeWidth="0.8" />
        <circle cx="79" cy="37" r="0.8" fill="#71717a" />
        <text x="86" y="44" fill="#e2e8f0" fontSize="4.5" fontWeight="900" fontFamily="JetBrains Mono, monospace" textAnchor="middle">LM393</text>
        {/* 8 Silver IC Gull-wing Pins */}
        {[79, 83.5, 88, 92.5].map((x) => (
          <React.Fragment key={`ic-pin-${x}`}>
            <rect x={x - 1} y="32" width="2" height="2.5" rx="0.3" fill="#cbd5e1" />
            <rect x={x - 1} y="49.5" width="2" height="2.5" rx="0.3" fill="#cbd5e1" />
          </React.Fragment>
        ))}
      </g>

      {/* Extra SMD Parts near IC */}
      <rect x="100" y="15" width="8" height="4.5" rx="0.5" fill="#18181b" stroke="#09090b" strokeWidth="0.4" />
      <rect x="100" y="36" width="8" height="4.5" rx="0.5" fill="#18181b" stroke="#09090b" strokeWidth="0.4" />

      {/* 5. DUAL SMD INDICATOR LEDS */}
      {/* Power Indicator LED (Top) */}
      <g>
        <rect x="104" y="12" width="9" height="5.5" rx="0.8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.6" />
        <circle cx="108.5" cy="14.75" r="1.8" fill={isRunning ? '#22c55e' : '#14532d'} />
        {isRunning && <circle cx="108.5" cy="14.75" r="3.5" fill="#22c55e" opacity="0.6" />}
        <text x="117" y="16.5" fill="#ffffff" fontSize="4.5" fontWeight="900" fontFamily="sans-serif">电源</text>
      </g>

      {/* Output Switch Indicator LED (Bottom) */}
      <g>
        <rect x="111" y="41" width="9" height="5.5" rx="0.8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.6" />
        <circle cx="115.5" cy="43.75" r="1.8" fill={isRunning ? '#ef4444' : '#7f1d1d'} />
        <text x="123" y="45.5" fill="#ffffff" fontSize="4.5" fontWeight="900" fontFamily="sans-serif">开关</text>
      </g>

      {/* 6. UNPLATED CIRCULAR MOUNTING HOLE */}
      <circle cx="112" cy="28" r="4.5" fill="#0f172a" stroke="#cbd5e1" strokeWidth="0.8" />
      <circle cx="112" cy="28" r="3.2" fill="#020617" />

      {/* 7. SILKSCREEN PIN LABELS (Matching User Photo) */}
      <g fill="#ffffff" fontSize="4.8" fontWeight="800" fontFamily="JetBrains Mono, monospace">
        <text x="135" y="20" textAnchor="end">VCC</text>
        <text x="135" y="32" textAnchor="end">GND</text>
        <text x="135" y="44" textAnchor="end">OUT</text>
      </g>

      {/* 8. 3-PIN RIGHT-ANGLE MALE HEADER (Far Right) */}
      <g>
        {/* Black Plastic Shroud Box */}
        <rect x="145" y="11" width="10" height="42" rx="1.5" fill="#18181b" stroke="#09090b" strokeWidth="1" />
        {/* 3 Square Pin Cavities */}
        <rect x="147.5" y="14.5" width="5" height="7" rx="0.5" fill="#09090b" />
        <rect x="147.5" y="26.5" width="5" height="7" rx="0.5" fill="#09090b" />
        <rect x="147.5" y="38.5" width="5" height="7" rx="0.5" fill="#09090b" />

        {/* 3 Silver Protruding Terminal Pins (x: 150..180) */}
        <rect x="150" y="16.5" width="30" height="3" rx="0.6" fill="url(#irSilverPin)" stroke="#475569" strokeWidth="0.4" />
        <rect x="150" y="28.5" width="30" height="3" rx="0.6" fill="url(#irSilverPin)" stroke="#475569" strokeWidth="0.4" />
        <rect x="150" y="40.5" width="30" height="3" rx="0.6" fill="url(#irSilverPin)" stroke="#475569" strokeWidth="0.4" />
      </g>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// LM35 Precision Analog Temperature Sensor — TO-92 Package (50 × 85 px)
// Exact 1:1 hardware match to user reference photo (N42KRD / LM35 / DZ)
// ─────────────────────────────────────────────────────────────────────────────
const LM35Renderer: React.FC<{ isSelected: boolean }> = ({ isSelected }) => {
  return (
    <svg
      width="50"
      height="85"
      viewBox="0 0 50 85"
      style={{
        overflow: 'visible',
        filter: isSelected
          ? 'drop-shadow(0 0 14px rgba(56,189,248,0.85)) drop-shadow(0 4px 10px rgba(0,0,0,0.5))'
          : 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))',
      }}
    >
      <defs>
        {/* TO-92 Epoxy Molded Body Gradient */}
        <linearGradient id="to92BodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3f3f46" />
          <stop offset="35%" stopColor="#27272a" />
          <stop offset="100%" stopColor="#18181b" />
        </linearGradient>

        {/* TO-92 Flat Front Face Sheen */}
        <linearGradient id="to92FlatFace" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3b3b42" />
          <stop offset="20%" stopColor="#27272a" />
          <stop offset="80%" stopColor="#18181b" />
          <stop offset="100%" stopColor="#09090b" />
        </linearGradient>

        {/* Tinned Lead Metallic Silver */}
        <linearGradient id="to92LeadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="40%" stopColor="#cbd5e1" />
          <stop offset="85%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>

      {/* 1. TO-92 Back Semi-Cylindrical Rounded Dome Body */}
      <path
        d="M 9 16 C 9 3 41 3 41 16 L 41 36 C 41 41 37 44 25 44 C 13 44 9 41 9 36 Z"
        fill="url(#to92BodyGrad)"
        stroke={isSelected ? '#38bdf8' : '#3f3f46'}
        strokeWidth="1.2"
      />

      {/* 2. TO-92 Flat Front Face */}
      <path
        d="M 9.5 14.5 L 40.5 14.5 Q 42.5 14.5 42.5 16.5 L 42.5 37.5 Q 42.5 40.5 40.5 40.5 L 9.5 40.5 Q 7.5 40.5 7.5 37.5 L 7.5 16.5 Q 7.5 14.5 9.5 14.5 Z"
        fill="url(#to92FlatFace)"
        stroke="#52525b"
        strokeWidth="0.8"
      />

      {/* Top Bevel Highlight Rim */}
      <line x1="11" y1="15.5" x2="39" y2="15.5" stroke="#71717a" strokeWidth="0.8" opacity="0.7" />

      {/* 3. Laser Etched Markings (Exact Match to User Photo) */}
      <text x="25" y="22" fill="#a1a1aa" fontSize="4" fontWeight="700" fontFamily="monospace" textAnchor="middle" letterSpacing="0.4">N42KRD</text>
      <text x="25" y="30" fill="#ffffff" fontSize="7.5" fontWeight="950" fontFamily="monospace" textAnchor="middle" letterSpacing="0.8">LM35</text>
      <text x="25" y="37" fill="#d4d4d8" fontSize="4.8" fontWeight="800" fontFamily="monospace" textAnchor="middle" letterSpacing="0.5">DZ</text>

      {/* 4. Lead Entry Shoulders at Bottom */}
      {[14, 25, 36].map((x) => (
        <polygon key={x} points={`${x - 2.2},40 ${x + 2.2},40 ${x + 1.4},44 ${x - 1.4},44`} fill="#27272a" stroke="#3f3f46" strokeWidth="0.4" />
      ))}

      {/* 5. Three Tinned Metallic Leads */}
      {[14, 25, 36].map((x) => (
        <rect key={x} x={x - 1.2} y="44" width="2.4" height="30" rx="0.5" fill="url(#to92LeadGrad)" stroke="#475569" strokeWidth="0.4" />
      ))}

      {/* 6. Green Solder Connection Rings at Terminal Ends */}
      {[14, 25, 36].map((x) => (
        <circle key={x} cx={x} cy="74" r="2.8" fill="#22c55e" stroke="#16a34a" strokeWidth="0.8" />
      ))}

      {/* 7. Pin Terminal Labels */}
      <text x="14" y="83" fill="#cbd5e1" fontSize="4.5" fontWeight="900" fontFamily="monospace" textAnchor="middle">VCC</text>
      <text x="25" y="83" fill="#38bdf8" fontSize="4.5" fontWeight="900" fontFamily="monospace" textAnchor="middle">OUT</text>
      <text x="36" y="83" fill="#cbd5e1" fontSize="4.5" fontWeight="900" fontFamily="monospace" textAnchor="middle">GND</text>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Parallax PING))) Ultrasonic Sensor (155 × 85 px)
// ─────────────────────────────────────────────────────────────────────────────
const UltrasonicPingRenderer: React.FC<{ isSelected: boolean; isRunning: boolean; distance: number }> = ({ isSelected, isRunning, distance }) => {
  return (
    <svg width="155" height="85" viewBox="0 0 155 85"
      style={{ overflow: 'visible', filter: isSelected ? 'drop-shadow(0 0 14px rgba(56,189,248,0.8))' : 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))' }}>
      <defs>
        <radialGradient id="pingCan" cx="38%" cy="35%" r="62%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="70%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </radialGradient>
      </defs>
      {/* PCB */}
      <rect x="0" y="10" width="155" height="62" rx="6" fill="#1d4ed8" stroke={isSelected ? '#38bdf8' : '#1e3a8a'} strokeWidth="1.8" />
      <text x="77" y="24" fill="#ffffff" fontSize="7" fontWeight="900" textAnchor="middle">PARALLAX PING)))</text>
      {/* Two transducers */}
      {[38, 117].map((cx, i) => (
        <g key={i}>
          <circle cx={cx} cy="50" r="22" fill="url(#pingCan)" stroke="#475569" strokeWidth="1.5" />
          <circle cx={cx} cy="50" r="16" fill="#1e293b" />
          <circle cx={cx} cy="50" r="10" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="3 2" />
          <circle cx={cx} cy="50" r="5" fill="#64748b" />
          {isRunning && <circle cx={cx} cy="50" r="22" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6"><animateTransform attributeName="transform" type="rotate" from={`0 ${cx} 50`} to={`360 ${cx} 50`} dur="1s" repeatCount="indefinite" /></circle>}
        </g>
      ))}
      {/* Distance badge */}
      {isRunning && (
        <g>
          <rect x="56" y="28" width="43" height="14" rx="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
          <text x="77" y="38" fill="#38bdf8" fontSize="7" fontWeight="900" fontFamily="monospace" textAnchor="middle">{Math.round(distance)} cm</text>
        </g>
      )}
      {/* 3 pins at bottom */}
      {[67, 77.5, 88].map((x, i) => (
        <g key={i}>
          <rect x={x - 2.5} y="72" width="5" height="13" rx="1.2" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.8" />
          <circle cx={x} cy="78" r="2" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.6" />
        </g>
      ))}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DHT11 Horizontal 3-Pin PCB Breakout Module (Exact Match to User Reference Photo)
// Dimension: 120 × 60 px, Pins on Left: VCC (3, 16), OUT (3, 30), GND (3, 44)
// ─────────────────────────────────────────────────────────────────────────────
const DHT11Renderer: React.FC<{ isSelected: boolean }> = ({ isSelected }) => {
  return (
    <svg
      width="120"
      height="60"
      viewBox="0 0 120 60"
      style={{
        overflow: 'visible',
        filter: isSelected
          ? 'drop-shadow(0 0 14px rgba(56,189,248,0.85)) drop-shadow(0 4px 10px rgba(0,0,0,0.5))'
          : 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))',
      }}
    >
      <defs>
        {/* PCB Matte Black Surface */}
        <linearGradient id="dht11HoriPcb" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e1e1e" />
          <stop offset="50%" stopColor="#121212" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </linearGradient>

        {/* Cyan Sensor Casing */}
        <linearGradient id="dht11HoriCyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="40%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>

        {/* Solder Pad Silver Metallic */}
        <radialGradient id="dht11HoriSolder" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#cbd5e1" />
          <stop offset="85%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#334155" />
        </radialGradient>

        {/* Male Pins Gold/Silver */}
        <linearGradient id="dht11HoriPinGold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a16207" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>
      </defs>

      {/* 1. Male Connection Pins extending out to the LEFT */}
      {[16, 30, 44].map((y, i) => (
        <g key={i}>
          <rect x="0" y={y - 1.2} width="16" height="2.4" rx="0.5" fill="url(#dht11HoriPinGold)" stroke="#854d0e" strokeWidth="0.4" />
          <circle cx="3" cy={y} r="1.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.4" />
        </g>
      ))}

      {/* 2. Plastic Header Socket Block on Left Edge */}
      <rect x="15" y="8" width="9" height="44" rx="1.5" fill="#171717" stroke="#333333" strokeWidth="0.8" />
      {[16, 30, 44].map((y) => (
        <rect key={y} x="16.5" y={y - 2} width="6" height="4" rx="0.5" fill="#0a0a0a" stroke="#404040" strokeWidth="0.4" />
      ))}

      {/* 3. Main Black FR4 PCB Breakout Board */}
      <rect x="22" y="2" width="96" height="56" rx="4" fill="url(#dht11HoriPcb)" stroke="#333333" strokeWidth="1" />
      <rect x="24.5" y="4.5" width="91" height="51" rx="2.5" fill="none" stroke="#ffffff" strokeWidth="0.6" opacity="0.85" />

      {/* 4. Crisp White Silkscreen Terminal Labels next to pins */}
      <text x="27" y="19" fill="#ffffff" fontSize="6.5" fontWeight="900" fontFamily="monospace" textAnchor="start">VCC</text>
      <text x="27" y="33" fill="#ffffff" fontSize="6.5" fontWeight="900" fontFamily="monospace" textAnchor="start">OUT</text>
      <text x="27" y="47" fill="#ffffff" fontSize="6.5" fontWeight="900" fontFamily="monospace" textAnchor="start">GND</text>

      {/* 5. Center Metallic Circular Mounting Hole */}
      <circle cx="49" cy="30" r="5" fill="#0a0a0a" stroke="#cbd5e1" strokeWidth="1.2" />
      <circle cx="49" cy="30" r="3.5" fill="#050505" />

      {/* 6. Four Soldered Connection Pads (Linking Casing to PCB) */}
      {[13, 24, 36, 47].map((y, i) => (
        <g key={i}>
          <circle cx="61" cy={y} r="2.6" fill="url(#dht11HoriSolder)" stroke="#1e293b" strokeWidth="0.5" />
          <circle cx="61" cy={y} r="0.9" fill="#0f172a" />
        </g>
      ))}

      {/* 7. Right Mounted Cyan DHT11 Grid Sensor Unit */}
      <rect x="66" y="7" width="48" height="46" rx="3.5" fill="url(#dht11HoriCyan)" stroke="#075985" strokeWidth="1.2" />

      {/* 4x4 Matrix Grid of Square Ventilation Slots */}
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2, 3].map((col) => {
          const x = 70.5 + col * 10.2;
          const y = 11 + row * 9.5;
          return (
            <g key={`${row}-${col}`}>
              <rect x={x} y={y} width="7" height="6.8" rx="1.2" fill="#0c4a6e" stroke="#0369a1" strokeWidth="0.6" />
              <rect x={x + 0.8} y={y + 0.8} width="5.4" height="5.2" rx="0.8" fill="#042f2e" opacity="0.9" />
            </g>
          );
        })
      )}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 5V Relay Module 1-CH (Photorealistic Hardware)
// Dimension: 150 × 85 px
// ─────────────────────────────────────────────────────────────────────────────
const Relay5VRenderer: React.FC<{ isSelected: boolean; isRunning: boolean; active: boolean }> = ({ isSelected, isRunning, active }) => {
  return (
    <svg
      width="150"
      height="85"
      viewBox="0 0 150 85"
      style={{
        overflow: 'visible',
        filter: isSelected
          ? 'drop-shadow(0 0 16px rgba(56,189,248,0.85)) drop-shadow(0 6px 14px rgba(0,0,0,0.45))'
          : 'drop-shadow(0 6px 14px rgba(0,0,0,0.45))',
      }}
    >
      <defs>
        {/* Red FR-4 Soldermask PCB */}
        <linearGradient id="relayRedPcb" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="40%" stopColor="#dc2626" />
          <stop offset="85%" stopColor="#b91c1c" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </linearGradient>

        {/* 3D Songle Blue Relay Cube */}
        <linearGradient id="songleCubeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="30%" stopColor="#0284c7" />
          <stop offset="80%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#075985" />
        </linearGradient>

        {/* Screw Terminal Block Blue Gradient */}
        <linearGradient id="terminalBlockGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="50%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#075985" />
        </linearGradient>
      </defs>

      {/* Main Crimson Red PCB Board */}
      <rect x="15" y="16" width="130" height="62" rx="4" fill="url(#relayRedPcb)" stroke="#b91c1c" strokeWidth="1.2" />

      {/* 4 Corner Brass Mounting Holes */}
      {[
        { cx: 20, cy: 21 },
        { cx: 140, cy: 21 },
        { cx: 20, cy: 73 },
        { cx: 140, cy: 73 },
      ].map((c, i) => (
        <g key={i}>
          <circle cx={c.cx} cy={c.cy} r="3.5" fill="#ca8a04" stroke="#eab308" strokeWidth="0.5" />
          <circle cx={c.cx} cy={c.cy} r="2.2" fill="#0f172a" />
        </g>
      ))}

      {/* Power LED (PWR) & Trigger LED (NO/NC) SMD Packages */}
      {/* Power LED */}
      <rect x="18" y="26" width="7" height="4" rx="0.5" fill="#18181b" stroke="#09090b" strokeWidth="0.4" />
      <circle cx="21.5" cy="28" r="1.5" fill={isRunning ? '#22c55e' : '#14532d'} />
      <text x="27" y="29.5" fill="#ffffff" fontSize="4.5" fontWeight="900" fontFamily="sans-serif">PWR</text>

      {/* Relay Trigger LED (LED1) */}
      <rect x="18" y="66" width="7" height="4" rx="0.5" fill="#18181b" stroke="#09090b" strokeWidth="0.4" />
      <circle cx="21.5" cy="68" r="1.5" fill={active && isRunning ? '#ef4444' : '#450a0a'} />
      <text x="27" y="69.5" fill="#ffffff" fontSize="4.5" fontWeight="900" fontFamily="sans-serif">IN1</text>

      {/* Optocoupler IC (EL817 4-Pin SMD) */}
      <rect x="36" y="42" width="14" height="10" rx="1" fill="#18181b" stroke="#27272a" strokeWidth="0.6" />
      <circle cx="38" cy="44" r="0.8" fill="#71717a" />
      <text x="43" y="48.5" fill="#e2e8f0" fontSize="3.5" fontWeight="900" fontFamily="monospace" textAnchor="middle">817</text>

      {/* 3-Pin Input Male Header Block on Left (VCC, GND, IN) */}
      <rect x="20" y="34" width="8" height="30" rx="1" fill="#18181b" stroke="#09090b" strokeWidth="0.8" />
      {/* 3 Silver Pins Sticking Out Left */}
      <rect x="0" y="37.5" width="22" height="2.5" rx="0.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.4" />
      <rect x="0" y="46.5" width="22" height="2.5" rx="0.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.4" />
      <rect x="0" y="55.5" width="22" height="2.5" rx="0.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.4" />
      <text x="30" y="40" fill="#ffffff" fontSize="4.5" fontWeight="900" fontFamily="monospace">VCC</text>
      <text x="30" y="49" fill="#ffffff" fontSize="4.5" fontWeight="900" fontFamily="monospace">GND</text>
      <text x="30" y="58" fill="#ffffff" fontSize="4.5" fontWeight="900" fontFamily="monospace">IN</text>

      {/* PHOTOREALISTIC SONGLE BLUE RELAY CUBE */}
      <rect x="58" y="24" width="58" height="46" rx="2.5" fill="url(#songleCubeGrad)" stroke="#0284c7" strokeWidth="1" />
      {/* Top Edge Glare */}
      <line x1="60" y1="25" x2="114" y2="25" stroke="#ffffff" strokeWidth="0.8" opacity="0.4" />

      {/* Songle Printing */}
      <text x="87" y="36" fill="#ffffff" fontSize="7.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.5">
        SONGLE
      </text>
      <text x="87" y="43" fill="#e0f2fe" fontSize="4.5" fontWeight="800" fontFamily="monospace" textAnchor="middle">
        SRD-05VDC-SL-C
      </text>
      <text x="87" y="50" fill="#bae6fd" fontSize="3.8" fontWeight="700" fontFamily="sans-serif" textAnchor="middle">
        10A 250VAC  10A 30VDC
      </text>

      {/* REALISTIC 3-SCREW BLUE TERMINAL BLOCK ON RIGHT */}
      <rect x="120" y="28" width="16" height="38" rx="2" fill="url(#terminalBlockGrad)" stroke="#0284c7" strokeWidth="1" />
      {/* 3 Circular Metal Screws */}
      {[34, 47, 60].map((cy, i) => (
        <g key={i}>
          <circle cx="128" cy={cy} r="4" fill="#cbd5e1" stroke="#475569" strokeWidth="0.8" />
          <circle cx="128" cy={cy} r="2.8" fill="#e2e8f0" />
          {/* Crosshead Screw Slot */}
          <line x1="125.5" y1={cy} x2="130.5" y2={cy} stroke="#334155" strokeWidth="0.8" />
          <line x1="128" y1={cy - 2.5} x2="128" y2={cy + 2.5} stroke="#334155" strokeWidth="0.8" />
        </g>
      ))}

      {/* Silkscreen Terminal Labels: NO COM NC */}
      <text x="142" y="36" fill="#ffffff" fontSize="4.5" fontWeight="900" fontFamily="monospace">NO</text>
      <text x="142" y="49" fill="#ffffff" fontSize="4.5" fontWeight="900" fontFamily="monospace">COM</text>
      <text x="142" y="62" fill="#ffffff" fontSize="4.5" fontWeight="900" fontFamily="monospace">NC</text>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 5V Dual Relay Module 2-CH (200 × 110 px)
// ─────────────────────────────────────────────────────────────────────────────
const Relay5V2ChRenderer: React.FC<{ isSelected: boolean; isRunning: boolean; ch1Active: boolean; ch2Active: boolean }> = ({ isSelected, ch1Active, ch2Active }) => {
  return (
    <svg width="200" height="110" viewBox="0 0 200 110"
      style={{ overflow: 'visible', filter: isSelected ? 'drop-shadow(0 0 14px rgba(56,189,248,0.8))' : 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))' }}>
      <rect x="2" y="2" width="196" height="106" rx="8" fill="#0b1120" stroke={isSelected ? '#38bdf8' : '#334155'} strokeWidth="1.5" />
      <text x="100" y="24" fill="#38bdf8" fontSize="8" fontWeight="900" textAnchor="middle">2-CHANNEL 5V RELAY MODULE</text>

      {/* Channel 1 Cube */}
      <rect x="18" y="32" width="76" height="52" rx="3" fill={ch1Active ? '#2563eb' : '#1d4ed8'} stroke="#3b82f6" strokeWidth="1.2" />
      <text x="56" y="52" fill="#ffffff" fontSize="8.5" fontWeight="900" textAnchor="middle">SONGLE</text>
      <text x="56" y="63" fill="#93c5fd" fontSize="6" fontWeight="700" textAnchor="middle">CH1 (10A 250V)</text>

      {/* Channel 2 Cube */}
      <rect x="106" y="32" width="76" height="52" rx="3" fill={ch2Active ? '#2563eb' : '#1d4ed8'} stroke="#3b82f6" strokeWidth="1.2" />
      <text x="144" y="52" fill="#ffffff" fontSize="8.5" fontWeight="900" textAnchor="middle">SONGLE</text>
      <text x="144" y="63" fill="#93c5fd" fontSize="6" fontWeight="700" textAnchor="middle">CH2 (10A 250V)</text>

      {/* Screw Terminals */}
      <rect x="10" y="4" width="86" height="14" rx="2" fill="#15803d" stroke="#14532d" strokeWidth="1" />
      <circle cx="24" cy="10" r="4" fill="#94a3b8" />
      <circle cx="54" cy="10" r="4" fill="#94a3b8" />
      <circle cx="84" cy="10" r="4" fill="#94a3b8" />

      <rect x="104" y="4" width="86" height="14" rx="2" fill="#15803d" stroke="#14532d" strokeWidth="1" />
      <circle cx="116" cy="10" r="4" fill="#94a3b8" />
      <circle cx="146" cy="10" r="4" fill="#94a3b8" />
      <circle cx="176" cy="10" r="4" fill="#94a3b8" />

      {/* Bottom Pins */}
      <rect x="25" y="93" width="150" height="14" rx="2" fill="#18181b" stroke="#27272a" strokeWidth="1" />
      <circle cx="40" cy="100" r="2.5" fill="#facc15" />
      <circle cx="80" cy="100" r="2.5" fill="#facc15" />
      <circle cx="120" cy="100" r="2.5" fill="#facc15" />
      <circle cx="160" cy="100" r="2.5" fill="#facc15" />
      <text x="40" y="90" fill="#94a3b8" fontSize="5" fontWeight="700" textAnchor="middle">VCC</text>
      <text x="80" y="90" fill="#94a3b8" fontSize="5" fontWeight="700" textAnchor="middle">IN1</text>
      <text x="120" y="90" fill="#94a3b8" fontSize="5" fontWeight="700" textAnchor="middle">IN2</text>
      <text x="160" y="90" fill="#94a3b8" fontSize="5" fontWeight="700" textAnchor="middle">GND</text>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ULN2003A Stepper Driver Module (160 × 100 px)
// ─────────────────────────────────────────────────────────────────────────────
const ULN2003Renderer: React.FC<{
  isSelected: boolean;
  isRunning: boolean;
  ledA?: boolean;
  ledB?: boolean;
  ledC?: boolean;
  ledD?: boolean;
}> = ({ isSelected, isRunning, ledA, ledB, ledC, ledD }) => {
  return (
    <svg
      width="160"
      height="100"
      viewBox="0 0 160 100"
      style={{
        overflow: 'visible',
        filter: isSelected
          ? 'drop-shadow(0 0 14px rgba(56,189,248,0.85)) drop-shadow(0 6px 14px rgba(0,0,0,0.45))'
          : 'drop-shadow(0 6px 14px rgba(0,0,0,0.45))',
      }}
    >
      <defs>
        {/* PCB Gradient */}
        <linearGradient id="ulnPcbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="50%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#172554" />
        </linearGradient>

        {/* Silver Pin Lead Gradient */}
        <linearGradient id="ulnPinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="40%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>

        {/* LED Glow Filter */}
        <filter id="redGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Main Royal Blue PCB Board */}
      <rect x="2" y="2" width="156" height="96" rx="6" fill="url(#ulnPcbGrad)" stroke="#1d4ed8" strokeWidth="1.5" />

      {/* 4 Corner Gold Screws / Mounting Holes */}
      {[
        { cx: 8, cy: 8 },
        { cx: 152, cy: 8 },
        { cx: 8, cy: 92 },
        { cx: 152, cy: 92 },
      ].map((c, i) => (
        <g key={i}>
          <circle cx={c.cx} cy={c.cy} r="4" fill="#0f172a" stroke="#eab308" strokeWidth="0.8" />
          <circle cx={c.cx} cy={c.cy} r="2.5" fill="#020617" />
        </g>
      ))}

      {/* Board Title Silkscreen */}
      <text x="50" y="14" fill="#ffffff" fontSize="6.5" fontWeight="900" fontFamily="sans-serif">
        ULN2003
      </text>
      <text x="50" y="22" fill="#93c5fd" fontSize="4.5" fontWeight="800" fontFamily="sans-serif">
        STEPPER DRIVER
      </text>

      {/* Central ULN2003A DIP-16 IC Package & Socket */}
      <g transform="translate(42, 30)">
        {/* Socket Outline */}
        <rect x="0" y="0" width="38" height="46" rx="2" fill="#09090b" stroke="#27272a" strokeWidth="1" />
        {/* Semi-circle Index Notch at top */}
        <path d="M 15 0 A 4 4 0 0 0 23 0 Z" fill="#18181b" stroke="#27272a" strokeWidth="0.8" />

        {/* DIP-16 Silver Legs (Left & Right) */}
        {[5, 10, 15, 20, 25, 30, 35, 40].map((y, i) => (
          <React.Fragment key={i}>
            <rect x="-3" y={y - 1} width="3" height="2" rx="0.3" fill="url(#ulnPinGrad)" />
            <rect x="38" y={y - 1} width="3" height="2" rx="0.3" fill="url(#ulnPinGrad)" />
          </React.Fragment>
        ))}

        {/* IC Body */}
        <rect x="2" y="2" width="34" height="42" rx="1.5" fill="#18181b" stroke="#334155" strokeWidth="0.8" />
        <circle cx="6" cy="6" r="1.2" fill="#64748b" />
        <text x="19" y="22" fill="#e2e8f0" fontSize="5.5" fontWeight="900" fontFamily="monospace" textAnchor="middle">
          ULN2003A
        </text>
        <text x="19" y="30" fill="#64748b" fontSize="3.8" fontWeight="700" fontFamily="monospace" textAnchor="middle">
          DIP-16
        </text>
      </g>

      {/* 4 Status SMD LEDs (A, B, C, D) with Labels */}
      {[
        { id: 'A', x: 14, y: 38, active: Boolean(isRunning && ledA) },
        { id: 'B', x: 28, y: 38, active: Boolean(isRunning && ledB) },
        { id: 'C', x: 14, y: 60, active: Boolean(isRunning && ledC) },
        { id: 'D', x: 28, y: 60, active: Boolean(isRunning && ledD) },
      ].map((led) => (
        <g key={led.id}>
          {/* LED Package */}
          <rect x={led.x - 4} y={led.y - 4} width="8" height="8" rx="1" fill="#18181b" stroke="#3f3f46" strokeWidth="0.6" />
          {/* LED Lens */}
          <circle
            cx={led.x}
            cy={led.y}
            r="2.8"
            fill={led.active ? '#ef4444' : '#450a0a'}
            stroke={led.active ? '#f87171' : '#7f1d1d'}
            strokeWidth="0.6"
            filter={led.active ? 'url(#redGlow)' : undefined}
          />
          {/* LED Label */}
          <text x={led.x} y={led.y + 9} fill="#ffffff" fontSize="4.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
            {led.id}
          </text>
        </g>
      ))}

      {/* On/Off Power Jumper Block (Right side) */}
      <g transform="translate(136, 42)">
        <rect x="0" y="0" width="16" height="26" rx="1.5" fill="#18181b" stroke="#000000" strokeWidth="0.8" />
        <circle cx="8" cy="7" r="1.8" fill="#facc15" />
        <circle cx="8" cy="19" r="1.8" fill="#facc15" />
        {/* Yellow Jumper Shroud */}
        <rect x="3" y="2" width="10" height="22" rx="1" fill="#eab308" stroke="#ca8a04" strokeWidth="0.6" />
        <text x="-4" y="15" fill="#bfdbfe" fontSize="4" fontWeight="800" fontFamily="monospace" textAnchor="end">ON/OFF</text>
      </g>

      {/* 5-Pin White JST-XH Stepper Motor Output Connector (Top Right) */}
      <g transform="translate(98, 4)">
        <rect x="0" y="0" width="56" height="18" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
        {[8, 18, 28, 38, 48].map((px, i) => (
          <circle key={i} cx={px} cy="8" r="2.2" fill="#09090b" stroke="#ca8a04" strokeWidth="0.8" />
        ))}
        <text x="28" y="16" fill="#334155" fontSize="4" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
          MOTOR (5-PIN)
        </text>
      </g>

      {/* 6-Pin Input & Power Header at Bottom (IN1, IN2, IN3, IN4, VCC, GND) */}
      <rect x="10" y="84" width="92" height="14" rx="1.5" fill="#18181b" stroke="#000000" strokeWidth="0.8" />
      {[
        { x: 18, lbl: 'IN1' },
        { x: 30, lbl: 'IN2' },
        { x: 42, lbl: 'IN3' },
        { x: 54, lbl: 'IN4' },
        { x: 74, lbl: 'VCC' },
        { x: 86, lbl: 'GND' },
      ].map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy="91" r="2.2" fill="#facc15" stroke="#ca8a04" strokeWidth="0.7" />
          <text x={p.x} y="82" fill="#ffffff" fontSize="4" fontWeight="900" fontFamily="monospace" textAnchor="middle">
            {p.lbl}
          </text>
        </g>
      ))}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DIP-8 IC Renderer (NE555 / LM741 Op-Amp)
// ─────────────────────────────────────────────────────────────────────────────
const DIP8ICRenderer: React.FC<{ isSelected: boolean; label: string; isActive?: boolean }> = ({ isSelected, label, isActive }) => (
  <svg
    width="80"
    height="60"
    viewBox="0 0 80 60"
    style={{
      overflow: 'visible',
      filter: isSelected
        ? 'drop-shadow(0 0 14px rgba(56, 189, 248, 0.8)) drop-shadow(0 4px 10px rgba(0,0,0,0.4))'
        : 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
    }}
  >
    {/* Metallic Pins (4 Top, 4 Bottom) */}
    {[10, 30, 50, 70].map((px, i) => (
      <g key={i}>
        <rect x={px - 2.5} y="0" width="5" height="7" fill="#cbd5e1" stroke="#475569" strokeWidth="0.8" rx="1" />
        <rect x={px - 2.5} y="53" width="5" height="7" fill="#cbd5e1" stroke="#475569" strokeWidth="0.8" rx="1" />
      </g>
    ))}

    {/* Black Plastic DIP-8 IC Body */}
    <rect x="2" y="6" width="76" height="48" rx="3" fill="#1e293b" stroke={isSelected ? '#38bdf8' : '#0f172a'} strokeWidth="1.5" />

    {/* Pin 1 Notch / Dot */}
    <path d="M 2 26 A 4 4 0 0 1 2 34 Z" fill="#0f172a" />
    <circle cx="10" cy="48" r="2" fill="#64748b" />

    {/* Silkscreen Part Label */}
    <text x="40" y="32" textAnchor="middle" dominantBaseline="middle" fill="#f8fafc" fontSize="11" fontWeight="800" fontFamily="monospace" letterSpacing="0.5">
      {label}
    </text>

    {/* Active Pulse LED indicator */}
    {isActive && <circle cx="70" cy="14" r="3" fill="#38bdf8" style={{ filter: 'drop-shadow(0 0 6px #38bdf8)' }} />}
  </svg>
);
