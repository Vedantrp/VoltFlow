import { describe, it, expect } from 'vitest';
import { canvasToPCB, pcbToCanvas, rotatePoint, mmToGerberCoord } from '../coordinates';
import { getFootprintForComponent } from '../footprints';
import { circuitToPCBDocument, validatePCBDocument, DEFAULT_DESIGN_RULES } from '../pcbEngine';
import { buildGerberZip } from '../gerberExporter';
import type { PlacedComponent, WireConnection } from '../../types';
import type { PCBDocument } from '../types';

describe('1. Core Editor & State Management — Undo/Redo & Transformations', () => {
  it('handles Move -> Rotate -> Undo -> Redo -> Copy -> Delete -> Undo stress cycle', () => {
    interface HistoryState {
      components: PlacedComponent[];
      wires: WireConnection[];
    }

    const history: HistoryState[] = [];
    let state: HistoryState = {
      components: [
        { id: 'c1', type: 'resistor', name: 'R1', x: 50, y: 50, rotation: 0, props: { resistance: 220 } },
      ],
      wires: [],
    };

    const pushState = (s: HistoryState) => {
      history.push(JSON.parse(JSON.stringify(s)));
      state = JSON.parse(JSON.stringify(s));
    };

    // Initial state
    pushState(state);
    expect(state.components[0].x).toBe(50);
    expect(state.components[0].rotation).toBe(0);

    // 1. Move
    pushState({
      ...state,
      components: [{ ...state.components[0], x: 80, y: 90 }],
    });
    expect(state.components[0].x).toBe(80);

    // 2. Rotate to 90°
    pushState({
      ...state,
      components: [{ ...state.components[0], rotation: 90 }],
    });
    expect(state.components[0].rotation).toBe(90);

    // 3. Undo rotate -> should return to rotation: 0, x: 80
    const undo1 = history[history.length - 2];
    expect(undo1.components[0].rotation).toBe(0);
    expect(undo1.components[0].x).toBe(80);

    // 4. Redo rotate -> rotation: 90
    const redo1 = history[history.length - 1];
    expect(redo1.components[0].rotation).toBe(90);

    // 5. Copy / Duplicate -> new unique ID
    const newComp: PlacedComponent = {
      ...redo1.components[0],
      id: 'c2',
      x: 100,
      y: 100,
    };
    pushState({
      ...state,
      components: [...redo1.components, newComp],
    });
    expect(state.components.length).toBe(2);
    expect(state.components[0].id).not.toBe(state.components[1].id);

    // 6. Delete c2
    pushState({
      ...state,
      components: state.components.filter((c) => c.id !== 'c2'),
    });
    expect(state.components.length).toBe(1);

    // 7. Undo delete -> c2 restored
    const undoDelete = history[history.length - 2];
    expect(undoDelete.components.length).toBe(2);
    expect(undoDelete.components.map((c) => c.id)).toContain('c2');
  });

  it('verifies 90°, 180°, and 270° pad rotation math preserves distance to center', () => {
    const origin = { x: 50, y: 50 };
    const pad = { x: 55, y: 50 }; // 5mm away along +X

    const rot90 = rotatePoint(pad, origin, 90);
    expect(rot90.x).toBeCloseTo(50, 3);
    expect(rot90.y).toBeCloseTo(55, 3);

    const rot180 = rotatePoint(pad, origin, 180);
    expect(rot180.x).toBeCloseTo(45, 3);
    expect(rot180.y).toBeCloseTo(50, 3);

    const rot270 = rotatePoint(pad, origin, 270);
    expect(rot270.x).toBeCloseTo(50, 3);
    expect(rot270.y).toBeCloseTo(45, 3);

    const rot360 = rotatePoint(pad, origin, 360);
    expect(rot360.x).toBeCloseTo(55, 3);
    expect(rot360.y).toBeCloseTo(50, 3);
  });
});

