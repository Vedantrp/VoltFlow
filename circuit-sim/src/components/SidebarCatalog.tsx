import React, { useState } from 'react';
import { CATEGORIES, COMPONENT_CATALOG } from '../catalog';
import type { ComponentCategory } from '../types';

interface SidebarCatalogProps {
  onAddComponent: (type: string) => void;
}

export const SidebarCatalog: React.FC<SidebarCatalogProps> = ({ onAddComponent }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | 'All'>('All');
  const [activeTab, setActiveTab] = useState<'All' | 'Favorites'>('All');
  const [favorites, setFavorites] = useState<string[]>(['arduino-uno', 'led', 'resistor']);

  const toggleFavorite = (type: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(type) ? prev.filter((id) => id !== type) : [...prev, type]
    );
  };

  const filteredComponents = COMPONENT_CATALOG.filter((comp) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      comp.name.toLowerCase().includes(q) ||
      comp.description.toLowerCase().includes(q) ||
      comp.category.toLowerCase().includes(q) ||
      comp.type.toLowerCase().includes(q);

    const matchesCategory = selectedCategory === 'All' || q !== '' || comp.category === selectedCategory;

    const matchesTab =
      activeTab === 'All' ||
      (activeTab === 'Favorites' && favorites.includes(comp.type));

    return matchesSearch && matchesCategory && matchesTab;
  });

  return (
    <aside
      className="sidebar-catalog glass-panel"
      style={{
        width: 320,
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        zIndex: 20,
      }}
    >
      {/* Search Header */}
      <div className="sidebar-header" style={{ padding: 16, borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 className="mono-label" style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', display: 'flex', alignItems: 'center', gap: 6 }}>
            ⚡ COMPONENT CATALOG
          </h2>
          <span style={{ fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono' }}>
            {COMPONENT_CATALOG.length} UNITS
          </span>
        </div>

        <input
          type="text"
          placeholder="SEARCH 100,000+ COMPONENTS..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 6,
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            color: '#0f172a',
            fontFamily: 'JetBrains Mono',
            fontSize: 11,
            outline: 'none',
          }}
        />

        {/* Catalog Tabs */}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          {(['All', 'Favorites'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="btn"
              style={{
                flex: 1,
                padding: '4px 8px',
                fontSize: 10,
                justifyContent: 'center',
                backgroundColor: activeTab === tab ? '#0f172a' : '#ffffff',
                color: activeTab === tab ? '#ffffff' : '#475569',
                borderColor: activeTab === tab ? '#0f172a' : '#cbd5e1',
              }}
            >
              {tab === 'Favorites' ? `⭐ FAV (${favorites.length})` : '📦 ALL'}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills horizontal scroll */}
      <div
        className="category-scroll"
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          flexShrink: 0,
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat === 'All' ? 'All' : cat)}
            style={{
              padding: '4px 10px',
              borderRadius: 12,
              backgroundColor: selectedCategory === cat || (cat === 'All' && selectedCategory === 'All') ? '#2563eb' : '#f1f5f9',
              color: selectedCategory === cat || (cat === 'All' && selectedCategory === 'All') ? '#ffffff' : '#475569',
              fontSize: 10,
              fontFamily: 'JetBrains Mono',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {cat === 'All' ? '📦 ALL' : cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Component Cards List */}
      <div className="components-list" style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredComponents.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 12, fontFamily: 'JetBrains Mono' }}>
            NO MATCHING COMPONENTS
          </div>
        ) : (
          filteredComponents.map((comp) => {
            const isFav = favorites.includes(comp.type);
            return (
              <div
                key={comp.type}
                className="clean-card"
                onClick={() => onAddComponent(comp.type)}
                style={{
                  padding: 12,
                  borderRadius: 6,
                  cursor: 'pointer',
                  position: 'relative',
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className="mono-label" style={{ color: '#2563eb', fontSize: 10 }}>
                    {comp.category}
                  </span>
                  <button
                    onClick={(e) => toggleFavorite(comp.type, e)}
                    style={{ background: 'none', border: 'none', color: isFav ? '#d97706' : '#94a3b8', cursor: 'pointer', fontSize: 14 }}
                  >
                    ★
                  </button>
                </div>

                <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginTop: 4 }}>
                  {comp.name}
                </div>
                <div style={{ fontSize: 11, color: '#475569', marginTop: 4, lineHeight: 1.3 }}>
                  {comp.description}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, fontSize: 10, fontFamily: 'JetBrains Mono' }}>
                  <span style={{ color: '#94a3b8' }}>{comp.footprint}</span>
                  <span style={{ color: '#059669', fontWeight: 700 }}>
                    ₹{comp.estimatedCost * 85 < 5 ? (comp.estimatedCost * 85).toFixed(2) : Math.round(comp.estimatedCost * 85)} <span style={{ color: '#94a3b8', fontWeight: 500, fontSize: 9 }}>(${comp.estimatedCost.toFixed(2)})</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
