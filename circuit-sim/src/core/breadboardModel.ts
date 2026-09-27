import { PITCH_0_1_INCH_MM, distanceMm } from './units';
import type { PinDefinition } from './componentDefinition';

export type BreadboardHoleType = 'terminal' | 'power-positive' | 'power-negative';

export interface BreadboardHole {
  id: string;
  row: string;      // 'a'..'j' for terminal strips, '+' or '-' for power rails
  column: number;   // 1..N
  xMm: number;      // Physical X in mm relative to breadboard origin
  yMm: number;      // Physical Y in mm relative to breadboard origin
  groupId: string;  // Unique electrical connectivity node ID
  type: BreadboardHoleType;
  section?: number; // Rail section index for split rails
}

export interface ConnectivityGroup {
  id: string;
  type: 'terminal' | 'power-positive' | 'power-negative';
  holeIds: string[];
}

export interface PowerRail {
  id: string;
  polarity: 'positive' | 'negative';
  side: 'top' | 'bottom';
  section: number;
  holeIds: string[];
}

export interface BreadboardDefinition {
  id: string;
  name: string;
  variant: 'breadboard-mini' | 'breadboard-half' | 'breadboard-full';
  physicalWidthMm: number;
  physicalHeightMm: number;
  gridPitchMm: number;
  centerGapMm: number;
  holes: BreadboardHole[];
  connectivityGroups: ConnectivityGroup[];
  powerRails: PowerRail[];
}

/**
 * ── 1. Mini Breadboard (170 Tie Points) ────────────────────────────────────────
 * 17 columns x 2 banks of 5 rows (A..E and F..J).
 * No power rails. Center divider trough separates top and bottom banks.
 */
export function createMiniBreadboardDefinition(): BreadboardDefinition {
  const holes: BreadboardHole[] = [];
  const groupsMap: Record<string, ConnectivityGroup> = {};
  const pitch = PITCH_0_1_INCH_MM; // 2.54 mm

  const startX = 6.0; // mm margin from left edge
  const topStartY = 4.8; // mm
  const botStartY = 18.0; // mm (after central trough)

  const topRows = ['a', 'b', 'c', 'd', 'e'];
  const botRows = ['f', 'g', 'h', 'i', 'j'];

  for (let col = 1; col <= 17; col++) {
    const xMm = startX + (col - 1) * pitch;

    // Top bank A..E (all 5 holes in column share electrical node)
    const topGroupId = `mini_grp_top_${col}`;
    groupsMap[topGroupId] = { id: topGroupId, type: 'terminal', holeIds: [] };

    topRows.forEach((row, rIdx) => {
      const yMm = topStartY + rIdx * pitch;
      const holeId = `hole_${row}_${col}`;
      holes.push({
        id: holeId,
        row,
        column: col,
        xMm: Math.round(xMm * 100) / 100,
        yMm: Math.round(yMm * 100) / 100,
        groupId: topGroupId,
        type: 'terminal',
      });
      groupsMap[topGroupId].holeIds.push(holeId);
    });

    // Bottom bank F..J (all 5 holes in column share electrical node)
    const botGroupId = `mini_grp_bot_${col}`;
    groupsMap[botGroupId] = { id: botGroupId, type: 'terminal', holeIds: [] };

    botRows.forEach((row, rIdx) => {
      const yMm = botStartY + rIdx * pitch;
      const holeId = `hole_${row}_${col}`;
      holes.push({
        id: holeId,
        row,
        column: col,
        xMm: Math.round(xMm * 100) / 100,
        yMm: Math.round(yMm * 100) / 100,
        groupId: botGroupId,
        type: 'terminal',
      });
      groupsMap[botGroupId].holeIds.push(holeId);
    });
  }

  return {
    id: 'breadboard-mini',
    name: 'Mini Solderless Breadboard (170 Tie Points)',
    variant: 'breadboard-mini',
    physicalWidthMm: 53.0,
    physicalHeightMm: 32.0,
    gridPitchMm: pitch,
    centerGapMm: 7.62, // 3 x 2.54mm DIP package stride
    holes,
    connectivityGroups: Object.values(groupsMap),
    powerRails: [],
  };
}

