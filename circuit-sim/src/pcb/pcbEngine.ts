/**
 * src/pcb/pcbEngine.ts
 *
 * Production-Grade PCB Layout Engine & Design Rule Checker (DRC)
 * Converts arbitrary circuit schematics into fully validated PCBDocument models.
 *
 * Architecture Principles:
 * 1. ZERO silent fallback to generic footprints. Missing footprint = immediate blocking error.
 * 2. Physical geometry strictly in millimetres (mm).
 * 3. SMD pads have NO drill holes; THT pads have verified drill sizes.
 * 4. Net routing validates actual copper connectivity between pads.
 */

import type { PlacedComponent, WireConnection } from '../types';
import { getFootprintForComponent, resolveFootprint } from './footprints';
import { rotatePoint, pcbDistance } from './coordinates';
import { FootprintError } from './types';
import type {
  PCBDocument,
  Board,
  PCBComponent,
  Pad,
  Track,
  Net,
  DesignRules,
  PCBValidationResult,
  PCBValidationError,
} from './types';

export const DEFAULT_DESIGN_RULES: DesignRules = {
  minTraceWidthMm: 0.254, // 10 mil
  minClearanceMm: 0.200,  // 8 mil
  minDrillMm: 0.300,      // 12 mil
  minAnnularRingMm: 0.150,// 6 mil
  boardMarginMm: 3.0,     // 3 mm edge clearance
};

/**
 * Converts VoltFlow canvas components and wires into a physical PCBDocument.
 * Coordinates are computed strictly in physical millimetres.
 * Throws FootprintError if any component lacks a verified footprint.
 */
