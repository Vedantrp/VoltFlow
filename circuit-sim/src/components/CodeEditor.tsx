import Editor, { loader, type OnMount } from '@monaco-editor/react';
import { Loader2, Play, RefreshCw, Square, Zap, Code } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

// Configure CDN loader with reliable fast CDN mirrors
loader.config({
  paths: {
    vs: 'https://unpkg.com/monaco-editor@0.43.0/min/vs',
  },
});

interface Props {
  code: string;
  onChange: (code: string) => void;
  onCompileRun: () => void;
  onStop: () => void;
  isRunning: boolean;
  isCompiling: boolean;
  compileError: string | null;
}

const ARDUINO_LIBRARIES = [
  { name: 'Servo.h', header: '#include <Servo.h>\n', desc: 'Servo Motor Control' },
  { name: 'LiquidCrystal_I2C.h', header: '#include <LiquidCrystal_I2C.h>\n', desc: 'I2C LCD1602 / 2004 Display' },
  { name: 'DHT.h', header: '#include <DHT.h>\n', desc: 'DHT11 / DHT22 Temp & Humidity' },
  { name: 'Adafruit_NeoPixel.h', header: '#include <Adafruit_NeoPixel.h>\n', desc: 'WS2812 RGB LED Matrix/Strip' },
  { name: 'Stepper.h', header: '#include <Stepper.h>\n', desc: 'Stepper Motor Driver' },
  { name: 'Wire.h', header: '#include <Wire.h>\n', desc: 'I2C Master/Slave Communication' },
  { name: 'SPI.h', header: '#include <SPI.h>\n', desc: 'SPI High-Speed Bus' },
];

const ARDUINO_TEMPLATES = [
  {
    name: '💡 Blink (Built-in LED)',
    code: `void setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}`,
  },
  {
    name: '🔘 Button → LED',
    code: `const int BUTTON_PIN = 2;\nconst int LED_PIN = 13;\n\nvoid setup() {\n  pinMode(BUTTON_PIN, INPUT_PULLUP);\n  pinMode(LED_PIN, OUTPUT);\n}\n\nvoid loop() {\n  int btnState = digitalRead(BUTTON_PIN);\n  if (btnState == LOW) {\n    digitalWrite(LED_PIN, HIGH);\n  } else {\n    digitalWrite(LED_PIN, LOW);\n  }\n}`,
  },
  {
    name: '🎚 Potentiometer Serial Read',
    code: `void setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int val = analogRead(A0);\n  float voltage = val / 1023.0 * 5.0;\n  Serial.print("ADC: ");\n  Serial.print(val);\n  Serial.print("  Voltage: ");\n  Serial.println(voltage);\n  delay(200);\n}`,
  },
  {
    name: '🦾 Servo Motor Sweep (#include <Servo.h>)',
    code: `#include <Servo.h>\n\nServo myServo;\n#define SERVO_PIN 3\n\nvoid setup() {\n  myServo.attach(SERVO_PIN);\n}\n\nvoid loop() {\n  for (int angle = 0; angle <= 180; angle += 5) {\n    myServo.write(angle);\n    delay(15);\n  }\n  for (int angle = 180; angle >= 0; angle -= 5) {\n    myServo.write(angle);\n    delay(15);\n  }\n}`,
  },
  {
    name: '🌡 DHT11 Temp & Humidity (#include <DHT.h>)',
    code: `#include <DHT.h>\n\n#define DHTPIN 2\n#define DHTTYPE DHT11\nDHT dht(DHTPIN, DHTTYPE);\n\nvoid setup() {\n  Serial.begin(9600);\n  dht.begin();\n}\n\nvoid loop() {\n  float temperature = dht.readTemperature();\n  float humidity = dht.readHumidity();\n  Serial.print("Temp: ");\n  Serial.print(temperature);\n  Serial.print(" C  Humidity: ");\n  Serial.print(humidity);\n  Serial.println(" %");\n  delay(1500);\n}`,
  },
  {
    name: '📺 LCD1602 I2C Display (#include <LiquidCrystal_I2C.h>)',
    code: `#include <Wire.h>\n#include <LiquidCrystal_I2C.h>\n\nLiquidCrystal_I2C lcd(0x27, 16, 2);\n\nvoid setup() {\n  lcd.init();\n  lcd.backlight();\n  lcd.setCursor(0, 0);\n  lcd.print("VoltFlow Studio");\n  lcd.setCursor(0, 1);\n  lcd.print("Ready to Sim!");\n}\n\nvoid loop() {\n  delay(1000);\n}`,
  },
  {
    name: '🔊 Gas Sensor + Buzzer Alert',
    code: `const int GAS_PIN = A0;\nconst int BUZZER_PIN = 8;\nconst int LED_PIN = 13;\n\nvoid setup() {\n  pinMode(BUZZER_PIN, OUTPUT);\n  pinMode(LED_PIN, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int gasLevel = analogRead(GAS_PIN);\n  Serial.print("Gas PPM: ");\n  Serial.println(gasLevel);\n  if (gasLevel > 400) {\n    digitalWrite(BUZZER_PIN, HIGH);\n    digitalWrite(LED_PIN, HIGH);\n  } else {\n    digitalWrite(BUZZER_PIN, LOW);\n    digitalWrite(LED_PIN, LOW);\n  }\n  delay(300);\n}`,
  },
  {
    name: '📏 HC-SR04 Distance Meter',
    code: `const int TRIG_PIN = 9;\nconst int ECHO_PIN = 10;\n\nvoid setup() {\n  pinMode(TRIG_PIN, OUTPUT);\n  pinMode(ECHO_PIN, INPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  digitalWrite(TRIG_PIN, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG_PIN, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG_PIN, LOW);\n  long duration = pulseIn(ECHO_PIN, HIGH);\n  int distanceCm = duration * 0.034 / 2;\n  Serial.print("Distance: ");\n  Serial.print(distanceCm);\n  Serial.println(" cm");\n  delay(500);\n}`,
  },
];

