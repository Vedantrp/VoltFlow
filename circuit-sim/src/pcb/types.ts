/**
 * src/pcb/types.ts
 *
 * Production-Grade PCB & EDA Document Model for VoltFlow Studio
 * Strict separation of UI Canvas Pixels, Physical Millimetres, and Gerber Coordinates.
 */

// ── 1. Coordinate Systems ───────────────────────────────────────────────────

export interface CanvasPoint {
  x: number; // UI canvas pixels
  y: number; // UI canvas pixels
}

export interface PCBPoint {
  x: number; // Physical board millimetres (mm)
  y: number; // Physical board millimetres (mm)
}

export interface GerberPoint {
  x: string; // Integer string in 10^6 format (FSLAX46Y46)
  y: string; // Integer string in 10^6 format (FSLAX46Y46)
}

// ── 2. Board Definition ─────────────────────────────────────────────────────

export interface BoardOutline {
  corners: PCBPoint[]; // Closed polygon in mm, origin (0, 0) at bottom-left
  cornerRadiusMm?: number;
}

export interface Board {
  width: number;       // Explicit physical width in mm
  height: number;      // Explicit physical height in mm
  thicknessMm: number; // Standard 1.6mm
  origin: PCBPoint;    // (0, 0) in mm
  outline: BoardOutline;
  layersCount: 2 | 4;  // 2-layer or 4-layer
}

// ── 3. Footprint Geometry System ────────────────────────────────────────────

export type PadType = 'tht' | 'smd';
export type PadShape = 'circle' | 'rect' | 'oval' | 'roundrect';

export class FootprintError extends Error {
  readonly missingComponents?: { id: string; name: string; type: string }[];

  constructor(message: string, missingComponents?: { id: string; name: string; type: string }[]) {
    super(message);
    this.name = 'FootprintError';
    this.missingComponents = missingComponents;
  }
}

export interface FootprintPad {
  number: string;      // "1", "2", "A", "C", "VCC", "GND", etc.
  name?: string;
  type: PadType;       // 'tht' | 'smd'
  x: number;           // mm relative to footprint geometric origin
  y: number;           // mm relative to footprint geometric origin
  width: number;       // pad copper width in mm
  height: number;      // pad copper height in mm
  shape: PadShape;
  drill?: number;      // drill hole diameter in mm (defined ONLY for 'tht')
  layers: ('F.Cu' | 'B.Cu' | 'F.Mask' | 'B.Mask' | 'All')[];
}

export interface MechanicalHole {
  x: number;           // mm relative to footprint origin
  y: number;           // mm
  diameter: number;    // mm
}

export interface SilkscreenLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  widthMm: number;
}

export interface SilkscreenRect {
  x: number;
  y: number;
  width: number;
  height: number;
  cornerRadiusMm?: number;
}

export interface SilkscreenText {
  text: string;
  x: number;
  y: number;
  sizeMm: number;
}

export interface Footprint {
  id: string;
  name: string;
  description: string;
  widthMm: number;
  heightMm: number;
  pads: FootprintPad[];
  holes?: MechanicalHole[];
  silkscreenLines?: SilkscreenLine[];
  silkscreenRects?: SilkscreenRect[];
  silkscreenTexts?: SilkscreenText[];
  courtyard?: { widthMm: number; heightMm: number };
  origin: PCBPoint;
}

// ── 4. Placed Components on PCB ─────────────────────────────────────────────

export interface PCBComponent {
  id: string;          // Maps to PlacedComponent.id
  refDes: string;      // R1, C1, U1, D1, J1, etc.
  name: string;        // Component display name
  footprintId: string;
  position: PCBPoint;  // mm relative to board origin (bottom-left)
  rotation: number;    // 0, 90, 180, 270 degrees
  layer: 'top' | 'bottom';
  value?: string;
  package?: string;
}

// ── 5. Pads & Tracks (Resolved Physical Geometry) ───────────────────────────

export interface Pad {
  id: string;          // "compId:padNumber"
  componentId: string;
  refDes: string;
  number: string;
  name?: string;
  type: PadType;       // 'tht' | 'smd'
  position: PCBPoint;  // Absolute board physical mm
  width: number;       // mm
  height: number;      // mm
  shape: PadShape;
  drill?: number;      // mm (defined ONLY for 'tht')
  layers: string[];
  net?: string;
}

export interface Track {
  id: string;
  net: string;
  layer: 'F.Cu' | 'B.Cu';
  start: PCBPoint;     // mm
  end: PCBPoint;       // mm
  width: number;       // mm (standard 0.254mm, power 0.508mm)
}

export interface Via {
  id: string;
  position: PCBPoint;  // mm
  diameter: number;    // standard 0.8mm
  drill: number;       // standard 0.4mm
  net: string;
}

export interface CopperZone {
  id: string;
  net: string;
  layer: 'F.Cu' | 'B.Cu';
  polygon: PCBPoint[]; // mm
}

export interface Net {
  id: string;
  name: string;
  padRefs: { componentId: string; padNumber: string }[];
  color?: string;
}

// ── 6. Design Rules & DRC ───────────────────────────────────────────────────

export interface DesignRules {
  minTraceWidthMm: number;   // 0.200 mm (~8 mil)
  minClearanceMm: number;    // 0.200 mm (~8 mil)
  minDrillMm: number;        // 0.300 mm (~12 mil)
  minAnnularRingMm: number;  // 0.150 mm (~6 mil)
  boardMarginMm: number;     // 3.0 mm
}

export interface PCBValidationError {
  code: string;
  severity: 'error' | 'warning';
  message: string;
  componentId?: string;
  location?: PCBPoint;
}

export interface ManufacturingCheck {
  boardDimensions: string;
  boardDimensionsPass: boolean;
  outlineStatus: string;
  outlinePass: boolean;
  drillCount: number;
  drillSizes: string[];
  drillPass: boolean;
  minTraceWidthMm: number;
  minTracePass: boolean;
  minClearanceMm: number;
  minClearancePass: boolean;
  unroutedNetsCount: number;
  unroutedNetsPass: boolean;
  drcErrorsCount: number;
  drcPass: boolean;
  isReadyForFab: boolean;
}

export interface PCBValidationResult {
  isValid: boolean;
  errors: PCBValidationError[];
  warnings: PCBValidationError[];
  stats: {
    componentCount: number;
    padCount: number;
    drillCount: number;
    trackCount: number;
    totalTrackLengthMm: number;
    boardAreaMm2: number;
    copperAreaPercent: number;
  };
  manufacturingCheck: ManufacturingCheck;
}

// ── 7. Top-Level PCB Document ───────────────────────────────────────────────

export interface PCBMetadata {
  title: string;
  revision: string;
  company: string;
  date: string;
  designer: string;
}

export interface PCBDocument {
  board: Board;
  components: PCBComponent[];
  pads: Pad[];
  vias: Via[];
  tracks: Track[];
  zones: CopperZone[];
  nets: Net[];
  designRules: DesignRules;
  metadata: PCBMetadata;
}
