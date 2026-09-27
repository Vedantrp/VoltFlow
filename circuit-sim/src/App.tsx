import { useRef, useCallback, useEffect, useState } from 'react';
import { BillionDollarTopBar } from './components/BillionDollarTopBar';
import { TinkercadComponentDrawer } from './components/TinkercadComponentDrawer';
import { Workspace2D } from './components/Workspace2D';
import { DraggableCodeWindow } from './components/DraggableCodeWindow';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SensorInspectorModal } from './components/SensorInspectorModal';
import { BOMExporter } from './components/BOMExporter';
import { PCBViewModal } from './components/PCBViewModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { LearningCenterModal } from './components/LearningCenterModal';
import { MobileQuickBar } from './components/MobileQuickBar';
import { AuthModal } from './components/AuthModal';
import { ProjectsDashboardModal } from './components/ProjectsDashboardModal';
import { DashboardHomePage } from './components/DashboardHomePage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { TermsConditionsPage } from './components/TermsConditionsPage';
import { authService } from './services/authService';
import type { UserProfile, SavedProject } from './types';

import { useCircuitStore } from './store/useCircuitStore';
import { AvrRunner } from './sim/AvrRunner';
import { JsInterpreter } from './sim/JsInterpreter';
import { CircuitEvaluator } from './sim/CircuitEvaluator';
import { isTypingInInput } from './utils/keyboardUtils';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';
const COMPILE_ENDPOINT = `${API_BASE_URL}/compile`;

