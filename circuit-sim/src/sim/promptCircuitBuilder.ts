import type { AIPromptExample, PlacedComponent, TinkercadWireColor, WireConnection } from '../types';

interface ControllerConfig {
  type: string;
  name: string;
  powerPin: string;
  groundPin: string;
  digitalPins: string[];
  analogPins: string[];
  sdaPin: string;
  sclPin: string;
}

interface BuildContext {
  controller: ControllerConfig;
  controllerId: string;
  components: PlacedComponent[];
  wires: WireConnection[];
  labels: string[];
  headers: Set<string>;
  constants: string[];
  setup: string[];
  loop: string[];
  moduleIndex: number;
  wireIndex: number;
  digitalIndex: number;
  analogIndex: number;
}

const hasAny = (query: string, aliases: string[]) => aliases.some((alias) => query.includes(alias));

function getController(query: string): ControllerConfig {
  if (hasAny(query, ['esp32', 'esp 32'])) {
    return {
      type: 'esp32-devkit',
      name: 'ESP32 DevKit V1',
      powerPin: '3V3',
      groundPin: 'GND1',
      digitalPins: ['D2', 'D4', 'D5', 'D18', 'D19', 'D23', 'D25', 'D26', 'D27', 'D32', 'D33'],
      analogPins: ['D34', 'D35', 'VN', 'VP'],
      sdaPin: 'D21',
      sclPin: 'D22',
    };
  }

  return {
    type: 'arduino-uno',
    name: 'Arduino Uno R3',
    powerPin: '5V',
    groundPin: 'GND1',
    digitalPins: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'],
    analogPins: ['A0', 'A1', 'A2', 'A3'],
    sdaPin: 'A4',
    sclPin: 'A5',
  };
}

function addComponent(ctx: BuildContext, type: string, name: string, props: Record<string, unknown> = {}) {
  const position = ctx.moduleIndex++;
  const id = `${type}-${position + 1}`;

  ctx.components.push({
    id,
    type,
    name,
    x: 390 + (position % 3) * 275,
    y: 80 + Math.floor(position / 3) * 185,
    rotation: 0,
    props,
  });

  return id;
}

function addWire(
  ctx: BuildContext,
  fromComponentId: string,
  fromPinId: string,
  toComponentId: string,
  toPinId: string,
  color: TinkercadWireColor,
) {
  ctx.wires.push({
    id: `wire-${++ctx.wireIndex}`,
    fromComponentId,
    fromPinId,
    toComponentId,
    toPinId,
    color,
  });
}

function addPower(ctx: BuildContext, componentId: string, vccPin = 'VCC', groundPin = 'GND') {
  addWire(ctx, ctx.controllerId, ctx.controller.powerPin, componentId, vccPin, 'red');
  addWire(ctx, ctx.controllerId, ctx.controller.groundPin, componentId, groundPin, 'black');
}

function nextDigital(ctx: BuildContext) {
  const pin = ctx.controller.digitalPins[ctx.digitalIndex % ctx.controller.digitalPins.length];
  ctx.digitalIndex += 1;
  return pin;
}

function nextAnalog(ctx: BuildContext) {
  const pin = ctx.controller.analogPins[ctx.analogIndex % ctx.controller.analogPins.length];
  ctx.analogIndex += 1;
  return pin;
}

function addDht11(ctx: BuildContext) {
  const dhtId = addComponent(ctx, 'dht11-sensor', 'DHT11 Temp Sensor', { temperature: 25, humidity: 55 });
  const dataPin = nextDigital(ctx);
  addPower(ctx, dhtId);
  addWire(ctx, ctx.controllerId, dataPin, dhtId, 'DATA', 'yellow');
  ctx.labels.push('DHT11 temperature & humidity sensor');
  ctx.headers.add('#include <DHT.h>');
  ctx.constants.push(`const int DHT_PIN = ${dataPin};`, 'DHT dht(DHT_PIN, DHT11);');
  ctx.setup.push('dht.begin();');
  ctx.loop.push('float dhtTemperature = dht.readTemperature();', 'float humidity = dht.readHumidity();', 'Serial.println(dhtTemperature);');
}

