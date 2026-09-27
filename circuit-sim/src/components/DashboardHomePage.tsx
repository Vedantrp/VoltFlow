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
              padding: '64px 24px 80px 24px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                maxWidth: 1280,
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: '55% 45%',
                gap: 40,
                alignItems: 'center',
              }}
            >
              <div>
                {/* Tagline Eyebrow */}
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: '#82977E',
                    marginBottom: 16,
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

                {/* Hero Title */}
                <h1
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 56,
                    fontWeight: 700,
                    color: '#1F2321',
                    lineHeight: 1.12,
                    letterSpacing: '-0.02em',
                    marginBottom: 22,
                  }}
                >
                  Design. Simulate. <span style={{ color: '#E98B5A' }}>Build.</span>
                </h1>

                <p
                  style={{
                    fontSize: 17,
                    color: '#4A524D',
                    lineHeight: 1.65,
                    marginBottom: 36,
                    maxWidth: 560,
                    fontWeight: 400,
                  }}
                >
                  A modern EDA platform to design circuits, simulate microcontroller firmware, and create professional PCB layouts — all in one place.
                </p>

                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    onClick={onLaunchSimulator}
                    style={{
                      backgroundColor: '#E98B5A',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '14px 28px',
                      borderRadius: 10,
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 10,
                      boxShadow: '0 6px 20px rgba(233, 139, 90, 0.35)',
                      transition: 'transform 0.15s ease',
                    }}
                  >
                    Start Designing <ArrowRight size={17} />
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
                      padding: '14px 24px',
                      borderRadius: 10,
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 2px 8px rgba(47, 62, 52, 0.05)',
                    }}
                  >
                    <Layers size={17} color="#E98B5A" /> Browse 50 Templates
                  </button>
                </div>

                {/* Creator Credit Badge */}
                <div
                  style={{
                    marginTop: 18,
                    fontSize: 13,
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

                {/* Feature Pills */}
                <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      backgroundColor: '#82977E',
                      color: '#FFFFFF',
                      padding: '5px 12px',
                      borderRadius: 16,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    SPICE 3F5
                  </span>
                  <span
                    style={{
                      backgroundColor: '#E98B5A',
                      color: '#FFFFFF',
                      padding: '5px 12px',
                      borderRadius: 16,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    AVR 16MHz
                  </span>
                  <span
                    style={{
                      backgroundColor: '#CBBBA0',
                      color: '#1F2321',
                      padding: '5px 12px',
                      borderRadius: 16,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    Gerber Export
                  </span>
                  <span
                    style={{
                      backgroundColor: '#2F3E34',
                      color: '#FFFFFF',
                      padding: '5px 12px',
                      borderRadius: 16,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    Live LCD &amp; Oscilloscope
                  </span>
                </div>
              </div>

              {/* Main PCB / Circuit Visual Anchor */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  transform: 'translate(10px, 16px)',
                }}
              >
                <img
                  src="/voltflow-pcb-hero.png"
                  alt="VoltFlow Studio PCB & Circuit Visual"
                  style={{
                    width: '100%',
                    maxWidth: 580,
                    height: 'auto',
                    objectFit: 'contain',
                    borderRadius: 16,
                    boxShadow: '0 16px 36px rgba(47, 62, 52, 0.08)',
                    display: 'block',
                  }}
                />
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
