import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize, Eye, EyeOff } from 'lucide-react';
import type { PlacedComponent, WireConnection, TinkercadWireColor } from '../types';
import { COMPONENT_CATALOG } from '../catalog';
import { WokwiElement } from './WokwiElement';
import { Breadboard2D } from './Breadboard2D';
import { useCircuitStore } from '../store/useCircuitStore';
import { checkPinCompatibility, type PinCompatibilityResult } from '../sim/pinUtils';
import { ComponentRenderer, hasCustom2DRenderer } from './rendering/ComponentRenderer';
import { pxToMm, mmToPx } from '../core/units';
import { BREADBOARD_DEFINITIONS, snapComponentToBreadboard, type SnapResult } from '../core/breadboardModel';
import { isTypingInInput } from '../utils/keyboardUtils';

interface Workspace2DProps {
  components: PlacedComponent[];
  wires: WireConnection[];
  selectedId: string | null;
  selectedWireId: string | null;
  onSelectComponent: (id: string | null) => void;
  onSelectWire: (id: string | null) => void;
  onMoveComponent: (id: string, x: number, y: number) => void;
  onRotateComponent: (id: string) => void;
  onDeleteComponent: (id: string) => void;
  onDeleteWire: (id: string) => void;
  onDuplicateComponent?: (id: string) => void;
  wiringStartPin: { componentId: string; pinId: string } | null;
  onPinClick: (componentId: string, pinId: string) => void;
  isRunning: boolean;
  wireColor?: TinkercadWireColor;
  setWireColor?: (color: TinkercadWireColor) => void;
  cancelWiring?: () => void;
}

const WIRE_COLOR_MAP: Record<TinkercadWireColor, string> = {
  green: '#10b981',
  black: '#1e293b',
  red: '#ef4444',
  blue: '#3b82f6',
  yellow: '#eab308',
  orange: '#f97316',
  white: '#ffffff',
  brown: '#78350f',
  purple: '#a855f7',
};

/** Generate smooth, organic flexible curved SVG path between two points */
function getFlexibleWirePath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);

  // Natural wire slack / bend curve based on terminal distance
  const slack = Math.min(65, Math.max(15, dist * 0.22));

  const cp1x = x1 + dx * 0.25;
  const cp1y = y1 + dy * 0.25 + slack;
  const cp2x = x1 + dx * 0.75;
  const cp2y = y1 + dy * 0.75 + slack;

  return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
}

/** Generate clean orthogonal Manhattan SVG path (H-V-H / V-H-V) between two points */
export function getOrthogonalWirePath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return `M ${x1} ${y1}`;

  const midX = x1 + dx / 2;
  return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
}



