// Hardened Production AVR Compile Server
// Features: execFile isolation, rate limiting, payload capping, security headers, CORS origin validation, error path sanitization

import express from 'express';
import cors from 'cors';
import { execFile as execFileCb } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const execFile = promisify(execFileCb);
const app = express();

// Security Response Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// CORS Configuration
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGIN === '*' || ALLOWED_ORIGIN.split(',').includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS Policy Restriction: Unauthorized Origin'));
    }
  },
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

// Strict JSON Payload Limit (100KB max for code source strings)
app.use(express.json({ limit: '100kb' }));

// In-Memory IP Rate Limiter (Max 30 compilation requests per minute per IP)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 30;

function rateLimitMiddleware(req, res, next) {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = rateLimitMap.get(clientIp) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + RATE_LIMIT_WINDOW_MS;
  } else {
    record.count += 1;
  }

  rateLimitMap.set(clientIp, record);

  // Set standard RateLimit Headers
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT_MAX_REQUESTS - record.count));
  res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetAt / 1000));

  if (record.count > RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Too many compilation requests. Please wait a minute before trying again.',
    });
  }

  next();
}

// Cleanup rate limit map every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

const ARDUINO_PREAMBLE = `
#include <avr/io.h>
#include <avr/interrupt.h>
#include <util/delay.h>
#define F_CPU 16000000UL

// ---- Minimal Arduino-compatible shim ----
typedef unsigned char byte;
#define HIGH 1
#define LOW 0
#define INPUT 0
#define OUTPUT 1
#define INPUT_PULLUP 2

static inline void pinModeShim(uint8_t pin, uint8_t mode) {
  volatile uint8_t *ddr, *port;
  uint8_t bit;
  if (pin <= 7)      { ddr = &DDRD; port = &PORTD; bit = pin; }
  else if (pin <= 13){ ddr = &DDRB; port = &PORTB; bit = pin - 8; }
  else               { ddr = &DDRC; port = &PORTC; bit = pin - 14; }
  if (mode == OUTPUT) *ddr |= (1 << bit);
  else { *ddr &= ~(1 << bit); if (mode == INPUT_PULLUP) *port |= (1 << bit); }
}
static inline void digitalWriteShim(uint8_t pin, uint8_t val) {
  volatile uint8_t *port; uint8_t bit;
  if (pin <= 7)      { port = &PORTD; bit = pin; }
  else if (pin <= 13){ port = &PORTB; bit = pin - 8; }
  else               { port = &PORTC; bit = pin - 14; }
  if (val) *port |= (1 << bit); else *port &= ~(1 << bit);
}
static inline uint8_t digitalReadShim(uint8_t pin) {
  volatile uint8_t *pinr; uint8_t bit;
  if (pin <= 7)      { pinr = &PIND; bit = pin; }
  else if (pin <= 13){ pinr = &PINB; bit = pin - 8; }
  else               { pinr = &PINC; bit = pin - 14; }
  return (*pinr >> bit) & 1;
}
#define pinMode(p, m) pinModeShim(p, m)
#define digitalWrite(p, v) digitalWriteShim(p, v)
#define digitalRead(p) digitalReadShim(p)
#define delay(ms) _delay_ms(ms)

// ---- Minimal Serial shim ----
static inline void serialBegin(uint32_t baud) {
  uint16_t ubrr = (F_CPU / 16 / baud) - 1;
  UBRR0H = (uint8_t)(ubrr >> 8);
  UBRR0L = (uint8_t)ubrr;
  UCSR0B = (1 << TXEN0) | (1 << RXEN0);
  UCSR0C = (1 << UCSZ01) | (1 << UCSZ00);
}
static inline void serialWriteChar(char c) {
  while (!(UCSR0A & (1 << UDRE0))) {}
  UDR0 = c;
}
static inline void serialPrint(const char *s) { while (*s) serialWriteChar(*s++); }
static inline void serialPrintln(const char *s) { serialPrint(s); serialWriteChar('\\r'); serialWriteChar('\\n'); }
static inline void serialPrintInt(int value) {
  char buf[12]; int i = 0; int negative = value < 0;
  unsigned int v = negative ? -value : value;
  if (v == 0) buf[i++] = '0';
  while (v > 0) { buf[i++] = '0' + (v % 10); v /= 10; }
  if (negative) buf[i++] = '-';
  while (i > 0) serialWriteChar(buf[--i]);
}

struct SerialClassShim {
  void begin(uint32_t baud) { serialBegin(baud); }
  void print(const char *s) { serialPrint(s); }
  void print(int v) { serialPrintInt(v); }
  void println(const char *s) { serialPrintln(s); }
  void println(int v) { serialPrintInt(v); serialWriteChar('\\r'); serialWriteChar('\\n'); }
};
static struct SerialClassShim Serial;

void setup();
void loop();
`;