export function CodeEditor({
  code,
  onChange,
  onCompileRun,
  onStop,
  isRunning,
  isCompiling,
  compileError,
}: Props) {
  const providerRegistered = useRef(false);
  const [monacoLoaded, setMonacoLoaded] = useState(false);
  const [forceSimpleMode, setForceSimpleMode] = useState(false);

  // Auto fallback to Simple Code Editor if Monaco takes longer than 2.5 seconds on slow CDN connections
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!monacoLoaded) {
        setForceSimpleMode(true);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [monacoLoaded]);

  const handleEditorMount: OnMount = (_editor, monaco) => {
    setMonacoLoaded(true);
    setForceSimpleMode(false);
    if (providerRegistered.current) return;
    providerRegistered.current = true;

    // Register Emmet Snippets & C++ / Arduino Completion Provider
    monaco.languages.registerCompletionItemProvider('cpp', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = [
          {
            label: 'setup',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'void setup() {\n\t$0\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Arduino setup() function',
            range,
          },
          {
            label: 'loop',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'void loop() {\n\t$0\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Arduino loop() function',
            range,
          },
          {
            label: '#include <Servo.h>',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '#include <Servo.h>\n',
            detail: 'Include Servo Motor Library',
            range,
          },
          {
            label: '#include <LiquidCrystal_I2C.h>',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '#include <Wire.h>\n#include <LiquidCrystal_I2C.h>\n',
            detail: 'Include LCD1602 I2C Display Library',
            range,
          },
          {
            label: '#include <DHT.h>',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '#include <DHT.h>\n',
            detail: 'Include DHT Temperature & Humidity Library',
            range,
          },
          {
            label: '#include <Adafruit_NeoPixel.h>',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '#include <Adafruit_NeoPixel.h>\n',
            detail: 'Include WS2812 RGB NeoPixel Library',
            range,
          },
          {
            label: '#include <Stepper.h>',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '#include <Stepper.h>\n',
            detail: 'Include Stepper Motor Library',
            range,
          },
          {
            label: 'pinMode',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'pinMode(${1:13}, ${2|OUTPUT,INPUT,INPUT_PULLUP|});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Configure pin mode',
            range,
          },
          {
            label: 'digitalWrite',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'digitalWrite(${1:13}, ${2|HIGH,LOW|});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Write digital output pin',
            range,
          },
          {
            label: 'digitalRead',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'digitalRead(${1:2});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Read digital input pin',
            range,
          },
          {
            label: 'analogRead',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'analogRead(${1:A0});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Read 10-bit analog pin value',
            range,
          },
          {
            label: 'analogWrite',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'analogWrite(${1:9}, ${2:128});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'PWM output (0-255)',
            range,
          },
          {
            label: 'tone',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'tone(${1:8}, ${2:1000}, ${3:500});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Generate tone frequency on pin',
            range,
          },
          {
            label: 'noTone',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'noTone(${1:8});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Stop tone generation on pin',
            range,
          },
          {
            label: 'Serial.begin',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'Serial.begin(${1:9600});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Initialize serial baud rate',
            range,
          },
          {
            label: 'Serial.println',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'Serial.println(${1:"Hello"});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Print text to Serial Monitor',
            range,
          },
          {
            label: 'delay',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'delay(${1:1000});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Pause execution in ms',
            range,
          },
        ];

        return { suggestions };
      },
    });
  };

  const handleIncludeLibrary = (libHeader: string) => {
    if (code.includes(libHeader.trim())) return;
    onChange(`${libHeader}${code}`);
  };

  return (
    <div className="code-editor-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1, overflow: 'hidden', padding: 8 }}>
      <div className="code-editor-toolbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, paddingBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <button
            className="clean-btn clean-btn-success"
            onClick={onCompileRun}
            disabled={isCompiling}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 30 }}
          >
            {isCompiling ? (
              <RefreshCw size={14} className="spin" />
            ) : isRunning ? (
              <RefreshCw size={14} />
            ) : (
              <Play size={14} fill="#ffffff" />
            )}
            {isCompiling ? 'Compiling…' : isRunning ? 'Recompile' : 'Run Code'}
          </button>
          {isRunning && (
            <button className="clean-btn clean-btn-danger" onClick={onStop} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 30 }}>
              <Square size={14} fill="#ffffff" /> Stop
            </button>
          )}

          {/* Toggle between Monaco Editor & Fast Code Editor */}
          <button
            onClick={() => setForceSimpleMode((prev) => !prev)}
            title={forceSimpleMode ? 'Switch to Monaco rich C++ editor' : 'Switch to fast lightweight code editor'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11,
              fontWeight: 600,
              padding: '0 10px',
              height: 30,
              borderRadius: 6,
              backgroundColor: forceSimpleMode ? '#3f3f46' : '#27272a',
              border: '1px solid #52525b',
              color: forceSimpleMode ? '#38bdf8' : '#a1a1aa',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {forceSimpleMode ? <Zap size={12} fill="#38bdf8" /> : <Code size={12} />}
            {forceSimpleMode ? 'Fast Editor' : 'Monaco Mode'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'flex-end', minWidth: 200 }}>
          {/* Quick Library Include Selector */}
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleIncludeLibrary(e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
            style={{
              fontSize: 11,
              fontWeight: 600,
              height: 30,
              padding: '0 8px',
              borderRadius: 6,
              backgroundColor: '#18181b',
              border: '1px solid #3f3f46',
              color: '#38bdf8',
              outline: 'none',
              cursor: 'pointer',
              flex: '1 1 120px',
              minWidth: 115,
              maxWidth: 170,
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <option value="" disabled>📦 + Library…</option>
            {ARDUINO_LIBRARIES.map((lib) => (
              <option key={lib.name} value={lib.header}>
                {lib.name} ({lib.desc})
              </option>
            ))}
          </select>

          {/* Code Templates Dropdown */}
          <select
            onChange={(e) => {
              const tmpl = ARDUINO_TEMPLATES.find((t) => t.name === e.target.value);
              if (tmpl) onChange(tmpl.code);
            }}
            defaultValue=""
            style={{
              fontSize: 11,
              fontWeight: 600,
              height: 30,
              padding: '0 8px',
              borderRadius: 6,
              backgroundColor: '#27272a',
              border: '1px solid #3f3f46',
              color: '#ffffff',
              outline: 'none',
              cursor: 'pointer',
              flex: '1 1 140px',
              minWidth: 135,
              maxWidth: 190,
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <option value="" disabled>Load Starter Sketch…</option>
            {ARDUINO_TEMPLATES.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, width: '100%', position: 'relative', overflow: 'hidden' }}>
        {forceSimpleMode ? (
          <textarea
            value={code}
            onChange={(e) => onChange(e.target.value)}
            placeholder="// Type or paste your Arduino C++ code here..."
            spellCheck={false}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#18181b',
              color: '#4ade80',
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: 13,
              lineHeight: '1.5',
              padding: 12,
              border: '1px solid #3f3f46',
              borderRadius: 6,
              outline: 'none',
              resize: 'none',
              boxSizing: 'border-box',
            }}
          />
        ) : (
          <Editor
            height="100%"
            defaultLanguage="cpp"
            theme="vs-dark"
            value={code}
            onChange={(value) => onChange(value ?? '')}
            onMount={handleEditorMount}
            loading={
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#1e1e1e', color: '#94a3b8', fontSize: 13, gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Loader2 size={16} className="spin" /> Initializing Arduino C++ Editor...
                </div>
                <button
                  onClick={() => setForceSimpleMode(true)}
                  style={{
                    fontSize: 11,
                    padding: '4px 10px',
                    borderRadius: 4,
                    backgroundColor: '#27272a',
                    border: '1px solid #52525b',
                    color: '#38bdf8',
                    cursor: 'pointer',
                  }}
                >
                  ⚡ Open Fast Code Editor Immediately
                </button>
              </div>
            }
            options={{
              fontSize: 13,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 8 },
              quickSuggestions: { other: true, comments: false, strings: true },
              snippetSuggestions: 'top',
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: 'on',
              automaticLayout: true,
            }}
          />
        )}
      </div>
      {compileError && (
        <pre className="compile-error" style={{ color: '#ef4444', backgroundColor: '#450a0a', padding: 8, borderRadius: 6, fontSize: 11, whiteSpace: 'pre-wrap', marginTop: 6 }}>
          {compileError}
        </pre>
      )}
    </div>
  );
}