/**
 * ── 2. Half-Size Breadboard (400 Tie Points) ───────────────────────────────────
 * 30 columns x 2 banks of 5 rows (A..E, F..J) + Top & Bottom Power Rails (+, -).
 */
export function createHalfBreadboardDefinition(): BreadboardDefinition {
  const holes: BreadboardHole[] = [];
  const groupsMap: Record<string, ConnectivityGroup> = {};
  const powerRails: PowerRail[] = [];
  const pitch = PITCH_0_1_INCH_MM;

  const startX = 8.0;
  const topPosRailY = 3.8;
  const topNegRailY = 7.4;
  const bankAY = 11.2;
  const bankFY = 26.5; // Center divider trough separation
  const botPosRailY = 40.2;
  const botNegRailY = 43.8;

  // 4 Continuous Power Rails
  const topPosGroupId = 'rail_top_pos';
  const topNegGroupId = 'rail_top_neg';
  const botPosGroupId = 'rail_bot_pos';
  const botNegGroupId = 'rail_bot_neg';

  groupsMap[topPosGroupId] = { id: topPosGroupId, type: 'power-positive', holeIds: [] };
  groupsMap[topNegGroupId] = { id: topNegGroupId, type: 'power-negative', holeIds: [] };
  groupsMap[botPosGroupId] = { id: botPosGroupId, type: 'power-positive', holeIds: [] };
  groupsMap[botNegGroupId] = { id: botNegGroupId, type: 'power-negative', holeIds: [] };

  powerRails.push(
    { id: 'top_pos', polarity: 'positive', side: 'top', section: 1, holeIds: groupsMap[topPosGroupId].holeIds },
    { id: 'top_neg', polarity: 'negative', side: 'top', section: 1, holeIds: groupsMap[topNegGroupId].holeIds },
    { id: 'bot_pos', polarity: 'positive', side: 'bottom', section: 1, holeIds: groupsMap[botPosGroupId].holeIds },
    { id: 'bot_neg', polarity: 'negative', side: 'bottom', section: 1, holeIds: groupsMap[botNegGroupId].holeIds }
  );

  const topRows = ['a', 'b', 'c', 'd', 'e'];
  const botRows = ['f', 'g', 'h', 'i', 'j'];

  for (let col = 1; col <= 30; col++) {
    const xMm = startX + (col - 1) * pitch;

    // Top power rails
    const hTopPos = `hole_top_pos_${col}`;
    holes.push({ id: hTopPos, row: '+', column: col, xMm, yMm: topPosRailY, groupId: topPosGroupId, type: 'power-positive' });
    groupsMap[topPosGroupId].holeIds.push(hTopPos);

    const hTopNeg = `hole_top_neg_${col}`;
    holes.push({ id: hTopNeg, row: '-', column: col, xMm, yMm: topNegRailY, groupId: topNegGroupId, type: 'power-negative' });
    groupsMap[topNegGroupId].holeIds.push(hTopNeg);

    // Terminal bank A..E
    const topGroupId = `half_grp_top_${col}`;
    groupsMap[topGroupId] = { id: topGroupId, type: 'terminal', holeIds: [] };
    topRows.forEach((row, rIdx) => {
      const yMm = bankAY + rIdx * pitch;
      const hId = `hole_${row}_${col}`;
      holes.push({ id: hId, row, column: col, xMm, yMm, groupId: topGroupId, type: 'terminal' });
      groupsMap[topGroupId].holeIds.push(hId);
    });

    // Terminal bank F..J
    const botGroupId = `half_grp_bot_${col}`;
    groupsMap[botGroupId] = { id: botGroupId, type: 'terminal', holeIds: [] };
    botRows.forEach((row, rIdx) => {
      const yMm = bankFY + rIdx * pitch;
      const hId = `hole_${row}_${col}`;
      holes.push({ id: hId, row, column: col, xMm, yMm, groupId: botGroupId, type: 'terminal' });
      groupsMap[botGroupId].holeIds.push(hId);
    });

    // Bottom power rails
    const hBotPos = `hole_bot_pos_${col}`;
    holes.push({ id: hBotPos, row: '+', column: col, xMm, yMm: botPosRailY, groupId: botPosGroupId, type: 'power-positive' });
    groupsMap[botPosGroupId].holeIds.push(hBotPos);

    const hBotNeg = `hole_bot_neg_${col}`;
    holes.push({ id: hBotNeg, row: '-', column: col, xMm, yMm: botNegRailY, groupId: botNegGroupId, type: 'power-negative' });
    groupsMap[botNegGroupId].holeIds.push(hBotNeg);
  }

  return {
    id: 'breadboard-half',
    name: 'Half-Size Breadboard (400 Tie Points)',
    variant: 'breadboard-half',
    physicalWidthMm: 90.0,
    physicalHeightMm: 48.0,
    gridPitchMm: pitch,
    centerGapMm: 7.62,
    holes,
    connectivityGroups: Object.values(groupsMap),
    powerRails,
  };
}

