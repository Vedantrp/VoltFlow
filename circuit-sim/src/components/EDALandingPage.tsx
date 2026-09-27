import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  Activity,
  CheckCircle2,
  FileText,
  Play,
  Zap,
  Grid,
  Terminal,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  Database,
  BarChart2,
  Compass,
  Briefcase,
  GraduationCap,
} from 'lucide-react';

interface EDALandingPageProps {
  onLaunchSimulator: () => void;
}

export const EDALandingPage: React.FC<EDALandingPageProps> = ({ onLaunchSimulator }) => {
  const [activeTab, setActiveTab] = useState<'schematic' | 'simulation' | 'pcb' | 'netlist'>('schematic');
  const [activeDocsTab, setActiveDocsTab] = useState<'quickstart' | 'spice' | 'api' | 'projects'>('quickstart');
  const [activeWorkspaceView, setActiveWorkspaceView] = useState<'editor' | 'waveforms' | 'drc'>('editor');
  const [simRunning, setSimRunning] = useState(false);

  return (
    <div className="eda-landing-page" style={{ backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'Inter, system-ui, -apple-system, sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* 1. NAVIGATION BAR */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={onLaunchSimulator}>
            <div style={{ width: 34, height: 34, backgroundColor: '#0f172a', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
              <Cpu size={20} color="#38bdf8" />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.02em', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                VoltFlow <span style={{ fontSize: 11, fontWeight: 800, padding: '1px 6px', borderRadius: 4, backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>EDA PLATFORM</span>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 14, fontWeight: 600, color: '#334155' }}>
            <a href="#product" style={{ color: '#334155', textDecoration: 'none', transition: 'color 0.15s' }}>Product</a>
            <a href="#features" style={{ color: '#334155', textDecoration: 'none', transition: 'color 0.15s' }}>Features</a>
            <a href="#workflow" style={{ color: '#334155', textDecoration: 'none', transition: 'color 0.15s' }}>Workflow</a>
            <a href="#use-cases" style={{ color: '#334155', textDecoration: 'none', transition: 'color 0.15s' }}>Solutions</a>
            <a href="#specs" style={{ color: '#334155', textDecoration: 'none', transition: 'color 0.15s' }}>Capabilities</a>
            <a href="#docs" style={{ color: '#334155', textDecoration: 'none', transition: 'color 0.15s' }}>Documentation</a>
          </nav>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={onLaunchSimulator}
              style={{
                backgroundColor: 'transparent',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '8px 16px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Sign In
            </button>

            <button
              onClick={onLaunchSimulator}
              style={{
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: '1px solid #0f172a',
                padding: '9px 18px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 1px 3px rgba(15,23,42,0.15)',
                transition: 'all 0.15s ease',
              }}
            >
              Start Designing <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '64px 24px 80px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          
          {/* Top Status Tag */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#16a34a' }} />
            VoltFlow EDA v4.2 Release — SPICE 3F5 Engine & Real-Time Waveform Viewer
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            
            {/* Hero Copy */}
            <div>
              <h1 style={{ fontSize: 48, fontWeight: 900, color: '#0f172a', lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: 20 }}>
                Design. Simulate. <br />
                Verify.
              </h1>
              <p style={{ fontSize: 18, color: '#475569', lineHeight: 1.6, marginBottom: 32, maxWidth: 540 }}>
                A professional electronic design automation platform for designing, simulating, analyzing, and validating modern electronic systems with engineering-grade accuracy.
              </p>

              <div style={{ display: 'flex', gap: 14, marginBottom: 36, flexWrap: 'wrap' }}>
                <button
                  onClick={onLaunchSimulator}
                  style={{
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    padding: '13px 26px',
                    borderRadius: 6,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    boxShadow: '0 4px 12px rgba(15,23,42,0.18)',
                    border: 'none',
                  }}
                >
                  <Play size={16} fill="#ffffff" /> Start Designing Free
                </button>
                <a
                  href="#docs"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    padding: '13px 22px',
                    borderRadius: 6,
                    fontSize: 15,
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}
                >
                  <BookOpen size={16} color="#475569" /> Explore Documentation
                </a>
              </div>

              {/* Trust Badges */}
              <div style={{ display: 'flex', gap: 24, borderTop: '1px solid #e2e8f0', paddingTop: 24, color: '#64748b', fontSize: 12, fontWeight: 600 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={16} color="#16a34a" /> SPICE 3F5 Compatible
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} color="#2563eb" /> ISO 26262 Standard
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Layers size={16} color="#0284c7" /> 32-Layer PCB DRC
                </div>
              </div>
            </div>

            {/* Hero Interactive Application Mockup Card */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 10, boxShadow: '0 12px 32px rgba(15,23,42,0.08)', overflow: 'hidden' }}>
              
              {/* Mock App Header Bar */}
              <div style={{ backgroundColor: '#0f172a', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#f8fafc', borderBottom: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981' }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', fontFamily: 'monospace' }}>VoltFlow EDA Workspace — power_stage_v2.sch</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => setSimRunning(!simRunning)}
                    style={{
                      backgroundColor: simRunning ? '#ef4444' : '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {simRunning ? 'Stop Sim' : 'Run SPICE'}
                  </button>
                </div>
              </div>

              {/* View Tabs */}
              <div style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1', padding: '0 12px', display: 'flex', gap: 2 }}>
                {[
                  { id: 'schematic', label: 'Schematic Canvas' },
                  { id: 'simulation', label: 'SPICE Waveforms' },
                  { id: 'pcb', label: 'PCB Stackup' },
                  { id: 'netlist', label: 'Netlist Inspector' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{
                      padding: '8px 14px',
                      fontSize: 12,
                      fontWeight: 700,
                      border: 'none',
                      backgroundColor: activeTab === tab.id ? '#ffffff' : 'transparent',
                      color: activeTab === tab.id ? '#0f172a' : '#64748b',
                      borderTop: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
                      cursor: 'pointer',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Canvas Preview Body */}
              <div style={{ height: 280, backgroundColor: '#091e3a', position: 'relative', overflow: 'hidden', padding: 16 }}>
                
                {/* Grid Overlay */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(#1e3a8a 1px, transparent 1px)', backgroundSize: '16px 16px', opacity: 0.4 }} />

                {activeTab === 'schematic' && (
                  <div style={{ position: 'relative', zIndex: 10, color: '#f8fafc', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    
                    {/* Top Schematic Elements */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ backgroundColor: 'rgba(15,23,42,0.8)', border: '1px solid #334155', borderRadius: 4, padding: '4px 8px', fontSize: 10, fontFamily: 'monospace', color: '#38bdf8' }}>
                        NET_VCC: +5.00V DC | NET_GND: 0.00V
                      </div>
                      <div style={{ backgroundColor: 'rgba(15,23,42,0.8)', border: '1px solid #334155', borderRadius: 4, padding: '4px 8px', fontSize: 10, fontFamily: 'monospace', color: '#4ade80' }}>
                        SPICE OP: PASS (1.2ms)
                      </div>
                    </div>

                    {/* Circuit Schematic Symbols & Nets Mockup */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
                      
                      {/* VCC Node */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 24, height: 16, border: '2px solid #ef4444', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: '#ef4444' }}>VCC</div>
                        <div style={{ width: 2, height: 16, backgroundColor: '#ef4444' }} />
                        <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#cbd5e1' }}>+5V Rail</span>
                      </div>

                      {/* Resistor R1 */}
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: 16, height: 2, backgroundColor: '#38bdf8' }} />
                        <div style={{ width: 44, height: 18, border: '2px solid #eab308', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#fef08a' }}>R1 10k</div>
                        <div style={{ width: 16, height: 2, backgroundColor: '#38bdf8' }} />
                      </div>

                      {/* Op-Amp U1 */}
                      <div style={{ border: '2px solid #38bdf8', borderRadius: 6, padding: '8px 12px', backgroundColor: '#0f172a', textAlign: 'center' }}>
                        <div style={{ fontSize: 10, fontWeight: 900, color: '#ffffff' }}>U1: LM358</div>
                        <div style={{ fontSize: 8, color: '#94a3b8', fontFamily: 'monospace' }}>GAIN: 10.0x</div>
                      </div>

                      {/* Output Wave Node */}
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: 16, height: 2, backgroundColor: '#4ade80' }} />
                        <div style={{ width: 48, height: 20, border: '2px solid #4ade80', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: '#4ade80' }}>VOUT</div>
                      </div>
                    </div>

                    {/* Bottom Console Summary */}
                    <div style={{ backgroundColor: 'rgba(15,23,42,0.9)', borderTop: '1px solid #1e293b', margin: '-16px', padding: '6px 16px', display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'monospace', color: '#94a3b8' }}>
                      <span>DRC Check: 0 Errors, 0 Warnings</span>
                      <span>Grid: 10mil (0.254mm)</span>
                    </div>
                  </div>
                )}

                {activeTab === 'simulation' && (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
                      Transient Analysis (.tran 0 10ms 10us) — Ch1: VIN (Blue) | Ch2: VOUT (Green)
                    </div>
                    
                    {/* SVG Oscilloscope Waveforms */}
                    <svg viewBox="0 0 400 120" style={{ width: '100%', height: 140 }}>
                      <line x1="0" y1="60" x2="400" y2="60" stroke="#334155" strokeWidth="1" strokeDasharray="4" />
                      <line x1="100" y1="0" x2="100" y2="120" stroke="#334155" strokeWidth="1" strokeDasharray="4" />
                      <line x1="200" y1="0" x2="200" y2="120" stroke="#334155" strokeWidth="1" strokeDasharray="4" />
                      <line x1="300" y1="0" x2="300" y2="120" stroke="#334155" strokeWidth="1" strokeDasharray="4" />

                      {/* Sine Input Wave VIN */}
                      <path d="M 0 60 Q 50 20 100 60 T 200 60 T 300 60 T 400 60" fill="none" stroke="#38bdf8" strokeWidth="2" />
                      
                      {/* Amplified Output Wave VOUT */}
                      <path d="M 0 60 Q 50 -10 100 60 T 200 60 T 300 60 T 400 60" fill="none" stroke="#4ade80" strokeWidth="2.5" />
                    </svg>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'monospace', color: '#cbd5e1' }}>
                      <span>Cursor 1: 2.50ms (VOUT = +4.82V)</span>
                      <span>Cursor 2: 5.00ms (VOUT = -4.80V)</span>
                    </div>
                  </div>
                )}

                {activeTab === 'pcb' && (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    <div style={{ border: '2px dashed #334155', borderRadius: 8, padding: '24px 36px', textAlign: 'center', backgroundColor: '#0f172a' }}>
                      <Layers size={32} color="#0284c7" style={{ marginBottom: 8 }} />
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#f8fafc' }}>4-Layer FR-4 PCB Stackup</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>Top Layer (Signal) / GND Plane / Power Plane / Bottom Layer</div>
                    </div>
                  </div>
                )}

                {activeTab === 'netlist' && (
                  <div style={{ height: '100%', fontFamily: 'monospace', fontSize: 10, color: '#38bdf8', overflowY: 'auto' }}>
                    <div>* SPICE Netlist Generated by VoltFlow EDA</div>
                    <div style={{ color: '#cbd5e1' }}>R1 NET_VCC NET_IN 10k</div>
                    <div style={{ color: '#cbd5e1' }}>C1 NET_IN GND 100nF</div>
                    <div style={{ color: '#cbd5e1' }}>XU1 NET_IN GND NET_VCC NET_VOUT LM358</div>
                    <div style={{ color: '#4ade80' }}>.TRAN 10us 10ms</div>
                    <div style={{ color: '#eab308' }}>.END</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES SECTION */}
      <section id="features" style={{ padding: '80px 24px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 56px auto' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform Capabilities</span>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginTop: 6, marginBottom: 12 }}>
              Engineering Precision at Every Stage
            </h2>
            <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.6 }}>
              Comprehensive design, simulation, and analysis tools built for modern hardware development teams.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
            {[
              {
                icon: <Grid size={22} color="#0f172a" />,
                title: 'Schematic Capture',
                desc: 'Multi-page hierarchical schematic entry with automatic net routing, component alignment grid, and real-time connectivity validation.',
              },
              {
                icon: <Activity size={22} color="#0f172a" />,
                title: 'SPICE Simulation Engine',
                desc: 'High-speed analog and mixed-signal simulation engine supporting DC operating point, transient response, and AC frequency sweeps.',
              },
              {
                icon: <Layers size={22} color="#0f172a" />,
                title: 'PCB Design & Stackup',
                desc: 'Multi-layer PCB layout editor with customizable copper stackup, trace width calculators, thermal relief vias, and DRC checking.',
              },
              {
                icon: <BarChart2 size={22} color="#0f172a" />,
                title: 'Waveform Analyzer',
                desc: 'Interactive virtual oscilloscope and logic analyzer with differential cursors, FFT spectrum analysis, and CSV export capabilities.',
              },
              {
                icon: <Database size={22} color="#0f172a" />,
                title: 'Component Library',
                desc: 'Over 10,000 verified IEEE/IEC circuit symbols, IPC-7351 footprints, and SPICE subcircuits ready for immediate drop-in design.',
              },
              {
                icon: <ShieldCheck size={22} color="#0f172a" />,
                title: 'Design Rule Checking (DRC)',
                desc: 'Automated DRC and Electrical Rule Checking (ERC) engine to prevent clearance violations, floating nodes, and power short circuits.',
              },
              {
                icon: <FileText size={22} color="#0f172a" />,
                title: 'BOM & Cost Estimation',
                desc: 'Live Bill of Materials generator with instant MPN matching, footprint verification, and estimated fabrication cost rollups.',
              },
              {
                icon: <Terminal size={22} color="#0f172a" />,
                title: 'Gerber X2 Manufacturing Output',
                desc: 'Industry-standard Gerber X2, IPC-2581, and NC Drill file generation for direct fabrication with global PCB manufacturers.',
              },
            ].map((feat, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: 24,
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ width: 42, height: 42, backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  {feat.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>{feat.title}</h3>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WORKFLOW SECTION */}
      <section id="workflow" style={{ padding: '80px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 56px auto' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>End-to-End Engineering</span>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginTop: 6, marginBottom: 12 }}>
              Structured Electronics Design Workflow
            </h2>
            <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.6 }}>
              From initial block diagram concept to verified manufacturing output in one unified workspace.
            </p>
          </div>

          {/* Technical Process Workflow Diagram */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, position: 'relative' }}>
            {[
              { step: '01', title: 'IDEA & SPEC', desc: 'System architecture definition & pinout requirements' },
              { step: '02', title: 'SCHEMATIC', desc: 'Symbol placement, net labeling & bus wiring' },
              { step: '03', title: 'SIMULATION', desc: 'SPICE transient, DC sweep & AC frequency analysis' },
              { step: '04', title: 'VERIFICATION', desc: 'ERC & DRC validation against design standards' },
              { step: '05', title: 'PCB LAYOUT', desc: 'Trace routing, copper pour & stackup configuration' },
              { step: '06', title: 'PROTOTYPE', desc: 'Gerber X2 export, BOM generation & fabrication' },
            ].map((wf, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  padding: '20px 16px',
                  position: 'relative',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 900, color: '#2563eb', fontFamily: 'monospace', marginBottom: 8 }}>
                  STEP {wf.step}
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>{wf.title}</div>
                <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{wf.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ENGINEERING WORKSPACE INTERACTIVE PREVIEW */}
      <section style={{ padding: '80px 24px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 32, alignItems: 'center' }}>
            
            {/* Control Column */}
            <div>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Interactive Demonstration</span>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginTop: 6, marginBottom: 16 }}>
                Real-Time EDA Environment
              </h2>
              <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 24 }}>
                Switch between specialized workspace views to inspect schematics, transient signals, and design diagnostic logs.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { id: 'editor', label: 'Schematic Editor & Netlist', detail: 'Interactive component placement & pin routing' },
                  { id: 'waveforms', label: 'Virtual Oscilloscope', detail: 'Multichannel analog signal waveform plotting' },
                  { id: 'drc', label: 'ERC / DRC Diagnostic Panel', detail: 'Real-time error & warning inspection console' },
                ].map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => setActiveWorkspaceView(ws.id as any)}
                    style={{
                      padding: 14,
                      borderRadius: 6,
                      border: '1px solid',
                      borderColor: activeWorkspaceView === ws.id ? '#2563eb' : '#e2e8f0',
                      backgroundColor: activeWorkspaceView === ws.id ? '#f0f9ff' : '#ffffff',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 800, color: activeWorkspaceView === ws.id ? '#1e40af' : '#0f172a' }}>{ws.label}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{ws.detail}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Display View Screen */}
            <div style={{ backgroundColor: '#0f172a', borderRadius: 8, border: '1px solid #1e293b', padding: 20, boxShadow: '0 8px 24px rgba(15,23,42,0.12)', color: '#ffffff' }}>
              {activeWorkspaceView === 'editor' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: 12, marginBottom: 16, fontSize: 12, fontFamily: 'monospace', color: '#38bdf8' }}>
                    <span>FILE: main_controller.sch</span>
                    <span>NETS: 48 | COMPONENTS: 12 | STATUS: OK</span>
                  </div>
                  
                  {/* Schematic Canvas Mockup */}
                  <div style={{ height: 260, backgroundColor: '#091e3a', border: '1px dashed #1e3a8a', borderRadius: 6, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-around', position: 'relative' }}>
                    <div style={{ border: '1px solid #38bdf8', borderRadius: 4, padding: 10, backgroundColor: '#0f172a', textAlign: 'center' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#ffffff' }}>ESP32-DevKit</div>
                      <div style={{ fontSize: 8, color: '#94a3b8', fontFamily: 'monospace' }}>Pin D13 ──► PWM</div>
                    </div>
                    <div style={{ width: 40, height: 2, backgroundColor: '#38bdf8' }} />
                    <div style={{ border: '1px solid #eab308', borderRadius: 4, padding: 10, backgroundColor: '#0f172a', textAlign: 'center' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#fef08a' }}>R1 220Ω</div>
                      <div style={{ fontSize: 8, color: '#94a3b8', fontFamily: 'monospace' }}>Current Limiter</div>
                    </div>
                    <div style={{ width: 40, height: 2, backgroundColor: '#4ade80' }} />
                    <div style={{ border: '1px solid #ef4444', borderRadius: 4, padding: 10, backgroundColor: '#0f172a', textAlign: 'center' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#ef4444' }}>LED (Red)</div>
                      <div style={{ fontSize: 8, color: '#4ade80', fontFamily: 'monospace' }}>State: ON (2.1V)</div>
                    </div>
                  </div>
                </div>
              )}

              {activeWorkspaceView === 'waveforms' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: 12, marginBottom: 16, fontSize: 12, fontFamily: 'monospace', color: '#4ade80' }}>
                    <span>OSCILLOSCOPE VIEW — Timebase: 1.0ms/div</span>
                    <span>TRIGGER: CH1 Rising Edge</span>
                  </div>

                  <svg viewBox="0 0 400 120" style={{ width: '100%', height: 260 }}>
                    <rect width="400" height="120" fill="#091e3a" />
                    <line x1="0" y1="60" x2="400" y2="60" stroke="#1e3a8a" strokeWidth="1" />
                    <path d="M 0 100 L 40 100 L 40 20 L 120 20 L 120 100 L 200 100 L 200 20 L 280 20 L 280 100 L 400 100" fill="none" stroke="#38bdf8" strokeWidth="2" />
                    <path d="M 0 60 Q 40 20 80 60 T 160 60 T 240 60 T 320 60 T 400 60" fill="none" stroke="#4ade80" strokeWidth="2" />
                  </svg>
                </div>
              )}

              {activeWorkspaceView === 'drc' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: 12, marginBottom: 16, fontSize: 12, fontFamily: 'monospace', color: '#eab308' }}>
                    <span>DESIGN RULE CHECKER (DRC) — Audit Log</span>
                    <span>RULESET: IPC-2221 Class 2</span>
                  </div>

                  <div style={{ height: 260, backgroundColor: '#09090b', padding: 12, borderRadius: 4, fontFamily: 'monospace', fontSize: 11, overflowY: 'auto' }}>
                    <div style={{ color: '#4ade80' }}>[INFO] Checking schematic node connectivity...</div>
                    <div style={{ color: '#4ade80' }}>[INFO] 14 Power nets verified (+5V, +3V3, GND).</div>
                    <div style={{ color: '#cbd5e1' }}>[PASS] Net clearances exceed minimum 6mil threshold.</div>
                    <div style={{ color: '#cbd5e1' }}>[PASS] Component footprints mapped to valid IPC libraries.</div>
                    <div style={{ color: '#38bdf8', marginTop: 8 }}>✓ DRC AUDIT COMPLETE: 0 Violations Found. Ready for Fabrication.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 6. USE CASES SECTION */}
      <section id="use-cases" style={{ padding: '80px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 56px auto' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tailored Solutions</span>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginTop: 6, marginBottom: 12 }}>
              Built for Every Electronics Application
            </h2>
            <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.6 }}>
              Whether you are designing integrated circuits, embedded microcontrollers, or power stages.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {[
              {
                icon: <Cpu size={24} color="#0f172a" />,
                title: 'VLSI & IC Design',
                desc: 'Transistor-level SPICE modeling, CMOS logic gates, and analog front-end verification.',
              },
              {
                icon: <Zap size={24} color="#0f172a" />,
                title: 'Embedded Systems',
                desc: 'Microcontroller simulation with firmware execution (Arduino, ESP32, STM32, AVR).',
              },
              {
                icon: <Layers size={24} color="#0f172a" />,
                title: 'PCB Development',
                desc: 'Multi-layer layout, trace routing, copper fills, and Gerber X2 manufacturing export.',
              },
              {
                icon: <Briefcase size={24} color="#0f172a" />,
                title: 'Industrial Electronics',
                desc: 'High-power relay switching, optocoupler isolation, and AC motor drive controllers.',
              },
              {
                icon: <GraduationCap size={24} color="#0f172a" />,
                title: 'Academic Laboratories',
                desc: 'Interactive teaching environment for electrical engineering, circuit theory, and robotics.',
              },
              {
                icon: <Compass size={24} color="#0f172a" />,
                title: 'Rapid Prototyping',
                desc: 'Solderless breadboard virtual prototyping with instant component drag-and-drop.',
              },
            ].map((uc, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  padding: 24,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ width: 44, height: 44, backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  {uc.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>{uc.title}</h3>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. PERFORMANCE & CAPABILITIES SPEC SHEET */}
      <section id="specs" style={{ padding: '80px 24px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 48px auto' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Technical Datasheet</span>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginTop: 6, marginBottom: 12 }}>
              Platform Specifications & Limits
            </h2>
          </div>

          <div style={{ border: '1px solid #cbd5e1', borderRadius: 8, overflow: 'hidden', backgroundColor: '#ffffff' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                  <th style={{ padding: '12px 20px', fontWeight: 800 }}>Specification Feature</th>
                  <th style={{ padding: '12px 20px', fontWeight: 800 }}>Supported Capability / Rating</th>
                  <th style={{ padding: '12px 20px', fontWeight: 800 }}>Standards & Compliance</th>
                </tr>
              </thead>
              <tbody style={{ color: '#334155' }}>
                {[
                  { spec: 'Simulation Engine', cap: 'Berkeley SPICE 3F5 / XSPICE Transmit & DC', std: 'IEEE 1588 / SPICE Level 3' },
                  { spec: 'Schematic Net Capacity', cap: '100,000+ Net nodes per design sheet', std: 'IPC-2581 Netlist Matrix' },
                  { spec: 'PCB Layer Support', cap: 'Up to 32 Signal, Plane & Silk Layers', std: 'IPC-2221 Class 3 PCB Spec' },
                  { spec: 'Component Library', cap: '10,000+ Verified Parametric Components', std: 'IPC-7351B Footprint Naming' },
                  { spec: 'Export Formats', cap: 'Gerber X2, NC Drill, SPICE Netlist, BOM CSV', std: 'RS-274X / Gerber X2 Standards' },
                  { spec: 'Firmware Simulation', cap: 'AVR 8-bit & ESP32 Dual-Core C++ Execution', std: 'GCC C++17 Toolchain' },
                ].map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <td style={{ padding: '12px 20px', fontWeight: 700, color: '#0f172a' }}>{row.spec}</td>
                    <td style={{ padding: '12px 20px', fontFamily: 'monospace', color: '#2563eb' }}>{row.cap}</td>
                    <td style={{ padding: '12px 20px', color: '#64748b' }}>{row.std}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 8. DOCUMENTATION SECTION */}
      <section id="docs" style={{ padding: '80px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 48px auto' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Developer & Engineering Docs</span>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginTop: 6, marginBottom: 12 }}>
              Comprehensive Documentation
            </h2>
            <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.6 }}>
              Explore guides, SPICE syntax reference, and sample reference designs.
            </p>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            
            {/* Docs Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f1f5f9' }}>
              {[
                { id: 'quickstart', label: 'Getting Started Guide' },
                { id: 'spice', label: 'SPICE Directives Reference' },
                { id: 'api', label: 'Python Automation API' },
                { id: 'projects', label: 'Sample Hardware Projects' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDocsTab(tab.id as any)}
                  style={{
                    padding: '12px 20px',
                    fontSize: 13,
                    fontWeight: 800,
                    border: 'none',
                    backgroundColor: activeDocsTab === tab.id ? '#ffffff' : 'transparent',
                    color: activeDocsTab === tab.id ? '#0f172a' : '#64748b',
                    borderBottom: activeDocsTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Docs Body Content */}
            <div style={{ padding: 32 }}>
              {activeDocsTab === 'quickstart' && (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Quickstart: Your First Schematic & Simulation</h3>
                  <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>
                    Follow these 3 steps to construct and simulate your first analog RC filter circuit:
                  </p>
                  
                  <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: 16, borderRadius: 6, fontFamily: 'monospace', fontSize: 12, lineHeight: 1.7, marginBottom: 16 }}>
                    <div style={{ color: '#94a3b8' }}># 1. Add voltage source, resistor, capacitor to canvas</div>
                    <div>place component voltage_source --value 5V --net VCC</div>
                    <div>place component resistor --value 10k --net VCC:NET_IN</div>
                    <div>place component capacitor --value 100nF --net NET_IN:GND</div>
                    <div style={{ color: '#4ade80', marginTop: 8 }}># 2. Execute SPICE transient simulation</div>
                    <div style={{ color: '#4ade80' }}>simulate --tran 10us 10ms --probe NET_IN</div>
                  </div>
                </div>
              )}

              {activeDocsTab === 'spice' && (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>SPICE Command Reference Syntax</h3>
                  <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>
                    VoltFlow supports standard Berkeley SPICE 3F5 syntax for netlists and directives:
                  </p>
                  
                  <div style={{ backgroundColor: '#0f172a', color: '#38bdf8', padding: 16, borderRadius: 6, fontFamily: 'monospace', fontSize: 12, lineHeight: 1.7 }}>
                    <div>.TRAN &lt;TSTEP&gt; &lt;TSTOP&gt; [TSTART] [TMAX]  ; Transient response</div>
                    <div>.AC &lt;DEC|OCT|LIN&gt; &lt;NP&gt; &lt;FSTART&gt; &lt;FSTOP&gt; ; AC frequency response</div>
                    <div>.DC &lt;SRCNAM&gt; &lt;VSTART&gt; &lt;VSTOP&gt; &lt;VINCR&gt;    ; DC sweep</div>
                    <div>.MODEL &lt;MODNAME&gt; &lt;TYPE&gt; (&lt;PAR1=VAL1&gt; ...) ; Semiconductor model</div>
                  </div>
                </div>
              )}

              {activeDocsTab === 'api' && (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Python Automation & Scripting API</h3>
                  <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>
                    Automate circuit parameter sweeps and batch netlist analysis using our official Python SDK:
                  </p>

                  <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: 16, borderRadius: 6, fontFamily: 'monospace', fontSize: 12, lineHeight: 1.7 }}>
                    <div style={{ color: '#f59e0b' }}>import voltflow_eda as eda</div>
                    <div>proj = eda.load_project(<span style={{ color: '#4ade80' }}>"buck_converter.flow"</span>)</div>
                    <div>results = proj.simulate_transient(tstop=<span style={{ color: '#38bdf8' }}>"50ms"</span>)</div>
                    <div>print(f<span style={{ color: '#4ade80' }}>"Peak Ripple Voltage: &#123;results.get_ripple('VOUT')&#125; V"</span>)</div>
                  </div>
                </div>
              )}

              {activeDocsTab === 'projects' && (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Sample Reference Designs</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: 16, backgroundColor: '#ffffff' }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Arduino Uno R3 Expansion Shield</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Complete 2-layer PCB layout with sensor header breakouts.</div>
                    </div>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: 16, backgroundColor: '#ffffff' }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>12V to 5V 3A Buck Converter</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>High-efficiency switching regulator with thermal copper pour.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 9. TESTIMONIALS / TRUST SECTION */}
      <section style={{ padding: '80px 24px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 48px auto' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Engineering Trust</span>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginTop: 6, marginBottom: 12 }}>
              Trusted by Hardware Teams Worldwide
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {[
              {
                quote: 'VoltFlow’s SPICE engine convergence rate on complex switching power supplies is unmatched. It eliminated weeks of breadboard troubleshooting.',
                author: 'Dr. Marcus Vance',
                role: 'Principal Power Electronics Engineer',
              },
              {
                quote: 'The real-time DRC engine and multi-layer stackup tools gave our engineering team total confidence before committing to high-density PCB manufacturing runs.',
                author: 'Elena Rostova',
                role: 'Lead Hardware Systems Architect',
              },
              {
                quote: 'We standardise on VoltFlow EDA for our university robotics and VLSI curriculum. Students grasp circuit behavior immediately with interactive waveforms.',
                author: 'Prof. David Chen',
                role: 'Department Head of Electrical Engineering',
              },
            ].map((t, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 20 }}>
                  "{t.quote}"
                </p>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{t.author}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FINAL CTA SECTION */}
      <section style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 16 }}>
            Build your next electronic design with confidence.
          </h2>
          <p style={{ fontSize: 16, color: '#94a3b8', lineHeight: 1.6, marginBottom: 36 }}>
            Join thousands of hardware engineers, embedded developers, and university labs designing reliable electronics with VoltFlow EDA.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <button
              onClick={onLaunchSimulator}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '14px 28px',
                borderRadius: 6,
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(37,99,235,0.4)',
              }}
            >
              Start Designing Free <ArrowRight size={16} />
            </button>

            <a
              href="#docs"
              style={{
                backgroundColor: 'transparent',
                color: '#ffffff',
                border: '1px solid #475569',
                padding: '14px 24px',
                borderRadius: 6,
                fontSize: 15,
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              View Documentation
            </a>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer style={{ backgroundColor: '#09090b', color: '#94a3b8', borderTop: '1px solid #1e293b', padding: '64px 24px 32px 24px', fontSize: 13 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr repeat(4, 1fr)', gap: 40, marginBottom: 48 }}>
          
          {/* Col 1 */}
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Cpu size={20} color="#38bdf8" /> VoltFlow EDA
            </div>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, maxWidth: 280 }}>
              Professional electronic design automation platform for schematic capture, SPICE simulation, and multi-layer PCB design.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc', marginBottom: 14 }}>Product</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="#product" style={{ color: '#94a3b8', textDecoration: 'none' }}>Schematic Editor</a>
              <a href="#product" style={{ color: '#94a3b8', textDecoration: 'none' }}>SPICE Simulator</a>
              <a href="#product" style={{ color: '#94a3b8', textDecoration: 'none' }}>PCB Layout Editor</a>
              <a href="#product" style={{ color: '#94a3b8', textDecoration: 'none' }}>Gerber Generator</a>
            </div>
          </div>

          {/* Col 3 */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc', marginBottom: 14 }}>Solutions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="#use-cases" style={{ color: '#94a3b8', textDecoration: 'none' }}>VLSI & IC Design</a>
              <a href="#use-cases" style={{ color: '#94a3b8', textDecoration: 'none' }}>Embedded Microcontrollers</a>
              <a href="#use-cases" style={{ color: '#94a3b8', textDecoration: 'none' }}>Power Electronics</a>
              <a href="#use-cases" style={{ color: '#94a3b8', textDecoration: 'none' }}>University Labs</a>
            </div>
          </div>

          {/* Col 4 */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc', marginBottom: 14 }}>Documentation</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="#docs" style={{ color: '#94a3b8', textDecoration: 'none' }}>Quickstart Guide</a>
              <a href="#docs" style={{ color: '#94a3b8', textDecoration: 'none' }}>SPICE Directives</a>
              <a href="#docs" style={{ color: '#94a3b8', textDecoration: 'none' }}>Python Automation API</a>
              <a href="#docs" style={{ color: '#94a3b8', textDecoration: 'none' }}>Reference Schematics</a>
            </div>
          </div>

          {/* Col 5 */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc', marginBottom: 14 }}>Company & Legal</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>About Us</a>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Compliance & Security</a>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Terms of Service</a>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div style={{ maxWidth: 1280, margin: '0 auto', borderTop: '1px solid #1e293b', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#64748b' }}>
          <div>© {new Date().getFullYear()} VoltFlow EDA Platform Inc. All rights reserved. | <strong style={{ color: '#38bdf8' }}>Designed by Vedant R.P</strong></div>
          <div>Precision Engineering Software | ISO 26262 & IPC-2221 Standards Compliant</div>
        </div>
      </footer>
    </div>
  );
};
