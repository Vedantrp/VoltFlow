import type { Footprint } from '../pcb/types';

/**
 * ── Standard VoltFlow Component Categories ────────────────────────────────────
 */
export type StandardCategory =
  | 'Microcontrollers'
  | 'Sensors'
  | 'Actuators'
  | 'Displays'
  | 'Communication'
  | 'Input'
  | 'Passive'
  | 'Power'
  | 'Prototyping';

export const STANDARD_CATEGORIES: StandardCategory[] = [
  'Microcontrollers',
  'Sensors',
  'Actuators',
  'Displays',
  'Communication',
  'Input',
  'Passive',
  'Power',
  'Prototyping',
];

/**
 * Electrical pin classifications
 */
export type PinType =
  | 'power'
  | 'ground'
  | 'digital'
  | 'analog'
  | 'pwm'
  | 'uart'
  | 'i2c'
  | 'spi'
  | 'passive'
  | 'bidirectional';

export type PinDirection = 'in' | 'out' | 'inout' | 'passive';

/**
 * Authoritative Pin Definition with physical millimeter coordinates
 */
export interface PinDefinition {
  id: string;
  name: string;
  label?: string;
  /** Physical X coordinate relative to component top-left origin (in mm) */
  xMm: number;
  /** Physical Y coordinate relative to component top-left origin (in mm) */
  yMm: number;
  type: PinType;
  direction?: PinDirection;
  voltage?: number;
  description?: string;
  /** Primary mounting side */
  side?: 'left' | 'right' | 'top' | 'bottom';
  /** Breadboard terminal bank pairing index if applicable */
  index?: number;
}

/**
 * Physical Dimensions (in millimeters)
 */
export interface PhysicalDimensions {
  /** Width in mm (along X axis at 0 deg) */
  widthMm: number;
  /** Height in mm (along Y axis at 0 deg) */
  heightMm: number;
  /** Component body thickness/height off board in mm (optional) */
  thicknessMm?: number;
  /** Courtyard clearance margin around body in mm (default 0.25mm) */
  courtyardMarginMm?: number;
}

/**
 * Visual Definition for 2.5D Physical Rendering
 */
export interface VisualDefinition {
  /** Unique rendering key recognized by ComponentRenderer */
  renderKey: string;
  /** Aspect ratio width/height */
  aspectRatio: number;
  /** Base body primary color or theme */
  baseColor?: string;
  /** Package aesthetic classification */
  packageStyle: 'tht-dip' | 'module-pcb' | 'radial' | 'axial' | 'smd' | 'panel-mount' | 'chassis';
}

/**
 * Metadata & Catalog Classification
 */
export interface ComponentMetadata {
  /** Full descriptive title */
  name: string;
  /** Short IC / model name (e.g. ATmega328P, BC417, ESP8266, DHT11) */
  shortModel: string;
  /** Primary category */
  category: StandardCategory;
  /** Detailed component function summary */
  description: string;
  /** Manufacturer or reference designator */
  manufacturer?: string;
  /** Datasheet reference URL */
  datasheet?: string;
  /** Search keywords and tags */
  tags: string[];
  /** Estimated unit cost in USD */
  estimatedCost: number;
}

/**
 * Rendering Style tokens for consistent lighting and 2.5D depth
 */
export interface RenderingStyle {
  depthMm: number;
  shadowBlur: number;
  lightingAngleDeg: number;
  metallicFinish: 'silver-nickel' | 'gold-immersion' | 'tinned-copper' | 'matte-black';
}

/**
 * ── Master Component Definition ────────────────────────────────────────────────
 * The single source of truth connecting Visuals, Pins, Footprints, Physics & Metadata
 */
export interface ComponentDefinition {
  /** Unique component type identifier e.g. 'arduino-uno' */
  type: string;
  metadata: ComponentMetadata;
  dimensions: PhysicalDimensions;
  pins: PinDefinition[];
  visual: VisualDefinition;
  footprint: string; // Key in IPC footprint library
  footprintDef?: Footprint;
  style?: RenderingStyle;
  defaultProps?: Record<string, any>;
  wokwiTag?: string;

  // Backward-compatibility bridge accessors:
  name: string;
  category: StandardCategory;
  description: string;
  width: number;  // Screen pixel width at 1x
  height: number; // Screen pixel height at 1x
  estimatedCost: number;
}
