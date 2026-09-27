import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  Phone,
  User,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { authService } from '../services/authService';
import type { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

type AuthMode = 'signin' | 'signup' | 'phone';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  // Phone state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Status state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setPhoneNumber('');
    setOtpCode('');
    setOtpSent(false);
  };

  const handleSwitchMode = (newMode: AuthMode) => {
    resetForm();
    setMode(newMode);
  };

  const handleSubmitEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const user = await authService.signUp(email, password, confirmPassword, displayName);
        setSuccessMsg('Account created successfully! Redirecting...');
        setTimeout(() => {
          onSuccess(user);
          onClose();
        }, 500);
      } else {
        const user = await authService.signIn(email, password);
        setSuccessMsg('Welcome back!');
        setTimeout(() => {
          onSuccess(user);
          onClose();
        }, 400);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const user = await authService.signInWithGoogle();
      setSuccessMsg('Signed in with Google!');
      setTimeout(() => {
        onSuccess(user);
        onClose();
      }, 400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await authService.sendPhoneOtp(phoneNumber);
      setOtpSent(true);
      setSuccessMsg(res.message);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const user = await authService.verifyPhoneOtp(phoneNumber, otpCode);
      setSuccessMsg('Phone verified successfully!');
      setTimeout(() => {
        onSuccess(user);
        onClose();
      }, 400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          backgroundColor: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 24px 18px',
            borderBottom: '1px solid #E2DACD',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            backgroundColor: '#F7F4EE',
            color: '#1F2321',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <img src="/voltflow-logo.png" alt="VoltFlow Studio" style={{ height: 48, objectFit: 'contain' }} />
            </div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", color: '#1F2321' }}>
              {mode === 'signup'
                ? 'Create VoltFlow Account'
                : mode === 'phone'
                ? 'Phone Authentication'
                : 'Sign in to VoltFlow'}
            </h2>
            <p style={{ margin: '4px 0 8px 0', fontSize: 12, color: '#4A524D' }}>
              Secure workspace with multi-tenant project isolation & autosave
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                backgroundColor: authService.isFirebaseModeActive() ? '#D1FAE5' : '#FEF3C7',
                color: authService.isFirebaseModeActive() ? '#065F46' : '#92400E',
                border: authService.isFirebaseModeActive() ? '1px solid #A7F3D0' : '1px solid #FDE68A',
              }}
            >
              {authService.isFirebaseModeActive()
                ? '🔥 Firebase Cloud Auth Connected'
                : '⚡ Demo Local Auth Mode (Add Firebase keys to .env for Cloud Auth)'}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#4A524D',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s, color 0.2s',
            }}
            aria-label="Close"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#EAE4D9';
              e.currentTarget.style.color = '#1F2321';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#4A524D';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* If user is ALREADY signed in: Block duplicate sign-up and offer session management */}
        {authService.getCurrentUser() ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: 22,
                fontWeight: 700,
                margin: '0 auto 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              }}
            >
              {authService.getCurrentUser()?.displayName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
              Already Signed In
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
              You are currently authenticated as <strong>{authService.getCurrentUser()?.displayName}</strong> ({authService.getCurrentUser()?.email || authService.getCurrentUser()?.phoneNumber}).
              <br />
              <span style={{ color: '#ef4444', fontWeight: 600 }}>
                You cannot register a new account while signed in.
              </span>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Continue as {authService.getCurrentUser()?.displayName}
              </button>
              <button
                onClick={() => {
                  authService.signOut();
                  resetForm();
                }}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Sign Out & Switch Account
              </button>
            </div>
          </div>
        ) : (
          <React.Fragment>
            {/* Auth Mode Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #E2DACD', backgroundColor: '#FAF8F5' }}>
              <button
                onClick={() => handleSwitchMode('signin')}
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  border: 'none',
                  backgroundColor: mode === 'signin' ? '#ffffff' : 'transparent',
                  borderBottom: mode === 'signin' ? '2px solid #E98B5A' : 'none',
                  fontWeight: mode === 'signin' ? 700 : 500,
                  color: mode === 'signin' ? '#1F2321' : '#4A524D',
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'color 0.15s, background-color 0.15s',
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => handleSwitchMode('signup')}
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  border: 'none',
                  backgroundColor: mode === 'signup' ? '#ffffff' : 'transparent',
                  borderBottom: mode === 'signup' ? '2px solid #E98B5A' : 'none',
                  fontWeight: mode === 'signup' ? 700 : 500,
                  color: mode === 'signup' ? '#1F2321' : '#4A524D',
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'color 0.15s, background-color 0.15s',
                }}
              >
                Create Account
              </button>
              <button
                onClick={() => handleSwitchMode('phone')}
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  border: 'none',
                  backgroundColor: mode === 'phone' ? '#ffffff' : 'transparent',
                  borderBottom: mode === 'phone' ? '2px solid #E98B5A' : 'none',
                  fontWeight: mode === 'phone' ? 700 : 500,
                  color: mode === 'phone' ? '#1F2321' : '#4A524D',
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'color 0.15s, background-color 0.15s',
                }}
              >
                Phone OTP
              </button>
            </div>

        {/* Form Body */}
        <div style={{ padding: 24 }}>
          {/* Messages */}
          {errorMsg && (
            <div
              style={{
                marginBottom: 16,
                padding: '10px 14px',
                borderRadius: 8,
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                marginBottom: 16,
                padding: '10px 14px',
                borderRadius: 8,
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#15803d',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Social Auth (Google) */}
          {mode !== 'phone' && (
            <div style={{ marginBottom: 20 }}>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  transition: 'background 0.15s ease',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                Continue with Google
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: '18px 0',
                  color: '#94a3b8',
                  fontSize: 12,
                }}
              >
                <div style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
                <span style={{ padding: '0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  or with email
                </span>
                <div style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
              </div>
            </div>
          )}

          {/* Email Form */}
          {mode !== 'phone' ? (
            <form onSubmit={handleSubmitEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {mode === 'signup' && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                    Display Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 11 }} />
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px 9px 36px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: 13,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 11 }} />
                  <input
                    type="email"
                    required
                    placeholder="engineer@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 11 }} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                    Confirm Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 11 }} />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px 9px 36px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: 13,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 6,
                  padding: '11px 16px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
                }}
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : mode === 'signup' ? (
                  <>Create Account <ArrowRight size={16} /></>
                ) : (
                  <>Sign In <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          ) : (
            /* Phone OTP Form */
            <div>
              {/* Invisible Recaptcha Container for Firebase Phone Auth */}
              <div id="recaptcha-container"></div>

              {!otpSent ? (
                <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                      Phone Number (with Country Code)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 11 }} />
                      <input
                        type="tel"
                        required
                        placeholder="+1 555-0199 or +91 9876543210"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px 9px 36px',
                          borderRadius: 8,
                          border: '1px solid #cbd5e1',
                          fontSize: 13,
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 11, color: '#64748b', marginTop: 4, display: 'block' }}>
                      Enter your phone number in international E.164 format (e.g. +1 555-0199 or +91 9876543210).
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '11px 16px',
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <>Send Verification Code <ArrowRight size={16} /></>}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                        Enter 6-digit Code
                      </label>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 11, cursor: 'pointer' }}
                      >
                        Change Number
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="••••••"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: 16,
                        textAlign: 'center',
                        letterSpacing: '0.3em',
                        fontWeight: 700,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '11px 16px',
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <>Verify & Access Projects <ShieldCheck size={16} /></>}
                  </button>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      fontSize: 12,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    Didn’t receive code? Resend
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </React.Fragment>
    )}
      </div>
    </div>
  );
};
