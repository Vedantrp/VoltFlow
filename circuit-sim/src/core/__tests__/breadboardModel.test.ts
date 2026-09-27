import { describe, it, expect } from 'vitest';
import {
  createMiniBreadboardDefinition,
  createHalfBreadboardDefinition,
  createFullBreadboardDefinition,
  snapComponentToBreadboard,
  getConnectedHoles,
} from '../breadboardModel';
import type { PinDefinition } from '../componentDefinition';

describe('Breadboard Topology & Electrical Groups', () => {
  it('creates Mini breadboard with 170 tie points (17 cols x 10 rows) and isolated banks', () => {
    const mini = createMiniBreadboardDefinition();
    expect(mini.holes.length).toBe(170);
    expect(mini.connectivityGroups.length).toBe(34); // 17 top + 17 bottom

    // Check that hole A1 and E1 are connected
    const hA1 = mini.holes.find((h) => h.row === 'a' && h.column === 1);
    const hE1 = mini.holes.find((h) => h.row === 'e' && h.column === 1);
    expect(hA1?.groupId).toBe(hE1?.groupId);

    // Check that hole A1 and F1 across center divider trough are ELECTRICALLY ISOLATED
    const hF1 = mini.holes.find((h) => h.row === 'f' && h.column === 1);
    expect(hA1?.groupId).not.toBe(hF1?.groupId);

    // Check that column 1 and column 2 are ELECTRICALLY ISOLATED
    const hA2 = mini.holes.find((h) => h.row === 'a' && h.column === 2);
    expect(hA1?.groupId).not.toBe(hA2?.groupId);
  });

  it('creates Half breadboard with 4 continuous power rails and terminal banks', () => {
    const half = createHalfBreadboardDefinition();
    expect(half.holes.length).toBe(30 * 10 + 30 * 4); // 300 terminal + 120 rail = 420 holes
    expect(half.powerRails.length).toBe(4);

    // Top positive rail holes should all share the same group
    const topPos1 = half.holes.find((h) => h.row === '+' && h.column === 1 && h.yMm < 10);
    const topPos30 = half.holes.find((h) => h.row === '+' && h.column === 30 && h.yMm < 10);
    expect(topPos1?.groupId).toBe(topPos30?.groupId);

    // Top positive and top negative rail must be electrically isolated
    const topNeg1 = half.holes.find((h) => h.row === '-' && h.column === 1 && h.yMm < 10);
    expect(topPos1?.groupId).not.toBe(topNeg1?.groupId);
  });

  it('creates Full breadboard with split power rails (Section 1 vs Section 2)', () => {
    const full = createFullBreadboardDefinition();
    expect(full.holes.length).toBe(63 * 10 + 63 * 4);
    expect(full.powerRails.length).toBe(8); // 4 rails x 2 split sections

    // Col 10 and Col 20 in Sec 1 share rail group
    const railSec1A = full.holes.find((h) => h.row === '+' && h.column === 10 && h.yMm < 10);
    const railSec1B = full.holes.find((h) => h.row === '+' && h.column === 20 && h.yMm < 10);
    expect(railSec1A?.groupId).toBe(railSec1B?.groupId);

    // Col 10 (Sec 1) and Col 50 (Sec 2) are separated by power rail isolation break
    const railSec2 = full.holes.find((h) => h.row === '+' && h.column === 50 && h.yMm < 10);
    expect(railSec1A?.groupId).not.toBe(railSec2?.groupId);
  });

  it('retrieves all connected holes in a terminal group correctly', () => {
    const half = createHalfBreadboardDefinition();
    const hC5 = half.holes.find((h) => h.row === 'c' && h.column === 5);
    expect(hC5).toBeDefined();

    const connected = getConnectedHoles(hC5!.id, half);
    expect(connected.length).toBe(5);
    const rows = connected.map((h) => h.row).sort();
    expect(rows).toEqual(['a', 'b', 'c', 'd', 'e']);
  });
});

