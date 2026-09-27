/**
 * src/pcb/coordinates.ts
 *
 * Central Coordinate Transformation Engine:
 *   UI Canvas Coordinates (Pixels, Y-down, origin top-left)
 *            ↓
 *   Normalized Design Coordinates
 *            ↓
 *   PCB Physical Coordinates (Millimetres, Y-up, origin bottom-left of board)
 *            ↓
 *   Gerber Coordinates (Integer × 10^6, FSLAX46Y46 format)
 */

import type { CanvasPoint, PCBPoint, GerberPoint } from './types';

export const DEFAULT_SCALE_MM_PER_PX = 0.254; // 1 pixel = 10 mils = 0.254 mm
export const GERBER_DECIMAL_FACTOR = 1_000_000; // FSLAX46 format multiplier

/**
 * Converts a UI canvas pixel point to physical board millimetres.
 * Flips the Y axis so (0,0) is at the physical board bottom-left.
 */
export function canvasToPCB(
  canvasPt: CanvasPoint,
  boardOriginCanvasPx: CanvasPoint,
  boardHeightCanvasPx: number,
  scaleMmPerPx: number = DEFAULT_SCALE_MM_PER_PX
): PCBPoint {
  const relX = canvasPt.x - boardOriginCanvasPx.x;
  const relY = canvasPt.y - boardOriginCanvasPx.y;
  return {
    x: Number((relX * scaleMmPerPx).toFixed(4)),
    y: Number(((boardHeightCanvasPx - relY) * scaleMmPerPx).toFixed(4)), // Flip Y
  };
}

/**
 * Converts physical board millimetres back to UI canvas pixels.
 */
export function pcbToCanvas(
  pcbPt: PCBPoint,
  boardOriginCanvasPx: CanvasPoint,
  boardHeightCanvasPx: number,
  scaleMmPerPx: number = DEFAULT_SCALE_MM_PER_PX
): CanvasPoint {
  const relX = pcbPt.x / scaleMmPerPx;
  const relY = boardHeightCanvasPx - (pcbPt.y / scaleMmPerPx);
  return {
    x: Math.round(boardOriginCanvasPx.x + relX),
    y: Math.round(boardOriginCanvasPx.y + relY),
  };
}

/**
 * Converts physical board millimetres to RS-274X Gerber integer coordinate string.
 * Format: %FSLAX46Y46*%, representing mm * 10^6.
 */
export function mmToGerberCoord(mm: number): string {
  return Math.round(mm * GERBER_DECIMAL_FACTOR).toString();
}

/**
 * Formats a PCBPoint into a Gerber coordinate pair.
 */
export function pcbToGerber(pt: PCBPoint): GerberPoint {
  return {
    x: mmToGerberCoord(pt.x),
    y: mmToGerberCoord(pt.y),
  };
}

/**
 * Rotates a 2D point around an origin by angle in degrees.
 */
export function rotatePoint(
  point: PCBPoint,
  origin: PCBPoint,
  angleDeg: number
): PCBPoint {
  if (angleDeg === 0) return { ...point };
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = point.x - origin.x;
  const dy = point.y - origin.y;
  return {
    x: Number((origin.x + (dx * cos - dy * sin)).toFixed(4)),
    y: Number((origin.y + (dx * sin + dy * cos)).toFixed(4)),
  };
}

/**
 * Euclidean distance between two PCB points in millimetres.
 */
export function pcbDistance(p1: PCBPoint, p2: PCBPoint): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}