const ARDUINO_MAIN = `
int main(void) {
  setup();
  while (1) { loop(); }
}
`;

// In-Memory Concurrency Limiter (Max 2 simultaneous compilation tasks per IP)
const activeCompilesMap = new Map();
const MAX_CONCURRENT_COMPILATIONS_PER_IP = 2;

function concurrencyGuardMiddleware(req, res, next) {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const activeCount = activeCompilesMap.get(clientIp) || 0;

  if (activeCount >= MAX_CONCURRENT_COMPILATIONS_PER_IP) {
    return res.status(429).json({
      error: 'Concurrency Limit Exceeded: Only 2 simultaneous compilation tasks allowed per client IP.',
    });
  }

  activeCompilesMap.set(clientIp, activeCount + 1);

  const cleanup = () => {
    const current = activeCompilesMap.get(clientIp) || 1;
    if (current <= 1) {
      activeCompilesMap.delete(clientIp);
    } else {
      activeCompilesMap.set(clientIp, current - 1);
    }
  };

  res.on('finish', cleanup);
  res.on('close', cleanup);
  next();
}

// C++ Code Sanitizer: Prevent malicious relative file inclusion attempts
function sanitizeSource(code) {
  // Strip relative directory traversals from include directives (#include "../../something")
  return code.replace(/#include\s+["<]\s*\.\.[\/\\]/g, '// Blocked illegal include: ');
}

app.post('/compile', rateLimitMiddleware, concurrencyGuardMiddleware, async (req, res) => {
  const { source } = req.body || {};
  if (typeof source !== 'string' || !source.trim()) {
    return res.status(400).json({ error: 'Missing "source" C++ code string in request body' });
  }

  if (source.length > 131072) { // 128 KB
    return res.status(400).json({ error: 'Source code exceeds maximum allowed size limit (128 KB)' });
  }

  const sanitizedSource = sanitizeSource(source);
  const dir = await mkdtemp(path.join(tmpdir(), 'avrsim-'));
  const cFile = path.join(dir, 'sketch.cpp');
  const elfFile = path.join(dir, 'sketch.elf');
  const hexFile = path.join(dir, 'sketch.hex');

  try {
    const fullSource = `${ARDUINO_PREAMBLE}\n${sanitizedSource}\n${ARDUINO_MAIN}\n`;
    await writeFile(cFile, fullSource);

    // ExecFile with strict 10s timeout & 512KB max output buffer
    await execFile(
      'avr-g++',
      ['-mmcu=atmega328p', '-DF_CPU=16000000UL', '-Os', '-fno-exceptions', '-o', elfFile, cFile],
      { timeout: 10000, maxBuffer: 512 * 1024 }
    );
    await execFile(
      'avr-objcopy',
      ['-O', 'ihex', '-R', '.eeprom', elfFile, hexFile],
      { timeout: 10000, maxBuffer: 512 * 1024 }
    );

    const hex = await readFile(hexFile, 'utf8');
    res.json({ hex });
  } catch (err) {
    let rawMsg = err.stderr || err.message || String(err);
    // Sanitize internal server directory paths from user-facing error response
    const cleanMsg = rawMsg.replace(new RegExp(dir.replace(/\\/g, '\\\\'), 'g'), 'sketch.cpp');
    res.status(400).json({ error: cleanMsg });
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`VoltFlow AVR compile server listening on http://localhost:${PORT}`);
});
