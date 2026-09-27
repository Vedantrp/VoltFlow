import { describe, it, expect } from 'vitest';
import { JsInterpreter } from '../JsInterpreter';

describe('JsInterpreter Unit Tests', () => {
  it('resolves LED_BUILTIN and variable pin definitions', () => {
    const code = `
      int ledPin = 13;
      void setup() {
        pinMode(ledPin, OUTPUT);
      }
      void loop() {
        digitalWrite(ledPin, HIGH);
      }
    `;

    const writtenPins: Record<number, boolean> = {};
    const interpreter = new JsInterpreter(code, {
      onPinMode: () => {},
      onDigitalWrite: (pin, high) => {
        writtenPins[pin] = high;
      },
      onDigitalRead: () => false,
      onAnalogRead: () => 512,
      onAnalogWrite: () => {},
      onSerialPrint: () => {},
    });

    interpreter.start();
    // Allow tick to execute once
    expect(writtenPins[13]).toBe(true);
    interpreter.stop();
  });

  it('evaluates LM35 analogRead temperature calculations and Serial output', () => {
    const code = `
      void setup() {
        Serial.begin(9600);
      }
      void loop() {
        int rawADC = analogRead(A0);
        float voltageMv = rawADC * (5000.0 / 1024.0);
        float tempC = voltageMv / 10.0;
        Serial.print("TEMP: ");
        Serial.println(tempC, 1);
      }
    `;

    let serialLogs = '';
    const interpreter = new JsInterpreter(code, {
      onPinMode: () => {},
      onDigitalWrite: () => {},
      onDigitalRead: () => false,
      onAnalogRead: () => 51, // 25°C equivalent ADC
      onAnalogWrite: () => {},
      onSerialPrint: (text) => {
        serialLogs += text;
      },
    });

    interpreter.start();
    // Execute tick
    expect(serialLogs).toContain('TEMP: 24.9');
    interpreter.stop();
  });

  it('evaluates MQ-2 gas sensor with map() and conditional threshold write', () => {
    const code = `
      int gasPin = A0;
      int buzzerPin = 8;
      void setup() {
        pinMode(buzzerPin, OUTPUT);
        Serial.begin(9600);
      }
      void loop() {
        int sensorValue = analogRead(gasPin);
        int ppm = map(sensorValue, 0, 1023, 0, 1000);
        if (ppm >= 400) {
          digitalWrite(buzzerPin, HIGH);
        } else {
          digitalWrite(buzzerPin, LOW);
        }
        Serial.print("PPM: ");
        Serial.println(ppm);
      }
    `;

    const writtenPins: Record<number, boolean> = {};
    let logs = '';
    const interpreter = new JsInterpreter(code, {
      onPinMode: () => {},
      onDigitalWrite: (pin, high) => {
        writtenPins[pin] = high;
      },
      onDigitalRead: () => false,
      onAnalogRead: () => 614,
      onAnalogWrite: () => {},
      onSerialPrint: (text) => {
        logs += text;
      },
    });

    interpreter.start();
    expect(writtenPins[8]).toBe(true);
    expect(logs).toContain('PPM: 600');
    interpreter.stop();
  });

  it('evaluates Servo.h sweep loops and writes continuous angles to onServoWrite', () => {
    const code = `
      #include <Servo.h>
      Servo myServo;
      #define SERVO_PIN 3
      void setup() {
        myServo.attach(SERVO_PIN);
      }
      void loop() {
        for (int angle = 0; angle <= 180; angle++) {
          myServo.write(angle);
          delay(15);
        }
        for (int angle = 180; angle >= 0; angle--) {
          myServo.write(angle);
          delay(15);
        }
      }
    `;

    const servoAngles: number[] = [];
    const interpreter = new JsInterpreter(code, {
      onPinMode: () => {},
      onDigitalWrite: () => {},
      onDigitalRead: () => false,
      onAnalogRead: () => 0,
      onAnalogWrite: () => {},
      onServoWrite: (_pin, angle) => {
        servoAngles.push(angle);
      },
      onSerialPrint: () => {},
    });

    interpreter.start();
    expect(servoAngles.length).toBeGreaterThan(0);
    expect(servoAngles[0]).toBeGreaterThanOrEqual(0);
    expect(servoAngles[0]).toBeLessThanOrEqual(180);
    interpreter.stop();
  });

  it('respects custom sweep angles such as 0 to 90 degrees', () => {
    const code = `
      #include <Servo.h>
      Servo myServo;
      #define SERVO_PIN 3
      void setup() {
        myServo.attach(SERVO_PIN);
      }
      void loop() {
        for (int angle = 0; angle <= 90; angle++) {
          myServo.write(angle);
          delay(15);
        }
        for (int angle = 90; angle >= 0; angle--) {
          myServo.write(angle);
          delay(15);
        }
      }
    `;

    const servoAngles: number[] = [];
    const interpreter = new JsInterpreter(code, {
      onPinMode: () => {},
      onDigitalWrite: () => {},
      onDigitalRead: () => false,
      onAnalogRead: () => 0,
      onAnalogWrite: () => {},
      onServoWrite: (_pin, angle) => {
        servoAngles.push(angle);
      },
      onSerialPrint: () => {},
    });

    interpreter.start();
    expect(servoAngles.length).toBeGreaterThan(0);
    expect(servoAngles.every((a) => a >= 0 && a <= 90)).toBe(true);
    interpreter.stop();
  });

  it('resolves NodeMCU ESP8266 pin aliases like D1, D2, D3, D4, D5, D6, D7, D8', () => {
    const code = `
      #define OLED_MOSI D1
      #define OLED_CLK  D2
      #define OLED_DC   D3
      #define OLED_CS   D4
      void setup() {
        pinMode(OLED_MOSI, OUTPUT);
        pinMode(OLED_CLK, OUTPUT);
        digitalWrite(OLED_MOSI, HIGH);
        digitalWrite(OLED_CLK, HIGH);
        digitalWrite(D5, HIGH);
      }
      void loop() {}
    `;

    const writtenPins: Record<number, boolean> = {};
    const interpreter = new JsInterpreter(code, {
      onPinMode: () => {},
      onDigitalWrite: (pin, high) => {
        writtenPins[pin] = high;
      },
      onDigitalRead: () => false,
      onAnalogRead: () => 0,
      onAnalogWrite: () => {},
      onSerialPrint: () => {},
    });

    interpreter.start();
    expect(writtenPins[1]).toBe(true); // D1
    expect(writtenPins[2]).toBe(true); // D2
    expect(writtenPins[5]).toBe(true); // D5
    interpreter.stop();
  });

  it('evaluates LiquidCrystal_I2C setCursor and print calls correctly', () => {
    const code = `
      #include <Wire.h>
      #include <LiquidCrystal_I2C.h>
      LiquidCrystal_I2C lcd(0x27, 16, 2);
      void setup() {
        lcd.init();
        lcd.backlight();
        lcd.setCursor(0, 0);
        lcd.print("VoltFlow Studio");
        lcd.setCursor(0, 1);
        lcd.print("Ready to Sim!");
      }
      void loop() {}
    `;

    let capturedLine1 = '';
    let capturedLine2 = '';

    const interpreter = new JsInterpreter(code, {
      onPinMode: () => {},
      onDigitalWrite: () => {},
      onDigitalRead: () => false,
      onAnalogRead: () => 0,
      onAnalogWrite: () => {},
      onLcdUpdate: (l1, l2) => {
        capturedLine1 = l1;
        capturedLine2 = l2;
      },
      onSerialPrint: () => {},
    });

    interpreter.start();
    expect(capturedLine1).toBe('VoltFlow Studio');
    expect(capturedLine2).toBe('Ready to Sim!');
    interpreter.stop();
  });

  it('evaluates tone() and noTone() pitch frequencies and hooks', () => {
    const code = `
      int buzzerPin = 8;
      void setup() {
        pinMode(buzzerPin, OUTPUT);
      }
      void loop() {
        tone(buzzerPin, NOTE_C4, 500);
      }
    `;

    let playedPin = -1;
    let playedFreq = -1;

    const interpreter = new JsInterpreter(code, {
      onPinMode: () => {},
      onDigitalWrite: () => {},
      onDigitalRead: () => false,
      onAnalogRead: () => 0,
      onAnalogWrite: () => {},
      onTone: (pin, freq) => {
        playedPin = pin;
        playedFreq = freq;
      },
      onNoTone: () => {},
      onSerialPrint: () => {},
    });

    interpreter.start();
    expect(playedPin).toBe(8);
    expect(playedFreq).toBe(262); // NOTE_C4
    interpreter.stop();
  });

  it('evaluates Morse Code SOS sequence with custom functions dot() and dash()', () => {
    const code = `
      void setup() {
        pinMode(8, OUTPUT);
        pinMode(13, OUTPUT);
      }
      void loop() {
        dot(); dot(); dot(); delay(300);
        dash(); dash(); dash(); delay(300);
        dot(); dot(); dot(); delay(1500);
      }
      void dot() {
        digitalWrite(13, HIGH); tone(8, 800); delay(150);
        digitalWrite(13, LOW); noTone(8); delay(150);
      }
      void dash() {
        digitalWrite(13, HIGH); tone(8, 800); delay(450);
        digitalWrite(13, LOW); noTone(8); delay(150);
      }
    `;

    let toneCount = 0;
    let lastPin = -1;
    let lastFreq = -1;

    const interpreter = new JsInterpreter(code, {
      onPinMode: () => {},
      onDigitalWrite: () => {},
      onDigitalRead: () => false,
      onAnalogRead: () => 0,
      onAnalogWrite: () => {},
      onTone: (pin, freq) => {
        toneCount++;
        lastPin = pin;
        lastFreq = freq;
      },
      onNoTone: () => {},
      onSerialPrint: () => {},
    });

    interpreter.start();
    expect(lastPin).toBe(8);
    expect(lastFreq).toBe(800);
    expect(toneCount).toBeGreaterThan(0);
    interpreter.stop();
  });
});


