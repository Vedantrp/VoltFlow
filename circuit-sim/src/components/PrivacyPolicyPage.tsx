import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Printer,
  ArrowLeft,
  Lock,
  Eye,
  Database,
  Globe,
  FileText,
  UserCheck,
  Cpu,
  Mail,
  CheckCircle2,
} from 'lucide-react';

interface PrivacyPolicyPageProps {
  onNavigateHome: () => void;
  onNavigateSimulator: () => void;
  onNavigateTerms: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({
  onNavigateHome,
  onNavigateSimulator,
  onNavigateTerms,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string>('overview');

  const lastUpdatedDate = 'September 26, 2026';

  const sections = [
    { id: 'overview', title: '1. Overview & Data Controller', icon: ShieldCheck },
    { id: 'data-collection', title: '2. Information We Collect', icon: Eye },
    { id: 'data-use', title: '3. How We Use Your Information', icon: Cpu },
    { id: 'data-sharing', title: '4. Third-Party Data Sharing', icon: Globe },
    { id: 'security', title: '5. Security & Encryption Standards', icon: Lock },
    { id: 'user-rights', title: '6. Your Rights & Choices (GDPR/CCPA)', icon: UserCheck },
    { id: 'cookies', title: '7. Cookies & Browser Storage', icon: Database },
    { id: 'minors', title: '8. Educational & Children’s Privacy', icon: FileText },
    { id: 'retention', title: '9. Data Retention & Transfers', icon: CheckCircle2 },
    { id: 'contact', title: '10. Contact & Privacy Officer', icon: Mail },
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
      className="privacy-policy-page"
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
            <button
              onClick={onNavigateTerms}
              style={{ background: 'none', border: 'none', color: '#4A524D', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
            >
              Terms & Conditions
            </button>
            <span
              style={{
                color: '#E98B5A',
                fontWeight: 700,
                borderBottom: '2px solid #E98B5A',
                paddingBottom: 4,
              }}
            >
              Privacy Policy
            </span>
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
              <Printer size={15} color="#4A524D" /> Print Policy
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
            Privacy Policy & Data Transparency
          </h1>
          <p style={{ fontSize: 16, color: '#4A524D', maxWidth: 800, lineHeight: 1.65, marginBottom: 24 }}>
            VoltFlow Studio Inc. (&quot;VoltFlow&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy, schematic IP, firmware source code, and personal data. This Policy governs your use of the VoltFlow Electronic Design Automation workspace, SPICE engine, and cloud sync services.
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
              <ShieldCheck size={14} color="#82977E" /> ISO/IEC 27001 & GDPR Compliant
            </span>
            <span>Effective Date: <strong>{lastUpdatedDate}</strong></span>
            <span>Last Updated: <strong>{lastUpdatedDate}</strong></span>
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
              placeholder="Search policy topics..."
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
          {/* SECTION 1: OVERVIEW */}
          {matchesSearch('overview data controller security scope') && (
            <section
              id="overview"
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
                <ShieldCheck color="#E98B5A" size={26} /> 1. Overview & Data Controller Information
              </h2>
              <p>
                VoltFlow Studio Inc. operates the browser-based electronic circuit design simulator, schematic capture tools, AVR microcontroller WebAssembly emulator, SPICE engine, and PCB layout software (collectively, the &quot;Services&quot;).
              </p>
              <p style={{ marginTop: 12 }}>
                When you create an account, design hardware circuits, write embedded firmware code, or save projects to our cloud database, VoltFlow acts as the <strong>Data Controller</strong> responsible for safeguarding your electronic intellectual property and personal data under applicable data protection laws, including the European Union General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA/CPRA).
              </p>
            </section>
          )}

          {/* SECTION 2: INFORMATION WE COLLECT */}
          {matchesSearch('collect schematic netlist code account IP address localstorage') && (
            <section
              id="data-collection"
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
                <Eye color="#2F3E34" size={26} /> 2. Information We Collect
              </h2>
              <p>We collect data to provide, optimize, and secure your electronic design workflows:</p>

              <ul style={{ paddingLeft: 20, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <li>
                  <strong style={{ color: '#1F2321' }}>A. Account & Profile Information:</strong> When you register via email, OAuth, or Firebase Authentication, we store your full name, email address, profile avatar, and account tier.
                </li>
                <li>
                  <strong style={{ color: '#1F2321' }}>B. Circuit Schematics & Embedded Code:</strong> Component configurations (resistors, ICs, microcontrollers, LCD displays), wire routing coordinates, netlists, C/C++ firmware files, and bill-of-materials (BOM) data saved to your account.
                </li>
                <li>
                  <strong style={{ color: '#1F2321' }}>C. Browser & Device Telemetry:</strong> IP address, browser user-agent, WebGL/Canvas rendering metrics, WebAssembly performance diagnostics, and error stack trace logs generated during SPICE simulation execution.
                </li>
                <li>
                  <strong style={{ color: '#1F2321' }}>D. Local Storage & Autosave Data:</strong> Local storage cached circuit state stored directly inside your browser so you never lose work during network disconnects.
                </li>
              </ul>
            </section>
          )}

          {/* SECTION 3: HOW WE USE YOUR INFORMATION */}
          {matchesSearch('use simulation spice engine AI assist cloud save') && (
            <section
              id="data-use"
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
                <Cpu color="#82977E" size={26} /> 3. How We Use Your Information
              </h2>
              <p>Your data is processed strictly for legitimate engineering and platform operation purposes:</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 18 }}>
                <div style={{ backgroundColor: '#F7F4EE', padding: 18, borderRadius: 10, border: '1px solid #E2DACD' }}>
                  <div style={{ fontWeight: 700, color: '#1F2321', marginBottom: 6 }}>Real-Time Circuit Simulation</div>
                  <div style={{ fontSize: 13, color: '#4A524D' }}>To execute SPICE matrix solvers, digital AVR code compilation, and WebGL 3D PCB trace visualizers.</div>
                </div>

                <div style={{ backgroundColor: '#F7F4EE', padding: 18, borderRadius: 10, border: '1px solid #E2DACD' }}>
                  <div style={{ fontWeight: 700, color: '#1F2321', marginBottom: 6 }}>Cloud Project Sync</div>
                  <div style={{ fontSize: 13, color: '#4A524D' }}>To sync your saved schematics across desktop, mobile, and web browsers securely.</div>
                </div>

                <div style={{ backgroundColor: '#F7F4EE', padding: 18, borderRadius: 10, border: '1px solid #E2DACD' }}>
                  <div style={{ fontWeight: 700, color: '#1F2321', marginBottom: 6 }}>AI Assistant & Validation</div>
                  <div style={{ fontSize: 13, color: '#4A524D' }}>To analyze circuit components for wiring errors, short circuits, voltage mismatches, or firmware debugging.</div>
                </div>

                <div style={{ backgroundColor: '#F7F4EE', padding: 18, borderRadius: 10, border: '1px solid #E2DACD' }}>
                  <div style={{ fontWeight: 700, color: '#1F2321', marginBottom: 6 }}>Security & Protection</div>
                  <div style={{ fontSize: 13, color: '#4A524D' }}>To detect denial-of-service attacks, automated code injection, or unauthorized cloud API access.</div>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 4: THIRD PARTY SERVICES */}
          {matchesSearch('third party firebase cloudflare monaco wokwi') && (
            <section
              id="data-sharing"
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
                <Globe color="#E98B5A" size={26} /> 4. Third-Party Data Sharing & Partners
              </h2>
              <p>
                <strong>VoltFlow DOES NOT sell, rent, or trade your personal information or circuit schematics to third-party advertisers.</strong>
              </p>
              <p style={{ marginTop: 12 }}>
                We share data only with verified sub-processors necessary to run the infrastructure:
              </p>
              <ul style={{ paddingLeft: 20, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li><strong>Firebase Authentication & Database:</strong> User auth tokens and cloud circuit storage.</li>
                <li><strong>Cloudflare Workers / API Gateway:</strong> High-speed compilation endpoints for C++ AVR code compilation.</li>
                <li><strong>Monaco Code Editor CDN:</strong> Delivering browser code editor assets securely.</li>
              </ul>
            </section>
          )}

          {/* SECTION 5: SECURITY */}
          {matchesSearch('security encryption TLS AES 256 SSL backup') && (
            <section
              id="security"
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
                <Lock color="#2F3E34" size={26} /> 5. Data Security & Encryption Standards
              </h2>
              <p>
                We enforce military-grade security to ensure your hardware designs and code remain completely private:
              </p>
              <div
                style={{
                  marginTop: 18,
                  padding: 20,
                  backgroundColor: '#F7F4EE',
                  border: '1px solid #CBBBA0',
                  borderRadius: 10,
                }}
              >
                <div style={{ fontWeight: 800, color: '#2F3E34', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={20} color="#E98B5A" /> End-to-End Transit & Rest Protection
                </div>
                <div style={{ fontSize: 14, color: '#4A524D' }}>
                  All network communication is encrypted using TLS 1.3 with 256-bit AES encryption. Cloud schematics and user backups are stored in encrypted databases with strict identity access controls.
                </div>
              </div>
            </section>
          )}

          {/* SECTION 6: USER RIGHTS */}
          {matchesSearch('rights export delete GDPR CCPA access data') && (
            <section
              id="user-rights"
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
                <UserCheck color="#82977E" size={26} /> 6. Your Rights & Choices (GDPR & CCPA)
              </h2>
              <p>Regardless of your geographic location, VoltFlow provides comprehensive control over your personal data:</p>
              <ul style={{ paddingLeft: 20, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li><strong style={{ color: '#1F2321' }}>Right to Access & Export:</strong> You can download all saved schematics, netlists, and code files directly as standard `.json` files anytime.</li>
                <li><strong style={{ color: '#1F2321' }}>Right to Deletion (Right to be Forgotten):</strong> You can request complete deletion of your account, profile, and cloud-stored circuits anytime.</li>
                <li><strong style={{ color: '#1F2321' }}>Opt-Out of Telemetry:</strong> You can disable usage analytics in your account settings.</li>
              </ul>
            </section>
          )}

          {/* SECTION 7: COOKIES & STORAGE */}
          {matchesSearch('cookies storage session localStorage indexedDB') && (
            <section
              id="cookies"
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
                <Database color="#E98B5A" size={26} /> 7. Cookies & Local Storage Policy
              </h2>
              <p>
                VoltFlow uses minimal session cookies and HTML5 LocalStorage to maintain user authentication state and autosave working circuit models:
              </p>
              <div style={{ marginTop: 14, backgroundColor: '#F7F4EE', borderRadius: 10, padding: 16, border: '1px solid #E2DACD', fontSize: 14 }}>
                <code style={{ color: '#2F3E34', fontWeight: 700 }}>voltflow_circuit_store</code> : Caches current canvas components & wire positions.<br />
                <code style={{ color: '#2F3E34', fontWeight: 700 }}>voltflow_auth_user</code> : Persists user login session state.
              </div>
            </section>
          )}

          {/* SECTION 8: EDUCATIONAL & MINORS */}
          {matchesSearch('children minor education school STEM COPPA') && (
            <section
              id="minors"
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
                <FileText color="#2F3E34" size={26} /> 8. Educational Use & Children’s Privacy (COPPA)
              </h2>
              <p>
                VoltFlow EDA Platform is widely utilized in universities, STEM electronics classes, and robotics clubs. We strictly adhere to the Children&apos;s Online Privacy Protection Act (COPPA) and FERPA guidelines. We do not knowingly collect personal information from children under 13 without verifiable parental or educational institution consent.
              </p>
            </section>
          )}

          {/* SECTION 9: RETENTION */}
          {matchesSearch('retention transfer global server backup') && (
            <section
              id="retention"
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
                <CheckCircle2 color="#82977E" size={26} /> 9. Data Retention & International Transfers
              </h2>
              <p>
                We retain user circuit files as long as your account remains active. Inactive cloud projects with deleted user accounts are permanently scrubbed from our primary servers within 30 days.
              </p>
            </section>
          )}

          {/* SECTION 10: CONTACT */}
          {matchesSearch('contact DPO support email address') && (
            <section
              id="contact"
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
                <Mail color="#E98B5A" size={26} /> 10. Contact Us & Data Protection Officer
              </h2>
              <p>
                If you have questions, data request inquiries, or security reports, please reach out to our legal and security compliance team:
              </p>

              <div style={{ marginTop: 18, backgroundColor: '#F7F4EE', padding: 22, borderRadius: 12, border: '1px solid #E2DACD' }}>
                <div style={{ fontWeight: 800, color: '#1F2321', fontSize: 16 }}>VoltFlow Data Protection Office</div>
                <div style={{ marginTop: 8, fontSize: 14, color: '#4A524D' }}>
                  Email:{' '}
                  <a href="mailto:privacy@voltflow-eda.com" style={{ color: '#E98B5A', textDecoration: 'none', fontWeight: 600 }}>
                    puranikvedant3@gmail.com
                  </a>
                </div>

                <div style={{ marginTop: 4, fontSize: 14, color: '#4A524D' }}>HQ: Virtual </div>
                <div style={{ marginTop: 4, fontSize: 14, color: '#4A524D' }}>Designed & devloped by Vedant Puranik </div>
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
            <button onClick={onNavigateTerms} style={{ background: 'none', border: 'none', color: '#CBBBA0', cursor: 'pointer', fontSize: 13 }}>
              Terms & Conditions
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
