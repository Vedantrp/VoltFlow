import type { ComponentDefinition } from './componentDefinition';
import { FOOTPRINTS, getFootprintForComponent } from '../pcb/footprints';
import { hasCustom2DRenderer } from '../components/rendering/ComponentRenderer';
import { BREADBOARD_DEFINITIONS } from './breadboardModel';

export interface ComponentValidationItem {
  id: string;
  name: string;
  shortModel: string;
  category: string;
  hasVisual: boolean;
  visualKey: string;
  hasDimensions: boolean;
  widthMm: number;
  heightMm: number;
  pinCount: number;
  footprintKey: string;
  hasFootprint: boolean;
  footprintType: 'THT' | 'SMD' | 'HYBRID' | 'PROTOTYPING_GRID' | 'MISSING';
  missingFields: string[];
  status: 'VALID' | 'INVALID';
}

export interface LibraryValidationReport {
  totalComponents: number;
  validCount: number;
  invalidCount: number;
  allValid: boolean;
  items: ComponentValidationItem[];
  generatedAt: string;
}

/**
 * Validates a single component definition against the physical-first standard
 */
export function validateComponent(comp: ComponentDefinition): ComponentValidationItem {
  const missing: string[] = [];
  const isBreadboard = comp.type.startsWith('breadboard-') && comp.type !== 'breadboard-power-supply';

  // 1. Visual asset check
  const visualKey = comp.visual?.renderKey || comp.type;
  const hasVisual = Boolean(
    isBreadboard ||
    hasCustom2DRenderer(comp.type) ||
    comp.wokwiTag ||
    comp.visual?.renderKey
  );
  if (!hasVisual) missing.push('Visual Asset');

  // 2. Physical Dimensions check
  const widthMm = comp.dimensions?.widthMm ?? (comp.width ? comp.width / 3.7795 : 0);
  const heightMm = comp.dimensions?.heightMm ?? (comp.height ? comp.height / 3.7795 : 0);
  const hasDimensions = widthMm > 0 && heightMm > 0;
  if (!hasDimensions) missing.push('Physical Dimensions (mm)');

  // 3. Pin Definitions check
  const pinCount = comp.pins?.length ?? 0;
  if (pinCount === 0 && !isBreadboard) {
    missing.push('Pin Definitions');
  }

  // 4. Footprint check
  let footprintDef = comp.footprintDef;
  if (!footprintDef && comp.footprint && FOOTPRINTS[comp.footprint]) {
    footprintDef = FOOTPRINTS[comp.footprint];
  }
  if (!footprintDef) {
    footprintDef = getFootprintForComponent(comp.type) || (comp.footprint ? getFootprintForComponent(comp.footprint) : null) || undefined;
  }

  const hasFootprint = Boolean(
    isBreadboard ? BREADBOARD_DEFINITIONS[comp.type] : (footprintDef && footprintDef.pads && footprintDef.pads.length > 0)
  );

  const fpKey = isBreadboard
    ? `BREADBOARD-${comp.type.replace('breadboard-', '').toUpperCase()}`
    : (footprintDef?.id || comp.footprint || 'MISSING');

  if (!hasFootprint) missing.push(`Footprint [${fpKey}]`);

  // 5. Determine THT vs SMD pad type
  let footprintType: 'THT' | 'SMD' | 'HYBRID' | 'PROTOTYPING_GRID' | 'MISSING' = 'MISSING';
  if (isBreadboard) {
    footprintType = 'PROTOTYPING_GRID';
  } else if (hasFootprint && footprintDef) {
    const hasTht = footprintDef.pads.some((p) => p.type === 'tht' || (p.drill && p.drill > 0));
    const hasSmd = footprintDef.pads.some((p) => p.type === 'smd' || !p.drill || p.drill === 0);
    if (hasTht && hasSmd) footprintType = 'HYBRID';
    else if (hasTht) footprintType = 'THT';
    else if (hasSmd) footprintType = 'SMD';
  }

  const isValid = missing.length === 0;

  return {
    id: comp.type,
    name: comp.metadata?.name || comp.name || comp.type,
    shortModel: comp.metadata?.shortModel || comp.name || comp.type,
    category: comp.metadata?.category || comp.category || 'General',
    hasVisual,
    visualKey,
    hasDimensions,
    widthMm: Math.round(widthMm * 10) / 10,
    heightMm: Math.round(heightMm * 10) / 10,
    pinCount,
    footprintKey: fpKey,
    hasFootprint,
    footprintType,
    missingFields: missing,
    status: isValid ? 'VALID' : 'INVALID',
  };
}

/**
 * Validates the entire component catalog and returns an exhaustive diagnostics report
 */
export function validateCatalog(catalog: ComponentDefinition[]): LibraryValidationReport {
  const items = catalog.map((comp) => validateComponent(comp));
  const validCount = items.filter((i) => i.status === 'VALID').length;
  const invalidCount = items.length - validCount;

  return {
    totalComponents: catalog.length,
    validCount,
    invalidCount,
    allValid: invalidCount === 0,
    items,
    generatedAt: new Date().toISOString(),
  };
}
