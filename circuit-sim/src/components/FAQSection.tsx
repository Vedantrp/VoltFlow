import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Cpu,
  Zap,
  Terminal,
  Layers,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export interface FAQItem {
  id: string;
  category: 'General' | 'Arduino & C++' | 'Sensors' | 'PCB & Export' | 'Mobile';
  question: string;
  answer: string;
  highlight?: string;
}

export const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'Arduino & C++',
    question: 'How do I simulate Arduino Uno, ESP32, and sensors online in VoltFlow?',
    answer:
      'Select a microcontroller (Arduino Uno R3, Arduino Nano, ESP32 DevKit, or NodeMCU ESP8266) from the Component Drawer on the right. Wire sensor pins (VCC, GND, and Signal/Data) directly to the microcontroller headers or a breadboard. Click "Code & Serial" to open the built-in C++ editor, write or paste your sketch (with setup() and loop()), and press "Start Simulation". VoltFlow immediately executes your code and updates circuit components in real time.',
    highlight: 'Zero hardware needed — 100% in-browser C++ execution.',
  },
  {
    id: 'faq-2',
    category: 'Arduino & C++',
    question: 'How do I use the interactive Serial Monitor & Serial Plotter?',
    answer:
      'Click the "Code & Serial" button in the top navigation bar to open the editor, then click "Open Serial Monitor". You can type interactive keyboard commands, numbers, and strings into the input bar and click "Send". Sketches using Serial.read(), Serial.parseInt(), or Serial.readString() will react to your input instantly, while Serial.println() telemetry displays in real time without lag.',
    highlight: 'Supports interactive keyboard input, char matching, and live baud rates.',
  },
  {
    id: 'faq-3',
    category: 'General',
    question: 'How does VoltFlow compare to Tinkercad Circuits, Wokwi, and Proteus?',
    answer:
      'VoltFlow combines the clean 2D drag-and-drop wiring experience of Tinkercad with the raw C++ compilation speed and ESP32/NodeMCU capabilities of Wokwi. Unlike heavy desktop software like Proteus or Multisim, VoltFlow runs natively in any modern web browser without downloading gigabytes of installers, drivers, or plugins. VoltFlow also includes automated Bill of Materials (BOM) export and an integrated PCB trace viewer with Gerber generation.',
    highlight: 'Modern, fast, and free alternative with full mobile and desktop support.',
  },
  {
    id: 'faq-4',
    category: 'Sensors',
    question: 'Can I simulate DHT11, Ultrasonic HC-SR04, Gas, and Servo motors?',
    answer:
      'Yes! Every sensor in VoltFlow features dynamic, interactive widgets. You can drag the temperature and humidity sliders on the DHT11 sensor, adjust distance on the Ultrasonic sensor, change PPM concentration on the MQ-2 Gas sensor, or turn a potentiometer knob. Actuators like SG90 Servo motors sweep angles in real time based on myServo.write(angle) in your code.',
    highlight: 'Real-time interactive sliders and live sensor badges.',
  },
  {
    id: 'faq-5',
    category: 'PCB & Export',
    question: 'How do I export PCB Gerber files and a Bill of Materials (BOM)?',
    answer:
      'When your circuit design is ready, click "Export BOM" in the top bar to download an itemized parts list with component references, footprints, values, and quantities in CSV format. Click "PCB View" to inspect automated copper trace routing, and click "Export Gerbers" to download industry-standard RS-274X Gerber zip files ready for fabrication with JLCPCB or PCBWay.',
    highlight: 'One-click automated BOM generation and RS-274X Gerber exports.',
  },
  {
    id: 'faq-6',
    category: 'Mobile',
    question: 'Does VoltFlow work on mobile phones and tablets?',
    answer:
      'Yes! VoltFlow features a touch-optimized Mobile Quick Bar for smartphones and iPads. You can pan, zoom the canvas, place and rotate components, inspect live sensor badges, toggle simulation, and edit C++ firmware code smoothly on iOS, iPadOS, and Android browsers with 60 FPS touch responsiveness.',
    highlight: 'Responsive touch controls and mobile-friendly floating quick bar.',
  },
  {
    id: 'faq-7',
    category: 'General',
    question: 'Is VoltFlow Studio free to use, and do I need to create an account?',
    answer:
      'VoltFlow is 100% free for students, educators, hobbyists, and professional engineers. You can start designing circuits immediately as a guest with zero sign-up. Creating an optional free account enables cloud autosaving so you can access your saved circuits from any computer or mobile device.',
    highlight: 'Free forever with no paywalls or trial expirations.',
  },
  {
    id: 'faq-8',
    category: 'Arduino & C++',
    question: 'How fast is the simulation engine and C++ compiler backend?',
    answer:
      'VoltFlow uses an ultra-fast hybrid architecture: when online, sketches compile against high-speed GCC and AVR/ESP toolchains in milliseconds. If working offline or during rapid prototyping, VoltFlow’s lightweight in-browser execution engine evaluates digital logic, analog ADC voltages, and PWM timings at 60 FPS without freezing your browser.',
    highlight: 'Sub-second compilation and 60 FPS real-time logic evaluation.',
  },
];

