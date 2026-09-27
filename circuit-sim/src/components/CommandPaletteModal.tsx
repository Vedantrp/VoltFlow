import React, { useState, useEffect } from 'react';
import {
  Search,
  Zap,
  Code2,
  FileSpreadsheet,
  Cpu,
  Eraser,
  Play,
  RotateCw,
  X,
  Keyboard
} from 'lucide-react';
import { COMPONENT_CATALOG } from '../catalog';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectComponent: (type: string) => void;
  onToggleSimulation: () => void;
  onOpenCode: () => void;
  onOpenBOM: () => void;
  onOpenPCB: () => void;
  onOpenShortcuts: () => void;
  onClearCanvas: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectComponent,
  onToggleSimulation,
  onOpenCode,
  onOpenBOM,
  onOpenPCB,
  onOpenShortcuts,
  onClearCanvas,
  onUndo,
  onRedo,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setQuery('');
    setSelectedIndex(0);
  }, [isOpen]);

  if (!isOpen) return null;

  const quickActions = [
    { id: 'sim', title: 'Start / Stop Simulation', category: 'Actions', icon: <Play size={16} color="#10B981" />, action: onToggleSimulation, badge: 'Space' },
    { id: 'code', title: 'Open C++ Code Editor & Serial Monitor', category: 'Actions', icon: <Code2 size={16} color="#2563EB" />, action: onOpenCode, badge: 'C' },
    { id: 'bom', title: 'Open Bill of Materials (BOM) & Inventory', category: 'Tools', icon: <FileSpreadsheet size={16} color="#10B981" />, action: onOpenBOM, badge: 'B' },
    { id: 'pcb', title: 'Export PCB Gerber & Circuit Layout', category: 'Tools', icon: <Cpu size={16} color="#F59E0B" />, action: onOpenPCB, badge: 'P' },
    { id: 'shortcuts', title: 'View All Keyboard Shortcuts Cheat Sheet', category: 'Help', icon: <Keyboard size={16} color="#2563EB" />, action: onOpenShortcuts, badge: '?' },
    { id: 'undo', title: 'Undo Last Canvas Action', category: 'Edit', icon: <RotateCw size={16} color="#6B7280" />, action: onUndo, badge: '⌘Z' },
    { id: 'redo', title: 'Redo Canvas Action', category: 'Edit', icon: <RotateCw size={16} color="#6B7280" />, action: onRedo, badge: '⌘Y' },
    { id: 'clear', title: 'Clear Entire Workspace Canvas', category: 'Edit', icon: <Eraser size={16} color="#EF4444" />, action: onClearCanvas, badge: 'Del All' },
  ];

  const componentItems = COMPONENT_CATALOG.map((c) => ({
    id: `comp-${c.type}`,
    title: `Add Component: ${c.name}`,
    category: 'Components',
    icon: <Zap size={16} color="#2563EB" />,
    action: () => onSelectComponent(c.type),
    badge: c.category,
  }));

  const allItems = [...quickActions, ...componentItems].filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, allItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % Math.max(1, allItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        zIndex: 100,
        animation: 'fadeIn 0.15s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 620,
          backgroundColor: '#0F172A',
          border: '1px solid #334155',
          borderRadius: 16,
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #1E293B', gap: 12 }}>
          <Search size={20} color="#06B6D4" />
          <input
            type="text"
            placeholder="Type a command or search components... (e.g. 'Arduino', 'BOM', '3D')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 15,
              fontWeight: 500,
              color: '#F8FAFC',
            }}
          />
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: 360, overflowY: 'auto', padding: 8 }}>
          {allItems.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#6B7280', fontSize: 13 }}>
              No matching commands or components found for "{query}"
            </div>
          ) : (
            allItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 10,
                    backgroundColor: isSelected ? '#1E293B' : 'transparent',
                    border: isSelected ? '1px solid #334155' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ padding: 6, borderRadius: 8, backgroundColor: isSelected ? '#2563EB22' : '#1E293B' }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: isSelected ? '#F8FAFC' : '#CBD5E1' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: 11, color: '#6B7280' }}>{item.category}</div>
                    </div>
                  </div>
                  {item.badge && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 6,
                        backgroundColor: '#1E293B',
                        color: '#94A3B8',
                        border: '1px solid #334155',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div
          style={{
            padding: '10px 18px',
            backgroundColor: '#0F172A',
            borderTop: '1px solid #1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
            color: '#6B7280',
          }}
        >
          <div style={{ display: 'flex', gap: 12 }}>
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <span>Press <strong style={{ color: '#06B6D4' }}>⌘K</strong> anytime</span>
        </div>
      </div>
    </div>
  );
};