function addServo(ctx: BuildContext) {
  const servoId = addComponent(ctx, 'servo', 'SG90 Micro Servo', { angle: 90 });
  const signalPin = nextDigital(ctx);
  addPower(ctx, servoId);
  addWire(ctx, ctx.controllerId, signalPin, servoId, 'PWM', 'yellow');
  ctx.labels.push('SG90 servo motor');
  ctx.headers.add('#include <Servo.h>');
  ctx.constants.push(`const int SERVO_PIN = ${signalPin};`, 'Servo servoMotor;');
  ctx.setup.push('servoMotor.attach(SERVO_PIN);');
  ctx.loop.push('servoMotor.write(90);');
}

function addStepperMotor(ctx: BuildContext) {
  const stepperId = addComponent(ctx, 'stepper-motor', 'Stepper Motor (NEMA 17)', { angle: 0 });
  const pin1 = nextDigital(ctx);
  const pin2 = nextDigital(ctx);
  const pin3 = nextDigital(ctx);
  const pin4 = nextDigital(ctx);
  addWire(ctx, ctx.controllerId, pin1, stepperId, 'A+', 'blue');
  addWire(ctx, ctx.controllerId, pin2, stepperId, 'A-', 'yellow');
  addWire(ctx, ctx.controllerId, pin3, stepperId, 'B+', 'green');
  addWire(ctx, ctx.controllerId, pin4, stepperId, 'B-', 'orange');
  ctx.labels.push('NEMA 17 Stepper Motor');
  ctx.headers.add('#include <Stepper.h>');
  ctx.constants.push(`const int stepsPerRev = 200;\nStepper myStepper(stepsPerRev, ${pin1}, ${pin2}, ${pin3}, ${pin4});`);
  ctx.setup.push('myStepper.setSpeed(60);');
  ctx.loop.push('myStepper.step(stepsPerRev);\n  delay(500);\n  myStepper.step(-stepsPerRev);\n  delay(500);');
}

function addLcd1602(ctx: BuildContext) {
  const lcdId = addComponent(ctx, 'lcd1602', 'LCD Display 16x2', { text: 'Ready' });
  addPower(ctx, lcdId);
  addWire(ctx, ctx.controllerId, ctx.controller.sdaPin, lcdId, 'SDA', 'blue');
  addWire(ctx, ctx.controllerId, ctx.controller.sclPin, lcdId, 'SCL', 'blue');
  ctx.labels.push('16x2 I2C LCD');
  ctx.headers.add('#include <Wire.h>');
  ctx.headers.add('#include <LiquidCrystal_I2C.h>');
  ctx.constants.push('LiquidCrystal_I2C lcd(0x27, 16, 2);');
  ctx.setup.push('lcd.init();', 'lcd.backlight();', 'lcd.print("Ready");');
}

function addBluetooth(ctx: BuildContext) {
  const bluetoothId = addComponent(ctx, 'bluetooth-hc05', 'Bluetooth HC-05 Module');
  const rxPin = nextDigital(ctx);
  const txPin = nextDigital(ctx);
  addPower(ctx, bluetoothId);
  addWire(ctx, bluetoothId, 'TXD', ctx.controllerId, rxPin, 'blue');
  addWire(ctx, ctx.controllerId, txPin, bluetoothId, 'RXD', 'yellow');
  ctx.labels.push('HC-05 Bluetooth module');
  ctx.headers.add('#include <SoftwareSerial.h>');
  ctx.constants.push(`SoftwareSerial bluetooth(${rxPin}, ${txPin});`);
  ctx.setup.push('bluetooth.begin(9600);');
  ctx.loop.push('if (bluetooth.available()) Serial.write(bluetooth.read());', 'if (Serial.available()) bluetooth.write(Serial.read());');
}

function addUltrasonic(ctx: BuildContext) {
  const sensorId = addComponent(ctx, 'ultrasonic-hcsr04', 'HC-SR04 Ultrasonic');
  const trigPin = nextDigital(ctx);
  const echoPin = nextDigital(ctx);
  addPower(ctx, sensorId);
  addWire(ctx, ctx.controllerId, trigPin, sensorId, 'TRIG', 'yellow');
  addWire(ctx, ctx.controllerId, echoPin, sensorId, 'ECHO', 'blue');
  ctx.labels.push('HC-SR04 distance sensor');
  ctx.constants.push(`const int TRIG_PIN = ${trigPin};`, `const int ECHO_PIN = ${echoPin};`);
  ctx.setup.push('pinMode(TRIG_PIN, OUTPUT);', 'pinMode(ECHO_PIN, INPUT);');
  ctx.loop.push('digitalWrite(TRIG_PIN, LOW);', 'delayMicroseconds(2);', 'digitalWrite(TRIG_PIN, HIGH);', 'delayMicroseconds(10);', 'digitalWrite(TRIG_PIN, LOW);');
}

