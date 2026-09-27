import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlacedComponent, WireConnection, TinkercadWireColor, WireType } from '../types';
import { COMPONENT_CATALOG } from '../catalog';

const DEFAULT_SKETCH = `void setup() {
  pinMode(13, OUTPUT);      // Built-in LED Pin
  pinMode(8, OUTPUT);       // Buzzer Pin
  pinMode(2, INPUT_PULLUP); // Pushbutton Pin
  Serial.begin(9600);
  Serial.println("VoltFlow Studio ready!");
}

int pressCount = 0;

void loop() {
  bool btnPressed = digitalRead(2) == LOW;

  digitalWrite(13, btnPressed ? HIGH : LOW);
  digitalWrite(8, btnPressed ? HIGH : LOW);

  if (btnPressed) {
    pressCount++;
    Serial.print("Button Trigger #");
    Serial.println(pressCount);
    delay(150);
  }
}
`;

const INITIAL_COMPONENTS: PlacedComponent[] = [
  { id: 'nodemcu-1', type: 'nodemcu-esp8266', name: 'NodeMCU ESP8266 V2', x: 60, y: 50, rotation: 0, props: {} },
  { id: 'esp32-1', type: 'esp32-devkit', name: 'ESP32 DevKit V1', x: 320, y: 50, rotation: 0, props: {} },
  { id: 'uno-1', type: 'arduino-uno', name: 'Arduino Uno R3', x: 60, y: 200, rotation: 0, props: {} },
  { id: 'led-1', type: 'led', name: 'LED Red', x: 380, y: 200, rotation: 0, props: { color: 'red' } },
  { id: 'res-1', type: 'resistor', name: 'Resistor 220Ω', x: 480, y: 200, rotation: 0, props: { resistance: 220 } },
];

const INITIAL_WIRES: WireConnection[] = [
  { id: 'w1', fromComponentId: 'uno-1', fromPinId: '13', toComponentId: 'res-1', toPinId: '1', color: 'red', wireType: 'normal' },
  { id: 'w2', fromComponentId: 'res-1', fromPinId: '2', toComponentId: 'led-1', toPinId: 'A', color: 'red', wireType: 'normal' },
  { id: 'w3', fromComponentId: 'led-1', fromPinId: 'C', toComponentId: 'uno-1', toPinId: 'GND1', color: 'black', wireType: 'normal' },
];

interface HistorySnapshot {
  components: PlacedComponent[];
  wires: WireConnection[];
  code: string;
}

interface CircuitState {
  circuitName: string;
  components: PlacedComponent[];
  wires: WireConnection[];
  past: HistorySnapshot[];
  future: HistorySnapshot[];
  selectedId: string | null;
  selectedWireId: string | null;
  viewMode: '2D' | '3D';
  wireColor: TinkercadWireColor;
  wireType: WireType;
  wiringStartPin: { componentId: string; pinId: string } | null;
  showCode: boolean;
  showDrawer: boolean;
  showBOM: boolean;
  showPCB: boolean;
  showAIPresets: boolean;
  code: string;
  isRunning: boolean;
  isCompiling: boolean;
  compileError: string | null;
  serialText: string;

  // Actions
  pushHistory: () => void;
  setCircuitName: (name: string) => void;
  setComponents: (components: PlacedComponent[] | ((prev: PlacedComponent[]) => PlacedComponent[])) => void;
  updateComponentState: (id: string, stateUpdate: Record<string, any>) => void;
  updateComponentProps: (id: string, propsUpdate: Record<string, any>) => void;
  updateComponentName: (id: string, name: string) => void;
  setWires: (wires: WireConnection[] | ((prev: WireConnection[]) => WireConnection[])) => void;
  handleAddComponent: (type: string) => void;
  handleMoveComponent: (id: string, x: number, y: number) => void;
  handleRotateComponent: (id: string) => void;
  handleDeleteComponent: (id: string) => void;
  handleDeleteWire: (id: string) => void;
  handleClearCanvas: () => void;
  handleUndo: () => void;
  handleRedo: () => void;
  handlePinClick: (componentId: string, pinId: string) => void;
  setSelectedId: (id: string | null) => void;
  setSelectedWireId: (id: string | null) => void;
  setViewMode: (mode: '2D' | '3D') => void;
  setWireColor: (color: TinkercadWireColor) => void;
  setWireType: (type: WireType) => void;
  setShowCode: (show: boolean) => void;
  toggleShowCode: () => void;
  setShowDrawer: (show: boolean) => void;
  toggleShowDrawer: () => void;
  setShowBOM: (show: boolean) => void;
  setShowPCB: (show: boolean) => void;
  setShowAIPresets: (show: boolean) => void;
  setCode: (code: string) => void;
  setIsRunning: (isRunning: boolean) => void;
  setIsCompiling: (isCompiling: boolean) => void;
  setCompileError: (error: string | null) => void;
  setSerialText: (text: string) => void;
  appendSerialText: (text: string) => void;
  loadCircuit: (components: PlacedComponent[], wires: WireConnection[], code: string) => void;
  duplicateComponent: (id: string) => void;
  cancelWiring: () => void;
  clearAllComponentStates: () => void;
  saveToFile: () => void;
  loadFromFile: (file: File) => void;
}

