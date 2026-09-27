import { describe, it, expect } from 'vitest';
import { checkPinCompatibility } from '../pinUtils';
import type { PlacedComponent, ComponentPin } from '../../types';

describe('Pin Connection Validation & Compatibility Tests', () => {
  const dummyCompA: PlacedComponent = {
    id: 'uno-1',
    type: 'arduino-uno',
    name: 'Arduino Uno R3',
    x: 100,
    y: 100,
    rotation: 0,
    props: {},
  };

  const dummyCompB: PlacedComponent = {
    id: 'bt-1',
    type: 'bluetooth-hc05',
    name: 'Bluetooth HC-05 Module',
    x: 400,
    y: 100,
    rotation: 0,
    props: {},
  };

  it('detects and flags dangerous short circuits between 5V/VCC and GND', () => {
    const p5V: ComponentPin = {
      id: '5V',
      name: '5V',
      x: 160,
      y: 191.5,
      type: 'power',
      electricalType: 'power',
    };
    const pGND: ComponentPin = {
      id: 'GND',
      name: 'GND',
      x: 0,
      y: 60,
      type: 'ground',
      electricalType: 'ground',
    };

    const result = checkPinCompatibility(dummyCompA, p5V, dummyCompB, pGND);
    expect(result.compatible).toBe(false);
    expect(result.severity).toBe('danger');
    expect(result.reason).toContain('Short Circuit Hazard');
  });

  it('validates ideal UART cross connections (TX ↔ RX) and warns on TX ↔ TX collisions', () => {
    const txPin: ComponentPin = {
      id: '1',
      name: 'D1 (TX)',
      x: 246,
      y: 9,
      type: 'digital',
      electricalType: 'uart',
      direction: 'out',
    };
    const rxPin: ComponentPin = {
      id: 'RXD',
      name: 'RXD',
      x: 0,
      y: 30,
      type: 'digital',
      electricalType: 'uart',
      direction: 'in',
    };
    const txPinB: ComponentPin = {
      id: 'TXD',
      name: 'TXD',
      x: 0,
      y: 45,
      type: 'digital',
      electricalType: 'uart',
      direction: 'out',
    };

    // Valid cross connection
    const okResult = checkPinCompatibility(dummyCompA, txPin, dummyCompB, rxPin);
    expect(okResult.compatible).toBe(true);
    expect(okResult.severity).toBe('ok');
    expect(okResult.reason).toContain('Ideal Serial UART Link');

    // Invalid TX to TX collision
    const warnResult = checkPinCompatibility(dummyCompA, txPin, dummyCompB, txPinB);
    expect(warnResult.compatible).toBe(false);
    expect(warnResult.severity).toBe('warning');
    expect(warnResult.reason).toContain('Connecting TX to TX');
  });

  it('validates I2C SDA and SCL bus line matching', () => {
    const sdaA: ComponentPin = { id: 'A4', name: 'A4', label: 'A4/SDA', x: 246, y: 191.5, type: 'analog', electricalType: 'i2c' };
    const sdaB: ComponentPin = { id: 'SDA', name: 'SDA', label: 'SDA', x: 24, y: 98, type: 'digital', electricalType: 'i2c' };
    const sclB: ComponentPin = { id: 'SCL', name: 'SCL', label: 'SCL', x: 34, y: 98, type: 'digital', electricalType: 'i2c' };

    const validI2c = checkPinCompatibility(dummyCompA, sdaA, dummyCompB, sdaB);
    expect(validI2c.compatible).toBe(true);
    expect(validI2c.reason).toContain('I2C Bus: Serial Data (SDA)');

    const mismatchedI2c = checkPinCompatibility(dummyCompA, sdaA, dummyCompB, sclB);
    expect(mismatchedI2c.compatible).toBe(false);
    expect(mismatchedI2c.reason).toContain('Mismatched I2C lines');
  });

  it('prevents connecting a pin directly to itself', () => {
    const pin: ComponentPin = { id: '13', name: 'D13', x: 125, y: 9, type: 'digital' };
    const res = checkPinCompatibility(dummyCompA, pin, dummyCompA, pin);
    expect(res.compatible).toBe(false);
    expect(res.reason).toContain('Cannot connect a pin directly to itself');
  });

  it('detects short circuit across battery positive and negative terminals', () => {
    const batComp: PlacedComponent = {
      id: 'bat-1',
      type: 'battery-9v',
      name: '9V Alkaline Battery',
      x: 200,
      y: 200,
      rotation: 0,
      props: {},
    };
    const pPlus: ComponentPin = { id: '+', name: '+ (9V)', label: '+9V', x: 26, y: 12, type: 'power', electricalType: 'power', voltage: 9 };
    const pMinus: ComponentPin = { id: '-', name: '- (GND)', label: 'GND', x: 54, y: 12, type: 'ground', electricalType: 'ground' };

    const res = checkPinCompatibility(batComp, pPlus, batComp, pMinus);
    expect(res.compatible).toBe(false);
    expect(res.severity).toBe('danger');
    expect(res.reason).toContain('Short Circuit Hazard');
  });
});
