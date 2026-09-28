import { WiringGraph } from './WiringGraph';
import type { PlacedComponent, WireConnection } from '../types';

export class CircuitEvaluator {
  private graph: WiringGraph;

  constructor() {
    this.graph = new WiringGraph();
  }

  /** Initialize or update the graph with current placed components and wires */
  syncGraph(components: PlacedComponent[], wires: WireConnection[]) {
    this.graph = new WiringGraph();

    // 1. Add all wires as edges in the graph
    for (const w of wires) {
      this.graph.addWire({
        id: w.id,
        from: `${w.fromComponentId}:${w.fromPinId}`,
        to: `${w.toComponentId}:${w.toPinId}`,
      });
    }

    // 2. Set power and ground drivers for all power source pins
    for (const comp of components) {
      if (comp.type === 'arduino-uno' || comp.type === 'arduino-nano' || comp.type === 'arduino-mega' || comp.type === 'esp32-devkit' || comp.type === 'nodemcu-esp8266') {
        // MCU constant power/gnd pins
        this.graph.setPinDriver(`${comp.id}:5V`, true);
        this.graph.setPinDriver(`${comp.id}:5V_1`, true);
        this.graph.setPinDriver(`${comp.id}:5V_2`, true);
        this.graph.setPinDriver(`${comp.id}:3V3`, true);
        this.graph.setPinDriver(`${comp.id}:3.3V`, true);
        this.graph.setPinDriver(`${comp.id}:3V3_1`, true);
        this.graph.setPinDriver(`${comp.id}:3V3_2`, true);
        this.graph.setPinDriver(`${comp.id}:3V3_3`, true);
        this.graph.setPinDriver(`${comp.id}:VCC`, true);

        this.graph.setPinDriver(`${comp.id}:GND`, false);
        this.graph.setPinDriver(`${comp.id}:GND1`, false);
        this.graph.setPinDriver(`${comp.id}:GND2`, false);
        this.graph.setPinDriver(`${comp.id}:GND3`, false);
        this.graph.setPinDriver(`${comp.id}:GND4`, false);
        this.graph.setPinDriver(`${comp.id}:GND5`, false);
      }

      // Standalone DC Power Supplies (9V, 3V coin cell, AA packs)
      if (comp.type === 'battery-9v' || comp.type === 'coin-cell-3v' || comp.type === 'battery-4x-aa' || comp.type === 'battery-1.5v-aa') {
        this.graph.setPinDriver(`${comp.id}:+`, true);
        this.graph.setPinDriver(`${comp.id}:-`, false);
      }

      // MB102 Breadboard Power Supply Module
      if (comp.type === 'breadboard-power-supply') {
        const isPowered = comp.props?.powered !== false;
        if (isPowered) {
          this.graph.setPinDriver(`${comp.id}:VCC_TOP`, true);
          this.graph.setPinDriver(`${comp.id}:GND_TOP`, false);
          this.graph.setPinDriver(`${comp.id}:VCC_BOT`, true);
          this.graph.setPinDriver(`${comp.id}:GND_BOT`, false);
        }
      }

      // SPDT Slide Switch
      if (comp.type === 'slide-switch') {
        const isRight = comp.props?.state === 'right';
        this.graph.addWire({ id: `${comp.id}:sw_1`, from: `${comp.id}:COM`, to: `${comp.id}:1`, closed: !isRight, isSwitch: true });
        this.graph.addWire({ id: `${comp.id}:sw_2`, from: `${comp.id}:COM`, to: `${comp.id}:2`, closed: isRight, isSwitch: true });
      }

      // 1N4007 Diode (Anode -> Cathode conduction)
      if (comp.type === 'diode-1n4007') {
        this.graph.addWire({ id: `${comp.id}:diode_fwd`, from: `${comp.id}:A`, to: `${comp.id}:C` });
      }

      // Capacitors (DC charge / filtering path)
      if (comp.type === 'capacitor-electrolytic') {
        this.graph.addWire({ id: `${comp.id}:cap_internal`, from: `${comp.id}:+`, to: `${comp.id}:-` });
      }
      if (comp.type === 'capacitor-ceramic') {
        this.graph.addWire({ id: `${comp.id}:cap_internal`, from: `${comp.id}:1`, to: `${comp.id}:2` });
      }

      // Handle resistor internal connection (pin 1 <-> pin 2)
      if (comp.type === 'resistor') {
        this.graph.addWire({ id: `${comp.id}:internal`, from: `${comp.id}:1`, to: `${comp.id}:2` });
      }

      // Handle pushbutton internal contact state
      if (comp.type === 'pushbutton') {
        const isPressed = comp.props.pressed === true;
        this.graph.addWire({ id: `${comp.id}:internal1`, from: `${comp.id}:1a`, to: `${comp.id}:1b`, closed: isPressed, isSwitch: true });
        this.graph.addWire({ id: `${comp.id}:internal2`, from: `${comp.id}:2a`, to: `${comp.id}:2b`, closed: isPressed, isSwitch: true });
        this.graph.addWire({ id: `${comp.id}:internal3`, from: `${comp.id}:1a`, to: `${comp.id}:2a`, closed: isPressed, isSwitch: true });
        // When pressed, bridge the 4 terminals so current flows
        if (isPressed) {
          this.graph.addWire({ id: `${comp.id}:pressed_bridge`, from: `${comp.id}:1a`, to: `${comp.id}:2b` });
        }
      }

      // Handle 5V Relay Module internal contact switches (SPDT: COM-NO / COM-NC)
      if (comp.type === 'relay-5v') {
        const isEnergized = comp.props?.manualEnergize === true || comp.state?.active === true;
        this.graph.addWire({
          id: `${comp.id}:relay_com_no`,
          from: `${comp.id}:COM`,
          to: `${comp.id}:NO`,
          isSwitch: true,
          closed: isEnergized,
        });
        this.graph.addWire({
          id: `${comp.id}:relay_com_nc`,
          from: `${comp.id}:COM`,
          to: `${comp.id}:NC`,
          isSwitch: true,
          closed: !isEnergized,
        });
      }

      // Handle 2-Channel 5V Relay Module internal contact switches
      if (comp.type === 'relay-5v-2ch') {
        const isEnergized1 = comp.props?.manualEnergize1 === true || comp.state?.active1 === true;
        const isEnergized2 = comp.props?.manualEnergize2 === true || comp.state?.active2 === true;
        this.graph.addWire({
          id: `${comp.id}:relay1_com_no`,
          from: `${comp.id}:COM1`,
          to: `${comp.id}:NO1`,
          isSwitch: true,
          closed: isEnergized1,
        });
        this.graph.addWire({
          id: `${comp.id}:relay1_com_nc`,
          from: `${comp.id}:COM1`,
          to: `${comp.id}:NC1`,
          isSwitch: true,
          closed: !isEnergized1,
        });
        this.graph.addWire({
          id: `${comp.id}:relay2_com_no`,
          from: `${comp.id}:COM2`,
          to: `${comp.id}:NO2`,
          isSwitch: true,
          closed: isEnergized2,
        });
        this.graph.addWire({
          id: `${comp.id}:relay2_com_nc`,
          from: `${comp.id}:COM2`,
          to: `${comp.id}:NC2`,
          isSwitch: true,
          closed: !isEnergized2,
        });
      }

      // Handle breadboard tie points (series & parallel connections across columns and power rails)
      if (comp.type === 'breadboard-mini') {
        const topRows = ['a', 'b', 'c', 'd', 'e'];
        const botRows = ['f', 'g', 'h', 'i', 'j'];
        for (let col = 1; col <= 17; col++) {
          for (let i = 0; i < topRows.length - 1; i++) {
            this.graph.addWire({ id: `${comp.id}:top_${col}_${i}`, from: `${comp.id}:R${col}${topRows[i]}`, to: `${comp.id}:R${col}${topRows[i + 1]}` });
          }
          for (let i = 0; i < botRows.length - 1; i++) {
            this.graph.addWire({ id: `${comp.id}:bot_${col}_${i}`, from: `${comp.id}:R${col}${botRows[i]}`, to: `${comp.id}:R${col}${botRows[i + 1]}` });
          }
        }
      } else if (comp.type === 'breadboard-half') {
        const topRows = ['a', 'b', 'c', 'd', 'e'];
        const botRows = ['f', 'g', 'h', 'i', 'j'];
        for (let col = 1; col <= 30; col++) {
          for (let i = 0; i < topRows.length - 1; i++) {
            this.graph.addWire({ id: `${comp.id}:top_${col}_${i}`, from: `${comp.id}:R${col}${topRows[i]}`, to: `${comp.id}:R${col}${topRows[i + 1]}` });
          }
          for (let i = 0; i < botRows.length - 1; i++) {
            this.graph.addWire({ id: `${comp.id}:bot_${col}_${i}`, from: `${comp.id}:R${col}${botRows[i]}`, to: `${comp.id}:R${col}${botRows[i + 1]}` });
          }
          if (col < 30) {
            this.graph.addWire({ id: `${comp.id}:vcc_top_${col}`, from: `${comp.id}:vcc_top_${col}`, to: `${comp.id}:vcc_top_${col + 1}` });
            this.graph.addWire({ id: `${comp.id}:gnd_top_${col}`, from: `${comp.id}:gnd_top_${col}`, to: `${comp.id}:gnd_top_${col + 1}` });
            this.graph.addWire({ id: `${comp.id}:vcc_bot_${col}`, from: `${comp.id}:vcc_bot_${col}`, to: `${comp.id}:vcc_bot_${col + 1}` });
            this.graph.addWire({ id: `${comp.id}:gnd_bot_${col}`, from: `${comp.id}:gnd_bot_${col}`, to: `${comp.id}:gnd_bot_${col + 1}` });
          }
        }
      } else if (comp.type === 'breadboard-full') {
        const topRows = ['a', 'b', 'c', 'd', 'e'];
        const botRows = ['f', 'g', 'h', 'i', 'j'];
        for (let col = 1; col <= 63; col++) {
          for (let i = 0; i < topRows.length - 1; i++) {
            this.graph.addWire({ id: `${comp.id}:top_${col}_${i}`, from: `${comp.id}:R${col}${topRows[i]}`, to: `${comp.id}:R${col}${topRows[i + 1]}` });
          }
          for (let i = 0; i < botRows.length - 1; i++) {
            this.graph.addWire({ id: `${comp.id}:bot_${col}_${i}`, from: `${comp.id}:R${col}${botRows[i]}`, to: `${comp.id}:R${col}${botRows[i + 1]}` });
          }
          if (col < 63) {
            this.graph.addWire({ id: `${comp.id}:vcc_top_${col}`, from: `${comp.id}:vcc_top_${col}`, to: `${comp.id}:vcc_top_${col + 1}` });
            this.graph.addWire({ id: `${comp.id}:gnd_top_${col}`, from: `${comp.id}:gnd_top_${col}`, to: `${comp.id}:gnd_top_${col + 1}` });
            this.graph.addWire({ id: `${comp.id}:vcc_bot_${col}`, from: `${comp.id}:vcc_bot_${col}`, to: `${comp.id}:vcc_bot_${col + 1}` });
            this.graph.addWire({ id: `${comp.id}:gnd_bot_${col}`, from: `${comp.id}:gnd_bot_${col}`, to: `${comp.id}:gnd_bot_${col + 1}` });
          }
        }
      }
    }
  }

