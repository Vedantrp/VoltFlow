import React, { useState } from 'react';
import { BookOpen, X, Play, CheckCircle2 } from 'lucide-react';
import type { PlacedComponent, WireConnection } from '../types';

interface TutorialCourse {
  id: string;
  title: string;
  category: 'Arduino' | 'Micro:bit' | 'IoT' | 'PCB Design' | 'Sensors';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  description: string;
  components: PlacedComponent[];
  wires: WireConnection[];
  code: string;
}

interface LearningCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchCourse: (components: PlacedComponent[], wires: WireConnection[], code: string) => void;
}

const COURSES: TutorialCourse[] = [
  {
    id: 'course-1',
    title: '1. Arduino LED Blink & Delay Loop',
    category: 'Arduino',
    level: 'Beginner',
    duration: '5 mins',
    description: 'Learn digital I/O programming by controlling a resistor-protected LED on Pin 13.',
    components: [
      { id: 'uno-1', type: 'arduino-uno', name: 'Arduino Uno R3', x: 60, y: 150, rotation: 0, props: {} },
      { id: 'led-1', type: 'led', name: 'LED Red', x: 380, y: 150, rotation: 0, props: { color: 'red' } },
      { id: 'res-1', type: 'resistor', name: 'Resistor 220Ω', x: 480, y: 150, rotation: 0, props: { resistance: 220 } },
    ],
    wires: [
      { id: 'w1', fromComponentId: 'uno-1', fromPinId: '13', toComponentId: 'res-1', toPinId: '1', color: 'red' },
      { id: 'w2', fromComponentId: 'res-1', fromPinId: '2', toComponentId: 'led-1', toPinId: 'A', color: 'red' },
      { id: 'w3', fromComponentId: 'led-1', fromPinId: 'C', toComponentId: 'uno-1', toPinId: 'GND1', color: 'black' },
    ],
    code: `void setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}`,
  },
  {
    id: 'course-2',
    title: '2. Pushbutton Pullup Digital Read',
    category: 'Sensors',
    level: 'Beginner',
    duration: '8 mins',
    description: 'Master internal pull-up resistors and digital reading with a tactile pushbutton switch.',
    components: [
      { id: 'uno-1', type: 'arduino-uno', name: 'Arduino Uno R3', x: 60, y: 150, rotation: 0, props: {} },
      { id: 'btn-1', type: 'pushbutton', name: 'Tactile Switch', x: 380, y: 150, rotation: 0, props: {} },
      { id: 'led-1', type: 'led', name: 'Status LED', x: 500, y: 150, rotation: 0, props: { color: 'green' } },
    ],
    wires: [
      { id: 'w1', fromComponentId: 'uno-1', fromPinId: '2', toComponentId: 'btn-1', toPinId: '1a', color: 'blue' },
      { id: 'w2', fromComponentId: 'btn-1', fromPinId: '1b', toComponentId: 'uno-1', toPinId: 'GND1', color: 'black' },
      { id: 'w3', fromComponentId: 'uno-1', fromPinId: '13', toComponentId: 'led-1', toPinId: 'A', color: 'red' },
      { id: 'w4', fromComponentId: 'led-1', fromPinId: 'C', toComponentId: 'uno-1', toPinId: 'GND2', color: 'black' },
    ],
    code: `const int BTN = 2;\nconst int LED = 13;\n\nvoid setup() {\n  pinMode(BTN, INPUT_PULLUP);\n  pinMode(LED, OUTPUT);\n}\n\nvoid loop() {\n  if (digitalRead(BTN) == LOW) {\n    digitalWrite(LED, HIGH);\n  } else {\n    digitalWrite(LED, LOW);\n  }\n}`,
  },
  {
    id: 'course-3',
    title: '3. Potentiometer Analog Voltage Sensing',
    category: 'Sensors',
    level: 'Intermediate',
    duration: '10 mins',
    description: 'Read analog voltage signals from a 10k potentiometer into ADC Pin A0.',
    components: [
      { id: 'uno-1', type: 'arduino-uno', name: 'Arduino Uno R3', x: 60, y: 150, rotation: 0, props: {} },
      { id: 'pot-1', type: 'potentiometer', name: 'Potentiometer 10k', x: 380, y: 150, rotation: 0, props: { value: 512 } },
    ],
    wires: [
      { id: 'w1', fromComponentId: 'uno-1', fromPinId: '5V', toComponentId: 'pot-1', toPinId: '2', color: 'red' },
      { id: 'w2', fromComponentId: 'pot-1', fromPinId: 'SIG', toComponentId: 'uno-1', toPinId: 'A0', color: 'blue' },
      { id: 'w3', fromComponentId: 'pot-1', fromPinId: '1', toComponentId: 'uno-1', toPinId: 'GND1', color: 'black' },
    ],
    code: `void setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int rawVal = analogRead(A0);\n  float voltage = rawVal * (5.0 / 1023.0);\n  Serial.print("Voltage: ");\n  Serial.print(voltage);\n  Serial.println(" V");\n  delay(200);\n}`,
  },
  {
    id: 'course-4',
    title: '4. ESP32 & MQ-2 Gas Leakage Alert',
    category: 'IoT',
    level: 'Advanced',
    duration: '15 mins',
    description: 'Build an IoT gas detector with high PPM thresholds and audio alert buzzer.',
    components: [
      { id: 'esp-1', type: 'esp32-devkit', name: 'ESP32 DevKit V1', x: 60, y: 150, rotation: 0, props: {} },
      { id: 'gas-1', type: 'gas-sensor', name: 'MQ-2 Gas / Smoke Sensor', x: 340, y: 150, rotation: 0, props: { gasPpm: 450, ppm: 450 } },
      { id: 'buzz-1', type: 'buzzer', name: 'Piezo Buzzer', x: 520, y: 150, rotation: 0, props: {} },
    ],
    wires: [
      { id: 'w1', fromComponentId: 'esp-1', fromPinId: '3V3', toComponentId: 'gas-1', toPinId: 'VCC', color: 'red' },
      { id: 'w2', fromComponentId: 'gas-1', fromPinId: 'AOUT', toComponentId: 'esp-1', toPinId: 'D34', color: 'blue' },
      { id: 'w3', fromComponentId: 'gas-1', fromPinId: 'GND', toComponentId: 'esp-1', toPinId: 'GND1', color: 'black' },
      { id: 'w4', fromComponentId: 'esp-1', fromPinId: 'D13', toComponentId: 'buzz-1', toPinId: '+', color: 'red' },
      { id: 'w5', fromComponentId: 'buzz-1', fromPinId: '-', toComponentId: 'esp-1', toPinId: 'GND2', color: 'black' },
    ],
    code: `const int GAS_PIN = 34;\nconst int BUZZER_PIN = 13;\n\nvoid setup() {\n  pinMode(BUZZER_PIN, OUTPUT);\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  int gasPPM = analogRead(GAS_PIN);\n  Serial.print("ESP32 Gas PPM: ");\n  Serial.println(gasPPM);\n  if (gasPPM > 400) {\n    digitalWrite(BUZZER_PIN, HIGH);\n  } else {\n    digitalWrite(BUZZER_PIN, LOW);\n  }\n  delay(300);\n}`,
  },
];

