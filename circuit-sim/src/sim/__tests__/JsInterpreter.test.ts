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

  it('evaluates DHT11 temperature & humidity readings, assignments, and Serial output from live slider', () => {
    const code = `
      #include <DHT.h>
      #define DHTPIN 2
      #define DHTTYPE DHT11
      DHT dht(DHTPIN, DHTTYPE);

      void setup() {
        Serial.begin(9600);
        dht.begin();
      }

      void loop() {
        float h = dht.readHumidity();
        float t = dht.readTemperature();
        Serial.print("Humidity: ");
        Serial.print(h);
        Serial.print("% | Temp: ");
        Serial.println(t);
        delay(1000);
      }
    `;

    let currentTemp = 28;
    let currentHum = 75;
    let serialLogs = '';

    const interpreter = new JsInterpreter(code, {
      onPinMode: () => {},
      onDigitalWrite: () => {},
      onDigitalRead: () => false,
      onAnalogRead: () => 512,
      onAnalogWrite: () => {},
      onSerialPrint: (text) => {
        serialLogs += text;
      },
      onDhtRead: (pin) => {
        expect(pin).toBe(2);
        return { temperature: currentTemp, humidity: currentHum };
      },
    });

    interpreter.start();
    expect(serialLogs).toContain('Humidity: 75% | Temp: 28');

    // Simulate user adjusting DHT11 slider in the inspector
    currentTemp = 36;
    currentHum = 42;
    serialLogs = '';

    // Run tick with new slider values
    interpreter['tick']();
    interpreter['emitSerial']();
    expect(serialLogs).toContain('Humidity: 42% | Temp: 36');

    interpreter.stop();
  });

  it('evaluates LCD output with DHT temperature and humidity precision formatting', () => {
    const code = `
      #include <DHT.h>
      DHT dht(2, DHT11);
      void setup() {
        lcd.begin();
      }
      void loop() {
        float t = dht.readTemperature();
        float h = dht.readHumidity();
        lcd.setCursor(0, 0);
        lcd.print("Temp: ");
        lcd.print(t, 1);
        lcd.setCursor(0, 1);
        lcd.print("Hum:  ");
        lcd.print(h, 0);
      }
    `;

    let lcdL1 = '';
    let lcdL2 = '';

    const interpreter = new JsInterpreter(code, {
      onPinMode: () => {},
      onDigitalWrite: () => {},
      onDigitalRead: () => false,
      onAnalogRead: () => 512,
      onAnalogWrite: () => {},
      onLcdUpdate: (l1, l2) => {
        lcdL1 = l1;
        lcdL2 = l2;
      },
      onSerialPrint: () => {},
      onDhtRead: () => ({ temperature: 24.3, humidity: 62.8 }),
    });

    interpreter.start();
    expect(lcdL1).toContain('Temp: 24.3');
    expect(lcdL2).toContain('Hum:  63');
    interpreter.stop();
  });

  it('handles interactive Serial control with if (Serial.available() > 0) and char input', () => {
    const code = `
      #define LED_PIN D3

      void setup() {
        pinMode(LED_PIN, OUTPUT);
        digitalWrite(LED_PIN, LOW);

        Serial.begin(9600);
        Serial.println("Enter 1 to turn LED ON");
        Serial.println("Enter 0 to turn LED OFF");
      }

      void loop() {
        if (Serial.available() > 0) {
          char input = Serial.read();

          if (input == '1') {
            digitalWrite(LED_PIN, HIGH);
            Serial.println("LED ON");
            delay(2000);
          }
          else if (input == '0') {
            digitalWrite(LED_PIN, LOW);
            Serial.println("LED OFF");
          }
        }
      }
    `;

    const pinStates: Record<number, boolean> = {};
    let serialLogs = '';

    const interpreter = new JsInterpreter(code, {
      onPinMode: () => {},
      onDigitalWrite: (pin, high) => {
        pinStates[pin] = high;
      },
      onDigitalRead: () => false,
      onAnalogRead: () => 512,
      onAnalogWrite: () => {},
      onSerialPrint: (text) => {
        serialLogs += text;
      },
    });

    interpreter.start();
    // Setup ran: LED_PIN (D3 -> pin 3) initialized to LOW
    expect(pinStates[3]).toBe(false);
    expect(serialLogs).toContain('Enter 1 to turn LED ON\nEnter 0 to turn LED OFF\n');

    // Clear logs to simulate user clearing or waiting
    serialLogs = '';

    // Run tick - verify setup is not spammed again and pin 3 remains LOW
    interpreter['tick']();
    expect(serialLogs).toBe('');
    expect(pinStates[3]).toBe(false);

    // User types '1' and sends
    interpreter.receiveSerialInput('1\n');
    expect(pinStates[3]).toBe(true);
    expect(serialLogs).toContain('LED ON\n');

    // Run additional ticks to ensure pin 3 is NOT overridden back to LOW by loop
    serialLogs = '';
    interpreter['tick']();
    interpreter['tick']();
    expect(pinStates[3]).toBe(true);
    expect(serialLogs).toBe(''); // no spam!

    // User types '0' and sends
    interpreter.receiveSerialInput('0\n');
    expect(pinStates[3]).toBe(false);
    expect(serialLogs).toContain('LED OFF\n');

    interpreter.stop();
  });

  it('handles general-purpose Serial.readString() with string comparisons', () => {
    const code = `
      String cmd;
      void setup() {
        pinMode(13, OUTPUT);
      }
      void loop() {
        if (Serial.available()) {
          cmd = Serial.readString();
          if (cmd == "ACTIVATE") {
            digitalWrite(13, HIGH);
            Serial.println("System Active");
          } else if (cmd == "SHUTDOWN") {
            digitalWrite(13, LOW);
            Serial.println("System Inactive");
          }
        }
      }
    `;

    const pinStates: Record<number, boolean> = {};
    let logs = '';
    const interpreter = new JsInterpreter(code, {
      onPinMode: () => {},
      onDigitalWrite: (pin, high) => { pinStates[pin] = high; },
      onDigitalRead: () => false,
      onAnalogRead: () => 0,
      onAnalogWrite: () => {},
      onSerialPrint: (t) => { logs += t; },
    });

    interpreter.start();
    interpreter.receiveSerialInput('ACTIVATE');
    expect(pinStates[13]).toBe(true);
    expect(logs).toContain('System Active\n');

    interpreter.receiveSerialInput('SHUTDOWN');
    expect(pinStates[13]).toBe(false);
    expect(logs).toContain('System Inactive\n');

    interpreter.stop();
  });

  it('handles general-purpose Serial.parseInt() for PWM control', () => {
    const code = `
      int pin = 9;
      void setup() {
        pinMode(pin, OUTPUT);
      }
      void loop() {
        if (Serial.available() > 0) {
          int brightness = Serial.parseInt();
          analogWrite(pin, brightness);
          Serial.print("Set: ");
          Serial.println(brightness);
        }
      }
    `;

    const pwmValues: Record<number, number> = {};
    let logs = '';
    const interpreter = new JsInterpreter(code, {
      onPinMode: () => {},
      onDigitalWrite: () => {},
      onDigitalRead: () => false,
      onAnalogRead: () => 0,
      onAnalogWrite: (pin, val) => { pwmValues[pin] = val; },
      onSerialPrint: (t) => { logs += t; },
    });

    interpreter.start();
    interpreter.receiveSerialInput('185\n');
    expect(pwmValues[9]).toBe(185);
    expect(logs).toContain('Set: 185\n');

    interpreter.stop();
  });

  it('handles switch-case with Serial.read() and custom user functions', () => {
    const code = `
      int ledState = 0;
      void turnOn() {
        ledState = 1;
        digitalWrite(7, HIGH);
      }
      void turnOff() {
        ledState = 0;
        digitalWrite(7, LOW);
      }
      void loop() {
        if (Serial.available() > 0) {
          char ch = Serial.read();
          switch (ch) {
            case 'a':
              turnOn();
              break;
            case 'b':
              turnOff();
              break;
          }
        }
      }
    `;

    const pinStates: Record<number, boolean> = {};
    const interpreter = new JsInterpreter(code, {
      onPinMode: () => {},
      onDigitalWrite: (pin, high) => { pinStates[pin] = high; },
      onDigitalRead: () => false,
      onAnalogRead: () => 0,
      onAnalogWrite: () => {},
      onSerialPrint: () => {},
    });

    interpreter.start();
    interpreter.receiveSerialInput('a');
    expect(pinStates[7]).toBe(true);

    interpreter.receiveSerialInput('b');
    expect(pinStates[7]).toBe(false);

    interpreter.stop();
  });

  it('correctly simulates user Stepper sketch with serial and steps', () => {
    const userCode = `#include <Stepper.h>
const int stepsPerRev = 200;
Stepper stp(stepsPerRev, 8, 9, 10, 11);

void setup() {
  stp.setSpeed(60);
  Serial.begin(9600);
}

void loop() {
  Serial.println("Stepping 360 deg CW...");
  stp.step(200);
  delay(500);
  Serial.println("Stepping 360 deg CCW...");
  stp.step(-200);
  delay(500);
}`;

    const printed: string[] = [];
    const stepped: { steps: number; rpm: number; angle: number }[] = [];

    const interpreter = new JsInterpreter(userCode, {
      onPinMode: () => {},
      onDigitalWrite: () => {},
      onDigitalRead: () => false,
      onAnalogRead: () => 0,
      onAnalogWrite: () => {},
      onSerialPrint: (text) => printed.push(text),
      onStepperStep: (steps, rpm, angle) => stepped.push({ steps, rpm, angle }),
    });

    interpreter.start();
    console.log('TEST PRINTED:', printed);
    console.log('TEST STEPPED:', stepped);
    interpreter.stop();
  });

  it('evaluates SevSeg library for Common Cathode 7-segment display', () => {
    const sevSegCode = `
      #include <SevSeg.h>
      SevSeg sevseg;
      void setup() {
        byte numDigits = 1;
        byte digitPins[] = {};
        byte segmentPins[] = {2, 3, 4, 5, 6, 7, 8, 9};
        bool resistorsOnSegments = true;
        byte hardwareConfig = COMMON_CATHODE;
        sevseg.begin(hardwareConfig, numDigits, digitPins, segmentPins, resistorsOnSegments);
      }
      void loop() {
        sevseg.setNumber(7);
        sevseg.refreshDisplay();
      }
    `;

    const pinStates: Record<number, boolean> = {};
    let capturedValues: number[] = [];

    const interpreter = new JsInterpreter(sevSegCode, {
      onPinMode: () => {},
      onDigitalWrite: (pin, high) => {
        pinStates[pin] = high;
      },
      onDigitalRead: () => false,
      onAnalogRead: () => 0,
      onAnalogWrite: () => {},
      onSevenSegmentUpdate: (values) => {
        capturedValues = values;
      },
      onSerialPrint: () => {},
    });

    interpreter.start();
    // Digit 7 has segments A, B, C lit (1, 1, 1, 0, 0, 0, 0, 0)
    // Pins 2(A), 3(B), 4(C) should be HIGH (true) for Common Cathode
    expect(pinStates[2]).toBe(true);
    expect(pinStates[3]).toBe(true);
    expect(pinStates[4]).toBe(true);
    expect(pinStates[5]).toBe(false); // D is LOW
    expect(capturedValues.slice(0, 3)).toEqual([1, 1, 1]);
    interpreter.stop();
  });

  it('evaluates SevSeg library for Common Anode 7-segment display', () => {
    const sevSegAnodeCode = `
      #include <SevSeg.h>
      SevSeg sevseg;
      void setup() {
        byte numDigits = 1;
        byte digitPins[] = {};
        byte segmentPins[] = {2, 3, 4, 5, 6, 7, 8, 9};
        bool resistorsOnSegments = true;
        byte hardwareConfig = COMMON_ANODE;
        sevseg.begin(hardwareConfig, numDigits, digitPins, segmentPins, resistorsOnSegments);
      }
      void loop() {
        sevseg.setNumber(1);
        sevseg.refreshDisplay();
      }
    `;

    const pinStates: Record<number, boolean> = {};
    let capturedValues: number[] = [];

    const interpreter = new JsInterpreter(sevSegAnodeCode, {
      onPinMode: () => {},
      onDigitalWrite: (pin, high) => {
        pinStates[pin] = high;
      },
      onDigitalRead: () => false,
      onAnalogRead: () => 0,
      onAnalogWrite: () => {},
      onSevenSegmentUpdate: (values) => {
        capturedValues = values;
      },
      onSerialPrint: () => {},
    });

    interpreter.start();
    // Digit 1 has segments B, C lit.
    // For Common Anode, lit segments are driven LOW (false), unlit are HIGH (true)
    expect(pinStates[3]).toBe(false); // B lit -> LOW
    expect(pinStates[4]).toBe(false); // C lit -> LOW
    expect(pinStates[2]).toBe(true);  // A unlit -> HIGH
    expect(pinStates[5]).toBe(true);  // D unlit -> HIGH
    expect(capturedValues[1]).toBe(1); // B is lit
    expect(capturedValues[2]).toBe(1); // C is lit
    expect(capturedValues[0]).toBe(0); // A is unlit
    interpreter.stop();
  });

  it('correctly displays fixed constant setNumber(1) without counting for custom instance names', () => {
    const userCode = `
      #include <SevSeg.h>
      SevSeg display;

      void setup() {
        byte digitcount=1;
        byte commonpins[]={};
        byte segpins[]={2,3,4,5,6,7,8,9};
        bool resistorsetting=true;
        display.begin(COMMON_CATHODE,digitcount,commonpins,segpins,resistorsetting);
        display.setBrightness(90);
      }

      void loop() {
        display.setNumber(1);
      }
    `;

    const pinStates: Record<number, boolean> = {};
    let capturedValues: number[] = [];
    let capturedText = '';

    const interpreter = new JsInterpreter(userCode, {
      onPinMode: () => {},
      onDigitalWrite: (pin, high) => {
        pinStates[pin] = high;
      },
      onDigitalRead: () => false,
      onAnalogRead: () => 0,
      onAnalogWrite: () => {},
      onSevenSegmentUpdate: (values, _numDigits, text) => {
        capturedValues = values;
        capturedText = text || '';
      },
      onSerialPrint: () => {},
    });

    interpreter.start();

    // Constant 1 must display '1' and NOT auto-count 1 to 10
    expect(capturedText).toBe('1');
    // Digit 1: segments B and C lit (pins 3 and 4 HIGH), all others LOW
    expect(pinStates[2]).toBe(false); // A = off
    expect(pinStates[3]).toBe(true);  // B = on
    expect(pinStates[4]).toBe(true);  // C = on
    expect(pinStates[5]).toBe(false); // D = off
    expect(pinStates[6]).toBe(false); // E = off
    expect(pinStates[7]).toBe(false); // F = off
    expect(pinStates[8]).toBe(false); // G = off
    expect(capturedValues).toEqual([0, 1, 1, 0, 0, 0, 0, 0]);

    interpreter.stop();
  });
});