/**
 * ── 3. Full-Size Breadboard (830 Tie Points with Split Rails) ─────────────────
 * 63 columns x 2 banks + split power rails (col 1..30 = Section 1, col 31..63 = Section 2).
 */
export function createFullBreadboardDefinition(): BreadboardDefinition {
  const holes: BreadboardHole[] = [];
  const groupsMap: Record<string, ConnectivityGroup> = {};
  const powerRails: PowerRail[] = [];
  const pitch = PITCH_0_1_INCH_MM;

  const startX = 8.0;
  const topPosRailY = 3.8;
  const topNegRailY = 7.4;
  const bankAY = 11.2;
  const bankFY = 26.5;
  const botPosRailY = 40.2;
  const botNegRailY = 43.8;

  // Split rails: Sec 1 (cols 1..30), Sec 2 (cols 31..63)
  for (const sec of [1, 2]) {
    const tPos = `full_rail_top_pos_s${sec}`;
    const tNeg = `full_rail_top_neg_s${sec}`;
    const bPos = `full_rail_bot_pos_s${sec}`;
    const bNeg = `full_rail_bot_neg_s${sec}`;

    groupsMap[tPos] = { id: tPos, type: 'power-positive', holeIds: [] };
    groupsMap[tNeg] = { id: tNeg, type: 'power-negative', holeIds: [] };
    groupsMap[bPos] = { id: bPos, type: 'power-positive', holeIds: [] };
    groupsMap[bNeg] = { id: bNeg, type: 'power-negative', holeIds: [] };

    powerRails.push(
      { id: `top_pos_s${sec}`, polarity: 'positive', side: 'top', section: sec, holeIds: groupsMap[tPos].holeIds },
      { id: `top_neg_s${sec}`, polarity: 'negative', side: 'top', section: sec, holeIds: groupsMap[tNeg].holeIds },
      { id: `bot_pos_s${sec}`, polarity: 'positive', side: 'bottom', section: sec, holeIds: groupsMap[bPos].holeIds },
      { id: `bot_neg_s${sec}`, polarity: 'negative', side: 'bottom', section: sec, holeIds: groupsMap[bNeg].holeIds }
    );
  }

  const topRows = ['a', 'b', 'c', 'd', 'e'];
  const botRows = ['f', 'g', 'h', 'i', 'j'];

  for (let col = 1; col <= 63; col++) {
    const xMm = startX + (col - 1) * pitch;
    const sec = col <= 30 ? 1 : 2;

    const tPos = `full_rail_top_pos_s${sec}`;
    const tNeg = `full_rail_top_neg_s${sec}`;
    const bPos = `full_rail_bot_pos_s${sec}`;
    const bNeg = `full_rail_bot_neg_s${sec}`;

    // Top rails
    const hTopPos = `hole_top_pos_${col}`;
    holes.push({ id: hTopPos, row: '+', column: col, xMm, yMm: topPosRailY, groupId: tPos, type: 'power-positive', section: sec });
    groupsMap[tPos].holeIds.push(hTopPos);

    const hTopNeg = `hole_top_neg_${col}`;
    holes.push({ id: hTopNeg, row: '-', column: col, xMm, yMm: topNegRailY, groupId: tNeg, type: 'power-negative', section: sec });
    groupsMap[tNeg].holeIds.push(hTopNeg);

    // Terminal bank A..E
    const topGroupId = `full_grp_top_${col}`;
    groupsMap[topGroupId] = { id: topGroupId, type: 'terminal', holeIds: [] };
    topRows.forEach((row, rIdx) => {
      const yMm = bankAY + rIdx * pitch;
      const hId = `hole_${row}_${col}`;
      holes.push({ id: hId, row, column: col, xMm, yMm, groupId: topGroupId, type: 'terminal' });
      groupsMap[topGroupId].holeIds.push(hId);
    });

    // Terminal bank F..J
    const botGroupId = `full_grp_bot_${col}`;
    groupsMap[botGroupId] = { id: botGroupId, type: 'terminal', holeIds: [] };
    botRows.forEach((row, rIdx) => {
      const yMm = bankFY + rIdx * pitch;
      const hId = `hole_${row}_${col}`;
      holes.push({ id: hId, row, column: col, xMm, yMm, groupId: botGroupId, type: 'terminal' });
      groupsMap[botGroupId].holeIds.push(hId);
    });

    // Bottom rails
    const hBotPos = `hole_bot_pos_${col}`;
    holes.push({ id: hBotPos, row: '+', column: col, xMm, yMm: botPosRailY, groupId: bPos, type: 'power-positive', section: sec });
    groupsMap[bPos].holeIds.push(hBotPos);

    const hBotNeg = `hole_bot_neg_${col}`;
    holes.push({ id: hBotNeg, row: '-', column: col, xMm, yMm: botNegRailY, groupId: bNeg, type: 'power-negative', section: sec });
    groupsMap[bNeg].holeIds.push(hBotNeg);
  }

  return {
    id: 'breadboard-full',
    name: 'Full-Size Breadboard (830 Tie Points)',
    variant: 'breadboard-full',
    physicalWidthMm: 175.0,
    physicalHeightMm: 48.0,
    gridPitchMm: pitch,
    centerGapMm: 7.62,
    holes,
    connectivityGroups: Object.values(groupsMap),
    powerRails,
  };
}