// Helper: Calculate absolute pin position in workspace accounting for center-pivot rotation
function getAbsolutePinCoords(comp: PlacedComponent, pinX: number, pinY: number) {
  const compDef = COMPONENT_CATALOG.find((cat) => cat.type === comp.type);
  const width = compDef?.width || 140;
  const height = compDef?.height || 90;

  const cx = width / 2;
  const cy = height / 2;

  const dx = pinX - cx;
  const dy = pinY - cy;

  const rad = (comp.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const rotatedX = dx * cos - dy * sin;
  const rotatedY = dx * sin + dy * cos;

  return {
    x: comp.x + cx + rotatedX,
    y: comp.y + cy + rotatedY,
  };
}

// Tinkercad Breadboard Net Mapping (Groups connected tie-points and power rail holes)
function getBreadboardGroupKey(pinId: string): string | null {
  if (pinId.startsWith('vcc_top_')) return 'vcc_top';
  if (pinId.startsWith('gnd_top_')) return 'gnd_top';
  if (pinId.startsWith('vcc_bot_')) return 'vcc_bot';
  if (pinId.startsWith('gnd_bot_')) return 'gnd_bot';
  const match = pinId.match(/^R(\d+)([a-j])$/);
  if (match) {
    const col = match[1];
    const letter = match[2];
    const isTop = ['a', 'b', 'c', 'd', 'e'].includes(letter);
    return `col_${col}_${isTop ? 'top' : 'bot'}`;
  }
  return null;
}

// Maps VoltFlow component props and simulation state to @wokwi/elements properties
function getWokwiProps(comp: PlacedComponent, isRunning: boolean): Record<string, unknown> {
  const { type, props = {}, state = {} } = comp;

  switch (type) {
    case 'arduino-uno': {
      const isL13On = Boolean(
        isRunning &&
          (state.pin13 === true || state.led13 === true || state.pin_13 === true || state.pin_D13 === true || props.pin13 === true)
      );
      return {
        led13: isL13On,
        ledPower: isRunning,
        ledRX: Boolean(isRunning && state.rx === true),
        ledTX: Boolean(isRunning && state.tx === true),
      };
    }

    case 'arduino-nano':
      return {
        ...props,
        ...state,
        led13: Boolean(isRunning && (state.pin13 || state.led13 || state.pin_13 || state.pin_D13 || props.pin13)),
        ledPower: isRunning,
      };

    case 'led':
      return {
        ...props,
        ...state,
        value: Boolean(isRunning && (state.ledOn || props.value)),
        color: props.color || 'red',
        brightness: state.brightness ?? 1,
      };

    case 'resistor':
      return {
        ...props,
        ...state,
        value: props.resistance ?? 220,
      };

    case 'pushbutton':
      return {
        ...props,
        ...state,
        color: props.color || 'blue',
        pressed: Boolean(props.pressed || state.pressed),
      };

    case 'potentiometer':
      return {
        ...props,
        ...state,
        value: props.value ?? 512,
        min: 0,
        max: 1023,
        step: 1,
      };

    case 'servo':
      return {
        ...props,
        ...state,
        angle: state.angle ?? props.angle ?? 90,
      };

    case 'buzzer':
      return {
        ...props,
        ...state,
        hasSignal: Boolean(isRunning && (state.active || state.sounding)),
      };

    case 'gas-sensor':
    case 'mq5-sensor':
      return {
        ...props,
        ...state,
        ledPower: isRunning,
        ledD0: (props.gasPpm ?? props.ppm ?? 250) > 400,
      };

    case 'ultrasonic-hcsr04':
      return {
        ...props,
        ...state,
        distance: props.distance ?? 15,
      };

    case 'pir-sensor':
      return {
        ...props,
        ...state,
        motion: Boolean(props.motionDetected || state.motionDetected),
      };

    case 'slide-switch':
      return {
        ...props,
        ...state,
        value: props.state === 'right' ? 1 : 0,
      };

    case 'led-rgb':
      return {
        ...props,
        ...state,
        ledRed: state.red ?? props.red ?? (isRunning ? 1 : 0),
        ledGreen: state.green ?? props.green ?? 0,
        ledBlue: state.blue ?? props.blue ?? 0,
      };

    case 'neopixel-ring-12':
      return {
        ...props,
        ...state,
        pixels: 12,
      };

    case 'neopixel-ring-16':
      return {
        ...props,
        ...state,
        pixels: 16,
      };

    case 'keypad-4x4':
      return {
        ...props,
        ...state,
        columns: '4',
      };

    case 'segment-7':
      return {
        ...props,
        ...state,
        digits: 1,
        values: state.segments || props.segments || (isRunning ? [1, 1, 1, 1, 1, 1, 0, 0] : [0, 0, 0, 0, 0, 0, 0, 0]),
      };

    case 'segment-7-4digit':
      return {
        ...props,
        ...state,
        digits: 4,
        colon: true,
        values: state.segments || props.segments || [0, 0, 0, 0, 0, 0, 0, 0],
      };

    case 'lcd1602':
    case 'lcd1602-i2c': {
      const l1 = state.line1 ?? props.line1;
      const l2 = state.line2 ?? props.line2;
      const computedText = (l1 !== undefined || l2 !== undefined)
        ? `${l1 ?? ''}\n${l2 ?? ''}`
        : (state.text || props.text || '');
      return {
        ...props,
        ...state,
        pins: type === 'lcd1602-i2c' ? 'i2c' : undefined,
        text: computedText,
      };
    }

    case 'arduino-mega':
      return {
        ...props,
        ...state,
        led13: Boolean(isRunning && (state.pin13 || state.led13 || props.pin13)),
        ledPower: isRunning,
      };

    case 'relay-5v':
      return {
        ...props,
        ...state,
        active: Boolean(isRunning && comp.state?.active),
      };

    case 'relay-5v-2ch':
      return {
        ...props,
        ...state,
        ch1Active: Boolean(isRunning && comp.state?.ch1Active),
        ch2Active: Boolean(isRunning && comp.state?.ch2Active),
      };

    default:
      return {
        ...props,
        ...state,
      };
  }
}

export const Workspace2D: React.FC<Workspace2DProps> = ({
  components,
  wires,
  selectedId,
  selectedWireId,
  onSelectComponent,
  onSelectWire,
  onMoveComponent,
  onRotateComponent,
  onDeleteComponent,
  onDeleteWire,
  onDuplicateComponent,
  wiringStartPin,
  onPinClick,
  isRunning,
  wireColor = 'green',
  setWireColor,
  cancelWiring,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggingCompId, setDraggingCompId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [touchDistance, setTouchDistance] = useState<number | null>(null);
  const [dimWires, setDimWires] = useState(false);
  const [hoveredBreadboardNet, setHoveredBreadboardNet] = useState<{
    compId: string;
    groupKey: string;
    pinName: string;
    label: string;
  } | null>(null);
  const [hoveredPinInfo, setHoveredPinInfo] = useState<{
    compId: string;
    pinId: string;
    compName: string;
    pinName: string;
    pinLabel?: string;
    pinType?: string;
    electricalType?: string;
    direction?: string;
    voltage?: number;
    description?: string;
    x: number;
    y: number;
    isCompatible?: boolean;
    compatibilityReason?: string;
    severity?: 'ok' | 'warning' | 'danger';
  } | null>(null);

  const [activeSnapResult, setActiveSnapResult] = useState<{
    breadboardId: string;
    snapResult: SnapResult;
  } | null>(null);

  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const buzzerOscRef = useRef<OscillatorNode | null>(null);
  const buzzerGainRef = useRef<GainNode | null>(null);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; compId: string } | null>(null);
  const [hoveredCompId, setHoveredCompId] = useState<string | null>(null);

  // Fit-to-screen handler (triggered by F key via CustomEvent)
  const fitToScreen = useCallback(() => {
    if (components.length === 0) { setZoom(1); setPan({ x: 0, y: 0 }); return; }
    const xs = components.map((c) => c.x);
    const ys = components.map((c) => c.y);
    const minX = Math.min(...xs) - 60;
    const minY = Math.min(...ys) - 60;
    const maxX = Math.max(...xs) + 300;
    const maxY = Math.max(...ys) + 200;
    const containerW = containerRef.current?.clientWidth || 1200;
    const containerH = containerRef.current?.clientHeight || 700;
    const scaleX = containerW / (maxX - minX);
    const scaleY = containerH / (maxY - minY);
    const newZoom = Math.min(Math.max(0.4, Math.min(scaleX, scaleY, 1.4)), 1.4);
    setZoom(newZoom);
    setPan({ x: -minX * newZoom + 40, y: -minY * newZoom + 40 });
  }, [components]);

  useEffect(() => {
    window.addEventListener('fitToScreen', fitToScreen as EventListener);
    return () => window.removeEventListener('fitToScreen', fitToScreen as EventListener);
  }, [fitToScreen]);

  // ── Buzzer Audio Engine (Web Audio API) ─────────────────────────────────
  const startBuzzerAudio = useCallback((freq = 2400) => {
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const validFreq = isNaN(freq) || freq <= 0 ? 2400 : Math.min(10000, Math.max(50, freq));

      if (buzzerOscRef.current) {
        buzzerOscRef.current.frequency.setValueAtTime(validFreq, ctx.currentTime);
        return;
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(validFreq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      buzzerOscRef.current = osc;
      buzzerGainRef.current = gain;
    } catch {
      // AudioContext not available in test environment
    }
  }, []);

  const stopBuzzerAudio = useCallback(() => {
    try {
      buzzerOscRef.current?.stop();
    } catch {}
    buzzerOscRef.current = null;
    buzzerGainRef.current = null;
  }, []);

  // React to buzzer state changes
  useEffect(() => {
    const activeBuzzer = components.find((c) => c.type === 'buzzer' && (c.state?.active === true || c.state?.sounding === true));
    if (isRunning && activeBuzzer) {
      const targetFreq = activeBuzzer.state?.frequency || 2400;
      startBuzzerAudio(targetFreq);
    } else {
      stopBuzzerAudio();
    }
  }, [components, isRunning, startBuzzerAudio, stopBuzzerAudio]);

  // Stop audio when simulation stops
  useEffect(() => {
    if (!isRunning) stopBuzzerAudio();
  }, [isRunning, stopBuzzerAudio]);

  // Keyboard Shortcuts (Delete selected wire / Toggle Dim Wires)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingInInput(e)) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedWireId) {
          onDeleteWire(selectedWireId);
        }
      } else if (e.key === 'w' || e.key === 'W') {
        setDimWires((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedWireId, onDeleteWire]);

  // Wheel Zoom (Desktop)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((z) => Math.min(Math.max(0.35, z * zoomFactor), 2.5));
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      onSelectComponent(null);
      onSelectWire(null);
    }
  };

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const curX = (e.clientX - pan.x) / zoom;
    const curY = (e.clientY - pan.y) / zoom;
    setMousePos({ x: curX, y: curY });

    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    } else if (draggingCompId) {
      const rawX = curX - dragOffset.x;
      const rawY = curY - dragOffset.y;
      let snappedX = Math.round(rawX / 5) * 5;
      let snappedY = Math.round(rawY / 5) * 5;

      const draggedComp = components.find((c) => c.id === draggingCompId);
      let snapFound: { breadboardId: string; snapResult: SnapResult } | null = null;

      if (draggedComp && !draggedComp.type.startsWith('breadboard-')) {
        const compDef = COMPONENT_CATALOG.find((cat) => cat.type === draggedComp.type);
        if (compDef && compDef.pins && compDef.pins.length > 0) {
          const breadboards = components.filter(
            (c) => c.type.startsWith('breadboard-') && c.type !== 'breadboard-power-supply'
          );
          for (const bb of breadboards) {
            const bbDef = BREADBOARD_DEFINITIONS[bb.type];
            if (bbDef) {
              const compPosMm = { x: pxToMm(snappedX), y: pxToMm(snappedY) };
              const bbOriginMm = { x: pxToMm(bb.x), y: pxToMm(bb.y) };
              const pinDefs = compDef.pins.map((p) => ({
                id: p.id,
                name: p.name,
                xMm: pxToMm(p.x),
                yMm: pxToMm(p.y),
                type: (p.type || 'passive') as any,
              }));
              const result = snapComponentToBreadboard(
                pinDefs,
                compPosMm,
                draggedComp.rotation || 0,
                bbDef,
                bbOriginMm,
                4.0 // 4mm snap threshold
              );
              if (result.canSnap) {
                snappedX = Math.round(mmToPx(result.snappedPositionMm.x));
                snappedY = Math.round(mmToPx(result.snappedPositionMm.y));
                snapFound = { breadboardId: bb.id, snapResult: result };
                break;
              } else if (result.candidateHoles.length > 0) {
                snapFound = { breadboardId: bb.id, snapResult: result };
              }
            }
          }
        }
      }

      setActiveSnapResult(snapFound);
      onMoveComponent(draggingCompId, snappedX, snappedY);
    }
  };

  // Compute active start pin position for live preview wire
  let startPinCoords: { x: number; y: number } | null = null;
  if (wiringStartPin) {
    const comp = components.find((c) => c.id === wiringStartPin.componentId);
    const compDef = comp ? COMPONENT_CATALOG.find((cat) => cat.type === comp.type) : null;
    const pin = compDef?.pins.find((p) => p.id === wiringStartPin.pinId);
    if (comp && pin) {
      startPinCoords = getAbsolutePinCoords(comp, pin.x, pin.y);
    }
  }

  const handleMouseUp = (e?: React.MouseEvent) => {
    setIsPanning(false);
    setDraggingCompId(null);
    setActiveSnapResult(null);

    if (dragStartPosRef.current && wiringStartPin && e) {
      const dist = Math.hypot(e.clientX - dragStartPosRef.current.x, e.clientY - dragStartPosRef.current.y);
      if (dist > 8 && cancelWiring) {
        cancelWiring();
      }
    }
    dragStartPosRef.current = null;
  };

  const handlePinMouseDown = (e: React.MouseEvent, compId: string, pinId: string) => {
    e.stopPropagation();
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    if (!wiringStartPin) {
      onPinClick(compId, pinId);
    }
  };

  const handlePinTouchStart = (e: React.TouchEvent, compId: string, pinId: string) => {
    e.stopPropagation();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      dragStartPosRef.current = { x: touch.clientX, y: touch.clientY };
      if (!wiringStartPin) {
        onPinClick(compId, pinId);
      }
    }
  };

  const handlePinMouseUp = (e: React.MouseEvent, compId: string, pinId: string) => {
    e.stopPropagation();
    if (wiringStartPin && (wiringStartPin.componentId !== compId || wiringStartPin.pinId !== pinId)) {
      onPinClick(compId, pinId);
    }
    dragStartPosRef.current = null;
  };

  const handlePinTouchEnd = (e: React.TouchEvent, compId: string, pinId: string) => {
    e.stopPropagation();
    if (wiringStartPin && (wiringStartPin.componentId !== compId || wiringStartPin.pinId !== pinId)) {
      onPinClick(compId, pinId);
    }
    dragStartPosRef.current = null;
  };

  const handleCompMouseDown = (e: React.MouseEvent, comp: PlacedComponent) => {
    e.stopPropagation();
    onSelectComponent(comp.id);
    setDraggingCompId(comp.id);
    setDragOffset({
      x: (e.clientX - pan.x) / zoom - comp.x,
      y: (e.clientY - pan.y) / zoom - comp.y,
    });
  };

  // Touch Handlers for Mobile Web
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
        setIsPanning(true);
        setPanStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
        onSelectComponent(null);
        onSelectWire(null);
      }
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchDistance(dist);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (isPanning) {
        setPan({ x: touch.clientX - panStart.x, y: touch.clientY - panStart.y });
      } else if (draggingCompId) {
        const rawX = (touch.clientX - pan.x) / zoom - dragOffset.x;
        const rawY = (touch.clientY - pan.y) / zoom - dragOffset.y;
        let snappedX = Math.round(rawX / 5) * 5;
        let snappedY = Math.round(rawY / 5) * 5;

        const draggedComp = components.find((c) => c.id === draggingCompId);
        let snapFound: { breadboardId: string; snapResult: SnapResult } | null = null;

        if (draggedComp && !draggedComp.type.startsWith('breadboard-')) {
          const compDef = COMPONENT_CATALOG.find((cat) => cat.type === draggedComp.type);
          if (compDef && compDef.pins && compDef.pins.length > 0) {
            const breadboards = components.filter(
              (c) => c.type.startsWith('breadboard-') && c.type !== 'breadboard-power-supply'
            );
            for (const bb of breadboards) {
              const bbDef = BREADBOARD_DEFINITIONS[bb.type];
              if (bbDef) {
                const compPosMm = { x: pxToMm(snappedX), y: pxToMm(snappedY) };
                const bbOriginMm = { x: pxToMm(bb.x), y: pxToMm(bb.y) };
                const pinDefs = compDef.pins.map((p) => ({
                  id: p.id,
                  name: p.name,
                  xMm: pxToMm(p.x),
                  yMm: pxToMm(p.y),
                  type: (p.type || 'passive') as any,
                }));
                const result = snapComponentToBreadboard(
                  pinDefs,
                  compPosMm,
                  draggedComp.rotation || 0,
                  bbDef,
                  bbOriginMm,
                  4.0
                );
                if (result.canSnap) {
                  snappedX = Math.round(mmToPx(result.snappedPositionMm.x));
                  snappedY = Math.round(mmToPx(result.snappedPositionMm.y));
                  snapFound = { breadboardId: bb.id, snapResult: result };
                  break;
                } else if (result.candidateHoles.length > 0) {
                  snapFound = { breadboardId: bb.id, snapResult: result };
                }
              }
            }
          }
        }

        setActiveSnapResult(snapFound);
        onMoveComponent(draggingCompId, snappedX, snappedY);
      }
    } else if (e.touches.length === 2 && touchDistance !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchDistance;
      setZoom((z) => Math.min(Math.max(0.35, z * (factor > 1 ? 1.03 : 0.97)), 2.5));
      setTouchDistance(dist);
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    setDraggingCompId(null);
    setActiveSnapResult(null);
    setTouchDistance(null);
  };

  const handleCompTouchStart = (e: React.TouchEvent, comp: PlacedComponent) => {
    e.stopPropagation();
    onSelectComponent(comp.id);
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setDraggingCompId(comp.id);
      setDragOffset({
        x: (touch.clientX - pan.x) / zoom - comp.x,
        y: (touch.clientY - pan.y) / zoom - comp.y,
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="tinkercad-workspace"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }}
      onDrop={(e) => {
        e.preventDefault();
        try {
          const raw = e.dataTransfer.getData('application/json');
          if (raw) {
            const data = JSON.parse(raw);
            if (data?.type) {
              const dropX = Math.round(((e.clientX - pan.x) / zoom) / 5) * 5;
              const dropY = Math.round(((e.clientY - pan.y) / zoom) / 5) * 5;
              useCircuitStore.getState().handleAddComponent(data.type);
              const state = useCircuitStore.getState();
              const latest = state.components[state.components.length - 1];
              if (latest) {
                state.handleMoveComponent(latest.id, dropX, dropY);
              }
            }
          }
        } catch {}
      }}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        cursor: isPanning ? 'grabbing' : 'default',
        backgroundColor: '#f8fafc',
        touchAction: 'none',
      }}
    >
      {/* Grid Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle, #cbd5e1 1.2px, transparent 1.2px)`,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
          pointerEvents: 'none',
        }}
      />

      {/* Floating View Controls */}
      <div
        role="toolbar"
        aria-label="Canvas Zoom and View Controls"
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 40,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          backgroundColor: '#ffffff',
          padding: '6px 10px',
          borderRadius: 8,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
          border: '1px solid #cbd5e1',
        }}
      >
        <button
          className="btn btn-secondary"
          style={{ padding: '8px 12px', minWidth: 36, minHeight: 36, justifyContent: 'center' }}
          onClick={() => setZoom((z) => Math.min(z + 0.15, 2.5))}
          title="Zoom In (+)"
          aria-label="Zoom In"
        >
          <ZoomIn size={16} color="#475569" />
        </button>

        <span style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', alignSelf: 'center', minWidth: 44, textAlign: 'center' }}>
          {Math.round(zoom * 100)}%
        </span>

        <button
          className="btn btn-secondary"
          style={{ padding: '8px 12px', minWidth: 36, minHeight: 36, justifyContent: 'center' }}
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.35))}
          title="Zoom Out (-)"
          aria-label="Zoom Out"
        >
          <ZoomOut size={16} color="#475569" />
        </button>

        <div style={{ width: 1, height: 20, backgroundColor: '#cbd5e1' }} aria-hidden="true" />

        <button
          className="btn btn-secondary"
          style={{
            padding: '8px 12px',
            minHeight: 36,
            fontSize: 12,
            backgroundColor: dimWires ? '#0f172a' : '#ffffff',
            color: dimWires ? '#ffffff' : '#0f172a',
            borderColor: dimWires ? '#0f172a' : '#cbd5e1',
          }}
          onClick={() => setDimWires((d) => !d)}
          title="X-Ray Wires Mode (W) — Dim wires for easy pin access under complex webs"
          aria-label="Toggle X-Ray Wires Mode"
        >
          {dimWires ? <EyeOff size={16} color="#ffffff" /> : <Eye size={16} color="#475569" />}
          <span>X-Ray</span>
        </button>

        <button
          className="btn btn-secondary"
          style={{ padding: '8px 12px', minHeight: 36, fontSize: 12 }}
          onClick={fitToScreen}
          title="Fit to Screen (F)"
          aria-label="Fit Canvas to Screen"
        >
          <Maximize size={15} color="#475569" />
          <span>Fit</span>
        </button>

        <button
          className="btn btn-secondary"
          style={{ padding: '8px 12px', minHeight: 36, fontSize: 12 }}
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          title="Reset View"
          aria-label="Reset View"
        >
          <RotateCcw size={15} color="#475569" />
          <span>Reset</span>
        </button>
      </div>

      {/* Tinkercad Component Inspector Header Box (Top Right, matching Image 5) */}
      {selectedId && (() => {
        const selComp = components.find((c) => c.id === selectedId);
        if (!selComp) return null;
        return (
          <div
            style={{
              position: 'absolute',
              top: 68,
              right: 16,
              zIndex: 40,
              backgroundColor: '#ffffff',
              border: '1.5px solid #0284c7',
              borderRadius: 6,
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.2)',
              display: 'flex',
              overflow: 'hidden',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <div
              style={{
                backgroundColor: '#0284c7',
                color: '#ffffff',
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              Name
            </div>
            <input
              type="text"
              value={selComp.name}
              onChange={(e) => {
                useCircuitStore.getState().updateComponentName(selComp.id, e.target.value);
              }}
              style={{
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 600,
                color: '#0f172a',
                border: 'none',
                outline: 'none',
                minWidth: 120,
                backgroundColor: '#ffffff',
              }}
            />
          </div>
        );
      })()}

      {/* Viewport Layer */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          width: '100%',
          height: '100%',
          position: 'absolute',
        }}
      >
        {/* SVG Wire Layer (On Top of Components) */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 6000,
            height: 6000,
            zIndex: 30,
            pointerEvents: 'none',
          }}
        >
          {wires.map((w) => {
            const fromComp = components.find((c) => c.id === w.fromComponentId);
            const toComp = components.find((c) => c.id === w.toComponentId);
            if (!fromComp || !toComp) return null;

            const fromDef = COMPONENT_CATALOG.find((cat) => cat.type === fromComp.type);
            const toDef = COMPONENT_CATALOG.find((cat) => cat.type === toComp.type);

            const fromPin = fromDef?.pins.find((p) => p.id === w.fromPinId);
            const toPin = toDef?.pins.find((p) => p.id === w.toPinId);

            if (!fromPin || !toPin) return null;

            const p1 = getAbsolutePinCoords(fromComp, fromPin.x, fromPin.y);
            const p2 = getAbsolutePinCoords(toComp, toPin.x, toPin.y);

            // Use orthogonal Manhattan or organic flexible curved wire path
            const pathData =
              w.wireType === 'orthogonal'
                ? getOrthogonalWirePath(p1.x, p1.y, p2.x, p2.y)
                : getFlexibleWirePath(p1.x, p1.y, p2.x, p2.y);
            const wireHex = WIRE_COLOR_MAP[w.color] || '#3b82f6';
            const isSelectedWire = w.id === selectedWireId;
            const isWireDimmed = dimWires || wiringStartPin !== null;

            return (
              <g
                key={w.id}
                onClick={(e) => {
                  if (isWireDimmed) return;
                  e.stopPropagation();
                  onSelectWire(w.id);
                }}
                style={{
                  cursor: isWireDimmed ? 'default' : 'pointer',
                  pointerEvents: isWireDimmed ? 'none' : 'auto',
                  opacity: isWireDimmed ? 0.2 : 1,
                  transition: 'opacity 0.2s ease',
                }}
              >
                {/* Thick Invisible Click Target */}
                <path d={pathData} fill="none" stroke="transparent" strokeWidth="16" style={{ pointerEvents: isWireDimmed ? 'none' : 'stroke' }} />
                {/* Wire Shadow */}
                <path d={pathData} fill="none" stroke="#000000" strokeWidth="4" strokeOpacity="0.3" strokeLinecap="round" />
                {/* Selected Wire Halo */}
                {isSelectedWire && (
                  <path d={pathData} fill="none" stroke="#38bdf8" strokeWidth="8" strokeOpacity="0.9" strokeLinecap="round" />
                )}
                {/* Main Wire Stroke */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={wireHex}
                  strokeWidth={isSelectedWire ? 4.5 : 3.5}
                  strokeLinecap="round"
                  strokeDasharray={w.wireType === 'hookup' ? '6,4' : 'none'}
                />
                {/* Interactive Wire End Terminal Plugs - Click & Drag to pull wire off pin */}
                <circle
                  cx={p1.x}
                  cy={p1.y}
                  r="3.5"
                  fill={wireHex}
                  stroke="#0f172a"
                  strokeWidth="1"
                  style={{ cursor: 'grab', pointerEvents: 'auto' }}
                  aria-label="Pull wire from pin"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    if (setWireColor) setWireColor(w.color);
                    onDeleteWire(w.id);
                    onPinClick(w.toComponentId, w.toPinId);
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    if (setWireColor) setWireColor(w.color);
                    onDeleteWire(w.id);
                    onPinClick(w.toComponentId, w.toPinId);
                  }}
                />
                <circle
                  cx={p2.x}
                  cy={p2.y}
                  r="3.5"
                  fill={wireHex}
                  stroke="#0f172a"
                  strokeWidth="1"
                  style={{ cursor: 'grab', pointerEvents: 'auto' }}
                  aria-label="Pull wire from pin"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    if (setWireColor) setWireColor(w.color);
                    onDeleteWire(w.id);
                    onPinClick(w.fromComponentId, w.fromPinId);
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    if (setWireColor) setWireColor(w.color);
                    onDeleteWire(w.id);
                    onPinClick(w.fromComponentId, w.fromPinId);
                  }}
                />

                {isRunning && (
                  <circle r="3.5" fill="#facc15">
                    <animateMotion path={pathData} dur="1.2s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Active Wiring Live Interactive Preview Line (Matching selected wire color, clean terminal plugs) */}
          {startPinCoords && (
            <g style={{ pointerEvents: 'none' }}>
              <path
                d={getFlexibleWirePath(startPinCoords.x, startPinCoords.y, mousePos.x, mousePos.y)}
                fill="none"
                stroke={WIRE_COLOR_MAP[wireColor] || '#3b82f6'}
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <circle cx={startPinCoords.x} cy={startPinCoords.y} r="3.5" fill={WIRE_COLOR_MAP[wireColor] || '#3b82f6'} stroke="#0f172a" strokeWidth="1" />
              <circle cx={mousePos.x} cy={mousePos.y} r="3.5" fill={WIRE_COLOR_MAP[wireColor] || '#3b82f6'} stroke="#0f172a" strokeWidth="1" />
            </g>
          )}

          {/* Active Breadboard Snap Candidate Holes Indicator */}
          {activeSnapResult && (
            <g style={{ pointerEvents: 'none' }}>
              {activeSnapResult.snapResult.candidateHoles.map((hole) => {
                const bb = components.find((c) => c.id === activeSnapResult.breadboardId);
                if (!bb) return null;
                const holePxX = bb.x + mmToPx(hole.xMm);
                const holePxY = bb.y + mmToPx(hole.yMm);
                const isAllValid = activeSnapResult.snapResult.canSnap;
                return (
                  <g key={`snap_hole_${hole.id}`}>
                    <circle
                      cx={holePxX}
                      cy={holePxY}
                      r="6"
                      fill={isAllValid ? 'rgba(34, 197, 94, 0.45)' : 'rgba(239, 68, 68, 0.45)'}
                      stroke={isAllValid ? '#22c55e' : '#ef4444'}
                      strokeWidth="1.5"
                    />
                    <circle
                      cx={holePxX}
                      cy={holePxY}
                      r="2"
                      fill={isAllValid ? '#22c55e' : '#ef4444'}
                    />
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {/* Placed Components Layer */}
        {components.map((comp) => {
          const compDef = COMPONENT_CATALOG.find((cat) => cat.type === comp.type);
          const isSelected = comp.id === selectedId;
          const isCompHovered = hoveredCompId === comp.id || isSelected || !!wiringStartPin;

          return (
            <div
              key={comp.id}
              className={`component-box ${isSelected ? 'selected' : ''} ${isCompHovered ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredCompId(comp.id)}
              onMouseLeave={() => setHoveredCompId((id) => (id === comp.id ? null : id))}
              onMouseDown={(e) => handleCompMouseDown(e, comp)}
              onTouchStart={(e) => handleCompTouchStart(e, comp)}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectComponent(comp.id);
                setContextMenu({ x: (e.clientX - pan.x) / zoom, y: (e.clientY - pan.y) / zoom, compId: comp.id });
              }}
              style={{
                position: 'absolute',
                left: comp.x,
                top: comp.y,
                transform: `rotate(${comp.rotation}deg)`,
                width: compDef?.width || 140,
                height: compDef?.height || 90,
                zIndex: comp.type.startsWith('breadboard')
                  ? (isSelected ? 9 : 4)
                  : (isSelected ? 30 : 20),
                userSelect: 'none',
              }}
            >
              {/* Molded USB Cable Plug plugged into Arduino Uno when running (matches Tinkercad format) */}
              {comp.type === 'arduino-uno' && isRunning && (
                <div
                  style={{
                    position: 'absolute',
                    left: -125,
                    top: 23,
                    width: 140,
                    height: 46,
                    pointerEvents: 'none',
                    zIndex: 26,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {/* Black Cable Cord extending off canvas */}
                  <div
                    style={{
                      width: 60,
                      height: 14,
                      backgroundColor: '#18181b',
                      borderRadius: '8px 0 0 8px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.4)',
                    }}
                  />
                  {/* Strain Relief Ribbed Boot */}
                  <div
                    style={{
                      width: 18,
                      height: 24,
                      backgroundColor: '#27272a',
                      borderRadius: '3px 0 0 3px',
                      display: 'flex',
                      justifyContent: 'space-around',
                      alignItems: 'center',
                      padding: '0 2px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                    }}
                  >
                    <div style={{ width: 2, height: 18, backgroundColor: '#09090b' }} />
                    <div style={{ width: 2, height: 16, backgroundColor: '#09090b' }} />
                    <div style={{ width: 2, height: 14, backgroundColor: '#09090b' }} />
                  </div>
                  {/* Molded Plug Main Body */}
                  <div
                    style={{
                      width: 44,
                      height: 34,
                      backgroundColor: '#18181b',
                      borderRadius: 4,
                      border: '1px solid #3f3f46',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 3px 8px rgba(0,0,0,0.5)',
                    }}
                  >
                    {/* Embossed USB Trident Icon */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="5" r="1.5" fill="#71717a" />
                      <path d="M12 6.5v12" />
                      <path d="M12 11l4-2v4.5" />
                      <path d="M12 13l-4-2v3" />
                      <rect x="14.5" y="13.5" width="3" height="3" fill="#71717a" />
                      <circle cx="8" cy="15.5" r="1.5" fill="#71717a" />
                    </svg>
                  </div>
                  {/* Silver Metallic USB Type-B Plug Collar (inserted into jack) */}
                  <div
                    style={{
                      width: 16,
                      height: 22,
                      backgroundColor: '#e2e8f0',
                      border: '1.5px solid #94a3b8',
                      borderRadius: '0 2px 2px 0',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)',
                    }}
                  />
                </div>
              )}

              {/* Component Visual */}
              {comp.type === 'breadboard-mini' || comp.type === 'breadboard-half' || comp.type === 'breadboard-full' ? (
                <Breadboard2D
                  type={comp.type as 'breadboard-mini' | 'breadboard-half' | 'breadboard-full'}
                  width={compDef?.width || 340}
                  height={compDef?.height || 180}
                />
              ) : hasCustom2DRenderer(comp.type) ? (
                <ComponentRenderer
                  comp={comp}
                  compDef={compDef!}
                  isSelected={isSelected}
                  isRunning={isRunning}
                  onToggleSwitch={() => {
                    const nextState = comp.props?.state === 'right' ? 'left' : 'right';
                    useCircuitStore.getState().updateComponentProps(comp.id, { state: nextState });
                  }}
                />
              ) : compDef?.wokwiTag ? (
                <div style={{ width: '100%', height: '100%', pointerEvents: 'none', position: 'relative' }}>
                  <WokwiElement
                    tag={compDef.wokwiTag}
                    props={getWokwiProps(comp, isRunning)}
                    style={{ width: '100%', height: '100%' }}
                  />

                  {/* LED Glow Overlay when active */}
                  {comp.type === 'led' && isRunning && (comp.state?.ledOn || comp.props?.value) && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${comp.props?.color === 'green' ? 'rgba(16,185,129,0.7)' : comp.props?.color === 'blue' ? 'rgba(59,130,246,0.7)' : comp.props?.color === 'yellow' ? 'rgba(234,179,8,0.7)' : 'rgba(239,68,68,0.7)'} 0%, transparent 70%)`,
                        boxShadow: `0 0 28px 10px ${comp.props?.color === 'green' ? '#10b981' : comp.props?.color === 'blue' ? '#3b82f6' : comp.props?.color === 'yellow' ? '#eab308' : '#ef4444'}`,
                        pointerEvents: 'none',
                        animation: 'ledGlow 0.3s ease-in-out',
                      }}
                    />
                  )}

                  {/* Buzzer Pulse Ring when active */}
                  {comp.type === 'buzzer' && isRunning && (comp.state?.active || comp.state?.sounding) && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: -6,
                        borderRadius: '50%',
                        border: '3px solid #f59e0b',
                        boxShadow: '0 0 20px 6px rgba(245,158,11,0.7)',
                        animation: 'buzzerPulse 0.3s ease-in-out infinite',
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                </div>
              ) : (
                <ComponentRenderer
                  comp={comp}
                  compDef={compDef!}
                  isSelected={isSelected}
                  isRunning={isRunning}
                  onToggleSwitch={() => {
                    const nextState = comp.props?.state === 'right' ? 'left' : 'right';
                    useCircuitStore.getState().updateComponentProps(comp.id, { state: nextState });
                  }}
                />
              )}

              {/* Touch-Friendly Pin Terminals + Silver Pin Legs + Dark Tooltip Badge */}
              {compDef?.pins.map((pin) => {
                const isWiringTarget = wiringStartPin?.componentId === comp.id && wiringStartPin?.pinId === pin.id;
                const isHoveredPin = hoveredPinInfo?.compId === comp.id && hoveredPinInfo?.pinId === pin.id;
                const isBreadboard = comp.type.startsWith('breadboard');
                const isConnected = wires.some(
                  (w) =>
                    (w.fromComponentId === comp.id && w.fromPinId === pin.id) ||
                    (w.toComponentId === comp.id && w.toPinId === pin.id)
                );

                return (
                  <React.Fragment key={pin.id}>
                    {/* Realistic Silver Through-Hole Pin Leg (matches Tinkercad format) */}
                    {pin.side === 'bottom' && !isBreadboard && comp.type !== 'stepper-motor' && comp.type !== 'arduino-uno' && (
                      <div
                        style={{
                          position: 'absolute',
                          left: pin.x - 1,
                          top: pin.y - 4,
                          width: 2,
                          height: 16,
                          backgroundColor: '#cbd5e1',
                          borderLeft: '0.5px solid #ffffff',
                          borderRight: '0.5px solid #64748b',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.35)',
                          pointerEvents: 'none',
                          zIndex: 35,
                        }}
                      />
                    )}

                    {/* Pin Hitbox & Visual Terminal */}
                    <div
                      className={`pin-hitbox ${isBreadboard ? 'breadboard-pin-hitbox' : isWiringTarget ? 'wiring-active' : ''}`}
                      onMouseDown={(e) => handlePinMouseDown(e, comp.id, pin.id)}
                      onMouseUp={(e) => handlePinMouseUp(e, comp.id, pin.id)}
                      onTouchStart={(e) => handlePinTouchStart(e, comp.id, pin.id)}
                      onTouchEnd={(e) => handlePinTouchEnd(e, comp.id, pin.id)}
                      onMouseEnter={() => {
                        if (isBreadboard) {
                          const groupKey = getBreadboardGroupKey(pin.id);
                          if (groupKey) {
                            setHoveredBreadboardNet({
                              compId: comp.id,
                              groupKey,
                              pinName: pin.name,
                              label: pin.label || pin.name,
                            });
                          }
                        } else {
                          const abs = getAbsolutePinCoords(comp, pin.x, pin.y);
                          let compat: PinCompatibilityResult | undefined = undefined;
                          if (wiringStartPin) {
                            const startComp = components.find((c) => c.id === wiringStartPin.componentId);
                            const startDef = COMPONENT_CATALOG.find((cat) => cat.type === startComp?.type);
                            const sPin = startDef?.pins.find((p) => p.id === wiringStartPin.pinId);
                            if (startComp && sPin) {
                              compat = checkPinCompatibility(startComp, sPin, comp, pin);
                            }
                          }

                          setHoveredPinInfo({
                            compId: comp.id,
                            pinId: pin.id,
                            compName: comp.name,
                            pinName: pin.name,
                            pinLabel: pin.label || pin.name,
                            pinType: pin.type,
                            electricalType: pin.electricalType,
                            direction: pin.direction,
                            voltage: pin.voltage,
                            description: pin.description,
                            x: abs.x,
                            y: abs.y,
                            isCompatible: compat ? compat.compatible : true,
                            compatibilityReason: compat?.reason,
                            severity: compat?.severity || 'ok',
                          });
                        }
                      }}
                      onMouseLeave={() => {
                        if (isBreadboard) {
                          setHoveredBreadboardNet(null);
                        } else {
                          setHoveredPinInfo(null);
                        }
                      }}
                      style={{
                        position: 'absolute',
                        left: isBreadboard ? pin.x - 6 : pin.x - 7,
                        top: isBreadboard ? pin.y - 6 : pin.y - 7,
                        width: isBreadboard ? 12 : 14,
                        height: isBreadboard ? 12 : 14,
                        borderRadius: '50%',
                        backgroundColor: 'transparent',
                        cursor: 'crosshair',
                        zIndex: 80,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: 'none',
                      }}
                    >
                      {/* Integrated Metallic Socket Terminal (Visible on components, glowing on hover/active) */}
                      {!isBreadboard && (
                        <div
                          style={{
                            width: isHoveredPin || isWiringTarget ? 10 : 7.5,
                            height: isHoveredPin || isWiringTarget ? 10 : 7.5,
                            borderRadius: '50%',
                            backgroundColor: isWiringTarget
                              ? '#38bdf8'
                              : isHoveredPin
                              ? '#ef4444'
                              : isConnected
                              ? '#0284c7'
                              : 'rgba(203, 213, 225, 0.45)',
                            border: `1.5px solid ${isWiringTarget ? '#0284c7' : isHoveredPin ? '#991b1b' : '#334155'}`,
                            boxShadow: isWiringTarget
                              ? '0 0 10px #38bdf8'
                              : isHoveredPin
                              ? '0 0 8px #ef4444'
                              : 'inset 0 1px 2px rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'none',
                            transition: 'all 0.12s ease',
                          }}
                        >
                          <div
                            style={{
                              width: 3,
                              height: 3,
                              borderRadius: '50%',
                              backgroundColor: isWiringTarget ? '#ffffff' : isHoveredPin ? '#ffffff' : isConnected ? '#e0f2fe' : '#09090b',
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Tinkercad Green Breadboard Net Highlighting Halo (All holes in column/rail glow green) */}
                    {isBreadboard &&
                      hoveredBreadboardNet &&
                      hoveredBreadboardNet.compId === comp.id &&
                      getBreadboardGroupKey(pin.id) === hoveredBreadboardNet.groupKey && (
                        <div
                          style={{
                            position: 'absolute',
                            left: pin.x - 5.5,
                            top: pin.y - 5.5,
                            width: 11,
                            height: 11,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(34, 197, 94, 0.45)',
                            border: '1.5px solid #22c55e',
                            boxShadow: '0 0 8px rgba(34, 197, 94, 0.9)',
                            pointerEvents: 'none',
                            zIndex: 85,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <div style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: '#22c55e' }} />
                        </div>
                      )}

                    {/* Breadboard Net Hover Tooltip */}
                    {isBreadboard &&
                      hoveredBreadboardNet &&
                      hoveredBreadboardNet.compId === comp.id &&
                      hoveredBreadboardNet.pinName === pin.name && (
                        <div
                          style={{
                            position: 'absolute',
                            left: pin.x,
                            top: pin.y - 24,
                            transform: 'translateX(-50%)',
                            fontSize: 10,
                            fontWeight: 700,
                            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                            color: '#ffffff',
                            backgroundColor: '#1e293b',
                            padding: '2px 6px',
                            borderRadius: 4,
                            boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                            pointerEvents: 'none',
                            zIndex: 100,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {hoveredBreadboardNet.label}
                        </div>
                      )}

                    {/* Tinkercad Dark Pill Tooltip Badge (Appears only on hover, matching Image 5) */}
                    {isHoveredPin && (
                      <div
                        style={{
                          position: 'absolute',
                          left: pin.x,
                          top: pin.y - 28,
                          transform: 'translateX(-50%)',
                          fontSize: 11,
                          fontWeight: 600,
                          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                          color: '#ffffff',
                          backgroundColor: '#1e293b',
                          padding: '3px 8px',
                          borderRadius: 4,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                          pointerEvents: 'none',
                          zIndex: 100,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {pin.label || pin.name}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}


            </div>
          );
        })}



      </div>

      {/* Precision Pin HUD Tooltip & Live Connection Compatibility Banner */}
      {hoveredPinInfo && (
        <div
          className="pin-hud-tooltip"
          style={{
            position: 'absolute',
            left: hoveredPinInfo.x * zoom + pan.x,
            top: hoveredPinInfo.y * zoom + pan.y - 14,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            zIndex: 150,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.5))',
          }}
        >
          <div
            style={{
              backgroundColor: '#090d16',
              border: `1.5px solid ${
                hoveredPinInfo.severity === 'danger'
                  ? '#ef4444'
                  : hoveredPinInfo.severity === 'warning'
                  ? '#f59e0b'
                  : '#38bdf8'
              }`,
              borderRadius: 8,
              padding: '6px 12px',
              color: '#f8fafc',
              fontSize: 12,
              fontFamily: 'Inter, system-ui, sans-serif',
              whiteSpace: 'nowrap',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 800, color: '#ffffff' }}>
                {hoveredPinInfo.pinLabel || hoveredPinInfo.pinName}
              </span>
              <span style={{ fontSize: 10, color: '#94a3b8' }}>•</span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{hoveredPinInfo.compName}</span>
              {hoveredPinInfo.electricalType && (
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '1px 5px',
                    borderRadius: 4,
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                  }}
                >
                  {hoveredPinInfo.electricalType}
                </span>
              )}
            </div>

            {/* If wiring active: Show compatibility status */}
            {wiringStartPin && hoveredPinInfo.compatibilityReason && (
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color:
                    hoveredPinInfo.severity === 'danger'
                      ? '#f87171'
                      : hoveredPinInfo.severity === 'warning'
                      ? '#fbbf24'
                      : '#34d399',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  paddingTop: 3,
                  marginTop: 2,
                }}
              >
                {hoveredPinInfo.compatibilityReason}
              </div>
            )}
          </div>
          {/* Arrow pointer */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: `5px solid ${
                hoveredPinInfo.severity === 'danger'
                  ? '#ef4444'
                  : hoveredPinInfo.severity === 'warning'
                  ? '#f59e0b'
                  : '#38bdf8'
              }`,
            }}
          />
        </div>
      )}
      {/* Right-Click Context Menu */}
      {contextMenu && (
        <>
          {/* Backdrop to close */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
            onClick={() => setContextMenu(null)}
            onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }}
          />
          <div
            style={{
              position: 'absolute',
              left: contextMenu.x * zoom + pan.x,
              top: contextMenu.y * zoom + pan.y,
              zIndex: 100,
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              padding: '6px 0',
              minWidth: 180,
              fontFamily: 'Inter, sans-serif',
              overflow: 'hidden',
            }}
          >
            {[
              { label: '↻  Rotate 90°', color: '#38bdf8', action: () => { onRotateComponent(contextMenu.compId); setContextMenu(null); } },
              { label: '⧉  Duplicate', color: '#a855f7', action: () => { if (onDuplicateComponent) onDuplicateComponent(contextMenu.compId); setContextMenu(null); } },
              { label: '✕  Delete', color: '#ef4444', action: () => { onDeleteComponent(contextMenu.compId); setContextMenu(null); } },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '9px 16px', border: 'none', background: 'none',
                  color: item.color, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#334155')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
