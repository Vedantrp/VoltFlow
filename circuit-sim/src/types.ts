export type ComponentCategory =
  | 'Microcontrollers'
  | 'Sensors'
  | 'Actuators'
  | 'Displays'
  | 'Communication'
  | 'Input'
  | 'Passive'
  | 'Power'
  | 'Prototyping'
  | 'General'
  | 'Output'
  | 'Basic'
  | 'All'
  | 'Starters: Arduino'
  | 'Power & Relays';

export type TinkercadWireColor =
  | 'red'
  | 'black'
  | 'green'
  | 'blue'
  | 'yellow'
  | 'orange'
  | 'white'
  | 'brown'
  | 'purple';

export type WireType = 'normal' | 'hookup' | 'alligator' | 'orthogonal';

export type PinElectricalType =
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

export interface ComponentPin {
  id: string;
  name: string;
  label?: string;
  x: number; // local relative X coordinate
  y: number; // local relative Y coordinate
  position?: { x: number; y: number };
  type?: 'power' | 'ground' | 'digital' | 'analog' | 'passive' | PinElectricalType;
  electricalType?: PinElectricalType;
  direction?: PinDirection;
  voltage?: number;
  side?: 'left' | 'right' | 'top' | 'bottom';
  index?: number;
  description?: string;
}

export interface ComponentDefinition {
  type: string;
  name: string;
  category: ComponentCategory;
  description: string;
  wokwiTag?: string;
  defaultProps?: Record<string, any>;
  pins: ComponentPin[];
  width: number;
  height: number;
  color?: string;
  estimatedCost: number; // USD
  footprint: string;
  metadata?: {
    shortModel?: string;
    manufacturer?: string;
    mpn?: string;
    datasheetUrl?: string;
    mountingType?: 'THT' | 'SMD' | 'CHASSIS' | 'MODULE';
    tags?: string[];
  };
  dimensions?: {
    widthMm: number;
    heightMm: number;
    depthMm?: number;
    weightGrams?: number;
  };
  visual?: {
    asset2D?: string;
    asset3D?: string;
    thumbnail?: string;
    layer?: string;
  };
}

export interface PlacedComponent {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  rotation: number; // 0, 90, 180, 270 degrees
  props: Record<string, any>;
  state?: Record<string, any>; // runtime state e.g. { ledOn: true, value: 5 }
}

export interface WireConnection {
  id: string;
  fromComponentId: string;
  fromPinId: string;
  toComponentId: string;
  toPinId: string;
  color: TinkercadWireColor;
  wireType?: WireType;
  waypoints?: { x: number; y: number }[];
  voltage?: number;
  current?: number;
}

export interface InstrumentState {
  oscilloscope: {
    enabled: boolean;
    channelA: string | null;
    channelB: string | null;
    timeBaseMs: number;
    voltageScale: number;
    paused: boolean;
  };
  multimeter: {
    enabled: boolean;
    mode: 'V' | 'A' | 'R';
    probeRed: string | null;
    probeBlack: string | null;
    value: number;
  };
  functionGenerator: {
    enabled: boolean;
    waveform: 'sine' | 'square' | 'triangle';
    frequencyHz: number;
    amplitudeV: number;
  };
  logicAnalyzer: {
    enabled: boolean;
    channels: string[];
    traces: Record<string, boolean[]>;
  };
}

export interface BOMItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  footprint: string;
  unitCost: number;
  totalCost: number;
}

export interface AIPromptExample {
  title: string;
  prompt: string;
  description: string;
  components: PlacedComponent[];
  wires: WireConnection[];
  code: string;
  explanation: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  phoneNumber?: string;
  displayName: string;
  photoURL?: string;
  authProvider: 'email' | 'google' | 'phone';
  role?: 'admin' | 'user';
  createdAt: number;
}

export interface SavedProject {
  id: string;
  userId: string;
  name: string;
  updatedAt: number;
  createdAt: number;
  components: PlacedComponent[];
  wires: WireConnection[];
  code: string;
  circuitName?: string;
  thumbnail?: string;
}

