import React, { useState } from 'react';
import {
  FileText,
  Search,
  Printer,
  ArrowLeft,
  Shield,
  AlertTriangle,
  Cpu,
  Lock,
  Globe,
  Scale,
  CheckCircle2,
  Mail,
  HelpCircle,
} from 'lucide-react';

interface TermsConditionsPageProps {
  onNavigateHome: () => void;
  onNavigateSimulator: () => void;
  onNavigatePrivacy: () => void;
}

export const TermsConditionsPage: React.FC<TermsConditionsPageProps> = ({
  onNavigateHome,
  onNavigateSimulator,
  onNavigatePrivacy,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string>('acceptance');

  const lastUpdatedDate = 'September 26, 2026';

  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms', icon: FileText },
    { id: 'license', title: '2. Platform License & Permitted Use', icon: Shield },
    { id: 'accounts', title: '3. User Accounts & Security', icon: Lock },
    { id: 'intellectual-property', title: '4. IP & Schematic Ownership', icon: Cpu },
    { id: 'simulation-disclaimer', title: '5. SPICE & Simulation Disclaimer', icon: AlertTriangle },
    { id: 'cloud-services', title: '6. Cloud Sync & API Usage Limits', icon: Globe },
    { id: 'acceptable-use', title: '7. Prohibited Conduct', icon: Scale },
    { id: 'warranty-limitation', title: '8. Limitation of Liability', icon: HelpCircle },
    { id: 'termination', title: '9. Account Termination', icon: CheckCircle2 },
    { id: 'governing-law', title: '10. Governing Law & Legal Contact', icon: Mail },
  ];

  const handlePrint = () => {
    window.print();
  };

  const matchesSearch = (text: string) => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  return (
    <div
      className="terms-conditions-page"
      style={{
        backgroundColor: '#F7F4EE',
        color: '#1F2321',
        fontFamily: "'Inter', -apple-system, sans-serif",
        minHeight: '100vh',
        width: '100%',
      }}
    >
      {/* HEADER / NAVIGATION BAR */}
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
            onClick={onNavigateHome}
          >
            <img
              src="/voltflow-logo.png"
              alt="VoltFlow Studio"
              style={{ height: 60, width: 'auto', objectFit: 'contain', display: 'block' }}
            />
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 14, fontWeight: 600 }}>
            <button
              onClick={onNavigateHome}
              style={{ background: 'none', border: 'none', color: '#4A524D', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
            >
              Home / Dashboard
            </button>
            <button
              onClick={onNavigateSimulator}
              style={{ background: 'none', border: 'none', color: '#4A524D', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
            >
              Simulator
            </button>
            <span
              style={{
                color: '#E98B5A',
                fontWeight: 700,
                borderBottom: '2px solid #E98B5A',
                paddingBottom: 4,
              }}
            >
              Terms & Conditions
            </span>
            <button
              onClick={onNavigatePrivacy}
              style={{ background: 'none', border: 'none', color: '#4A524D', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
            >
              Privacy Policy
            </button>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={handlePrint}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#1F2321',
                border: '1px solid #CBBBA0',
                padding: '9px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Printer size={15} color="#4A524D" /> Print Terms
            </button>
            <button
              onClick={onNavigateSimulator}
              style={{
                backgroundColor: '#2F3E34',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(47, 62, 52, 0.2)',
              }}
            >
              Launch Simulator
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section
        style={{
          backgroundColor: '#F7F4EE',
          borderBottom: '1px solid #E2DACD',
          padding: '52px 24px 60px 24px',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <button
              onClick={onNavigateHome}
              style={{
                background: 'none',
                border: 'none',
                color: '#E98B5A',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 44,
              fontWeight: 700,
              color: '#1F2321',
              marginBottom: 14,
              letterSpacing: '-0.02em',
            }}
          >
            Terms of Service & Engineering Agreement
          </h1>
          <p style={{ fontSize: 16, color: '#4A524D', maxWidth: 800, lineHeight: 1.65, marginBottom: 24 }}>
            Please read these Terms and Conditions (&quot;Terms&quot;) carefully before using the VoltFlow Electronic Design Automation workspace, SPICE engine, microcontroller C++ compiler backend, and cloud project storage.
          </p>

          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', fontSize: 13, color: '#4A524D' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: '#FFFFFF',
                padding: '6px 14px',
                borderRadius: 20,
                border: '1px solid #CBBBA0',
                fontWeight: 600,
              }}
            >
              <Scale size={14} color="#82977E" /> Standard Master Services Agreement
            </span>
            <span>Effective Date: <strong>{lastUpdatedDate}</strong></span>
            <span>Last Revision: <strong>{lastUpdatedDate}</strong></span>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '48px 24px 80px 24px',
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: 48,
        }}
      >
        {/* SIDEBAR NAVIGATION & SEARCH */}
        <aside style={{ position: 'sticky', top: 96, height: 'fit-content' }}>
          {/* Search Box */}
          <div style={{ marginBottom: 20, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: 12, color: '#82977E' }} />
            <input
              type="text"
              placeholder="Search terms & legal clauses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBBBA0',
                borderRadius: 10,
                padding: '10px 12px 10px 38px',
                color: '#1F2321',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2DACD',
              borderRadius: 14,
              padding: 20,
              boxShadow: '0 4px 16px rgba(47, 62, 52, 0.03)',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: '#82977E',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 14,
              }}
            >
              Table of Contents
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {sections.map((sec) => {
                const IconComponent = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    onClick={() => setActiveSection(sec.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 12px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#E98B5A' : '#4A524D',
                      backgroundColor: isActive ? 'rgba(233, 139, 90, 0.1)' : 'transparent',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <IconComponent size={15} color={isActive ? '#E98B5A' : '#82977E'} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {sec.title}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </aside>

        {/* POLICY DOCUMENT CONTENT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40, lineHeight: 1.7, fontSize: 15, color: '#4A524D' }}>
          {/* SECTION 1: ACCEPTANCE OF TERMS */}
          {matchesSearch('acceptance agreement binding legal service') && (
            <section
              id="acceptance"
              style={{
                scrollMarginTop: 110,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2DACD',
                borderRadius: 14,
                padding: 36,
                boxShadow: '0 4px 16px rgba(47, 62, 52, 0.03)',
              }}
            >
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#1F2321',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <FileText color="#E98B5A" size={26} /> 1. Acceptance of Terms & Legal Binding
              </h2>
              <p>
                By accessing, registering, or using the VoltFlow Electronic Design Automation platform (&quot;VoltFlow Studio&quot;), you agree to be legally bound by these Terms and Conditions. If you do not agree to all terms, you may not access or use the platform.
              </p>
            </section>
          )}

          {/* SECTION 2: PLATFORM LICENSE */}
          {matchesSearch('license permitted use commercial educational STEM') && (
            <section
              id="license"
              style={{
                scrollMarginTop: 110,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2DACD',
                borderRadius: 14,
                padding: 36,
                boxShadow: '0 4px 16px rgba(47, 62, 52, 0.03)',
              }}
            >
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#1F2321',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <Shield color="#2F3E34" size={26} /> 2. Platform License & Permitted Use
              </h2>
              <p>VoltFlow grants you a non-exclusive, non-transferable, revocable license to use VoltFlow Studio for personal, educational, research, or commercial circuit design purposes, subject to these Terms.</p>
            </section>
          )}

          {/* SECTION 3: USER ACCOUNTS */}
          {matchesSearch('account password security credential isolation multi tenant') && (
            <section
              id="accounts"
              style={{
                scrollMarginTop: 110,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2DACD',
                borderRadius: 14,
                padding: 36,
                boxShadow: '0 4px 16px rgba(47, 62, 52, 0.03)',
              }}
            >
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#1F2321',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <Lock color="#82977E" size={26} /> 3. User Accounts & Security
              </h2>
              <p>You are responsible for safeguarding your account credentials and for all activities that occur under your account. VoltFlow enforces strict multi-tenant project isolation via Firebase security rules.</p>
            </section>
          )}

          {/* SECTION 4: INTELLECTUAL PROPERTY */}
          {matchesSearch('intellectual property schematic ownership copyright IP source code') && (
            <section
              id="intellectual-property"
              style={{
                scrollMarginTop: 110,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2DACD',
                borderRadius: 14,
                padding: 36,
                boxShadow: '0 4px 16px rgba(47, 62, 52, 0.03)',
              }}
            >
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#1F2321',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <Cpu color="#E98B5A" size={26} /> 4. Intellectual Property & Schematic Ownership
              </h2>
              <p>
                <strong>You retain 100% ownership of all circuit schematics, C/C++ firmware code, PCB netlists, and custom footprint components created using VoltFlow Studio.</strong> VoltFlow claims no copyright or proprietary rights over your hardware designs.
              </p>
            </section>
          )}

          {/* SECTION 5: SIMULATION DISCLAIMER */}
          {matchesSearch('disclaimer SPICE simulation manufacturing precision accuracy') && (
            <section
              id="simulation-disclaimer"
              style={{
                scrollMarginTop: 110,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2DACD',
                borderRadius: 14,
                padding: 36,
                boxShadow: '0 4px 16px rgba(47, 62, 52, 0.03)',
              }}
            >
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#1F2321',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <AlertTriangle color="#E98B5A" size={26} /> 5. SPICE & Simulation Engineering Disclaimer
              </h2>
              <p>
                VoltFlow Studio provides computer-aided circuit simulation based on numerical SPICE algorithms and AVR WebAssembly models. While designed for high fidelity, simulations are mathematical approximations. <strong>VoltFlow does not guarantee physical hardware fabrication outcomes. Users must perform physical breadboard testing before high-voltage or life-critical PCB manufacturing.</strong>
              </p>
            </section>
          )}

          {/* SECTION 6: CLOUD SERVICES */}
          {matchesSearch('cloud sync rate limit compile server API usage') && (
            <section
              id="cloud-services"
              style={{
                scrollMarginTop: 110,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2DACD',
                borderRadius: 14,
                padding: 36,
                boxShadow: '0 4px 16px rgba(47, 62, 52, 0.03)',
              }}
            >
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#1F2321',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <Globe color="#2F3E34" size={26} /> 6. Cloud Services & Compilation Limits
              </h2>
              <p>
                To maintain server stability, C++ compilation requests and cloud autosave API endpoints are subject to rate limiting (e.g., max 30 compilations/min per IP address).
              </p>
            </section>
          )}

          {/* SECTION 7: ACCEPTABLE USE */}
          {matchesSearch('prohibited conduct malware reverse engineer abuse') && (
            <section
              id="acceptable-use"
              style={{
                scrollMarginTop: 110,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2DACD',
                borderRadius: 14,
                padding: 36,
                boxShadow: '0 4px 16px rgba(47, 62, 52, 0.03)',
              }}
            >
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#1F2321',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <Scale color="#82977E" size={26} /> 7. Prohibited Conduct & Acceptable Use
              </h2>
              <p>Users are strictly prohibited from attempting denial-of-service attacks, reverse-engineering compilation backends, deploying malicious AVR code payloads, or violating applicable trade sanctions.</p>
            </section>
          )}

          {/* SECTION 8: LIMITATION OF LIABILITY */}
          {matchesSearch('warranty limitation liability indemnity damages') && (
            <section
              id="warranty-limitation"
              style={{
                scrollMarginTop: 110,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2DACD',
                borderRadius: 14,
                padding: 36,
                boxShadow: '0 4px 16px rgba(47, 62, 52, 0.03)',
              }}
            >
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#1F2321',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <HelpCircle color="#2F3E34" size={26} /> 8. Limitation of Liability
              </h2>
              <p>To the maximum extent permitted by applicable law, VoltFlow Studio Inc. shall not be liable for any indirect, incidental, or consequential damages arising from hardware component failure, PCB manufacturing defects, or data loss.</p>
            </section>
          )}

          {/* SECTION 9: TERMINATION */}
          {matchesSearch('termination account deletion close cancel') && (
            <section
              id="termination"
              style={{
                scrollMarginTop: 110,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2DACD',
                borderRadius: 14,
                padding: 36,
                boxShadow: '0 4px 16px rgba(47, 62, 52, 0.03)',
              }}
            >
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#1F2321',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <CheckCircle2 color="#82977E" size={26} /> 9. Account Termination
              </h2>
              <p>You may terminate your account at any time. VoltFlow reserves the right to suspend accounts that violate these Terms or engage in illegal activities.</p>
            </section>
          )}

          {/* SECTION 10: GOVERNING LAW */}
          {matchesSearch('governing law legal contact jurisdiction arbitration') && (
            <section
              id="governing-law"
              style={{
                scrollMarginTop: 110,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2DACD',
                borderRadius: 14,
                padding: 36,
                boxShadow: '0 4px 16px rgba(47, 62, 52, 0.03)',
              }}
            >
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#1F2321',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <Mail color="#E98B5A" size={26} /> 10. Governing Law & Legal Contact
              </h2>
              <p>These Terms are governed by the laws of the State of California, United States. For legal inquiries or formal notices, contact:</p>
              <div style={{ marginTop: 18, backgroundColor: '#F7F4EE', padding: 22, borderRadius: 12, border: '1px solid #E2DACD' }}>
                <div style={{ fontWeight: 800, color: '#1F2321', fontSize: 16 }}>VoltFlow Legal & Compliance Department</div>
                <div style={{ marginTop: 8, fontSize: 14, color: '#4A524D' }}>
                  Legal Counsel:{' '}
                  <a href="mailto:legal@voltflow-eda.com" style={{ color: '#E98B5A', textDecoration: 'none', fontWeight: 600 }}>
                    legal@voltflow-eda.com
                  </a>
                </div>
                <div style={{ marginTop: 4, fontSize: 14, color: '#4A524D' }}>HQ: 500 Silicon Valley Blvd, Suite 400, San Jose, CA 95110</div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          backgroundColor: '#2F3E34',
          color: '#F7F4EE',
          borderTop: '1px solid #1F2321',
          padding: '48px 24px 32px 24px',
          fontSize: 13,
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            © {new Date().getFullYear()} VoltFlow Studio Inc. All rights reserved. |{' '}
            <strong style={{ color: '#E98B5A' }}>Electronics Made Simple</strong>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <button onClick={onNavigateHome} style={{ background: 'none', border: 'none', color: '#CBBBA0', cursor: 'pointer', fontSize: 13 }}>
              Home
            </button>
            <button onClick={onNavigateSimulator} style={{ background: 'none', border: 'none', color: '#CBBBA0', cursor: 'pointer', fontSize: 13 }}>
              Simulator
            </button>
            <button onClick={onNavigatePrivacy} style={{ background: 'none', border: 'none', color: '#CBBBA0', cursor: 'pointer', fontSize: 13 }}>
              Privacy Policy
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