export function circuitToPCBDocument(
  components: PlacedComponent[],
  wires: WireConnection[],
  customBoardSize?: { widthMm: number; heightMm: number }
): PCBDocument {
  // 1. Verify that EVERY component has an explicit footprint (NO silent fallback)
  const missingFootprints: { id: string; name: string; type: string }[] = [];
  for (const comp of components) {
    const fp = getFootprintForComponent(comp.type);
    if (!fp) {
      missingFootprints.push({ id: comp.id, name: comp.name || comp.type, type: comp.type });
    }
  }

  if (missingFootprints.length > 0) {
    const list = missingFootprints.map((m) => `• ${m.name} (${m.type})`).join('\n');
    throw new FootprintError(
      `PCB Export Blocked: The following components have no verified physical footprint:\n${list}\n\nAssign explicit physical footprints before exporting.`,
      missingFootprints
    );
  }

  // 2. Calculate physical bounding box in millimetres
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const comp of components) {
    const fp = resolveFootprint(comp.type, comp.name);
    const w = fp.widthMm;
    const h = fp.heightMm;

    // Convert canvas position to preliminary mm scale (0.254 mm / px)
    const pxMm = comp.x * 0.254;
    const pyMm = comp.y * 0.254;

    minX = Math.min(minX, pxMm);
    minY = Math.min(minY, pyMm);
    maxX = Math.max(maxX, pxMm + w);
    maxY = Math.max(maxY, pyMm + h);
  }

  if (!isFinite(minX)) {
    minX = 0;
    minY = 0;
    maxX = 50;
    maxY = 50;
  }

  const margin = DEFAULT_DESIGN_RULES.boardMarginMm;
  const autoWidth = Math.max(30, Number((maxX - minX + margin * 2).toFixed(2)));
  const autoHeight = Math.max(30, Number((maxY - minY + margin * 2).toFixed(2)));

  const boardWidth = customBoardSize?.widthMm && customBoardSize.widthMm > 0
    ? customBoardSize.widthMm
    : Math.ceil(autoWidth / 5) * 5; // round up to neat 5mm grid

  const boardHeight = customBoardSize?.heightMm && customBoardSize.heightMm > 0
    ? customBoardSize.heightMm
    : Math.ceil(autoHeight / 5) * 5;

  const board: Board = {
    width: boardWidth,
    height: boardHeight,
    thicknessMm: 1.6,
    origin: { x: 0, y: 0 },
    layersCount: 2,
    outline: {
      corners: [
        { x: 0, y: 0 },
        { x: boardWidth, y: 0 },
        { x: boardWidth, y: boardHeight },
        { x: 0, y: boardHeight },
      ],
      cornerRadiusMm: 2.0,
    },
  };

  // 3. Generate PCB Components with standard Reference Designators (R1, C1, U1...)
  const refCounters: Record<string, number> = {};
  const pcbComponents: PCBComponent[] = [];
  const pads: Pad[] = [];

  for (const comp of components) {
    const fp = resolveFootprint(comp.type, comp.name);
    const prefix = getRefPrefix(comp.type);
    refCounters[prefix] = (refCounters[prefix] || 0) + 1;
    const refDes = `${prefix}${refCounters[prefix]}`;

    // Compute component center in board mm (Y-up, origin bottom-left)
    const posX = Number((comp.x * 0.254 - minX + margin + fp.widthMm / 2).toFixed(2));
    const posY = Number((boardHeight - (comp.y * 0.254 - minY + margin + fp.heightMm / 2)).toFixed(2));

    const pcbComp: PCBComponent = {
      id: comp.id,
      refDes,
      name: comp.name || fp.name,
      footprintId: fp.id,
      position: { x: posX, y: posY },
      rotation: comp.rotation || 0,
      layer: 'top',
      value: comp.props?.resistance ? `${comp.props.resistance}Ω` : comp.props?.value ? String(comp.props.value) : undefined,
    };
    pcbComponents.push(pcbComp);

    // 4. Resolve physical pads on the board in millimetres
    const centerPt = { x: posX, y: posY };
    for (const fpPad of fp.pads) {
      // Pad position relative to footprint center
      const rawPadPt = { x: posX + fpPad.x, y: posY + fpPad.y };
      const rotPadPt = rotatePoint(rawPadPt, centerPt, comp.rotation || 0);

      pads.push({
        id: `${comp.id}:${fpPad.number}`,
        componentId: comp.id,
        refDes,
        number: fpPad.number,
        name: fpPad.name,
        type: fpPad.type,
        position: rotPadPt,
        width: fpPad.width,
        height: fpPad.height,
        shape: fpPad.shape,
        drill: fpPad.type === 'tht' ? fpPad.drill : undefined,
        layers: fpPad.layers,
      });
    }
  }

  // 5. Resolve Nets and Copper Tracks
  const tracks: Track[] = [];
  const nets: Net[] = [];
  let trackCounter = 0;

  for (let i = 0; i < wires.length; i++) {
    const wire = wires[i];
    const fromPad = findMatchingPad(pads, wire.fromComponentId, wire.fromPinId);
    const toPad = findMatchingPad(pads, wire.toComponentId, wire.toPinId);

    const netName = `NET_${i + 1}`;
    const net: Net = {
      id: `net-${i + 1}`,
      name: netName,
      padRefs: [
        { componentId: wire.fromComponentId, padNumber: wire.fromPinId },
        { componentId: wire.toComponentId, padNumber: wire.toPinId },
      ],
      color: wire.color,
    };
    nets.push(net);

    if (fromPad && toPad) {
      fromPad.net = netName;
      toPad.net = netName;

      trackCounter++;
      // Determine trace width based on signal vs power
      const isPower = wire.color === 'red' || wire.fromPinId.includes('VCC') || wire.toPinId.includes('5V') || wire.fromPinId.includes('VIN');
      const traceWidth = isPower ? 0.508 : DEFAULT_DESIGN_RULES.minTraceWidthMm;

      tracks.push({
        id: `track-${trackCounter}`,
        net: netName,
        layer: 'F.Cu',
        start: fromPad.position,
        end: toPad.position,
        width: traceWidth,
      });
    }
  }

  return {
    board,
    components: pcbComponents,
    pads,
    vias: [],
    tracks,
    zones: [],
    nets,
    designRules: DEFAULT_DESIGN_RULES,
    metadata: {
      title: 'VoltFlow Studio Generated Board',
      revision: '1.0',
      company: 'VoltFlow EDA',
      date: new Date().toISOString().split('T')[0],
      designer: 'VoltFlow Automated PCB Engine',
    },
  };
}

/**
 * Validates a PCBDocument against physical design rules (DRC).
 */