export const useCircuitStore = create<CircuitState>()(
  persist(
    (set, get) => ({
      circuitName: 'NodeMCU & ESP32 Circuit',
      components: INITIAL_COMPONENTS,
      wires: INITIAL_WIRES,
      past: [],
      future: [],
      selectedId: null,
      selectedWireId: null,
      viewMode: '2D',
      wireColor: 'green',
      wireType: 'normal',
      wiringStartPin: null,
      showCode: false,
      showDrawer: true,
      showBOM: false,
      showPCB: false,
      showAIPresets: false,
      code: DEFAULT_SKETCH,
      isRunning: false,
      isCompiling: false,
      compileError: null,
      serialText: '',

      pushHistory: () => {
        const { components, wires, code, past } = get();
        const currentSnapshot = {
          components: JSON.parse(JSON.stringify(components)),
          wires: JSON.parse(JSON.stringify(wires)),
          code,
        };
        set({
          past: [...past.slice(-30), currentSnapshot],
          future: [],
        });
      },

      setCircuitName: (circuitName) => set({ circuitName }),

      setComponents: (updater) =>
        set((state) => ({
          components: typeof updater === 'function' ? updater(state.components) : updater,
        })),

      updateComponentState: (id, stateUpdate) =>
        set((state) => ({
          components: state.components.map((c) =>
            c.id === id ? { ...c, state: { ...c.state, ...stateUpdate } } : c
          ),
        })),

      updateComponentProps: (id, propsUpdate) => {
        get().pushHistory();
        set((state) => ({
          components: state.components.map((c) =>
            c.id === id ? { ...c, props: { ...c.props, ...propsUpdate } } : c
          ),
        }));
      },

      updateComponentName: (id, name) => {
        set((state) => ({
          components: state.components.map((c) =>
            c.id === id ? { ...c, name } : c
          ),
        }));
      },

      setWires: (updater) =>
        set((state) => ({
          wires: typeof updater === 'function' ? updater(state.wires) : updater,
        })),

      handleAddComponent: (type) => {
        const compDef = COMPONENT_CATALOG.find((cat) => cat.type === type);
        if (!compDef) return;

        get().pushHistory();
        const { components } = get();
        const newComp: PlacedComponent = {
          id: `${type}-${Date.now()}`,
          type,
          name: compDef.name,
          x: 200 + Math.random() * 80,
          y: 140 + Math.random() * 80,
          rotation: 0,
          props: compDef.defaultProps ? { ...compDef.defaultProps } : {},
        };

        set({
          components: [...components, newComp],
          selectedId: newComp.id,
          selectedWireId: null,
        });
      },

      handleMoveComponent: (id, x, y) =>
        set((state) => ({
          components: state.components.map((c) => (c.id === id ? { ...c, x, y } : c)),
        })),

      handleRotateComponent: (id) => {
        get().pushHistory();
        set((state) => ({
          components: state.components.map((c) =>
            c.id === id ? { ...c, rotation: (c.rotation + 90) % 360 } : c
          ),
        }));
      },

      handleDeleteComponent: (id) => {
        get().pushHistory();
        set((state) => ({
          components: state.components.filter((c) => c.id !== id),
          wires: state.wires.filter((w) => w.fromComponentId !== id && w.toComponentId !== id),
          selectedId: state.selectedId === id ? null : state.selectedId,
        }));
      },

      handleDeleteWire: (wireId) => {
        get().pushHistory();
        set((state) => ({
          wires: state.wires.filter((w) => w.id !== wireId),
          selectedWireId: state.selectedWireId === wireId ? null : state.selectedWireId,
        }));
      },

      handleClearCanvas: () => {
        get().pushHistory();
        set({
          components: [],
          wires: [],
          selectedId: null,
          selectedWireId: null,
          wiringStartPin: null,
        });
      },

      handleUndo: () => {
        const { past, future, components, wires, code } = get();
        if (past.length === 0) return;

        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);
        const currentSnapshot = {
          components: JSON.parse(JSON.stringify(components)),
          wires: JSON.parse(JSON.stringify(wires)),
          code,
        };

        set({
          components: previous.components,
          wires: previous.wires,
          code: previous.code,
          past: newPast,
          future: [currentSnapshot, ...future],
          wiringStartPin: null,
        });
      },

      handleRedo: () => {
        const { past, future, components, wires, code } = get();
        if (future.length === 0) return;

        const next = future[0];
        const newFuture = future.slice(1);
        const currentSnapshot = {
          components: JSON.parse(JSON.stringify(components)),
          wires: JSON.parse(JSON.stringify(wires)),
          code,
        };

        set({
          components: next.components,
          wires: next.wires,
          code: next.code,
          past: [...past, currentSnapshot],
          future: newFuture,
          wiringStartPin: null,
        });
      },

      handlePinClick: (componentId, pinId) => {
        const { wiringStartPin, wireColor, wireType, wires } = get();
        if (!wiringStartPin) {
          set({ wiringStartPin: { componentId, pinId }, selectedId: null, selectedWireId: null });
        } else {
          if (wiringStartPin.componentId !== componentId || wiringStartPin.pinId !== pinId) {
            get().pushHistory();
            const newWire: WireConnection = {
              id: `w-${Date.now()}`,
              fromComponentId: wiringStartPin.componentId,
              fromPinId: wiringStartPin.pinId,
              toComponentId: componentId,
              toPinId: pinId,
              color: wireColor,
              wireType,
            };
            set({ wires: [...wires, newWire], selectedWireId: newWire.id });
          }
          set({ wiringStartPin: null });
        }
      },

      setSelectedId: (selectedId) => set({ selectedId, selectedWireId: null }),
      setSelectedWireId: (selectedWireId) => set({ selectedWireId, selectedId: null }),
      setViewMode: (viewMode) => set({ viewMode }),
      setWireColor: (wireColor) => {
        const { selectedWireId } = get();
        set({ wireColor });
        if (selectedWireId) {
          set((state) => ({
            wires: state.wires.map((w) => (w.id === selectedWireId ? { ...w, color: wireColor } : w)),
          }));
        }
      },
      setWireType: (wireType) => {
        const { selectedWireId } = get();
        set({ wireType });
        if (selectedWireId) {
          set((state) => ({
            wires: state.wires.map((w) => (w.id === selectedWireId ? { ...w, wireType } : w)),
          }));
        }
      },

      setShowCode: (showCode) => set({ showCode }),
      toggleShowCode: () => set((state) => ({ showCode: !state.showCode })),

      setShowDrawer: (showDrawer) => set({ showDrawer }),
      toggleShowDrawer: () => set((state) => ({ showDrawer: !state.showDrawer })),

      setShowBOM: (showBOM) => set({ showBOM }),
      setShowPCB: (showPCB) => set({ showPCB }),
      setShowAIPresets: (showAIPresets) => set({ showAIPresets }),

      setCode: (code) => set({ code }),
      setIsRunning: (isRunning) => set({ isRunning }),
      setIsCompiling: (isCompiling) => set({ isCompiling }),
      setCompileError: (compileError) => set({ compileError }),
      setSerialText: (serialText) => set({ serialText }),
      appendSerialText: (text) => set((state) => ({ serialText: state.serialText + text })),

      loadCircuit: (components, wires, code) => {
        get().pushHistory();
        set({
          components,
          wires,
          code,
          past: [],
          future: [],
          selectedId: null,
          selectedWireId: null,
        });
      },

      duplicateComponent: (id) => {
        const { components } = get();
        const comp = components.find((c) => c.id === id);
        if (!comp) return;
        get().pushHistory();
        const newComp = {
          ...JSON.parse(JSON.stringify(comp)),
          id: `${comp.type}-${Date.now()}`,
          x: comp.x + 30,
          y: comp.y + 30,
        };
        set({ components: [...components, newComp], selectedId: newComp.id });
      },

      cancelWiring: () => set({ wiringStartPin: null }),

      clearAllComponentStates: () =>
        set((state) => ({
          components: state.components.map((c) => ({ ...c, state: {} })),
        })),

      saveToFile: () => {
        const { circuitName, components, wires, code } = get();
        const data = JSON.stringify({ circuitName, components, wires, code }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${circuitName.replace(/[^a-z0-9]/gi, '_')}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },

      loadFromFile: (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            if (data.components && data.wires) {
              get().pushHistory();
              set({
                circuitName: data.circuitName || 'Imported Circuit',
                components: data.components,
                wires: data.wires,
                code: data.code || '',
                selectedId: null,
                selectedWireId: null,
                wiringStartPin: null,
              });
            }
          } catch (err) {
            console.error('Invalid circuit file:', err);
          }
        };
        reader.readAsText(file);
      },
    }),
    {
      name: 'circuit-sim-storage',
      partialize: (state) => ({
        circuitName: state.circuitName,
        components: state.components,
        wires: state.wires,
        code: state.code,
      }),
    }
  )
);