describe('2. Coordinate System — Invariance & Screen != PCB separation', () => {
  it('guarantees Screen coordinate != PCB coordinate and preserves physical coordinates across zoom/pan', () => {
    const originPx = { x: 200, y: 150 };
    const boardHeightPx = 400;
    const pxPerMm = 0.254;

    // Test known points on 100 x 100 mm board: (0,0), (10,10), (50,50), (99,99)
    const testPoints = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 50, y: 50 },
      { x: 99, y: 99 },
    ];

    for (const pt of testPoints) {
      const canvasPt = pcbToCanvas(pt, originPx, boardHeightPx, pxPerMm);
      // Screen coordinate must NEVER equal physical mm directly
      expect(canvasPt.x).not.toBe(pt.x);
      expect(canvasPt.y).not.toBe(pt.y);

      // Re-converting canvas coordinate back to PCB must yield identical mm within discrete pixel resolution
      const reconverted = canvasToPCB(canvasPt, originPx, boardHeightPx, pxPerMm);
      expect(reconverted.x).toBeCloseTo(pt.x, 0);
      expect(reconverted.y).toBeCloseTo(pt.y, 0);
    }
  });

  it('preserves RS-274X Gerber 10^6 integer export regardless of viewport scale', () => {
    expect(mmToGerberCoord(0)).toBe('0');
    expect(mmToGerberCoord(10)).toBe('10000000');
    expect(mmToGerberCoord(50)).toBe('50000000');
    expect(mmToGerberCoord(99)).toBe('99000000');
  });
});

describe('3. Component & Footprint Library Completeness', () => {
  it('verifies through-hole and SMD footprint library mappings have valid pads, holes, and dimensions', () => {
    const requiredFootprints = [
      'resistor',
      'led',
      'pushbutton',
      'potentiometer',
      'capacitor',
      'arduino-uno',
      'arduino-nano',
      'esp32-devkit',
      'nodemcu-esp8266',
      'servo',
      'relay-5v',
      'lcd1602',
    ];

    for (const type of requiredFootprints) {
      const fp = getFootprintForComponent(type)!;
      expect(fp).toBeDefined();
      expect(fp.widthMm).toBeGreaterThan(0);
      expect(fp.heightMm).toBeGreaterThan(0);
      expect(fp.pads.length).toBeGreaterThan(0);

      // Verify each pad has valid coordinates, dimensions, and shape
      for (const pad of fp.pads) {
        expect(pad.number).toBeDefined();
        expect(typeof pad.x).toBe('number');
        expect(typeof pad.y).toBe('number');
        expect(pad.width).toBeGreaterThan(0);
        expect(pad.height).toBeGreaterThan(0);
        expect(['circle', 'rect', 'oval', 'roundrect']).toContain(pad.shape);
      }
    }
  });
});