interface FAQSectionProps {
  onLaunchSimulator: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ onLaunchSimulator }) => {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    'faq-1': true, // First question open by default for immediate value
    'faq-2': false,
  });
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const toggleFAQ = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const categories = ['All', 'Arduino & C++', 'Sensors', 'PCB & Export', 'Mobile', 'General'];

  const filteredFaqs = FAQ_DATA.filter((item) => {
    if (activeCategory === 'All') return true;
    return item.category === activeCategory;
  });

  return (
    <section
      id="faq-section"
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E2DACD',
        borderBottom: '1px solid #E2DACD',
        padding: '72px 24px',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* SECTION HEADER */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#82977E',
              marginBottom: 10,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#F7F4EE',
              padding: '6px 14px',
              borderRadius: 20,
              border: '1px solid #E2DACD',
            }}
          >
            <HelpCircle size={14} color="#E98B5A" /> FREQUENTLY ASKED QUESTIONS &amp; GUIDES
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 32,
              fontWeight: 700,
              color: '#1F2321',
              margin: '12px 0 8px 0',
            }}
          >
            Answers to Common Circuit Simulation Questions
          </h2>
          <p style={{ fontSize: 15, color: '#5F6862', maxWidth: 640, margin: '0 auto', lineHeight: 1.6 }}>
            Everything you need to know about simulating Arduino, ESP32, interactive sensors, C++ code execution, and PCB exports in VoltFlow Studio.
          </p>

          {/* CATEGORY FILTER TABS */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 8,
              marginTop: 28,
            }}
          >
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    backgroundColor: isActive ? '#2F3E34' : '#F7F4EE',
                    color: isActive ? '#FFFFFF' : '#4A524D',
                    border: `1px solid ${isActive ? '#2F3E34' : '#E2DACD'}`,
                    padding: '8px 16px',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* ACCORDION LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filteredFaqs.map((faq) => {
            const isOpen = !!openIds[faq.id];
            return (
              <div
                key={faq.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: `1px solid ${isOpen ? '#CBBBA0' : '#E8E2D8'}`,
                  borderRadius: 12,
                  boxShadow: isOpen ? '0 6px 20px rgba(47, 62, 52, 0.06)' : '0 2px 8px rgba(47, 62, 52, 0.02)',
                  transition: 'all 0.2s ease',
                  overflow: 'hidden',
                }}
              >
                {/* QUESTION ROW */}
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  aria-expanded={isOpen}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: isOpen ? '#FAF8F4' : '#FFFFFF',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    gap: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 9px',
                        borderRadius: 10,
                        backgroundColor: '#F0EAE1',
                        color: '#2F3E34',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {faq.category}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 16,
                        fontWeight: 700,
                        color: '#1F2321',
                        lineHeight: 1.4,
                      }}
                    >
                      {faq.question}
                    </span>
                  </div>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: isOpen ? '#E98B5A' : '#F0EAE1',
                      color: isOpen ? '#FFFFFF' : '#4A524D',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {/* EXPANDED ANSWER */}
                {isOpen && (
                  <div
                    style={{
                      padding: '18px 24px 24px 24px',
                      borderTop: '1px solid #F0EAE1',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <p
                      style={{
                        fontSize: 14,
                        color: '#4A524D',
                        lineHeight: 1.7,
                        margin: '0 0 14px 0',
                      }}
                    >
                      {faq.answer}
                    </p>
                    {faq.highlight && (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#2F3E34',
                          backgroundColor: '#F7F4EE',
                          border: '1px solid #E2DACD',
                          padding: '4px 12px',
                          borderRadius: 6,
                        }}
                      >
                        <Sparkles size={13} color="#E98B5A" /> {faq.highlight}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* BOTTOM CALL TO ACTION BANNER */}
        <div
          style={{
            marginTop: 48,
            backgroundColor: '#2F3E34',
            borderRadius: 16,
            padding: '36px 32px',
            color: '#FFFFFF',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 24,
            boxShadow: '0 12px 32px rgba(47, 62, 52, 0.15)',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              Ready to build and test your circuit?
            </div>
            <p style={{ fontSize: 13, color: '#CBBBA0', margin: 0 }}>
              Launch VoltFlow Studio now — 100% free, runs instantly in your browser, no registration required.
            </p>
          </div>

          <button
            onClick={onLaunchSimulator}
            style={{
              backgroundColor: '#E98B5A',
              color: '#FFFFFF',
              border: 'none',
              padding: '12px 24px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(233, 139, 90, 0.4)',
              transition: 'transform 0.15s ease',
            }}
          >
            Launch Simulator Free <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};