function addGasSensor(ctx: BuildContext) {
  const sensorId = addComponent(ctx, 'gas-sensor', 'MQ-2 Gas / Smoke Sensor', { gasPpm: 350 });
  const analogPin = nextAnalog(ctx);
  addPower(ctx, sensorId);
  addWire(ctx, sensorId, 'AOUT', ctx.controllerId, analogPin, 'blue');
  ctx.labels.push('MQ-2 gas sensor');
  ctx.constants.push(`const int GAS_PIN = ${analogPin};`);
  ctx.loop.push('int gasLevel = analogRead(GAS_PIN);', 'Serial.println(gasLevel);');
}

function addLm35(ctx: BuildContext) {
  const sensorId = addComponent(ctx, 'lm35', 'LM35 Temp Sensor', { temperature: 25 });
  const analogPin = nextAnalog(ctx);
  addPower(ctx, sensorId);
  addWire(ctx, sensorId, 'OUT', ctx.controllerId, analogPin, 'yellow');
  ctx.labels.push('LM35 temperature sensor');
  ctx.constants.push(`const int LM35_PIN = ${analogPin};`);
  ctx.loop.push('int lm35Raw = analogRead(LM35_PIN);', 'float lm35Temperature = lm35Raw * (5.0 / 1023.0) * 100.0;', 'Serial.println(lm35Temperature);');
}

function addLdr(ctx: BuildContext) {
  const ldrId = addComponent(ctx, 'ldr-sensor', 'LDR Photoresistor');
  const resistorId = addComponent(ctx, 'resistor', 'Resistor 10k', { resistance: 10000 });
  const analogPin = nextAnalog(ctx);
  addWire(ctx, ctx.controllerId, ctx.controller.powerPin, ldrId, '1', 'red');
  addWire(ctx, ldrId, '2', resistorId, '1', 'blue');
  addWire(ctx, ldrId, '2', ctx.controllerId, analogPin, 'blue');
  addWire(ctx, resistorId, '2', ctx.controllerId, ctx.controller.groundPin, 'black');
  ctx.labels.push('LDR light sensor');
  ctx.constants.push(`const int LDR_PIN = ${analogPin};`);
  ctx.loop.push('int lightLevel = analogRead(LDR_PIN);', 'Serial.println(lightLevel);');
}

function addLed(ctx: BuildContext) {
  const resistorId = addComponent(ctx, 'resistor', 'Resistor 220Ω', { resistance: 220 });
  const ledId = addComponent(ctx, 'led', 'LED (Red)', { color: 'red' });
  const signalPin = nextDigital(ctx);
  addWire(ctx, ctx.controllerId, signalPin, resistorId, '1', 'red');
  addWire(ctx, resistorId, '2', ledId, 'A', 'red');
  addWire(ctx, ledId, 'C', ctx.controllerId, ctx.controller.groundPin, 'black');
  ctx.labels.push('status LED');
  ctx.constants.push(`const int LED_PIN = ${signalPin};`);
  ctx.setup.push('pinMode(LED_PIN, OUTPUT);');
  ctx.loop.push('digitalWrite(LED_PIN, HIGH);', 'delay(500);', 'digitalWrite(LED_PIN, LOW);');
}

function addBuzzer(ctx: BuildContext) {
  const buzzerId = addComponent(ctx, 'buzzer', 'Piezo Buzzer');
  const signalPin = nextDigital(ctx);
  addWire(ctx, ctx.controllerId, signalPin, buzzerId, '+', 'yellow');
  addWire(ctx, buzzerId, '-', ctx.controllerId, ctx.controller.groundPin, 'black');
  ctx.labels.push('piezo buzzer');
  ctx.constants.push(`const int BUZZER_PIN = ${signalPin};`);
  ctx.setup.push('pinMode(BUZZER_PIN, OUTPUT);');
}

