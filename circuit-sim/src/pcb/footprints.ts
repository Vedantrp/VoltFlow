/**
 * src/pcb/footprints.ts
 *
 * Real Physical Footprint Geometry Library (IPC-7351 Standard Dimensions in Millimetres)
 * Strictly decoupled from visual UI models and canvas pixels.
 *
 * Rules:
 * 1. All dimensions and coordinates are in physical millimetres (mm).
 * 2. THT pads MUST specify type: 'tht' and drill: <diameter_mm> > 0.
 * 3. SMD pads MUST specify type: 'smd' and drill: undefined.
 * 4. NEVER silently fall back to RES-AXIAL-0.3 for unmapped components.
 */

import type { Footprint, FootprintPad } from './types';
import { FootprintError } from './types';

// Standard 2.54mm (0.1") grid unit
const PITCH_254 = 2.54;

/**
 * Verified IPC-7351 / Manufacturer Physical Footprint Library
 */
export const FOOTPRINT_LIBRARY: Record<string, Footprint> = {
  // ── 1. Resistor — 1/4W Through-Hole Axial (0.3" / 7.62mm pitch) ────────────
  'RES-AXIAL-0.3': {
    id: 'RES-AXIAL-0.3',
    name: 'Resistor 1/4W Axial (0.3" / 7.62mm)',
    description: 'Through-hole 1/4W carbon/metal film resistor, 7.62mm lead spacing',
    widthMm: 10.0,
    heightMm: 3.5,
    origin: { x: 5.0, y: 1.75 },
    pads: [
      { number: '1', name: '1', type: 'tht', x: -3.81, y: 0, width: 1.7, height: 1.7, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '2', name: '2', type: 'tht', x: 3.81, y: 0, width: 1.7, height: 1.7, shape: 'circle', drill: 0.8, layers: ['All'] },
    ],
    silkscreenLines: [
      { x1: -3.0, y1: -1.4, x2: 3.0, y2: -1.4, widthMm: 0.15 },
      { x1: 3.0, y1: -1.4, x2: 3.0, y2: 1.4, widthMm: 0.15 },
      { x1: 3.0, y1: 1.4, x2: -3.0, y2: 1.4, widthMm: 0.15 },
      { x1: -3.0, y1: 1.4, x2: -3.0, y2: -1.4, widthMm: 0.15 },
    ],
  },

  // ── 2. Capacitor — Radial Ceramic / Film (2.54mm pitch) ───────────────────
  'CAP-RAD-2.54': {
    id: 'CAP-RAD-2.54',
    name: 'Capacitor Radial 2.54mm',
    description: 'Ceramic disc or multilayer capacitor, 2.54mm lead spacing',
    widthMm: 6.0,
    heightMm: 3.0,
    origin: { x: 3.0, y: 1.5 },
    pads: [
      { number: '1', name: '1', type: 'tht', x: -1.27, y: 0, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '2', name: '2', type: 'tht', x: 1.27, y: 0, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
    ],
    silkscreenLines: [
      { x1: -2.5, y1: -1.2, x2: 2.5, y2: -1.2, widthMm: 0.15 },
      { x1: 2.5, y1: 1.2, x2: -2.5, y2: 1.2, widthMm: 0.15 },
    ],
  },

  // ── 2b. Capacitor — Polarized Radial Electrolytic (2.54mm pitch) ───────────
  'CAP-ELECTROLYTIC-RADIAL': {
    id: 'CAP-ELECTROLYTIC-RADIAL',
    name: 'Electrolytic Capacitor Radial (6.3mm dia)',
    description: 'Polarized radial electrolytic capacitor, 2.54mm lead pitch with square anode pad',
    widthMm: 7.0,
    heightMm: 7.0,
    origin: { x: 3.5, y: 3.5 },
    pads: [
      { number: '+', name: 'Anode (+)', type: 'tht', x: -1.27, y: 0, width: 1.8, height: 1.8, shape: 'rect', drill: 0.8, layers: ['All'] },
      { number: '-', name: 'Cathode (-)', type: 'tht', x: 1.27, y: 0, width: 1.8, height: 1.8, shape: 'circle', drill: 0.8, layers: ['All'] },
    ],
    silkscreenLines: [
      { x1: -3.0, y1: -3.0, x2: 3.0, y2: -3.0, widthMm: 0.15 },
      { x1: 3.0, y1: -3.0, x2: 3.0, y2: 3.0, widthMm: 0.15 },
      { x1: 3.0, y1: 3.0, x2: -3.0, y2: 3.0, widthMm: 0.15 },
      { x1: -3.0, y1: 3.0, x2: -3.0, y2: -3.0, widthMm: 0.15 },
    ],
  },

  // ── 3. LED — 5mm Through-Hole (2.54mm pitch) ──────────────────────────────
  'LED-5MM': {
    id: 'LED-5MM',
    name: 'LED 5mm Radial',
    description: '5mm through-hole LED, 2.54mm pitch, square cathode pad 1',
    widthMm: 6.0,
    heightMm: 6.0,
    origin: { x: 3.0, y: 3.0 },
    pads: [
      { number: 'A', name: 'Anode (+)', type: 'tht', x: -1.27, y: 0, width: 1.7, height: 1.7, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: 'C', name: 'Cathode (-)', type: 'tht', x: 1.27, y: 0, width: 1.7, height: 1.7, shape: 'rect', drill: 0.8, layers: ['All'] },
    ],
    silkscreenLines: [
      { x1: -2.6, y1: -2.6, x2: 2.6, y2: -2.6, widthMm: 0.15 },
      { x1: 2.6, y1: -2.6, x2: 2.6, y2: 2.6, widthMm: 0.15 },
      { x1: 2.6, y1: 2.6, x2: -2.6, y2: 2.6, widthMm: 0.15 },
      { x1: -2.6, y1: 2.6, x2: -2.6, y2: -2.6, widthMm: 0.15 },
    ],
  },

  // ── 3b. LED RGB — 4-Pin Radial (2.54mm pitch) ─────────────────────────────
  'LED-RGB-4PIN': {
    id: 'LED-RGB-4PIN',
    name: 'RGB LED 4-Pin Radial',
    description: '5mm RGB LED (Common Cathode/Anode), 4 inline pins at 2.54mm pitch',
    widthMm: 11.0,
    heightMm: 6.0,
    origin: { x: 5.5, y: 3.0 },
    pads: [
      { number: 'R', name: 'Red', type: 'tht', x: -3.81, y: 0, width: 1.7, height: 1.7, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: 'COM', name: 'Common', type: 'tht', x: -1.27, y: 0, width: 1.7, height: 1.7, shape: 'rect', drill: 0.8, layers: ['All'] },
      { number: 'G', name: 'Green', type: 'tht', x: 1.27, y: 0, width: 1.7, height: 1.7, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: 'B', name: 'Blue', type: 'tht', x: 3.81, y: 0, width: 1.7, height: 1.7, shape: 'circle', drill: 0.8, layers: ['All'] },
    ],
  },

  // ── 4. Tactile Pushbutton — 6x6mm (4-pin, 6.5mm x 4.5mm) ──────────────────
  'SW-PB-6MM': {
    id: 'SW-PB-6MM',
    name: 'Pushbutton 6x6mm Tactile',
    description: '4-pin SPST tactile push switch, 6.5mm x 4.5mm pin spacing',
    widthMm: 7.5,
    heightMm: 7.5,
    origin: { x: 3.75, y: 3.75 },
    pads: [
      { number: '1a', name: '1a', type: 'tht', x: -3.25, y: -2.25, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: '1b', name: '1b', type: 'tht', x: 3.25, y: -2.25, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: '2a', name: '2a', type: 'tht', x: -3.25, y: 2.25, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: '2b', name: '2b', type: 'tht', x: 3.25, y: 2.25, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
    ],
    silkscreenLines: [
      { x1: -3.0, y1: -3.0, x2: 3.0, y2: -3.0, widthMm: 0.15 },
      { x1: 3.0, y1: -3.0, x2: 3.0, y2: 3.0, widthMm: 0.15 },
      { x1: 3.0, y1: 3.0, x2: -3.0, y2: 3.0, widthMm: 0.15 },
      { x1: -3.0, y1: 3.0, x2: -3.0, y2: -3.0, widthMm: 0.15 },
    ],
  },

  // ── 5. Potentiometer — 3-pin Inline 2.54mm ────────────────────────────────
  'POT-3PIN': {
    id: 'POT-3PIN',
    name: 'Potentiometer 3-Pin Inline',
    description: 'Rotary potentiometer with 3 inline pins at 2.54mm pitch',
    widthMm: 12.0,
    heightMm: 10.0,
    origin: { x: 6.0, y: 5.0 },
    pads: [
      { number: '1', name: 'GND', type: 'tht', x: -PITCH_254, y: 0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: '2', name: 'SIG', type: 'tht', x: 0, y: 0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: '3', name: 'VCC', type: 'tht', x: PITCH_254, y: 0, width: 1.8, height: 1.8, shape: 'rect', drill: 1.0, layers: ['All'] },
    ],
  },

  // ── 6. SG90 Micro Servo — 3-pin Header (GND, VCC, PWM) ────────────────────
  'MODULE-SG90': {
    id: 'MODULE-SG90',
    name: 'SG90 Micro Servo Header (3P)',
    description: '3-pin 0.1" (2.54mm) header for SG90 servo (GND, VCC, Signal)',
    widthMm: 8.5,
    heightMm: 4.0,
    origin: { x: 4.25, y: 2.0 },
    pads: [
      { number: 'GND', name: 'GND', type: 'tht', x: -PITCH_254, y: 0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'VCC', name: 'VCC', type: 'tht', x: 0, y: 0, width: 1.8, height: 1.8, shape: 'rect', drill: 1.0, layers: ['All'] },
      { number: 'PWM', name: 'PWM', type: 'tht', x: PITCH_254, y: 0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
    ],
  },

  // ── 6b. NEMA 17 Stepper Motor — 4-pin Header (A+, A-, B+, B-) ──────────────
  'STEPPER-MOTOR-NEMA17': {
    id: 'STEPPER-MOTOR-NEMA17',
    name: 'NEMA 17 Stepper Motor 4-Pin Header',
    description: '4-pin 0.1" (2.54mm) pitch header for NEMA 17 Bipolar Stepper Motor',
    widthMm: 42.0,
    heightMm: 42.0,
    origin: { x: 21.0, y: 21.0 },
    pads: [
      { number: 'A+', name: 'A+', type: 'tht', x: -3.81, y: 15.0, width: 1.8, height: 1.8, shape: 'rect', drill: 1.0, layers: ['All'] },
      { number: 'A-', name: 'A-', type: 'tht', x: -1.27, y: 15.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'B+', name: 'B+', type: 'tht', x: 1.27, y: 15.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'B-', name: 'B-', type: 'tht', x: 3.81, y: 15.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
    ],
  },

  // ── 7. HC-SR04 Ultrasonic Sensor — 4-pin Header ───────────────────────────
  'MODULE-HCSR04': {
    id: 'MODULE-HCSR04',
    name: 'HC-SR04 Ultrasonic Sensor (4P)',
    description: '4-pin 0.1" (2.54mm) header for ultrasonic distance sensor (VCC, TRIG, ECHO, GND)',
    widthMm: 45.0,
    heightMm: 20.0,
    origin: { x: 22.5, y: 10.0 },
    pads: [
      { number: 'VCC', name: 'VCC', type: 'tht', x: -3.81, y: -7.0, width: 1.8, height: 1.8, shape: 'rect', drill: 1.0, layers: ['All'] },
      { number: 'TRIG', name: 'TRIG', type: 'tht', x: -1.27, y: -7.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'ECHO', name: 'ECHO', type: 'tht', x: 1.27, y: -7.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'GND', name: 'GND', type: 'tht', x: 3.81, y: -7.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
    ],
  },

  // ── 7b. DIP-8 IC Package (0.3" / 7.62mm Row Spacing) ──────────────────────
  'DIP8-300': {
    id: 'DIP8-300',
    name: 'DIP-8 IC Package (0.3" / 7.62mm Row Spacing)',
    description: 'Standard 8-pin Dual In-line Package IC (NE555 / LM741 / LM358)',
    widthMm: 10.16,
    heightMm: 9.6,
    origin: { x: 5.08, y: 4.8 },
    pads: [
      { number: '1', name: '1', type: 'tht', x: -3.81, y: 3.81, width: 1.6, height: 1.6, shape: 'rect', drill: 0.8, layers: ['All'] },
      { number: '2', name: '2', type: 'tht', x: -1.27, y: 3.81, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '3', name: '3', type: 'tht', x: 1.27, y: 3.81, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '4', name: '4', type: 'tht', x: 3.81, y: 3.81, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '5', name: '5', type: 'tht', x: 3.81, y: -3.81, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '6', name: '6', type: 'tht', x: 1.27, y: -3.81, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '7', name: '7', type: 'tht', x: -1.27, y: -3.81, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '8', name: '8', type: 'tht', x: -3.81, y: -3.81, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
    ],
  },

  // ── 8. DHT11 / DHT22 Sensor — 4-Pin / 3-Pin Header ────────────────────────
  'MODULE-DHT11': {
    id: 'MODULE-DHT11',
    name: 'DHT11 Temp & Humidity Sensor (4P)',
    description: '4-pin 0.1" (2.54mm) header for DHT11 sensor (VCC, DATA, NC, GND)',
    widthMm: 15.5,
    heightMm: 12.0,
    origin: { x: 7.75, y: 6.0 },
    pads: [
      { number: 'VCC', name: 'VCC', type: 'tht', x: -3.81, y: -4.0, width: 1.8, height: 1.8, shape: 'rect', drill: 1.0, layers: ['All'] },
      { number: 'DATA', name: 'DATA', type: 'tht', x: -1.27, y: -4.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'NC', name: 'NC', type: 'tht', x: 1.27, y: -4.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'GND', name: 'GND', type: 'tht', x: 3.81, y: -4.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
    ],
  },

  // ── 9. HC-05 Bluetooth Module — Dedicated 6-Pin Breakout Footprint ────────
  'MODULE-HC05': {
    id: 'MODULE-HC05',
    name: 'HC-05 Bluetooth 2.0 Module (6P)',
    description: '6-pin 0.1" (2.54mm) right-angle breakout header: STATE, RXD, TXD, GND, VCC, EN',
    widthMm: 37.5,
    heightMm: 16.5,
    origin: { x: 18.75, y: 8.25 },
    pads: [
      { number: 'STATE', name: 'STATE', type: 'tht', x: -16.0, y: 6.35, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'RXD', name: 'RXD', type: 'tht', x: -16.0, y: 3.81, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'TXD', name: 'TXD', type: 'tht', x: -16.0, y: 1.27, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'GND', name: 'GND', type: 'tht', x: -16.0, y: -1.27, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'VCC', name: 'VCC', type: 'tht', x: -16.0, y: -3.81, width: 1.8, height: 1.8, shape: 'rect', drill: 1.0, layers: ['All'] },
      { number: 'EN', name: 'EN (KEY)', type: 'tht', x: -16.0, y: -6.35, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
    ],
    silkscreenLines: [
      { x1: -18.0, y1: -8.0, x2: 18.0, y2: -8.0, widthMm: 0.15 },
      { x1: 18.0, y1: -8.0, x2: 18.0, y2: 8.0, widthMm: 0.15 },
      { x1: 18.0, y1: 8.0, x2: -18.0, y2: 8.0, widthMm: 0.15 },
      { x1: -18.0, y1: 8.0, x2: -18.0, y2: -8.0, widthMm: 0.15 },
    ],
  },

  // ── 10. ESP-01S Wi-Fi Module — Dedicated 2x4 Header (2.54mm pitch) ────────
  'MODULE-ESP01': {
    id: 'MODULE-ESP01',
    name: 'ESP-01 / ESP-01S Header (2x4)',
    description: '2x4 0.1" (2.54mm) male header block for ESP-01S Wi-Fi module',
    widthMm: 24.8,
    heightMm: 14.4,
    origin: { x: 12.4, y: 7.2 },
    pads: [
      { number: 'TX', name: 'TX', type: 'tht', x: -6.0, y: 3.81, width: 1.7, height: 1.7, shape: 'circle', drill: 0.9, layers: ['All'] },
      { number: 'CH_PD', name: 'CH_PD', type: 'tht', x: -6.0, y: 1.27, width: 1.7, height: 1.7, shape: 'circle', drill: 0.9, layers: ['All'] },
      { number: 'RST', name: 'RST', type: 'tht', x: -6.0, y: -1.27, width: 1.7, height: 1.7, shape: 'circle', drill: 0.9, layers: ['All'] },
      { number: 'VCC', name: 'VCC', type: 'tht', x: -6.0, y: -3.81, width: 1.7, height: 1.7, shape: 'rect', drill: 0.9, layers: ['All'] },
      { number: 'GND', name: 'GND', type: 'tht', x: -8.54, y: -3.81, width: 1.7, height: 1.7, shape: 'circle', drill: 0.9, layers: ['All'] },
      { number: 'GPIO2', name: 'GPIO2', type: 'tht', x: -8.54, y: -1.27, width: 1.7, height: 1.7, shape: 'circle', drill: 0.9, layers: ['All'] },
      { number: 'GPIO0', name: 'GPIO0', type: 'tht', x: -8.54, y: 1.27, width: 1.7, height: 1.7, shape: 'circle', drill: 0.9, layers: ['All'] },
      { number: 'RX', name: 'RX', type: 'tht', x: -8.54, y: 3.81, width: 1.7, height: 1.7, shape: 'circle', drill: 0.9, layers: ['All'] },
    ],
  },

  // ── 11. MPU6050 Accelerometer / Gyroscope Module (8P 2.54mm Header) ───────
  'MODULE-MPU6050': {
    id: 'MODULE-MPU6050',
    name: 'MPU6050 6-DOF IMU Module (8P)',
    description: '8-pin 0.1" (2.54mm) header: VCC, GND, SCL, SDA, XDA, XCL, AD0, INT',
    widthMm: 21.0,
    heightMm: 16.0,
    origin: { x: 10.5, y: 8.0 },
    pads: [
      { number: 'VCC', name: 'VCC', type: 'tht', x: -8.89, y: -6.0, width: 1.8, height: 1.8, shape: 'rect', drill: 1.0, layers: ['All'] },
      { number: 'GND', name: 'GND', type: 'tht', x: -6.35, y: -6.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'SCL', name: 'SCL', type: 'tht', x: -3.81, y: -6.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'SDA', name: 'SDA', type: 'tht', x: -1.27, y: -6.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'XDA', name: 'XDA', type: 'tht', x: 1.27, y: -6.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'XCL', name: 'XCL', type: 'tht', x: 3.81, y: -6.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'AD0', name: 'AD0', type: 'tht', x: 6.35, y: -6.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'INT', name: 'INT', type: 'tht', x: 8.89, y: -6.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
    ],
  },

  // ── 12. PIR Motion Sensor — 3-Pin Header (GND, VCC, OUT) ─────────────────
  'MODULE-PIR': {
    id: 'MODULE-PIR',
    name: 'HC-SR501 PIR Motion Sensor (3P)',
    description: '3-pin 0.1" (2.54mm) header: GND, VCC, OUT',
    widthMm: 32.0,
    heightMm: 24.0,
    origin: { x: 16.0, y: 12.0 },
    pads: [
      { number: 'GND', name: 'GND', type: 'tht', x: -PITCH_254, y: -9.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'VCC', name: 'VCC', type: 'tht', x: 0, y: -9.0, width: 1.8, height: 1.8, shape: 'rect', drill: 1.0, layers: ['All'] },
      { number: 'OUT', name: 'OUT', type: 'tht', x: PITCH_254, y: -9.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
    ],
  },

  // ── 13. ESP32 DevKit V1 — 30-Pin DIP Module (22.86mm / 0.9" row spacing) ──
  'MODULE-ESP32-DEVKIT': {
    id: 'MODULE-ESP32-DEVKIT',
    name: 'ESP32 DevKit V1 (30P)',
    description: '30-pin dual-row footprint for ESP32 DevKit V1 (2.54mm pitch, 22.86mm row width)',
    widthMm: 28.0,
    heightMm: 52.0,
    origin: { x: 14.0, y: 26.0 },
    pads: (() => {
      const pads: FootprintPad[] = [];
      const leftPins = ['EN', 'VP', 'VN', 'D34', 'D35', 'D32', 'D33', 'D25', 'D26', 'D27', 'D14', 'D12', 'D13', 'GND1', 'VIN'];
      const rightPins = ['D23', 'D22', 'TX0', 'RX0', 'D21', 'D19', 'D18', 'D5', 'TX2', 'RX2', 'D4', 'D2', 'D15', 'GND2', '3V3'];
      const rowX = 11.43; // 22.86 / 2
      const startY = 17.78; // (14 * 2.54) / 2

      leftPins.forEach((pinName, i) => {
        pads.push({
          number: pinName,
          name: pinName,
          type: 'tht',
          x: -rowX,
          y: startY - (i * PITCH_254),
          width: 1.8,
          height: 1.8,
          shape: i === 0 ? 'rect' : 'circle',
          drill: 1.0,
          layers: ['All'],
        });
      });

      rightPins.forEach((pinName, i) => {
        pads.push({
          number: pinName,
          name: pinName,
          type: 'tht',
          x: rowX,
          y: startY - (i * PITCH_254),
          width: 1.8,
          height: 1.8,
          shape: 'circle',
          drill: 1.0,
          layers: ['All'],
        });
      });

      return pads;
    })(),
  },

  // ── 14. NodeMCU ESP8266 — 30-Pin DIP Module (25.4mm / 1.0" row spacing) ────
  'MODULE-NODEMCU': {
    id: 'MODULE-NODEMCU',
    name: 'NodeMCU ESP8266 V2 (30P)',
    description: '30-pin dual-row footprint for NodeMCU ESP8266 V2 (2.54mm pitch, 25.4mm row spacing)',
    widthMm: 31.0,
    heightMm: 54.0,
    origin: { x: 15.5, y: 27.0 },
    pads: (() => {
      const pads: FootprintPad[] = [];
      const leftPins = ['A0', 'RSV1', 'RSV2', 'SD3', 'SD2', 'SD1', 'CMD', 'SD0', 'CLK', 'GND1', '3V3_1', 'EN', 'RST', 'GND2', 'VIN'];
      const rightPins = ['D0', 'D1', 'D2', 'D3', 'D4', '3V3_2', 'GND3', 'D5', 'D6', 'D7', 'D8', 'RX', 'TX', 'GND4', '3V3_3'];
      const rowX = 12.7; // 25.4 / 2
      const startY = 17.78;

      leftPins.forEach((pinName, i) => {
        pads.push({
          number: pinName,
          name: pinName,
          type: 'tht',
          x: -rowX,
          y: startY - (i * PITCH_254),
          width: 1.8,
          height: 1.8,
          shape: i === 0 ? 'rect' : 'circle',
          drill: 1.0,
          layers: ['All'],
        });
      });

      rightPins.forEach((pinName, i) => {
        pads.push({
          number: pinName,
          name: pinName,
          type: 'tht',
          x: rowX,
          y: startY - (i * PITCH_254),
          width: 1.8,
          height: 1.8,
          shape: 'circle',
          drill: 1.0,
          layers: ['All'],
        });
      });

      return pads;
    })(),
  },

  // ── 15. Arduino Uno R3 — Shield Header Footprint (68.6 × 53.3 mm) ──────────
  'MODULE-ARDUINO-UNO': {
    id: 'MODULE-ARDUINO-UNO',
    name: 'Arduino Uno R3 Shield Headers',
    description: 'Standard 4-block header footprint matching Arduino Uno shield specification',
    widthMm: 68.6,
    heightMm: 53.3,
    origin: { x: 34.3, y: 26.65 },
    pads: (() => {
      const pads: FootprintPad[] = [];
      const topY = 22.0;
      const d0d7 = ['0', '1', '2', '3', '4', '5', '6', '7'];
      d0d7.forEach((pin, i) => {
        pads.push({ number: pin, name: `D${pin}`, type: 'tht', x: 18.0 - (i * PITCH_254), y: topY, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] });
      });

      const d8d13 = ['8', '9', '10', '11', '12', '13', 'GND3', 'AREF', 'SDA', 'SCL'];
      d8d13.forEach((pin, i) => {
        pads.push({ number: pin, name: pin, type: 'tht', x: -3.5 - (i * PITCH_254), y: topY, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] });
      });

      const botY = -22.0;
      const power = ['NC', 'IOREF', 'RESET', '3V3', '5V', 'GND1', 'GND2', 'VIN'];
      power.forEach((pin, i) => {
        pads.push({ number: pin, name: pin, type: 'tht', x: -16.0 + (i * PITCH_254), y: botY, width: 1.8, height: 1.8, shape: pin === '5V' ? 'rect' : 'circle', drill: 1.0, layers: ['All'] });
      });

      const analog = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'];
      analog.forEach((pin, i) => {
        pads.push({ number: pin, name: pin, type: 'tht', x: 8.0 + (i * PITCH_254), y: botY, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] });
      });

      return pads;
    })(),
  },

  // ── 16. Arduino Nano R3 — 30-Pin DIP Footprint (15.24mm / 0.6" row width) ──
  'MODULE-ARDUINO-NANO': {
    id: 'MODULE-ARDUINO-NANO',
    name: 'Arduino Nano R3 (30P)',
    description: '30-pin DIP breadboard-compatible footprint (2.54mm pitch, 15.24mm row spacing)',
    widthMm: 18.0,
    heightMm: 45.0,
    origin: { x: 9.0, y: 22.5 },
    pads: (() => {
      const pads: FootprintPad[] = [];
      const leftPins = ['D13', '3V3', 'AREF', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', '5V', 'RESET', 'GND1', 'VIN'];
      const rightPins = ['D12', 'D11', 'D10', 'D9', 'D8', 'D7', 'D6', 'D5', 'D4', 'D3', 'D2', 'GND2', 'RST', 'RX0', 'TX1'];
      const rowX = 7.62; // 15.24 / 2
      const startY = 17.78;

      leftPins.forEach((pinName, i) => {
        pads.push({
          number: pinName,
          name: pinName,
          type: 'tht',
          x: -rowX,
          y: startY - (i * PITCH_254),
          width: 1.8,
          height: 1.8,
          shape: i === 0 ? 'rect' : 'circle',
          drill: 1.0,
          layers: ['All'],
        });
      });

      rightPins.forEach((pinName, i) => {
        pads.push({
          number: pinName,
          name: pinName,
          type: 'tht',
          x: rowX,
          y: startY - (i * PITCH_254),
          width: 1.8,
          height: 1.8,
          shape: 'circle',
          drill: 1.0,
          layers: ['All'],
        });
      });

      return pads;
    })(),
  },

  // ── 17. 5V Relay Module 1-Channel — 6-Pin Footprint ───────────────────────
  'MODULE-RELAY-1CH': {
    id: 'MODULE-RELAY-1CH',
    name: '5V Relay Module 1CH',
    description: 'Screw terminals (NO, COM, NC) + Logic headers (IN, GND, VCC)',
    widthMm: 45.0,
    heightMm: 28.0,
    origin: { x: 22.5, y: 14.0 },
    pads: [
      { number: 'IN', name: 'IN', type: 'tht', x: -18.0, y: 2.54, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'GND', name: 'GND', type: 'tht', x: -18.0, y: 0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'VCC', name: 'VCC', type: 'tht', x: -18.0, y: -2.54, width: 1.8, height: 1.8, shape: 'rect', drill: 1.0, layers: ['All'] },
      { number: 'NO', name: 'NO', type: 'tht', x: 18.0, y: 5.0, width: 2.5, height: 2.5, shape: 'circle', drill: 1.4, layers: ['All'] },
      { number: 'COM', name: 'COM', type: 'tht', x: 18.0, y: 0, width: 2.5, height: 2.5, shape: 'circle', drill: 1.4, layers: ['All'] },
      { number: 'NC', name: 'NC', type: 'tht', x: 18.0, y: -5.0, width: 2.5, height: 2.5, shape: 'circle', drill: 1.4, layers: ['All'] },
    ],
  },

  // ── 17b. 5V Relay Module 2-Channel — 10-Pin Footprint ──────────────────────
  'MODULE-RELAY-2CH': {
    id: 'MODULE-RELAY-2CH',
    name: '5V Dual Relay Module 2CH',
    description: 'Dual screw terminals (NO1, COM1, NC1, NO2, COM2, NC2) + 4-pin Logic header (VCC, IN1, IN2, GND)',
    widthMm: 50.0,
    heightMm: 38.0,
    origin: { x: 25.0, y: 19.0 },
    pads: [
      { number: 'NO1', name: 'NO1', type: 'tht', x: -18.0, y: 14.0, width: 2.5, height: 2.5, shape: 'circle', drill: 1.4, layers: ['All'] },
      { number: 'COM1', name: 'COM1', type: 'tht', x: -13.0, y: 14.0, width: 2.5, height: 2.5, shape: 'circle', drill: 1.4, layers: ['All'] },
      { number: 'NC1', name: 'NC1', type: 'tht', x: -8.0, y: 14.0, width: 2.5, height: 2.5, shape: 'circle', drill: 1.4, layers: ['All'] },
      { number: 'NO2', name: 'NO2', type: 'tht', x: 8.0, y: 14.0, width: 2.5, height: 2.5, shape: 'circle', drill: 1.4, layers: ['All'] },
      { number: 'COM2', name: 'COM2', type: 'tht', x: 13.0, y: 14.0, width: 2.5, height: 2.5, shape: 'circle', drill: 1.4, layers: ['All'] },
      { number: 'NC2', name: 'NC2', type: 'tht', x: 18.0, y: 14.0, width: 2.5, height: 2.5, shape: 'circle', drill: 1.4, layers: ['All'] },
      { number: 'VCC', name: 'VCC', type: 'tht', x: -3.81, y: -14.0, width: 1.8, height: 1.8, shape: 'rect', drill: 1.0, layers: ['All'] },
      { number: 'IN1', name: 'IN1', type: 'tht', x: -1.27, y: -14.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'IN2', name: 'IN2', type: 'tht', x: 1.27, y: -14.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'GND', name: 'GND', type: 'tht', x: 3.81, y: -14.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
    ],
  },

  // ── 18. Diode — DO-41 Standard Through-Hole (1N4007) ──────────────────────
  'DIODE-DO41': {
    id: 'DIODE-DO41',
    name: 'Diode DO-41 Axial (7.62mm)',
    description: 'Standard 1A DO-41 rectifier diode package (1N4001..1N4007)',
    widthMm: 9.5,
    heightMm: 3.5,
    origin: { x: 4.75, y: 1.75 },
    pads: [
      { number: 'A', name: 'Anode (+)', type: 'tht', x: -3.81, y: 0, width: 1.8, height: 1.8, shape: 'circle', drill: 0.9, layers: ['All'] },
      { number: 'C', name: 'Cathode (-)', type: 'tht', x: 3.81, y: 0, width: 1.8, height: 1.8, shape: 'rect', drill: 0.9, layers: ['All'] },
    ],
  },

  // ── 19. Zener Diode — DO-35 (7.62mm pitch) ────────────────────────────────
  'DIODE-DO35': {
    id: 'DIODE-DO35',
    name: 'Zener Diode DO-35 Axial',
    description: 'Glass package 500mW Zener diode, 7.62mm lead pitch',
    widthMm: 8.5,
    heightMm: 2.8,
    origin: { x: 4.25, y: 1.4 },
    pads: [
      { number: 'A', name: 'Anode (+)', type: 'tht', x: -3.81, y: 0, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: 'C', name: 'Cathode (-)', type: 'tht', x: 3.81, y: 0, width: 1.6, height: 1.6, shape: 'rect', drill: 0.8, layers: ['All'] },
    ],
  },

  // ── 20. Transistor / Temp Sensor — TO-92 (2.54mm inline / triangular) ──────
  'TO92-TRANSISTOR': {
    id: 'TO92-TRANSISTOR',
    name: 'Transistor TO-92 (2N2222 / BC547 / LM35)',
    description: '3-pin inline TO-92 discrete semiconductor package',
    widthMm: 5.5,
    heightMm: 4.5,
    origin: { x: 2.75, y: 2.25 },
    pads: [
      { number: 'C', name: 'Collector (1)', type: 'tht', x: -PITCH_254, y: 0, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: 'B', name: 'Base (2)', type: 'tht', x: 0, y: 0, width: 1.6, height: 1.6, shape: 'rect', drill: 0.8, layers: ['All'] },
      { number: 'E', name: 'Emitter (3)', type: 'tht', x: PITCH_254, y: 0, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
    ],
  },

  // ── 21. Inductor — Axial Molded (7.62mm pitch) ────────────────────────────
  'IND-AXIAL-0.3': {
    id: 'IND-AXIAL-0.3',
    name: 'Inductor Axial Molded 100µH',
    description: 'Color-coded axial molded wirewound inductor, 7.62mm pitch',
    widthMm: 10.0,
    heightMm: 4.0,
    origin: { x: 5.0, y: 2.0 },
    pads: [
      { number: '1', name: '1', type: 'tht', x: -3.81, y: 0, width: 1.8, height: 1.8, shape: 'circle', drill: 0.9, layers: ['All'] },
      { number: '2', name: '2', type: 'tht', x: 3.81, y: 0, width: 1.8, height: 1.8, shape: 'circle', drill: 0.9, layers: ['All'] },
    ],
  },

  // ── 22. Piezo Buzzer — Radial (7.62mm pitch) ──────────────────────────────
  'BUZZER-RADIAL': {
    id: 'BUZZER-RADIAL',
    name: 'Piezo Buzzer Radial 7.62mm',
    description: '12mm round piezo buzzer with 7.62mm lead spacing',
    widthMm: 12.0,
    heightMm: 12.0,
    origin: { x: 6.0, y: 6.0 },
    pads: [
      { number: '+', name: '+ (Positive)', type: 'tht', x: -3.81, y: 0, width: 1.8, height: 1.8, shape: 'rect', drill: 0.9, layers: ['All'] },
      { number: '-', name: '- (Negative)', type: 'tht', x: 3.81, y: 0, width: 1.8, height: 1.8, shape: 'circle', drill: 0.9, layers: ['All'] },
    ],
  },

  // ── 23. SPDT Slide Switch — 3-Pin (2.54mm pitch) ──────────────────────────
  'SWITCH-SPDT-SLIDE': {
    id: 'SWITCH-SPDT-SLIDE',
    name: 'Slide Switch SPDT 3-Pin',
    description: 'Single pole double throw slide switch with 2.54mm pin spacing',
    widthMm: 8.5,
    heightMm: 4.5,
    origin: { x: 4.25, y: 2.25 },
    pads: [
      { number: '1', name: '1', type: 'tht', x: -PITCH_254, y: 0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'COM', name: 'COM', type: 'tht', x: 0, y: 0, width: 1.8, height: 1.8, shape: 'rect', drill: 1.0, layers: ['All'] },
      { number: '2', name: '2', type: 'tht', x: PITCH_254, y: 0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
    ],
  },

  // ── 24. DIP Switches (4-pos & 6-pos, 2.54mm pitch, 7.62mm row width) ──────
  'DIP-SWITCH-4': {
    id: 'DIP-SWITCH-4',
    name: 'DIP Switch 4-Position (8P)',
    description: '4-switch DIP package (2.54mm pitch, 7.62mm row spacing)',
    widthMm: 10.5,
    heightMm: 9.5,
    origin: { x: 5.25, y: 4.75 },
    pads: [
      { number: '1A', name: '1A', type: 'tht', x: -3.81, y: 3.81, width: 1.6, height: 1.6, shape: 'rect', drill: 0.8, layers: ['All'] },
      { number: '2A', name: '2A', type: 'tht', x: -1.27, y: 3.81, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '3A', name: '3A', type: 'tht', x: 1.27, y: 3.81, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '4A', name: '4A', type: 'tht', x: 3.81, y: 3.81, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '1B', name: '1B', type: 'tht', x: -3.81, y: -3.81, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '2B', name: '2B', type: 'tht', x: -1.27, y: -3.81, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '3B', name: '3B', type: 'tht', x: 1.27, y: -3.81, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '4B', name: '4B', type: 'tht', x: 3.81, y: -3.81, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
    ],
  },

  'DIP-SWITCH-6': {
    id: 'DIP-SWITCH-6',
    name: 'DIP Switch 6-Position (12P)',
    description: '6-switch DIP package (2.54mm pitch, 7.62mm row spacing)',
    widthMm: 15.5,
    heightMm: 9.5,
    origin: { x: 7.75, y: 4.75 },
    pads: [
      { number: '1A', name: '1A', type: 'tht', x: -6.35, y: 3.81, width: 1.6, height: 1.6, shape: 'rect', drill: 0.8, layers: ['All'] },
      { number: '2A', name: '2A', type: 'tht', x: -3.81, y: 3.81, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '3A', name: '3A', type: 'tht', x: -1.27, y: 3.81, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '4A', name: '4A', type: 'tht', x: 1.27, y: 3.81, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '5A', name: '5A', type: 'tht', x: 3.81, y: 3.81, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '6A', name: '6A', type: 'tht', x: 6.35, y: 3.81, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '1B', name: '1B', type: 'tht', x: -6.35, y: -3.81, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '2B', name: '2B', type: 'tht', x: -3.81, y: -3.81, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '3B', name: '3B', type: 'tht', x: -1.27, y: -3.81, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '4B', name: '4B', type: 'tht', x: 1.27, y: -3.81, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '5B', name: '5B', type: 'tht', x: 3.81, y: -3.81, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '6B', name: '6B', type: 'tht', x: 6.35, y: -3.81, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
    ],
  },

  // ── 25. Power Supply / Battery Terminal Block (5.08mm pitch) ──────────────
  'MODULE-POWER-2PIN': {
    id: 'MODULE-POWER-2PIN',
    name: '2-Pin Terminal Block 5.08mm',
    description: 'Screw terminal block or 2-pin header for external battery / DC power supply',
    widthMm: 10.0,
    heightMm: 8.0,
    origin: { x: 5.0, y: 4.0 },
    pads: [
      { number: '+', name: '+ (VCC)', type: 'tht', x: -2.54, y: 0, width: 2.2, height: 2.2, shape: 'rect', drill: 1.3, layers: ['All'] },
      { number: '-', name: '- (GND)', type: 'tht', x: 2.54, y: 0, width: 2.2, height: 2.2, shape: 'circle', drill: 1.3, layers: ['All'] },
    ],
  },

  // ── 26. Breadboard Power Supply Module (MB102) ────────────────────────────
  'MODULE-MB102': {
    id: 'MODULE-MB102',
    name: 'MB102 Breadboard Power Supply',
    description: 'MB102 plug-in power module with 4 rail pins (5V/3.3V dual output)',
    widthMm: 35.0,
    heightMm: 22.0,
    origin: { x: 17.5, y: 11.0 },
    pads: [
      { number: 'VCC_TOP', name: 'VCC Top', type: 'tht', x: 12.0, y: 8.0, width: 2.0, height: 2.0, shape: 'rect', drill: 1.0, layers: ['All'] },
      { number: 'GND_TOP', name: 'GND Top', type: 'tht', x: 14.54, y: 8.0, width: 2.0, height: 2.0, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'VCC_BOT', name: 'VCC Bot', type: 'tht', x: 12.0, y: -8.0, width: 2.0, height: 2.0, shape: 'rect', drill: 1.0, layers: ['All'] },
      { number: 'GND_BOT', name: 'GND Bot', type: 'tht', x: 14.54, y: -8.0, width: 2.0, height: 2.0, shape: 'circle', drill: 1.0, layers: ['All'] },
    ],
  },

  // ── 27. LCD 16x2 Display — 16-Pin / 4-Pin I2C Header ──────────────────────
  'MODULE-LCD1602': {
    id: 'MODULE-LCD1602',
    name: 'LCD 1602 Display Header (16P / 4P I2C)',
    description: '16-pin inline 2.54mm pitch header for 16x2 parallel / I2C LCD character display',
    widthMm: 80.0,
    heightMm: 36.0,
    origin: { x: 40.0, y: 18.0 },
    pads: [
      { number: 'VSS', name: 'VSS', type: 'tht', x: -19.05, y: 15.0, width: 1.8, height: 1.8, shape: 'rect', drill: 1.0, layers: ['All'] },
      { number: 'VDD', name: 'VDD', type: 'tht', x: -16.51, y: 15.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'V0', name: 'V0', type: 'tht', x: -13.97, y: 15.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'RS', name: 'RS', type: 'tht', x: -11.43, y: 15.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'RW', name: 'RW', type: 'tht', x: -8.89, y: 15.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'E', name: 'E', type: 'tht', x: -6.35, y: 15.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'D0', name: 'D0', type: 'tht', x: -3.81, y: 15.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'D1', name: 'D1', type: 'tht', x: -1.27, y: 15.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'D2', name: 'D2', type: 'tht', x: 1.27, y: 15.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'D3', name: 'D3', type: 'tht', x: 3.81, y: 15.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'D4', name: 'D4', type: 'tht', x: 6.35, y: 15.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'D5', name: 'D5', type: 'tht', x: 8.89, y: 15.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'D6', name: 'D6', type: 'tht', x: 11.43, y: 15.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'D7', name: 'D7', type: 'tht', x: 13.97, y: 15.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'A', name: 'A', type: 'tht', x: 16.51, y: 15.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'K', name: 'K', type: 'tht', x: 19.05, y: 15.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      // I2C backpack 4 pins alternative
      { number: 'GND', name: 'GND', type: 'tht', x: -19.05, y: -15.0, width: 1.8, height: 1.8, shape: 'rect', drill: 1.0, layers: ['All'] },
      { number: 'VCC', name: 'VCC', type: 'tht', x: -16.51, y: -15.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'SDA', name: 'SDA', type: 'tht', x: -13.97, y: -15.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'SCL', name: 'SCL', type: 'tht', x: -11.43, y: -15.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
    ],
  },

  // ── 28. Soil Moisture Sensor (3P 2.54mm Header: VCC, GND, SIG) ───────────
  'MODULE-SOIL-MOISTURE': {
    id: 'MODULE-SOIL-MOISTURE',
    name: 'Soil Moisture Sensor (3P)',
    description: '3-pin 0.1" (2.54mm) header: VCC, GND, SIG',
    widthMm: 20.0,
    heightMm: 60.0,
    origin: { x: 10.0, y: 30.0 },
    pads: [
      { number: 'VCC', name: 'VCC', type: 'tht', x: -PITCH_254, y: 25.0, width: 1.8, height: 1.8, shape: 'rect', drill: 1.0, layers: ['All'] },
      { number: 'GND', name: 'GND', type: 'tht', x: 0, y: 25.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'SIG', name: 'SIG (AOUT)', type: 'tht', x: PITCH_254, y: 25.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
    ],
  },

  // ── 29. IR Obstacle Sensor (3P 2.54mm Header: VCC, GND, OUT) ──────────────
  'MODULE-IR-OBSTACLE': {
    id: 'MODULE-IR-OBSTACLE',
    name: 'IR Obstacle Sensor (3P)',
    description: '3-pin 0.1" (2.54mm) header: VCC, GND, OUT',
    widthMm: 32.0,
    heightMm: 14.0,
    origin: { x: 16.0, y: 7.0 },
    pads: [
      { number: 'VCC', name: 'VCC', type: 'tht', x: -PITCH_254, y: -4.5, width: 1.8, height: 1.8, shape: 'rect', drill: 1.0, layers: ['All'] },
      { number: 'GND', name: 'GND', type: 'tht', x: 0, y: -4.5, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'OUT', name: 'OUT', type: 'tht', x: PITCH_254, y: -4.5, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
    ],
  },

  // ── 30. Generic 2-Pin Sensor / Load Terminal (Flex, Force, Motor, Bulb) ────
  'SENSOR-2PIN': {
    id: 'SENSOR-2PIN',
    name: '2-Pin Sensor / Terminal Header',
    description: '2-pin 0.1" (2.54mm) header for 2-terminal sensors and loads',
    widthMm: 6.0,
    heightMm: 4.0,
    origin: { x: 3.0, y: 2.0 },
    pads: [
      { number: '1', name: '1', type: 'tht', x: -1.27, y: 0, width: 1.8, height: 1.8, shape: 'rect', drill: 1.0, layers: ['All'] },
      { number: '2', name: '2', type: 'tht', x: 1.27, y: 0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
    ],
  },

  // ── 31. Gas / Smoke Sensor (MQ-2) — 4-pin Header ──────────────────────────
  'MODULE-GAS': {
    id: 'MODULE-GAS',
    name: 'MQ-2 Gas Sensor',
    description: '4-pin 0.1" (2.54mm) header (VCC, GND, DOUT, AOUT)',
    widthMm: 32.0,
    heightMm: 20.0,
    origin: { x: 16.0, y: 10.0 },
    pads: [
      { number: 'VCC', name: 'VCC', type: 'tht', x: -3.81, y: -7.0, width: 1.8, height: 1.8, shape: 'rect', drill: 1.0, layers: ['All'] },
      { number: 'GND', name: 'GND', type: 'tht', x: -1.27, y: -7.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'DOUT', name: 'DOUT', type: 'tht', x: 1.27, y: -7.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'AOUT', name: 'AOUT', type: 'tht', x: 3.81, y: -7.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
    ],
  },

  // ── 31. OLED Display SSD1306 (4-Pin / 8-Pin I2C/SPI Module) ───────────────
  'MODULE-OLED-SSD1306': {
    id: 'MODULE-OLED-SSD1306',
    name: 'OLED SSD1306 Display 0.96" (I2C/SPI)',
    description: '0.96 inch 128x64 OLED display module with 4/8-pin 2.54mm header',
    widthMm: 27.3,
    heightMm: 27.8,
    origin: { x: 13.65, y: 13.9 },
    pads: [
      { number: 'GND', name: 'GND', type: 'tht', x: -3.81, y: -11.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'VCC', name: 'VCC', type: 'tht', x: -1.27, y: -11.0, width: 1.8, height: 1.8, shape: 'rect', drill: 1.0, layers: ['All'] },
      { number: 'SCL', name: 'SCL', type: 'tht', x: 1.27, y: -11.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'SDA', name: 'SDA', type: 'tht', x: 3.81, y: -11.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
    ],
  },

  // ── 32. Analog 2-Axis Joystick Module (5-Pin Header) ─────────────────────
  'MODULE-JOYSTICK': {
    id: 'MODULE-JOYSTICK',
    name: 'Dual-Axis Thumb Joystick Module (5P)',
    description: '5-pin 2.54mm header for XY potentiometer + tactile pushbutton',
    widthMm: 26.0,
    heightMm: 34.0,
    origin: { x: 13.0, y: 17.0 },
    pads: [
      { number: 'GND', name: 'GND', type: 'tht', x: -5.08, y: -14.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: '+5V', name: '+5V', type: 'tht', x: -2.54, y: -14.0, width: 1.8, height: 1.8, shape: 'rect', drill: 1.0, layers: ['All'] },
      { number: 'VRX', name: 'VRX', type: 'tht', x: 0, y: -14.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'VRY', name: 'VRY', type: 'tht', x: 2.54, y: -14.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'SW', name: 'SW', type: 'tht', x: 5.08, y: -14.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
    ],
  },

  // ── 33. LDR / Photoresistor (2-Pin Radial, 2.54mm) ─────────────────────────
  'SENSOR-LDR': {
    id: 'SENSOR-LDR',
    name: 'LDR Photoresistor (5mm Radial)',
    description: 'Cadmium-sulfide light dependent resistor, 2.54mm pitch',
    widthMm: 6.0,
    heightMm: 6.0,
    origin: { x: 3.0, y: 3.0 },
    pads: [
      { number: '1', name: '1', type: 'tht', x: -1.27, y: 0, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '2', name: '2', type: 'tht', x: 1.27, y: 0, width: 1.6, height: 1.6, shape: 'circle', drill: 0.8, layers: ['All'] },
    ],
  },

  // ── 34. Tilt Sensor SW-200D (3-Pin Module) ─────────────────────────────────
  'MODULE-TILT-SW200D': {
    id: 'MODULE-TILT-SW200D',
    name: 'SW-200D Tilt Switch Module (3P)',
    description: '3-pin 2.54mm header for digital ball tilt switch',
    widthMm: 15.0,
    heightMm: 30.0,
    origin: { x: 7.5, y: 15.0 },
    pads: [
      { number: 'VCC', name: 'VCC', type: 'tht', x: -2.54, y: -12.0, width: 1.8, height: 1.8, shape: 'rect', drill: 1.0, layers: ['All'] },
      { number: 'GND', name: 'GND', type: 'tht', x: 0, y: -12.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'DO', name: 'DO', type: 'tht', x: 2.54, y: -12.0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
    ],
  },

  // ── 35. 4x4 Matrix Keypad (8-Pin Header) ──────────────────────────────────
  'MODULE-KEYPAD-4X4': {
    id: 'MODULE-KEYPAD-4X4',
    name: '4x4 Matrix Keypad Header (8P)',
    description: '8-pin 2.54mm inline connector for 16-button matrix keypad (R1..R4, C1..C4)',
    widthMm: 22.0,
    heightMm: 5.0,
    origin: { x: 11.0, y: 2.5 },
    pads: [
      { number: 'R1', name: 'R1', type: 'tht', x: -8.89, y: 0, width: 1.8, height: 1.8, shape: 'rect', drill: 1.0, layers: ['All'] },
      { number: 'R2', name: 'R2', type: 'tht', x: -6.35, y: 0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'R3', name: 'R3', type: 'tht', x: -3.81, y: 0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'R4', name: 'R4', type: 'tht', x: -1.27, y: 0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'C1', name: 'C1', type: 'tht', x: 1.27, y: 0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'C2', name: 'C2', type: 'tht', x: 3.81, y: 0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'C3', name: 'C3', type: 'tht', x: 6.35, y: 0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'C4', name: 'C4', type: 'tht', x: 8.89, y: 0, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
    ],
  },

  // ── 36. WS2812B NeoPixel Breakout & Rings ──────────────────────────────────
  'MODULE-WS2812-BREAKOUT': {
    id: 'MODULE-WS2812-BREAKOUT',
    name: 'NeoPixel WS2812B Module (4P)',
    description: 'Individually addressable RGB LED module with 2.54mm header',
    widthMm: 12.0,
    heightMm: 12.0,
    origin: { x: 6.0, y: 6.0 },
    pads: [
      { number: 'VCC', name: '5V', type: 'tht', x: -3.81, y: -4.5, width: 1.8, height: 1.8, shape: 'rect', drill: 1.0, layers: ['All'] },
      { number: 'GND', name: 'GND', type: 'tht', x: -1.27, y: -4.5, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'DIN', name: 'DIN', type: 'tht', x: 1.27, y: -4.5, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'DOUT', name: 'DOUT', type: 'tht', x: 3.81, y: -4.5, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
    ],
  },

  // ── 37. Single Digit 7-Segment Display (DIP-10) ────────────────────────────
  'DISPLAY-7SEG-1DIGIT': {
    id: 'DISPLAY-7SEG-1DIGIT',
    name: '7-Segment Display 1-Digit (DIP-10)',
    description: '0.56 inch single digit common cathode/anode display, 10-pin DIP (7.62mm pitch across rows)',
    widthMm: 12.6,
    heightMm: 19.0,
    origin: { x: 6.3, y: 9.5 },
    pads: [
      // Pin 1..5 bottom row
      { number: '1', name: 'E', type: 'tht', x: -5.08, y: 7.62, width: 1.8, height: 1.8, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '2', name: 'D', type: 'tht', x: -2.54, y: 7.62, width: 1.8, height: 1.8, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '3', name: 'COM1', type: 'tht', x: 0, y: 7.62, width: 1.8, height: 1.8, shape: 'rect', drill: 0.8, layers: ['All'] },
      { number: '4', name: 'C', type: 'tht', x: 2.54, y: 7.62, width: 1.8, height: 1.8, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '5', name: 'DP', type: 'tht', x: 5.08, y: 7.62, width: 1.8, height: 1.8, shape: 'circle', drill: 0.8, layers: ['All'] },
      // Pin 6..10 top row
      { number: '6', name: 'B', type: 'tht', x: 5.08, y: -7.62, width: 1.8, height: 1.8, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '7', name: 'A', type: 'tht', x: 2.54, y: -7.62, width: 1.8, height: 1.8, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '8', name: 'COM2', type: 'tht', x: 0, y: -7.62, width: 1.8, height: 1.8, shape: 'rect', drill: 0.8, layers: ['All'] },
      { number: '9', name: 'F', type: 'tht', x: -2.54, y: -7.62, width: 1.8, height: 1.8, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '10', name: 'G', type: 'tht', x: -5.08, y: -7.62, width: 1.8, height: 1.8, shape: 'circle', drill: 0.8, layers: ['All'] },
    ],
  },

  // ── 38. 4-Digit 7-Segment Display (DIP-12) ─────────────────────────────────
  'DISPLAY-7SEG-4DIGIT': {
    id: 'DISPLAY-7SEG-4DIGIT',
    name: '7-Segment Display 4-Digit (DIP-12)',
    description: '0.56 inch 4-digit multiplexed 7-segment display, 12-pin DIP (15.24mm row spacing)',
    widthMm: 50.3,
    heightMm: 19.0,
    origin: { x: 25.15, y: 9.5 },
    pads: [
      // Pins 1..6 bottom
      { number: '1', name: 'D1', type: 'tht', x: -12.7, y: 7.62, width: 1.8, height: 1.8, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '2', name: 'A', type: 'tht', x: -7.62, y: 7.62, width: 1.8, height: 1.8, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '3', name: 'F', type: 'tht', x: -2.54, y: 7.62, width: 1.8, height: 1.8, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '4', name: 'D2', type: 'tht', x: 2.54, y: 7.62, width: 1.8, height: 1.8, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '5', name: 'D3', type: 'tht', x: 7.62, y: 7.62, width: 1.8, height: 1.8, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '6', name: 'B', type: 'tht', x: 12.7, y: 7.62, width: 1.8, height: 1.8, shape: 'circle', drill: 0.8, layers: ['All'] },
      // Pins 7..12 top
      { number: '7', name: 'E', type: 'tht', x: 12.7, y: -7.62, width: 1.8, height: 1.8, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '8', name: 'D', type: 'tht', x: 7.62, y: -7.62, width: 1.8, height: 1.8, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '9', name: 'DP', type: 'tht', x: 2.54, y: -7.62, width: 1.8, height: 1.8, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '10', name: 'C', type: 'tht', x: -2.54, y: -7.62, width: 1.8, height: 1.8, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '11', name: 'G', type: 'tht', x: -7.62, y: -7.62, width: 1.8, height: 1.8, shape: 'circle', drill: 0.8, layers: ['All'] },
      { number: '12', name: 'D4', type: 'tht', x: -12.7, y: -7.62, width: 1.8, height: 1.8, shape: 'circle', drill: 0.8, layers: ['All'] },
    ],
  },

  // ── 39. Arduino Mega 2560 R3 Module Footprint ──────────────────────────────
  'MODULE-ARDUINO-MEGA': {
    id: 'MODULE-ARDUINO-MEGA',
    name: 'Arduino Mega 2560 R3 Header Outline',
    description: 'ATmega2560 board with 54 digital I/O, 16 analog inputs, and double row 2x18 header',
    widthMm: 101.6,
    heightMm: 53.4,
    origin: { x: 50.8, y: 26.7 },
    pads: [
      { number: '5V', name: '5V', type: 'tht', x: -15.24, y: 24.13, width: 1.8, height: 1.8, shape: 'rect', drill: 1.0, layers: ['All'] },
      { number: 'GND', name: 'GND', type: 'tht', x: -12.7, y: 24.13, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'VIN', name: 'VIN', type: 'tht', x: -10.16, y: 24.13, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'D13', name: 'D13', type: 'tht', x: 25.4, y: -24.13, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'TX0', name: 'TX0', type: 'tht', x: 45.72, y: -24.13, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'RX0', name: 'RX0', type: 'tht', x: 48.26, y: -24.13, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
    ],
  },

  // ── 40. Handheld IR Remote (Chassis / Virtual IR Emitter) ─────────────────
  'CHASSIS-IR-REMOTE': {
    id: 'CHASSIS-IR-REMOTE',
    name: 'Handheld 21-Key IR Remote Chassis',
    description: 'Battery-powered handheld IR transmitter remote (38kHz NEC protocol)',
    widthMm: 40.0,
    heightMm: 86.0,
    origin: { x: 20.0, y: 43.0 },
    pads: [
      { number: 'IR_OUT', name: 'IR Beam', type: 'smd', x: 0, y: -40.0, width: 3.0, height: 3.0, shape: 'circle', drill: 0, layers: ['F.Cu'] },
    ],
  },

  // ── 41. ULN2003A Stepper Motor Driver Module Footprint ─────────────────────
  'ULN2003-MODULE-6P': {
    id: 'ULN2003-MODULE-6P',
    name: 'ULN2003A Stepper Motor Driver Module',
    description: 'ULN2003 Darlington array driver module with 6-pin input header and 5-pin motor output header',
    widthMm: 40.0,
    heightMm: 25.0,
    origin: { x: 20.0, y: 12.5 },
    pads: [
      { number: 'IN1', name: 'IN1', type: 'tht', x: -15.24, y: 10.16, width: 1.8, height: 1.8, shape: 'rect', drill: 1.0, layers: ['All'] },
      { number: 'IN2', name: 'IN2', type: 'tht', x: -12.7, y: 10.16, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'IN3', name: 'IN3', type: 'tht', x: -10.16, y: 10.16, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'IN4', name: 'IN4', type: 'tht', x: -7.62, y: 10.16, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'VCC', name: 'VCC', type: 'tht', x: -2.54, y: 10.16, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'GND', name: 'GND', type: 'tht', x: 0, y: 10.16, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'OUT1', name: 'OUT1', type: 'tht', x: 5.08, y: -10.16, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'OUT2', name: 'OUT2', type: 'tht', x: 7.62, y: -10.16, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'OUT3', name: 'OUT3', type: 'tht', x: 10.16, y: -10.16, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'OUT4', name: 'OUT4', type: 'tht', x: 12.7, y: -10.16, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
      { number: 'VMOT', name: 'VMOT', type: 'tht', x: 15.24, y: -10.16, width: 1.8, height: 1.8, shape: 'circle', drill: 1.0, layers: ['All'] },
    ],
  },
};

/**
 * Returns the matching verified IPC physical footprint for a component type,
 * or null if no valid footprint is registered.
 */
export function getFootprintForComponent(type: string): Footprint | null {
  switch (type) {
    case 'resistor':
    case 'photoresistor':
    case 'thermistor':
      return FOOTPRINT_LIBRARY['RES-AXIAL-0.3'];

    case 'ldr':
    case 'ldr-sensor':
      return FOOTPRINT_LIBRARY['SENSOR-LDR'];

    case 'capacitor-ceramic':
    case 'ceramic-capacitor':
    case 'capacitor':
      return FOOTPRINT_LIBRARY['CAP-RAD-2.54'];

    case 'capacitor-electrolytic':
    case 'electrolytic-capacitor':
      return FOOTPRINT_LIBRARY['CAP-ELECTROLYTIC-RADIAL'];

    case 'led':
      return FOOTPRINT_LIBRARY['LED-5MM'];

    case 'rgb-led':
      return FOOTPRINT_LIBRARY['LED-RGB-4PIN'];

    case 'pushbutton':
    case 'tactile-switch':
    case 'switch':
    case 'push-button':
      return FOOTPRINT_LIBRARY['SW-PB-6MM'];

    case 'slide-switch':
      return FOOTPRINT_LIBRARY['SWITCH-SPDT-SLIDE'];

    case 'dip-switch-4':
      return FOOTPRINT_LIBRARY['DIP-SWITCH-4'];

    case 'dip-switch-6':
      return FOOTPRINT_LIBRARY['DIP-SWITCH-6'];

    case 'potentiometer':
    case 'slide-potentiometer':
      return FOOTPRINT_LIBRARY['POT-3PIN'];

    case 'servo':
      return FOOTPRINT_LIBRARY['MODULE-SG90'];

    case 'stepper-motor':
    case 'stepper':
      return FOOTPRINT_LIBRARY['STEPPER-MOTOR-NEMA17'];

    case 'uln2003a':
    case 'uln2003':
      return FOOTPRINT_LIBRARY['ULN2003-MODULE-6P'];

    case 'ultrasonic-hcsr04':
    case 'hc-sr04':
    case 'ultrasonic-sensor':
    case 'ultrasonic-ping':
      return FOOTPRINT_LIBRARY['MODULE-HCSR04'];

    case 'dht11-sensor':
    case 'dht11':
    case 'dht22-sensor':
    case 'dht22':
      return FOOTPRINT_LIBRARY['MODULE-DHT11'];

    case 'bluetooth-hc05':
      return FOOTPRINT_LIBRARY['MODULE-HC05'];

    case 'esp-01':
    case 'esp-01-wifi':
      return FOOTPRINT_LIBRARY['MODULE-ESP01'];

    case 'mpu6050':
    case 'mpu-6050':
      return FOOTPRINT_LIBRARY['MODULE-MPU6050'];

    case 'pir-sensor':
    case 'pir':
      return FOOTPRINT_LIBRARY['MODULE-PIR'];

    case 'esp32-devkit':
    case 'esp32':
      return FOOTPRINT_LIBRARY['MODULE-ESP32-DEVKIT'];

    case 'nodemcu-esp8266':
      return FOOTPRINT_LIBRARY['MODULE-NODEMCU'];

    case 'arduino-uno':
      return FOOTPRINT_LIBRARY['MODULE-ARDUINO-UNO'];

    case 'arduino-nano':
      return FOOTPRINT_LIBRARY['MODULE-ARDUINO-NANO'];

    case 'arduino-mega':
      return FOOTPRINT_LIBRARY['MODULE-ARDUINO-MEGA'];

    case 'relay-5v':
      return FOOTPRINT_LIBRARY['MODULE-RELAY-1CH'];

    case 'relay-5v-2ch':
      return FOOTPRINT_LIBRARY['MODULE-RELAY-2CH'];

    case 'diode-1n4007':
    case 'diode':
      return FOOTPRINT_LIBRARY['DIODE-DO41'];

    case 'zener-diode':
      return FOOTPRINT_LIBRARY['DIODE-DO35'];

    case 'transistor-npn':
    case 'transistor-pnp':
    case 'transistor':
    case 'lm35':
      return FOOTPRINT_LIBRARY['TO92-TRANSISTOR'];

    case 'ne555':
    case 'opamp':
      return FOOTPRINT_LIBRARY['DIP8-300'];

    case 'inductor':
      return FOOTPRINT_LIBRARY['IND-AXIAL-0.3'];

    case 'buzzer':
    case 'piezo-buzzer':
      return FOOTPRINT_LIBRARY['BUZZER-RADIAL'];

    case 'battery-9v':
    case 'battery-1.5v-aa':
    case 'battery-4x-aa':
    case 'coin-cell-3v':
    case 'battery-3v':
    case 'power-supply':
      return FOOTPRINT_LIBRARY['MODULE-POWER-2PIN'];

    case 'breadboard-power-supply':
      return FOOTPRINT_LIBRARY['MODULE-MB102'];

    case 'lcd1602':
    case 'lcd1602-i2c':
      return FOOTPRINT_LIBRARY['MODULE-LCD1602'];

    case 'ssd1306':
    case 'oled-ssd1306':
      return FOOTPRINT_LIBRARY['MODULE-OLED-SSD1306'];

    case 'soil-moisture':
      return FOOTPRINT_LIBRARY['MODULE-SOIL-MOISTURE'];

    case 'ir-sensor':
      return FOOTPRINT_LIBRARY['MODULE-IR-OBSTACLE'];

    case 'ir-remote':
      return FOOTPRINT_LIBRARY['CHASSIS-IR-REMOTE'];

    case 'analog-joystick':
    case 'joystick':
      return FOOTPRINT_LIBRARY['MODULE-JOYSTICK'];

    case 'tilt-sensor':
      return FOOTPRINT_LIBRARY['MODULE-TILT-SW200D'];

    case 'keypad-4x4':
      return FOOTPRINT_LIBRARY['MODULE-KEYPAD-4X4'];

    case 'neopixel':
    case 'neopixel-ring-12':
    case 'neopixel-ring-16':
      return FOOTPRINT_LIBRARY['MODULE-WS2812-BREAKOUT'];

    case 'segment-7':
      return FOOTPRINT_LIBRARY['DISPLAY-7SEG-1DIGIT'];

    case 'segment-7-4digit':
      return FOOTPRINT_LIBRARY['DISPLAY-7SEG-4DIGIT'];

    case 'flex-sensor':
    case 'force-sensor':
    case 'dc-motor':
    case 'gear-motor':
    case 'dc-motor-encoder':
    case 'light-bulb':
      return FOOTPRINT_LIBRARY['SENSOR-2PIN'];

    case 'gas-sensor':
    case 'mq2-sensor':
    case 'mq5-sensor':
    case 'flame-sensor':
      return FOOTPRINT_LIBRARY['MODULE-GAS'];

    default:
      // Direct library ID lookup
      if (FOOTPRINT_LIBRARY[type]) {
        return FOOTPRINT_LIBRARY[type];
      }
      return null;
  }
}

/**
 * Resolves the physical footprint for a component or throws a FootprintError if unmapped.
 * Explicitly prevents any silent fallback.
 */
export function resolveFootprint(type: string, compName?: string): Footprint {
  const fp = getFootprintForComponent(type);
  if (!fp) {
    throw new FootprintError(
      `No valid physical footprint defined for ${compName || type} (type: "${type}"). Create/assign a verified footprint before PCB layout.`,
      [{ id: type, name: compName || type, type }]
    );
  }
  return fp;
}

export const FOOTPRINTS = FOOTPRINT_LIBRARY;