  /** Helper to resolve pin keys for both '13' and 'D13' */
  private getPinKeys(mcuComp: PlacedComponent, pinName: string): string[] {
    const keys = [`${mcuComp.id}:${pinName}`];
    if (/^\d+$/.test(pinName)) {
      keys.push(`${mcuComp.id}:D${pinName}`);
    } else if (pinName.startsWith('D') && /^\d+$/.test(pinName.slice(1))) {
      keys.push(`${mcuComp.id}:${pinName.slice(1)}`);
    }
    return keys;
  }

  /** Set weak pullup driver for MCU input pins with INPUT_PULLUP enabled */
  setPinPullup(comp: PlacedComponent, pinName: string, enabled: boolean) {
    for (const pinKey of this.getPinKeys(comp, pinName)) {
      if (enabled) {
        this.graph.setWeakDriver(pinKey, true);
      }
    }
  }

  /** Notify MCU output pin level change and update all connected components */
  handlePinOutputChange(
    mcuComp: PlacedComponent,
    pinName: string,
    isHigh: boolean,
    components: PlacedComponent[],
    updateState: (id: string, state: Record<string, any>) => void
  ) {
    for (const pinKey of this.getPinKeys(mcuComp, pinName)) {
      this.graph.setPinDriver(pinKey, isHigh);
    }

    const cleanPin = String(pinName).replace(/^D/i, '').trim();
    const isPin13 = cleanPin === '13';
    const isPin2 = cleanPin === '2';
    const isPinD4 = pinName.toUpperCase() === 'D4' || cleanPin === '4';

    const currentState = mcuComp.state || {};
    updateState(mcuComp.id, {
      ...currentState,
      [`pin_${pinName}`]: isHigh,
      [`pin_${cleanPin}`]: isHigh,
      pin13: isPin13 ? isHigh : (currentState.pin13 ?? false),
      led13: isPin13 ? isHigh : (currentState.led13 ?? false),
      pin2: isPin2 ? isHigh : (currentState.pin2 ?? false),
      led2: isPin2 ? isHigh : (currentState.led2 ?? false),
      pinD4: isPinD4 ? isHigh : (currentState.pinD4 ?? false),
      ledD4: isPinD4 ? isHigh : (currentState.ledD4 ?? false),
    });

    this.evaluateAllComponents(components, updateState);
  }

