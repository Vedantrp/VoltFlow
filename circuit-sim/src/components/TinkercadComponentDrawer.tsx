import React, { useState } from 'react';
import { Package, X, Search, CheckCircle2, Star } from 'lucide-react';
import { COMPONENT_CATALOG } from '../catalog';
import type { ComponentDefinition } from '../types';
import type { StandardCategory } from '../core/componentDefinition';
import { STANDARD_CATEGORIES } from '../core/componentDefinition';
import { ComponentCard } from './ComponentCard';
import { ComponentValidatorModal } from './ComponentValidatorModal';

interface TinkercadComponentDrawerProps {
  onAddComponent: (type: string) => void;
  onClose: () => void;
}

const FAVORITES_STORAGE_KEY = 'voltflow_component_favorites';

export const TinkercadComponentDrawer: React.FC<TinkercadComponentDrawerProps> = ({
  onAddComponent,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<StandardCategory | 'All' | 'Favorites'>('All');
  const [isValidatorOpen, setIsValidatorOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['arduino-uno', 'led', 'resistor', 'breadboard-half', 'pushbutton', 'potentiometer'];
    } catch {
      return ['arduino-uno', 'led', 'resistor', 'breadboard-half', 'pushbutton', 'potentiometer'];
    }
  });

  const toggleFavorite = (type: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type];
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const query = searchQuery.trim().toLowerCase();

  const filteredComponents = COMPONENT_CATALOG.filter((comp) => {
    const matchesSearch =
      !query ||
      comp.name.toLowerCase().includes(query) ||
      (comp.description && comp.description.toLowerCase().includes(query)) ||
      comp.type.toLowerCase().includes(query) ||
      (comp.category && comp.category.toLowerCase().includes(query)) ||
      (comp.metadata?.shortModel && comp.metadata.shortModel.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    if (selectedCategory === 'Favorites') {
      return favorites.includes(comp.type);
    }

    if (selectedCategory === 'All') {
      return true;
    }

    if (comp.category === selectedCategory) return true;

    // Category Aliases / Fallbacks for seamless component discovery
    if (selectedCategory === 'Displays') {
      return ['ssd1306', 'lcd1602', 'lcd1602-i2c', '7segment', '7segment-4digit', 'led', 'rgb-led', 'led-ring', 'neopixel-matrix', 'max7219'].includes(comp.type) ||
        comp.name.toLowerCase().includes('display') || comp.name.toLowerCase().includes('oled') || comp.name.toLowerCase().includes('lcd') || comp.name.toLowerCase().includes('led');
    }
    if (selectedCategory === 'Passive') {
      return comp.category === 'Basic' || ['resistor', 'potentiometer', 'capacitor-electrolytic', 'capacitor-ceramic', 'diode-1n4007', 'zener-diode', 'transistor-npn', 'inductor'].includes(comp.type);
    }
    if (selectedCategory === 'Input') {
      return comp.category === 'Basic' || ['pushbutton', 'slide-switch', 'dip-switch-4', 'rotary-encoder', 'keypad-4x4', 'analog-joystick'].includes(comp.type);
    }
    if (selectedCategory === 'Actuators') {
      return ['servo', 'stepper-motor', 'dc-motor', 'relay-5v', 'relay-5v-2ch', 'uln2003a', 'buzzer', 'piezo-buzzer'].includes(comp.type);
    }

    return false;
  });

  // Group by category sections when viewing All
  const groupedSections: { title: string; items: ComponentDefinition[] }[] = [];

  if (selectedCategory === 'All' && !query) {
    for (const cat of STANDARD_CATEGORIES) {
      const items = filteredComponents.filter((c) => c.category === cat);
      if (items.length > 0) {
        groupedSections.push({ title: cat, items });
      }
    }
  } else {
    groupedSections.push({
      title: selectedCategory === 'Favorites' ? '⭐ Favorite Components' : selectedCategory === 'All' ? 'Search Results' : selectedCategory,
      items: filteredComponents,
    });
  }

  return (
    <>
      <aside
        className="drawer-panel"
        style={{
          width: 390,
          right: 0,
          backgroundColor: '#f8fafc',
          borderLeft: '1px solid #cbd5e1',
          color: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 40,
        }}
      >
        {/* Mobile Grab Handle */}
        <div style={{ padding: '6px 0', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#cbd5e1' }} />
        </div>

        {/* Drawer Header */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Package size={18} color="#0284c7" />
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
              Components ({filteredComponents.length})
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => setIsValidatorOpen(true)}
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#16a34a',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 5,
              }}
              title="Open Component Library Diagnostics & Validation Report"
            >
              <CheckCircle2 size={12} />
              Validate
            </button>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Category Tabs & Search Bar */}
        <div style={{ padding: '10px 14px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search components (e.g., Uno, DHT11, HC-05, Servo)..."
              aria-label="Search components"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px 7px 30px',
                borderRadius: 6,
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontSize: 12,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
            <button
              onClick={() => setSelectedCategory('All')}
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                border: selectedCategory === 'All' ? '1px solid #0284c7' : '1px solid #e2e8f0',
                backgroundColor: selectedCategory === 'All' ? '#e0f2fe' : '#ffffff',
                color: selectedCategory === 'All' ? '#0284c7' : '#475569',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              All
            </button>
            <button
              onClick={() => setSelectedCategory('Favorites')}
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                border: selectedCategory === 'Favorites' ? '1px solid #f59e0b' : '1px solid #e2e8f0',
                backgroundColor: selectedCategory === 'Favorites' ? '#fef3c7' : '#ffffff',
                color: selectedCategory === 'Favorites' ? '#b45309' : '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                whiteSpace: 'nowrap',
              }}
            >
              <Star size={10} fill={selectedCategory === 'Favorites' ? '#b45309' : 'none'} />
              Favorites ({favorites.length})
            </button>
            {STANDARD_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  border: selectedCategory === cat ? '1px solid #0284c7' : '1px solid #e2e8f0',
                  backgroundColor: selectedCategory === cat ? '#e0f2fe' : '#ffffff',
                  color: selectedCategory === cat ? '#0284c7' : '#475569',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Component Cards Grid: 3-Column Layout */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 14px',
            backgroundColor: '#f1f5f9',
          }}
        >
          {groupedSections.map((sec, idx) => (
            <div key={sec.title + idx} style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#0369a1',
                  marginBottom: 8,
                  paddingLeft: 2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>{sec.title}</span>
                <span style={{ fontSize: 11, color: '#64748b' }}>{sec.items.length}</span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 8,
                }}
              >
                {sec.items.map((comp) => (
                  <ComponentCard
                    key={comp.type}
                    component={comp}
                    onSelect={(type) => onAddComponent(type)}
                    isFavorite={favorites.includes(comp.type)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Component Library Diagnostics & Validation Modal */}
      {isValidatorOpen && (
        <ComponentValidatorModal onClose={() => setIsValidatorOpen(false)} />
      )}
    </>
  );
};
