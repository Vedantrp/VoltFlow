import { describe, it, expect } from 'vitest';
import { canvasToPCB, pcbToCanvas, mmToGerberCoord, rotatePoint } from '../coordinates';
import { getFootprintForComponent, FOOTPRINT_LIBRARY } from '../footprints';
import { circuitToPCBDocument, validatePCBDocument } from '../pcbEngine';
import {
  exportGerberTopCopper,
  exportGerberBoardOutline,
  exportExcellonDrill,
  exportFabReadme,
  buildGerberZip,
} from '../gerberExporter';
import type { PlacedComponent, WireConnection } from '../../types';

describe('PCB Engine — Coordinate System & Transforms', () => {
  it('converts canvas pixels to physical board millimetres with flipped Y', () => {
    const originPx = { x: 100, y: 100 };
    const boardHeightPx = 200;
    const canvasPt = { x: 150, y: 250 };

    const pcbPt = canvasToPCB(canvasPt, originPx, boardHeightPx, 0.254);
    // relX = 50 -> 50 * 0.254 = 12.7 mm
    expect(pcbPt.x).toBe(12.7);
    // relY = 150 -> (200 - 150) * 0.254 = 12.7 mm
    expect(pcbPt.y).toBe(12.7);

    const backToCanvas = pcbToCanvas(pcbPt, originPx, boardHeightPx, 0.254);
    expect(backToCanvas.x).toBe(150);
    expect(backToCanvas.y).toBe(250);
  });

  it('formats physical millimetres into RS-274X 10^6 integer coordinates', () => {
    expect(mmToGerberCoord(10.5)).toBe('10500000');
    expect(mmToGerberCoord(0.254)).toBe('254000');
    expect(mmToGerberCoord(0)).toBe('0');
  });

  it('correctly rotates physical pads by 90 degrees around center', () => {
    const origin = { x: 10, y: 10 };
    const pad = { x: 15, y: 10 }; // 5mm right
    const rot90 = rotatePoint(pad, origin, 90);
    expect(rot90.x).toBeCloseTo(10, 2);
    expect(rot90.y).toBeCloseTo(15, 2);
  });
});

describe('PCB Engine — Real Physical Footprints', () => {
  it('retrieves IPC standard footprints for basic components', () => {
    const resFp = getFootprintForComponent('resistor')!;
    expect(resFp.id).toBe('RES-AXIAL-0.3');
    expect(resFp.pads.length).toBe(2);
    expect(resFp.pads[0].drill).toBe(0.8);

    const ledFp = getFootprintForComponent('led')!;
    expect(ledFp.id).toBe('LED-5MM');
    expect(ledFp.pads.find((p) => p.number === 'C')?.shape).toBe('rect'); // Square cathode

    const swFp = getFootprintForComponent('pushbutton')!;
    expect(swFp.id).toBe('SW-PB-6MM');
    expect(swFp.pads.length).toBe(4);
  });

  it('retrieves accurate 30-pin footprints for ESP32 and NodeMCU boards', () => {
    const esp32Fp = getFootprintForComponent('esp32-devkit')!;
    expect(esp32Fp.id).toBe('MODULE-ESP32-DEVKIT');
    expect(esp32Fp.pads.length).toBe(30);

    const nodeFp = getFootprintForComponent('nodemcu-esp8266')!;
    expect(nodeFp.id).toBe('MODULE-NODEMCU');
    expect(nodeFp.pads.length).toBe(30);
  });
});

