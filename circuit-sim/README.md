# Circuit Sim — Browser Arduino Simulator (MVP)

A real, working slice of a browser-based electronics simulator: write Arduino
C/C++, compile it with the actual AVR toolchain, and watch a real ATmega328p
core execute it while an LED lights up on a modeled breadboard circuit.

This is a deliberately scoped MVP, not the "world's best electronics
platform" — see the note on scope below.

## Architecture (the four layers this demonstrates)

1. **MCU emulation** — [`avr8js`](https://github.com/wokwi/avr8js) runs a real
   ATmega328p core (`src/sim/AvrRunner.ts`): CPU, GPIO ports, USART, Timer0.
   No shortcuts — it executes actual AVR machine code, instruction by
   instruction.
2. **In-browser-triggered compilation** — `server/index.js` shells out to the
   real `avr-gcc`/`avr-g++` toolchain and returns an Intel HEX file. A tiny
   Arduino-compatible shim (`pinMode`, `digitalWrite`, `Serial.println`, ...)
   is prepended so sketches look like real Arduino code. (True *in-browser*
   compilation would mean an avr-gcc WASM build — that's a separate, sizeable
   project on its own; this uses the same client -> compile-service -> hex
   architecture Wokwi itself uses.)
3. **Component simulation via a wiring graph** — `src/sim/WiringGraph.ts` is
   an original implementation: pins are nodes, wires are edges, and connected
   pins collapse into "nets." The MCU drives a net; downstream components
   (currently: LED) read it. This is the seed of a real breadboard model —
   extending it to resistors-with-actual-Ohm's-law, buttons as pull-up
   inputs, etc. is straightforward from here.
4. **Component visuals** — [`@wokwi/elements`](https://github.com/wokwi/wokwi-elements)
   supplies SVG visuals only (no simulation logic, per its own README) for
   the Arduino Uno, resistor, and LED. Everything electrical is driven by
   layer 3, not by these components.

## Scope note

The original ask described a 100,000-component, photorealistic 3D, AI-driven,
PCB-generating platform — that's a multi-year commercial product (this is
essentially Wokwi + Tinkercad + KiCad + an AI agent, combined). This MVP
instead proves the hard, differentiating parts actually work end-to-end:
real CPU emulation, real compilation, and an original wiring-graph model.
That's a stronger portfolio piece than a wide but shallow clone — it's easy
to demo, easy to explain in an interview, and every claim in it is something
you can point at in the code.

## Running it

```bash
# Terminal 1 - compile server (needs avr-gcc + avr-g++ installed)
cd server
npm install
npm start        # listens on http://localhost:8787

# Terminal 2 - frontend
npm install
npm run dev       # opens on http://localhost:5173
```

On Ubuntu/Debian, install the toolchain with:
```bash
apt-get install gcc-avr avr-libc
```

Click **Compile & Run**. Pin 13 blinks the on-canvas LED at 500ms intervals
and the serial monitor prints `blink #1`, `blink #2`, ... - edit the code
and hit Compile & Run again to see changes.

## Where to go next (in order of "most portfolio value per hour")

1. **More components on the graph**: pushbutton (as a digital input net),
   potentiometer (as an analog value feeding `analogRead`), buzzer (tone()).
   Each is a small addition to `WiringGraph` + a wokwi-element + a wiring
   rule in `App.tsx`.
2. **Drag-and-drop wiring in the UI** - right now the circuit is
   hard-coded in `buildCircuitGraph()`. Making wires draggable (click pin ->
   click pin -> `graph.addWire(...)`) is the natural next step and is a
   good showcase of the graph model actually being general-purpose.
3. **Multiple MCU support** - avr8js can simulate other AVR chips
   (ATtiny, ATmega2560); wiring in an ESP32 would need a different core
   entirely (Xtensa) and is a much bigger lift - mention it as future work
   rather than promising it.
4. **PCB/BOM generation, AI assistant, 100k component library** - these are
   genuinely separate large projects. Worth naming as "future direction" in
   a portfolio write-up, not worth building a stub for.
