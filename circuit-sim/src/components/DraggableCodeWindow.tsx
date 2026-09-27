import React, { useState, useRef, useEffect } from 'react';
import { X, Maximize2, Minimize2, Move, Code2 } from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import { SerialMonitor } from './SerialMonitor';
import { ErrorBoundary } from './ErrorBoundary';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  onChangeCode: (code: string) => void;
  onCompileRun: () => void;
  onStop: () => void;
  isRunning: boolean;
  isCompiling: boolean;
  compileError: string | null;
  serialText: string;
  onClearSerial: () => void;
}

export function DraggableCodeWindow({
  isOpen,
  onClose,
  code,
  onChangeCode,
  onCompileRun,
  onStop,
  isRunning,
  isCompiling,
  compileError,
  serialText,
  onClearSerial,
}: Props) {
  const [position, setPosition] = useState({ x: Math.max(20, window.innerWidth - 500), y: 70 });
  const [size, setSize] = useState({ width: 480, height: 560 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingDir, setResizingDir] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; width: number; height: number; posX: number; posY: number } | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  // Serial Monitor Internal Resizing & Collapse state inside code area
  const [serialHeight, setSerialHeight] = useState(200);
  const [isSerialCollapsed, setIsSerialCollapsed] = useState(false);
  const [isResizingSerial, setIsResizingSerial] = useState(false);
  const [serialResizeStart, setSerialResizeStart] = useState<{ y: number; startHeight: number } | null>(null);

  const windowRef = useRef<HTMLDivElement>(null);

  // Mouse Drag Handlers for Header
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('select') || target.closest('input')) return;

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  // Handle 8-directional window resizing start
  const handleResizeMouseDown = (dir: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingDir(dir);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
      posX: position.x,
      posY: position.y,
    });
  };

  // Handle Serial Monitor Splitter resizing start inside code window
  const handleSerialResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizingSerial(true);
    setSerialResizeStart({
      y: e.clientY,
      startHeight: serialHeight,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(window.innerWidth - 100, e.clientX - dragOffset.x));
        const newY = Math.max(0, Math.min(window.innerHeight - 80, e.clientY - dragOffset.y));
        setPosition({ x: newX, y: newY });
        return;
      }

      if (isResizingSerial && serialResizeStart) {
        const deltaY = e.clientY - serialResizeStart.y;
        const containerH = windowRef.current?.clientHeight || size.height;
        const maxH = Math.max(80, containerH - 140);
        const newH = Math.min(maxH, Math.max(40, serialResizeStart.startHeight - deltaY));
        setSerialHeight(newH);
        if (newH > 40 && isSerialCollapsed) {
          setIsSerialCollapsed(false);
        }
        return;
      }

      if (resizingDir && resizeStart) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;
        let newX = resizeStart.posX;
        let newY = resizeStart.posY;

        const minW = 340;
        const minH = 280;
        const maxW = window.innerWidth - 40;
        const maxH = window.innerHeight - 60;

        // Horizontal sizing
        if (resizingDir.includes('e')) {
          newWidth = Math.min(maxW, Math.max(minW, resizeStart.width + deltaX));
        }
        if (resizingDir.includes('w')) {
          const possibleW = resizeStart.width - deltaX;
          if (possibleW >= minW && possibleW <= maxW) {
            newWidth = possibleW;
            newX = resizeStart.posX + deltaX;
          }
        }

        // Vertical sizing
        if (resizingDir.includes('s')) {
          newHeight = Math.min(maxH, Math.max(minH, resizeStart.height + deltaY));
        }
        if (resizingDir.includes('n')) {
          const possibleH = resizeStart.height - deltaY;
          if (possibleH >= minH && possibleH <= maxH) {
            newHeight = possibleH;
            newY = resizeStart.posY + deltaY;
          }
        }

        setSize({ width: newWidth, height: newHeight });
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setResizingDir(null);
      setResizeStart(null);
      setIsResizingSerial(false);
      setSerialResizeStart(null);
    };

    if (isDragging || resizingDir || isResizingSerial) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, resizingDir, resizeStart, isResizingSerial, serialResizeStart]);

  if (!isOpen) return null;

  return (
    <div
      ref={windowRef}
      style={{
        position: 'fixed',
        left: isMaximized ? 0 : position.x,
        top: isMaximized ? 56 : position.y,
        width: isMaximized ? '100vw' : size.width,
        height: isMaximized ? 'calc(100vh - 56px)' : size.height,
        minWidth: 340,
        maxWidth: isMaximized ? '100vw' : '90vw',
        minHeight: 280,
        maxHeight: isMaximized ? 'calc(100vh - 56px)' : '90vh',
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: isMaximized ? 0 : 12,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        zIndex: 900,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* 8-Directional Perimeter Resize Handles */}
      {!isMaximized && (
        <>
          {/* Top Edge (North) */}
          <div
            onMouseDown={handleResizeMouseDown('n')}
            style={{ position: 'absolute', top: -3, left: 10, right: 10, height: 8, cursor: 'ns-resize', zIndex: 910 }}
          />
          {/* Bottom Edge (South) */}
          <div
            onMouseDown={handleResizeMouseDown('s')}
            style={{ position: 'absolute', bottom: -3, left: 10, right: 10, height: 8, cursor: 'ns-resize', zIndex: 910 }}
          />
          {/* Left Edge (West) */}
          <div
            onMouseDown={handleResizeMouseDown('w')}
            style={{ position: 'absolute', left: -3, top: 10, bottom: 10, width: 8, cursor: 'ew-resize', zIndex: 910 }}
          />
          {/* Right Edge (East) */}
          <div
            onMouseDown={handleResizeMouseDown('e')}
            style={{ position: 'absolute', right: -3, top: 10, bottom: 10, width: 8, cursor: 'ew-resize', zIndex: 910 }}
          />
          {/* Top-Left Corner (NW) */}
          <div
            onMouseDown={handleResizeMouseDown('nw')}
            style={{ position: 'absolute', top: -4, left: -4, width: 14, height: 14, cursor: 'nwse-resize', zIndex: 920 }}
          />
          {/* Top-Right Corner (NE) */}
          <div
            onMouseDown={handleResizeMouseDown('ne')}
            style={{ position: 'absolute', top: -4, right: -4, width: 14, height: 14, cursor: 'nesw-resize', zIndex: 920 }}
          />
          {/* Bottom-Left Corner (SW) */}
          <div
            onMouseDown={handleResizeMouseDown('sw')}
            style={{ position: 'absolute', bottom: -4, left: -4, width: 14, height: 14, cursor: 'nesw-resize', zIndex: 920 }}
          />
          {/* Bottom-Right Corner (SE) */}
          <div
            onMouseDown={handleResizeMouseDown('se')}
            style={{ position: 'absolute', bottom: -4, right: -4, width: 14, height: 14, cursor: 'nwse-resize', zIndex: 920 }}
          />
        </>
      )}

      {/* Draggable Header Bar */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          padding: '8px 14px',
          backgroundColor: '#1e293b',
          borderBottom: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Move size={14} color="#64748b" />
          <Code2 size={15} color="#38bdf8" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>
            Arduino C++ Code & Serial Window
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => setIsMaximized((prev) => !prev)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 4,
            }}
            title={isMaximized ? 'Restore window' : 'Maximize window'}
          >
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 4,
              fontWeight: 700,
            }}
            title="Close Code Window"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Code Editor Body & Resizable Internal Serial Monitor */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, minHeight: 120, overflow: 'hidden' }}>
          <ErrorBoundary fallbackTitle="Code Editor Error">
            <CodeEditor
              code={code}
              onChange={onChangeCode}
              onCompileRun={onCompileRun}
              onStop={onStop}
              isRunning={isRunning}
              isCompiling={isCompiling}
              compileError={compileError}
            />
          </ErrorBoundary>
        </div>

        <ErrorBoundary fallbackTitle="Serial Monitor Error">
          <SerialMonitor
            text={serialText}
            onClear={onClearSerial}
            height={serialHeight}
            onSplitterMouseDown={handleSerialResizeMouseDown}
            isCollapsed={isSerialCollapsed}
            onToggleCollapse={() => setIsSerialCollapsed((prev) => !prev)}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
}
