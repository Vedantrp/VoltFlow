import React, { useState } from 'react';
import {
  Zap,
  RotateCw,
  Trash2,
  Undo2,
  Redo2,
  FileSpreadsheet,
  Cpu,
  Eraser,
  Box,
  Code2,
  Package,
  Play,
  Square,
  Edit2
} from 'lucide-react';
import type { TinkercadWireColor, WireType } from '../types';

interface TinkercadTopBarProps {
  circuitName: string;
  onNameChange: (name: string) => void;
  onRotateSelected: () => void;
  onDeleteSelected: () => void;
  onUndo: () => void;
  onRedo: () => void;
  selectedColor: TinkercadWireColor;
  onColorChange: (color: TinkercadWireColor) => void;
  selectedWireType: WireType;
  onWireTypeChange: (type: WireType) => void;
  viewMode: '2D' | '3D';
  onViewModeChange: (mode: '2D' | '3D') => void;
  showCode: boolean;
  onToggleCode: () => void;
  showDrawer: boolean;
  onToggleDrawer: () => void;
  onOpenBOM: () => void;
  onOpenPCB: () => void;
  onClearCanvas: () => void;
  isRunning: boolean;
  onToggleSimulation: () => void;
  hasSelection: boolean;
}

const WIRE_COLORS: { id: TinkercadWireColor; hex: string; name: string }[] = [
  { id: 'green', hex: '#10b981', name: 'Green' },
  { id: 'black', hex: '#1e293b', name: 'Black' },
  { id: 'red', hex: '#ef4444', name: 'Red' },
  { id: 'blue', hex: '#3b82f6', name: 'Blue' },
  { id: 'yellow', hex: '#eab308', name: 'Yellow' },
  { id: 'orange', hex: '#f97316', name: 'Orange' },
  { id: 'white', hex: '#ffffff', name: 'White' },
  { id: 'brown', hex: '#78350f', name: 'Brown' },
  { id: 'purple', hex: '#a855f7', name: 'Purple' },
];