describe('PCB Engine — Document Model & DRC Validation', () => {
  const sampleComponents: PlacedComponent[] = [
    { id: 'uno-1', type: 'arduino-uno', name: 'Arduino Uno', x: 50, y: 50, rotation: 0, props: {} },
    { id: 'res-1', type: 'resistor', name: 'Resistor 220', x: 250, y: 80, rotation: 0, props: { resistance: 220 } },
    { id: 'led-1', type: 'led', name: 'LED Red', x: 300, y: 80, rotation: 0, props: {} },
  ];

  const sampleWires: WireConnection[] = [
    { id: 'w1', fromComponentId: 'uno-1', fromPinId: '13', toComponentId: 'res-1', toPinId: '1', color: 'green' },
    { id: 'w2', fromComponentId: 'res-1', fromPinId: '2', toComponentId: 'led-1', toPinId: 'A', color: 'red' },
    { id: 'w3', fromComponentId: 'led-1', fromPinId: 'C', toComponentId: 'uno-1', toPinId: 'GND1', color: 'black' },
  ];

  it('converts an arbitrary circuit into a physical PCBDocument in mm', () => {
    const doc = circuitToPCBDocument(sampleComponents, sampleWires);

    expect(doc.board.width).toBeGreaterThan(50);
    expect(doc.board.height).toBeGreaterThan(30);
    expect(doc.components.length).toBe(3);
    expect(doc.pads.length).toBeGreaterThan(30); // Uno + resistor + LED pads
    expect(doc.tracks.length).toBe(3);
    expect(doc.nets.length).toBe(3);
  });

  it('allows setting explicit physical board dimensions (e.g. 100mm x 80mm)', () => {
    const doc = circuitToPCBDocument(sampleComponents, sampleWires, { widthMm: 100, heightMm: 80 });

    expect(doc.board.width).toBe(100);
    expect(doc.board.height).toBe(80);
    expect(doc.board.outline.corners[1].x).toBe(100);
    expect(doc.board.outline.corners[2].y).toBe(80);
  });

  it('passes DRC validation for standard layout', () => {
    const doc = circuitToPCBDocument(sampleComponents, sampleWires);
    const drc = validatePCBDocument(doc);

    expect(drc.isValid).toBe(true);
    expect(drc.errors.length).toBe(0);
    expect(drc.stats.componentCount).toBe(3);
    expect(drc.stats.trackCount).toBe(3);
    expect(drc.stats.totalTrackLengthMm).toBeGreaterThan(0);
  });
});

describe('PCB Engine — RS-274X Gerber & Drill Generation', () => {
  const sampleComponents: PlacedComponent[] = [
    { id: 'r1', type: 'resistor', name: 'R1', x: 20, y: 20, rotation: 0, props: {} },
    { id: 'd1', type: 'led', name: 'D1', x: 60, y: 20, rotation: 0, props: {} },
  ];
  const sampleWires: WireConnection[] = [
    { id: 'w1', fromComponentId: 'r1', fromPinId: '2', toComponentId: 'd1', toPinId: 'A', color: 'red' },
  ];

  it('exports valid RS-274X GTL copper top file', () => {
    const doc = circuitToPCBDocument(sampleComponents, sampleWires);
    const gtl = exportGerberTopCopper(doc);

    expect(gtl).toContain('%FSLAX46Y46*%');
    expect(gtl).toContain('%MOMM*%');
    expect(gtl).toContain('G01*');
    expect(gtl).toContain('M02*');
  });

  it('exports valid Excellon DRL drill file with tools and hits', () => {
    const doc = circuitToPCBDocument(sampleComponents, sampleWires);
    const drl = exportExcellonDrill(doc);

    expect(drl).toContain('M48');
    expect(drl).toContain('METRIC,TZ');
    expect(drl).toContain('T1');
    expect(drl).toContain('M30');
  });

  it('exports valid RS-274X GKO board outline and README', () => {
    const doc = circuitToPCBDocument(sampleComponents, sampleWires);
    const gko = exportGerberBoardOutline(doc);
    const readme = exportFabReadme(doc);

    expect(gko).toContain('G04 Layer: Board Outline (GKO / Edge.Cuts)*');
    expect(gko).toContain('%FSLAX46Y46*%');
    expect(readme).toContain('VOLTFLOW STUDIO — PCB FABRICATION GUIDE');
    expect(Object.keys(FOOTPRINT_LIBRARY).length).toBeGreaterThan(5);
  });

  it('produces a multi-file manufacturing ZIP package', () => {
    const doc = circuitToPCBDocument(sampleComponents, sampleWires);
    const zipBlob = buildGerberZip(doc);

    expect(zipBlob).toBeDefined();
    expect(zipBlob.size).toBeGreaterThan(500);
    expect(zipBlob.type).toBe('application/zip');
  });
});