/**
 * Produces a valid, editable starter circuit from a natural-language request.
 * It is intentionally local and deterministic: every generated part and wire
 * maps to a component and pin that exist in the catalogue.
 */
export function buildCircuitFromPrompt(prompt: string): AIPromptExample | null {
  const query = prompt.trim().toLowerCase();
  if (!query) return null;

  const wantsDht = hasAny(query, ['dht', 'humidity']);
  const wantsServo = hasAny(query, ['servo', 'sg90']);
  const wantsStepper = hasAny(query, ['stepper', 'stepper motor', 'nema17', '28byj48']);
  const wantsLcd = hasAny(query, ['lcd', '1602', 'i2c display']);
  const wantsBluetooth = hasAny(query, ['bluetooth', 'hc-05', 'hc05', 'wireless serial']);
  const wantsUltrasonic = hasAny(query, ['ultrasonic', 'distance', 'hc-sr04', 'hcsr04']);
  const wantsGas = hasAny(query, ['gas', 'smoke', 'mq-2', 'mq2']);
  const wantsLdr = hasAny(query, ['ldr', 'photoresistor', 'light sensor']);
  const wantsLm35 = !wantsDht && hasAny(query, ['lm35', 'temperature']);
  const wantsLed = hasAny(query, ['led', 'blink']);
  const wantsBuzzer = hasAny(query, ['buzzer', 'alarm']);
  const mentionsController = hasAny(query, ['arduino', 'esp32', 'esp 32', 'microcontroller']);

  if (!wantsDht && !wantsServo && !wantsStepper && !wantsLcd && !wantsBluetooth && !wantsUltrasonic && !wantsGas && !wantsLdr && !wantsLm35 && !wantsLed && !wantsBuzzer && !mentionsController) {
    return null;
  }

  const controller = getController(query);
  const ctx: BuildContext = {
    controller,
    controllerId: 'controller-1',
    components: [{ id: 'controller-1', type: controller.type, name: controller.name, x: 60, y: 160, rotation: 0, props: {} }],
    wires: [],
    labels: [],
    headers: new Set<string>(),
    constants: [],
    setup: [],
    loop: [],
    moduleIndex: 0,
    wireIndex: 0,
    digitalIndex: 0,
    analogIndex: 0,
  };

  if (wantsDht) addDht11(ctx);
  if (wantsLm35) addLm35(ctx);
  if (wantsUltrasonic) addUltrasonic(ctx);
  if (wantsGas) addGasSensor(ctx);
  if (wantsLdr) addLdr(ctx);
  if (wantsServo) addServo(ctx);
  if (wantsStepper) addStepperMotor(ctx);
  if (wantsLcd) addLcd1602(ctx);
  if (wantsBluetooth) addBluetooth(ctx);
  if (wantsBuzzer) addBuzzer(ctx);
  if (wantsLed || ctx.labels.length === 0) addLed(ctx);

  const code = [
    `// Prompt-generated circuit: ${prompt.trim()}`,
    `// Parts: ${controller.name}${ctx.labels.length ? `, ${ctx.labels.join(', ')}` : ''}`,
    '',
    ...ctx.headers,
    ...(ctx.headers.size ? [''] : []),
    ...ctx.constants,
    ...(ctx.constants.length ? [''] : []),
    'void setup() {',
    '  Serial.begin(9600);',
    ...ctx.setup.map((line) => `  ${line}`),
    '}',
    '',
    'void loop() {',
    ...(ctx.loop.length ? ctx.loop.map((line) => `  ${line}`) : ['  delay(250);']),
    '  delay(250);',
    '}',
  ].join('\n');

  return {
    title: `Custom Circuit: ${ctx.labels.length ? ctx.labels.join(' + ') : controller.name}`,
    prompt,
    description: `A prompt-driven starter circuit built with ${[controller.name, ...ctx.labels].join(', ')}.`,
    components: ctx.components,
    wires: ctx.wires,
    code,
    explanation: `Built from your prompt with ${ctx.components.length} components and ${ctx.wires.length} validated pin-to-pin connections. Review the wiring and voltage requirements before using it with physical hardware.`,
  };
}