describe('Rigid Multi-Pin Snapping Engine', () => {
  it('rigidly snaps a 2-pin resistor with 7.62mm pitch across breadboard columns', () => {
    const mini = createMiniBreadboardDefinition();
    const bbOrigin = { x: 0, y: 0 };

    const resistorPins: PinDefinition[] = [
      { id: '1', name: '1', xMm: 0, yMm: 0, type: 'passive' },
      { id: '2', name: '2', xMm: 7.62, yMm: 0, type: 'passive' }, // 3 columns stride (3 x 2.54mm)
    ];

    // Place near Col 2, Row A
    const holeCol2A = mini.holes.find((h) => h.row === 'a' && h.column === 2)!;
    const dropPosMm = { x: holeCol2A.xMm + 1.2, y: holeCol2A.yMm + 0.8 };

    const snap = snapComponentToBreadboard(resistorPins, dropPosMm, 0, mini, bbOrigin);
    expect(snap.canSnap).toBe(true);
    expect(snap.candidateHoles.length).toBe(2);

    expect(snap.snappedHoleMap['1'].column).toBe(2);
    expect(snap.snappedHoleMap['1'].row).toBe('a');
    expect(snap.snappedHoleMap['2'].column).toBe(5); // 2 + 3 = Col 5
    expect(snap.snappedHoleMap['2'].row).toBe('a');
  });

  it('rigidly snaps a DIP-8 IC straddling the central divider trough', () => {
    const mini = createMiniBreadboardDefinition();
    const bbOrigin = { x: 0, y: 0 };

    // Standard DIP-8: 4 pins on top bank E, 4 pins on bottom bank F
    // X pitch = 2.54mm, Y stride = 7.62mm (distance between Row E and Row F)
    const rowEY = mini.holes.find((h) => h.row === 'e' && h.column === 4)!.yMm;
    const rowFY = mini.holes.find((h) => h.row === 'f' && h.column === 4)!.yMm;
    const dipYStride = rowFY - rowEY;

    const dip8Pins: PinDefinition[] = [
      // Top pins (Row E): 1, 2, 3, 4
      { id: 'pin1', name: '1', xMm: 0, yMm: 0, type: 'passive' },
      { id: 'pin2', name: '2', xMm: 2.54, yMm: 0, type: 'passive' },
      { id: 'pin3', name: '3', xMm: 5.08, yMm: 0, type: 'passive' },
      { id: 'pin4', name: '4', xMm: 7.62, yMm: 0, type: 'passive' },
      // Bottom pins (Row F): 8, 7, 6, 5
      { id: 'pin8', name: '8', xMm: 0, yMm: dipYStride, type: 'passive' },
      { id: 'pin7', name: '7', xMm: 2.54, yMm: dipYStride, type: 'passive' },
      { id: 'pin6', name: '6', xMm: 5.08, yMm: dipYStride, type: 'passive' },
      { id: 'pin5', name: '5', xMm: 7.62, yMm: dipYStride, type: 'passive' },
    ];

    const holeCol4E = mini.holes.find((h) => h.row === 'e' && h.column === 4)!;
    const dropPosMm = { x: holeCol4E.xMm + 0.5, y: holeCol4E.yMm - 0.4 };

    const snap = snapComponentToBreadboard(dip8Pins, dropPosMm, 0, mini, bbOrigin);
    expect(snap.canSnap).toBe(true);
    expect(snap.candidateHoles.length).toBe(8);

    // Verify top pins land on row E, bottom pins land on row F across trough
    expect(snap.snappedHoleMap['pin1'].row).toBe('e');
    expect(snap.snappedHoleMap['pin1'].column).toBe(4);
    expect(snap.snappedHoleMap['pin8'].row).toBe('f');
    expect(snap.snappedHoleMap['pin8'].column).toBe(4);

    // Verify pin 1 and pin 8 are on separate electrical groups!
    expect(snap.snappedHoleMap['pin1'].groupId).not.toBe(snap.snappedHoleMap['pin8'].groupId);
  });
});
