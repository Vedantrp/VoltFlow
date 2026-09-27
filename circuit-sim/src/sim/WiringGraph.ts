// A minimal breadboard/wiring graph model.
//
// Every pin on every component (MCU, LED, resistor, breadboard rail, ...)
// is a node. A "wire" is an edge between two pins. Pins that end up
// connected (directly or through a chain of wires / breadboard rows) form
// a "net" — all pins in a net are electrically the same point for our
// digital-only simulation.
//
// This is intentionally simple (no analog voltage division, no current
// calculation) — good enough to drive LEDs/buttons/buzzers from GPIO,
// which is what the AVR8js + wokwi-elements integration needs.

export type PinId = string; // format: "componentId:pinName", e.g. "uno1:13"

export interface Wire {
  id: string;
  from: PinId;
  to: PinId;
  color?: string;
  /** If true, this edge only conducts while `closed` — models a switch/button. */
  isSwitch?: boolean;
  closed?: boolean;
}

export type GraphListener = () => void;

export class WiringGraph {
  private wires = new Map<string, Wire>();
  private pinState = new Map<PinId, boolean>(); // digital state driven onto a pin
  private strongDrivers = new Map<PinId, boolean>(); // e.g. MCU output pins, GND rail
  private weakDrivers = new Map<PinId, boolean>(); // e.g. INPUT_PULLUP defaults
  private listeners: GraphListener[] = [];

  addPin(_pin: PinId) {
    // pins are implicit — recorded lazily whenever a wire/driver references them
  }

  addWire(wire: Wire) {
    this.wires.set(wire.id, wire);
    this.recompute();
  }

  removeWire(wireId: string) {
    this.wires.delete(wireId);
    this.recompute();
  }

  /** Open/close a switch-type wire (e.g. a pushbutton making/breaking contact). */
  setSwitch(wireId: string, closed: boolean) {
    const wire = this.wires.get(wireId);
    if (!wire) return;
    wire.closed = closed;
    this.recompute();
  }

  private adjacency(): Map<PinId, Set<PinId>> {
    const adj = new Map<PinId, Set<PinId>>();
    const link = (a: PinId, b: PinId) => {
      if (!adj.has(a)) adj.set(a, new Set());
      if (!adj.has(b)) adj.set(b, new Set());
      adj.get(a)!.add(b);
      adj.get(b)!.add(a);
    };
    for (const wire of this.wires.values()) {
      if (wire.isSwitch && !wire.closed) continue; // open switch: no connection
      link(wire.from, wire.to);
    }
    for (const pin of this.strongDrivers.keys()) if (!adj.has(pin)) adj.set(pin, new Set());
    for (const pin of this.weakDrivers.keys()) if (!adj.has(pin)) adj.set(pin, new Set());
    return adj;
  }

  /** Group all pins into connected-component "nets" via BFS over active wires. */
  private nets(adj: Map<PinId, Set<PinId>>): Map<PinId, string> {
    const netOf = new Map<PinId, string>();
    let netCounter = 0;
    for (const start of adj.keys()) {
      if (netOf.has(start)) continue;
      const netId = `net${netCounter++}`;
      const queue = [start];
      netOf.set(start, netId);
      while (queue.length) {
        const pin = queue.pop()!;
        for (const neighbor of adj.get(pin) ?? []) {
          if (!netOf.has(neighbor)) {
            netOf.set(neighbor, netId);
            queue.push(neighbor);
          }
        }
      }
    }
    return netOf;
  }

  /** A component (e.g. the MCU, or the GND rail) asserts a digital level. */
  setPinDriver(pin: PinId, isHigh: boolean) {
    this.strongDrivers.set(pin, isHigh);
    this.recompute();
  }

  clearPinDriver(pin: PinId) {
    this.strongDrivers.delete(pin);
    this.recompute();
  }

  /** A weak driver (e.g. INPUT_PULLUP) — only wins if nothing else drives the net. */
  setWeakDriver(pin: PinId, isHigh: boolean) {
    this.weakDrivers.set(pin, isHigh);
    this.recompute();
  }

  /** What level is currently present at a given pin (after net propagation)? */
  read(pin: PinId): boolean {
    return this.pinState.get(pin) ?? false;
  }

  /** Is the pin actively driven by a power source, GND, or GPIO output (not floating)? */
  hasDriver(pin: PinId): boolean {
    return this.pinState.has(pin);
  }

  /** Fires after every recompute; consumers should re-read whichever pins they track. */
  onChange(listener: GraphListener) {
    this.listeners.push(listener);
  }

  private pinNet = new Map<PinId, string>();

  /** Are two pins electrically connected in the same net? */
  areConnected(pin1: PinId, pin2: PinId): boolean {
    const net1 = this.pinNet.get(pin1);
    const net2 = this.pinNet.get(pin2);
    return net1 !== undefined && net2 !== undefined && net1 === net2;
  }

  private recompute() {
    this.pinState.clear();
    const adj = this.adjacency();
    const netOf = this.nets(adj);
    this.pinNet = netOf;
    const netStrong = new Map<string, boolean>();
    const netWeak = new Map<string, boolean>();

    for (const [pin, value] of this.strongDrivers) {
      const net = netOf.get(pin);
      if (net) netStrong.set(net, value); // last strong driver wins on conflict
    }
    for (const [pin, value] of this.weakDrivers) {
      const net = netOf.get(pin);
      if (net && !netStrong.has(net)) netWeak.set(net, value);
    }

    for (const [pin, net] of netOf) {
      const resolved = netStrong.has(net) ? netStrong.get(net)! : netWeak.get(net);
      if (resolved !== undefined) this.pinState.set(pin, resolved);
    }

    for (const l of this.listeners) l();
  }
}
