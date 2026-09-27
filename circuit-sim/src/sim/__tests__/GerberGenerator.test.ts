import { describe, it, expect } from 'vitest';
import { generateGerberZip } from '../GerberGenerator';
import type { PlacedComponent, WireConnection } from '../../types';

describe('GerberGenerator Unit Tests', () => {
  it('generates a Gerber ZIP package with board statistics and valid blob', () => {
    const components: PlacedComponent[] = [
      { id: 'uno-1', type: 'arduino-uno', name: 'Arduino Uno', x: 50, y: 50, rotation: 0, props: {} },
      { id: 'led-1', type: 'led', name: 'LED', x: 250, y: 50, rotation: 0, props: {} },
      { id: 'res-1', type: 'resistor', name: 'Resistor 220', x: 150, y: 50, rotation: 90, props: {} },
    ];

    const wires: WireConnection[] = [
      { id: 'w1', fromComponentId: 'uno-1', fromPinId: '13', toComponentId: 'res-1', toPinId: '1', color: 'red' },
      { id: 'w2', fromComponentId: 'res-1', fromPinId: '2', toComponentId: 'led-1', toPinId: 'A', color: 'red' },
      { id: 'w3', fromComponentId: 'led-1', fromPinId: 'C', toComponentId: 'uno-1', toPinId: 'GND1', color: 'black' },
    ];

    const result = generateGerberZip(components, wires);

    expect(result).toBeDefined();
    expect(result.zipBlob).toBeInstanceOf(Blob);
    expect(result.zipBlob.size).toBeGreaterThan(500); // contains 5 zipped files
    expect(result.boardWidthMm).toBeGreaterThan(0);
    expect(result.boardHeightMm).toBeGreaterThan(0);
    expect(result.padCount).toBeGreaterThan(0);
    expect(result.traceCount).toBe(3);
  });

  it('handles empty component canvas without crashing', () => {
    const result = generateGerberZip([], []);
    expect(result).toBeDefined();
    expect(result.zipBlob).toBeInstanceOf(Blob);
    expect(result.padCount).toBe(0);
    expect(result.traceCount).toBe(0);
  });
});
