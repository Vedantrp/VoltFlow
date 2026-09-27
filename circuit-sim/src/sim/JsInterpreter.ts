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
  onSerialPrint: (text: string) => void;
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
  private servoInstances = new Map<string, { pin: number; currentAngle: number }>();
  private stepperInstances = new Map<string, { stepsPerRev: number; currentStep: number; currentAngle: number; speedRpm: number }>();
  private sequenceSteps: SequenceStep[] = [];
  private totalSequenceDuration = 0;
  private code: string;
  private hooks: InterpreterHooks;

  constructor(code: string, hooks: InterpreterHooks) {
    this.code = code;
    this.hooks = hooks;
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

  private buildSequenceTimeline() {
    this.sequenceSteps = [];
    this.totalSequenceDuration = 0;

    // Preserve dynamic evaluation for interactive sensor reads and Servo motor sweeps
    if (this.code.includes('Servo') || this.code.includes('.write(') || this.code.includes('analogRead(') || this.code.includes('digitalRead(')) {
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
      const raw = this.hooks.onAnalogRead(0);
      const tempC = parseFloat((20 + (raw / 1023) * 30).toFixed(1));
      const humPct = parseFloat((40 + (raw / 1023) * 40).toFixed(1));
      this.varMap.set('temperature', tempC);
      this.varMap.set('tempC', tempC);
      this.varMap.set('t', tempC);
      this.varMap.set('humidity', humPct);
      this.varMap.set('h', humPct);
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

    for (const [pin, writes] of pinWrites.entries()) {
      let isHigh: boolean;
      if (writes.length >= 2) {
        const delays = Array.from(this.code.matchAll(/delay\s*\(\s*(\d+)\s*\)/g)).map(x => parseInt(x[1], 10));
        const hi = delays[0] || 1000;
        const lo = delays[1] ?? delays[0] ?? 1000;
        isHigh = (elapsed % (hi + lo)) < hi;
      } else {
        const expr = writes[0];
        if      (expr === 'HIGH' || expr === '1' || expr === 'true')  isHigh = true;
        else if (expr === 'LOW'  || expr === '0' || expr === 'false') isHigh = false;
        else if (this.varMap.has(expr)) isHigh = this.varMap.get(expr)! !== 0;
        else isHigh = false;
        const cond = this.resolveConditionalWrite(pin);
        if (cond !== null) isHigh = cond;
      }
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

    // 6. Serial output on tick 1 and every 4 ticks
    if (this.loopCount === 1 || this.loopCount % 4 === 0) {
      this.emitSerial();
    }

    if (this.isRunning) {
      this.timerId = setTimeout(this.tick, 50) as unknown as number;
    }
  };

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

    const sortedKeys = Array.from(this.varMap.keys()).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      const val = this.varMap.get(key)!;
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      sanitized = sanitized.replace(regex, String(val));
    }
    sanitized = sanitized.replace(/\((?:float|int|double|long|uint8_t|byte)\)/g, '');
    try {
      // Safe arithmetic evaluator restricted to mathematical expressions
      if (/^[0-9.\s+\-*/%()Math.,eE><=!&|]+$/.test(sanitized)) {
        const result = Function(`"use strict"; return (${sanitized});`)();
        if (typeof result === 'number' && !isNaN(result)) return result;
      }
    } catch {
      return null;
    }
    return null;
  }

  private resolveConditionalWrite(pinNum: number): boolean | null {
    const ifRe = /if\s*\(([^)]+)\)\s*\{([^}]*)\}(?:\s*else\s*(?:if\s*\([^)]+\)\s*)?\{([^}]*)\})?/g;
    let m;
    while ((m = ifRe.exec(this.code)) !== null) {
      const condition = m[1];
      const thenBlock = m[2] || '';
      const elseBlock = m[3] || '';
      const pinStr    = String(pinNum);
      const pinName   = this.getPinVarName(pinNum);
      const inThen = thenBlock.includes('digitalWrite') && (thenBlock.includes(pinStr) || (pinName !== null && thenBlock.includes(pinName)));
      const inElse = elseBlock.includes('digitalWrite') && (elseBlock.includes(pinStr) || (pinName !== null && elseBlock.includes(pinName)));
      if (!inThen && !inElse) continue;
      const condVal = this.evalCondition(condition);
      if (condVal === null) continue;
      if (condVal) {
        if (inThen && thenBlock.includes('HIGH')) return true;
        if (inThen && thenBlock.includes('LOW'))  return false;
      } else {
        if (inElse && elseBlock.includes('HIGH')) return true;
        if (inElse && elseBlock.includes('LOW'))  return false;
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
    // Resolve analogRead calls in condition
    c = c.replace(/analogRead\s*\(\s*([A-Za-z0-9_]+)\s*\)/g, (_, p) => {
      const pin = this.resolvePin(p);
      const idx = pin > 13 ? pin - 14 : pin;
      return String(this.hooks.onAnalogRead(idx));
    });

    // Resolve digitalRead calls in condition
    c = c.replace(/digitalRead\s*\(\s*([A-Za-z0-9_]+)\s*\)/g, (_, p) => {
      const pin = this.resolvePin(p);
      return this.hooks.onDigitalRead(pin) ? '1' : '0';
    });

    c = c.replace(/\bHIGH\b/g, '1').replace(/\bLOW\b/g, '0');

    // Replace variables with their values
    const sortedKeys = Array.from(this.varMap.keys()).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      if (key === 'HIGH' || key === 'LOW') continue;
      const val = this.varMap.get(key)!;
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      c = c.replace(regex, String(val));
    }

    // Evaluate logical condition safely
    try {
      if (/^[0-9.\s+\-*/%()><=!&|]+$/.test(c)) {
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
    type Token = { pos: number; text: string; isNewline: boolean };
    const allTokens: Token[] = [];
    let m: RegExpExecArray | null;

    const litRe = /Serial\.print(?:ln)?\s*\(\s*"([^"]*)"\s*\)/g;
    litRe.lastIndex = 0;
    while ((m = litRe.exec(this.code)) !== null) {
      allTokens.push({ pos: m.index, text: m[1], isNewline: m[0].includes('println') });
    }

    const varRe = /Serial\.print(?:ln)?\s*\(\s*(analogRead\s*\(\s*[A-Za-z0-9_]+\s*\)|[A-Za-z0-9_]+)(?:\s*,\s*(\d+))?\s*\)/g;
    varRe.lastIndex = 0;
    while ((m = varRe.exec(this.code)) !== null) {
      const name = m[1];
      const precision = m[2] ? parseInt(m[2], 10) : null;
      if (name === 'Serial') continue;
      let displayVal: string;
      if (name.startsWith('analogRead')) {
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
        } else if (name === 'voltage' || name.toLowerCase().includes('temp') || name.toLowerCase().includes('volt')) {
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

    // 3. Parse step calls & delays: e.g. myStepper.step(steps); delay(2000);
    const stepRegex = /([A-Za-z0-9_]+)\.step\s*\(\s*([^)]+)\s*\)/g;
    let stepm;
    while ((stepm = stepRegex.exec(this.code)) !== null) {
      const keyName = stepm[1].trim().toLowerCase();
      const expr = stepm[2].trim();
      let stepVal = this.varMap.get(expr) ?? this.evalMathExpr(expr) ?? parseFloat(expr) ?? 2048;
      if (isNaN(stepVal)) stepVal = 2048;

      const st =
        this.stepperInstances.get(keyName) ||
        (this.stepperInstances.size > 0 ? Array.from(this.stepperInstances.values())[0] : null);

      const delayMatch = this.code.match(/delay\s*\(\s*(\d+)\s*\)/);
      const delayMs = delayMatch ? parseInt(delayMatch[1], 10) : 1000;

      const rpm = st ? Math.max(1, st.speedRpm) : 60;
      const stepsPerRev = st ? st.stepsPerRev : 2048;

      // Speed in degrees/sec: (RPM * 360) / 60 = RPM * 6
      const degreesPerSec = rpm * 6;
      const totalDegrees = (stepVal / stepsPerRev) * 360;
      const motionTimeMs = (Math.abs(totalDegrees) / degreesPerSec) * 1000;
      const totalCycleMs = motionTimeMs + delayMs;

      const cycleProgress = elapsed % Math.max(100, totalCycleMs);

      let calculatedAngle: number;
      if (cycleProgress < motionTimeMs) {
        // Motor is actively rotating
        const motionProgress = cycleProgress / motionTimeMs;
        calculatedAngle = (motionProgress * totalDegrees) % 360;
      } else {
        // Motor is paused during delay period
        calculatedAngle = totalDegrees % 360;
      }

      const finalAngle = (calculatedAngle + 360) % 360;
      if (st) {
        st.currentAngle = finalAngle;
      }
      this.hooks.onStepperStep?.(stepVal, rpm, finalAngle);
    }
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
        } else if (this.varMap.has(rawArg)) {
          const v = this.varMap.get(rawArg)!;
          printText = (v % 1 !== 0) ? v.toFixed(2) : String(Math.round(v));
        } else {
          const mathVal = this.evalMathExpr(rawArg);
          if (mathVal !== null) {
            printText = (mathVal % 1 !== 0) ? mathVal.toFixed(2) : String(Math.round(mathVal));
          } else {
            printText = rawArg;
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

  public stop() {
    this.isRunning = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}