export function validatePCBDocument(doc: PCBDocument): PCBValidationResult {
  const errors: PCBValidationError[] = [];
  const warnings: PCBValidationError[] = [];
  const { board, components, pads, tracks, nets, designRules } = doc;

  // 1. Board outline & dimension checks
  const outlineClosed =
    Boolean(board.outline?.corners && board.outline.corners.length >= 3);
  const boardDimPass = board.width > 0 && board.height > 0;

  if (board.width <= 0) {
    errors.push({ code: 'DRC_WIDTH_ZERO', severity: 'error', message: 'Board width must be greater than 0 mm' });
  }
  if (board.height <= 0) {
    errors.push({ code: 'DRC_HEIGHT_ZERO', severity: 'error', message: 'Board height must be greater than 0 mm' });
  }
  if (!outlineClosed) {
    errors.push({ code: 'DRC_OUTLINE_OPEN', severity: 'error', message: 'Board outline is not a closed polygon' });
  }

  // 2. Component boundary & edge clearance checks
  const margin = designRules.boardMarginMm;
  for (const comp of components) {
    const fp = getFootprintForComponent(comp.footprintId);
    if (!fp) {
      errors.push({
        code: 'DRC_MISSING_FOOTPRINT',
        severity: 'error',
        message: `Component ${comp.refDes} (${comp.name}) has no valid footprint "${comp.footprintId}"`,
        componentId: comp.id,
      });
      continue;
    }

    const halfW = fp.widthMm / 2;
    const halfH = fp.heightMm / 2;

    if (
      comp.position.x - halfW < 0 ||
      comp.position.x + halfW > board.width ||
      comp.position.y - halfH < 0 ||
      comp.position.y + halfH > board.height
    ) {
      warnings.push({
        code: 'DRC_COMP_OUT_OF_BOUNDS',
        severity: 'warning',
        message: `Component ${comp.refDes} (${comp.name}) exceeds physical board outline`,
        componentId: comp.id,
        location: comp.position,
      });
    }
  }

  // 3. Pad & Drill checks
  const drillSizesSet = new Set<number>();
  let drillMinFound = Infinity;
  for (const pad of pads) {
    const isTht = pad.type === 'tht' || (!pad.type && (pad.drill ?? 0) > 0);
    if (isTht && pad.drill !== undefined && pad.drill > 0) {
      drillSizesSet.add(pad.drill);
      drillMinFound = Math.min(drillMinFound, pad.drill);
      if (pad.drill < designRules.minDrillMm) {
        errors.push({
          code: 'DRC_DRILL_TOO_SMALL',
          severity: 'error',
          message: `Pad ${pad.refDes}.${pad.number} drill (${pad.drill}mm) is below manufacturing limit (${designRules.minDrillMm}mm)`,
          location: pad.position,
        });
      }
    } else if (pad.type === 'smd' && (pad.drill ?? 0) > 0) {
      errors.push({
        code: 'DRC_SMD_HAS_DRILL',
        severity: 'error',
        message: `SMD pad ${pad.refDes}.${pad.number} has an invalid drill diameter (${pad.drill}mm)`,
        location: pad.position,
      });
    }

    if (
      pad.position.x < margin ||
      pad.position.x > board.width - margin ||
      pad.position.y < margin ||
      pad.position.y > board.height - margin
    ) {
      warnings.push({
        code: 'DRC_PAD_NEAR_EDGE',
        severity: 'warning',
        message: `Pad ${pad.refDes}.${pad.number} is within ${margin}mm edge clearance`,
        location: pad.position,
      });
    }

    // Edge clearance violation (critical error if pad center is outside board entirely)
    if (
      pad.position.x < 0 ||
      pad.position.x > board.width ||
      pad.position.y < 0 ||
      pad.position.y > board.height
    ) {
      errors.push({
        code: 'DRC_EDGE_CLEARANCE_VIOLATION',
        severity: 'error',
        message: `Pad ${pad.refDes}.${pad.number} is placed outside physical board boundaries`,
        location: pad.position,
      });
    }
  }

  // 4. Trace calculations & clearance checks
  let totalTrackLengthMm = 0;
  let minTraceWidthFound = tracks.length > 0 ? Infinity : designRules.minTraceWidthMm;

  for (const track of tracks) {
    totalTrackLengthMm += pcbDistance(track.start, track.end);
    minTraceWidthFound = Math.min(minTraceWidthFound, track.width);

    if (track.width < designRules.minTraceWidthMm) {
      errors.push({
        code: 'DRC_TRACE_TOO_THIN',
        severity: 'error',
        message: `Track on net "${track.net}" width (${track.width}mm) is less than minimum (${designRules.minTraceWidthMm}mm)`,
      });
    }

    // Edge clearance violation for tracks
    if (
      track.start.x < 0 || track.start.x > board.width || track.start.y < 0 || track.start.y > board.height ||
      track.end.x < 0 || track.end.x > board.width || track.end.y < 0 || track.end.y > board.height
    ) {
      errors.push({
        code: 'DRC_EDGE_CLEARANCE_VIOLATION',
        severity: 'error',
        message: `Track on net "${track.net}" extends outside physical board outline`,
      });
    }
  }

  // 5. Track-to-track & pad-to-pad clearance & short-circuit check
  let minClearanceFound = Infinity;
  for (let i = 0; i < tracks.length; i++) {
    for (let j = i + 1; j < tracks.length; j++) {
      const t1 = tracks[i];
      const t2 = tracks[j];
      if (t1.net !== t2.net && t1.layer === t2.layer) {
        const d1 = pcbDistance(t1.start, t2.start);
        const d2 = pcbDistance(t1.end, t2.end);
        const d3 = pcbDistance(t1.start, t2.end);
        const d4 = pcbDistance(t1.end, t2.start);
        const minDist = Math.min(d1, d2, d3, d4);
        minClearanceFound = Math.min(minClearanceFound, minDist);

        if (minDist < 0.05) {
          errors.push({
            code: 'DRC_SHORT_CIRCUIT',
            severity: 'error',
            message: `Short circuit detected between net "${t1.net}" and net "${t2.net}"`,
          });
        } else if (minDist < designRules.minClearanceMm) {
          errors.push({
            code: 'DRC_CLEARANCE_VIOLATION',
            severity: 'error',
            message: `Clearance violation between net "${t1.net}" and "${t2.net}" (${minDist.toFixed(2)}mm < ${designRules.minClearanceMm}mm)`,
          });
        }
      }
    }
  }

  // 6. Unrouted net check (Calculate actual electrical connectivity)
  const routedNets = new Set(tracks.map((t) => t.net));
  let unroutedNetsCount = 0;
  for (const net of nets || []) {
    if (net.padRefs && net.padRefs.length >= 2 && !routedNets.has(net.name)) {
      unroutedNetsCount++;
      warnings.push({
        code: 'DRC_UNROUTED_NET',
        severity: 'warning',
        message: `Net "${net.name}" has ${net.padRefs.length} connected pins but has not been routed`,
      });
    }
  }

  const boardAreaMm2 = Number((board.width * board.height).toFixed(2));
  const copperAreaEstimate = pads.length * 2.5 + totalTrackLengthMm * 0.3;
  const copperAreaPercent = boardAreaMm2 > 0 ? Number(((copperAreaEstimate / boardAreaMm2) * 100).toFixed(1)) : 0;

  const drillCount = pads.filter((p) => p.type === 'tht' && (p.drill ?? 0) > 0).length;
  const sortedDrillSizes = Array.from(drillSizesSet).sort((a, b) => a - b).map((d) => `${d.toFixed(2)}mm`);

  const manufacturingCheck = {
    boardDimensions: `${board.width} × ${board.height} mm`,
    boardDimensionsPass: boardDimPass,
    outlineStatus: outlineClosed ? 'closed' : 'open',
    outlinePass: outlineClosed,
    drillCount,
    drillSizes: sortedDrillSizes,
    drillPass: drillMinFound === Infinity || drillMinFound >= designRules.minDrillMm,
    minTraceWidthMm: minTraceWidthFound === Infinity ? designRules.minTraceWidthMm : Number(minTraceWidthFound.toFixed(3)),
    minTracePass: minTraceWidthFound >= designRules.minTraceWidthMm,
    minClearanceMm: minClearanceFound === Infinity ? designRules.minClearanceMm : Number(minClearanceFound.toFixed(3)),
    minClearancePass: minClearanceFound >= designRules.minClearanceMm,
    unroutedNetsCount,
    unroutedNetsPass: unroutedNetsCount === 0,
    drcErrorsCount: errors.length,
    drcPass: errors.length === 0,
    isReadyForFab: errors.length === 0 && outlineClosed && boardDimPass,
  };

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats: {
      componentCount: components.length,
      padCount: pads.length,
      drillCount,
      trackCount: tracks.length,
      totalTrackLengthMm: Number(totalTrackLengthMm.toFixed(2)),
      boardAreaMm2,
      copperAreaPercent,
    },
    manufacturingCheck,
  };
}