export const BREADBOARD_DEFINITIONS: Record<string, BreadboardDefinition> = {
  'breadboard-mini': createMiniBreadboardDefinition(),
  'breadboard-half': createHalfBreadboardDefinition(),
  'breadboard-full': createFullBreadboardDefinition(),
};

/**
 * ── 4. Rigid Multi-Pin Component Snapping Engine ──────────────────────────────
 * Ensures that when placing a multi-pin component (DIP IC, Arduino, Sensor, Resistor):
 * 1. The component moves as a rigid object.
 * 2. Pin positions are rotated accurately according to component rotation (0, 90, 180, 270).
 * 3. Finds anchor hole for primary pin, tests if ALL remaining pins land on valid breadboard holes.
 * 4. Rejects invalid geometries (e.g. pins straddling non-existent holes or conflicting terminal groups).
 */
export interface SnapResult {
  canSnap: boolean;
  snappedPositionMm: { x: number; y: number };
  snappedHoleMap: Record<string, BreadboardHole>; // pinId -> BreadboardHole
  candidateHoles: BreadboardHole[];
  invalidPinIds: string[];
}

export function computeRotatedPinOffset(
  pin: PinDefinition,
  rotationDeg: number
): { x: number; y: number } {
  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: pin.xMm * cos - pin.yMm * sin,
    y: pin.xMm * sin + pin.yMm * cos,
  };
}