export const LearningCenterModal: React.FC<LearningCenterModalProps> = ({ isOpen, onClose, onLaunchCourse }) => {
  const [selectedCat, setSelectedCat] = useState<string>('All');

  if (!isOpen) return null;

  const filteredCourses = COURSES.filter((c) => selectedCat === 'All' || c.category === selectedCat);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 110,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 820,
          maxHeight: '85vh',
          backgroundColor: '#0F172A',
          border: '1px solid #334155',
          borderRadius: 20,
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ padding: '18px 24px', backgroundColor: '#1E293B', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: 10 }}>
              <BookOpen size={22} color="#06B6D4" /> VoltFlow Academy & Interactive Courses
            </h3>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
              Hands-on tutorials for Arduino, ESP32, Sensors, and Electronics.
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 6 }}>
            <X size={20} />
          </button>
        </div>

        {/* Categories Bar */}
        <div style={{ padding: '12px 24px', backgroundColor: '#0F172A', borderBottom: '1px solid #1E293B', display: 'flex', gap: 8 }}>
          {['All', 'Arduino', 'Sensors', 'IoT'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                backgroundColor: selectedCat === cat ? '#2563EB' : '#1E293B',
                color: selectedCat === cat ? '#ffffff' : '#94A3B8',
                border: '1px solid #334155',
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16, overflowY: 'auto' }}>
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              style={{
                backgroundColor: '#1E293B',
                borderRadius: 14,
                border: '1px solid #334155',
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 12,
                transition: 'all 0.2s ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, backgroundColor: '#0F172A', color: '#06B6D4', border: '1px solid #334155' }}>
                    {course.category} • {course.level}
                  </span>
                  <span style={{ fontSize: 11, color: '#94A3B8' }}>{course.duration}</span>
                </div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: 15, fontWeight: 700, color: '#F8FAFC' }}>
                  {course.title}
                </h4>
                <p style={{ margin: 0, fontSize: 12, color: '#94A3B8', lineHeight: 1.5 }}>
                  {course.description}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #334155', paddingTop: 12, marginTop: 4 }}>
                <span style={{ fontSize: 11, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={13} /> {course.components.length} Components ready
                </span>
                <button
                  onClick={() => {
                    onLaunchCourse(course.components, course.wires, course.code);
                    onClose();
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    backgroundColor: '#2563EB',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 12,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                  }}
                >
                  <Play size={14} fill="#ffffff" /> Launch Project
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