  /** Re-evaluate electrical levels for LEDs, Buzzers, Relays, Servos */
  evaluateAllComponents(
    components: PlacedComponent[],
    updateState: (id: string, state: Record<string, any>) => void
  ) {
    // Perform 2 passes to ensure relay contacts update and propagate to downstream loads (LEDs, Buzzers)
    for (let pass = 0; pass < 2; pass++) {
      for (const comp of components) {
        if (comp.type === 'led') {
          const anodeVal = this.graph.read(`${comp.id}:A`);
          const cathodeVal = this.graph.read(`${comp.id}:C`);
          const anodeDriven = this.graph.hasDriver(`${comp.id}:A`);
          const cathodeDriven = this.graph.hasDriver(`${comp.id}:C`);
          const isLit = anodeVal === true && anodeDriven && cathodeVal === false && cathodeDriven;

          // Check if connected to high-voltage direct power (e.g., 9V battery) without current-limiting resistor
          let is9VDirect = false;
          let seriesResistorValue: number | null = null;

          for (const otherComp of components) {
            if (otherComp.id === comp.id) continue;
            if (otherComp.type === 'battery-9v') {
              const connectedToAnode = this.graph.areConnected(`${comp.id}:A`, `${otherComp.id}:+`);
              const connectedToCathode = this.graph.areConnected(`${comp.id}:C`, `${otherComp.id}:-`);
              if (connectedToAnode && connectedToCathode) {
                is9VDirect = true;
              }
            } else if (otherComp.type === 'resistor') {
              const connectedToA = this.graph.areConnected(`${comp.id}:A`, `${otherComp.id}:1`) || this.graph.areConnected(`${comp.id}:A`, `${otherComp.id}:2`);
              const connectedToC = this.graph.areConnected(`${comp.id}:C`, `${otherComp.id}:1`) || this.graph.areConnected(`${comp.id}:C`, `${otherComp.id}:2`);
              if (connectedToA || connectedToC) {
                seriesResistorValue = otherComp.props?.resistance ?? 220;
              }
            }
          }

          // Direct 9V connection without resistor (R < 50Ω) causes instant LED burnout
          const isBurnedOut = is9VDirect && (!seriesResistorValue || seriesResistorValue < 50);

          let brightness = 1.0;
          if (isLit && seriesResistorValue !== null) {
            // Brightness scales inversely with resistance: 220Ω -> 1.0 (100%), 1kΩ -> 0.22 (22%), 10kΩ -> 0.02
            brightness = Math.min(1.0, Math.max(0.04, 220 / Math.max(1, seriesResistorValue)));
          }

          updateState(comp.id, {
            ledOn: isLit && !isBurnedOut,
            burnedOut: isBurnedOut || (comp.state?.burnedOut === true),
            brightness: isLit && !isBurnedOut ? brightness : 0,
          });
        } else if (comp.type === 'buzzer') {
          // Support all buzzer pin naming variants (+/-, POS/NEG, VCC/GND, 1/2, SIG/GND, IN/GND)
          const posVal =
            this.graph.read(`${comp.id}:+`) ??
            this.graph.read(`${comp.id}:POS`) ??
            this.graph.read(`${comp.id}:VCC`) ??
            this.graph.read(`${comp.id}:2`) ??
            this.graph.read(`${comp.id}:SIG`) ??
            this.graph.read(`${comp.id}:IN`);
          const negVal =
            this.graph.read(`${comp.id}:-`) ??
            this.graph.read(`${comp.id}:NEG`) ??
            this.graph.read(`${comp.id}:GND`) ??
            this.graph.read(`${comp.id}:1`);

          const posDriven =
            this.graph.hasDriver(`${comp.id}:+`) ||
            this.graph.hasDriver(`${comp.id}:POS`) ||
            this.graph.hasDriver(`${comp.id}:VCC`) ||
            this.graph.hasDriver(`${comp.id}:2`) ||
            this.graph.hasDriver(`${comp.id}:SIG`) ||
            this.graph.hasDriver(`${comp.id}:IN`);

          // Active if positive terminal is HIGH or active tone signal is playing
          const isBeeping = (posVal === true && posDriven && negVal !== true) || comp.state?.sounding === true || comp.state?.active === true;
          updateState(comp.id, { active: isBeeping, sounding: isBeeping, frequency: comp.state?.frequency || 2400 });
        } else if (comp.type === 'dc-motor') {
          const posVal = this.graph.read(`${comp.id}:+`) ?? this.graph.read(`${comp.id}:1`) ?? this.graph.read(`${comp.id}:VCC`);
          const negVal = this.graph.read(`${comp.id}:-`) ?? this.graph.read(`${comp.id}:2`) ?? this.graph.read(`${comp.id}:GND`);
          const posDriven = this.graph.hasDriver(`${comp.id}:+`) || this.graph.hasDriver(`${comp.id}:1`) || this.graph.hasDriver(`${comp.id}:VCC`);
          const isSpinning = posVal === true && posDriven && negVal !== true;
          updateState(comp.id, { active: isSpinning, spinning: isSpinning, speed: isSpinning ? 100 : 0 });
        } else if (comp.type === 'seven-segment') {
          const segA = this.graph.read(`${comp.id}:A`) || this.graph.read(`${comp.id}:a`);
          const segB = this.graph.read(`${comp.id}:B`) || this.graph.read(`${comp.id}:b`);
          const segC = this.graph.read(`${comp.id}:C`) || this.graph.read(`${comp.id}:c`);
          const segD = this.graph.read(`${comp.id}:D`) || this.graph.read(`${comp.id}:d`);
          const segE = this.graph.read(`${comp.id}:E`) || this.graph.read(`${comp.id}:e`);
          const segF = this.graph.read(`${comp.id}:F`) || this.graph.read(`${comp.id}:f`);
          const segG = this.graph.read(`${comp.id}:G`) || this.graph.read(`${comp.id}:g`);
          const segDP = this.graph.read(`${comp.id}:DP`) || this.graph.read(`${comp.id}:dp`);
          updateState(comp.id, { segA, segB, segC, segD, segE, segF, segG, segDP });
        } else if (comp.type === 'relay-5v') {
          const inVal = this.graph.read(`${comp.id}:IN`);
          const vccVal = this.graph.read(`${comp.id}:VCC`);
          const gndVal = this.graph.read(`${comp.id}:GND`);
          const inDriven = this.graph.hasDriver(`${comp.id}:IN`);
          const gndDriven = this.graph.hasDriver(`${comp.id}:GND`);
          const vccDriven = this.graph.hasDriver(`${comp.id}:VCC`);

          const isPowerOk = (!vccDriven || vccVal === true) && (!gndDriven || gndVal === false);
          const isTriggeredBySignal = comp.props?.activeLow
            ? inDriven && inVal === false
            : inDriven && inVal === true;
          const isActive = (isPowerOk && isTriggeredBySignal) || comp.props?.manualEnergize === true;

          updateState(comp.id, { active: isActive });
          this.graph.setSwitch(`${comp.id}:relay_com_no`, isActive);
          this.graph.setSwitch(`${comp.id}:relay_com_nc`, !isActive);
        } else if (comp.type === 'relay-5v-2ch') {
          const vccVal = this.graph.read(`${comp.id}:VCC`);
          const gndVal = this.graph.read(`${comp.id}:GND`);
          const gndDriven = this.graph.hasDriver(`${comp.id}:GND`);
          const vccDriven = this.graph.hasDriver(`${comp.id}:VCC`);
          const isPowerOk = (!vccDriven || vccVal === true) && (!gndDriven || gndVal === false);

          const in1Val = this.graph.read(`${comp.id}:IN1`);
          const in1Driven = this.graph.hasDriver(`${comp.id}:IN1`);
          const isActive1 = (isPowerOk && (comp.props?.activeLow ? (in1Driven && in1Val === false) : (in1Driven && in1Val === true))) || comp.props?.manualEnergize1 === true;

          const in2Val = this.graph.read(`${comp.id}:IN2`);
          const in2Driven = this.graph.hasDriver(`${comp.id}:IN2`);
          const isActive2 = (isPowerOk && (comp.props?.activeLow ? (in2Driven && in2Val === false) : (in2Driven && in2Val === true))) || comp.props?.manualEnergize2 === true;

          updateState(comp.id, { active1: isActive1, active2: isActive2, active: isActive1 || isActive2 });
          this.graph.setSwitch(`${comp.id}:relay1_com_no`, isActive1);
          this.graph.setSwitch(`${comp.id}:relay1_com_nc`, !isActive1);
          this.graph.setSwitch(`${comp.id}:relay2_com_no`, isActive2);
          this.graph.setSwitch(`${comp.id}:relay2_com_nc`, !isActive2);
        } else if (comp.type === 'servo') {
          const currentAngle = comp.state?.angle ?? comp.props?.angle ?? 90;
          updateState(comp.id, { angle: currentAngle });
        } else if (comp.type === 'stepper-motor') {
          const currentAngle = comp.state?.angle ?? comp.props?.angle ?? 0;
          const currentStep = comp.state?.step ?? comp.props?.step ?? 0;
          updateState(comp.id, { angle: currentAngle, step: currentStep });
        } else if (comp.type === 'ir-sensor') {
          const isObstacle = comp.props?.obstacleDetected === true || (comp.props?.distance !== undefined && comp.props.distance <= 10);
          // Standard FC-51 IR obstacle sensor module outputs LOW (0V) when obstacle is detected, HIGH (5V) when clear
          const outLevel = comp.props?.activeHigh ? isObstacle : !isObstacle;
          this.graph.setPinDriver(`${comp.id}:OUT`, outLevel);
          updateState(comp.id, { obstacleDetected: isObstacle, outLevel });
        } else if (comp.type === 'gas-sensor') {
          const threshold = comp.props?.threshold ?? 400;
          const currentPpm = comp.props?.gasPpm ?? comp.props?.ppm ?? 250;
          const isGasDetected = currentPpm >= threshold;
          const outLevel = comp.props?.activeLow ? !isGasDetected : isGasDetected;
          this.graph.setPinDriver(`${comp.id}:DOUT`, outLevel);
          this.graph.setPinDriver(`${comp.id}:D0`, outLevel);
          this.graph.setPinDriver(`${comp.id}:DO`, outLevel);
          updateState(comp.id, { gasDetected: isGasDetected, outLevel });
        } else if (comp.type === 'ldr-sensor') {
          const lightLevel = comp.props?.lightLevel ?? 500;
          const isDark = lightLevel < 500;
          const outLevel = comp.props?.activeLow ? !isDark : isDark;
          this.graph.setPinDriver(`${comp.id}:DO`, outLevel);
          this.graph.setPinDriver(`${comp.id}:DOUT`, outLevel);
          this.graph.setPinDriver(`${comp.id}:D0`, outLevel);
          this.graph.setPinDriver(`${comp.id}:3`, outLevel);
          updateState(comp.id, { isDark, outLevel });
        } else if (comp.type === 'uln2003a') {
          const in1 = this.readDigitalPin(comp, 'IN1');
          const in2 = this.readDigitalPin(comp, 'IN2');
          const in3 = this.readDigitalPin(comp, 'IN3');
          const in4 = this.readDigitalPin(comp, 'IN4');

          this.graph.setPinDriver(`${comp.id}:OUT1`, in1);
          this.graph.setPinDriver(`${comp.id}:OUT2`, in2);
          this.graph.setPinDriver(`${comp.id}:OUT3`, in3);
          this.graph.setPinDriver(`${comp.id}:OUT4`, in4);

          updateState(comp.id, {
            ledA: in1,
            ledB: in2,
            ledC: in3,
            ledD: in4,
            active: in1 || in2 || in3 || in4,
          });
        } else if (comp.type === 'ne555') {
          const now = Date.now();
          const isHigh = Math.floor(now / 500) % 2 === 0;
          this.graph.setPinDriver(`${comp.id}:OUT`, isHigh);
          this.graph.setPinDriver(`${comp.id}:3`, isHigh);
          updateState(comp.id, { active: isHigh, outLevel: isHigh });
        } else if (comp.type === 'opamp') {
          const isHigh = true;
          this.graph.setPinDriver(`${comp.id}:OUT`, isHigh);
          this.graph.setPinDriver(`${comp.id}:6`, isHigh);
          updateState(comp.id, { active: isHigh, outLevel: isHigh });
        }
      }
    }
  }