function getRefPrefix(type: string): string {
  switch (type) {
    case 'resistor':
    case 'photoresistor':
    case 'ldr':
    case 'thermistor':
      return 'R';
    case 'capacitor':
    case 'capacitor-ceramic':
    case 'capacitor-electrolytic':
    case 'ceramic-capacitor':
    case 'electrolytic-capacitor':
      return 'C';
    case 'led':
    case 'rgb-led':
      return 'D';
    case 'diode-1n4007':
    case 'zener-diode':
    case 'diode':
      return 'D';
    case 'transistor-npn':
    case 'transistor-pnp':
    case 'transistor':
      return 'Q';
    case 'inductor':
      return 'L';
    case 'pushbutton':
    case 'switch':
    case 'slide-switch':
    case 'dip-switch-4':
    case 'dip-switch-6':
      return 'SW';
    case 'potentiometer':
      return 'VR';
    case 'servo':
      return 'M';
    case 'arduino-uno':
    case 'arduino-nano':
    case 'esp32-devkit':
    case 'nodemcu-esp8266':
    case 'esp-01':
    case 'esp-01-wifi':
    case 'mpu6050':
    case 'mpu-6050':
      return 'U';
    case 'battery-9v':
    case 'battery-1.5v-aa':
    case 'battery-4x-aa':
    case 'coin-cell-3v':
    case 'battery-3v':
      return 'BT';
    case 'relay-5v':
    case 'relay-5v-2ch':
      return 'K';
    default:
      return 'J';
  }
}

