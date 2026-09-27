import React, { useState } from 'react';
import { X, Search, Zap } from 'lucide-react';
import { COMPONENT_CATALOG } from '../catalog';
import { ComponentCard } from './ComponentCard';
import './component-library.css';

interface ComponentLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectComponent: (type: string) => void;
}

const CATEGORY_ORDER: { title: string; class: string; icon: string }[] = [
  { title: 'Microcontrollers & Wireless Modules', class: 'section-blue', icon: '🧠' },
  { title: 'Solderless Breadboards', class: 'section-green', icon: '🔌' },
  { title: 'Sensors', class: 'section-orange', icon: '📡' },
  { title: 'Actuators & Displays', class: 'section-pink', icon: '📢' },
  { title: 'Basic Passives', class: 'section-purple', icon: '💡' },
  { title: 'Power & Relays', class: 'section-mint', icon: '⚡' },
];

export const ComponentLibraryModal: React.FC<ComponentLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectComponent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredCatalog = COMPONENT_CATALOG.filter((comp) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      comp.name.toLowerCase().includes(q) ||
      comp.description.toLowerCase().includes(q) ||
      comp.type.toLowerCase().includes(q) ||
      comp.category.toLowerCase().includes(q)
    );
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1400,
          maxHeight: '90vh',
          backgroundColor: '#f8fafc',
          borderRadius: 20,
          border: '1px solid #cbd5e1',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="library-header" style={{ padding: '20px 28px', marginBottom: 0 }}>
          <div>
            <h1>
              <Zap size={22} color="#2563eb" /> VoltFlow Component Library
            </h1>
            <p>Select any technical component to add it directly to your circuit workspace.</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: 280 }}>
              <Search size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: 10 }} />
              <input
                type="text"
                placeholder="Search components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: 20,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: 13,
                  outline: 'none',
                  color: '#0f172a',
                }}
              />
            </div>

            <div className="component-count">{COMPONENT_CATALOG.length} Components</div>

            <button
              onClick={onClose}
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Library Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 28px' }}>
          <div className="library-sections">
            {CATEGORY_ORDER.map((cat) => {
              const categoryComps = filteredCatalog.filter((c) => c.category === cat.title);
              if (categoryComps.length === 0) return null;

              return (
                <section key={cat.title} className={`library-section ${cat.class}`}>
                  <div className="section-title">
                    <h2>
                      {cat.icon} {cat.title}
                    </h2>
                    <span>{categoryComps.length}</span>
                  </div>

                  <div className="component-grid">
                    {categoryComps.map((comp) => (
                      <ComponentCard
                        key={comp.type}
                        component={comp}
                        onSelect={(type) => {
                          onSelectComponent(type);
                          onClose();
                        }}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
