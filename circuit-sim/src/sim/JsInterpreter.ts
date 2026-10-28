// In-browser JavaScript interpreter for Arduino / C++ code sketches.
// Evaluates real-time sensor inputs, digitalWrite, analogRead, Serial output.

export interface InterpreterHooks {
  onPinMode: (pin: number, mode: 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP') => void;
  onDigitalWrite: (pin: number, high: boolean) => void;
  onDigitalRead: (pin: number) => boolean;
  onAnalogRead: (pin: number) => number;
  onAnalogWrite: (pin: number, val: number) => void;
  onTone?: (pin: number, frequency: number, duration?: number) => void;
  onNoTone?: (pin: number) => void;
  onServoWrite?: (pin: number, angle: number) => void;
  onStepperStep?: (steps: number, speedRpm: number, angle?: number) => void;
  onLcdUpdate?: (line1: string, line2: string) => void;
  onSevenSegmentUpdate?: (values: number[], numDigits?: number, displayText?: string) => void;
  onSerialPrint: (text: string) => void;
  onDhtRead?: (pin?: number) => { temperature: number; humidity: number } | null;
}

export interface SequenceStep {
  startTimeMs: number;
  endTimeMs: number;
  pinWrites: Map<number, boolean>;
  pinTones: Map<number, { isTone: boolean; freq: number }>;
}

export class JsInterpreter {
  private timerId: number | null = null;
  private isRunning = false;
  private loopCount = 0;
  private startTime = Date.now();
  private pinModes: Record<number, string> = {};
  private varMap = new Map<string, number>();
  private stringVarMap = new Map<string, string>();
  private customFunctions = new Map<string, string>();
  private lcdLine1 = '';
  private lcdLine2 = '';
  private lcdCursorCol = 0;
  private lcdCursorRow = 0;
  private pinStates = new Map<number, boolean>();
  private serialControlledPins = new Set<number>();
  private servoInstances = new Map<string, { pin: number; currentAngle: number }>();
  private stepperInstances = new Map<string, { stepsPerRev: number; currentStep: number; currentAngle: number; speedRpm: number }>();
  private sequenceSteps: SequenceStep[] = [];
  private totalSequenceDuration = 0;
  private serialRxBuffer = '';
  private sevsegConfig: {
    isConfigured: boolean;
    isCommonAnode: boolean;
    numDigits: number;
    digitPins: number[];
    segmentPins: number[];
  } | null = null;
  private code: string;
  private hooks: InterpreterHooks;

  constructor(code: string, hooks: InterpreterHooks) {
    this.code = code;
    this.hooks = hooks;
  }

  public receiveSerialInput(input: string) {
    this.serialRxBuffer += input;
    if (this.isRunning) {
      this.evaluateSerialAndControlBlocks();
    }
  }

  public clearSerialBuffer() {
    this.serialRxBuffer = '';
  }

  public extractFunctionBody(funcName: string): string | null {
    const regex = new RegExp(`(?:void|int|float|double|long|byte|bool|auto)\\s+${funcName}\\s*\\([^)]*\\)\\s*\\{`, 'g');
    const match = regex.exec(this.code);
    if (!match) return null;
    const startIndex = match.index + match[0].length;
    let depth = 1;
    for (let i = startIndex; i < this.code.length; i++) {
      if (this.code[i] === '{') depth++;
      else if (this.code[i] === '}') {
        depth--;
        if (depth === 0) {
          return this.code.slice(startIndex, i);
        }
      }
    }
    return this.code.slice(startIndex);
  }

  private resolvePin(pinStr: string): number {
    const t = pinStr.trim();
    if (t === 'LED_BUILTIN') return 13;
    if (t.startsWith('A') || t.startsWith('a')) { const n = parseInt(t.slice(1), 10); if (!isNaN(n)) return 14 + n; }
    if (this.varMap.has(t)) return this.varMap.get(t)!;
    if (t.startsWith('D') || t.startsWith('d')) {
      const n = parseInt(t.slice(1), 10);
      if (!isNaN(n)) return n;
    }
    const n = parseInt(t, 10);
    if (!isNaN(n)) return n;
    return 13;
  }

  private getDhtPin(): number | undefined {
    const dhtInstMatch = /DHT\s+[A-Za-z0-9_]+\s*\(\s*([^,]+)/.exec(this.code);
    if (dhtInstMatch) {
      const pinExpr = dhtInstMatch[1].trim();
      return this.resolvePin(pinExpr);
    }
    const dhtPinDef = /#define\s+DHT_?PIN\s+([A-Za-z0-9_]+)/i.exec(this.code);
    if (dhtPinDef) {
      return this.resolvePin(dhtPinDef[1].trim());
    }
    return undefined;
  }

  private getDhtReading(pin?: number): { temperature: number; humidity: number } {
    const targetPin = pin !== undefined ? pin : this.getDhtPin();
    if (this.hooks.onDhtRead) {
      const data = this.hooks.onDhtRead(targetPin);
      if (data && typeof data.temperature === 'number' && typeof data.humidity === 'number') {
        return data;
      }
    }
    return { temperature: 25, humidity: 60 };
  }

  private buildSequenceTimeline() {
    this.sequenceSteps = [];
    this.totalSequenceDuration = 0;

    // Preserve dynamic evaluation for interactive sensor reads, Servo sweeps, Stepper motors, and Serial control
    if (
      this.serialControlledPins.size > 0 ||
      this.code.includes('Servo') ||
      this.code.includes('.write(') ||
      this.code.includes('Stepper') ||
      this.code.includes('.step(') ||
      this.code.includes('analogRead(') ||
      this.code.includes('digitalRead(') ||
      this.code.includes('DHT') ||
      this.code.includes('readTemperature') ||
      this.code.includes('readHumidity') ||
      this.code.includes('Serial.available') ||
      this.code.includes('Serial.read')
    ) {
      return;
    }

    // 1. Extract function definitions e.g. void dot() { ... }
    const funcMap = new Map<string, string>();
    const funcDefRegex = /(?:void|int|float|double|long|byte|bool)\s+([A-Za-z0-9_]+)\s*\([^)]*\)\s*\{([\s\S]*?)\}/g;
    let fm;
    while ((fm = funcDefRegex.exec(this.code)) !== null) {
      const name = fm[1];
      const body = fm[2];
      if (name !== 'setup' && name !== 'loop') {
        funcMap.set(name, body);
      }
    }

    // 2. Extract loop() body
    const loopMatch = /void\s+loop\s*\([^)]*\)\s*\{([\s\S]*)\}/.exec(this.code);
    let loopBody = loopMatch ? loopMatch[1] : this.code;

    // 3. Inline custom function calls into loopBody
    for (let pass = 0; pass < 3; pass++) {
      for (const [funcName, funcBody] of funcMap.entries()) {
        const callRegex = new RegExp(`\\b${funcName}\\s*\\(\\s*\\)\\s*;?`, 'g');
        loopBody = loopBody.replace(callRegex, `\n${funcBody}\n`);
      }
    }

    // 4. Expand simple for loops e.g. for (int i=0; i<3; i++) { ... }
    const forLoopRegex = /for\s*\(\s*(?:int\s+)?([A-Za-z0-9_]+)\s*=\s*(\d+);\s*\1\s*<\s*(\d+);\s*[^)]+\)\s*\{([\s\S]*?)\}/g;
    loopBody = loopBody.replace(forLoopRegex, (_, varName, startStr, endStr, body) => {
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      let unrolled = '';
      for (let i = start; i < end && (i - start) < 50; i++) {
        unrolled += body.replace(new RegExp(`\\b${varName}\\b`, 'g'), String(i)) + ';\n';
      }
      return unrolled;
    });

    // 5. Tokenize statements line-by-line / by semicolon
    const statements = loopBody.split(/;|\n/).map((s) => s.trim()).filter(Boolean);

    let currentTime = 0;
    const currentWrites = new Map<number, boolean>();
    const currentTones = new Map<number, { isTone: boolean; freq: number }>();

    for (const stmt of statements) {
      const dwM = /digitalWrite\s*\(\s*([A-Za-z0-9_]+)\s*,\s*([^)]+)\)/.exec(stmt);
      if (dwM) {
        const pin = this.resolvePin(dwM[1]);
        const valStr = dwM[2].trim();
        const isHigh = valStr === 'HIGH' || valStr === '1' || valStr === 'true';
        currentWrites.set(pin, isHigh);
        continue;
      }

