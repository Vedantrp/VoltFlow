import { describe, it, expect, beforeEach } from 'vitest';
import { WiringGraph } from '../WiringGraph';

describe('WiringGraph Engine', () => {
  let graph: WiringGraph;

  beforeEach(() => {
    graph = new WiringGraph();
  });

  it('connects two pins with a simple wire and propagates strong signals', () => {
    graph.addWire({ id: 'w1', from: 'uno:13', to: 'led:A' });

    // Driving HIGH onto uno:13 should result in led:A reading HIGH
    graph.setPinDriver('uno:13', true);
    expect(graph.read('uno:13')).toBe(true);
    expect(graph.read('led:A')).toBe(true);

    // Driving LOW
    graph.setPinDriver('uno:13', false);
    expect(graph.read('uno:13')).toBe(false);
    expect(graph.read('led:A')).toBe(false);
  });

  it('handles multi-hop wire chains (BFS Net propagation)', () => {
    graph.addWire({ id: 'w1', from: 'mcu:out', to: 'res:1' });
    graph.addWire({ id: 'w_res', from: 'res:1', to: 'res:2' });
    graph.addWire({ id: 'w2', from: 'res:2', to: 'led:anode' });

    graph.setPinDriver('mcu:out', true);
    expect(graph.read('res:1')).toBe(true);
    expect(graph.read('res:2')).toBe(true);
    expect(graph.read('led:anode')).toBe(true);
  });

  it('resolves weak drivers (e.g. INPUT_PULLUP) unless overridden by strong drivers', () => {
    graph.addWire({ id: 'w1', from: 'mcu:pin2', to: 'btn:terminal1' });
    
    // Set weak pullup driver
    graph.setWeakDriver('mcu:pin2', true);
    expect(graph.read('btn:terminal1')).toBe(true);

    // Strong driver overrides weak driver
    graph.setPinDriver('gnd:1', false);
    graph.addWire({ id: 'w2', from: 'btn:terminal1', to: 'gnd:1' });

    expect(graph.read('mcu:pin2')).toBe(false);
  });

  it('handles switch wires being opened and closed', () => {
    graph.addWire({
      id: 'sw1',
      from: 'power:vcc',
      to: 'bulb:in',
      isSwitch: true,
      closed: false,
    });
    graph.setPinDriver('power:vcc', true);

    // When switch is open, bulb reads default false
    expect(graph.read('bulb:in')).toBe(false);

    // Close the switch
    graph.setSwitch('sw1', true);
    expect(graph.read('bulb:in')).toBe(true);

    // Reopen the switch
    graph.setSwitch('sw1', false);
    expect(graph.read('bulb:in')).toBe(false);
  });

  it('notifies listeners on graph state recomputation', () => {
    let callCount = 0;
    graph.onChange(() => {
      callCount++;
    });

    graph.addWire({ id: 'w1', from: 'a:1', to: 'b:1' });
    expect(callCount).toBe(1);

    graph.setPinDriver('a:1', true);
    expect(callCount).toBe(2);
  });
});
