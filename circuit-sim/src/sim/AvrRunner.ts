import {
  CPU,
  avrInstruction,
  AVRIOPort,
  portBConfig,
  portCConfig,
  portDConfig,
  AVRUSART,
  usart0Config,
  AVRTimer,
  timer0Config,
  AVRADC,
  adcConfig,
  ADCMuxInputType,
} from 'avr8js';

const CPU_FREQUENCY = 16_000_000; // 16 MHz, matches Arduino Uno crystal

export type ArduinoPin = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19;

// Map Arduino digital pin numbers -> (port, bit)
function pinToPortBit(pin: ArduinoPin): { port: 'B' | 'C' | 'D'; bit: number } {
  if (pin <= 7) return { port: 'D', bit: pin };
  if (pin <= 13) return { port: 'B', bit: pin - 8 };
  return { port: 'C', bit: pin - 14 };
}

/** Parse an Intel HEX string into a Uint8Array loaded at the right offsets. */
function loadHex(hex: string, programSize = 32 * 1024): Uint8Array {
  const program = new Uint8Array(programSize);
  for (const rawLine of hex.split('\n')) {
    const line = rawLine.trim();
    if (!line.startsWith(':')) continue;
    const byteCount = parseInt(line.substring(1, 3), 16);
    const address = parseInt(line.substring(3, 7), 16);
    const recordType = parseInt(line.substring(7, 9), 16);
    if (recordType !== 0) continue; // only handle data records
    for (let i = 0; i < byteCount; i++) {
      const byteHex = line.substring(9 + i * 2, 11 + i * 2);
      program[address + i] = parseInt(byteHex, 16);
    }
  }
  return program;
}

export interface AvrRunnerCallbacks {
  onPinChange?: (pin: ArduinoPin, isHigh: boolean) => void;
  onSerialByte?: (byte: number) => void;
  onAnalogRead?: (pin: number) => number;
}

export class AvrRunner {
  readonly cpu: CPU;
  private portB: AVRIOPort;
  private portC: AVRIOPort;
  private portD: AVRIOPort;
  private usart: AVRUSART;
  private adc: AVRADC;
  private stopped = false;
  private cyclesPerMs = CPU_FREQUENCY / 1000;

  constructor(hex: string, callbacks: AvrRunnerCallbacks = {}) {
    const program = loadHex(hex);
    this.cpu = new CPU(new Uint16Array(program.buffer));

    this.portB = new AVRIOPort(this.cpu, portBConfig);
    this.portC = new AVRIOPort(this.cpu, portCConfig);
    this.portD = new AVRIOPort(this.cpu, portDConfig);
    new AVRTimer(this.cpu, timer0Config);
    this.usart = new AVRUSART(this.cpu, usart0Config, CPU_FREQUENCY);
    this.adc = new AVRADC(this.cpu, adcConfig);

    if (callbacks.onAnalogRead) {
      this.adc.onADCRead = (input) => {
        if (input.type === ADCMuxInputType.SingleEnded) {
          const val = callbacks.onAnalogRead!(input.channel);
          this.adc.completeADCRead(val);
        } else {
          this.adc.completeADCRead(512);
        }
      };
    }

    if (callbacks.onPinChange) {
      // AVRIOPort listeners fire with the whole port byte (value, oldValue).
      // We diff bit-by-bit and translate each changed bit to an Arduino pin number.
      const notify = (port: 'B' | 'C' | 'D') => (value: number, oldValue: number) => {
        const changed = value ^ oldValue;
        for (let bit = 0; bit < 8; bit++) {
          if (!((changed >> bit) & 1)) continue;
          let pin: ArduinoPin | null = null;
          if (port === 'D' && bit <= 7) pin = bit as ArduinoPin;
          if (port === 'B' && bit <= 5) pin = (bit + 8) as ArduinoPin;
          if (port === 'C' && bit <= 5) pin = (bit + 14) as ArduinoPin;
          if (pin !== null) callbacks.onPinChange!(pin, !!((value >> bit) & 1));
        }
      };
      this.portB.addListener(notify('B'));
      this.portC.addListener(notify('C'));
      this.portD.addListener(notify('D'));
    }

    if (callbacks.onSerialByte) {
      this.usart.onByteTransmit = (byte: number) => callbacks.onSerialByte!(byte);
    }
  }

  /** Run the CPU for approximately `ms` milliseconds of simulated time. */
  runFor(ms: number) {
    const targetCycles = this.cpu.cycles + ms * this.cyclesPerMs;
    while (!this.stopped && this.cpu.cycles < targetCycles) {
      avrInstruction(this.cpu);
      this.cpu.tick();
    }
  }

  /** Set the input level the CPU will read via digitalRead() on this pin. */
  setInputPin(pin: ArduinoPin, isHigh: boolean) {
    const { port, bit } = pinToPortBit(pin);
    const target = port === 'B' ? this.portB : port === 'C' ? this.portC : this.portD;
    target.setPin(bit, isHigh);
  }

  /** Drive the loop continuously using requestAnimationFrame-style batching. */
  start(onStopped?: () => void) {
    this.stopped = false;
    const step = () => {
      if (this.stopped) {
        onStopped?.();
        return;
      }
      this.runFor(16); // ~one animation frame worth of simulated time per tick
      if (!this.stopped) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }

  stop() {
    this.stopped = true;
  }
}

export { pinToPortBit };