      const toneM = /tone\s*\(\s*([A-Za-z0-9_]+)\s*,\s*([^,)]+)(?:\s*,\s*([^)]+))?\)/.exec(stmt);
      if (toneM) {
        const pin = this.resolvePin(toneM[1]);
        const freqExpr = toneM[2].trim();
        const freq = this.varMap.get(freqExpr) ?? this.evalMathExpr(freqExpr) ?? parseFloat(freqExpr) ?? 440;
        currentTones.set(pin, { isTone: true, freq: isNaN(freq) ? 440 : freq });
        currentWrites.set(pin, true);
        continue;
      }

      const noToneM = /noTone\s*\(\s*([A-Za-z0-9_]+)\)/.exec(stmt);
      if (noToneM) {
        const pin = this.resolvePin(noToneM[1]);
        currentTones.set(pin, { isTone: false, freq: 0 });
        currentWrites.set(pin, false);
        continue;
      }

      const delayM = /delay\s*\(\s*([^)]+)\)/.exec(stmt);
      if (delayM) {
        const durExpr = delayM[1].trim();
        const dur = this.varMap.get(durExpr) ?? this.evalMathExpr(durExpr) ?? parseInt(durExpr, 10) ?? 100;
        if (!isNaN(dur) && dur > 0) {
          const stepEnd = currentTime + dur;
          this.sequenceSteps.push({
            startTimeMs: currentTime,
            endTimeMs: stepEnd,
            pinWrites: new Map(currentWrites),
            pinTones: new Map(currentTones),
          });
          currentTime = stepEnd;
        }
      }
    }

    this.totalSequenceDuration = currentTime;
  }

  public start() {
    this.isRunning = true;
    this.loopCount = 0;
    this.startTime = Date.now();
    this.varMap.clear();
    this.varMap.set('LED_BUILTIN', 13);
    this.varMap.set('HIGH', 1);
    this.varMap.set('LOW', 0);
    for (let i = 0; i <= 15; i++) {
      this.varMap.set(`D${i}`, i);
      this.varMap.set(`d${i}`, i);
    }

    const pitches: Record<string, number> = {
      NOTE_B0: 31, NOTE_C1: 33, NOTE_CS1: 35, NOTE_D1: 37, NOTE_DS1: 39, NOTE_E1: 41, NOTE_F1: 44, NOTE_FS1: 46, NOTE_G1: 49, NOTE_GS1: 52, NOTE_A1: 55, NOTE_AS1: 58, NOTE_B1: 62,
      NOTE_C2: 65, NOTE_CS2: 69, NOTE_D2: 73, NOTE_DS2: 78, NOTE_E2: 82, NOTE_F2: 87, NOTE_FS2: 93, NOTE_G2: 98, NOTE_GS2: 104, NOTE_A2: 110, NOTE_AS2: 117, NOTE_B2: 123,
      NOTE_C3: 131, NOTE_CS3: 139, NOTE_D3: 147, NOTE_DS3: 156, NOTE_E3: 165, NOTE_F3: 175, NOTE_FS3: 185, NOTE_G3: 196, NOTE_GS3: 208, NOTE_A3: 220, NOTE_AS3: 233, NOTE_B3: 247,
      NOTE_C4: 262, NOTE_CS4: 277, NOTE_D4: 294, NOTE_DS4: 311, NOTE_E4: 330, NOTE_F4: 349, NOTE_FS4: 370, NOTE_G4: 392, NOTE_GS4: 415, NOTE_A4: 440, NOTE_AS4: 466, NOTE_B4: 494,
      NOTE_C5: 523, NOTE_CS5: 554, NOTE_D5: 587, NOTE_DS5: 622, NOTE_E5: 659, NOTE_F5: 698, NOTE_FS5: 740, NOTE_G5: 784, NOTE_GS5: 831, NOTE_A5: 880, NOTE_AS5: 932, NOTE_B5: 988,
      NOTE_C6: 1047, NOTE_CS6: 1109, NOTE_D6: 1175, NOTE_DS6: 1245, NOTE_E6: 1319, NOTE_F6: 1397, NOTE_FS6: 1480, NOTE_G6: 1568, NOTE_GS6: 1661, NOTE_A6: 1760, NOTE_AS6: 1865, NOTE_B6: 1976,
      NOTE_C7: 2093, NOTE_CS7: 2217, NOTE_D7: 2349, NOTE_DS7: 2489, NOTE_E7: 2637, NOTE_F7: 2794, NOTE_FS7: 2960, NOTE_G7: 3136, NOTE_GS7: 3322, NOTE_A7: 3520, NOTE_AS7: 3729, NOTE_B7: 3951,
      NOTE_C8: 4186, NOTE_CS8: 4435, NOTE_D8: 4699, NOTE_DS8: 4978,
    };
    for (const [pName, pFreq] of Object.entries(pitches)) {
      this.varMap.set(pName, pFreq);
    }

    const varRegex = /(?:const\s+)?(?:int|byte|uint8_t|long|float)\s+([A-Za-z0-9_]+)\s*=\s*([A-Za-z0-9_.]+)|#define\s+([A-Za-z0-9_]+)\s+([A-Za-z0-9_.]+)/g;
    let vm;
    while ((vm = varRegex.exec(this.code)) !== null) {
      const name = vm[1] || vm[3];
      const val  = vm[2] || vm[4];
      if (name && val) {
        let num: number;
        if (val.startsWith('A') || val.startsWith('a')) {
          num = 14 + parseInt(val.slice(1), 10);
        } else if (this.varMap.has(val)) {
          num = this.varMap.get(val)!;
        } else if (/^[Dd]\d+$/.test(val)) {
          num = parseInt(val.slice(1), 10);
        } else {
          num = parseFloat(val);
        }
        if (!isNaN(num)) this.varMap.set(name, num);
      }
    }

    const pmRe = /pinMode\s*\(\s*([A-Za-z0-9_]+)\s*,\s*([A-Z_]+)\s*\)/g;
    let pm;
    while ((pm = pmRe.exec(this.code)) !== null) {
      const pin  = this.resolvePin(pm[1]);
      const mode = pm[2] as 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP';
      this.pinModes[pin] = mode;
      this.hooks.onPinMode(pin, mode);
    }

    // Servo instance detection: e.g. Servo myServo;
    this.servoInstances.clear();
    const servoVarRegex = /Servo\s+([A-Za-z0-9_,\s]+);/g;
    let svm;
    while ((svm = servoVarRegex.exec(this.code)) !== null) {
      const vars = svm[1].split(',').map((s) => s.trim());
      vars.forEach((v) => {
        if (v) this.servoInstances.set(v, { pin: -1, currentAngle: 90 });
      });
    }

    // Servo attach: e.g. myServo.attach(SERVO_PIN) or myServo.attach(3)
    const attachRegex = /([A-Za-z0-9_]+)\.attach\s*\(\s*([^)]+)\s*\)/g;
    let att;
    while ((att = attachRegex.exec(this.code)) !== null) {
      const servoName = att[1];
      const pinParam = att[2].trim();
      const pinNum = this.resolvePin(pinParam);
      if (!this.servoInstances.has(servoName)) {
        this.servoInstances.set(servoName, { pin: pinNum, currentAngle: 90 });
      } else {
        const existing = this.servoInstances.get(servoName)!;
        existing.pin = pinNum;
      }
    }

    // Clear simulation runtime maps
    this.serialControlledPins.clear();
    this.pinStates.clear();
    this.stringVarMap.clear();
    this.customFunctions.clear();

    // Register all custom functions defined in the sketch
    const funcDefRegex = /(?:void|int|float|double|long|byte|bool|auto)\s+([A-Za-z0-9_]+)\s*\([^)]*\)\s*\{/g;
    let fm;
    while ((fm = funcDefRegex.exec(this.code)) !== null) {
      const name = fm[1];
      if (name !== 'setup' && name !== 'loop') {
        const body = this.extractFunctionBody(name);
        if (body) this.customFunctions.set(name, body);
      }
    }

    // Identify pins that are controlled within Serial logic so automatic loop doesn't overwrite them
    const hasSerial =
      this.code.includes('Serial.available') ||
      this.code.includes('Serial.read') ||
      this.code.includes('Serial.parseInt') ||
      this.code.includes('Serial.readString');
    if (hasSerial) {
      const loopBody = this.extractFunctionBody('loop') || this.code;
      const dwRe = /digitalWrite\s*\(\s*([A-Za-z0-9_]+)/g;
      let dw;
      while ((dw = dwRe.exec(loopBody)) !== null) {
        this.serialControlledPins.add(this.resolvePin(dw[1]));
      }
    }

    // Execute setup() statements once (pin initialization, variables, & setup serial prints)
    const setupBody = this.extractFunctionBody('setup');
    if (setupBody) {
      this.executeBlockStatements(setupBody);
    }

    this.buildSequenceTimeline();
    this.tick();
  }

  private tick = () => {
    if (!this.isRunning) return;
    this.loopCount++;
    const elapsed = Date.now() - this.startTime;

    // 0. Sequence timeline step evaluation (SOS Morse code, pitch melodies, timed tone/LED patterns)
    if (this.sequenceSteps.length > 0 && this.totalSequenceDuration > 0) {
      const activeTime = elapsed % this.totalSequenceDuration;
      const activeStep = this.sequenceSteps.find(
        (s) => activeTime >= s.startTimeMs && activeTime < s.endTimeMs
      );

      if (activeStep) {
        // Dispatch pin digital write levels for current sequence step
        for (const [pin, isHigh] of activeStep.pinWrites.entries()) {
          this.hooks.onDigitalWrite(pin, isHigh);
        }

        // Dispatch tones/noTones for current sequence step
        for (const [pin, toneState] of activeStep.pinTones.entries()) {
          if (toneState.isTone) {
            this.hooks.onTone?.(pin, toneState.freq);
          } else {
            this.hooks.onNoTone?.(pin);
          }
        }
      }

      if (this.isRunning) {
        this.timerId = setTimeout(this.tick, 40) as unknown as number;
      }
      return;
    }

    // 1. Update analog sensor variables
    const arRe = /(?:(?:const\s+)?(?:int|float|double|long|byte|uint8_t)\s+)?([A-Za-z0-9_]+)\s*=\s*analogRead\s*\(\s*([A-Za-z0-9_]+)\s*\)/g;
    let ar;
    while ((ar = arRe.exec(this.code)) !== null) {
      const pin = this.resolvePin(ar[2]);
      const idx = pin > 13 ? pin - 14 : pin;
      this.varMap.set(ar[1], this.hooks.onAnalogRead(idx));
    }

    // 1b. Evaluate mathematical assignment expressions (e.g. float tempC = (rawADC * 500.0) / 1024.0)
    const assignRe = /(?:(?:const\s+)?(?:int|float|double|long|byte|uint8_t)\s+)?([A-Za-z0-9_]+)\s*=\s*([^;]+);/g;
    let asgn;
    while ((asgn = assignRe.exec(this.code)) !== null) {
      const varName = asgn[1];
      const expr = asgn[2].trim();
      if (expr.includes('analogRead') || expr.includes('digitalRead') || expr.includes('pulseIn')) continue;
      const calculated = this.evalMathExpr(expr);
      if (calculated !== null) {
        this.varMap.set(varName, calculated);
      }
    }

    // Derived voltage from rawVal / rawADC
    if (this.varMap.has('rawVal')) {
      this.varMap.set('voltage', parseFloat((this.varMap.get('rawVal')! / 1023 * 5).toFixed(3)));
    } else if (this.varMap.has('rawADC')) {
      this.varMap.set('voltage', parseFloat((this.varMap.get('rawADC')! / 1024 * 5).toFixed(3)));
    }

    // DHT Library preprocessing (dht.readTemperature(), dht.readHumidity())
    if (this.code.includes('DHT') || this.code.includes('readTemperature') || this.code.includes('readHumidity')) {
      const dhtData = this.getDhtReading();
      const tempC = dhtData.temperature;
      const humPct = dhtData.humidity;
      const tempF = parseFloat((tempC * 1.8 + 32).toFixed(1));

      this.varMap.set('temperature', tempC);
      this.varMap.set('tempC', tempC);
      this.varMap.set('temp', tempC);
      this.varMap.set('t', tempC);
      this.varMap.set('tempF', tempF);
      this.varMap.set('f', tempF);
      this.varMap.set('humidity', humPct);
      this.varMap.set('hum', humPct);
      this.varMap.set('h', humPct);

      // Support direct assignments like: float myTemp = dht.readTemperature(); float myHum = dht.readHumidity();
      const dhtAssignRe = /(?:(?:const\s+)?(?:int|float|double|long|byte|uint8_t|auto)\s+)?([A-Za-z0-9_]+)\s*=\s*([A-Za-z0-9_]+)\.(readTemperature|readHumidity)\s*\(\s*(true|false)?\s*\)\s*;/g;
      let dhtAsgn;
      while ((dhtAsgn = dhtAssignRe.exec(this.code)) !== null) {
        const varName = dhtAsgn[1];
        const method = dhtAsgn[3];
        const isFahr = dhtAsgn[4] === 'true';
        if (method === 'readTemperature') {
          this.varMap.set(varName, isFahr ? tempF : tempC);
        } else {
          this.varMap.set(varName, humPct);
        }
      }
    }

    // 2. Update digitalRead variables
    const drRe = /(?:(?:const\s+)?(?:int|float|double|long|byte|bool|uint8_t)\s+)?([A-Za-z0-9_]+)\s*=\s*digitalRead\s*\(\s*([A-Za-z0-9_]+)\s*\)/g;
    let dr;
    while ((dr = drRe.exec(this.code)) !== null) {
      const pin = this.resolvePin(dr[2]);
      this.varMap.set(dr[1], this.hooks.onDigitalRead(pin) ? 1 : 0);
    }

    // 3. pulseIn / HC-SR04 distance
    if (this.code.includes('pulseIn')) {
      const echoM = this.code.match(/pulseIn\s*\(\s*([A-Za-z0-9_]+)/);
      if (echoM) {
        const raw  = this.hooks.onAnalogRead(0);
        const dist = Math.max(2, Math.round(raw / 20));
        this.varMap.set('distanceCm', dist);
        this.varMap.set('distance', dist);
        this.varMap.set('duration', dist * 58);
      }
    }

    // 3b. Extract Serial.read() variables
    const srRe = /(?:(?:const\s+)?(?:int|char|byte|uint8_t|short|long)\s+)?([A-Za-z0-9_]+)\s*=\s*Serial\.read\s*\(\s*\)/g;
    let sr;
    while ((sr = srRe.exec(this.code)) !== null) {
      const varName = sr[1];
      if (this.serialRxBuffer.length > 0) {
        const charCode = this.serialRxBuffer.charCodeAt(0);
        this.varMap.set(varName, charCode);
      } else {
        this.varMap.set(varName, -1);
      }
    }

    // 4. Process all digitalWrite calls
    const dwRe = /digitalWrite\s*\(\s*([A-Za-z0-9_]+)\s*,\s*([^)]+)\)/g;
    const pinWrites = new Map<number, string[]>();
    let dw;
    while ((dw = dwRe.exec(this.code)) !== null) {
      const pin  = this.resolvePin(dw[1]);
      const expr = dw[2].trim();
      if (!pinWrites.has(pin)) pinWrites.set(pin, []);
      pinWrites.get(pin)!.push(expr);
    }

    const hasConditionalBranches = this.code.includes('if') || this.code.includes('switch');

    for (const [pin, writes] of pinWrites.entries()) {
      if (this.serialControlledPins.has(pin)) {
        continue;
      }
      let isHigh: boolean;
      if (writes.length >= 2 && !hasConditionalBranches) {
        const delays = Array.from(this.code.matchAll(/delay\s*\(\s*(\d+)\s*\)/g)).map(x => parseInt(x[1], 10));
        const hi = delays[0] || 1000;
        const lo = delays[1] ?? delays[0] ?? 1000;
        isHigh = (elapsed % (hi + lo)) < hi;
      } else {
        const cond = this.resolveConditionalWrite(pin);
        if (cond !== null) {
          isHigh = cond;
        } else {
          const expr = writes[0];
          if      (expr === 'HIGH' || expr === '1' || expr === 'true')  isHigh = true;
          else if (expr === 'LOW'  || expr === '0' || expr === 'false') isHigh = false;
          else if (this.varMap.has(expr)) isHigh = this.varMap.get(expr)! !== 0;
          else isHigh = false;
        }
      }
      this.pinStates.set(pin, isHigh);
      this.hooks.onDigitalWrite(pin, isHigh);
    }

    // 5. analogWrite
    const awRe = /analogWrite\s*\(\s*([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_.]+)\s*\)/g;
    let aw;
    while ((aw = awRe.exec(this.code)) !== null) {
      const pin = this.resolvePin(aw[1]);
      const val = this.varMap.get(aw[2]) ?? parseFloat(aw[2]);
      this.hooks.onAnalogWrite(pin, isNaN(val) ? 128 : val);
    }

    // 5a. tone() and noTone() evaluation
    const toneRe = /tone\s*\(\s*([A-Za-z0-9_]+)\s*,\s*([^,)]+)(?:\s*,\s*([^)]+))?\s*\)/g;
    let tn;
    while ((tn = toneRe.exec(this.code)) !== null) {
      const pin = this.resolvePin(tn[1]);
      const freqExpr = tn[2].trim();
      const durExpr = tn[3]?.trim();
      const freq = this.varMap.get(freqExpr) ?? this.evalMathExpr(freqExpr) ?? parseFloat(freqExpr) ?? 440;
      const dur = durExpr ? (this.varMap.get(durExpr) ?? this.evalMathExpr(durExpr) ?? parseFloat(durExpr)) : undefined;

      const cond = this.resolveConditionalWrite(pin);
      const isToneActive = cond !== null ? cond : true;

      if (isToneActive) {
        this.hooks.onTone?.(pin, isNaN(freq) ? 440 : freq, dur);
        this.hooks.onDigitalWrite(pin, true);
      } else {
        this.hooks.onNoTone?.(pin);
        this.hooks.onDigitalWrite(pin, false);
      }
    }

    const noToneRe = /noTone\s*\(\s*([A-Za-z0-9_]+)\s*\)/g;
    let ntn;
    while ((ntn = noToneRe.exec(this.code)) !== null) {
      const pin = this.resolvePin(ntn[1]);
      this.hooks.onNoTone?.(pin);
      this.hooks.onDigitalWrite(pin, false);
    }

    // 5b. Servo Motor Evaluation (.write(angle), sweep loops, mapped potentiometer)
    if (this.code.includes('Servo') || this.code.includes('.write(') || this.servoInstances.size > 0) {
      this.evaluateServoWrites(elapsed);
    }

    // 5c. Stepper Motor Evaluation (.step(steps), .setSpeed(rpm))
    if (this.code.includes('Stepper') || this.code.includes('.step(') || this.stepperInstances.size > 0) {
      this.evaluateStepperWrites(elapsed);
    }

    // 5d. LCD 16x2 Display Evaluation (LiquidCrystal / LiquidCrystal_I2C)
    if (this.code.includes('lcd') || this.code.includes('LiquidCrystal')) {
      this.evaluateLcdWrites();
    }

    // 5e. SevSeg 7-Segment Display Evaluation
    if (this.code.includes('SevSeg') || this.code.includes('sevseg') || this.code.includes('COMMON_CATHODE') || this.code.includes('COMMON_ANODE') || this.code.includes('setNumber')) {
      this.evaluateSevSegWrites(elapsed);
    }

    // 5e. Evaluate Serial control blocks (e.g. Serial.available() -> Serial.read() -> digitalWrite / Serial.print)
    this.evaluateSerialAndControlBlocks();

    // 6. Serial output on tick 1 and every 4 ticks
    if (this.loopCount === 1 || this.loopCount % 4 === 0) {
      this.emitSerial();
    }

    if (this.isRunning) {
      this.timerId = setTimeout(this.tick, 50) as unknown as number;
    }
  };

  private evaluateSerialAndControlBlocks() {
    if (this.serialRxBuffer.length === 0) return;
    const loopBody = this.extractFunctionBody('loop') || this.code;

    // Discard leading \r or \n if sketch doesn't care about whitespace
    if (
      (this.serialRxBuffer[0] === '\r' || this.serialRxBuffer[0] === '\n') &&
      !this.code.includes('\\n') &&
      !this.code.includes('\\r') &&
      !this.code.includes('readString')
    ) {
      this.serialRxBuffer = this.serialRxBuffer.replace(/^[\r\n]+/, '');
      if (this.serialRxBuffer.length === 0) return;
    }

    // Execute the loop body with the incoming serial buffer
    this.executeBlockStatements(loopBody);
  }

  public executeBlockStatements(block: string) {
    if (!block || !block.trim()) return;

    let idx = 0;
    const len = block.length;

    while (idx < len) {
      // 1. Skip whitespace
      while (idx < len && /\s/.test(block[idx])) idx++;
      if (idx >= len) break;

      // Skip single line comment //
      if (block.slice(idx, idx + 2) === '//') {
        const nextNl = block.indexOf('\n', idx);
        idx = nextNl === -1 ? len : nextNl + 1;
        continue;
      }
      // Skip multi-line comment /* ... */
      if (block.slice(idx, idx + 2) === '/*') {
        const endCm = block.indexOf('*/', idx + 2);
        idx = endCm === -1 ? len : endCm + 2;
        continue;
      }

      // 2. Check if (condition)
      if (block.slice(idx).startsWith('if') && /\bif\s*\(/.test(block.slice(idx))) {
        const ifChain = this.parseIfElseChain(block, idx);
        if (ifChain) {
          idx = ifChain.nextIdx;
          for (const branch of ifChain.branches) {
            if (branch.type === 'else' || this.evalCondition(branch.condition) === true) {
              this.executeBlockStatements(branch.body);
              break;
            }
          }
          continue;
        }
      }

      // 3. Check switch (expr) { case ... }
      if (block.slice(idx).startsWith('switch') && /\bswitch\s*\(/.test(block.slice(idx))) {
        const sw = this.parseSwitch(block, idx);
        if (sw) {
          idx = sw.nextIdx;
          this.executeSwitch(sw.expr, sw.body);
          continue;
        }
      }

      // 4. Check while (condition)
      if (block.slice(idx).startsWith('while') && /\bwhile\s*\(/.test(block.slice(idx))) {
        const wh = this.parseWhile(block, idx);
        if (wh) {
          idx = wh.nextIdx;
          let count = 0;
          while (count++ < 100 && this.evalCondition(wh.condition) === true) {
            this.executeBlockStatements(wh.body);
          }
          continue;
        }
      }

      // 5. Normal statement ending in ;
      let semiIdx = block.indexOf(';', idx);
      if (semiIdx === -1) semiIdx = len;
      const stmt = block.slice(idx, semiIdx).trim();
      idx = semiIdx + 1;

      if (stmt) {
        this.executeSingleStatement(stmt);
      }
    }
  }

  private parseIfElseChain(block: string, startIdx: number) {
    const branches: Array<{ type: 'if' | 'else if' | 'else'; condition: string; body: string }> = [];
    let idx = startIdx;
    const len = block.length;

    while (idx < len) {
      while (idx < len && /\s/.test(block[idx])) idx++;
      if (idx >= len) break;

      let type: 'if' | 'else if' | 'else';
      if (branches.length === 0) {
        if (!block.slice(idx).startsWith('if')) break;
        type = 'if';
        idx += 2;
      } else {
        if (block.slice(idx).startsWith('else if')) {
          type = 'else if';
          idx += 7;
        } else if (block.slice(idx).startsWith('else')) {
          type = 'else';
          idx += 4;
        } else {
          break;
        }
      }

      while (idx < len && /\s/.test(block[idx])) idx++;

      let condition = '';
      if (type !== 'else') {
        if (block[idx] !== '(') break;
        idx++; // skip '('
        let pDepth = 1;
        const condStart = idx;
        while (idx < len && pDepth > 0) {
          if (block[idx] === '(') pDepth++;
          else if (block[idx] === ')') pDepth--;
          idx++;
        }
        condition = block.slice(condStart, idx - 1).trim();
      }

      while (idx < len && /\s/.test(block[idx])) idx++;

      let body = '';
      if (block[idx] === '{') {
        idx++; // skip '{'
        let bDepth = 1;
        const bodyStart = idx;
        while (idx < len && bDepth > 0) {
          if (block[idx] === '{') bDepth++;
          else if (block[idx] === '}') bDepth--;
          idx++;
        }
        body = block.slice(bodyStart, idx - 1);
      } else {
        const semiIdx = block.indexOf(';', idx);
        if (semiIdx !== -1) {
          body = block.slice(idx, semiIdx + 1);
          idx = semiIdx + 1;
        } else {
          body = block.slice(idx);
          idx = len;
        }
      }

      branches.push({ type, condition, body });
      if (type === 'else') break;
    }

    return branches.length > 0 ? { branches, nextIdx: idx } : null;
  }

  private parseWhile(block: string, startIdx: number) {
    let idx = startIdx + 5; // skip 'while'
    const len = block.length;
    while (idx < len && /\s/.test(block[idx])) idx++;
    if (block[idx] !== '(') return null;
    idx++;
    let pDepth = 1;
    const condStart = idx;
    while (idx < len && pDepth > 0) {
      if (block[idx] === '(') pDepth++;
      else if (block[idx] === ')') pDepth--;
      idx++;
    }
    const condition = block.slice(condStart, idx - 1).trim();

    while (idx < len && /\s/.test(block[idx])) idx++;
    let body = '';
    if (block[idx] === '{') {
      idx++;
      let bDepth = 1;
      const bodyStart = idx;
      while (idx < len && bDepth > 0) {
        if (block[idx] === '{') bDepth++;
        else if (block[idx] === '}') bDepth--;
        idx++;
      }
      body = block.slice(bodyStart, idx - 1);
    } else {
      const semiIdx = block.indexOf(';', idx);
      if (semiIdx !== -1) {
        body = block.slice(idx, semiIdx + 1);
        idx = semiIdx + 1;
      } else {
        body = block.slice(idx);
        idx = len;
      }
    }
    return { condition, body, nextIdx: idx };
  }

  private parseSwitch(block: string, startIdx: number) {
    let idx = startIdx + 6; // skip 'switch'
    const len = block.length;
    while (idx < len && /\s/.test(block[idx])) idx++;
    if (block[idx] !== '(') return null;
    idx++;
    let pDepth = 1;
    const exprStart = idx;
    while (idx < len && pDepth > 0) {
      if (block[idx] === '(') pDepth++;
      else if (block[idx] === ')') pDepth--;
      idx++;
    }
    const expr = block.slice(exprStart, idx - 1).trim();

    while (idx < len && /\s/.test(block[idx])) idx++;
    if (block[idx] !== '{') return null;
    idx++;
    let bDepth = 1;
    const bodyStart = idx;
    while (idx < len && bDepth > 0) {
      if (block[idx] === '{') bDepth++;
      else if (block[idx] === '}') bDepth--;
      idx++;
    }
    const body = block.slice(bodyStart, idx - 1);
    return { expr, body, nextIdx: idx };
  }

  private executeSwitch(exprStr: string, body: string) {
    let val: number | string | null = null;
    if (exprStr === 'Serial.read()' || exprStr.startsWith('Serial.read()')) {
      if (this.serialRxBuffer.length > 0) {
        val = this.serialRxBuffer.charCodeAt(0);
        this.serialRxBuffer = this.serialRxBuffer.slice(1);
      } else {
        val = -1;
      }
    } else if (this.varMap.has(exprStr)) {
      val = this.varMap.get(exprStr)!;
    } else if (this.stringVarMap.has(exprStr)) {
      val = this.stringVarMap.get(exprStr)!;
    } else {
      val = this.evalMathExpr(exprStr);
    }
    if (val === null) return;

    const caseRegex = /case\s+([^:]+):([\s\S]*?)(?=case\s+[^:]+:|default\s*:|$)/g;
    let cm;
    let matched = false;
    while ((cm = caseRegex.exec(body)) !== null) {
      const caseRaw = cm[1].trim();
      const caseStatements = cm[2];
      let matches = false;

      if ((caseRaw.startsWith("'") && caseRaw.endsWith("'")) || (caseRaw.startsWith('"') && caseRaw.endsWith('"'))) {
        const charContent = caseRaw.slice(1, -1);
        const charCode = charContent.charCodeAt(0);
        matches = val === charCode || val === charContent;
      } else {
        const numVal = parseInt(caseRaw, 10);
        matches = val === numVal || (typeof val === 'number' && val === (numVal + 48));
      }

      if (matches) {
        matched = true;
        this.executeBlockStatements(caseStatements);
        return;
      }
    }

    if (!matched) {
      const defMatch = /default\s*:([\s\S]*?)(?=case\s+[^:]+:|$)/.exec(body);
      if (defMatch) {
        this.executeBlockStatements(defMatch[1]);
      }
    }
  }

  private executeSingleStatement(stmt: string) {
    const s = stmt.trim();
    if (!s) return;

    // 1. digitalWrite(pin, val)
    const dwMatch = /^digitalWrite\s*\(\s*([A-Za-z0-9_]+)\s*,\s*([^)]+)\)$/.exec(s);
    if (dwMatch) {
      const pin = this.resolvePin(dwMatch[1]);
      const valExpr = dwMatch[2].trim();
      let isHigh = false;
      if (valExpr === 'HIGH' || valExpr === '1' || valExpr === 'true') {
        isHigh = true;
      } else if (valExpr === 'LOW' || valExpr === '0' || valExpr === 'false') {
        isHigh = false;
      } else if (this.varMap.has(valExpr)) {
        isHigh = this.varMap.get(valExpr)! !== 0;
      } else {
        const cond = this.evalCondition(valExpr);
        isHigh = cond !== null ? cond : false;
      }
      this.pinStates.set(pin, isHigh);
      this.serialControlledPins.add(pin);
      this.hooks.onDigitalWrite(pin, isHigh);
      return;
    }

    // 2. analogWrite(pin, val)
    const awMatch = /^analogWrite\s*\(\s*([A-Za-z0-9_]+)\s*,\s*([^)]+)\)$/.exec(s);
    if (awMatch) {
      const pin = this.resolvePin(awMatch[1]);
      const valExpr = awMatch[2].trim();
      const val = this.varMap.get(valExpr) ?? this.evalMathExpr(valExpr) ?? parseFloat(valExpr) ?? 0;
      this.hooks.onAnalogWrite(pin, val);
      return;
    }

    // 3. Serial.print / Serial.println
    const spMatch = /^Serial\.(print(?:ln)?)\s*\(\s*([^)]*)\s*\)$/.exec(s);
    if (spMatch) {
      const isLn = spMatch[1] === 'println';
      const rawArg = spMatch[2].trim();
      let printText = '';

      if (!rawArg) {
        if (isLn) this.hooks.onSerialPrint('\n');
        return;
      }

      if ((rawArg.startsWith('"') && rawArg.endsWith('"')) || (rawArg.startsWith("'") && rawArg.endsWith("'"))) {
        printText = rawArg.slice(1, -1);
      } else {
        const commaIdx = rawArg.indexOf(',');
        const exprPart = commaIdx !== -1 ? rawArg.slice(0, commaIdx).trim() : rawArg;
        const precPart = commaIdx !== -1 ? parseInt(rawArg.slice(commaIdx + 1).trim(), 10) : null;
        const precision = precPart !== null && !isNaN(precPart) ? precPart : null;

        if (this.stringVarMap.has(exprPart)) {
          printText = this.stringVarMap.get(exprPart)!;
        } else if (this.varMap.has(exprPart)) {
          const v = this.varMap.get(exprPart)!;
          printText = precision !== null ? v.toFixed(precision) : (v % 1 !== 0 ? v.toFixed(2) : String(v));
        } else {
          const mathVal = this.evalMathExpr(exprPart);
          if (mathVal !== null) {
            printText = precision !== null ? mathVal.toFixed(precision) : (mathVal % 1 !== 0 ? mathVal.toFixed(2) : String(mathVal));
          } else {
            printText = rawArg;
          }
        }
      }

      this.hooks.onSerialPrint(printText + (isLn ? '\n' : ''));
      return;
    }

    // 4. Serial.write(val)
    const swMatch = /^Serial\.write\s*\(\s*([^)]+)\s*\)$/.exec(s);
    if (swMatch) {
      const arg = swMatch[1].trim();
      if ((arg.startsWith("'") && arg.endsWith("'")) || (arg.startsWith('"') && arg.endsWith('"'))) {
        this.hooks.onSerialPrint(arg.slice(1, -1));
      } else if (this.stringVarMap.has(arg)) {
        this.hooks.onSerialPrint(this.stringVarMap.get(arg)!);
      } else {
        const num = this.varMap.get(arg) ?? parseInt(arg, 10);
        if (!isNaN(num)) {
          this.hooks.onSerialPrint(String.fromCharCode(num));
        } else {
          this.hooks.onSerialPrint(arg);
        }
      }
      return;
    }

    // 5. tone(pin, freq, dur) / noTone(pin)
    const tnMatch = /^tone\s*\(\s*([A-Za-z0-9_]+)\s*,\s*([^,)]+)(?:\s*,\s*([^)]+))?\s*\)$/.exec(s);
    if (tnMatch) {
      const pin = this.resolvePin(tnMatch[1]);
      const freq = this.varMap.get(tnMatch[2].trim()) ?? this.evalMathExpr(tnMatch[2].trim()) ?? parseFloat(tnMatch[2].trim()) ?? 440;
      const dur = tnMatch[3] ? (this.varMap.get(tnMatch[3].trim()) ?? parseFloat(tnMatch[3].trim())) : undefined;
      this.hooks.onTone?.(pin, freq, dur);
      this.hooks.onDigitalWrite(pin, true);
      return;
    }

    const ntnMatch = /^noTone\s*\(\s*([A-Za-z0-9_]+)\s*\)$/.exec(s);
    if (ntnMatch) {
      const pin = this.resolvePin(ntnMatch[1]);
      this.hooks.onNoTone?.(pin);
      this.hooks.onDigitalWrite(pin, false);
      return;
    }

    // 6. Servo: servoName.write(angle)
    const servoMatch = /^([A-Za-z0-9_]+)\.write\s*\(\s*([^)]+)\s*\)$/.exec(s);
    if (servoMatch) {
      const sName = servoMatch[1];
      const angleExpr = servoMatch[2].trim();
      const angle = this.varMap.get(angleExpr) ?? this.evalMathExpr(angleExpr) ?? parseFloat(angleExpr) ?? 90;
      const inst = this.servoInstances.get(sName);
      if (inst) {
        inst.currentAngle = angle;
        this.hooks.onServoWrite?.(inst.pin, angle);
      } else {
        this.hooks.onServoWrite?.(0, angle);
      }
      return;
    }

    // 7. LCD methods
    if (/^[A-Za-z0-9_]+\.(?:print|setCursor|clear|home)\s*\(/.test(s)) {
      this.executeLcdStatement(s);
      return;
    }

    // 8. Variable assignments
    const asgnMatch = /^(?:(?:const|let|var|int|float|double|char|bool|boolean|long|short|byte|uint8_t|uint16_t|uint32_t|int8_t|int16_t|int32_t|String|auto)\s+)?([A-Za-z0-9_]+)\s*=\s*([\s\S]+)$/.exec(s);
    if (asgnMatch) {
      const varName = asgnMatch[1];
      const rhs = asgnMatch[2].trim();

      // Serial.read()
      if (rhs === 'Serial.read()' || rhs.startsWith('Serial.read()')) {
        if (this.serialRxBuffer.length > 0) {
          const code = this.serialRxBuffer.charCodeAt(0);
          this.serialRxBuffer = this.serialRxBuffer.slice(1);
          this.varMap.set(varName, code);
          this.stringVarMap.delete(varName);
        } else {
          this.varMap.set(varName, -1);
          this.stringVarMap.delete(varName);
        }
        return;
      }

      // Serial.readString()
      if (rhs === 'Serial.readString()' || rhs.startsWith('Serial.readString()')) {
        const str = this.serialRxBuffer;
        this.serialRxBuffer = '';
        this.stringVarMap.set(varName, str);
        return;
      }

      // Serial.readStringUntil(term)
      const rsuMatch = /^Serial\.readStringUntil\s*\(\s*([^)]+)\s*\)$/.exec(rhs);
      if (rsuMatch) {
        const term = rsuMatch[1].trim().replace(/^['"]|['"]$/g, '');
        const idx = this.serialRxBuffer.indexOf(term);
        if (idx !== -1) {
          const str = this.serialRxBuffer.slice(0, idx);
          this.serialRxBuffer = this.serialRxBuffer.slice(idx + term.length);
          this.stringVarMap.set(varName, str);
        } else {
          const str = this.serialRxBuffer;
          this.serialRxBuffer = '';
          this.stringVarMap.set(varName, str);
        }
        return;
      }

      // Serial.parseInt()
      if (rhs === 'Serial.parseInt()' || rhs.startsWith('Serial.parseInt()')) {
        const m = /[-+]?\d+/.exec(this.serialRxBuffer);
        if (m) {
          const num = parseInt(m[0], 10);
          this.serialRxBuffer = this.serialRxBuffer.slice(m.index + m[0].length);
          this.varMap.set(varName, num);
        } else {
          this.varMap.set(varName, 0);
        }
        return;
      }

      // Serial.parseFloat()
      if (rhs === 'Serial.parseFloat()' || rhs.startsWith('Serial.parseFloat()')) {
        const m = /[-+]?\d*\.?\d+/.exec(this.serialRxBuffer);
        if (m) {
          const num = parseFloat(m[0]);
          this.serialRxBuffer = this.serialRxBuffer.slice(m.index + m[0].length);
          this.varMap.set(varName, num);
        } else {
          this.varMap.set(varName, 0);
        }
        return;
      }

      // Negation: !varName
      if (rhs.startsWith('!')) {
        const target = rhs.slice(1).trim();
        const cur = this.varMap.get(target) ?? 0;
        this.varMap.set(varName, cur ? 0 : 1);
        return;
      }

      // String literal "..."
      if ((rhs.startsWith('"') && rhs.endsWith('"')) || (rhs.startsWith("'") && rhs.endsWith("'") && rhs.length > 3)) {
        this.stringVarMap.set(varName, rhs.slice(1, -1));
        return;
      }

      // Char literal 'c'
      if (rhs.startsWith("'") && rhs.endsWith("'") && rhs.length <= 3) {
        const ch = rhs.slice(1, -1);
        this.varMap.set(varName, ch.charCodeAt(0));
        this.stringVarMap.set(varName, ch);
        return;
      }

      // Mathematical expression or number
      const numVal = this.varMap.get(rhs) ?? this.evalMathExpr(rhs);
      if (numVal !== null) {
        this.varMap.set(varName, numVal);
      } else if (this.stringVarMap.has(rhs)) {
        this.stringVarMap.set(varName, this.stringVarMap.get(rhs)!);
      }
      return;
    }

    // 9. Increment / Decrement
    const incMatch = /^([A-Za-z0-9_]+)\+\+$/.exec(s);
    if (incMatch) {
      this.varMap.set(incMatch[1], (this.varMap.get(incMatch[1]) ?? 0) + 1);
      return;
    }
    const decMatch = /^([A-Za-z0-9_]+)--$/.exec(s);
    if (decMatch) {
      this.varMap.set(decMatch[1], (this.varMap.get(decMatch[1]) ?? 0) - 1);
      return;
    }
    const addAssign = /^([A-Za-z0-9_]+)\s*\+=\s*(.+)$/.exec(s);
    if (addAssign) {
      const v = addAssign[1];
      const delta = this.varMap.get(addAssign[2].trim()) ?? this.evalMathExpr(addAssign[2].trim()) ?? 0;
      this.varMap.set(v, (this.varMap.get(v) ?? 0) + delta);
      return;
    }

    // 10. Custom user functions
    const fnMatch = /^([A-Za-z0-9_]+)\s*\(\s*\)$/.exec(s);
    if (fnMatch) {
      const fName = fnMatch[1];
      if (this.customFunctions.has(fName)) {
        this.executeBlockStatements(this.customFunctions.get(fName)!);
      }
      return;
    }
  }

  private executeLcdStatement(s: string) {
    const curMatch = /\.setCursor\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/.exec(s);
    if (curMatch) {
      this.lcdCursorCol = parseInt(curMatch[1], 10);
      this.lcdCursorRow = parseInt(curMatch[2], 10);
      return;
    }
    if (s.includes('.clear()')) {
      this.lcdLine1 = '';
      this.lcdLine2 = '';
      this.lcdCursorCol = 0;
      this.lcdCursorRow = 0;
      this.hooks.onLcdUpdate?.('', '');
      return;
    }
    const prMatch = /\.print\s*\(\s*([^)]*)\s*\)/.exec(s);
    if (prMatch) {
      const rawArg = prMatch[1].trim();
      let txt = '';
      if ((rawArg.startsWith('"') && rawArg.endsWith('"')) || (rawArg.startsWith("'") && rawArg.endsWith("'"))) {
        txt = rawArg.slice(1, -1);
      } else if (this.stringVarMap.has(rawArg)) {
        txt = this.stringVarMap.get(rawArg)!;
      } else if (this.varMap.has(rawArg)) {
        txt = String(this.varMap.get(rawArg)!);
      } else {
        txt = rawArg;
      }
      if (this.lcdCursorRow === 0) {
        this.lcdLine1 = this.lcdLine1.slice(0, this.lcdCursorCol) + txt;
      } else {
        this.lcdLine2 = this.lcdLine2.slice(0, this.lcdCursorCol) + txt;
      }
      this.hooks.onLcdUpdate?.(this.lcdLine1, this.lcdLine2);
    }
  }

  private evalMathExpr(expr: string): number | null {
    let sanitized = expr.trim();
    // Expand map(x, in_min, in_max, out_min, out_max)
    const mapRegex = /map\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)/g;
    sanitized = sanitized.replace(mapRegex, '((($1) - ($2)) * (($5) - ($4)) / (($3) - ($2)) + ($4))');

    // Expand constrain(x, a, b) -> Math.min(Math.max(x, a), b)
    const constrainRegex = /constrain\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)/g;
    sanitized = sanitized.replace(constrainRegex, 'Math.min(Math.max(($1), ($2)), ($3))');

    // Expand common Arduino math functions
    sanitized = sanitized.replace(/\babs\s*\(/g, 'Math.abs(');
    sanitized = sanitized.replace(/\bmin\s*\(/g, 'Math.min(');
    sanitized = sanitized.replace(/\bmax\s*\(/g, 'Math.max(');
    sanitized = sanitized.replace(/\bsqrt\s*\(/g, 'Math.sqrt(');
    sanitized = sanitized.replace(/\bpow\s*\(/g, 'Math.pow(');

    // Expand analogRead calls inside expression
    sanitized = sanitized.replace(/analogRead\s*\(\s*([A-Za-z0-9_]+)\s*\)/g, (_, p) => {
      const pin = this.resolvePin(p);
      const idx = pin > 13 ? pin - 14 : pin;
      return String(this.hooks.onAnalogRead(idx));
    });

    // Expand dht.readTemperature(...) and dht.readHumidity() inside expression
    sanitized = sanitized.replace(/([A-Za-z0-9_]+)\.readTemperature\s*\(\s*(true|false)?\s*\)/g, (_, _obj, isFahr) => {
      const reading = this.getDhtReading();
      const isF = isFahr === 'true';
      const val = isF ? (reading.temperature * 1.8 + 32) : reading.temperature;
      return String(val);
    });
    sanitized = sanitized.replace(/([A-Za-z0-9_]+)\.readHumidity\s*\(\s*\)/g, () => {
      const reading = this.getDhtReading();
      return String(reading.humidity);
    });

    const sortedKeys = Array.from(this.varMap.keys()).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      const val = this.varMap.get(key)!;
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      sanitized = sanitized.replace(regex, String(val));
    }
    sanitized = sanitized.replace(/\((?:float|int|double|long|uint8_t|byte)\)/g, '');
    try {
      // Safe arithmetic evaluator restricted to mathematical expressions
      if (/^[0-9.\s+\-*/%()Math.,eE><=!&|-]+$/.test(sanitized)) {
        const result = Function(`"use strict"; return (${sanitized});`)();
        if (typeof result === 'number' && !isNaN(result)) return result;
      }
    } catch {
      return null;
    }
    return null;
  }

  private resolveConditionalWrite(pinNum: number): boolean | null {
    const ifRe = /if\s*\(([^)]+)\)\s*\{([\s\S]*?)\}(?:\s*else\s*(?:if\s*\([^)]+\)\s*)?\{([\s\S]*?)\})?/g;
    let m;
    while ((m = ifRe.exec(this.code)) !== null) {
      const condition = m[1];
      const thenBlock = m[2] || '';
      const elseBlock = m[3] || '';
      const pinStr    = String(pinNum);
      const pinName   = this.getPinVarName(pinNum);

      const hasPinInBlock = (blk: string) => {
        if (!blk.includes('digitalWrite') && !blk.includes('tone') && !blk.includes('noTone')) return false;
        if (blk.includes(pinStr)) return true;
        if (pinName !== null && blk.includes(pinName)) return true;
        return false;
      };

      const inThen = hasPinInBlock(thenBlock);
      const inElse = hasPinInBlock(elseBlock);
      if (!inThen && !inElse) continue;

      const condVal = this.evalCondition(condition);
      if (condVal === null) continue;
      if (condVal) {
        if (inThen && (thenBlock.includes('HIGH') || thenBlock.includes('tone('))) return true;
        if (inThen && (thenBlock.includes('LOW') || thenBlock.includes('noTone('))) return false;
      } else {
        if (inElse && (elseBlock.includes('HIGH') || elseBlock.includes('tone('))) return true;
        if (inElse && (elseBlock.includes('LOW') || elseBlock.includes('noTone('))) return false;
        if (inThen) return false;
      }
    }
    return null;
  }

  private getPinVarName(pinNum: number): string | null {
    for (const [name, val] of this.varMap.entries()) {
      if (val === pinNum && name !== 'HIGH' && name !== 'LOW' && name !== 'LED_BUILTIN') return name;
    }
    return null;
  }

  private evalCondition(cond: string): boolean | null {
    let c = cond.trim();

    // 1. Resolve Serial.available()
    c = c.replace(/Serial\.available\s*\(\s*\)/g, String(this.serialRxBuffer.length));

    // 2. Resolve Serial.read() in condition
    c = c.replace(/Serial\.read\s*\(\s*\)/g, () => {
      if (this.serialRxBuffer.length > 0) {
        const code = this.serialRxBuffer.charCodeAt(0);
        this.serialRxBuffer = this.serialRxBuffer.slice(1);
        return String(code);
      }
      return '-1';
    });

    // 3. Resolve Serial.parseInt() in condition
    c = c.replace(/Serial\.parseInt\s*\(\s*\)/g, () => {
      const m = /[-+]?\d+/.exec(this.serialRxBuffer);
      if (m) {
        this.serialRxBuffer = this.serialRxBuffer.slice(m.index + m[0].length);
        return m[0];
      }
      return '0';
    });

    // 4. Resolve char literals e.g. '1' -> 49, 'a' -> 97, '0' -> 48 (keep double quoted strings intact)
    c = c.replace(/'([^'\\]|\\.)'/g, (_, s1) => {
      if (s1 === '\\n') return '10';
      if (s1 === '\\r') return '13';
      if (s1 === '\\0') return '0';
      return String(s1.charCodeAt(0));
    });

    // 5. Resolve analogRead calls in condition
    c = c.replace(/analogRead\s*\(\s*([A-Za-z0-9_]+)\s*\)/g, (_, p) => {
      const pin = this.resolvePin(p);
      const idx = pin > 13 ? pin - 14 : pin;
      return String(this.hooks.onAnalogRead(idx));
    });

    // 6. Resolve digitalRead calls in condition
    c = c.replace(/digitalRead\s*\(\s*([A-Za-z0-9_]+)\s*\)/g, (_, p) => {
      const pin = this.resolvePin(p);
      return this.hooks.onDigitalRead(pin) ? '1' : '0';
    });

    // 7. Resolve DHT sensor calls in condition e.g. if (dht.readTemperature() > 30)
    c = c.replace(/([A-Za-z0-9_]+)\.readTemperature\s*\(\s*(true|false)?\s*\)/g, (_, _obj, isFahr) => {
      const reading = this.getDhtReading();
      const isF = isFahr === 'true';
      const val = isF ? (reading.temperature * 1.8 + 32) : reading.temperature;
      return String(val);
    });
    c = c.replace(/([A-Za-z0-9_]+)\.readHumidity\s*\(\s*\)/g, () => {
      const reading = this.getDhtReading();
      return String(reading.humidity);
    });

    c = c.replace(/\bHIGH\b/g, '1').replace(/\bLOW\b/g, '0');

    // 8. Replace string variables for string comparisons
    for (const [key, strVal] of this.stringVarMap.entries()) {
      if (this.varMap.has(key)) continue;
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      c = c.replace(regex, JSON.stringify(strVal));
    }

    // 9. Replace numeric variables with their values
    const sortedKeys = Array.from(this.varMap.keys()).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      if (key === 'HIGH' || key === 'LOW') continue;
      const val = this.varMap.get(key)!;
      // Support digit equality e.g. input == 1 when input has ASCII 49 ('1')
      if (val >= 48 && val <= 57) {
        const digit = val - 48;
        const digitPattern = new RegExp(`\\b${key}\\s*==\\s*${digit}\\b`, 'g');
        c = c.replace(digitPattern, 'true');
      }
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      c = c.replace(regex, String(val));
    }

    // Evaluate logical condition safely
    try {
      if (/^[0-9.\s+\-*/%()><=!&|"'\w]+$/.test(c)) {
        const result = Function(`"use strict"; return Boolean(${c});`)();
        return typeof result === 'boolean' ? result : null;
      }
    } catch {
      return null;
    }
    return null;
  }

  private emitSerial() {
    if (!this.isRunning) return;
    const loopBody = this.extractFunctionBody('loop') || this.code;
    let loopTelemetryCode = loopBody;
    const setupBody = this.extractFunctionBody('setup');
    if (setupBody && loopBody === this.code) {
      loopTelemetryCode = loopTelemetryCode.replace(setupBody, '');
    }
    // Remove Serial.available / Serial.read blocks (with full nested brace matching) so event-based prints are not emitted repeatedly
    const availRe = /(?:if|while)\s*\(\s*Serial\.available[\s\S]*?\{/g;
    let am;
    while ((am = availRe.exec(loopTelemetryCode)) !== null) {
      const startIdx = am.index;
      let depth = 1;
      let endIdx = loopTelemetryCode.length;
      for (let i = am.index + am[0].length; i < loopTelemetryCode.length; i++) {
        if (loopTelemetryCode[i] === '{') depth++;
        else if (loopTelemetryCode[i] === '}') {
          depth--;
          if (depth === 0) {
            endIdx = i + 1;
            break;
          }
        }
      }
      loopTelemetryCode = loopTelemetryCode.slice(0, startIdx) + loopTelemetryCode.slice(endIdx);
      availRe.lastIndex = startIdx;
    }

    type Token = { pos: number; text: string; isNewline: boolean };
    const allTokens: Token[] = [];
    let m: RegExpExecArray | null;

    const litRe = /Serial\.print(?:ln)?\s*\(\s*"([^"]*)"\s*\)/g;
    litRe.lastIndex = 0;
    while ((m = litRe.exec(loopTelemetryCode)) !== null) {
      allTokens.push({ pos: m.index, text: m[1], isNewline: m[0].includes('println') });
    }

    const varRe = /Serial\.print(?:ln)?\s*\(\s*(analogRead\s*\(\s*[A-Za-z0-9_]+\s*\)|[A-Za-z0-9_]+\.(?:readTemperature|readHumidity)\s*\([^)]*\)|[A-Za-z0-9_]+)(?:\s*,\s*(\d+))?\s*\)/g;
    varRe.lastIndex = 0;
    while ((m = varRe.exec(loopTelemetryCode)) !== null) {
      const name = m[1];
      const precision = m[2] ? parseInt(m[2], 10) : null;
      if (name === 'Serial') continue;
      let displayVal: string;
      if (name.includes('readTemperature')) {
        const isFahr = name.includes('true');
        const reading = this.getDhtReading();
        const val = isFahr ? (reading.temperature * 1.8 + 32) : reading.temperature;
        displayVal = precision !== null ? val.toFixed(precision) : ((val % 1 !== 0) ? val.toFixed(1) : String(val));
      } else if (name.includes('readHumidity')) {
        const reading = this.getDhtReading();
        const val = reading.humidity;
        displayVal = precision !== null ? val.toFixed(precision) : ((val % 1 !== 0) ? val.toFixed(1) : String(val));
      } else if (name.startsWith('analogRead')) {
        const arMatch = /analogRead\s*\(\s*([A-Za-z0-9_]+)\s*\)/.exec(name);
        if (arMatch) {
          const pin = this.resolvePin(arMatch[1]);
          const idx = pin > 13 ? pin - 14 : pin;
          const readVal = this.hooks.onAnalogRead(idx);
          displayVal = String(readVal);
        } else {
          displayVal = '?';
        }
      } else if (this.varMap.has(name)) {
        const v = this.varMap.get(name)!;
        if (precision !== null) {
          displayVal = v.toFixed(precision);
        } else if (
          name === 'voltage' ||
          name.toLowerCase().includes('temp') ||
          name.toLowerCase().includes('hum') ||
          name.toLowerCase().includes('volt') ||
          name === 't' ||
          name === 'h'
        ) {
          displayVal = (v % 1 !== 0) ? v.toFixed(1) : String(v);
        } else {
          displayVal = (v % 1 !== 0) ? v.toFixed(2) : String(Math.round(v));
        }
      } else {
        displayVal = '?';
      }
      allTokens.push({ pos: m.index, text: displayVal, isNewline: m[0].includes('println') });
    }

    allTokens.sort((a, b) => a.pos - b.pos);
    if (allTokens.length === 0) return;

    let line = '';
    for (const tok of allTokens) {
      line += tok.text;
      if (tok.isNewline) {
        this.hooks.onSerialPrint(line + '\n');
        line = '';
      }
    }
    if (line) this.hooks.onSerialPrint(line + '\n');
  }

  private evaluateServoWrites(elapsed: number) {
    if (this.servoInstances.size === 0) {
      // Auto-detect attached pin from .attach() or pin definition if not parsed
      const attMatch = this.code.match(/([A-Za-z0-9_]+)\.attach\s*\(\s*([^)]+)\s*\)/);
      if (attMatch) {
        const pin = this.resolvePin(attMatch[2]);
        this.servoInstances.set(attMatch[1], { pin, currentAngle: 90 });
      } else {
        const pin = this.varMap.get('SERVO_PIN') ?? 3;
        this.servoInstances.set('myServo', { pin, currentAngle: 90 });
      }
    }

    // ── Strategy 1: Dynamic Sweep Segments (Any sequential For-Loops) ──────────────
    // Matches arbitrary loops: for (int angle = 0; angle <= 90; angle++) { ... servo.write(...) ... delay(...) ... }
    const forLoopRegex = /for\s*\(\s*(?:(?:int|float|double|long|auto|uint8_t|byte)\s+)?([A-Za-z0-9_]+)\s*=\s*([^;]+);\s*([^;]+);\s*([^)]+)\)\s*\{([^}]*)\}/g;

    interface SweepSegment {
      servoName: string;
      startAngle: number;
      endAngle: number;
      durationMs: number;
    }

    const sweepSegments: SweepSegment[] = [];
    let flm;
    while ((flm = forLoopRegex.exec(this.code)) !== null) {
      const varName = flm[1].trim();
      const initExpr = flm[2].trim();
      const condExpr = flm[3].trim();
      const stepExpr = flm[4].trim();
      const body = flm[5];

      const writeMatch = body.match(/([A-Za-z0-9_]+)\.write\s*\(\s*([^)]+)\s*\)/);
      if (!writeMatch) continue;

      const servoName = writeMatch[1].trim();
      const writeArg = writeMatch[2].trim();

      const delayMatch = body.match(/delay\s*\(\s*([^)]+)\s*\)/);
      const stepDelay = delayMatch
        ? (this.varMap.get(delayMatch[1].trim()) ?? parseInt(delayMatch[1], 10) ?? 15)
        : 15;

      // Evaluate initial loop variable value
      const startVal = this.varMap.get(initExpr) ?? this.evalMathExpr(initExpr) ?? parseFloat(initExpr) ?? 0;

      // Evaluate end loop variable value from condition operator
      let endVal = startVal;
      if (condExpr.includes('<=')) {
        const rhs = condExpr.split('<=')[1].trim();
        endVal = this.varMap.get(rhs) ?? this.evalMathExpr(rhs) ?? parseFloat(rhs) ?? startVal;
      } else if (condExpr.includes('<')) {
        const rhs = condExpr.split('<')[1].trim();
        endVal = (this.varMap.get(rhs) ?? this.evalMathExpr(rhs) ?? parseFloat(rhs) ?? (startVal + 1)) - 1;
      } else if (condExpr.includes('>=')) {
        const rhs = condExpr.split('>=')[1].trim();
        endVal = this.varMap.get(rhs) ?? this.evalMathExpr(rhs) ?? parseFloat(rhs) ?? startVal;
      } else if (condExpr.includes('>')) {
        const rhs = condExpr.split('>')[1].trim();
        endVal = (this.varMap.get(rhs) ?? this.evalMathExpr(rhs) ?? parseFloat(rhs) ?? (startVal - 1)) + 1;
      }

      // Step increment
      let stepVal = 1;
      if (stepExpr.includes('++')) stepVal = 1;
      else if (stepExpr.includes('--')) stepVal = -1;
      else if (stepExpr.includes('+=')) stepVal = parseFloat(stepExpr.split('+=')[1]) || 1;
      else if (stepExpr.includes('-=')) stepVal = -(parseFloat(stepExpr.split('-=')[1]) || 1);
      else stepVal = startVal <= endVal ? 1 : -1;

      // Evaluate mapped angle at start and end
      const evalAt = (val: number): number => {
        if (writeArg === varName) return val;
        const subbed = writeArg.replace(new RegExp(`\\b${varName}\\b`, 'g'), String(val));
        return this.evalMathExpr(subbed) ?? parseFloat(subbed) ?? val;
      };

      const startAngle = Math.max(0, Math.min(180, Math.round(evalAt(startVal))));
      const endAngle = Math.max(0, Math.min(180, Math.round(evalAt(endVal))));
      const stepCount = Math.max(1, Math.round(Math.abs(endVal - startVal) / Math.max(0.1, Math.abs(stepVal))));
      const durationMs = Math.max(30, (stepCount + 1) * Math.max(5, stepDelay));

      sweepSegments.push({
        servoName,
        startAngle,
        endAngle,
        durationMs,
      });
    }

    if (sweepSegments.length > 0) {
      const totalSweepDuration = sweepSegments.reduce((sum, seg) => sum + seg.durationMs, 0);
      let t = elapsed % Math.max(100, totalSweepDuration);

      let activeSeg = sweepSegments[0];
      for (const seg of sweepSegments) {
        if (t < seg.durationMs) {
          activeSeg = seg;
          break;
        }
        t -= seg.durationMs;
      }

      // Continuous linear interpolation inside active sweep segment
      const progress = Math.max(0, Math.min(1, t / activeSeg.durationMs));
      const currentAngle = Math.round(
        activeSeg.startAngle + (activeSeg.endAngle - activeSeg.startAngle) * progress
      );
      const clamped = Math.max(0, Math.min(180, currentAngle));

      const targetServo = this.servoInstances.get(activeSeg.servoName) || Array.from(this.servoInstances.values())[0];
      if (targetServo) {
        targetServo.currentAngle = clamped;
        this.hooks.onServoWrite?.(targetServo.pin, clamped);
      }
      return;
    }

    // ── Strategy 2: Sequential timed write statements ──────────────────────────────
    // e.g. write(0); delay(1000); write(90); delay(1000);
    const seqRegex = /([A-Za-z0-9_]+)\.write\s*\(\s*([^)]+)\s*\)(?:[\s\S]*?delay\s*\(\s*(\d+)\s*\))?/g;
    const steps: { servoName: string; expr: string; delayMs: number }[] = [];
    let sm;
    while ((sm = seqRegex.exec(this.code)) !== null) {
      steps.push({
        servoName: sm[1],
        expr: sm[2].trim(),
        delayMs: sm[3] ? parseInt(sm[3], 10) : 500,
      });
    }

    if (steps.length > 1) {
      const totalTime = steps.reduce((sum, s) => sum + s.delayMs, 0);
      let t = elapsed % Math.max(100, totalTime);
      let activeStep = steps[0];
      for (const st of steps) {
        if (t < st.delayMs) {
          activeStep = st;
          break;
        }
        t -= st.delayMs;
      }

      const s = this.servoInstances.get(activeStep.servoName) || Array.from(this.servoInstances.values())[0];
      if (s) {
        const angle = this.varMap.get(activeStep.expr) ?? this.evalMathExpr(activeStep.expr) ?? parseFloat(activeStep.expr);
        if (!isNaN(angle)) {
          const clamped = Math.max(0, Math.min(180, Math.round(angle)));
          s.currentAngle = clamped;
          this.hooks.onServoWrite?.(s.pin, clamped);
        }
      }
      return;
    }

    // ── Strategy 3: Continuous variable, potentiometer, or formula write ─────────
    // e.g. val = map(analogRead(A0), 0, 1023, 0, 180); myServo.write(val);
    const writeRegex = /([A-Za-z0-9_]+)\.write\s*\(\s*([^)]+)\s*\)/g;
    let wm;
    while ((wm = writeRegex.exec(this.code)) !== null) {
      const servoName = wm[1];
      const expr = wm[2].trim();
      const s = this.servoInstances.get(servoName) || Array.from(this.servoInstances.values())[0];
      if (!s) continue;

      let angle: number | null = null;
      if (this.varMap.has(expr)) {
        angle = this.varMap.get(expr)!;
      } else {
        angle = this.evalMathExpr(expr);
        if (angle === null) {
          const num = parseFloat(expr);
          if (!isNaN(num)) angle = num;
        }
      }

      if (angle !== null) {
        const clamped = Math.max(0, Math.min(180, Math.round(angle)));
        s.currentAngle = clamped;
        this.hooks.onServoWrite?.(s.pin, clamped);
      }
    }
  }

  private evaluateStepperWrites(elapsed: number) {
    // 1. Detect Stepper instances: e.g. Stepper myStepper(200, 8, 9, 10, 11) or Stepper mystepper=Stepper(steps,5,2,4,12)
    const stepperVarRegex = /Stepper\s+([A-Za-z0-9_]+)\s*(?:=\s*Stepper\s*)?\(\s*([^,]+)/g;
    let stm;
    while ((stm = stepperVarRegex.exec(this.code)) !== null) {
      const rawName = stm[1].trim();
      const keyName = rawName.toLowerCase();
      const param = stm[2].trim();
      const stepsPerRev = this.varMap.get(param) ?? parseInt(param, 10) ?? 2048;
      if (!this.stepperInstances.has(keyName)) {
        this.stepperInstances.set(keyName, {
          stepsPerRev: isNaN(stepsPerRev) || stepsPerRev <= 0 ? 2048 : stepsPerRev,
          currentStep: 0,
          currentAngle: 0,
          speedRpm: 60,
        });
      }
    }

    // 2. Parse setSpeed: e.g. myStepper.setSpeed(5);
    const speedRegex = /([A-Za-z0-9_]+)\.setSpeed\s*\(\s*([^)]+)\s*\)/g;
    let spm;
    while ((spm = speedRegex.exec(this.code)) !== null) {
      const keyName = spm[1].trim().toLowerCase();
      const param = spm[2].trim();
      const rpm = this.varMap.get(param) ?? parseFloat(param) ?? 60;
      const target =
        this.stepperInstances.get(keyName) ||
        (this.stepperInstances.size > 0 ? Array.from(this.stepperInstances.values())[0] : null);
      if (target) {
        target.speedRpm = isNaN(rpm) || rpm <= 0 ? 60 : rpm;
      }
    }

    // 3. Parse step calls & delays: e.g. myStepper.step(200); delay(500); myStepper.step(-200); delay(500);
    const stepRegex = /([A-Za-z0-9_]+)\.step\s*\(\s*([^)]+)\s*\)/g;
    const stepMatches: { keyName: string; stepVal: number; index: number }[] = [];
    let stepm;
    while ((stepm = stepRegex.exec(this.code)) !== null) {
      const keyName = stepm[1].trim().toLowerCase();
      const expr = stepm[2].trim();
      let stepVal = this.varMap.get(expr) ?? this.evalMathExpr(expr) ?? parseFloat(expr) ?? 200;
      if (isNaN(stepVal)) stepVal = 200;
      stepMatches.push({ keyName, stepVal, index: stepm.index });
    }

    if (stepMatches.length === 0) return;

    // Find default delay
    const delayMatch = this.code.match(/delay\s*\(\s*(\d+)\s*\)/);
    const defaultDelayMs = delayMatch ? parseInt(delayMatch[1], 10) : 500;

    // Calculate segments for each step in sequence
    let totalCycleTimeMs = 0;
    const segments: { keyName: string; stepVal: number; startAngle: number; endAngle: number; startTimeMs: number; moveDurationMs: number; endTimeMs: number }[] = [];
    let runningAngle = 0;

    for (const sm of stepMatches) {
      const st =
        this.stepperInstances.get(sm.keyName) ||
        (this.stepperInstances.size > 0 ? Array.from(this.stepperInstances.values())[0] : null);

      const rpm = st ? Math.max(1, st.speedRpm) : 60;
      const stepsPerRev = st ? st.stepsPerRev : 200;

      const degreesPerSec = rpm * 6; // (RPM * 360) / 60
      const totalDegrees = (sm.stepVal / stepsPerRev) * 360;
      const moveDurationMs = Math.max(50, (Math.abs(totalDegrees) / degreesPerSec) * 1000);
      const segmentTotalMs = moveDurationMs + defaultDelayMs;

      const startAngle = runningAngle;
      const endAngle = runningAngle + totalDegrees;
      runningAngle = endAngle;

      segments.push({
        keyName: sm.keyName,
        stepVal: sm.stepVal,
        startAngle,
        endAngle,
        startTimeMs: totalCycleTimeMs,
        moveDurationMs,
        endTimeMs: totalCycleTimeMs + segmentTotalMs,
      });

      totalCycleTimeMs += segmentTotalMs;
    }

    const cycleProgress = elapsed % Math.max(100, totalCycleTimeMs);

    // Find active segment
    let calculatedAngle = runningAngle;
    let activeRpm = 60;
    let activeStepVal = stepMatches[0].stepVal;

    for (const seg of segments) {
      if (cycleProgress >= seg.startTimeMs && cycleProgress < seg.endTimeMs) {
        activeStepVal = seg.stepVal;
        const st = this.stepperInstances.get(seg.keyName);
        if (st) activeRpm = st.speedRpm;

        const timeInSeg = cycleProgress - seg.startTimeMs;
        if (timeInSeg < seg.moveDurationMs) {
          const progress = timeInSeg / seg.moveDurationMs;
          calculatedAngle = seg.startAngle + progress * (seg.endAngle - seg.startAngle);
        } else {
          calculatedAngle = seg.endAngle;
        }
        break;
      }
    }

    const finalAngle = ((calculatedAngle % 360) + 360) % 360;
    for (const st of this.stepperInstances.values()) {
      st.currentAngle = finalAngle;
    }
    this.hooks.onStepperStep?.(activeStepVal, activeRpm, finalAngle);
  }

  private evaluateLcdWrites() {
    let curRow = 0;
    let curCol = 0;
    let buf1 = Array(16).fill(' ');
    let buf2 = Array(16).fill(' ');

    const writeToBuf = (row: number, col: number, text: string) => {
      const target = row === 0 ? buf1 : buf2;
      for (let i = 0; i < text.length; i++) {
        const p = col + i;
        if (p >= 0 && p < 16) {
          target[p] = text[i];
        }
      }
    };

    // Sequential parsing of lcd.init(), lcd.begin(), lcd.setCursor(c, r), lcd.print("...")
    const lcdCallRegex = /lcd\.(setCursor|print|println|clear|init|begin)\s*\(\s*([^)]*)\s*\)/g;
    let m: RegExpExecArray | null;

    while ((m = lcdCallRegex.exec(this.code)) !== null) {
      const fn = m[1];
      const rawArg = m[2].trim();

      if (fn === 'clear' || fn === 'init' || fn === 'begin') {
        buf1 = Array(16).fill(' ');
        buf2 = Array(16).fill(' ');
        curRow = 0;
        curCol = 0;
      } else if (fn === 'setCursor') {
        const parts = rawArg.split(',').map((s) => s.trim());
        if (parts.length >= 2) {
          const c = this.varMap.get(parts[0]) ?? parseInt(parts[0], 10) ?? 0;
          const r = this.varMap.get(parts[1]) ?? parseInt(parts[1], 10) ?? 0;
          curCol = isNaN(c) ? 0 : Math.max(0, Math.min(15, c));
          curRow = isNaN(r) ? 0 : Math.max(0, Math.min(1, r));
        }
      } else if (fn === 'print' || fn === 'println') {
        let printText = '';
        const strMatch = /^"([^"]*)"$/.exec(rawArg);
        if (strMatch) {
          printText = strMatch[1];
        } else {
          const commaIdx = rawArg.indexOf(',');
          const exprPart = commaIdx !== -1 ? rawArg.slice(0, commaIdx).trim() : rawArg;
          const precPart = commaIdx !== -1 ? parseInt(rawArg.slice(commaIdx + 1).trim(), 10) : null;
          const precision = precPart !== null && !isNaN(precPart) ? precPart : null;

          if (this.varMap.has(exprPart)) {
            const v = this.varMap.get(exprPart)!;
            printText = precision !== null ? v.toFixed(precision) : (v % 1 !== 0 ? v.toFixed(2) : String(Math.round(v)));
          } else {
            const mathVal = this.evalMathExpr(exprPart);
            if (mathVal !== null) {
              printText = precision !== null ? mathVal.toFixed(precision) : (mathVal % 1 !== 0 ? mathVal.toFixed(2) : String(Math.round(mathVal)));
            } else {
              printText = rawArg;
            }
          }
        }

        writeToBuf(curRow, curCol, printText);
        curCol += printText.length;
      }
    }

    const line1 = buf1.join('').trimEnd();
    const line2 = buf2.join('').trimEnd();
    this.hooks.onLcdUpdate?.(line1, line2);
  }

  private evaluateSevSegWrites(elapsed: number) {
    // 1. Extract all array declarations across the entire sketch (e.g. byte commonpins[] = {}; byte segpins[] = {2,3,4,5,6,7,8,9};)
    const declaredArrays = new Map<string, number[]>();
    const arrDeclRe = /(?:(?:const\s+)?(?:byte|int|uint8_t|short)\s+)?([A-Za-z0-9_]+)\s*\[\s*\]\s*=\s*\{([^}]*)\}/gi;
    let am: RegExpExecArray | null;
    while ((am = arrDeclRe.exec(this.code)) !== null) {
      const arrName = am[1].trim();
      const rawContent = am[2].trim();
      const items = rawContent
        ? rawContent.split(',').map((p) => this.resolvePin(p.trim())).filter((n) => !isNaN(n))
        : [];
      declaredArrays.set(arrName, items);
    }

    // 2. Initialize SevSeg configuration if not already configured
    if (!this.sevsegConfig) {
      // Find SevSeg variable instance name: e.g. SevSeg display; or SevSeg mySeg;
      const instMatch = /SevSeg\s+([A-Za-z0-9_]+)/i.exec(this.code);
      const instName = instMatch ? instMatch[1] : '[A-Za-z0-9_]+';

      // Parse .begin(...) with any variable names: e.g. display.begin(COMMON_CATHODE, digitcount, commonpins, segpins, resistorsetting);
      const beginMatch = new RegExp(`(?:${instName}|[A-Za-z0-9_]+)\\.begin\\s*\\(([^)]+)\\)`, 'i').exec(this.code);

      let isCommonAnode = false;
      let numDigits = 1;
      let digitPins: number[] = [];
      let segmentPins: number[] = [2, 3, 4, 5, 6, 7, 8, 9];

      if (beginMatch) {
        const rawArgs = beginMatch[1].split(',').map((s) => s.trim());

        // Arg 0: Hardware configuration (COMMON_ANODE vs COMMON_CATHODE)
        const cfgArg = rawArgs[0] || '';
        if (/COMMON_ANODE|P_TRANSISTORS/i.test(cfgArg) || cfgArg === '1') {
          isCommonAnode = true;
        } else if (/COMMON_CATHODE|N_TRANSISTORS/i.test(cfgArg) || cfgArg === '0') {
          isCommonAnode = false;
        } else {
          // Check if variable defined as COMMON_ANODE or COMMON_CATHODE
          const cfgVarMatch = new RegExp(`(?:byte|int|auto)\\s+${cfgArg}\\s*=\\s*([^;]+)`, 'i').exec(this.code);
          if (cfgVarMatch && /COMMON_ANODE|P_TRANSISTORS|1/i.test(cfgVarMatch[1])) {
            isCommonAnode = true;
          }
        }

        // Arg 1: Number of digits (e.g. digitcount, numDigits, or literal 1, 4)
        const digArg = rawArgs[1] || '1';
        const parsedDigits = parseInt(digArg, 10);
        if (!isNaN(parsedDigits)) {
          numDigits = parsedDigits;
        } else if (this.varMap.has(digArg)) {
          numDigits = this.varMap.get(digArg)!;
        } else {
          const varMatch = new RegExp(`(?:byte|int|uint8_t|short)\\s+${digArg}\\s*=\\s*(\\d+)`, 'i').exec(this.code);
          if (varMatch) numDigits = parseInt(varMatch[1], 10);
        }

        // Arg 2: Common / digit select pins array
        const comArg = rawArgs[2] || '';
        if (declaredArrays.has(comArg)) {
          digitPins = declaredArrays.get(comArg)!;
        } else if (comArg.startsWith('{')) {
          digitPins = comArg.replace(/[{}]/g, '').split(',').map((p) => this.resolvePin(p.trim())).filter((n) => !isNaN(n));
        }

        // Arg 3: Segment pins array (A, B, C, D, E, F, G, DP)
        const segArg = rawArgs[3] || '';
        if (declaredArrays.has(segArg)) {
          segmentPins = declaredArrays.get(segArg)!;
        } else if (segArg.startsWith('{')) {
          segmentPins = segArg.replace(/[{}]/g, '').split(',').map((p) => this.resolvePin(p.trim())).filter((n) => !isNaN(n));
        }
      }

      // If segment pins were not specified or found, check any declared array with 7 or 8 elements
      if (segmentPins.length < 7) {
        for (const arr of declaredArrays.values()) {
          if (arr.length === 7 || arr.length === 8) {
            segmentPins = arr;
            break;
          }
        }
      }

      this.sevsegConfig = {
        isConfigured: true,
        isCommonAnode,
        numDigits: numDigits > 0 ? numDigits : 1,
        digitPins,
        segmentPins,
      };
    }

    const { isCommonAnode, numDigits, segmentPins, digitPins } = this.sevsegConfig;

    // Standard 7-Segment display patterns for characters: [A, B, C, D, E, F, G, DP]
    const DIGIT_PATTERNS: Record<string, number[]> = {
      '0': [1, 1, 1, 1, 1, 1, 0, 0],
      '1': [0, 1, 1, 0, 0, 0, 0, 0],
      '2': [1, 1, 0, 1, 1, 0, 1, 0],
      '3': [1, 1, 1, 1, 0, 0, 1, 0],
      '4': [0, 1, 1, 0, 0, 1, 1, 0],
      '5': [1, 0, 1, 1, 0, 1, 1, 0],
      '6': [1, 0, 1, 1, 1, 1, 1, 0],
      '7': [1, 1, 1, 0, 0, 0, 0, 0],
      '8': [1, 1, 1, 1, 1, 1, 1, 0],
      '9': [1, 1, 1, 1, 0, 1, 1, 0],
      '-': [0, 0, 0, 0, 0, 0, 1, 0],
      ' ': [0, 0, 0, 0, 0, 0, 0, 0],
      'A': [1, 1, 1, 0, 1, 1, 1, 0],
      'B': [0, 0, 1, 1, 1, 1, 1, 0],
      'C': [1, 0, 0, 1, 1, 1, 0, 0],
      'D': [0, 1, 1, 1, 1, 0, 1, 0],
      'E': [1, 0, 0, 1, 1, 1, 1, 0],
      'F': [1, 0, 0, 0, 1, 1, 1, 0],
      'G': [1, 0, 1, 1, 1, 1, 0, 0],
      'H': [0, 1, 1, 0, 1, 1, 1, 0],
      'I': [0, 1, 1, 0, 0, 0, 0, 0],
      'J': [0, 1, 1, 1, 1, 0, 0, 0],
      'L': [0, 0, 0, 1, 1, 1, 0, 0],
      'N': [0, 0, 1, 0, 1, 0, 1, 0],
      'O': [1, 1, 1, 1, 1, 1, 0, 0],
      'P': [1, 1, 0, 0, 1, 1, 1, 0],
      'Q': [1, 1, 1, 0, 0, 1, 1, 0],
      'R': [0, 0, 0, 0, 1, 0, 1, 0],
      'S': [1, 0, 1, 1, 0, 1, 1, 0],
      'T': [0, 0, 0, 1, 1, 1, 1, 0],
      'U': [0, 1, 1, 1, 1, 1, 0, 0],
      'Y': [0, 1, 1, 1, 0, 1, 1, 0],
    };

    // 3. Evaluate display output value
    let displayText: string | null = null;
    let decPlaces: number | null = null;

    // Check blank()
    if (/\.blank\s*\(\s*\)/i.test(this.code)) {
      displayText = '';
    }

    // Check setChars("...")
    const setCharsMatch = /\.setChars\s*\(\s*"([^"]+)"\s*\)/i.exec(this.code);
    if (setCharsMatch) {
      displayText = setCharsMatch[1];
    }

    // Check setNumber(...) / setNumberF(...)
    if (displayText === null) {
      // Find all setNumber calls
      const setNumRe = /(?:[A-Za-z0-9_]+)\.setNumber(?:F)?\s*\(\s*([^,)]+)(?:,\s*([^)]+))?\)/gi;
      const allCalls: { expr: string; dec: string | null }[] = [];
      let sn: RegExpExecArray | null;
      while ((sn = setNumRe.exec(this.code)) !== null) {
        allCalls.push({ expr: sn[1].trim(), dec: sn[2]?.trim() || null });
      }

      if (allCalls.length === 1) {
        const { expr: rawExpr, dec: rawDec } = allCalls[0];

        if (rawDec) {
          const d = this.varMap.get(rawDec) ?? parseInt(rawDec, 10);
          if (!isNaN(d)) decPlaces = d;
        }

        // Check if rawExpr is a fixed numeric literal (e.g. display.setNumber(1);)
        const isNumericLiteral = /^-?\d+(?:\.\d+)?$/.test(rawExpr);

        if (isNumericLiteral) {
          // Strictly fixed number constant — NEVER increment or auto-count
          const fixedNum = parseFloat(rawExpr);
          displayText = decPlaces !== null && decPlaces >= 0
            ? fixedNum.toFixed(decPlaces)
            : String(fixedNum);
        } else {
          // It's a variable or expression: e.g. display.setNumber(count);
          // Check if variable is incremented inside loop/code (e.g. count++ / i++ / count += 1)
          const hasIncrement = new RegExp(`(?:${rawExpr}\\s*\\+\\+|\\+\\+\\s*${rawExpr}|${rawExpr}\\s*\\+=|${rawExpr}\\s*=\\s*${rawExpr}\\s*\\+)`).test(this.code);

          // Check if inside a for loop: e.g. for (int i = 0; i < 10; i++)
          const forMatch = new RegExp(`for\\s*\\([^;]*${rawExpr}\\s*=\\s*(\\d+)[^;]*${rawExpr}\\s*<\\s*(\\d+)[^)]*\\)`).exec(this.code);

          if (forMatch) {
            const startVal = parseInt(forMatch[1], 10) || 0;
            const endVal = parseInt(forMatch[2], 10) || 10;
            const delayMatch = /delay\s*\(\s*(\d+)\s*\)/.exec(this.code);
            const stepDelayMs = delayMatch ? parseInt(delayMatch[1], 10) : 1000;
            const range = Math.max(1, endVal - startVal);
            const currentStep = Math.floor(elapsed / Math.max(50, stepDelayMs)) % range;
            const computed = startVal + currentStep;
            displayText = String(computed);
          } else if (hasIncrement) {
            const delayMatch = /delay\s*\(\s*(\d+)\s*\)/.exec(this.code);
            const stepDelayMs = delayMatch ? parseInt(delayMatch[1], 10) : 1000;
            const initialVal = this.varMap.get(rawExpr) ?? 0;
            const maxLimit = numDigits === 1 ? 10 : 10000;
            const currentCount = (initialVal + Math.floor(elapsed / Math.max(50, stepDelayMs))) % maxLimit;
            displayText = String(currentCount);
          } else if (/millis\s*\(\s*\)/.test(rawExpr)) {
            const val = Math.floor(elapsed / 1000);
            displayText = String(numDigits === 1 ? val % 10 : val % 10000);
          } else if (this.varMap.has(rawExpr)) {
            const val = this.varMap.get(rawExpr)!;
            displayText = decPlaces !== null && decPlaces >= 0 ? val.toFixed(decPlaces) : String(Math.round(val));
          } else {
            const evaluated = this.evalMathExpr(rawExpr);
            if (evaluated !== null) {
              displayText = decPlaces !== null && decPlaces >= 0 ? evaluated.toFixed(decPlaces) : String(Math.round(evaluated));
            } else {
              displayText = rawExpr;
            }
          }
        }
      } else if (allCalls.length > 1) {
        // Multiple sequential setNumber calls: step through them
        const delayMatch = /delay\s*\(\s*(\d+)\s*\)/.exec(this.code);
        const stepDelayMs = delayMatch ? parseInt(delayMatch[1], 10) : 1000;
        const activeIdx = Math.floor(elapsed / Math.max(50, stepDelayMs)) % allCalls.length;
        const activeCall = allCalls[activeIdx];
        const val = this.varMap.get(activeCall.expr) ?? parseFloat(activeCall.expr);
        displayText = isNaN(val) ? activeCall.expr : String(val);
      }
    }

    // If no display commands were called at all, keep display unlit / empty (do NOT fake count!)
    if (displayText === null) {
      displayText = '';
    }

    // Format characters across digits
    const cleanChars = displayText.replace(/\./g, '').slice(-numDigits).padStart(numDigits, ' ');
    const allSegments: number[] = [];

    for (let d = 0; d < numDigits; d++) {
      const ch = (cleanChars[d] || ' ').toUpperCase();
      const pattern = DIGIT_PATTERNS[ch] ? [...DIGIT_PATTERNS[ch]] : [0, 0, 0, 0, 0, 0, 0, 0];

      // Set decimal point if needed
      if (decPlaces !== null && d === numDigits - 1 - decPlaces) {
        pattern[7] = 1;
      }

      allSegments.push(...pattern);
    }

    // 4. Drive output pins:
    // Segments A, B, C, D, E, F, G, DP
    const activeSegs = allSegments.slice(0, 8);
    for (let i = 0; i < segmentPins.length && i < 8; i++) {
      const pin = segmentPins[i];
      const isLit = Boolean(activeSegs[i]);
      // Common Cathode: HIGH = Lit, LOW = Unlit
      // Common Anode: LOW = Lit, HIGH = Unlit
      const pinState = isCommonAnode ? !isLit : isLit;
      this.hooks.onDigitalWrite(pin, pinState);
    }

    // Digit select pins (for 4-digit multiplexing)
    for (let d = 0; d < digitPins.length && d < numDigits; d++) {
      const digPin = digitPins[d];
      const isDigActive = true;
      const digState = isCommonAnode ? isDigActive : !isDigActive;
      this.hooks.onDigitalWrite(digPin, digState);
    }

    // 5. Update high-level state
    this.hooks.onSevenSegmentUpdate?.(allSegments, numDigits, displayText);
  }

  public stop() {
    this.isRunning = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}