export default function App() {
  const {
    circuitName,
    setCircuitName,
    components,
    updateComponentState,
    updateComponentProps,
    wires,
    selectedId,
    selectedWireId,
    setSelectedId,
    setSelectedWireId,
    wireColor,
    setWireColor,
    wireType,
    setWireType,
    wiringStartPin,
    handlePinClick,
    showCode,
    toggleShowCode,
    showDrawer,
    setShowDrawer,
    toggleShowDrawer,
    showBOM,
    setShowBOM,
    showPCB,
    setShowPCB,
    handleAddComponent,
    handleMoveComponent,
    handleRotateComponent,
    handleDeleteComponent,
    handleDeleteWire,
    handleClearCanvas,
    handleUndo,
    handleRedo,
    loadCircuit,
    duplicateComponent,
    cancelWiring,
    clearAllComponentStates,
    saveToFile,
    loadFromFile,
    code,
    setCode,
    isRunning,
    setIsRunning,
    isCompiling,
    setIsCompiling,
    compileError,
    setCompileError,
    serialText,
    setSerialText,
    appendSerialText,
  } = useCircuitStore();

  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showLearning, setShowLearning] = useState(false);

  // User Auth & Cloud Projects State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(undefined);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [isSavingCloud, setIsSavingCloud] = useState(false);

  useEffect(() => {
    const unsub = authService.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return unsub;
  }, []);

  const handleSaveProjectCloud = useCallback(async () => {
    const targetUserId = currentUser ? currentUser.id : 'guest_user';
    setIsSavingCloud(true);
    try {
      const saved = await authService.saveProjectAsync(targetUserId, {
        id: currentProjectId,
        name: circuitName,
        components,
        wires,
        code,
      });
      setCurrentProjectId(saved.id);
      setIsSavingCloud(false);
      if (currentUser) {
        if (saved.savedToCloud) {
          alert('Circuit project saved successfully to Firebase Cloud Database & Local Storage!');
        } else if (saved.cloudError) {
          alert(`Saved locally in browser!\n\nCloud Database Save Notice:\n${saved.cloudError}`);
        } else {
          alert('Circuit project saved locally in browser! (Firebase Cloud Database not initialized in environment).');
        }
      } else {
        alert('Circuit project saved locally in browser! Sign in anytime to sync your projects to the cloud database.');
      }
    } catch (err: any) {
      setIsSavingCloud(false);
      alert(err.message || 'Failed to save circuit');
    }
  }, [currentUser, currentProjectId, circuitName, components, wires, code]);

  const handleOpenProject = useCallback((project: SavedProject) => {
    setCircuitName(project.name);
    loadCircuit(project.components || [], project.wires || [], project.code || '');
    setCurrentProjectId(project.id);
  }, [setCircuitName, loadCircuit]);

  const handleCreateNewProject = useCallback(() => {
    setCircuitName('Untitled Circuit');
    handleClearCanvas();
    setCurrentProjectId(undefined);
  }, [setCircuitName, handleClearCanvas]);

  // Multi-Page View Routing State
  const getInitialView = (): 'home' | 'simulator' | 'privacy' | 'terms' => {
    const hash = window.location.hash.toLowerCase();
    if (hash === '#privacy') return 'privacy';
    if (hash === '#terms') return 'terms';
    if (hash === '#simulator') return 'simulator';
    return 'home';
  };

  const [currentView, setCurrentView] = useState<'home' | 'simulator' | 'privacy' | 'terms'>(getInitialView);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#privacy') setCurrentView('privacy');
      else if (hash === '#terms') setCurrentView('terms');
      else if (hash === '#simulator') setCurrentView('simulator');
      else setCurrentView('home');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToView = useCallback(
    (view: 'home' | 'simulator' | 'privacy' | 'terms') => {
      if (currentView === 'simulator' && view !== 'simulator') {
        const targetUserId = currentUser ? currentUser.id : 'guest_user';
        if (components.length > 0 || wires.length > 0 || circuitName !== 'Untitled Circuit') {
          try {
            const saved = authService.saveProject(targetUserId, {
              id: currentProjectId,
              name: circuitName,
              components,
              wires,
              code,
            });
            setCurrentProjectId(saved.id);
          } catch (e) {
            console.warn('Auto-save on exit notice:', e);
          }
        }
      }
      setCurrentView(view);
      window.location.hash = view === 'home' ? '' : view;
      window.scrollTo(0, 0);
    },
    [currentView, currentUser, currentProjectId, circuitName, components, wires, code]
  );

  const handleLaunchPreset = useCallback((presetId: string) => {
    let presetName = 'Untitled Circuit';
    if (presetId === 'arduino-blink') {
      presetName = 'Arduino Uno LED Blink';
      loadCircuit(
        [
          { id: 'uno-1', type: 'arduino-uno', name: 'Arduino Uno R3', x: 120, y: 140, rotation: 0, props: {} },
          { id: 'led-1', type: 'led', name: 'Status LED', x: 420, y: 140, rotation: 0, props: { color: 'green' } },
          { id: 'res-1', type: 'resistor', name: 'Resistor 220Ω', x: 420, y: 220, rotation: 0, props: { resistance: 220 } },
        ],
        [
          { id: 'w1', fromComponentId: 'uno-1', fromPinId: '13', toComponentId: 'led-1', toPinId: 'A', color: 'green' },
          { id: 'w2', fromComponentId: 'led-1', fromPinId: 'C', toComponentId: 'res-1', toPinId: '1', color: 'green' },
          { id: 'w3', fromComponentId: 'res-1', fromPinId: '2', toComponentId: 'uno-1', toPinId: 'GND1', color: 'black' },
        ],
        `void setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(500);\n  digitalWrite(13, LOW);\n  delay(500);\n}`
      );
    } else if (presetId === 'timer-555') {
      presetName = '555 Timer Oscillation';
      loadCircuit(
        [
          { id: 'ic555-1', type: 'ne555', name: 'NE555 Timer IC', x: 260, y: 160, rotation: 0, props: {} },
          { id: 'led-1', type: 'led', name: 'Pulse LED', x: 460, y: 160, rotation: 0, props: { color: 'red' } },
          { id: 'res-1', type: 'resistor', name: '220Ω Resistor', x: 460, y: 240, rotation: 0, props: { resistance: 220 } },
        ],
        [
          { id: 'w1', fromComponentId: 'ic555-1', fromPinId: 'OUT', toComponentId: 'led-1', toPinId: 'A', color: 'yellow' },
          { id: 'w2', fromComponentId: 'led-1', fromPinId: 'C', toComponentId: 'res-1', toPinId: '1', color: 'red' },
        ],
        `// 555 Timer Hardware Oscillator`
      );
    } else if (presetId === 'opamp-amp') {
      presetName = 'Op-Amp Inverting Amplifier';
      loadCircuit(
        [
          { id: 'opamp-1', type: 'opamp', name: 'LM741 Op-Amp', x: 280, y: 150, rotation: 0, props: {} },
          { id: 'res-in', type: 'resistor', name: 'R1 Input 10k', x: 140, y: 150, rotation: 0, props: { resistance: 10000 } },
          { id: 'res-fb', type: 'resistor', name: 'Rf Feedback 100k', x: 280, y: 60, rotation: 0, props: { resistance: 100000 } },
        ],
        [
          { id: 'w1', fromComponentId: 'res-in', fromPinId: '2', toComponentId: 'opamp-1', toPinId: 'IN-', color: 'blue' },
        ],
        `// SPICE Operational Amplifier Simulation`
      );
    } else if (presetId === 'lcd-i2c') {
      presetName = 'I2C LCD1602 Display';
      loadCircuit(
        [
          { id: 'uno-1', type: 'arduino-uno', name: 'Arduino Uno R3', x: 100, y: 150, rotation: 0, props: {} },
          { id: 'lcd-1', type: 'lcd1602-i2c', name: 'LCD1602 I2C', x: 440, y: 150, rotation: 0, props: {} },
        ],
        [
          { id: 'w1', fromComponentId: 'uno-1', fromPinId: '5V', toComponentId: 'lcd-1', toPinId: 'VCC', color: 'red' },
          { id: 'w2', fromComponentId: 'uno-1', fromPinId: 'GND1', toComponentId: 'lcd-1', toPinId: 'GND', color: 'black' },
          { id: 'w3', fromComponentId: 'uno-1', fromPinId: 'A4', toComponentId: 'lcd-1', toPinId: 'SDA', color: 'blue' },
          { id: 'w4', fromComponentId: 'uno-1', fromPinId: 'A5', toComponentId: 'lcd-1', toPinId: 'SCL', color: 'yellow' },
        ],
        `#include <Wire.h>\n#include <LiquidCrystal_I2C.h>\n\nLiquidCrystal_I2C lcd(0x27, 16, 2);\n\nvoid setup() {\n  lcd.init();\n  lcd.backlight();\n  lcd.setCursor(0, 0);\n  lcd.print("VoltFlow Studio");\n  lcd.setCursor(0, 1);\n  lcd.print("Ready to Sim!");\n}\n\nvoid loop() {\n  delay(1000);\n}`
      );
    } else {
      handleCreateNewProject();
      return;
    }

    setCircuitName(presetName);
    const targetUserId = currentUser ? currentUser.id : 'guest_user';
    const existing = authService.getProjects(targetUserId);
    const match = existing.find((p) => (p.name || '').trim().toLowerCase() === presetName.toLowerCase());
    if (match) {
      setCurrentProjectId(match.id);
    } else {
      setCurrentProjectId(undefined);
    }
  }, [setCircuitName, loadCircuit, currentUser, handleCreateNewProject]);

  const runnerRef = useRef<AvrRunner | null>(null);
  const jsInterpreterRef = useRef<JsInterpreter | null>(null);
  const evaluatorRef = useRef<CircuitEvaluator>(new CircuitEvaluator());
  const serialBufferRef = useRef('');
  const simulationActiveRef = useRef(false);

  // Find active selected component for inspector
  const selectedComponent = components.find((c) => c.id === selectedId);

  // Global Keyboard Hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Never trigger canvas hotkeys if user is typing in Monaco editor, input, textarea, or contenteditable element
      if (isTypingInInput(e)) return;

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      } else if (e.key === '?') {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      } else if (e.key === 'r' || e.key === 'R') {
        if (selectedId) handleRotateComponent(selectedId);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) handleDeleteComponent(selectedId);
        else if (selectedWireId) handleDeleteWire(selectedWireId);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (selectedId) duplicateComponent(selectedId);
      } else if (e.key === 'Escape') {
        cancelWiring();
        setSelectedId(null);
        setSelectedWireId(null);
      } else if (e.key === 'f' || e.key === 'F') {
        // Fit to screen — handled in Workspace2D via a ref callback
        window.dispatchEvent(new CustomEvent('fitToScreen'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, selectedWireId, handleRotateComponent, handleDeleteComponent, handleDeleteWire, handleUndo, handleRedo, duplicateComponent, cancelWiring, setSelectedId, setSelectedWireId]);

  // Stop Simulation — also clear all component visual states
  const handleStop = useCallback(() => {
    simulationActiveRef.current = false;

    runnerRef.current?.stop();
    runnerRef.current = null;

    jsInterpreterRef.current?.stop();
    jsInterpreterRef.current = null;

    clearAllComponentStates();
    setIsRunning(false);
  }, [setIsRunning, clearAllComponentStates]);

  // Start / Stop Simulation
  const handleToggleSimulation = useCallback(async () => {
    if (isRunning || simulationActiveRef.current) {
      handleStop();
      return;
    }

    handleStop();
    simulationActiveRef.current = true;
    setCompileError(null);
    setIsCompiling(true);
    setSerialText('');
    serialBufferRef.current = '';

    // Initialize Circuit Evaluator Graph & evaluate initial state
    const evaluator = evaluatorRef.current;
    evaluator.syncGraph(components, wires);
    evaluator.evaluateAllComponents(components, updateComponentState);

    const mcuComp = components.find(
      (c) => c.type === 'arduino-uno' || c.type === 'arduino-nano' || c.type === 'esp32-devkit' || c.type === 'nodemcu-esp8266'
    ) || components[0];

    try {
      if (typeof window !== 'undefined' && window.location.protocol === 'https:' && COMPILE_ENDPOINT.includes('localhost')) {
        throw new Error('Local compiler unavailable on HTTPS public deployment. Falling back to in-browser engine.');
      }

      const res = await fetch(COMPILE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: code }),
        signal: AbortSignal.timeout(300),
      });

      if (!simulationActiveRef.current) return;

      if (res.ok) {
        const data = await res.json();
        if (!simulationActiveRef.current) return;
        const runner = new AvrRunner(data.hex, {
          onPinChange: (pin, isHigh) => {
            if (!simulationActiveRef.current) return;
            if (mcuComp) {
              const liveComps = useCircuitStore.getState().components;
              evaluator.handlePinOutputChange(mcuComp, String(pin), isHigh, liveComps, updateComponentState);
            }
          },
          onSerialByte: (byte) => {
            if (!simulationActiveRef.current) return;
            serialBufferRef.current += String.fromCharCode(byte);
            appendSerialText(String.fromCharCode(byte));
          },
          onAnalogRead: (pin) => {
            if (!simulationActiveRef.current) return 512;
            const liveComps = useCircuitStore.getState().components;
            const liveWires = useCircuitStore.getState().wires;
            const activeMcu =
              liveComps.find(
                (c) => c.type === 'arduino-uno' || c.type === 'arduino-nano' || c.type === 'esp32-devkit' || c.type === 'nodemcu-esp8266'
              ) || mcuComp;
            if (activeMcu) {
              return evaluator.readAnalogPin(activeMcu, String(pin), liveComps, liveWires);
            }
            return 512;
          },
        });
        runnerRef.current = runner;
        runner.start(() => {
          if (!simulationActiveRef.current) return;
          setIsRunning(false);
        });
        setIsRunning(true);
      } else {
        throw new Error('GCC compile server offline');
      }
    } catch {
      if (!simulationActiveRef.current) return;
      // In-browser JS CPU Fallback with Real-Time Sensor & Wiring Evaluation
      appendSerialText('[Simulator Engine] Live circuit simulation active...\n');
      const interpreter = new JsInterpreter(code, {
        onPinMode: (pin, mode) => {
          if (!simulationActiveRef.current) return;
          if (mode === 'INPUT_PULLUP' && mcuComp) {
            evaluator.setPinPullup(mcuComp, String(pin), true);
          }
        },
        onDigitalWrite: (pin, high) => {
          if (!simulationActiveRef.current) return;
          const liveComps = useCircuitStore.getState().components;
          const liveWires = useCircuitStore.getState().wires;
          if (mcuComp) {
            evaluator.handlePinOutputChange(mcuComp, String(pin), high, liveComps, updateComponentState);
          }
          const pinStr = String(pin);
          const targetBuzzer =
            liveComps.find((c) => {
              if (c.type !== 'buzzer') return false;
              return liveWires.some(
                (w) =>
                  (w.fromComponentId === mcuComp?.id && (w.fromPinId === pinStr || w.fromPinId === `D${pinStr}`) && w.toComponentId === c.id) ||
                  (w.toComponentId === mcuComp?.id && (w.toPinId === pinStr || w.toPinId === `D${pinStr}`) && w.fromComponentId === c.id)
              );
            }) || liveComps.find((c) => c.type === 'buzzer');

          if (targetBuzzer) {
            updateComponentState(targetBuzzer.id, { active: high, sounding: high });
          }
        },
        onDigitalRead: (pin) => {
          if (!simulationActiveRef.current) return false;
          if (mcuComp) {
            return evaluator.readDigitalPin(mcuComp, String(pin));
          }
          const liveComps = useCircuitStore.getState().components;
          const btnComp = liveComps.find((c) => c.type === 'pushbutton');
          if (btnComp && btnComp.props.pressed) return true;
          return false;
        },
        onAnalogRead: (pin) => {
          if (!simulationActiveRef.current) return 512;
          const liveComps = useCircuitStore.getState().components;
          const liveWires = useCircuitStore.getState().wires;
          const activeMcu =
            liveComps.find(
              (c) => c.type === 'arduino-uno' || c.type === 'arduino-nano' || c.type === 'esp32-devkit' || c.type === 'nodemcu-esp8266'
            ) || mcuComp;
          if (activeMcu) {
            return evaluator.readAnalogPin(activeMcu, String(pin), liveComps, liveWires);
          }
          return 512;
        },
        onAnalogWrite: () => {},
        onTone: (pin, frequency) => {
          if (!simulationActiveRef.current) return;
          const liveComps = useCircuitStore.getState().components;
          const liveWires = useCircuitStore.getState().wires;
          if (mcuComp) {
            evaluator.handlePinOutputChange(mcuComp, String(pin), true, liveComps, updateComponentState);
          }
          const pinStr = String(pin);
          const targetBuzzer =
            liveComps.find((c) => {
              if (c.type !== 'buzzer') return false;
              return liveWires.some(
                (w) =>
                  (w.fromComponentId === mcuComp?.id &&
                    (w.fromPinId === pinStr || w.fromPinId === `D${pinStr}`) &&
                    w.toComponentId === c.id) ||
                  (w.toComponentId === mcuComp?.id &&
                    (w.toPinId === pinStr || w.toPinId === `D${pinStr}`) &&
                    w.fromComponentId === c.id)
              );
            }) || liveComps.find((c) => c.type === 'buzzer');

          if (targetBuzzer) {
            updateComponentState(targetBuzzer.id, { active: true, sounding: true, frequency });
          }
        },
        onNoTone: (pin) => {
          if (!simulationActiveRef.current) return;
          const liveComps = useCircuitStore.getState().components;
          if (mcuComp) {
            evaluator.handlePinOutputChange(mcuComp, String(pin), false, liveComps, updateComponentState);
          }
          const buzzers = liveComps.filter((c) => c.type === 'buzzer');
          buzzers.forEach((b) => {
            updateComponentState(b.id, { active: false, sounding: false });
          });
        },
        onServoWrite: (pin, angle) => {
          if (!simulationActiveRef.current) return;
          const liveComps = useCircuitStore.getState().components;
          const liveWires = useCircuitStore.getState().wires;
          const clampedAngle = Math.max(0, Math.min(180, Math.round(angle)));

          // Find servo wired to this MCU pin, or fallback to any servo in circuit
          const pinStr = String(pin);
          const targetServo =
            liveComps.find((c) => {
              if (c.type !== 'servo') return false;
              return liveWires.some(
                (w) =>
                  (w.fromComponentId === mcuComp?.id &&
                    (w.fromPinId === pinStr || w.fromPinId === `D${pinStr}`) &&
                    w.toComponentId === c.id) ||
                  (w.toComponentId === mcuComp?.id &&
                    (w.toPinId === pinStr || w.toPinId === `D${pinStr}`) &&
                    w.fromComponentId === c.id)
              );
            }) || liveComps.find((c) => c.type === 'servo');

          if (targetServo) {
            updateComponentState(targetServo.id, { angle: clampedAngle });
          }
        },
        onStepperStep: (steps, speedRpm, angle) => {
          if (!simulationActiveRef.current) return;
          const liveComps = useCircuitStore.getState().components;
          const targetStepper = liveComps.find((c) => c.type === 'stepper-motor');
          if (targetStepper) {
            const prevAngle = targetStepper.state?.angle ?? targetStepper.props?.angle ?? 0;
            const newAngle = angle !== undefined ? angle : (prevAngle + steps * 1.8) % 360;
            updateComponentState(targetStepper.id, {
              angle: newAngle,
              step: (targetStepper.state?.step ?? 0) + steps,
              speed: speedRpm,
            });
          }
        },
        onLcdUpdate: (line1, line2) => {
          if (!simulationActiveRef.current) return;
          const liveComps = useCircuitStore.getState().components;
          const lcdComps = liveComps.filter((c) => c.type === 'lcd1602' || c.type === 'lcd1602-i2c');
          lcdComps.forEach((lcd) => {
            updateComponentState(lcd.id, { line1, line2, text: `${line1}\n${line2}` });
          });
        },
        onSerialPrint: (text) => {
          if (!simulationActiveRef.current) return;
          serialBufferRef.current += text;
          appendSerialText(text);
        },
      });

      if (!simulationActiveRef.current) {
        interpreter.stop();
        return;
      }

      jsInterpreterRef.current = interpreter;
      interpreter.start();
      setIsRunning(true);
    } finally {
      setIsCompiling(false);
    }
  }, [code, isRunning, handleStop, setCompileError, setIsCompiling, setSerialText, appendSerialText, updateComponentState, setIsRunning, components, wires]);

  const handleSignOut = useCallback(() => {
    authService.signOut();
    setCurrentUser(null);
    setCurrentProjectId(undefined);
    setShowProjectsModal(false);
    setShowAuthModal(false);
  }, []);

  if (currentView === 'home') {
    return (
      <>
        <DashboardHomePage
          onLaunchSimulator={() => {
            handleCreateNewProject();
            navigateToView('simulator');
          }}
          onNavigatePrivacy={() => navigateToView('privacy')}
          onNavigateTerms={() => navigateToView('terms')}
          onOpenProject={(project) => {
            handleOpenProject(project);
            navigateToView('simulator');
          }}
          onCreatePresetCircuit={(presetId, templateData) => {
            if (templateData && templateData.components) {
              setCircuitName(templateData.name || 'Circuit Template');
              loadCircuit(templateData.components, templateData.wires || [], templateData.code || '');
              const targetUserId = currentUser ? currentUser.id : 'guest_user';
              const existing = authService.getProjects(targetUserId);
              const match = existing.find((p) => (p.name || '').trim().toLowerCase() === (templateData.name || '').trim().toLowerCase());
              if (match) {
                setCurrentProjectId(match.id);
              } else {
                setCurrentProjectId(undefined);
              }
            } else {
              handleLaunchPreset(presetId);
            }
            navigateToView('simulator');
          }}
          onOpenAuthModal={() => setShowAuthModal(true)}
          onSignOut={handleSignOut}
          currentUser={currentUser}
        />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={(user) => setCurrentUser(user)}
        />
      </>
    );
  }

  if (currentView === 'privacy') {
    return (
      <PrivacyPolicyPage
        onNavigateHome={() => navigateToView('home')}
        onNavigateSimulator={() => navigateToView('simulator')}
        onNavigateTerms={() => navigateToView('terms')}
      />
    );
  }

  if (currentView === 'terms') {
    return (
      <TermsConditionsPage
        onNavigateHome={() => navigateToView('home')}
        onNavigateSimulator={() => navigateToView('simulator')}
        onNavigatePrivacy={() => navigateToView('privacy')}
      />
    );
  }

  return (
    <div className="clean-app" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-canvas)', overflow: 'hidden' }}>
      
      {/* SaaS Header Bar */}
      <BillionDollarTopBar
        circuitName={circuitName}
        onNameChange={setCircuitName}
        onRotateSelected={() => selectedId && handleRotateComponent(selectedId)}
        onDeleteSelected={() => {
          if (selectedId) handleDeleteComponent(selectedId);
          else if (selectedWireId) handleDeleteWire(selectedWireId);
        }}
        onDuplicateSelected={() => selectedId && duplicateComponent(selectedId)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        selectedColor={wireColor}
        onColorChange={setWireColor}
        selectedWireType={wireType}
        onWireTypeChange={setWireType}
        showCode={showCode}
        onToggleCode={toggleShowCode}
        showDrawer={showDrawer}
        onToggleDrawer={toggleShowDrawer}
        onOpenBOM={() => setShowBOM(true)}
        onOpenPCB={() => setShowPCB(true)}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
        onOpenShortcuts={() => setShowShortcuts(true)}
        onOpenLearning={() => setShowLearning(true)}
        onClearCanvas={handleClearCanvas}
        onSaveFile={saveToFile}
        onLoadFile={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          if (f.size > 5 * 1024 * 1024) {
            alert('Security Notice: Imported schematic file exceeds maximum size limit of 5MB.');
            return;
          }
          loadFromFile(f);
        }}
        isRunning={isRunning}
        onToggleSimulation={handleToggleSimulation}
        hasSelection={!!selectedId || !!selectedWireId}
        wiringActive={!!wiringStartPin}
        onCancelWiring={cancelWiring}
        user={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenProjects={() => setShowProjectsModal(true)}
        onSignOut={handleSignOut}
        onSaveProjectCloud={handleSaveProjectCloud}
        isSavingCloud={isSavingCloud}
        onNavigateHome={() => navigateToView('home')}
        onNavigatePrivacy={() => navigateToView('privacy')}
        onNavigateTerms={() => navigateToView('terms')}
      />

      {/* Main Workspace Area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        
        {/* Workspace Canvas (2D CAD Mode) */}
        <main style={{ flex: 1, position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}>
          <ErrorBoundary fallbackTitle="Workspace Canvas Error">
            <Workspace2D
              components={components}
              wires={wires}
              selectedId={selectedId}
              selectedWireId={selectedWireId}
              onSelectComponent={setSelectedId}
              onSelectWire={setSelectedWireId}
              onMoveComponent={handleMoveComponent}
              onRotateComponent={handleRotateComponent}
              onDeleteComponent={handleDeleteComponent}
              onDeleteWire={handleDeleteWire}
              onDuplicateComponent={duplicateComponent}
              wiringStartPin={wiringStartPin}
              onPinClick={handlePinClick}
              isRunning={isRunning}
              wireColor={wireColor}
              setWireColor={setWireColor}
              cancelWiring={cancelWiring}
            />
          </ErrorBoundary>
        </main>

        {/* Draggable & Resizable Code & Serial Window */}
        <DraggableCodeWindow
          isOpen={showCode}
          onClose={toggleShowCode}
          code={code}
          onChangeCode={setCode}
          onCompileRun={handleToggleSimulation}
          onStop={handleStop}
          isRunning={isRunning}
          isCompiling={isCompiling}
          compileError={compileError}
          serialText={serialText}
          onClearSerial={() => setSerialText('')}
        />

        {/* Component Drawer Sidebar */}
        {showDrawer && (
          <ErrorBoundary fallbackTitle="Component Drawer Error">
            <TinkercadComponentDrawer
              onAddComponent={handleAddComponent}
              onClose={() => setShowDrawer(false)}
            />
          </ErrorBoundary>
        )}

      </div>

      {/* Sensor / Component Inspector Modal */}
      {selectedComponent && (
        <SensorInspectorModal
          component={selectedComponent}
          onUpdateProps={updateComponentProps}
          isRunning={isRunning}
        />
      )}

      {/* Bill of Materials Modal */}
      {showBOM && (
        <BOMExporter
          components={components}
          onClose={() => setShowBOM(false)}
        />
      )}

      {/* PCB View Modal */}
      {showPCB && (
        <PCBViewModal
          components={components}
          wires={wires}
          onClose={() => setShowPCB(false)}
        />
      )}

      {/* Command Palette Modal (⌘K) */}
      <CommandPaletteModal
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onSelectComponent={handleAddComponent}
        onToggleSimulation={handleToggleSimulation}
        onOpenCode={() => toggleShowCode()}
        onOpenBOM={() => setShowBOM(true)}
        onOpenPCB={() => setShowPCB(true)}
        onOpenShortcuts={() => setShowShortcuts(true)}
        onClearCanvas={handleClearCanvas}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      {/* Keyboard Shortcuts Cheat Sheet Overlay (?) */}
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      {/* Learning Center Tutorials Modal */}
      <LearningCenterModal
        isOpen={showLearning}
        onClose={() => setShowLearning(false)}
        onLaunchCourse={(presetComps, presetWires, presetCode) => {
          loadCircuit(presetComps, presetWires, presetCode);
        }}
      />

      {/* Floating Mobile Touch Action Bar */}
      <MobileQuickBar
        isRunning={isRunning}
        onToggleSimulation={handleToggleSimulation}
        onOpenDrawer={() => setShowDrawer(true)}
        onToggleCode={toggleShowCode}
        showCode={showCode}
        selectedId={selectedId}
        selectedWireId={selectedWireId}
        onRotateSelected={() => selectedId && handleRotateComponent(selectedId)}
        onDeleteSelected={() => {
          if (selectedId) handleDeleteComponent(selectedId);
          else if (selectedWireId) handleDeleteWire(selectedWireId);
        }}
        selectedColor={wireColor}
        onColorChange={setWireColor}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* Recent Projects Dashboard Modal */}
      <ProjectsDashboardModal
        isOpen={showProjectsModal}
        user={currentUser}
        currentProjectId={currentProjectId}
        onClose={() => setShowProjectsModal(false)}
        onOpenProject={handleOpenProject}
        onCreateNewProject={handleCreateNewProject}
        onOpenAuth={() => setShowAuthModal(true)}
        onSignOut={handleSignOut}
      />
    </div>
  );
}
