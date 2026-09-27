import React from 'react';
import {
  Play,
  Square,
  Plus,
  Code2,
  RotateCw,
  Trash2,
} from 'lucide-react';
import type { TinkercadWireColor } from '../types';

interface MobileQuickBarProps {
  isRunning: boolean;
  onToggleSimulation: () => void;
  onOpenDrawer: () => void;
  onToggleCode: () => void;
  showCode: boolean;
  selectedId: string | null;
  selectedWireId: string | null;
  onRotateSelected: () => void;
  onDeleteSelected: () => void;
  selectedColor: TinkercadWireColor;
  onColorChange: (color: TinkercadWireColor) => void;
}

const QUICK_COLORS: { id: TinkercadWireColor; hex: string; label: string }[] = [
  { id: 'red', hex: '#ef4444', label: '5V' },
  { id: 'black', hex: '#1e293b', label: 'GND' },
  { id: 'green', hex: '#10b981', label: 'Signal' },
  { id: 'blue', hex: '#3b82f6', label: 'Blue' },
  { id: 'yellow', hex: '#eab308', label: 'PWM' },
];

export const MobileQuickBar: React.FC<MobileQuickBarProps> = ({
  isRunning,
  onToggleSimulation,
  onOpenDrawer,
  onToggleCode,
  showCode,
  selectedId,
  selectedWireId,
  onRotateSelected,
  onDeleteSelected,
  selectedColor,
  onColorChange,
}) => {
  const hasSelection = !!selectedId || !!selectedWireId;

  return (
    <div
      className="mobile-quick-bar"
      style={{
        display: 'none', // Controlled via CSS media query @media (max-width: 768px)
        position: 'fixed',
        bottom: 12,
        left: 12,
        right: 12,
        height: 60,
        backgroundColor: 'rgba(24, 24, 27, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid #3f3f46',
        borderRadius: 16,
        padding: '0 12px',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 90,
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* Run / Stop Simulation Button */}
      <button
        onClick={onToggleSimulation}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 14px',
          borderRadius: 12,
          backgroundColor: '#ffffff',
          color: '#09090b',
          fontWeight: 700,
          fontSize: 13,
          border: 'none',
          boxShadow: '0 2px 8px rgba(255, 255, 255, 0.2)',
          cursor: 'pointer',
        }}
      >
        {isRunning ? <Square size={16} fill="#09090b" /> : <Play size={16} fill="#09090b" />}
        {isRunning ? 'Stop' : 'Run'}
      </button>

      {/* Add Component Drawer Trigger */}
      <button
        onClick={onOpenDrawer}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          border: 'none',
          color: '#f4f4f5',
          fontSize: 10,
          fontWeight: 600,
          gap: 2,
          cursor: 'pointer',
        }}
      >
        <div style={{ padding: 6, borderRadius: 10, backgroundColor: '#27272a', border: '1px solid #3f3f46' }}>
          <Plus size={18} color="#ffffff" />
        </div>
        Add
      </button>

      {/* Wire Color Quick Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, backgroundColor: '#27272a', padding: '4px 6px', borderRadius: 12, border: '1px solid #3f3f46' }}>
        {QUICK_COLORS.map((c) => (
          <button
            key={c.id}
            onClick={() => onColorChange(c.id)}
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              backgroundColor: c.hex,
              border: selectedColor === c.id ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
              boxShadow: selectedColor === c.id ? `0 0 8px ${c.hex}` : 'none',
              transform: selectedColor === c.id ? 'scale(1.15)' : 'scale(1)',
              transition: 'all 0.15s ease',
              cursor: 'pointer',
            }}
            title={`Wire: ${c.label}`}
          />
        ))}
      </div>

      {/* Code Editor Toggle */}
      <button
        onClick={onToggleCode}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          border: 'none',
          color: showCode ? '#ffffff' : '#a1a1aa',
          fontSize: 10,
          fontWeight: 600,
          gap: 2,
          cursor: 'pointer',
        }}
      >
        <div style={{ padding: 6, borderRadius: 10, backgroundColor: showCode ? '#ffffff' : '#27272a', border: '1px solid #3f3f46' }}>
          <Code2 size={18} color={showCode ? '#09090b' : '#f4f4f5'} />
        </div>
        Code
      </button>

      {/* Selection Action / Extra Actions */}
      {hasSelection && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {selectedId && (
            <button
              onClick={onRotateSelected}
              style={{ padding: 7, borderRadius: 10, backgroundColor: '#1e293b', border: 'none', color: '#f8fafc', cursor: 'pointer' }}
              title="Rotate Component"
            >
              <RotateCw size={16} />
            </button>
          )}
          <button
            onClick={onDeleteSelected}
            style={{ padding: 7, borderRadius: 10, backgroundColor: '#450a0a', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer' }}
            title="Delete Selected"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