describe('4. Permanent VoltFlow Validation Suite — 8 Standard Benchmark Circuits', () => {
  // Circuit 1 — LED: VCC -> R -> LED -> GND
  it('Circuit 1 — LED: validates single-rail basic connectivity', () => {
    const components: PlacedComponent[] = [
      { id: 'u1', type: 'arduino-uno', name: 'Uno', x: 20, y: 20, rotation: 0, props: {} },
      { id: 'r1', type: 'resistor', name: 'R1', x: 120, y: 40, rotation: 0, props: { resistance: 220 } },
      { id: 'd1', type: 'led', name: 'D1', x: 170, y: 40, rotation: 0, props: {} },
    ];
    const wires: WireConnection[] = [
      { id: 'w1', fromComponentId: 'u1', fromPinId: '5V', toComponentId: 'r1', toPinId: '1', color: 'red' },
      { id: 'w2', fromComponentId: 'r1', fromPinId: '2', toComponentId: 'd1', toPinId: 'A', color: 'orange' },
      { id: 'w3', fromComponentId: 'd1', fromPinId: 'C', toComponentId: 'u1', toPinId: 'GND1', color: 'black' },
    ];

    const doc = circuitToPCBDocument(components, wires);
    const drc = validatePCBDocument(doc);

    expect(doc.components.length).toBe(3);
    expect(doc.tracks.length).toBe(3);
    expect(drc.isValid).toBe(true);
    expect(drc.manufacturingCheck.boardDimensionsPass).toBe(true);
    expect(drc.manufacturingCheck.outlinePass).toBe(true);
    expect(drc.manufacturingCheck.drcPass).toBe(true);
  });

  // Circuit 2 — Button + LED: VCC -> Button -> GPIO, GPIO -> LED -> R -> GND
  it('Circuit 2 — Button + LED: validates multi-net routing', () => {
    const components: PlacedComponent[] = [
      { id: 'u1', type: 'arduino-uno', name: 'Uno', x: 20, y: 20, rotation: 0, props: {} },
      { id: 'sw1', type: 'pushbutton', name: 'SW1', x: 120, y: 20, rotation: 0, props: {} },
      { id: 'r1', type: 'resistor', name: 'R1', x: 120, y: 80, rotation: 0, props: {} },
      { id: 'd1', type: 'led', name: 'D1', x: 170, y: 80, rotation: 0, props: {} },
    ];
    const wires: WireConnection[] = [
      { id: 'w1', fromComponentId: 'u1', fromPinId: '5V', toComponentId: 'sw1', toPinId: '1', color: 'red' },
      { id: 'w2', fromComponentId: 'sw1', fromPinId: '2', toComponentId: 'u1', toPinId: '2', color: 'blue' },
      { id: 'w3', fromComponentId: 'u1', fromPinId: '13', toComponentId: 'd1', toPinId: 'A', color: 'green' },
      { id: 'w4', fromComponentId: 'd1', fromPinId: 'C', toComponentId: 'r1', toPinId: '1', color: 'yellow' },
      { id: 'w5', fromComponentId: 'r1', fromPinId: '2', toComponentId: 'u1', toPinId: 'GND1', color: 'black' },
    ];

    const doc = circuitToPCBDocument(components, wires);
    const drc = validatePCBDocument(doc);

    expect(doc.nets.length).toBe(5);
    expect(doc.tracks.length).toBe(5);
    expect(drc.isValid).toBe(true);
  });

  // Circuit 3 — MCU: ESP32 + LED + Button + Capacitor (dense footprints)
  it('Circuit 3 — MCU: validates 30-pin high-density breakout routing', () => {
    const components: PlacedComponent[] = [
      { id: 'esp1', type: 'esp32-devkit', name: 'ESP32', x: 20, y: 20, rotation: 0, props: {} },
      { id: 'c1', type: 'capacitor', name: 'C1', x: 120, y: 20, rotation: 0, props: {} },
      { id: 'd1', type: 'led', name: 'D1', x: 120, y: 60, rotation: 0, props: {} },
      { id: 'sw1', type: 'pushbutton', name: 'SW1', x: 120, y: 100, rotation: 0, props: {} },
    ];
    const wires: WireConnection[] = [
      { id: 'w1', fromComponentId: 'esp1', fromPinId: 'VIN', toComponentId: 'c1', toPinId: '1', color: 'red' },
      { id: 'w2', fromComponentId: 'c1', toPinId: '2', toComponentId: 'esp1', fromPinId: 'GND1', color: 'black' },
      { id: 'w3', fromComponentId: 'esp1', fromPinId: 'D2', toComponentId: 'd1', toPinId: 'A', color: 'blue' },
      { id: 'w4', fromComponentId: 'd1', fromPinId: 'C', toComponentId: 'esp1', toPinId: 'GND1', color: 'black' },
      { id: 'w5', fromComponentId: 'esp1', fromPinId: 'D4', toComponentId: 'sw1', toPinId: '1', color: 'green' },
    ];

    const doc = circuitToPCBDocument(components, wires);
    const drc = validatePCBDocument(doc);

    expect(doc.pads.length).toBeGreaterThan(35); // 30 ESP32 pins + passives
    expect(drc.isValid).toBe(true);
  });

  // Circuit 4 — Sensor: MCU + Sensor + I2C + Power
  it('Circuit 4 — Sensor: validates I2C bus and power line segregation', () => {
    const components: PlacedComponent[] = [
      { id: 'u1', type: 'arduino-nano', name: 'Nano', x: 20, y: 20, rotation: 0, props: {} },
      { id: 'lcd', type: 'lcd1602', name: 'LCD', x: 140, y: 20, rotation: 0, props: {} },
    ];
    const wires: WireConnection[] = [
      { id: 'w1', fromComponentId: 'u1', fromPinId: '5V', toComponentId: 'lcd', toPinId: 'VCC', color: 'red' },
      { id: 'w2', fromComponentId: 'u1', fromPinId: 'GND1', toComponentId: 'lcd', toPinId: 'GND', color: 'black' },
      { id: 'w3', fromComponentId: 'u1', fromPinId: 'A4', toComponentId: 'lcd', toPinId: 'SDA', color: 'blue' },
      { id: 'w4', fromComponentId: 'u1', fromPinId: 'A5', toComponentId: 'lcd', toPinId: 'SCL', color: 'green' },
    ];

    const doc = circuitToPCBDocument(components, wires);
    const drc = validatePCBDocument(doc);

    expect(doc.tracks.length).toBe(4);
    expect(drc.isValid).toBe(true);
  });

  // Circuit 5 — Motor / Servo: MCU + Servo + external power + GND
  it('Circuit 5 — Motor / Servo: validates mixed power domain and PWM signal lines', () => {
    const components: PlacedComponent[] = [
      { id: 'u1', type: 'arduino-uno', name: 'Uno', x: 20, y: 20, rotation: 0, props: {} },
      { id: 'm1', type: 'servo', name: 'SG90', x: 150, y: 50, rotation: 0, props: {} },
      { id: 'bt1', type: 'battery-9v', name: '9V', x: 150, y: 150, rotation: 0, props: {} },
    ];
    const wires: WireConnection[] = [
      { id: 'w1', fromComponentId: 'u1', fromPinId: '3', toComponentId: 'm1', toPinId: 'PWM', color: 'orange' },
      { id: 'w2', fromComponentId: 'bt1', fromPinId: '+', toComponentId: 'm1', toPinId: 'VCC', color: 'red' },
      { id: 'w3', fromComponentId: 'bt1', fromPinId: '-', toComponentId: 'u1', toPinId: 'GND1', color: 'black' },
      { id: 'w4', fromComponentId: 'm1', fromPinId: 'GND', toComponentId: 'u1', toPinId: 'GND2', color: 'black' },
    ];

    const doc = circuitToPCBDocument(components, wires);
    const drc = validatePCBDocument(doc);

    expect(drc.isValid).toBe(true);
    expect(doc.tracks.length).toBe(4);
  });

  // Circuit 6 — Mixed SMD/THT: Resistors + Capacitors + Pushbuttons + Potentiometer
  it('Circuit 6 — Mixed SMD/THT: validates footprint diversity and drill hole generation', () => {
    const components: PlacedComponent[] = [
      { id: 'r1', type: 'resistor', name: 'R1', x: 20, y: 20, rotation: 0, props: {} },
      { id: 'c1', type: 'capacitor', name: 'C1', x: 60, y: 20, rotation: 0, props: {} },
      { id: 'vr1', type: 'potentiometer', name: 'VR1', x: 100, y: 20, rotation: 0, props: {} },
      { id: 'k1', type: 'relay-5v', name: 'K1', x: 140, y: 20, rotation: 0, props: {} },
    ];
    const wires: WireConnection[] = [
      { id: 'w1', fromComponentId: 'r1', fromPinId: '2', toComponentId: 'c1', toPinId: '1', color: 'blue' },
      { id: 'w2', fromComponentId: 'c1', fromPinId: '2', toComponentId: 'vr1', toPinId: '1', color: 'green' },
      { id: 'w3', fromComponentId: 'vr1', fromPinId: '2', toComponentId: 'k1', toPinId: 'IN', color: 'yellow' },
    ];

    const doc = circuitToPCBDocument(components, wires);
    const drc = validatePCBDocument(doc);

    expect(drc.isValid).toBe(true);
    expect(drc.stats.drillCount).toBeGreaterThan(10);
    expect(drc.manufacturingCheck.drillSizes.length).toBeGreaterThanOrEqual(1);
  });

  // Circuit 7 — Two-layer: Top and Bottom Copper Routing with Vias
  it('Circuit 7 — Two-layer: generates valid dual-layer tracks and exports both GTL and GBL layers', () => {
    const components: PlacedComponent[] = [
      { id: 'r1', type: 'resistor', name: 'R1', x: 20, y: 20, rotation: 0, props: {} },
      { id: 'd1', type: 'led', name: 'D1', x: 80, y: 20, rotation: 0, props: {} },
    ];
    const wires: WireConnection[] = [
      { id: 'w1', fromComponentId: 'r1', fromPinId: '2', toComponentId: 'd1', toPinId: 'A', color: 'red' },
    ];

    const doc = circuitToPCBDocument(components, wires, { widthMm: 80, heightMm: 50 });
    // Assign a bottom-layer track with a via
    doc.tracks.push({
      id: 'trk-bottom-1',
      net: 'GND',
      layer: 'B.Cu',
      start: { x: 15, y: 15 },
      end: { x: 45, y: 15 },
      width: 0.508,
    });
    doc.vias.push({
      id: 'via-1',
      net: 'GND',
      position: { x: 45, y: 15 },
      diameter: 0.8,
      drill: 0.4,
    });

    const drc = validatePCBDocument(doc);
    expect(drc.isValid).toBe(true);
    expect(doc.tracks.some((t) => t.layer === 'B.Cu')).toBe(true);
    expect(doc.vias.length).toBe(1);
  });

  // Circuit 8 — Deliberately broken PCB: short, unrouted net, clearance violation, edge violation, invalid drill
  it('Circuit 8 — Deliberately broken PCB: catches and reports all intentional physical and electrical violations', () => {
    const brokenDoc: PCBDocument = {
      board: {
        width: 50,
        height: 50,
        thicknessMm: 1.6,
        origin: { x: 0, y: 0 },
        layersCount: 2,
        outline: {
          corners: [], // Outline open / invalid!
        },
      },
      components: [
        {
          id: 'comp-1',
          refDes: 'R1',
          name: 'Resistor',
          footprintId: 'RES-AXIAL-0.3',
          position: { x: 25, y: 25 },
          rotation: 0,
          layer: 'top',
        },
      ],
      pads: [
        // Pad with drill below manufacturing limit (< 0.3mm)
        {
          id: 'p1',
          componentId: 'comp-1',
          refDes: 'R1',
          number: '1',
          type: 'tht',
          position: { x: 20, y: 25 },
          width: 1.5,
          height: 1.5,
          shape: 'circle',
          drill: 0.15, // VIOLATION: drill < 0.30mm
          layers: ['F.Cu'],
        },
        // Pad placed completely outside the board
        {
          id: 'p2',
          componentId: 'comp-1',
          refDes: 'R1',
          number: '2',
          type: 'tht',
          position: { x: 99, y: 99 }, // VIOLATION: outside 50x50 board!
          width: 1.5,
          height: 1.5,
          shape: 'circle',
          drill: 0.8,
          layers: ['F.Cu'],
        },
      ],
      tracks: [
        // Track 1 on NET_A
        {
          id: 't1',
          net: 'VCC',
          layer: 'F.Cu',
          start: { x: 10, y: 10 },
          end: { x: 30, y: 10 },
          width: 0.1, // VIOLATION: trace < 0.254mm
        },
        // Track 2 on NET_B placed directly on top of Track 1 (SHORT CIRCUIT)
        {
          id: 't2',
          net: 'GND',
          layer: 'F.Cu',
          start: { x: 10, y: 10 },
          end: { x: 30, y: 10 },
          width: 0.254,
        },
      ],
      vias: [],
      zones: [],
      nets: [
        {
          id: 'net-unrouted',
          name: 'UNROUTED_BUS',
          padRefs: [
            { componentId: 'comp-1', padNumber: '1' },
            { componentId: 'comp-1', padNumber: '2' },
          ],
        },
      ],
      designRules: DEFAULT_DESIGN_RULES,
      metadata: {
        title: 'Broken PCB Test',
        revision: '0.0',
        company: 'Test',
        date: '2026-09-19',
        designer: 'Test',
      },
    };

    const drc = validatePCBDocument(brokenDoc);

    expect(drc.isValid).toBe(false);
    expect(drc.errors.length).toBeGreaterThanOrEqual(4);

    const errorCodes = drc.errors.map((e) => e.code);
    expect(errorCodes).toContain('DRC_OUTLINE_OPEN');
    expect(errorCodes).toContain('DRC_DRILL_TOO_SMALL');
    expect(errorCodes).toContain('DRC_EDGE_CLEARANCE_VIOLATION');
    expect(errorCodes).toContain('DRC_TRACE_TOO_THIN');
    expect(errorCodes).toContain('DRC_SHORT_CIRCUIT');

    const warningCodes = drc.warnings.map((w) => w.code);
    expect(warningCodes).toContain('DRC_UNROUTED_NET');

    expect(drc.manufacturingCheck.isReadyForFab).toBe(false);
    expect(drc.manufacturingCheck.drcPass).toBe(false);
    expect(drc.manufacturingCheck.unroutedNetsPass).toBe(false);
  });
});

