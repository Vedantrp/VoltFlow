import { describe, it, expect, beforeEach } from 'vitest';
import { CircuitEvaluator } from '../CircuitEvaluator';
import type { PlacedComponent, WireConnection } from '../../types';

describe('CircuitEvaluator Integration', () => {
  let evaluator: CircuitEvaluator;

  beforeEach(() => {
    evaluator = new CircuitEvaluator();
  });

  it('evaluates LED state when connected to MCU output pin and GND', () => {
    const components: PlacedComponent[] = [
      { id: 'uno-1', type: 'arduino-uno', name: 'Arduino Uno', x: 0, y: 0, rotation: 0, props: {} },
      { id: 'led-1', type: 'led', name: 'LED', x: 200, y: 0, rotation: 0, props: {} },
    ];

    const wires: WireConnection[] = [
      { id: 'w1', fromComponentId: 'uno-1', fromPinId: '13', toComponentId: 'led-1', toPinId: 'A', color: 'red' },
      { id: 'w2', fromComponentId: 'led-1', fromPinId: 'C', toComponentId: 'uno-1', toPinId: 'GND1', color: 'black' },
    ];

    evaluator.syncGraph(components, wires);

    let stateUpdates: Record<string, Record<string, any>> = {};
    const updateState = (id: string, state: Record<string, any>) => {
      stateUpdates[id] = state;
    };

    // MCU drives Pin 13 HIGH
    evaluator.handlePinOutputChange(components[0], '13', true, components, updateState);
    expect(stateUpdates['led-1']?.ledOn).toBe(true);

    // MCU drives Pin 13 LOW
    evaluator.handlePinOutputChange(components[0], '13', false, components, updateState);
    expect(stateUpdates['led-1']?.ledOn).toBe(false);
  });

  it('evaluates LED state when connected through a 220 Ohm resistor', () => {
    const components: PlacedComponent[] = [
      { id: 'uno-1', type: 'arduino-uno', name: 'Arduino Uno', x: 0, y: 0, rotation: 0, props: {} },
      { id: 'res-1', type: 'resistor', name: 'Resistor', x: 100, y: 0, rotation: 0, props: {} },
      { id: 'led-1', type: 'led', name: 'LED', x: 200, y: 0, rotation: 0, props: {} },
    ];

    const wires: WireConnection[] = [
      { id: 'w1', fromComponentId: 'uno-1', fromPinId: '13', toComponentId: 'res-1', toPinId: '1', color: 'red' },
      { id: 'w2', fromComponentId: 'res-1', fromPinId: '2', toComponentId: 'led-1', toPinId: 'A', color: 'red' },
      { id: 'w3', fromComponentId: 'led-1', fromPinId: 'C', toComponentId: 'uno-1', toPinId: 'GND1', color: 'black' },
    ];

    evaluator.syncGraph(components, wires);

    let stateUpdates: Record<string, Record<string, any>> = {};
    const updateState = (id: string, state: Record<string, any>) => {
      stateUpdates[id] = state;
    };

    evaluator.handlePinOutputChange(components[0], '13', true, components, updateState);
    expect(stateUpdates['led-1']?.ledOn).toBe(true);
  });

  it('evaluates pin output change when MCU uses D13 pin alias', () => {
    const components: PlacedComponent[] = [
      { id: 'nano-1', type: 'arduino-nano', name: 'Arduino Nano', x: 0, y: 0, rotation: 0, props: {} },
      { id: 'led-1', type: 'led', name: 'LED', x: 200, y: 0, rotation: 0, props: {} },
    ];

    const wires: WireConnection[] = [
      { id: 'w1', fromComponentId: 'nano-1', fromPinId: 'D13', toComponentId: 'led-1', toPinId: 'A', color: 'red' },
      { id: 'w2', fromComponentId: 'led-1', fromPinId: 'C', toComponentId: 'nano-1', toPinId: 'GND1', color: 'black' },
    ];

    evaluator.syncGraph(components, wires);

    let stateUpdates: Record<string, Record<string, any>> = {};
    const updateState = (id: string, state: Record<string, any>) => {
      stateUpdates[id] = state;
    };

    evaluator.handlePinOutputChange(components[0], '13', true, components, updateState);
    expect(stateUpdates['led-1']?.ledOn).toBe(true);
  });

  it('evaluates 1-channel 5V Relay Module coil activation and load LED switching via COM and NO', () => {
    const components: PlacedComponent[] = [
      { id: 'uno-1', type: 'arduino-uno', name: 'Arduino Uno', x: 0, y: 0, rotation: 0, props: {} },
      { id: 'relay-1', type: 'relay-5v', name: '5V Relay Module', x: 200, y: 0, rotation: 0, props: {} },
      { id: 'led-1', type: 'led', name: 'Load LED', x: 400, y: 0, rotation: 0, props: {} },
    ];

    const wires: WireConnection[] = [
      // Relay Coil Control Connection
      { id: 'w1', fromComponentId: 'uno-1', fromPinId: '13', toComponentId: 'relay-1', toPinId: 'IN', color: 'blue' },
      { id: 'w2', fromComponentId: 'uno-1', fromPinId: '5V', toComponentId: 'relay-1', toPinId: 'VCC', color: 'red' },
      { id: 'w3', fromComponentId: 'uno-1', fromPinId: 'GND1', toComponentId: 'relay-1', toPinId: 'GND', color: 'black' },
      // High Power / Load Circuit (5V -> COM, NO -> LED Anode, LED Cathode -> GND)
      { id: 'w4', fromComponentId: 'uno-1', fromPinId: '5V', toComponentId: 'relay-1', toPinId: 'COM', color: 'red' },
      { id: 'w5', fromComponentId: 'relay-1', fromPinId: 'NO', toComponentId: 'led-1', toPinId: 'A', color: 'yellow' },
      { id: 'w6', fromComponentId: 'led-1', fromPinId: 'C', toComponentId: 'uno-1', toPinId: 'GND1', color: 'black' },
    ];

    evaluator.syncGraph(components, wires);

    let stateUpdates: Record<string, Record<string, any>> = {};
    const updateState = (id: string, state: Record<string, any>) => {
      stateUpdates[id] = { ...stateUpdates[id], ...state };
    };

    // When MCU D13 is HIGH, relay energizes -> COM connects to NO -> Load LED turns ON
    evaluator.handlePinOutputChange(components[0], '13', true, components, updateState);
    expect(stateUpdates['relay-1']?.active).toBe(true);
    expect(stateUpdates['led-1']?.ledOn).toBe(true);

    // When MCU D13 is LOW, relay de-energizes -> COM disconnects from NO -> Load LED turns OFF
    evaluator.handlePinOutputChange(components[0], '13', false, components, updateState);
    expect(stateUpdates['relay-1']?.active).toBe(false);
    expect(stateUpdates['led-1']?.ledOn).toBe(false);
  });

  it('evaluates 1-channel Relay NC contact powering load when coil is IDLE', () => {
    const components: PlacedComponent[] = [
      { id: 'uno-1', type: 'arduino-uno', name: 'Arduino Uno', x: 0, y: 0, rotation: 0, props: {} },
      { id: 'relay-1', type: 'relay-5v', name: '5V Relay Module', x: 200, y: 0, rotation: 0, props: {} },
      { id: 'led-nc', type: 'led', name: 'NC Load LED', x: 400, y: 0, rotation: 0, props: {} },
    ];

    const wires: WireConnection[] = [
      { id: 'w1', fromComponentId: 'uno-1', fromPinId: '13', toComponentId: 'relay-1', toPinId: 'IN', color: 'blue' },
      { id: 'w2', fromComponentId: 'uno-1', fromPinId: '5V', toComponentId: 'relay-1', toPinId: 'VCC', color: 'red' },
      { id: 'w3', fromComponentId: 'uno-1', fromPinId: 'GND1', toComponentId: 'relay-1', toPinId: 'GND', color: 'black' },
      { id: 'w4', fromComponentId: 'uno-1', fromPinId: '5V', toComponentId: 'relay-1', toPinId: 'COM', color: 'red' },
      { id: 'w5', fromComponentId: 'relay-1', fromPinId: 'NC', toComponentId: 'led-nc', toPinId: 'A', color: 'green' },
      { id: 'w6', fromComponentId: 'led-nc', fromPinId: 'C', toComponentId: 'uno-1', toPinId: 'GND1', color: 'black' },
    ];

    evaluator.syncGraph(components, wires);

    let stateUpdates: Record<string, Record<string, any>> = {};
    const updateState = (id: string, state: Record<string, any>) => {
      stateUpdates[id] = { ...stateUpdates[id], ...state };
    };

    // When MCU D13 is LOW, relay coil is IDLE -> COM connects to NC -> NC LED is ON
    evaluator.handlePinOutputChange(components[0], '13', false, components, updateState);
    expect(stateUpdates['relay-1']?.active).toBe(false);
    expect(stateUpdates['led-nc']?.ledOn).toBe(true);

    // When MCU D13 is HIGH, relay coil ENERGIZES -> COM disconnects from NC -> NC LED turns OFF
    evaluator.handlePinOutputChange(components[0], '13', true, components, updateState);
    expect(stateUpdates['relay-1']?.active).toBe(true);
    expect(stateUpdates['led-nc']?.ledOn).toBe(false);
  });

  it('evaluates 2-channel 5V Relay Module independent channel switching', () => {
    const components: PlacedComponent[] = [
      { id: 'uno-1', type: 'arduino-uno', name: 'Arduino Uno', x: 0, y: 0, rotation: 0, props: {} },
      { id: 'relay2ch', type: 'relay-5v-2ch', name: '2-Ch Relay Module', x: 200, y: 0, rotation: 0, props: {} },
      { id: 'led-ch1', type: 'led', name: 'LED CH1', x: 400, y: 0, rotation: 0, props: {} },
      { id: 'led-ch2', type: 'led', name: 'LED CH2', x: 400, y: 100, rotation: 0, props: {} },
    ];

    const wires: WireConnection[] = [
      { id: 'w1', fromComponentId: 'uno-1', fromPinId: '12', toComponentId: 'relay2ch', toPinId: 'IN1', color: 'blue' },
      { id: 'w2', fromComponentId: 'uno-1', fromPinId: '13', toComponentId: 'relay2ch', toPinId: 'IN2', color: 'purple' },
      { id: 'w3', fromComponentId: 'uno-1', fromPinId: '5V', toComponentId: 'relay2ch', toPinId: 'VCC', color: 'red' },
      { id: 'w4', fromComponentId: 'uno-1', fromPinId: 'GND1', toComponentId: 'relay2ch', toPinId: 'GND', color: 'black' },
      { id: 'w5', fromComponentId: 'uno-1', fromPinId: '5V', toComponentId: 'relay2ch', toPinId: 'COM1', color: 'red' },
      { id: 'w6', fromComponentId: 'uno-1', fromPinId: '5V', toComponentId: 'relay2ch', toPinId: 'COM2', color: 'red' },
      { id: 'w7', fromComponentId: 'relay2ch', fromPinId: 'NO1', toComponentId: 'led-ch1', toPinId: 'A', color: 'yellow' },
      { id: 'w8', fromComponentId: 'relay2ch', fromPinId: 'NO2', toComponentId: 'led-ch2', toPinId: 'A', color: 'orange' },
      { id: 'w9', fromComponentId: 'led-ch1', fromPinId: 'C', toComponentId: 'uno-1', toPinId: 'GND1', color: 'black' },
      { id: 'w10', fromComponentId: 'led-ch2', fromPinId: 'C', toComponentId: 'uno-1', toPinId: 'GND1', color: 'black' },
    ];

    evaluator.syncGraph(components, wires);

    let stateUpdates: Record<string, Record<string, any>> = {};
    const updateState = (id: string, state: Record<string, any>) => {
      stateUpdates[id] = { ...stateUpdates[id], ...state };
    };

    // Drive Pin 12 HIGH, Pin 13 LOW -> CH1 active, CH2 idle -> LED CH1 ON, LED CH2 OFF
    evaluator.handlePinOutputChange(components[0], '12', true, components, updateState);
    evaluator.handlePinOutputChange(components[0], '13', false, components, updateState);

    expect(stateUpdates['relay2ch']?.active1).toBe(true);
    expect(stateUpdates['relay2ch']?.active2).toBe(false);
    expect(stateUpdates['led-ch1']?.ledOn).toBe(true);
    expect(stateUpdates['led-ch2']?.ledOn).toBe(false);
  });

  it('reads correct analog ADC value for LM35 temperature sensor', () => {
    const components: PlacedComponent[] = [
      { id: 'uno-1', type: 'arduino-uno', name: 'Arduino Uno', x: 0, y: 0, rotation: 0, props: {} },
      { id: 'lm35-1', type: 'lm35', name: 'LM35 Sensor', x: 200, y: 0, rotation: 0, props: { temperature: 25 } },
    ];

    const wires: WireConnection[] = [
      { id: 'w1', fromComponentId: 'uno-1', fromPinId: '5V', toComponentId: 'lm35-1', toPinId: 'VCC', color: 'red' },
      { id: 'w2', fromComponentId: 'lm35-1', fromPinId: 'OUT', toComponentId: 'uno-1', toPinId: 'A0', color: 'yellow' },
      { id: 'w3', fromComponentId: 'lm35-1', fromPinId: 'GND', toComponentId: 'uno-1', toPinId: 'GND1', color: 'black' },
    ];

    evaluator.syncGraph(components, wires);

    // At 25°C -> 250mV -> ADC = Math.round((0.25 / 5.0) * 1023) = 51
    const adc25 = evaluator.readAnalogPin(components[0], 'A0', components, wires);
    expect(adc25).toBe(51);

    // At 100°C -> 1000mV -> ADC = Math.round((1.0 / 5.0) * 1023) = 205
    components[1].props.temperature = 100;
    const adc100 = evaluator.readAnalogPin(components[0], 'A0', components, wires);
    expect(adc100).toBe(205);
  });

  it('evaluates IR Obstacle Sensor Module digital output level and distance reading', () => {
    const components: PlacedComponent[] = [
      { id: 'uno-1', type: 'arduino-uno', name: 'Arduino Uno', x: 0, y: 0, rotation: 0, props: {} },
      { id: 'ir-1', type: 'ir-sensor', name: 'IR Sensor', x: 200, y: 0, rotation: 0, props: { obstacleDetected: false, distance: 20 } },
    ];

    const wires: WireConnection[] = [
      { id: 'w1', fromComponentId: 'uno-1', fromPinId: '5V', toComponentId: 'ir-1', toPinId: 'VCC', color: 'red' },
      { id: 'w2', fromComponentId: 'ir-1', fromPinId: 'OUT', toComponentId: 'uno-1', toPinId: '2', color: 'yellow' },
      { id: 'w3', fromComponentId: 'ir-1', fromPinId: 'GND', toComponentId: 'uno-1', toPinId: 'GND1', color: 'black' },
    ];

    evaluator.syncGraph(components, wires);

    let stateUpdates: Record<string, Record<string, any>> = {};
    const updateState = (id: string, state: Record<string, any>) => {
      stateUpdates[id] = { ...stateUpdates[id], ...state };
    };

    // When distance > 10cm (no obstacle), OUT is HIGH (true)
    evaluator.evaluateAllComponents(components, updateState);
    expect(stateUpdates['ir-1']?.obstacleDetected).toBe(false);
    expect(stateUpdates['ir-1']?.outLevel).toBe(true);
    expect(evaluator.readDigitalPin(components[0], '2')).toBe(true);

    // When obstacle is detected (distance = 5cm), OUT becomes LOW (false)
    components[1].props.distance = 5;
    components[1].props.obstacleDetected = true;
    evaluator.evaluateAllComponents(components, updateState);
    expect(stateUpdates['ir-1']?.obstacleDetected).toBe(true);
    expect(stateUpdates['ir-1']?.outLevel).toBe(false);
    expect(evaluator.readDigitalPin(components[0], '2')).toBe(false);
  });

  it('reads correct analog PPM value for MQ-2 Gas Sensor across pin aliases (gasPpm and ppm)', () => {
    const components: PlacedComponent[] = [
      { id: 'esp-1', type: 'esp32-devkit', name: 'ESP32 DevKit V1', x: 0, y: 0, rotation: 0, props: {} },
      { id: 'gas-1', type: 'gas-sensor', name: 'MQ-2 Gas Sensor', x: 200, y: 0, rotation: 0, props: { ppm: 450 } },
    ];

    const wires: WireConnection[] = [
      { id: 'w1', fromComponentId: 'esp-1', fromPinId: '3V3', toComponentId: 'gas-1', toPinId: 'VCC', color: 'red' },
      { id: 'w2', fromComponentId: 'gas-1', fromPinId: 'AOUT', toComponentId: 'esp-1', toPinId: 'D34', color: 'blue' },
      { id: 'w3', fromComponentId: 'gas-1', fromPinId: 'GND', toComponentId: 'esp-1', toPinId: 'GND1', color: 'black' },
    ];

    evaluator.syncGraph(components, wires);

    // Should read ppm=450 using pin name variants '34', 'D34', 'A34'
    expect(evaluator.readAnalogPin(components[0], '34', components, wires)).toBe(450);
    expect(evaluator.readAnalogPin(components[0], 'D34', components, wires)).toBe(450);

    // When gasPpm is updated
    components[1].props.gasPpm = 750;
    expect(evaluator.readAnalogPin(components[0], '34', components, wires)).toBe(750);
  });

  it('evaluates MQ-2 Gas Sensor digital output DOUT level based on PPM slider threshold', () => {
    const components: PlacedComponent[] = [
      { id: 'uno-1', type: 'arduino-uno', name: 'Arduino Uno', x: 0, y: 0, rotation: 0, props: {} },
      { id: 'gas-1', type: 'gas-sensor', name: 'MQ-2 Gas Sensor', x: 200, y: 0, rotation: 0, props: { gasPpm: 250 } },
    ];

    const wires: WireConnection[] = [
      { id: 'w1', fromComponentId: 'gas-1', fromPinId: 'DOUT', toComponentId: 'uno-1', toPinId: '2', color: 'green' },
    ];

    const stateUpdates: Record<string, any> = {};
    const updateState = (id: string, s: Record<string, any>) => { stateUpdates[id] = s; };

    evaluator.syncGraph(components, wires);
    evaluator.evaluateAllComponents(components, updateState);

    // Default 250 PPM < 400 threshold -> DOUT should be false (0V)
    expect(stateUpdates['gas-1']?.gasDetected).toBe(false);
    expect(stateUpdates['gas-1']?.outLevel).toBe(false);
    expect(evaluator.readDigitalPin(components[0], '2')).toBe(false);

    // When gas PPM increases to 600 PPM > 400 threshold -> DOUT should be true (5V)
    components[1].props.gasPpm = 600;
    evaluator.evaluateAllComponents(components, updateState);
    expect(stateUpdates['gas-1']?.gasDetected).toBe(true);
    expect(stateUpdates['gas-1']?.outLevel).toBe(true);
    expect(evaluator.readDigitalPin(components[0], '2')).toBe(true);
  });

  it('reads analog PPM value for MQ-2 Gas Sensor connected via breadboard', () => {
    const components: PlacedComponent[] = [
      { id: 'uno-1', type: 'arduino-uno', name: 'Arduino Uno', x: 0, y: 0, rotation: 0, props: {} },
      { id: 'bb-1', type: 'breadboard-half', name: 'Breadboard', x: 100, y: 0, rotation: 0, props: {} },
      { id: 'gas-1', type: 'gas-sensor', name: 'MQ-2 Gas Sensor', x: 300, y: 0, rotation: 0, props: { gasPpm: 550 } },
    ];

    // Uno A0 -> Breadboard R5a, MQ-2 AOUT -> Breadboard R5e (Row 5 column net)
    const wires: WireConnection[] = [
      { id: 'w1', fromComponentId: 'uno-1', fromPinId: 'A0', toComponentId: 'bb-1', toPinId: 'R5a', color: 'green' },
      { id: 'w2', fromComponentId: 'gas-1', fromPinId: 'AOUT', toComponentId: 'bb-1', toPinId: 'R5e', color: 'blue' },
    ];

    evaluator.syncGraph(components, wires);
    expect(evaluator.readAnalogPin(components[0], 'A0', components, wires)).toBe(550);
  });

  it('evaluates LED powered by a 9V Alkaline battery via current-limiting resistor', () => {
    const components: PlacedComponent[] = [
      { id: 'bat-1', type: 'battery-9v', name: '9V Battery', x: 0, y: 0, rotation: 0, props: {} },
      { id: 'r-1', type: 'resistor', name: 'Resistor 470', x: 100, y: 0, rotation: 0, props: { resistance: 470 } },
      { id: 'led-1', type: 'led', name: 'Red LED', x: 200, y: 0, rotation: 0, props: { color: 'red' } },
    ];

    // Bat (+) -> Resistor Pin 1, Resistor Pin 2 -> LED Anode, LED Cathode -> Bat (-)
    const wires: WireConnection[] = [
      { id: 'w1', fromComponentId: 'bat-1', fromPinId: '+', toComponentId: 'r-1', toPinId: '1', color: 'red' },
      { id: 'w2', fromComponentId: 'r-1', fromPinId: '2', toComponentId: 'led-1', toPinId: 'A', color: 'red' },
      { id: 'w3', fromComponentId: 'led-1', fromPinId: 'C', toComponentId: 'bat-1', toPinId: '-', color: 'black' },
    ];

    evaluator.syncGraph(components, wires);

    let stateUpdates: Record<string, Record<string, any>> = {};
    const updateState = (id: string, state: Record<string, any>) => {
      stateUpdates[id] = state;
    };

    evaluator.evaluateAllComponents(components, updateState);
    expect(stateUpdates['led-1']?.ledOn).toBe(true);
  });

  it('evaluates slide switch toggling LED on and off from a 3V coin cell', () => {
    const components: PlacedComponent[] = [
      { id: 'cell-1', type: 'coin-cell-3v', name: '3V Coin Cell', x: 0, y: 0, rotation: 0, props: {} },
      { id: 'sw-1', type: 'slide-switch', name: 'Slide Switch', x: 100, y: 0, rotation: 0, props: { state: 'left' } },
      { id: 'led-1', type: 'led', name: 'Green LED', x: 200, y: 0, rotation: 0, props: { color: 'green' } },
    ];

    // Cell (+) -> Switch COM, Switch Pin 1 -> LED Anode, LED Cathode -> Cell (-)
    const wires: WireConnection[] = [
      { id: 'w1', fromComponentId: 'cell-1', fromPinId: '+', toComponentId: 'sw-1', toPinId: 'COM', color: 'red' },
      { id: 'w2', fromComponentId: 'sw-1', fromPinId: '1', toComponentId: 'led-1', toPinId: 'A', color: 'red' },
      { id: 'w3', fromComponentId: 'led-1', fromPinId: 'C', toComponentId: 'cell-1', toPinId: '-', color: 'black' },
    ];

    let stateUpdates: Record<string, Record<string, any>> = {};
    const updateState = (id: string, state: Record<string, any>) => {
      stateUpdates[id] = state;
    };

    // When switch is left, COM is connected to Pin 1 -> LED is ON
    evaluator.syncGraph(components, wires);
    evaluator.evaluateAllComponents(components, updateState);
    expect(stateUpdates['led-1']?.ledOn).toBe(true);

    // When switch is right, COM is disconnected from Pin 1 -> LED is OFF
    components[1].props.state = 'right';
    evaluator.syncGraph(components, wires);
    evaluator.evaluateAllComponents(components, updateState);
    expect(stateUpdates['led-1']?.ledOn).toBe(false);
  });

  it('reads correct analog ADC value for potentiometer matching inspector scale (0..1023)', () => {
    const components: PlacedComponent[] = [
      { id: 'uno-1', type: 'arduino-uno', name: 'Arduino Uno', x: 0, y: 0, rotation: 0, props: {} },
      { id: 'pot-1', type: 'potentiometer', name: 'Potentiometer', x: 200, y: 0, rotation: 0, props: { value: 91 } },
    ];

    const wires: WireConnection[] = [
      { id: 'w1', fromComponentId: 'uno-1', fromPinId: '5V', toComponentId: 'pot-1', toPinId: '2', color: 'red' },
      { id: 'w2', fromComponentId: 'pot-1', fromPinId: 'SIG', toComponentId: 'uno-1', toPinId: 'A0', color: 'blue' },
      { id: 'w3', fromComponentId: 'pot-1', fromPinId: '1', toComponentId: 'uno-1', toPinId: 'GND1', color: 'black' },
    ];

    evaluator.syncGraph(components, wires);

    // Value 91 on 0..1023 scale -> returns 91
    expect(evaluator.readAnalogPin(components[0], 'A0', components, wires)).toBe(91);

    // Midpoint value 512 -> returns 512
    components[1].props.value = 512;
    expect(evaluator.readAnalogPin(components[0], 'A0', components, wires)).toBe(512);
  });

  it('evaluates piezo buzzer active beeping state when positive terminal is HIGH and negative is grounded', () => {
    const components: PlacedComponent[] = [
      { id: 'uno-1', type: 'arduino-uno', name: 'Arduino Uno', x: 0, y: 0, rotation: 0, props: {} },
      { id: 'buz-1', type: 'buzzer', name: 'Piezo Buzzer', x: 200, y: 0, rotation: 0, props: {} },
    ];

    const wires: WireConnection[] = [
      { id: 'w1', fromComponentId: 'uno-1', fromPinId: '8', toComponentId: 'buz-1', toPinId: '+', color: 'red' },
      { id: 'w2', fromComponentId: 'buz-1', fromPinId: '-', toComponentId: 'uno-1', toPinId: 'GND1', color: 'black' },
    ];

    evaluator.syncGraph(components, wires);

    let stateUpdates: Record<string, Record<string, any>> = {};
    const updateState = (id: string, state: Record<string, any>) => {
      stateUpdates[id] = { ...stateUpdates[id], ...state };
    };

    // When MCU Pin 8 is driven HIGH -> Buzzer active & sounding is true
    evaluator.handlePinOutputChange(components[0], '8', true, components, updateState);
    expect(stateUpdates['buz-1']?.active).toBe(true);
    expect(stateUpdates['buz-1']?.sounding).toBe(true);

    // When MCU Pin 8 is driven LOW -> Buzzer active & sounding is false
    evaluator.handlePinOutputChange(components[0], '8', false, components, updateState);
    expect(stateUpdates['buz-1']?.active).toBe(false);
    expect(stateUpdates['buz-1']?.sounding).toBe(false);
  });
});