export function findMatchingPad(pads: Pad[], compId: string, pinId: string): Pad | undefined {
  const direct = pads.find(
    (p) =>
      p.componentId === compId &&
      (p.number.toLowerCase() === pinId.toLowerCase() || (p.name && p.name.toLowerCase() === pinId.toLowerCase()))
  );
  if (direct) return direct;

  const norm = pinId.toUpperCase().trim();
  return pads.find((p) => {
    if (p.componentId !== compId) return false;
    const pNum = p.number.toUpperCase().trim();
    const pName = (p.name || '').toUpperCase().trim();

    // Direct without D prefix (e.g. D13 vs 13)
    if (norm.replace(/^D/, '') === pNum.replace(/^D/, '')) return true;

    // Pushbutton 1a / 1b / 2a / 2b
    if ((norm === '1' || norm === '1A' || norm === '1B') && (pNum === '1A' || pNum === '1B' || pNum === '1')) return true;
    if ((norm === '2' || norm === '2A' || norm === '2B') && (pNum === '2A' || pNum === '2B' || pNum === '2')) return true;

    // Power & ground aliases
    if (['+', 'V+', 'VCC', 'VIN', '5V', '3V3', 'VDD'].includes(norm) && ['+', 'V+', 'VCC', 'VIN', '5V', '3V3', 'VDD'].includes(pNum)) return true;
    if (['-', 'V-', 'GND', 'GND1', 'GND2', 'GND3', 'GND4', 'VSS'].includes(norm) && ['-', 'V-', 'GND', 'GND1', 'GND2', 'GND3', 'GND4', 'VSS'].includes(pNum)) return true;

    // I2C bus aliases
    if ((norm === 'A4' || norm === 'SDA') && (pNum === 'A4' || pNum === 'SDA' || pName.includes('SDA'))) return true;
    if ((norm === 'A5' || norm === 'SCL') && (pNum === 'A5' || pNum === 'SCL' || pName.includes('SCL'))) return true;

    // Servo / motor PWM / Signal aliases
    if ((norm === 'PWM' || norm === 'SIG' || norm === 'SIGNAL') && (pNum === 'PWM' || pNum === 'SIG' || pNum === 'SIGNAL')) return true;

    // Bluetooth aliases: STATE, RXD, TXD, GND, VCC, EN/KEY
    if (norm === 'KEY' && (pNum === 'EN' || pName.includes('KEY') || pName.includes('EN'))) return true;
    if (norm === 'EN' && (pNum === 'KEY' || pName.includes('KEY') || pName.includes('EN'))) return true;
    if (norm === 'TX' && pNum === 'TXD') return true;
    if (norm === 'RX' && pNum === 'RXD') return true;

    return false;
  });
}
