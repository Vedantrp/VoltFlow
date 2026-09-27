import type { ComponentPin, PlacedComponent } from '../types';
import { COMPONENT_CATALOG } from '../catalog';

export interface PinCompatibilityResult {
  compatible: boolean;
  reason: string;
  severity: 'ok' | 'warning' | 'danger';
}

/**
 * Validates connection compatibility between two component pins.
 * Prevents direct power-to-ground short circuits, output collisions,
 * and provides educational guidance on buses (UART, I2C, SPI).
 */
export function checkPinCompatibility(
  startComp: PlacedComponent,
  startPin: ComponentPin,
  targetComp: PlacedComponent,
  targetPin: ComponentPin
): PinCompatibilityResult {
  // Prevent connecting pin to itself
  if (startComp.id === targetComp.id && startPin.id === targetPin.id) {
    return {
      compatible: false,
      reason: 'Cannot connect a pin directly to itself',
      severity: 'warning',
    };
  }

  const startElec = startPin.electricalType || startPin.type || 'passive';
  const targetElec = targetPin.electricalType || targetPin.type || 'passive';

  // 1. Short Circuit: Direct Power (VCC/5V/3.3V/VIN/Battery +) to Ground (GND/Battery -)
  const isStartPower = startElec === 'power' || startPin.name === '5V' || startPin.name === '3V3' || startPin.name === 'VCC' || startPin.id === '+' || startPin.name.startsWith('+');
  const isStartGnd = startElec === 'ground' || startPin.name.startsWith('GND') || startPin.id.startsWith('GND') || startPin.id === '-' || startPin.name.startsWith('-');
  const isTargetPower = targetElec === 'power' || targetPin.name === '5V' || targetPin.name === '3V3' || targetPin.name === 'VCC' || targetPin.id === '+' || targetPin.name.startsWith('+');
  const isTargetGnd = targetElec === 'ground' || targetPin.name.startsWith('GND') || targetPin.id.startsWith('GND') || targetPin.id === '-' || targetPin.name.startsWith('-');

  if ((isStartPower && isTargetGnd) || (isStartGnd && isTargetPower)) {
    return {
      compatible: false,
      reason: '⚠ Short Circuit Hazard: Direct Power to Ground connection will cause excessive current draw!',
      severity: 'danger',
    };
  }

  // 2. UART Cross-Connection Guidance (TX -> RX, RX -> TX)
  if (startElec === 'uart' && targetElec === 'uart') {
    const startIsTX = startPin.id.toUpperCase().includes('TX') || startPin.name.toUpperCase().includes('TX');
    const targetIsRX = targetPin.id.toUpperCase().includes('RX') || targetPin.name.toUpperCase().includes('RX');
    const startIsRX = startPin.id.toUpperCase().includes('RX') || startPin.name.toUpperCase().includes('RX');
    const targetIsTX = targetPin.id.toUpperCase().includes('TX') || targetPin.name.toUpperCase().includes('TX');

    if ((startIsTX && targetIsRX) || (startIsRX && targetIsTX)) {
      return {
        compatible: true,
        reason: '✓ Ideal Serial UART Link (TX ⇄ RX Cross-Connect)',
        severity: 'ok',
      };
    }
    if (startIsTX && targetIsTX) {
      return {
        compatible: false,
        reason: 'Notice: Connecting TX to TX will not communicate. Connect TX to RX.',
        severity: 'warning',
      };
    }
  }

  // 3. Output to Output collision (two digital/analog output drivers fighting each other)
  if (startPin.direction === 'out' && targetPin.direction === 'out') {
    return {
      compatible: false,
      reason: '⚠ Signal Conflict: Both terminals are driven outputs (driver contention hazard)!',
      severity: 'warning',
    };
  }

  // 4. I2C Bus Guidance (SDA to SDA, SCL to SCL)
  if (startElec === 'i2c' && targetElec === 'i2c') {
    const isSDA1 = startPin.name.includes('SDA') || startPin.id.includes('SDA') || startPin.label?.includes('SDA');
    const isSDA2 = targetPin.name.includes('SDA') || targetPin.id.includes('SDA') || targetPin.label?.includes('SDA');
    const isSCL1 = startPin.name.includes('SCL') || startPin.id.includes('SCL') || startPin.label?.includes('SCL');
    const isSCL2 = targetPin.name.includes('SCL') || targetPin.id.includes('SCL') || targetPin.label?.includes('SCL');

    if (isSDA1 && isSDA2) {
      return {
        compatible: true,
        reason: '✓ I2C Bus: Serial Data (SDA) Link',
        severity: 'ok',
      };
    }
    if (isSCL1 && isSCL2) {
      return {
        compatible: true,
        reason: '✓ I2C Bus: Serial Clock (SCL) Link',
        severity: 'ok',
      };
    }
    if ((isSDA1 && isSCL2) || (isSCL1 && isSDA2)) {
      return {
        compatible: false,
        reason: 'Notice: Mismatched I2C lines. SDA must connect to SDA, and SCL to SCL.',
        severity: 'warning',
      };
    }
  }

  // 5. Voltage mismatch (5V to 3.3V)
  if (startPin.voltage === 5 && targetPin.voltage === 3.3) {
    return {
      compatible: true,
      reason: 'Notice: 5V supply connected to 3.3V rated input. Ensure component has internal regulator.',
      severity: 'warning',
    };
  }

  return {
    compatible: true,
    reason: `✓ Compatible Connection: ${startPin.name} ↔ ${targetPin.name}`,
    severity: 'ok',
  };
}

/**
 * Finds pin definition from component definition or fallback.
 */
export function findPinDefinition(compType: string, pinId: string): ComponentPin | undefined {
  const def = COMPONENT_CATALOG.find((c) => c.type === compType);
  if (!def) return undefined;
  return def.pins.find((p) => p.id === pinId || p.name === pinId);
}
