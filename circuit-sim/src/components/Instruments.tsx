import React, { useState, useEffect, useRef } from 'react';
import type { InstrumentState } from '../types';

interface InstrumentsProps {
  state: InstrumentState;
  onUpdateState: (nextState: InstrumentState) => void;
  onClose: () => void;
  isRunning: boolean;
}

export const InstrumentsModal: React.FC<InstrumentsProps> = ({
  state: _state,
  onUpdateState: _onUpdateState,
  onClose,
  isRunning,
}) => {
  const [activeTab, setActiveTab] = useState<'oscilloscope' | 'multimeter' | 'funcGen' | 'logicAnalyzer'>('oscilloscope');
  const oscCanvasRef = useRef<HTMLCanvasElement>(null);

  // Real-time Oscilloscope animation
  useEffect(() => {
    if (activeTab !== 'oscilloscope') return;
    const canvas = oscCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const renderWave = () => {
      animId = requestAnimationFrame(renderWave);
      t += 0.05;

      const w = canvas.width;
      const h = canvas.height;

      // Dark oscilloscope screen background with grid
      ctx.fillStyle = '#022c22';
      ctx.fillRect(0, 0, w, h);

      // Oscilloscope Grid Lines
      ctx.strokeStyle = '#065f46';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Channel A (Yellow Sine / Square)
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = isRunning
          ? h / 2 + Math.sin((x * 0.03) + t) * (h * 0.3)
          : h / 2;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Channel B (Cyan Square Pulse)
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const pulse = Math.sin((x * 0.02) + t * 1.5) > 0 ? 30 : -30;
        const y = isRunning ? h * 0.75 + pulse : h * 0.75;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    renderWave();
    return () => cancelAnimationFrame(animId);
  }, [activeTab, isRunning]);

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-container" style={{ width: 720, backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12, overflow: 'hidden', color: '#f8fafc' }}>
        
        {/* Header */}
        <div style={{ padding: '14px 20px', backgroundColor: '#1e293b', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 16, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 8 }}>
            🔬 Virtual Test Bench & Instruments
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b' }}>
          {(
            [
              { id: 'oscilloscope', label: '📊 Oscilloscope' },
              { id: 'multimeter', label: '📟 Multimeter' },
              { id: 'funcGen', label: '🌊 Function Generator' },
              { id: 'logicAnalyzer', label: '⚡ Logic Analyzer' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #38bdf8' : 'none',
                backgroundColor: activeTab === tab.id ? '#1e293b' : 'transparent',
                color: activeTab === tab.id ? '#38bdf8' : '#94a3b8',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Body Content */}
        <div style={{ padding: 20 }}>
          {activeTab === 'oscilloscope' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 12, color: '#94a3b8' }}>
                <span><strong style={{ color: '#facc15' }}>CH A:</strong> 5.00V / div</span>
                <span><strong style={{ color: '#38bdf8' }}>CH B:</strong> 2.00V / div</span>
                <span>Time: 10ms / div</span>
                <span style={{ color: isRunning ? '#10b981' : '#f59e0b' }}>● {isRunning ? 'TRIG RUN' : 'STOPPED'}</span>
              </div>
              <canvas ref={oscCanvasRef} width={680} height={260} style={{ borderRadius: 6, border: '2px solid #065f46', display: 'block' }} />
            </div>
          )}

          {activeTab === 'multimeter' && (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <div style={{ display: 'inline-block', backgroundColor: '#1e293b', border: '4px solid #334155', borderRadius: 12, padding: 24, minWidth: 320 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8, letterSpacing: 1.5 }}>DIGITAL MULTIMETER</div>
                <div style={{ fontFamily: 'monospace', fontSize: 44, color: '#10b981', backgroundColor: '#022c22', padding: '10px 20px', borderRadius: 6, border: '2px solid #065f46', letterSpacing: 2 }}>
                  {isRunning ? '5.02 V' : '0.00 V'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20 }}>
                  <button className="btn" style={{ background: '#38bdf8', color: '#0f172a', fontWeight: 700 }}>DC Voltage (V)</button>
                  <button className="btn" style={{ background: '#334155', color: '#f8fafc' }}>Current (mA)</button>
                  <button className="btn" style={{ background: '#334155', color: '#f8fafc' }}>Resistance (Ω)</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'funcGen' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>Waveform Type</label>
                <select style={{ width: '100%', padding: 8, borderRadius: 6, backgroundColor: '#1e293b', color: '#f8fafc', border: '1px solid #334155' }}>
                  <option value="sine">Sine Wave</option>
                  <option value="square">Square Wave</option>
                  <option value="triangle">Triangle Wave</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>Frequency (Hz)</label>
                <input type="number" defaultValue={1000} style={{ width: '100%', padding: 8, borderRadius: 6, backgroundColor: '#1e293b', color: '#f8fafc', border: '1px solid #334155' }} />
              </div>
            </div>
          )}

          {activeTab === 'logicAnalyzer' && (
            <div style={{ padding: 10, backgroundColor: '#1e293b', borderRadius: 8 }}>
              <div style={{ fontSize: 13, color: '#38bdf8', marginBottom: 10 }}>8-Channel Digital Logic Trace View</div>
              {['D0 (Clock)', 'D1 (Data)', 'D2 (CS)', 'D3 (Reset)'].map((ch, idx) => (
                <div key={ch} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: '#94a3b8', width: 90 }}>{ch}</span>
                  <div style={{ flex: 1, height: 20, backgroundColor: '#0f172a', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 4, bottom: 4, left: 0, width: `${(idx + 1) * 20}%`, backgroundColor: '#10b981' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
