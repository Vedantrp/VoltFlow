/**
 * GerberGenerator.ts — Production RS-274X Gerber + Excellon Drill Exporter
 *
 * Integrated with the VoltFlow Studio generalized PCB Layout Engine:
 * - Separates Canvas Pixels -> Normalized -> Physical mm -> Gerber Integer
 * - Generates IPC-compliant Footprints and Pad Geometry
 * - Produces manufacturer-grade:
 *     circuit.GTL     — Top Copper (traces + pads)
 *     circuit.GBL     — Bottom Copper (through-holes / ground plane)
 *     circuit.GTO     — Top Silkscreen (component outlines + RefDes)
 *     circuit.GTS     — Top Solder Mask
 *     circuit.GKO     — Board Outline / Edge Cut
 *     circuit.DRL     — Excellon NC Drill file
 *     circuit.BOM.csv — Bill of Materials with Designators
 *     README.txt      — PCB Fabrication Guide
 */

import type { PlacedComponent, WireConnection } from '../types';
import { circuitToPCBDocument, validatePCBDocument } from '../pcb/pcbEngine';
import { buildGerberZip } from '../pcb/gerberExporter';
import type { PCBDocument, PCBValidationResult } from '../pcb/types';

export * from '../pcb/types';
export * from '../pcb/coordinates';
export * from '../pcb/footprints';
export * from '../pcb/pcbEngine';
export * from '../pcb/gerberExporter';

export interface GerberResult {
  zipBlob: Blob;
  boardWidthMm: number;
  boardHeightMm: number;
  padCount: number;
  traceCount: number;
  doc: PCBDocument;
  validation: PCBValidationResult;
}

/**
 * Generates an 8-file manufacturing-ready Gerber ZIP archive from arbitrary canvas components.
 */
export function generateGerberZip(
  components: PlacedComponent[],
  wires: WireConnection[],
  customBoardSize?: { widthMm: number; heightMm: number }
): GerberResult {
  const doc = circuitToPCBDocument(components, wires, customBoardSize);
  const validation = validatePCBDocument(doc);
  const zipBlob = buildGerberZip(doc);

  return {
    zipBlob,
    boardWidthMm: doc.board.width,
    boardHeightMm: doc.board.height,
    padCount: doc.pads.length,
    traceCount: doc.tracks.length,
    doc,
    validation,
  };
}