export function snapComponentToBreadboard(
  pins: PinDefinition[],
  componentPosMm: { x: number; y: number },
  rotationDeg: number,
  breadboardDef: BreadboardDefinition,
  breadboardOriginMm: { x: number; y: number },
  snapThresholdMm = 4.0
): SnapResult {
  if (pins.length === 0) {
    return {
      canSnap: false,
      snappedPositionMm: componentPosMm,
      snappedHoleMap: {},
      candidateHoles: [],
      invalidPinIds: [],
    };
  }

  // Primary anchor pin is typically pin 0 (e.g. Pin 1 or VCC)
  const primaryPin = pins[0];
  const primaryOffset = computeRotatedPinOffset(primaryPin, rotationDeg);
  const primaryGlobalMm = {
    x: componentPosMm.x + primaryOffset.x,
    y: componentPosMm.y + primaryOffset.y,
  };

  // Find nearest breadboard hole to the primary pin
  let nearestHole: BreadboardHole | null = null;
  let minDistance = Infinity;

  for (const hole of breadboardDef.holes) {
    const holeGlobalMm = {
      x: breadboardOriginMm.x + hole.xMm,
      y: breadboardOriginMm.y + hole.yMm,
    };
    const d = distanceMm(primaryGlobalMm, holeGlobalMm);
    if (d < minDistance && d <= snapThresholdMm) {
      minDistance = d;
      nearestHole = hole;
    }
  }

  if (!nearestHole) {
    return {
      canSnap: false,
      snappedPositionMm: componentPosMm,
      snappedHoleMap: {},
      candidateHoles: [],
      invalidPinIds: [],
    };
  }

  // Compute rigid snapped component position
  const targetHoleGlobal = {
    x: breadboardOriginMm.x + nearestHole.xMm,
    y: breadboardOriginMm.y + nearestHole.yMm,
  };

  const candidateComponentPosMm = {
    x: targetHoleGlobal.x - primaryOffset.x,
    y: targetHoleGlobal.y - primaryOffset.y,
  };

  // Test every pin to ensure all pins land on a valid hole
  const holeToleranceMm = 1.0;
  const snappedHoleMap: Record<string, BreadboardHole> = {};
  const candidateHoles: BreadboardHole[] = [];
  const invalidPinIds: string[] = [];

  for (const pin of pins) {
    const pinOffset = computeRotatedPinOffset(pin, rotationDeg);
    const pinGlobalMm = {
      x: candidateComponentPosMm.x + pinOffset.x,
      y: candidateComponentPosMm.y + pinOffset.y,
    };

    // Find hole matching this pin coordinate
    let matchedHole: BreadboardHole | null = null;
    for (const hole of breadboardDef.holes) {
      const holeGlobal = {
        x: breadboardOriginMm.x + hole.xMm,
        y: breadboardOriginMm.y + hole.yMm,
      };
      if (distanceMm(pinGlobalMm, holeGlobal) <= holeToleranceMm) {
        matchedHole = hole;
        break;
      }
    }

    if (matchedHole) {
      snappedHoleMap[pin.id] = matchedHole;
      candidateHoles.push(matchedHole);
    } else {
      invalidPinIds.push(pin.id);
    }
  }

  const allSnapped = invalidPinIds.length === 0;

  return {
    canSnap: allSnapped,
    snappedPositionMm: allSnapped ? candidateComponentPosMm : componentPosMm,
    snappedHoleMap,
    candidateHoles,
    invalidPinIds,
  };
}

/**
 * Get all holes that share an electrical group with a given hole ID
 */
export function getConnectedHoles(
  holeId: string,
  breadboardDef: BreadboardDefinition
): BreadboardHole[] {
  const targetHole = breadboardDef.holes.find((h) => h.id === holeId);
  if (!targetHole) return [];
  return breadboardDef.holes.filter((h) => h.groupId === targetHole.groupId);
}
