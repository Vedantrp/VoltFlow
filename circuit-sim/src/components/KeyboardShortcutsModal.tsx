import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUT_GROUPS = [
  {
    title: 'Selection & Manipulation',
    shortcuts: [
      { key: 'R', description: 'Rotate selected component 90° clockwise' },
      { key: 'Del / Backspace', description: 'Delete selected component or wire' },
      { key: 'Ctrl + Z / ⌘Z', description: 'Undo last action' },
      { key: 'Ctrl + Y / ⌘Y', description: 'Redo last action' },
      { key: 'Click + Drag', description: 'Move component across grid' },
    ],
  },
  {
    title: 'Wiring & Pin Connections',
    shortcuts: [
      { key: 'Click Pin', description: 'Start drawing wire from pin terminal' },
      { key: 'Click Target Hole', description: 'Connect wire into destination pin hole' },
      { key: 'Esc', description: 'Cancel active wire drawing' },
      { key: 'Wire Color Selector', description: 'Quick switch between 5V, GND, Signal colors' },
    ],
  },
  {
    title: 'Workspace & Views',
    shortcuts: [
      { key: '⌘K / Ctrl + K', description: 'Open Command Palette' },
      { key: 'Space + Drag', description: 'Pan across canvas workspace' },
      { key: 'Mouse Wheel / Pinch', description: 'Zoom in / out on circuit canvas' },
      { key: 'C', description: 'Toggle C++ Code Editor and Serial Monitor' },
    ],
  },
  {
    title: 'Simulation & Tools',
    shortcuts: [
      { key: 'Space', description: 'Start / Stop Circuit Simulation' },
      { key: 'B', description: 'Open Bill of Materials (BOM) & Inventory' },
      { key: 'P', description: 'Export PCB Gerber & Circuit Layout' },
      { key: '?', description: 'View Keyboard Shortcuts Overlay' },
    ],
  },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 110,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 680,
          backgroundColor: '#0F172A',
          border: '1px solid #334155',
          borderRadius: 20,
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 24px', backgroundColor: '#1E293B', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Keyboard size={20} color="#06B6D4" /> Keyboard Shortcuts Cheat Sheet
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4 }} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, maxHeight: '70vh', overflowY: 'auto' }}>
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title} style={{ backgroundColor: '#1E293B', borderRadius: 12, padding: 16, border: '1px solid #334155' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: 13, fontWeight: 700, color: '#06B6D4' }}>
                {group.title}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {group.shortcuts.map((s) => (
                  <div key={s.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#94A3B8' }}>{s.description}</span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        fontFamily: 'JetBrains Mono, monospace',
                        padding: '2px 8px',
                        borderRadius: 6,
                        backgroundColor: '#0F172A',
                        color: '#F8FAFC',
                        border: '1px solid #334155',
                      }}
                    >
                      {s.key}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 24px', backgroundColor: '#0F172A', borderTop: '1px solid #1E293B', textAlign: 'center', fontSize: 12, color: '#6B7280' }}>
          Press <strong style={{ color: '#F8FAFC' }}>Esc</strong> or click outside to dismiss overlay
        </div>
      </div>
    </div>
  );
};
