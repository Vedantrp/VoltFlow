import React, { useState, useMemo } from 'react';
import {
  Cpu,
  X,
  Download,
  Layers,
  Circle,
  Zap,
  AlignJustify,
  Maximize2,
  Settings2,
  FileSpreadsheet,
  Check,
  Info,
} from 'lucide-react';
import type { PlacedComponent, WireConnection } from '../types';
import { circuitToPCBDocument, validatePCBDocument } from '../pcb/pcbEngine';
import { buildGerberZip } from '../pcb/gerberExporter';
import type { PCBValidationResult } from '../pcb/types';

interface PCBViewModalProps {
  components: PlacedComponent[];
  wires: WireConnection[];
  onClose: () => void;
}

type BoardPreset = 'auto' | '50x50' | '100x80' | 'custom';

export const PCBViewModal: React.FC<PCBViewModalProps> = ({ components, wires, onClose }) => {
  // Layer visibility toggles
  const [showTopCopper, setShowTopCopper] = useState(true);
  const [showBottomCopper, setShowBottomCopper] = useState(false);
  const [showSilkscreen, setShowSilkscreen] = useState(true);
  const [showDrills, setShowDrills] = useState(true);
  const [showOutline, setShowOutline] = useState(true);

  // Board physical dimension controls (in mm)
  const [boardPreset, setBoardPreset] = useState<BoardPreset>('auto');
  const [customWidth, setCustomWidth] = useState<number>(80);
  const [customHeight, setCustomHeight] = useState<number>(60);
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Derive custom board size object
  const customBoardSize = useMemo(() => {
    if (boardPreset === '50x50') return { widthMm: 50, heightMm: 50 };
    if (boardPreset === '100x80') return { widthMm: 100, heightMm: 80 };
    if (boardPreset === 'custom') {
      return {
        widthMm: Math.max(10, customWidth || 50),
        heightMm: Math.max(10, customHeight || 50),
      };
    }
    return undefined; // auto
  }, [boardPreset, customWidth, customHeight]);

  // Generate the decoupled physical PCBDocument with error handling
  const { doc, docError } = useMemo(() => {
    try {
      const pcbDoc = circuitToPCBDocument(components, wires, customBoardSize);
      return { doc: pcbDoc, docError: null };
    } catch (err: any) {
      return { doc: null, docError: err?.message || 'Error generating PCB document' };
    }
  }, [components, wires, customBoardSize]);

  // Run Design Rule Check (DRC)
  const validation: PCBValidationResult | null = useMemo(() => {
    if (!doc) return null;
    return validatePCBDocument(doc);
  }, [doc]);

  // Physical board dimensions
  const boardWidth = doc ? doc.board.width : 50;
  const boardHeight = doc ? doc.board.height : 50;

  // Viewport mapping: Map PCB physical mm coordinates to SVG pixels
  const svgViewportWidth = 680;
  const svgViewportHeight = 420;
  const paddingPx = 35;

  const scale = Math.min(
    (svgViewportWidth - paddingPx * 2) / Math.max(10, boardWidth),
    (svgViewportHeight - paddingPx * 2) / Math.max(10, boardHeight)
  );

  // PCB origin (0,0) is bottom-left in physical mm.
  // In SVG, Y is down. We flip Y and center board in viewport.
  const boardSvgW = boardWidth * scale;
  const boardSvgH = boardHeight * scale;
  const offsetX = (svgViewportWidth - boardSvgW) / 2;
  const offsetY = (svgViewportHeight - boardSvgH) / 2;

  const toSvgX = (xMm: number) => offsetX + xMm * scale;
  const toSvgY = (yMm: number) => offsetY + (boardHeight - yMm) * scale;

  const isExportBlocked = Boolean(
    docError ||
    !doc ||
    components.length === 0 ||
    (validation && !validation.manufacturingCheck.isReadyForFab)
  );

  const handleExport = () => {
    if (isExportBlocked || !doc) return;
    setExporting(true);
    setTimeout(() => {
      try {
        const zipBlob = buildGerberZip(doc);
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `VoltFlow_PCB_${doc.board.width.toFixed(0)}x${doc.board.height.toFixed(0)}mm_${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 4000);
      } catch (err: any) {
        alert(`Export Blocked: ${err.message}`);
      } finally {
        setExporting(false);
      }
    }, 50);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 6, 23, 0.88)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          width: 960,
          maxHeight: '94vh',
          backgroundColor: '#090d16',
          border: '1px solid #10b98144',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(16, 185, 129, 0.15)',
          overflow: 'hidden',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: '#0f172a',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Cpu size={20} color="#10b981" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                VoltFlow PCB Layout Engine
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    letterSpacing: '0.05em',
                  }}
                >
                  PROD v2.0
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                Physical coordinates (mm) &bull; IPC footprints &bull; RS-274X Gerber + Excellon drill package
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.2s',
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Toolbar & Dimension Config */}
        <div
          style={{
            padding: '12px 24px',
            backgroundColor: '#0d131f',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          {/* Layer toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#f59e0b', userSelect: 'none' }}>
              <input type="checkbox" checked={showTopCopper} onChange={(e) => setShowTopCopper(e.target.checked)} />
              <Layers size={13} /> F.Cu (Top Copper)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#60a5fa', userSelect: 'none' }}>
              <input type="checkbox" checked={showBottomCopper} onChange={(e) => setShowBottomCopper(e.target.checked)} />
              <Layers size={13} /> B.Cu (Bottom)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#f8fafc', userSelect: 'none' }}>
              <input type="checkbox" checked={showSilkscreen} onChange={(e) => setShowSilkscreen(e.target.checked)} />
              <AlignJustify size={13} /> Silkscreen (GTO)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#e879f9', userSelect: 'none' }}>
              <input type="checkbox" checked={showDrills} onChange={(e) => setShowDrills(e.target.checked)} />
              <Circle size={13} /> Drill (DRL)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#10b981', userSelect: 'none' }}>
              <input type="checkbox" checked={showOutline} onChange={(e) => setShowOutline(e.target.checked)} />
              <Maximize2 size={13} /> Edge Cut (GKO)
            </label>
          </div>

          {/* Board sizing controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
            <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Settings2 size={13} /> Board Size:
            </span>
            <div style={{ display: 'flex', backgroundColor: '#1e293b', borderRadius: 6, padding: 2, border: '1px solid #334155' }}>
              {(['auto', '50x50', '100x80', 'custom'] as BoardPreset[]).map((preset) => (
                <button
                  key={preset}
                  onClick={() => setBoardPreset(preset)}
                  style={{
                    border: 'none',
                    backgroundColor: boardPreset === preset ? '#10b981' : 'transparent',
                    color: boardPreset === preset ? '#090d16' : '#94a3b8',
                    fontWeight: 600,
                    fontSize: 11,
                    padding: '4px 10px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {preset === 'auto' ? 'Auto-Fit' : preset === '50x50' ? '50×50 mm' : preset === '100x80' ? '100×80 mm' : 'Custom'}
                </button>
              ))}
            </div>

            {boardPreset === 'custom' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="number"
                  min="20"
                  max="500"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(Number(e.target.value))}
                  style={{
                    width: 54,
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    color: '#f8fafc',
                    borderRadius: 4,
                    padding: '3px 6px',
                    fontSize: 11,
                    textAlign: 'center',
                  }}
                  title="Width in mm"
                />
                <span style={{ color: '#64748b' }}>×</span>
                <input
                  type="number"
                  min="20"
                  max="500"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(Number(e.target.value))}
                  style={{
                    width: 54,
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    color: '#f8fafc',
                    borderRadius: 4,
                    padding: '3px 6px',
                    fontSize: 11,
                    textAlign: 'center',
                  }}
                  title="Height in mm"
                />
                <span style={{ color: '#94a3b8', fontSize: 11 }}>mm</span>
              </div>
            )}

            <button
              onClick={handleExport}
              disabled={exporting || isExportBlocked}
              style={{
                padding: '7px 18px',
                borderRadius: 6,
                backgroundColor: exportSuccess
                  ? '#059669'
                  : isExportBlocked
                  ? '#374151'
                  : exporting
                  ? '#064e3b'
                  : '#10b981',
                color: isExportBlocked ? '#9ca3af' : '#090d16',
                fontWeight: 700,
                fontSize: 12,
                border: isExportBlocked ? '1px solid #4b5563' : 'none',
                cursor: isExportBlocked ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                opacity: isExportBlocked ? 0.75 : 1,
                transition: 'all 0.2s',
                boxShadow: isExportBlocked ? 'none' : '0 2px 10px rgba(16, 185, 129, 0.25)',
              }}
            >
              {exportSuccess ? (
                <>
                  <Check size={14} /> ZIP Downloaded!
                </>
              ) : isExportBlocked ? (
                <>
                  <X size={14} /> EXPORT BLOCKED
                </>
              ) : exporting ? (
                <>
                  <Zap size={14} /> Packaging Gerbers...
                </>
              ) : (
                <>
                  <Download size={14} /> Export Gerber ZIP
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Workspace (Preview + DRC Stats) */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* PCB Canvas Preview */}
          <div
            style={{
              flex: 1,
              backgroundColor: '#021e17',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Grid texture */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(circle, rgba(16,185,129,0.12) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                pointerEvents: 'none',
              }}
            />

            {/* Board Frame Container */}
            <div
              style={{
                position: 'relative',
                width: svgViewportWidth,
                height: svgViewportHeight,
                backgroundColor: '#011c15',
                borderRadius: 10,
                border: '1px solid rgba(16,185,129,0.2)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {docError ? (
                <div
                  style={{
                    position: 'absolute',
                    inset: 20,
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid #ef4444',
                    borderRadius: 8,
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f8fafc',
                    textAlign: 'center',
                    gap: 12,
                    zIndex: 10,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ef4444',
                    }}
                  >
                    <X size={24} />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#ef4444' }}>
                    PCB EXPORT BLOCKED
                  </div>
                  <div style={{ fontSize: 13, color: '#cbd5e1', maxWidth: 460, fontFamily: 'monospace' }}>
                    {docError}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    Create or select valid IPC footprints before exporting production Gerbers.
                  </div>
                </div>
              ) : doc ? (
                <svg
                  width={svgViewportWidth}
                  height={svgViewportHeight}
                  style={{ overflow: 'visible', userSelect: 'none' }}
                >
                  {/* Physical PCB Board Rectangle (FR-4 Solder Mask Green) */}
                  <rect
                    x={offsetX}
                    y={offsetY}
                    width={boardSvgW}
                    height={boardSvgH}
                    rx={(doc.board.outline.cornerRadiusMm ?? 2.0) * scale}
                    ry={(doc.board.outline.cornerRadiusMm ?? 2.0) * scale}
                    fill="#064e3b"
                    stroke={showOutline ? '#10b981' : 'transparent'}
                    strokeWidth={2}
                    filter="drop-shadow(0 8px 16px rgba(0,0,0,0.6))"
                  />

                  {/* Physical Dimension Indicators */}
                  <text
                    x={offsetX + boardSvgW / 2}
                    y={offsetY - 8}
                    fill="#10b981"
                    fontSize={11}
                    fontWeight={600}
                    textAnchor="middle"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {boardWidth.toFixed(1)} mm
                  </text>
                  <text
                    x={offsetX - 8}
                    y={offsetY + boardSvgH / 2}
                    fill="#10b981"
                    fontSize={11}
                    fontWeight={600}
                    textAnchor="middle"
                    transform={`rotate(-90 ${offsetX - 8} ${offsetY + boardSvgH / 2})`}
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {boardHeight.toFixed(1)} mm
                  </text>

                  {/* Silkscreen Component Outlines & Designators (GTO) */}
                  {showSilkscreen &&
                    doc.components.map((comp) => {
                      const cx = toSvgX(comp.position.x);
                      const cy = toSvgY(comp.position.y);
                      return (
                        <g key={`silk-${comp.id}`}>
                          <circle cx={cx} cy={cy} r={3} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={0.7} />
                          <text
                            x={cx}
                            y={cy - 8}
                            fill="#ffffff"
                            fontSize={9}
                            fontWeight={700}
                            textAnchor="middle"
                            fontFamily="JetBrains Mono, monospace"
                            opacity={0.85}
                          >
                            {comp.refDes}
                          </text>
                          {comp.value && (
                            <text
                              x={cx}
                              y={cy + 12}
                              fill="rgba(255,255,255,0.6)"
                              fontSize={7.5}
                              textAnchor="middle"
                              fontFamily="JetBrains Mono, monospace"
                            >
                              {comp.value}
                            </text>
                          )}
                        </g>
                      );
                    })}

                  {/* Copper Tracks (GTL / Top Copper) */}
                  {showTopCopper &&
                    doc.tracks.map((track) => {
                      const x1 = toSvgX(track.start.x);
                      const y1 = toSvgY(track.start.y);
                      const x2 = toSvgX(track.end.x);
                      const y2 = toSvgY(track.end.y);
                      const strokeW = Math.max(2, track.width * scale);
                      const isPower = track.width > 0.4;
                      return (
                        <line
                          key={track.id}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={isPower ? '#f59e0b' : '#fbbf24'}
                          strokeWidth={strokeW}
                          strokeLinecap="round"
                          opacity={0.9}
                        />
                      );
                    })}

                  {/* Physical Pads with IPC Geometry */}
                  {showTopCopper &&
                    doc.pads.map((pad) => {
                      const px = toSvgX(pad.position.x);
                      const py = toSvgY(pad.position.y);
                      const pw = Math.max(4, pad.width * scale);
                      const ph = Math.max(4, pad.height * scale);
                      const isSquare = pad.shape === 'rect' || pad.number === '1' || pad.number === 'A';

                      if (isSquare) {
                        return (
                          <rect
                            key={`pad-${pad.id}`}
                            x={px - pw / 2}
                            y={py - ph / 2}
                            width={pw}
                            height={ph}
                            fill="#fef08a"
                            stroke="#b45309"
                            strokeWidth={0.8}
                            rx={1}
                          />
                        );
                      }
                      return (
                        <circle
                          key={`pad-${pad.id}`}
                          cx={px}
                          cy={py}
                          r={pw / 2}
                          fill="#fef08a"
                          stroke="#b45309"
                          strokeWidth={0.8}
                        />
                      );
                    })}

                  {/* Drill Hits (DRL) */}
                  {showDrills &&
                    doc.pads
                      .filter((p) => (p.drill ?? 0) > 0)
                      .map((pad) => {
                        const px = toSvgX(pad.position.x);
                        const py = toSvgY(pad.position.y);
                        const dr = Math.max(1.8, ((pad.drill || 0.8) / 2) * scale);
                        return (
                          <circle
                            key={`drill-${pad.id}`}
                            cx={px}
                            cy={py}
                            r={dr}
                            fill="#064e3b"
                            stroke="#e879f9"
                            strokeWidth={0.7}
                          />
                        );
                      })}
                </svg>
              ) : null}

              {components.length === 0 && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#34d399',
                    fontSize: 13,
                    fontFamily: 'JetBrains Mono',
                    opacity: 0.7,
                    gap: 8,
                  }}
                >
                  <Cpu size={28} color="#34d399" />
                  <span>No components placed on canvas. Add components to design your PCB.</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: DRC & Manufacturing Parameters */}
          <div
            style={{
              width: 280,
              backgroundColor: '#0b111e',
              borderLeft: '1px solid #1e293b',
              display: 'flex',
              flexDirection: 'column',
              padding: 16,
              overflowY: 'auto',
              fontSize: 12,
            }}
          >
            {/* MANUFACTURING CHECK Dashboard */}
            <div
              style={{
                marginBottom: 16,
                padding: '12px 14px',
                borderRadius: 8,
                backgroundColor: '#131b2c',
                border: `1px solid ${validation?.manufacturingCheck?.isReadyForFab ? '#10b98155' : '#ef444455'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  MANUFACTURING CHECK
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 4,
                    backgroundColor: validation?.manufacturingCheck?.isReadyForFab ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: validation?.manufacturingCheck?.isReadyForFab ? '#10b981' : '#ef4444',
                  }}
                >
                  {validation?.manufacturingCheck?.isReadyForFab ? 'FAB PASS' : 'DRC FAIL'}
                </span>
              </div>

              {validation ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Board: {validation.manufacturingCheck.boardDimensions}</span>
                    <span style={{ color: validation.manufacturingCheck.boardDimensionsPass ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                      {validation.manufacturingCheck.boardDimensionsPass ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Outline: {validation.manufacturingCheck.outlineStatus}</span>
                    <span style={{ color: validation.manufacturingCheck.outlinePass ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                      {validation.manufacturingCheck.outlinePass ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Drills: {validation.manufacturingCheck.drillCount}</span>
                    <span style={{ color: validation.manufacturingCheck.drillPass ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                      {validation.manufacturingCheck.drillPass ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Min trace: {validation.manufacturingCheck.minTraceWidthMm.toFixed(2)} mm</span>
                    <span style={{ color: validation.manufacturingCheck.minTracePass ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                      {validation.manufacturingCheck.minTracePass ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Min clearance: {validation.manufacturingCheck.minClearanceMm.toFixed(2)} mm</span>
                    <span style={{ color: validation.manufacturingCheck.minClearancePass ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                      {validation.manufacturingCheck.minClearancePass ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Unrouted nets: {validation.manufacturingCheck.unroutedNetsCount}</span>
                    <span style={{ color: validation.manufacturingCheck.unroutedNetsPass ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                      {validation.manufacturingCheck.unroutedNetsPass ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>DRC errors: {validation.manufacturingCheck.drcErrorsCount}</span>
                    <span style={{ color: validation.manufacturingCheck.drcPass ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                      {validation.manufacturingCheck.drcPass ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ color: '#ef4444', fontSize: 11 }}>
                  Footprint validation failed.
                </div>
              )}
            </div>

            {/* Board Physical Stats */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Physical Specifications
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ backgroundColor: '#131b2c', padding: 8, borderRadius: 6 }}>
                  <div style={{ color: '#64748b', fontSize: 10 }}>Dimensions</div>
                  <div style={{ fontWeight: 700, color: '#f8fafc', fontFamily: 'JetBrains Mono' }}>
                    {boardWidth.toFixed(1)}×{boardHeight.toFixed(1)} mm
                  </div>
                </div>
                <div style={{ backgroundColor: '#131b2c', padding: 8, borderRadius: 6 }}>
                  <div style={{ color: '#64748b', fontSize: 10 }}>Layer Count</div>
                  <div style={{ fontWeight: 700, color: '#f8fafc', fontFamily: 'JetBrains Mono' }}>
                    2-Layer FR-4
                  </div>
                </div>
                <div style={{ backgroundColor: '#131b2c', padding: 8, borderRadius: 6 }}>
                  <div style={{ color: '#64748b', fontSize: 10 }}>Total Pads</div>
                  <div style={{ fontWeight: 700, color: '#f8fafc', fontFamily: 'JetBrains Mono' }}>
                    {validation?.stats.padCount ?? 0}
                  </div>
                </div>
                <div style={{ backgroundColor: '#131b2c', padding: 8, borderRadius: 6 }}>
                  <div style={{ color: '#64748b', fontSize: 10 }}>Drill Hits</div>
                  <div style={{ fontWeight: 700, color: '#f8fafc', fontFamily: 'JetBrains Mono' }}>
                    {validation?.stats.drillCount ?? 0}
                  </div>
                </div>
                <div style={{ backgroundColor: '#131b2c', padding: 8, borderRadius: 6 }}>
                  <div style={{ color: '#64748b', fontSize: 10 }}>Traces</div>
                  <div style={{ fontWeight: 700, color: '#f8fafc', fontFamily: 'JetBrains Mono' }}>
                    {validation?.stats.trackCount ?? 0}
                  </div>
                </div>
                <div style={{ backgroundColor: '#131b2c', padding: 8, borderRadius: 6 }}>
                  <div style={{ color: '#64748b', fontSize: 10 }}>Copper Area</div>
                  <div style={{ fontWeight: 700, color: '#10b981', fontFamily: 'JetBrains Mono' }}>
                    {validation?.stats.copperAreaPercent ?? 0}%
                  </div>
                </div>
              </div>
            </div>

            {/* Generated Manufacturing Files */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                <FileSpreadsheet size={13} /> Export File Package
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
                {[
                  { name: 'circuit.GTL', desc: 'Top Copper Traces & Pads', color: '#f59e0b' },
                  { name: 'circuit.GBL', desc: 'Bottom Copper Layer', color: '#60a5fa' },
                  { name: 'circuit.GTO', desc: 'Top Silkscreen & RefDes', color: '#ffffff' },
                  { name: 'circuit.GTS', desc: 'Top Solder Mask Openings', color: '#10b981' },
                  { name: 'circuit.GKO', desc: 'Board Outline / Edge Cut', color: '#34d399' },
                  { name: 'circuit.DRL', desc: 'Excellon NC Drill Hits', color: '#e879f9' },
                  { name: 'circuit.BOM.csv', desc: 'Bill of Materials with RefDes', color: '#38bdf8' },
                  { name: 'README.txt', desc: 'JLCPCB / PCBWay Fab Instructions', color: '#94a3b8' },
                ].map((item) => (
                  <div
                    key={item.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '4px 6px',
                      backgroundColor: '#131b2c',
                      borderRadius: 4,
                    }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: item.color, flexShrink: 0 }} />
                    <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: '#f8fafc', width: 95 }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: 10, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fab Compatibility Notice */}
            <div
              style={{
                marginTop: 12,
                padding: 10,
                borderRadius: 6,
                backgroundColor: '#131b2c',
                border: '1px solid #1e293b',
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
                fontSize: 10,
                color: '#94a3b8',
              }}
            >
              <Info size={14} color="#38bdf8" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                Zip package is standard RS-274X + Excellon, 100% compatible with <strong>JLCPCB, PCBWay, OSHPark, and KiCad</strong>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