  /** Read digital pin input level */
  readDigitalPin(mcuComp: PlacedComponent, pinName: string): boolean {
    const keys = this.getPinKeys(mcuComp, pinName);
    for (const k of keys) {
      if (this.graph.read(k)) return true;
    }
    return false;
  }

  /** Read analog pin input value (0 - 1023) from connected sensors */
  readAnalogPin(mcuComp: PlacedComponent, pinName: string, components: PlacedComponent[], wires: WireConnection[]): number {
    // Build set of pin variants (e.g. '34', 'D34', 'A34', 'A0', '0')
    const pinVariants = new Set<string>([pinName]);
    const numMatch = pinName.match(/\d+/);
    if (numMatch) {
      const num = numMatch[0];
      pinVariants.add(num);
      pinVariants.add(`A${num}`);
      pinVariants.add(`D${num}`);
    }

    const mcuPinKeys: string[] = [];
    for (const v of pinVariants) {
      mcuPinKeys.push(`${mcuComp.id}:${v}`);
    }

    // Helper to check if any mcuPinKey is connected to a specific sensor pin key
    const isPinConnectedToSensor = (sensorCompId: string, sensorPinNames: string[]): boolean => {
      for (const mcuKey of mcuPinKeys) {
        for (const sPin of sensorPinNames) {
          const sensorKey = `${sensorCompId}:${sPin}`;
          // Check direct wire
          const directWire = wires.find(
            (w) =>
              (w.fromComponentId + ':' + w.fromPinId === mcuKey && w.toComponentId + ':' + w.toPinId === sensorKey) ||
              (w.fromComponentId + ':' + w.fromPinId === sensorKey && w.toComponentId + ':' + w.toPinId === mcuKey)
          );
          if (directWire) return true;
          // Check graph net connection (e.g. breadboard / jumper chains)
          if (this.graph.areConnected(mcuKey, sensorKey)) return true;
        }
      }
      return false;
    };

    // 1. First, search for any sensor component electrically connected to this pin
    for (const comp of components) {
      if (comp.id === mcuComp.id) continue;

      if (comp.type === 'gas-sensor') {
        if (isPinConnectedToSensor(comp.id, ['AOUT', 'AO', 'A0', 'OUT', '1'])) {
          return comp.props.gasPpm ?? comp.props.ppm ?? 250;
        }
      } else if (comp.type === 'potentiometer') {
        if (isPinConnectedToSensor(comp.id, ['SIG', 'WIPER', '2', 'OUT'])) {
          return Math.max(0, Math.min(1023, Math.round(comp.props.value ?? 512)));
        }
      } else if (comp.type === 'ldr-sensor') {
        if (isPinConnectedToSensor(comp.id, ['AO', 'AIN', 'AOUT', 'A0', 'OUT', 'DO', 'DOUT', '4', '3', '2', '1'])) {
          return comp.props.lightLevel ?? 500;
        }
      } else if (comp.type === 'lm35') {
        if (isPinConnectedToSensor(comp.id, ['OUT', 'VOUT', '2'])) {
          return Math.max(0, Math.min(1023, Math.round(((comp.props.temperature ?? 25) * 0.01 * 1023) / 5.0)));
        }
      } else if (comp.type === 'ultrasonic-hcsr04') {
        if (isPinConnectedToSensor(comp.id, ['ECHO', 'OUT'])) {
          return Math.min(1023, Math.round((comp.props.distance ?? 10) * 3.5));
        }
      } else if (comp.type === 'ir-sensor') {
        if (isPinConnectedToSensor(comp.id, ['OUT'])) {
          return Math.min(1023, Math.round(((comp.props.distance ?? 10) / 30) * 1023));
        }
      }
    }

    // 2. Direct Wire Check Fallback (if pin names differed or for direct legacy wires)
    const connectedWire = wires.find(
      (w) =>
        (w.fromComponentId === mcuComp.id && pinVariants.has(w.fromPinId)) ||
        (w.toComponentId === mcuComp.id && pinVariants.has(w.toPinId))
    );

    if (connectedWire) {
      const targetCompId =
        connectedWire.fromComponentId === mcuComp.id
          ? connectedWire.toComponentId
          : connectedWire.fromComponentId;
      const targetComp = components.find((c) => c.id === targetCompId);

      if (targetComp) {
        if (targetComp.type === 'gas-sensor') {
          return targetComp.props.gasPpm ?? targetComp.props.ppm ?? 250;
        }
        if (targetComp.type === 'potentiometer' && targetComp.props.value !== undefined) {
          return Math.max(0, Math.min(1023, Math.round(targetComp.props.value)));
        }
        if (targetComp.type === 'ldr-sensor' && targetComp.props.lightLevel !== undefined) {
          return targetComp.props.lightLevel;
        }
        if (targetComp.type === 'lm35' && targetComp.props.temperature !== undefined) {
          return Math.max(0, Math.min(1023, Math.round(((targetComp.props.temperature ?? 25) * 0.01 * 1023) / 5.0)));
        }
        if (targetComp.type === 'ultrasonic-hcsr04' && targetComp.props.distance !== undefined) {
          return Math.min(1023, Math.round(targetComp.props.distance * 3.5));
        }
        if (targetComp.type === 'ir-sensor' && targetComp.props.distance !== undefined) {
          return Math.min(1023, Math.round((targetComp.props.distance / 30) * 1023));
        }
      }
    }

    // 3. Global Fallback: search for any gas-sensor first (if gas-sensor exists), then potentiometer, lm35, etc.
    const gasComp = components.find((c) => c.type === 'gas-sensor');
    if (gasComp) {
      return gasComp.props.gasPpm ?? gasComp.props.ppm ?? 250;
    }

    const potComp = components.find((c) => c.type === 'potentiometer');
    if (potComp && potComp.props.value !== undefined) {
      return Math.max(0, Math.min(1023, Math.round(potComp.props.value)));
    }

    const lm35Comp = components.find((c) => c.type === 'lm35');
    if (lm35Comp && lm35Comp.props.temperature !== undefined) {
      return Math.max(0, Math.min(1023, Math.round(((lm35Comp.props.temperature ?? 25) * 0.01 * 1023) / 5.0)));
    }

    const irComp = components.find((c) => c.type === 'ir-sensor');
    if (irComp && irComp.props.distance !== undefined) {
      return Math.min(1023, Math.round((irComp.props.distance / 30) * 1023));
    }

    const ldrComp = components.find((c) => c.type === 'ldr-sensor');
    if (ldrComp && ldrComp.props.lightLevel !== undefined) return ldrComp.props.lightLevel;

    return 512;
  }
}