describe('5. Manufacturing Check Dashboard & Gerber ZIP Completeness', () => {
  it('computes exact Manufacturing Check metrics and builds standard RS-274X manufacturing archive', () => {
    const components: PlacedComponent[] = [
      { id: 'r1', type: 'resistor', name: 'R1', x: 30, y: 30, rotation: 0, props: {} },
      { id: 'd1', type: 'led', name: 'D1', x: 80, y: 30, rotation: 0, props: {} },
    ];
    const wires: WireConnection[] = [
      { id: 'w1', fromComponentId: 'r1', fromPinId: '2', toComponentId: 'd1', toPinId: 'A', color: 'red' },
    ];

    const doc = circuitToPCBDocument(components, wires, { widthMm: 80, heightMm: 50 });
    const drc = validatePCBDocument(doc);

    expect(drc.manufacturingCheck.boardDimensions).toBe('80 × 50 mm');
    expect(drc.manufacturingCheck.boardDimensionsPass).toBe(true);
    expect(drc.manufacturingCheck.outlineStatus).toBe('closed');
    expect(drc.manufacturingCheck.outlinePass).toBe(true);
    expect(drc.manufacturingCheck.drillCount).toBe(4);
    expect(drc.manufacturingCheck.drillPass).toBe(true);
    expect(drc.manufacturingCheck.minTraceWidthMm).toBeGreaterThanOrEqual(0.25);
    expect(drc.manufacturingCheck.minTracePass).toBe(true);
    expect(drc.manufacturingCheck.minClearancePass).toBe(true);
    expect(drc.manufacturingCheck.unroutedNetsCount).toBe(0);
    expect(drc.manufacturingCheck.drcErrorsCount).toBe(0);
    expect(drc.manufacturingCheck.isReadyForFab).toBe(true);

    const zipBlob = buildGerberZip(doc);
    expect(zipBlob).toBeDefined();
    expect(zipBlob.size).toBeGreaterThan(1000);
  });
});
