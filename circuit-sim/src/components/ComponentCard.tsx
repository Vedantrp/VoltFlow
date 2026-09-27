import React from 'react';
import type { ComponentDefinition } from '../types';
import { WokwiElement } from './WokwiElement';
import { Breadboard2D } from './Breadboard2D';
import { hasModuleVisual, ModuleVisual } from './ModuleVisual';
import { ComponentRenderer, hasCustom2DRenderer } from './rendering/ComponentRenderer';
import './component-card.css';

interface ComponentCardProps {
  component: ComponentDefinition;
  onSelect?: (type: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (type: string, e: React.MouseEvent) => void;
}

export const ComponentCard: React.FC<ComponentCardProps> = ({
  component,
  onSelect,
  isFavorite,
  onToggleFavorite,
}) => {
  const targetW = component.width || 80;
  const targetH = component.height || 60;
  // Fit component within 76x50 preview box
  const scale = Math.min(1, 76 / targetW, 50 / targetH);

  const mockComp = {
    id: `card_preview_${component.type}`,
    type: component.type,
    name: component.name,
    x: 0,
    y: 0,
    rotation: 0,
    props: { ...component.defaultProps },
    state: {},
  };

  const shortModel = component.metadata?.shortModel || (component.type.length > 14 ? component.type.replace(/-/g, ' ') : component.type);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type: component.type }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <button
      className="component-card"
      onClick={() => onSelect?.(component.type)}
      onDragStart={handleDragStart}
      draggable
      title={`${component.name} (${shortModel}) - ${component.description || ''}`}
      type="button"
    >
      <div className="component-card__header">
        <span className="component-card__badge">{component.category || 'Passive'}</span>
        {onToggleFavorite && (
          <span
            className={`component-card__fav ${isFavorite ? 'is-fav' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(component.type, e);
            }}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            ★
          </span>
        )}
      </div>

      <div className="component-card__visual">
        <div
          className="component-card__preview-wrapper"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          {component.type.startsWith('breadboard-') && component.type !== 'breadboard-power-supply' ? (
            <div style={{ transform: 'scale(0.52)', transformOrigin: 'center center' }}>
              <Breadboard2D
                type={component.type as 'breadboard-mini' | 'breadboard-half' | 'breadboard-full'}
                width={component.width}
                height={component.height}
              />
            </div>
          ) : hasCustom2DRenderer(component.type) ? (
            <div
              style={{
                width: component.width,
                height: component.height,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <ComponentRenderer
                comp={mockComp}
                compDef={component}
                isSelected={false}
                isRunning={false}
              />
            </div>
          ) : hasModuleVisual(component.type) ? (
            <div style={{ width: component.width, height: component.height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ModuleVisual type={component.type} />
            </div>
          ) : component.wokwiTag ? (
            <div style={{ width: component.width, height: component.height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <WokwiElement
                tag={component.wokwiTag}
                props={component.defaultProps || {}}
                style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
              />
            </div>
          ) : (
            <div style={{ color: '#38bdf8', fontSize: 11, fontWeight: 700 }}>{component.name}</div>
          )}
        </div>
      </div>

      <div className="component-card__info">
        <div className="component-card__name">{component.name}</div>
        <div className="component-card__model">{shortModel}</div>
      </div>
    </button>
  );
};