export const TinkercadTopBar: React.FC<TinkercadTopBarProps> = ({
  circuitName,
  onNameChange,
  onRotateSelected,
  onDeleteSelected,
  onUndo,
  onRedo,
  selectedColor,
  onColorChange,
  selectedWireType,
  onWireTypeChange,
  viewMode,
  onViewModeChange,
  showCode,
  onToggleCode,
  showDrawer,
  onToggleDrawer,
  onOpenBOM,
  onOpenPCB,
  onClearCanvas,
  isRunning,
  onToggleSimulation,
  hasSelection,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);

  return (
    <header className="clean-header" style={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5' }}>
      
      {/* Left Branding & Editable Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={20} color="#f4f4f5" />
          <span style={{ fontWeight: 800, fontSize: 15, color: '#ffffff', letterSpacing: -0.3 }}>
            VoltFlow Circuits
          </span>
        </div>

        <div style={{ height: 20, width: 1, backgroundColor: '#3f3f46' }} />

        {isEditingName ? (
          <input
            type="text"
            value={circuitName}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={() => setIsEditingName(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
            autoFocus
            style={{ fontSize: 13, fontWeight: 600, padding: '3px 8px', border: '1px solid #71717a', borderRadius: 6, outline: 'none', backgroundColor: '#27272a', color: '#ffffff' }}
          />
        ) : (
          <span
            onClick={() => setIsEditingName(true)}
            style={{ fontSize: 13, fontWeight: 600, color: '#d4d4d8', cursor: 'pointer', padding: '4px 8px', borderRadius: 6, transition: 'background 0.15s', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            title="Click to rename"
          >
            {circuitName} <Edit2 size={13} color="#a1a1aa" />
          </span>
        )}
      </div>

      {/* Center Actions Toolbar */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        
        {/* Rotate Button */}
        <button
          onClick={onRotateSelected}
          disabled={!hasSelection}
          className="clean-btn"
          title="Rotate Component (R)"
          style={{ opacity: hasSelection ? 1 : 0.4, backgroundColor: '#27272a', color: '#f4f4f5', borderColor: '#3f3f46' }}
        >
          <RotateCw size={14} color="#e4e4e7" /> Rotate
        </button>

        {/* Delete Button */}
        <button
          onClick={onDeleteSelected}
          disabled={!hasSelection}
          className="clean-btn clean-btn-danger"
          title="Delete Component (Del)"
          style={{ opacity: hasSelection ? 1 : 0.4 }}
        >
          <Trash2 size={14} /> Delete
        </button>

        <div style={{ height: 20, width: 1, backgroundColor: '#3f3f46', margin: '0 2px' }} />

        {/* Undo / Redo */}
        <button onClick={onUndo} className="clean-btn" style={{ backgroundColor: '#27272a', color: '#f4f4f5', borderColor: '#3f3f46' }} title="Undo (Ctrl+Z)"><Undo2 size={14} /></button>
        <button onClick={onRedo} className="clean-btn" style={{ backgroundColor: '#27272a', color: '#f4f4f5', borderColor: '#3f3f46' }} title="Redo (Ctrl+Y)"><Redo2 size={14} /></button>

        <div style={{ height: 20, width: 1, backgroundColor: '#3f3f46', margin: '0 2px' }} />

        {/* Wire Color Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, backgroundColor: '#27272a', padding: '4px 8px', borderRadius: 6, border: '1px solid #3f3f46' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#a1a1aa', marginRight: 2 }}>Wire:</span>
          {WIRE_COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => onColorChange(c.id)}
              title={`Wire Color: ${c.name}`}
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: c.hex,
                border: selectedColor === c.id ? '2px solid #ffffff' : '1px solid #52525b',
                boxShadow: selectedColor === c.id ? '0 0 6px rgba(255,255,255,0.6)' : 'none',
                cursor: 'pointer',
                transition: 'transform 0.1s ease',
              }}
            />
          ))}
        </div>

        {/* Wire Type Selector */}
        <select
          value={selectedWireType}
          onChange={(e) => onWireTypeChange(e.target.value as WireType)}
          style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, border: '1px solid #3f3f46', backgroundColor: '#27272a', color: '#f4f4f5', fontWeight: 600, outline: 'none' }}
        >
          <option value="normal">Normal Wire</option>
          <option value="hookup">Hookup Wire</option>
          <option value="alligator">Alligator Wire</option>
        </select>
      </div>

      {/* Right Controls & Feature Modals */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        
        {/* BOM Exporter Button */}
        <button
          onClick={onOpenBOM}
          className="clean-btn"
          style={{ backgroundColor: '#27272a', color: '#f4f4f5', borderColor: '#3f3f46', fontWeight: 600 }}
          title="Bill of Materials & Cost"
        >
          <FileSpreadsheet size={14} color="#a1a1aa" /> BOM
        </button>

        {/* PCB Layout Button */}
        <button
          onClick={onOpenPCB}
          className="clean-btn"
          style={{ backgroundColor: '#27272a', color: '#f4f4f5', borderColor: '#3f3f46', fontWeight: 600 }}
          title="PCB Layout View"
        >
          <Cpu size={14} color="#a1a1aa" /> PCB View
        </button>

        {/* Clear Canvas */}
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to clear the entire circuit canvas?')) {
              onClearCanvas();
            }
          }}
          className="clean-btn"
          style={{ backgroundColor: '#27272a', color: '#a1a1aa', borderColor: '#3f3f46' }}
          title="Clear Circuit Canvas"
        >
          <Eraser size={14} color="#a1a1aa" /> Clear
        </button>

        <div style={{ height: 20, width: 1, backgroundColor: '#3f3f46', margin: '0 2px' }} />

        {/* 2D / 3D Toggle */}
        <button
          onClick={() => onViewModeChange(viewMode === '2D' ? '3D' : '2D')}
          className="clean-btn"
          style={{ backgroundColor: '#27272a', color: '#f4f4f5', borderColor: '#3f3f46' }}
        >
          <Box size={14} color="#e4e4e7" /> {viewMode === '2D' ? '3D View' : '2D CAD'}
        </button>

        {/* Code Drawer Toggle */}
        <button
          onClick={onToggleCode}
          className="clean-btn"
          style={{
            backgroundColor: showCode ? '#ffffff' : '#27272a',
            borderColor: showCode ? '#ffffff' : '#3f3f46',
            color: showCode ? '#09090b' : '#f4f4f5',
            fontWeight: 700,
          }}
        >
          <Code2 size={14} /> {showCode ? 'Code (Open)' : 'Code Editor'}
        </button>

        {/* Component Drawer Toggle */}
        <button
          onClick={onToggleDrawer}
          className="clean-btn"
          style={{
            backgroundColor: showDrawer ? '#ffffff' : '#27272a',
            borderColor: showDrawer ? '#ffffff' : '#3f3f46',
            color: showDrawer ? '#09090b' : '#f4f4f5',
            fontWeight: 700,
          }}
        >
          <Package size={14} /> Components
        </button>

        {/* Start / Stop Simulation Monochrome Button */}
        <button
          onClick={onToggleSimulation}
          className={isRunning ? 'clean-btn clean-btn-danger' : 'clean-btn clean-btn-success'}
          style={{
            padding: '7px 18px',
            borderRadius: 20,
            fontSize: 13,
          }}
        >
          {isRunning ? <><Square size={14} fill="#09090b" /> Stop Simulation</> : <><Play size={14} fill="#09090b" /> Start Simulation</>}
        </button>
      </div>

    </header>
  );
};
