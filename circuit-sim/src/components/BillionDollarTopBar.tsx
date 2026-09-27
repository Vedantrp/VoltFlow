import React, { useRef, useState } from 'react';
import {
  Zap,
  RotateCw,
  Trash2,
  Undo2,
  Redo2,
  Code2,
  Package,
  Play,
  Square,
  Edit2,
  Search,
  Keyboard,
  BookOpen,
  FileSpreadsheet,
  Cpu,
  Eraser,
  Copy,
  Download,
  Upload,
  X,
  FolderOpen,
  Cloud,
  User,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import type { TinkercadWireColor, WireType, UserProfile } from '../types';

interface BillionDollarTopBarProps {
  circuitName: string;
  onNameChange: (name: string) => void;
  onRotateSelected: () => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onUndo: () => void;
  onRedo: () => void;
  selectedColor: TinkercadWireColor;
  onColorChange: (color: TinkercadWireColor) => void;
  selectedWireType: WireType;
  onWireTypeChange: (type: WireType) => void;
  showCode: boolean;
  onToggleCode: () => void;
  showDrawer: boolean;
  onToggleDrawer: () => void;
  onOpenBOM: () => void;
  onOpenPCB: () => void;
  onOpenCommandPalette: () => void;
  onOpenShortcuts: () => void;
  onOpenLearning: () => void;
  onClearCanvas: () => void;
  onSaveFile: () => void;
  onLoadFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isRunning: boolean;
  onToggleSimulation: () => void;
  hasSelection: boolean;
  wiringActive: boolean;
  onCancelWiring: () => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onOpenProjects: () => void;
  onSignOut: () => void;
  onSaveProjectCloud?: () => void;
  isSavingCloud?: boolean;
  onOpenAdmin?: () => void;
  onNavigateHome?: () => void;
  onNavigatePrivacy?: () => void;
  onNavigateTerms?: () => void;
}

const WIRE_COLORS: { id: TinkercadWireColor; hex: string; name: string }[] = [
  { id: 'red', hex: '#EF4444', name: '5V (Red)' },
  { id: 'black', hex: '#1E293B', name: 'GND (Black)' },
  { id: 'green', hex: '#10B981', name: 'Signal (Green)' },
  { id: 'blue', hex: '#2563EB', name: 'Blue' },
  { id: 'yellow', hex: '#F59E0B', name: 'PWM (Yellow)' },
  { id: 'orange', hex: '#F97316', name: 'Orange' },
  { id: 'purple', hex: '#7C3AED', name: 'Purple' },
];

export const BillionDollarTopBar: React.FC<BillionDollarTopBarProps> = ({
  circuitName,
  onNameChange,
  onRotateSelected,
  onDeleteSelected,
  onDuplicateSelected,
  onUndo,
  onRedo,
  selectedColor,
  onColorChange,
  selectedWireType,
  onWireTypeChange,
  showCode,
  onToggleCode,
  showDrawer,
  onToggleDrawer,
  onOpenBOM,
  onOpenPCB,
  onOpenCommandPalette,
  onOpenShortcuts,
  onOpenLearning,
  onClearCanvas,
  onSaveFile,
  onLoadFile,
  isRunning,
  onToggleSimulation,
  hasSelection,
  wiringActive,
  onCancelWiring,
  user,
  onOpenAuth,
  onOpenProjects,
  onSignOut,
  onSaveProjectCloud,
  isSavingCloud,
  onNavigateHome,
  onNavigatePrivacy,
  onNavigateTerms,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <header
      className="clean-header"
      style={{
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        color: '#0f172a',
        padding: '0 16px',
        minHeight: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        zIndex: 50,
      }}
    >
      {/* Left: Branding, Live Status Pill & Editable Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: onNavigateHome ? 'pointer' : 'default' }} onClick={onNavigateHome}>
          <img src="/voltflow-logo.png" alt="VoltFlow Studio" style={{ height: 44, objectFit: 'contain' }} />
          <div style={{ fontSize: 10, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: isRunning ? '#e11d48' : '#059669' }} />
            {isRunning ? 'Simulation Active' : 'Ready'}
          </div>
        </div>

        <div style={{ height: 24, width: 1, backgroundColor: '#e2e8f0' }} />

        {isEditingName ? (
          <input
            type="text"
            value={circuitName}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={() => setIsEditingName(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
            autoFocus
            aria-label="Edit project name"
            style={{
              fontSize: 13,
              fontWeight: 700,
              padding: '4px 10px',
              border: '1px solid #2563eb',
              borderRadius: 6,
              outline: 'none',
              backgroundColor: '#ffffff',
              color: '#0f172a',
            }}
          />
        ) : (
          <span
            onClick={() => setIsEditingName(true)}
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#0f172a',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 6,
              transition: 'background 0.15s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
            title="Click to rename project"
          >
            {circuitName} <Edit2 size={13} color="#94a3b8" />
          </span>
        )}

        {/* Dashboard Homepage Button */}
        {onNavigateHome && (
          <button
            onClick={onNavigateHome}
            className="btn btn-secondary"
            title="Return to Dashboard / Homepage"
            style={{ padding: '5px 9px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}
          >
            <Cpu size={13} color="#0ea5e9" /> Dashboard
          </button>
        )}

        {/* Projects Dashboard Button */}
        <button
          onClick={onOpenProjects}
          className="btn btn-secondary"
          title="Open Recent Projects"
          style={{ padding: '5px 9px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}
        >
          <FolderOpen size={13} color="#2563eb" /> Projects
        </button>

        {/* Cloud Save Button */}
        <button
          onClick={onSaveProjectCloud}
          className="btn btn-secondary"
          title={user ? 'Save circuit to cloud workspace' : 'Sign in to save circuit'}
          style={{ padding: '5px 9px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}
        >
          <Cloud size={13} color={user ? '#10b981' : '#64748b'} /> {isSavingCloud ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Center: CAD Manipulation Controls & Wire Toolbar Grouped */}
      <div role="toolbar" aria-label="Editor Toolbar" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        
        {/* Search Group */}
        <div role="group" aria-label="Search">
          <button
            onClick={onOpenCommandPalette}
            className="btn btn-secondary"
            title="Search commands and components (⌘K)"
            aria-label="Search commands"
          >
            <Search size={14} color="#475569" /> <span style={{ fontSize: 11, color: '#0f172a' }}>Search (⌘K)</span>
          </button>
        </div>

        <div style={{ height: 20, width: 1, backgroundColor: '#e2e8f0' }} aria-hidden="true" />

        {/* Object Manipulation Group */}
        <div role="group" aria-label="Object Manipulation" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <button
            onClick={onRotateSelected}
            disabled={!hasSelection}
            className="btn btn-secondary"
            title="Rotate Selected (R)"
            aria-label="Rotate component"
            style={{ opacity: hasSelection ? 1 : 0.4 }}
          >
            <RotateCw size={14} color="#475569" /> Rotate
          </button>

          <button
            onClick={onDuplicateSelected}
            disabled={!hasSelection}
            className="btn btn-secondary"
            title="Duplicate Selected (Ctrl+D)"
            aria-label="Duplicate component"
            style={{ opacity: hasSelection ? 1 : 0.4 }}
          >
            <Copy size={14} color="#475569" /> Duplicate
          </button>

          <button
            onClick={onDeleteSelected}
            disabled={!hasSelection}
            className="btn btn-danger"
            title="Delete Selected (Del)"
            aria-label="Delete component"
            style={{ opacity: hasSelection ? 1 : 0.4 }}
          >
            <Trash2 size={14} /> Delete
          </button>

          <button
            onClick={() => {
              if (window.confirm('Clear the entire workspace?')) onClearCanvas();
            }}
            className="btn btn-secondary"
            title="Clear Canvas"
            aria-label="Clear Canvas"
          >
            <Eraser size={14} color="#475569" /> <span>Clear</span>
          </button>
        </div>

        <div style={{ height: 20, width: 1, backgroundColor: '#e2e8f0' }} aria-hidden="true" />

        {/* History Group */}
        <div role="group" aria-label="History" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <button onClick={onUndo} className="btn btn-icon" title="Undo (Ctrl+Z)" aria-label="Undo"><Undo2 size={14} color="#475569" /></button>
          <button onClick={onRedo} className="btn btn-icon" title="Redo (Ctrl+Y)" aria-label="Redo"><Redo2 size={14} color="#475569" /></button>
        </div>

        <div style={{ height: 20, width: 1, backgroundColor: '#e2e8f0' }} aria-hidden="true" />

        {/* Wiring Group */}
        <div role="group" aria-label="Wiring Controls" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {wiringActive && (
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                backgroundColor: '#059669', color: '#ffffff',
                padding: '4px 10px', borderRadius: 20,
                fontSize: 11, fontWeight: 700,
                cursor: 'pointer',
              }}
              onClick={onCancelWiring}
              title="Click or press Esc to cancel wiring"
            >
              <Zap size={12} fill="#ffffff" /> Wiring Mode <X size={12} />
            </div>
          )}

          {/* Wire Color Palette */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, backgroundColor: '#f8fafc', padding: '4px 8px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginRight: 2 }}>Wire:</span>
            {WIRE_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onColorChange(c.id)}
                title={c.name}
                aria-label={`Select ${c.name} wire color`}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: c.hex,
                  border: selectedColor === c.id ? '2px solid #0f172a' : '1px solid rgba(0,0,0,0.15)',
                  boxShadow: selectedColor === c.id ? `0 0 4px ${c.hex}` : 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                }}
              />
            ))}
          </div>

          {/* Wire Type Selector */}
          <select
            value={selectedWireType}
            onChange={(e) => onWireTypeChange(e.target.value as WireType)}
            aria-label="Select Wire Type"
            style={{ fontSize: 11, padding: '5px 8px', borderRadius: 6, border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: 600, outline: 'none' }}
          >
            <option value="normal">Normal Wire</option>
            <option value="hookup">Hookup Wire</option>
            <option value="alligator">Alligator Wire</option>
          </select>
        </div>
      </div>

      {/* Right: Mode Switcher, Tool Modals & Primary Run Simulation */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        
        {/* Learn Courses Button */}
        <button
          onClick={onOpenLearning}
          className="btn btn-secondary"
          title="Interactive Tutorials & Courses"
          aria-label="Learn Courses"
        >
          <BookOpen size={14} color="#475569" /> Learn
        </button>

        {/* BOM Exporter Button */}
        <button onClick={onOpenBOM} className="btn btn-secondary" title="Bill of Materials" aria-label="Bill of Materials">
          <FileSpreadsheet size={14} color="#475569" /> BOM
        </button>

        {/* PCB Layout Button */}
        <button
          onClick={onOpenPCB}
          className="btn btn-secondary btn-toggle"
          title="PCB Layout"
          aria-label="PCB Layout"
        >
          <Cpu size={14} color="#2563eb" /> PCB
        </button>

        {/* Export JSON */}
        <button onClick={onSaveFile} className="btn btn-icon" title="Export circuit as JSON file" aria-label="Export circuit JSON">
          <Download size={14} color="#475569" />
        </button>

        {/* Import JSON */}
        <button onClick={() => fileInputRef.current?.click()} className="btn btn-icon" title="Import circuit from JSON file" aria-label="Import circuit JSON">
          <Upload size={14} color="#475569" />
        </button>
        <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={onLoadFile} />

        {/* Shortcuts */}
        <button onClick={onOpenShortcuts} className="btn btn-icon" title="Shortcuts (?)" aria-label="Keyboard Shortcuts">
          <Keyboard size={14} color="#475569" />
        </button>

        <div style={{ height: 20, width: 1, backgroundColor: '#e2e8f0' }} aria-hidden="true" />

        {/* Code Drawer Toggle */}
        <button
          onClick={onToggleCode}
          className={`btn btn-toggle ${showCode ? 'active' : ''}`}
          aria-pressed={showCode}
          title="Toggle Code Editor"
        >
          <Code2 size={14} /> {showCode ? 'Code (Open)' : 'Code Editor'}
        </button>

        {/* Component Drawer Toggle */}
        <button
          onClick={onToggleDrawer}
          className={`btn btn-toggle ${showDrawer ? 'active' : ''}`}
          aria-expanded={showDrawer}
          title="Toggle Components Drawer"
        >
          <Package size={14} /> Components
        </button>

        {/* Start / Stop Simulation Precision Light Control Button */}
        <button
          onClick={onToggleSimulation}
          className={isRunning ? 'btn btn-danger' : 'btn btn-primary'}
          style={{
            padding: '6px 14px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {isRunning ? (
            <><Square size={13} fill="#e11d48" /> Stop Simulation</>
          ) : (
            <><Play size={13} fill="#ffffff" /> Run Simulation</>
          )}
        </button>

        <div style={{ height: 20, width: 1, backgroundColor: '#e2e8f0' }} aria-hidden="true" />

        {/* User Account Pill or Sign In Button */}
        {user ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="btn btn-secondary"
              style={{
                padding: '4px 10px 4px 6px',
                borderRadius: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontSize: 11,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.displayName}
              </span>
              <ChevronDown size={12} color="#64748b" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 110 }}
                  onClick={() => setShowUserMenu(false)}
                />
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '110%',
                    width: 220,
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    zIndex: 120,
                    overflow: 'hidden',
                    padding: '6px 0',
                  }}
                >
                  <div style={{ padding: '8px 14px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{user.displayName}</div>
                    <div style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.email || user.phoneNumber}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenProjects();
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 14px',
                      border: 'none',
                      background: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      color: '#334155',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <FolderOpen size={14} color="#2563eb" /> Recent Circuits
                  </button>

                  {onNavigatePrivacy && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigatePrivacy();
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 14px',
                        border: 'none',
                        background: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 13,
                        color: '#334155',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <BookOpen size={14} color="#0ea5e9" /> Privacy Policy
                    </button>
                  )}

                  {onNavigateTerms && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigateTerms();
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 14px',
                        border: 'none',
                        background: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 13,
                        color: '#334155',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <FileSpreadsheet size={14} color="#8b5cf6" /> Terms & Conditions
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUserMenu(false);
                      onSignOut();
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 14px',
                      border: 'none',
                      background: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      color: '#ef4444',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      borderTop: '1px solid #f1f5f9',
                    }}
                  >
                    <LogOut size={14} color="#ef4444" /> Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="btn btn-primary"
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <User size={13} /> Sign In
          </button>
        )}

      </div>
    </header>
  );
};
