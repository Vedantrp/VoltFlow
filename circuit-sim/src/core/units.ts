/**
 * ── VoltFlow Physical Coordinate & Units Engine ────────────────────────────────
 * All physical electronics dimensions are stored in millimetres (mm).
 * Standard breadboard/PCB pitch is 0.1 inch = 2.54 mm.
 *
 * Canvas rendering converts:
 *   PCB/Component mm -> Screen pixels
 * and NEVER:
 *   Screen pixels -> Physical mm (loss of physical truth)
 */

/**
 * Authoritative scale factor: 1 mm = 3.7795275591 screen pixels at 100% (96 DPI / 25.4 mm/in)
 * For high precision CAD rendering in VoltFlow, we define:
 */
export const MM_TO_PX_RATIO = 3.779528; // ~3.78 px per mm (standard 96 DPI CSS pixel mapping)

/** Standard electronics grid pitches */
export const PITCH_0_1_INCH_MM = 2.54;   // 100 mil (standard breadboard & THT pin pitch)
export const PITCH_0_05_INCH_MM = 1.27;  // 50 mil (SOIC / fine pitch)
export const PITCH_2MM = 2.00;           // 2.0 mm (XBee / compact headers)

/** Convert physical millimeters to canvas screen pixels */
export function mmToPx(mm: number, zoom = 1): number {
  return mm * MM_TO_PX_RATIO * zoom;
}

/** Convert canvas screen pixels to physical millimeters */
export function pxToMm(px: number, zoom = 1): number {
  return px / (MM_TO_PX_RATIO * zoom);
}

/** Snap a physical millimeter coordinate to the nearest grid step */
export function snapToPhysicalGrid(valueMm: number, gridPitchMm = PITCH_0_1_INCH_MM): number {
  return Math.round(valueMm / gridPitchMm) * gridPitchMm;
}

/** Snap a 2D millimeter point to the physical grid */
export function snapPointToPhysicalGrid(
  pointMm: { x: number; y: number },
  gridPitchMm = PITCH_0_1_INCH_MM
): { x: number; y: number } {
  return {
    x: snapToPhysicalGrid(pointMm.x, gridPitchMm),
    y: snapToPhysicalGrid(pointMm.y, gridPitchMm),
  };
}

/** Calculate euclidean distance in millimeters */
export function distanceMm(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}
