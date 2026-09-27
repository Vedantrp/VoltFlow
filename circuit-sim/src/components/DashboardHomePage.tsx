import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Zap,
  Plus,
  FolderOpen,
  ArrowRight,
  Activity,
  Layers,
  Clock,
  Sparkles,
  ChevronRight,
  LogOut,
  Search,
  Radio,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { authService } from '../services/authService';
import { CIRCUIT_TEMPLATES, TEMPLATE_CATEGORIES, type CircuitTemplate } from '../data/circuitTemplates';
import type { UserProfile, SavedProject } from '../types';

interface DashboardHomePageProps {
  onLaunchSimulator: () => void;
  onNavigatePrivacy: () => void;
  onNavigateTerms: () => void;
  onOpenProject: (project: SavedProject) => void;
  onCreatePresetCircuit: (presetId: string, templateData?: CircuitTemplate) => void;
  onOpenAuthModal: () => void;
  onSignOut?: () => void;
  currentUser: UserProfile | null;
}

export const DashboardHomePage: React.FC<DashboardHomePageProps> = ({
  onLaunchSimulator,
  onNavigatePrivacy,
  onNavigateTerms,
  onOpenProject,
  onCreatePresetCircuit,
  onOpenAuthModal,
  onSignOut,
  currentUser,
}) => {
  const [userProjects, setUserProjects] = useState<SavedProject[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'templates'>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Load user's saved cloud & local circuits
  useEffect(() => {
    if (currentUser) {
      authService
        .getProjectsAsync(currentUser.id)
        .then((projects) => setUserProjects(projects))
        .catch(() => setUserProjects(authService.getProjects(currentUser.id)));
    } else {
      setUserProjects(authService.getGuestProjects());
    }
  }, [currentUser]);

  // Filter 50 templates by category & search query
  const filteredTemplates = CIRCUIT_TEMPLATES.filter((tpl) => {
    const matchesCategory = selectedCategory === 'All' || tpl.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      tpl.name.toLowerCase().includes(query) ||
      tpl.desc.toLowerCase().includes(query) ||
      tpl.badge.toLowerCase().includes(query) ||
      tpl.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'Microcontrollers':
        return Cpu;
      case 'Sensors':
        return Activity;
      case 'Motors':
        return Zap;
      case 'Displays':
        return Layers;
      case 'Analog & Power':
        return Radio;
      case 'Audio & Logic':
        return Sparkles;
      default:
        return Cpu;
    }
  };

  return (
    <div
      className="dashboard-homepage"
      style={{
        backgroundColor: '#F7F4EE',
        color: '#1F2321',
        fontFamily: "'Inter', -apple-system, sans-serif",
        minHeight: '100vh',
        width: '100%',
      }}
    >
      {/* NAVIGATION BAR */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'rgba(247, 244, 238, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E2DACD',
          boxShadow: '0 2px 10px rgba(47, 62, 52, 0.04)',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 24px',
            height: 76,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo Branding */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
            onClick={() => {
              setActiveTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <img
              src="/voltflow-logo.png"
              alt="VoltFlow Studio - Electronics Made Simple"
              style={{
                height: 60,
                width: 'auto',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>

          {/* Links */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 32,
              fontSize: 14,
              fontWeight: 600,
              color: '#4A524D',
            }}
          >
            <button
              onClick={() => {
                setActiveTab('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'dashboard' ? '#E98B5A' : '#4A524D',
                fontWeight: activeTab === 'dashboard' ? 700 : 600,
                cursor: 'pointer',
                fontSize: 14,
                position: 'relative',
                paddingBottom: 4,
                borderBottom: activeTab === 'dashboard' ? '2px solid #E98B5A' : 'none',
              }}
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                setActiveTab('templates');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'templates' ? '#E98B5A' : '#4A524D',
                fontWeight: activeTab === 'templates' ? 700 : 600,
                cursor: 'pointer',
                fontSize: 14,
                position: 'relative',
                paddingBottom: 4,
                borderBottom: activeTab === 'templates' ? '2px solid #E98B5A' : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              Circuit Templates
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: 10,
                  backgroundColor: '#E98B5A',
                  color: '#FFFFFF',
                }}
              >
                50
              </span>
            </button>
            <button
              onClick={onNavigatePrivacy}
              style={{ background: 'none', border: 'none', color: '#4A524D', cursor: 'pointer', fontSize: 14 }}
            >
              Privacy Policy
            </button>
            <button
              onClick={onNavigateTerms}
              style={{ background: 'none', border: 'none', color: '#4A524D', cursor: 'pointer', fontSize: 14 }}
            >
              Terms & Conditions
            </button>
          </nav>

          {/* User Auth & Launch CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBBBA0',
                    borderRadius: 20,
                    padding: '5px 14px',
                    fontSize: 13,
                    boxShadow: '0 2px 6px rgba(47, 62, 52, 0.05)',
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#82977E' }} />
                  <span style={{ fontWeight: 700, color: '#1F2321' }}>
                    {currentUser.displayName || currentUser.email}
                  </span>
                </div>
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    title="Log out of your account"
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      color: '#dc2626',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      padding: '8px 14px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <LogOut size={14} /> Log Out
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                style={{
                  backgroundColor: 'transparent',
                  color: '#2F3E34',
                  border: '1.5px solid #2F3E34',
                  padding: '9px 18px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Sign In / Account
              </button>
            )}

            <button
              onClick={onLaunchSimulator}
              style={{
                backgroundColor: '#2F3E34',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 22px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(47, 62, 52, 0.25)',
                transition: 'all 0.15s ease',
              }}
            >
              Get Started <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* DASHBOARD TAB VIEW */}
      {activeTab === 'dashboard' ? (
        <>
          {/* HERO SECTION */}
          <section
            style={{
              backgroundColor: '#F7F4EE',
              borderBottom: '1px solid #E2DACD',
              padding: '48px 24px 64px 24px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                maxWidth: 1320,
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: '310px 1fr 400px',
                gap: 28,
                alignItems: 'center',
              }}
            >
              {/* Left Column: Quick Workbench Panel */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  border: '1px solid #E2DACD',
                  padding: '20px',
                  boxShadow: '0 8px 24px rgba(47, 62, 52, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F0EAE1', paddingBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Zap size={17} color="#E98B5A" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1F2321' }}>Quick Workbench</span>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, backgroundColor: '#E0EBE2', color: '#2F3E34', padding: '2px 8px', borderRadius: 12 }}>
                    SIMULATOR
                  </span>
                </div>

                {/* Quick Action Button */}
                <button
                  onClick={onLaunchSimulator}
                  style={{
                    width: '100%',
                    backgroundColor: '#E98B5A',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '11px 14px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 14px rgba(233, 139, 90, 0.3)',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Plus size={16} /> New Blank Project
                  </span>
                  <ArrowRight size={14} />
                </button>

                <div style={{ fontSize: 10, fontWeight: 800, color: '#82977E', marginTop: 2, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  FEATURED STARTERS
                </div>

                {[
                  { title: 'Arduino LED Blink', desc: 'ATmega328P + 5mm Red LED', presetId: 'arduino-blink' },
                  { title: 'OLED I2C Weather Lab', desc: 'SSD1306 Display + DHT11 Sensor', presetId: 'oled-dht11' },
                  { title: 'Stepper Motor Driver', desc: 'NEMA 17 Stepper + ULN2003 Driver', presetId: 'stepper-driver' },
                ].map((starter, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      const t = CIRCUIT_TEMPLATES.find((item) => item.id.includes(starter.presetId) || item.title.toLowerCase().includes(starter.title.toLowerCase().split(' ')[0]));
                      if (t) {
                        onCreatePresetCircuit(t.id, t);
                      } else {
                        onLaunchSimulator();
                      }
                    }}
                    style={{
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #F0EAE1',
                      backgroundColor: '#FBF9F5',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#E98B5A';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FBF9F5';
                      e.currentTarget.style.borderColor = '#F0EAE1';
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#1F2321' }}>{starter.title}</div>
                      <div style={{ fontSize: 10, color: '#5F6862' }}>{starter.desc}</div>
                    </div>
                    <ChevronRight size={14} color="#E98B5A" />
                  </div>
                ))}

                {/* Simulator Capabilities Box */}
                <div style={{ backgroundColor: '#F7F4EE', border: '1px solid #EAE3D6', borderRadius: 8, padding: '10px 12px', fontSize: 11, color: '#4A524D' }}>
                  <div style={{ fontWeight: 800, color: '#2F3E34', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Activity size={12} color="#E98B5A" /> Studio Specs
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 10.5, color: '#5F6862' }}>
                    <span>• SPICE 3F5 Nodal Engine (250µs)</span>
                    <span>• 16MHz AVR Microcontroller Core</span>
                    <span>• 68 Physical Tinkercad Components</span>
                  </div>
                </div>
              </div>

              {/* Center Column: Hero Content */}
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: '#82977E',
                    marginBottom: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      width: 24,
                      height: 2,
                      backgroundColor: '#E98B5A',
                      display: 'inline-block',
                    }}
                  />
                  ELECTRONICS MADE SIMPLE
                </div>

                <h1
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 48,
                    fontWeight: 700,
                    color: '#1F2321',
                    lineHeight: 1.12,
                    letterSpacing: '-0.02em',
                    marginBottom: 18,
                  }}
                >
                  Design. Simulate. <span style={{ color: '#E98B5A' }}>Build.</span>
                </h1>

                <p
                  style={{
                    fontSize: 15,
                    color: '#4A524D',
                    lineHeight: 1.6,
                    marginBottom: 26,
                    maxWidth: 520,
                    fontWeight: 400,
                  }}
                >
                  A modern EDA platform to design circuits, simulate microcontroller firmware, and create professional PCB layouts — all in one place.
                </p>

                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    onClick={onLaunchSimulator}
                    style={{
                      backgroundColor: '#E98B5A',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '13px 26px',
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 10,
                      boxShadow: '0 6px 20px rgba(233, 139, 90, 0.35)',
                      transition: 'transform 0.15s ease',
                    }}
                  >
                    Start Designing <ArrowRight size={16} />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('templates');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: '#2F3E34',
                      border: '1px solid #CBBBA0',
                      padding: '13px 22px',
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 2px 8px rgba(47, 62, 52, 0.05)',
                    }}
                  >
                    <Layers size={16} color="#E98B5A" /> Browse 50 Templates
                  </button>
                </div>

                <div
                  style={{
                    marginTop: 18,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#5F6862',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <span>Electronics Made Simple</span>
                  <span style={{ opacity: 0.5 }}>|</span>
                  <span style={{ color: '#2F3E34', fontWeight: 700 }}>
                    Designed &amp; Created By Vedant.Ravindra.Puranik
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
                  <span style={{ backgroundColor: '#82977E', color: '#FFFFFF', padding: '4px 10px', borderRadius: 14, fontSize: 11, fontWeight: 700 }}>
                    SPICE 3F5
                  </span>
                  <span style={{ backgroundColor: '#E98B5A', color: '#FFFFFF', padding: '4px 10px', borderRadius: 14, fontSize: 11, fontWeight: 700 }}>
                    AVR 16MHz
                  </span>
                  <span style={{ backgroundColor: '#CBBBA0', color: '#1F2321', padding: '4px 10px', borderRadius: 14, fontSize: 11, fontWeight: 700 }}>
                    Gerber Export
                  </span>
                  <span style={{ backgroundColor: '#2F3E34', color: '#FFFFFF', padding: '4px 10px', borderRadius: 14, fontSize: 11, fontWeight: 700 }}>
                    Live LCD &amp; Oscilloscope
                  </span>
                </div>
              </div>

              {/* Right Column: Live SVG Visual Workbench Showcase */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    maxWidth: 400,
                    backgroundColor: '#1E293B',
                    borderRadius: 16,
                    border: '1px solid #334155',
                    padding: 16,
                    boxShadow: '0 16px 36px rgba(15, 23, 42, 0.25)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid #334155', paddingBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Cpu size={14} color="#38BDF8" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#F8FAFC', fontFamily: 'monospace' }}>WORKBENCH SIMULATOR</span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#22C55E', backgroundColor: '#14532D', padding: '2px 8px', borderRadius: 10 }}>
                      ● RUNNING
                    </span>
                  </div>

                  <svg width="100%" height="210" viewBox="0 0 370 210" style={{ overflow: 'visible' }}>
                    {/* PCB Copper Trace Grid Lines */}
                    <pattern id="heroGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" />
                    </pattern>
                    <rect width="370" height="210" fill="url(#heroGrid)" rx="8" />

                    {/* Oscilloscope Wave Window */}
                    <rect x="220" y="15" width="135" height="75" rx="6" fill="#090D16" stroke="#0EA5E9" strokeWidth="1" />
                    <text x="230" y="30" fill="#38BDF8" fontSize="9" fontWeight="800" fontFamily="monospace">CH1: 5.0V Sine</text>
                    <path
                      d="M 225 55 Q 240 25 255 55 T 285 55 T 315 55 T 345 55"
                      fill="none"
                      stroke="#22C55E"
                      strokeWidth="2"
                    />

                    {/* Arduino Mini Vector Graphic */}
                    <rect x="15" y="25" width="180" height="150" rx="6" fill="#00979C" stroke="#006567" strokeWidth="1.5" />
                    <rect x="15" y="75" width="24" height="40" fill="#CBD5E1" />
                    <rect x="55" y="80" width="60" height="40" rx="2" fill="#18181B" />
                    <text x="85" y="104" fill="#E2E8F0" fontSize="8" fontWeight="900" fontFamily="monospace" textAnchor="middle">ATMEGA328P</text>
                    <circle cx="170" cy="45" r="4" fill="#22C55E" />

                    {/* Domed 5mm Red Glowing LED */}
                    <g transform="translate(250, 115)">
                      <circle cx="20" cy="20" r="24" fill="#EF4444" opacity="0.3" />
                      <circle cx="20" cy="20" r="16" fill="#EF4444" opacity="0.6" />
                      <path d="M 12 30 C 12 12 28 12 28 30 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
                      <line x1="16" y1="30" x2="16" y2="55" stroke="#CBD5E1" strokeWidth="2.5" />
                      <path d="M 24 30 L 24 38 L 28 44 L 26 55" fill="none" stroke="#CBD5E1" strokeWidth="2.5" />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </section>

          {/* DASHBOARD MAIN SECTION */}
          <main style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 24px' }}>
            {/* RECENT PROJECTS HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 28,
                    fontWeight: 700,
                    color: '#1F2321',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <FolderOpen color="#E98B5A" size={28} /> Saved Circuit Projects
                </h2>
                <p style={{ fontSize: 14, color: '#5F6862', marginTop: 4 }}>
                  Resume work on your saved schematics, firmware code, and PCB netlists.
                </p>
              </div>

              <button
                onClick={onLaunchSimulator}
                style={{
                  backgroundColor: '#2F3E34',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '11px 20px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 12px rgba(47, 62, 52, 0.15)',
                }}
              >
                <Plus size={16} /> New Circuit
              </button>
            </div>

            {/* PROJECTS GRID */}
            {userProjects.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: 24,
                  marginBottom: 64,
                }}
              >
                {userProjects.map((proj) => (
                  <div
                    key={proj.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2DACD',
                      borderRadius: 14,
                      padding: 24,
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(47, 62, 52, 0.04)',
                    }}
                    onClick={() => onOpenProject(proj)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div
                        style={{
                          fontFamily: "'Playfair Display', Georgia, serif",
                          fontSize: 18,
                          fontWeight: 700,
                          color: '#1F2321',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: 210,
                        }}
                      >
                        {proj.name}
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 12,
                          backgroundColor: 'rgba(233, 139, 90, 0.12)',
                          color: '#E98B5A',
                          border: '1px solid rgba(233, 139, 90, 0.3)',
                        }}
                      >
                        {proj.components?.length || 0} Components
                      </span>
                    </div>

                    <div style={{ fontSize: 13, color: '#5F6862', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
                      <Clock size={14} color="#82977E" /> Updated {new Date(proj.updatedAt || Date.now()).toLocaleDateString()}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid #F0EAE1',
                        paddingTop: 16,
                      }}
                    >
                      <span style={{ fontSize: 12, color: '#5F6862', fontWeight: 600 }}>Wires: {proj.wires?.length || 0}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenProject(proj);
                        }}
                        style={{
                          backgroundColor: '#2F3E34',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '7px 16px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Open Circuit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1.5px dashed #CBBBA0',
                  borderRadius: 16,
                  padding: 48,
                  textAlign: 'center',
                  marginBottom: 64,
                }}
              >
                <Cpu size={44} color="#82977E" style={{ marginBottom: 14 }} />
                <div
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#1F2321',
                    marginBottom: 8,
                  }}
                >
                  No Saved Circuits Yet
                </div>
                <p style={{ fontSize: 14, color: '#5F6862', maxWidth: 460, margin: '0 auto 24px auto', lineHeight: 1.6 }}>
                  Launch the VoltFlow simulator or pick one of our pre-wired circuit templates below to begin designing.
                </p>
                <button
                  onClick={onLaunchSimulator}
                  style={{
                    backgroundColor: '#E98B5A',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(233, 139, 90, 0.3)',
                  }}
                >
                  Start First Circuit
                </button>
              </div>
            )}

            {/* FEATURED TEMPLATES PREVIEW */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 28,
                    fontWeight: 700,
                    color: '#1F2321',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <Sparkles color="#E98B5A" size={28} /> Featured Circuit Templates
                </h2>
                <p style={{ fontSize: 14, color: '#5F6862', marginTop: 4 }}>
                  Select from 50 pre-wired circuit schematics with ready-to-run microcontroller C++ sketches.
                </p>
              </div>

              <button
                onClick={() => {
                  setActiveTab('templates');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#2F3E34',
                  border: '1px solid #CBBBA0',
                  padding: '10px 18px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                View All 50 Templates <ArrowRight size={15} color="#E98B5A" />
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 24,
                marginBottom: 72,
              }}
            >
              {CIRCUIT_TEMPLATES.slice(0, 8).map((item) => {
                const IconComp = getIconForCategory(item.category);
                return (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2DACD',
                      borderRadius: 14,
                      padding: 24,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 16px rgba(47, 62, 52, 0.03)',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                    onClick={() => onCreatePresetCircuit(item.id, item)}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 18,
                        }}
                      >
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            backgroundColor: '#F7F4EE',
                            borderRadius: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #E2DACD',
                          }}
                        >
                          <IconComp size={22} color={item.color} />
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: 12,
                            backgroundColor: '#F7F4EE',
                            color: item.color,
                            border: `1px solid ${item.color}40`,
                          }}
                        >
                          {item.badge}
                        </span>
                      </div>

                      <div
                        style={{
                          fontFamily: "'Playfair Display', Georgia, serif",
                          fontSize: 18,
                          fontWeight: 700,
                          color: '#1F2321',
                          marginBottom: 8,
                        }}
                      >
                        {item.name}
                      </div>

                      <p style={{ fontSize: 13, color: '#5F6862', lineHeight: 1.55, marginBottom: 20 }}>
                        {item.desc}
                      </p>
                    </div>

                    <button
                      onClick={() => onCreatePresetCircuit(item.id, item)}
                      style={{
                        backgroundColor: '#F7F4EE',
                        color: '#2F3E34',
                        border: '1px solid #CBBBA0',
                        padding: '10px 16px',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        width: '100%',
                      }}
                    >
                      Load Template <ChevronRight size={15} color="#E98B5A" />
                    </button>
                  </div>
                );
              })}
            </div>
          </main>
        </>
      ) : (
        /* TEMPLATES TAB VIEW (50 FULL CIRCUIT TEMPLATES) */
        <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 80px 24px' }}>
          {/* HEADER BANNER */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 18,
              border: '1px solid #E2DACD',
              padding: '36px 40px',
              marginBottom: 36,
              boxShadow: '0 4px 20px rgba(47, 62, 52, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: '#82977E',
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Sparkles size={16} color="#E98B5A" /> 50 PRE-WIRED SCHEMATICS
                </div>
                <h1
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 36,
                    fontWeight: 700,
                    color: '#1F2321',
                    margin: 0,
                  }}
                >
                  Circuit Template Library
                </h1>
                <p style={{ fontSize: 15, color: '#5F6862', marginTop: 8, maxWidth: 640 }}>
                  Select from 50 ready-to-run circuit schematics with fully wired microcontrollers, analog sensors, motors, displays, and C++ firmware code.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={onLaunchSimulator}
                  style={{
                    backgroundColor: '#E98B5A',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '12px 22px',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 14px rgba(233, 139, 90, 0.3)',
                  }}
                >
                  Blank Canvas <Plus size={16} />
                </button>
              </div>
            </div>

            {/* SEARCH BAR & CATEGORY BAR */}
            <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid #F0EAE1' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
                {/* Search Input */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 280,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    backgroundColor: '#F7F4EE',
                    border: '1px solid #CBBBA0',
                    borderRadius: 10,
                    padding: '10px 16px',
                  }}
                >
                  <Search size={18} color="#82977E" />
                  <input
                    type="text"
                    placeholder="Search 50 templates by keyword, sensor, or component (e.g., 'Servo', 'DHT11', 'OLED')..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      flex: 1,
                      backgroundColor: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: 14,
                      color: '#1F2321',
                      fontWeight: 600,
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{ background: 'none', border: 'none', color: '#82977E', cursor: 'pointer', padding: 2 }}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div style={{ fontSize: 13, fontWeight: 700, color: '#5F6862', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <SlidersHorizontal size={15} color="#E98B5A" />
                  Showing {filteredTemplates.length} of 50 Templates
                </div>
              </div>

              {/* Category Filter Pills */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {TEMPLATE_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  const count = cat === 'All' ? 50 : CIRCUIT_TEMPLATES.filter((t) => t.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 700,
                        border: isSelected ? '1px solid #2F3E34' : '1px solid #E2DACD',
                        backgroundColor: isSelected ? '#2F3E34' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#4A524D',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      {cat}
                      <span
                        style={{
                          fontSize: 11,
                          padding: '1px 6px',
                          borderRadius: 10,
                          backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#F7F4EE',
                          color: isSelected ? '#FFFFFF' : '#82977E',
                        }}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* TEMPLATES GRID */}
          {filteredTemplates.length === 0 ? (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                border: '1.5px dashed #CBBBA0',
                padding: 48,
                textAlign: 'center',
              }}
            >
              <Search size={40} color="#82977E" style={{ marginBottom: 12 }} />
              <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: '#1F2321' }}>
                No templates found for "{searchQuery}"
              </h3>
              <p style={{ margin: '0 0 20px', fontSize: 13, color: '#5F6862' }}>
                Try searching for keywords like "Arduino", "Sensor", "Servo", "LCD", or "Timer".
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                style={{
                  padding: '9px 18px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#2F3E34',
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Clear Search Filters
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 24,
              }}
            >
              {filteredTemplates.map((item) => {
                const IconComp = getIconForCategory(item.category);
                return (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2DACD',
                      borderRadius: 16,
                      padding: 24,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 16px rgba(47, 62, 52, 0.03)',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                    onClick={() => onCreatePresetCircuit(item.id, item)}
                  >
                    <div>
                      {/* Badge & Category Header */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 16,
                        }}
                      >
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            backgroundColor: '#F7F4EE',
                            borderRadius: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #E2DACD',
                          }}
                        >
                          <IconComp size={22} color={item.color} />
                        </div>

                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '3px 10px',
                              borderRadius: 12,
                              backgroundColor: '#F7F4EE',
                              color: item.color,
                              border: `1px solid ${item.color}40`,
                            }}
                          >
                            {item.badge}
                          </span>
                        </div>
                      </div>

                      {/* Template Title */}
                      <h3
                        style={{
                          fontFamily: "'Playfair Display', Georgia, serif",
                          fontSize: 18,
                          fontWeight: 700,
                          color: '#1F2321',
                          margin: '0 0 8px 0',
                          lineHeight: 1.3,
                        }}
                      >
                        {item.name}
                      </h3>

                      {/* Description */}
                      <p style={{ fontSize: 13, color: '#5F6862', lineHeight: 1.55, margin: '0 0 20px 0' }}>
                        {item.desc}
                      </p>
                    </div>

                    {/* Metadata & Launch CTA */}
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          gap: 12,
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#82977E',
                          marginBottom: 16,
                          paddingTop: 12,
                          borderTop: '1px solid #F0EAE1',
                        }}
                      >
                        <span>{item.components?.length || item.componentsCount} components</span>
                        <span>•</span>
                        <span>{item.wires?.length || 0} wires</span>
                        <span>•</span>
                        <span>{item.category}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreatePresetCircuit(item.id, item);
                        }}
                        style={{
                          backgroundColor: '#2F3E34',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '11px 18px',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          width: '100%',
                          boxShadow: '0 2px 8px rgba(47, 62, 52, 0.15)',
                        }}
                      >
                        Load Template <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      )}

      {/* FOOTER */}
      <footer
        style={{
          backgroundColor: '#2F3E34',
          color: '#F7F4EE',
          borderTop: '1px solid #1F2321',
          padding: '56px 24px 32px 24px',
          fontSize: 13,
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '2fr repeat(3, 1fr)',
            gap: 40,
            marginBottom: 44,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <img
                src="/voltflow-logo.png"
                alt="VoltFlow Studio"
                style={{ height: 52, filter: 'brightness(0) invert(1) contrast(1.2)' }}
              />
            </div>
            <p style={{ fontSize: 13, color: '#CBBBA0', lineHeight: 1.6, maxWidth: 360, margin: '0 0 16px 0' }}>
              VoltFlow Studio is a professional EDA circuit simulation platform for engineers, students, and makers worldwide.
            </p>
            <div style={{ fontSize: 12, color: '#82977E', fontWeight: 600 }}>
              Designed &amp; Created By Vedant.Ravindra.Puranik
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: '#FFFFFF', marginBottom: 14, fontSize: 14 }}>Product</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: '#CBBBA0' }}>
              <span style={{ cursor: 'pointer' }} onClick={onLaunchSimulator}>Circuit Simulator</span>
              <span style={{ cursor: 'pointer' }} onClick={() => setActiveTab('templates')}>50 Circuit Templates</span>
              <span style={{ cursor: 'pointer' }} onClick={onLaunchSimulator}>PCB Gerber Generator</span>
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: '#FFFFFF', marginBottom: 14, fontSize: 14 }}>Legal &amp; Support</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: '#CBBBA0' }}>
              <span style={{ cursor: 'pointer' }} onClick={onNavigatePrivacy}>Privacy Policy</span>
              <span style={{ cursor: 'pointer' }} onClick={onNavigateTerms}>Terms &amp; Conditions</span>
              <span style={{ cursor: 'pointer' }} onClick={onOpenAuthModal}>Account Management</span>
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: '#FFFFFF', marginBottom: 14, fontSize: 14 }}>Connect</div>
            <p style={{ fontSize: 12, color: '#CBBBA0', lineHeight: 1.5, margin: 0 }}>
              Need custom EDA component models or enterprise features? Contact data protection team.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: 1280, margin: '0 auto', borderTop: '1px solid #4A524D', paddingTop: 24, textAlign: 'center', color: '#82977E', fontSize: 12 }}>
          &copy; {new Date().getFullYear()} VoltFlow Studio. Electronics Made Simple | Designed &amp; Created By Vedant.Ravindra.Puranik. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
