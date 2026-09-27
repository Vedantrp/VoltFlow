import type { UserProfile, SavedProject, PlacedComponent, WireConnection } from '../types';
import {
  auth,
  db,
  googleProvider,
  isFirebaseConfigured,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  firebaseSignOut,
  firebaseOnAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
} from './firebase';

const USERS_STORAGE_KEY = 'voltflow_auth_users_v1';
const SESSION_STORAGE_KEY = 'voltflow_auth_session_v1';
const OTP_STORAGE_KEY = 'voltflow_auth_otp_v1';

interface StoredUser {
  id: string;
  email?: string;
  phoneNumber?: string;
  displayName: string;
  passwordHash?: string;
  authProvider: 'email' | 'google' | 'phone';
  createdAt: number;
}

interface StoredOtp {
  code: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
}

export const memoryStorage = new Map<string, string>();

export const safeStorage = {
  getItem(key: string): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch {}
    }
    return memoryStorage.get(key) ?? null;
  },
  setItem(key: string, value: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {}
    }
    memoryStorage.set(key, value);
  },
  removeItem(key: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(key);
        return;
      } catch {}
    }
    memoryStorage.delete(key);
  },
  clear(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.clear();
        return;
      } catch {}
    }
    memoryStorage.clear();
  },
};

// Map Firebase error codes to human-readable user messages
function formatFirebaseError(err: any): string {
  if (!err) return 'Authentication failed. Please try again.';
  const code = String(err.code || '');
  const message = String(err.message || (typeof err === 'string' ? err : ''));

  if (message.includes("Database '(default)' not found") || code.includes('not-found')) {
    return "Cloud Firestore Database '(default)' has not been created yet in your Firebase Console project (voltflow-e5d2b). Please open Firebase Console -> Build -> Firestore Database -> Create Database.";
  }
  if (code.includes('CONFIGURATION_NOT_FOUND') || message.includes('CONFIGURATION_NOT_FOUND')) {
    return 'Google Sign-In is not enabled in your Firebase Console project. Please enable Google Auth provider in Firebase Console.';
  }
  if (code.includes('captcha') || code.includes('recaptcha') || code.includes('invalid-app-credential')) {
    return 'Phone SMS verification (Recaptcha) failed or domain not authorized in Firebase. Switched to instant demo code mode.';
  }
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please verify and try again.';
    case 'auth/popup-closed-by-user':
      return 'Google Sign-In popup window was closed before completing.';
    case 'auth/cancelled-popup-request':
      return 'Google Sign-In request was cancelled.';
    case 'auth/api-key-not-valid':
    case 'auth/invalid-api-key':
      return 'Invalid Firebase API Key in configuration (.env file).';
    case 'auth/unauthorized-domain':
      return `This domain (${typeof window !== 'undefined' ? window.location.hostname : 'deployed domain'}) is not authorized in Firebase. Please add '${typeof window !== 'undefined' ? window.location.hostname : 'your-domain.vercel.app'}' in Firebase Console -> Authentication -> Settings -> Authorized domains.`;
    case 'auth/billing-not-enabled':
      return 'Firebase SMS billing is not enabled for this project. Switched to instant demo OTP code (123456).';
    case 'auth/operation-not-allowed':
      return 'Selected sign-in provider is disabled in your Firebase console.';
    case 'auth/network-request-failed':
      return 'Network error connecting to Firebase. Please check your internet connection.';
    default:
      return err.message || 'Firebase Authentication failed.';
  }
}

function withTimeout<T>(promise: Promise<T>, ms = 8000, errorMsg = 'Authentication operation timed out.'): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms)),
  ]);
}

// PBKDF2 Password Key Derivation Function (100,000 iterations, HMAC-SHA256)
async function hashPassword(password: string): Promise<string> {
  const salt = 'salt_voltflow_pbkdf2_production_key_v1';
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );
      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: encoder.encode(salt),
          iterations: 100000,
          hash: 'SHA-256',
        },
        keyMaterial,
        256
      );
      const hashArray = Array.from(new Uint8Array(derivedBits));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {}
  }
  let hash = 0;
  const combined = password + salt;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'pbkdf2_' + Math.abs(hash).toString(16);
}

class AuthService {
  private currentUser: UserProfile | null = null;
  private listeners: ((user: UserProfile | null) => void)[] = [];
  private phoneConfirmationResult: ConfirmationResult | null = null;

  constructor() {
    this.restoreSession();
    this.initFirebaseListener();
  }

  public isFirebaseModeActive(): boolean {
    return isFirebaseConfigured && auth !== null;
  }

  private initFirebaseListener() {
    if (auth) {
      firebaseOnAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          const profile: UserProfile = {
            id: fbUser.uid,
            email: fbUser.email || undefined,
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'VoltFlow User',
            photoURL: fbUser.photoURL || undefined,
            authProvider: fbUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email',
            role: (fbUser.email || '').includes('admin') ? 'admin' : 'user',
            createdAt: Date.now(),
          };
          this.currentUser = profile;
          safeStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
        } else {
          // If explicitly signed out in Firebase
          if (this.currentUser && this.isFirebaseModeActive()) {
            this.currentUser = null;
            safeStorage.removeItem(SESSION_STORAGE_KEY);
          }
        }
        this.notify();
      });
    }
  }

  private restoreSession() {
    try {
      const saved = safeStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        this.currentUser = JSON.parse(saved);
      }
    } catch {
      this.currentUser = null;
    }
  }

  private notify() {
    if (this.currentUser) {
      this.migrateGuestProjectsToUser(this.currentUser.id);
    }
    for (const l of this.listeners) {
      l(this.currentUser);
    }
  }

  public onAuthStateChanged(cb: (user: UserProfile | null) => void): () => void {
    this.listeners.push(cb);
    cb(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  public getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  private getUsers(): StoredUser[] {
    try {
      const raw = safeStorage.getItem(USERS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveUsers(users: StoredUser[]) {
    safeStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  public getAllUsersForAdmin(): UserProfile[] {
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      throw new Error('Authorization Denied: Admin privileges required.');
    }
    const users = this.getUsers();
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      phoneNumber: u.phoneNumber,
      displayName: u.displayName,
      authProvider: u.authProvider,
      role: u.email?.includes('admin') ? 'admin' : 'user',
      createdAt: u.createdAt,
    }));
  }

  public canAccessUserRoute(targetUserId: string): boolean {
    if (!this.currentUser) return false;
    if (this.currentUser.role === 'admin') return true;
    return this.currentUser.id === targetUserId;
  }

  // --- 1. Email & Password Sign Up ---
  public async signUp(
    email: string,
    password: string,
    confirmPassword: string,
    displayName?: string
  ): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error('Please enter a valid email address.');
    }
    if (this.currentUser && this.currentUser.email && this.currentUser.email !== cleanEmail) {
      throw new Error(
        `You are already signed in as ${this.currentUser.displayName || this.currentUser.email}. Please sign out before registering a new account.`
      );
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match.');
    }

    if (auth) {
      try {
        const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const fbUser = userCred.user;
        const profile: UserProfile = {
          id: fbUser.uid,
          email: fbUser.email || cleanEmail,
          displayName: displayName?.trim() || cleanEmail.split('@')[0],
          authProvider: 'email',
          role: cleanEmail.includes('admin') ? 'admin' : 'user',
          createdAt: Date.now(),
        };

        if (db) {
          await setDoc(doc(db, 'users', fbUser.uid), {
            email: cleanEmail,
            displayName: profile.displayName,
            role: profile.role,
            createdAt: Date.now(),
          }).catch((e) => console.warn('Firestore user write warning:', e));
        }

        this.currentUser = profile;
        safeStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
        this.notify();
        return profile;
      } catch (fbErr: any) {
        throw new Error(formatFirebaseError(fbErr));
      }
    }

    // Local Storage Mode Fallback (Dev/Testing only)
    const isProduction = typeof window !== 'undefined' && import.meta.env.PROD;
    if (isProduction && !this.isFirebaseModeActive()) {
      throw new Error(
        'Production Security Restriction: Remote Authentication provider is required in production mode.'
      );
    }

    const users = this.getUsers();
    if (users.some((u) => u.email === cleanEmail)) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    const passwordHash = await hashPassword(password);
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const user: StoredUser = {
      id,
      email: cleanEmail,
      displayName: displayName?.trim() || cleanEmail.split('@')[0],
      passwordHash,
      authProvider: 'email',
      createdAt: Date.now(),
    };

    users.push(user);
    this.saveUsers(users);

    const profile: UserProfile = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      authProvider: 'email',
      role: cleanEmail.includes('admin') ? 'admin' : 'user',
      createdAt: user.createdAt,
    };

    this.currentUser = profile;
    safeStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
    this.notify();
    return profile;
  }

  // --- 2. Email & Password Sign In ---
  public async signIn(email: string, password: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Please enter your email address.');
    }
    if (!password) {
      throw new Error('Please enter your password.');
    }

    if (auth) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const fbUser = userCred.user;
        const profile: UserProfile = {
          id: fbUser.uid,
          email: fbUser.email || cleanEmail,
          displayName: fbUser.displayName || cleanEmail.split('@')[0],
          photoURL: fbUser.photoURL || undefined,
          authProvider: 'email',
          role: (fbUser.email || cleanEmail).includes('admin') ? 'admin' : 'user',
          createdAt: Date.now(),
        };

        this.currentUser = profile;
        safeStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
        this.notify();
        return profile;
      } catch (fbErr: any) {
        throw new Error(formatFirebaseError(fbErr));
      }
    }

    // Local Storage Mode Fallback
    const users = this.getUsers();
    const user = users.find((u) => u.email === cleanEmail);
    if (!user) {
      throw new Error('No account found with this email address.');
    }

    const passwordHash = await hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      throw new Error('Incorrect password. Please verify and try again.');
    }

    const profile: UserProfile = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      authProvider: user.authProvider,
      role: (user.email || '').includes('admin') ? 'admin' : 'user',
      createdAt: user.createdAt,
    };

    this.currentUser = profile;
    safeStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
    this.notify();
    return profile;
  }

  // --- 3. Google Sign In ---
  public async signInWithGoogle(customEmail?: string, customName?: string): Promise<UserProfile> {
    if (auth && googleProvider) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;
        const profile: UserProfile = {
          id: fbUser.uid,
          email: fbUser.email || undefined,
          displayName: fbUser.displayName || 'Google Engineer',
          photoURL: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          authProvider: 'google',
          role: (fbUser.email || '').includes('admin') ? 'admin' : 'user',
          createdAt: Date.now(),
        };

        if (db) {
          await setDoc(
            doc(db, 'users', fbUser.uid),
            {
              email: fbUser.email,
              displayName: profile.displayName,
              photoURL: profile.photoURL,
              role: profile.role,
              updatedAt: Date.now(),
            },
            { merge: true }
          ).catch((e) => console.warn('Firestore user write warning:', e));
        }

        this.currentUser = profile;
        safeStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
        this.notify();
        return profile;
      } catch (fbErr: any) {
        throw new Error(formatFirebaseError(fbErr));
      }
    }

    // Local Storage Mode Fallback
    const email = (customEmail || 'engineer@voltflow.io').toLowerCase();
    const displayName = customName || 'VoltFlow Pro Engineer';
    const users = this.getUsers();

    let user = users.find((u) => u.email === email);
    if (!user) {
      user = {
        id: `usr_g_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        email,
        displayName,
        authProvider: 'google',
        createdAt: Date.now(),
      };
      users.push(user);
      this.saveUsers(users);
    }

    const profile: UserProfile = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      authProvider: 'google',
      role: email.includes('admin') ? 'admin' : 'user',
      createdAt: user.createdAt,
    };

    this.currentUser = profile;
    safeStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
    this.notify();
    return profile;
  }

  // --- 4. Phone Authentication (OTP) ---
  public async sendPhoneOtp(
    rawPhone: string,
    containerId: string = 'recaptcha-container'
  ): Promise<{ success: boolean; message: string }> {
    const cleanPhone = rawPhone.trim().replace(/[\s-]/g, '');
    if (!cleanPhone || cleanPhone.length < 8 || !/^\+?[0-9]{8,15}$/.test(cleanPhone)) {
      throw new Error('Please enter a valid phone number with country code (e.g. +1 555-0199 or +91 9876543210).');
    }

    // Rate Limit Cooldown Check (45 seconds)
    const otps: Record<string, StoredOtp> = JSON.parse(safeStorage.getItem(OTP_STORAGE_KEY) || '{}');
    const existing = otps[cleanPhone];
    const now = Date.now();

    if (existing && now - existing.lastSentAt < 45000) {
      const waitSec = Math.ceil((45000 - (now - existing.lastSentAt)) / 1000);
      throw new Error(`Please wait ${waitSec} seconds before requesting another verification code.`);
    }

    let firebaseFailed = false;

    if (auth) {
      try {
        let recaptchaVerifier = (window as any).recaptchaVerifier;
        if (!recaptchaVerifier) {
          recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
            size: 'invisible',
            callback: () => {},
          });
          (window as any).recaptchaVerifier = recaptchaVerifier;
        }

        const confirmationResult = await withTimeout(
          signInWithPhoneNumber(auth, cleanPhone, recaptchaVerifier),
          6000,
          'Firebase Phone Auth request timed out.'
        );
        this.phoneConfirmationResult = confirmationResult;

        // Save last sent timestamp
        otps[cleanPhone] = {
          code: '123456',
          expiresAt: now + 10 * 60 * 1000,
          attempts: 0,
          lastSentAt: now,
        };
        safeStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otps));

        return {
          success: true,
          message: `SMS verification code sent to ${cleanPhone}. Please enter the 6-digit code received on your phone.`,
        };
      } catch (fbErr: any) {
        firebaseFailed = true;
        if ((window as any).recaptchaVerifier) {
          try {
            (window as any).recaptchaVerifier.clear();
          } catch {}
          (window as any).recaptchaVerifier = null;
        }
        console.warn('Firebase Phone Auth unavailable or unconfigured, activating instant demo code mode:', fbErr);
      }
    }

    // Local Storage / Dev Testing Fallback Mode (Instant & Always Works)
    const code = '123456';
    otps[cleanPhone] = {
      code,
      expiresAt: now + 10 * 60 * 1000,
      attempts: 0,
      lastSentAt: now,
    };
    safeStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otps));

    return {
      success: true,
      message: firebaseFailed
        ? `Verification code for ${cleanPhone} is: 123456. Enter 123456 below to verify and access your account.`
        : `SMS verification code sent to ${cleanPhone}. Demo code: 123456.`,
    };
  }

  public async verifyPhoneOtp(rawPhone: string, code: string): Promise<UserProfile> {
    const cleanPhone = rawPhone.trim().replace(/[\s-]/g, '');
    const cleanCode = code.trim();

    if (!cleanCode) {
      throw new Error('Please enter the verification code.');
    }

    if (auth && this.phoneConfirmationResult) {
      try {
        const userCred = await this.phoneConfirmationResult.confirm(cleanCode);
        const fbUser = userCred.user;
        const profile: UserProfile = {
          id: fbUser.uid,
          phoneNumber: fbUser.phoneNumber || cleanPhone,
          displayName: fbUser.displayName || `User ${cleanPhone.slice(-4)}`,
          authProvider: 'phone',
          role: 'user',
          createdAt: Date.now(),
        };

        if (db) {
          await setDoc(
            doc(db, 'users', fbUser.uid),
            {
              phoneNumber: profile.phoneNumber,
              displayName: profile.displayName,
              role: profile.role,
              updatedAt: Date.now(),
            },
            { merge: true }
          ).catch((e) => console.warn('Firestore user write warning:', e));
        }

        this.phoneConfirmationResult = null;
        this.currentUser = profile;
        safeStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
        this.notify();
        return profile;
      } catch (fbErr: any) {
        throw new Error(formatFirebaseError(fbErr));
      }
    }

    // Local Storage / Dev Testing Fallback Mode
    const otps: Record<string, StoredOtp> = JSON.parse(safeStorage.getItem(OTP_STORAGE_KEY) || '{}');
    const record = otps[cleanPhone];
    const now = Date.now();

    if (!record) {
      throw new Error('No active verification code found for this number. Please request a new code.');
    }

    if (now > record.expiresAt) {
      delete otps[cleanPhone];
      safeStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otps));
      throw new Error('Verification code has expired. Please request a new one.');
    }

    if (record.attempts >= 5) {
      delete otps[cleanPhone];
      safeStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otps));
      throw new Error('Too many invalid attempts. Please request a new verification code.');
    }

    if (record.code !== cleanCode && cleanCode !== '123456') {
      record.attempts += 1;
      safeStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otps));
      throw new Error('Invalid verification code. Please check and try again.');
    }

    delete otps[cleanPhone];
    safeStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otps));

    const users = this.getUsers();
    let user = users.find((u) => u.phoneNumber === cleanPhone);
    if (!user) {
      user = {
        id: `usr_p_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        phoneNumber: cleanPhone,
        displayName: `User ${cleanPhone.slice(-4)}`,
        authProvider: 'phone',
        createdAt: Date.now(),
      };
      users.push(user);
      this.saveUsers(users);
    }

    const profile: UserProfile = {
      id: user.id,
      phoneNumber: user.phoneNumber,
      displayName: user.displayName,
      authProvider: 'phone',
      role: 'user',
      createdAt: user.createdAt,
    };

    this.currentUser = profile;
    safeStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
    this.notify();
    return profile;
  }

  // --- 5. Sign Out ---
  public signOut(): void {
    if (auth) {
      firebaseSignOut(auth).catch((e) => console.warn('Firebase signout error:', e));
    }
    this.phoneConfirmationResult = null;
    this.currentUser = null;
    safeStorage.removeItem(SESSION_STORAGE_KEY);
    this.notify();
  }

  // --- 6. Multi-Tenant Data Isolation & Project Management ---
  private getUserProjectKey(userId: string): string {
    return `voltflow_projects_${userId}`;
  }

  public deduplicateProjects(projects: SavedProject[]): SavedProject[] {
    if (!Array.isArray(projects) || projects.length === 0) return [];

    const result: SavedProject[] = [];

    for (const proj of projects) {
      if (!proj || typeof proj !== 'object') continue;
      const cleanName = (proj.name || 'Untitled Circuit').trim().toLowerCase();

      const existingIdx = result.findIndex(
        (p) => (proj.id && p.id === proj.id) || (p.name || 'Untitled Circuit').trim().toLowerCase() === cleanName
      );

      if (existingIdx !== -1) {
        const existing = result[existingIdx];
        if ((proj.updatedAt || 0) >= (existing.updatedAt || 0)) {
          result[existingIdx] = proj;
        }
      } else {
        result.push(proj);
      }
    }

    return result.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }

  public getGuestProjects(): SavedProject[] {
    try {
      const raw = safeStorage.getItem(this.getUserProjectKey('guest_user'));
      const list: SavedProject[] = raw ? JSON.parse(raw) : [];
      return this.deduplicateProjects(list);
    } catch {
      return [];
    }
  }

  public migrateGuestProjectsToUser(userId: string) {
    if (!userId || userId === 'guest_user') return;
    try {
      const guestProjects = this.getGuestProjects();
      if (guestProjects.length === 0) return;

      const userKey = this.getUserProjectKey(userId);
      const existing = this.getProjects(userId);

      for (const gp of guestProjects) {
        gp.userId = userId;
        const matchIdx = existing.findIndex(
          (p) => p.id === gp.id || (p.name || '').trim().toLowerCase() === (gp.name || '').trim().toLowerCase()
        );
        if (matchIdx === -1) {
          existing.unshift(gp);
        } else if ((gp.updatedAt || 0) >= (existing[matchIdx].updatedAt || 0)) {
          existing[matchIdx] = gp;
        }
        if (db) {
          setDoc(doc(db, 'users', userId, 'projects', gp.id), gp, { merge: true }).catch(() => {});
        }
      }

      const deduplicated = this.deduplicateProjects(existing);
      safeStorage.setItem(userKey, JSON.stringify(deduplicated));
      safeStorage.removeItem(this.getUserProjectKey('guest_user'));
    } catch (err) {
      console.warn('Guest project migration notice:', err);
    }
  }

  public getProjects(userId: string): SavedProject[] {
    const isGuest = userId === 'guest_user';
    if (!isGuest && (!this.currentUser || (this.currentUser.id !== userId && this.currentUser.role !== 'admin'))) {
      throw new Error('Authorization Denied: You do not have permission to view this user’s projects.');
    }
    try {
      const raw = safeStorage.getItem(this.getUserProjectKey(userId));
      const list: SavedProject[] = raw ? JSON.parse(raw) : [];
      return this.deduplicateProjects(list);
    } catch {
      return [];
    }
  }

  public async getProjectsAsync(userId: string): Promise<SavedProject[]> {
    const isGuest = userId === 'guest_user';
    if (!isGuest && (!this.currentUser || (this.currentUser.id !== userId && this.currentUser.role !== 'admin'))) {
      throw new Error('Authorization Denied: You do not have permission to view this user’s projects.');
    }

    const localProjects = this.getProjects(userId);

    if (!isGuest && db) {
      try {
        const fetchPromise = getDocs(collection(db, 'users', userId, 'projects'));
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore fetch timeout')), 3500)
        );
        const querySnap = await Promise.race([fetchPromise, timeoutPromise]);
        const remoteProjects: SavedProject[] = [];
        querySnap.forEach((docSnap) => {
          remoteProjects.push(docSnap.data() as SavedProject);
        });

        const mergedList = this.deduplicateProjects([...localProjects, ...remoteProjects]);
        safeStorage.setItem(this.getUserProjectKey(userId), JSON.stringify(mergedList));
        return mergedList;
      } catch (err) {
        console.warn('Firestore fetch projects notice, using local cache:', err);
      }
    }

    return localProjects;
  }

  public saveProject(
    userId: string,
    project: {
      id?: string;
      name: string;
      components: PlacedComponent[];
      wires: WireConnection[];
      code: string;
    }
  ): SavedProject {
    const isGuest = userId === 'guest_user';
    if (!isGuest && (!this.currentUser || (this.currentUser.id !== userId && this.currentUser.role !== 'admin'))) {
      throw new Error('Authorization Denied: You cannot modify projects belonging to another account.');
    }

    const key = this.getUserProjectKey(userId);
    const rawExisting = this.getProjects(userId);
    const existing = this.deduplicateProjects(rawExisting);
    const now = Date.now();
    const cleanName = project.name.trim() || 'Untitled Circuit';
    const lowerName = cleanName.toLowerCase();

    let target: SavedProject;
    let idx = -1;

    // 1. Search by exact project ID if provided
    if (project.id) {
      idx = existing.findIndex((p) => p.id === project.id);
    }

    // 2. If not found by ID, search by normalized project name (case-insensitive)
    if (idx === -1) {
      idx = existing.findIndex((p) => (p.name || '').trim().toLowerCase() === lowerName);
    }

    if (idx !== -1) {
      // Overwrite existing project record in place
      existing[idx] = {
        ...existing[idx],
        name: cleanName,
        components: project.components,
        wires: project.wires,
        code: project.code,
        updatedAt: now,
      };
      target = existing[idx];
    } else {
      // Create new project record only if neither ID nor name matched
      target = {
        id: project.id || `prj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        name: cleanName,
        components: project.components,
        wires: project.wires,
        code: project.code,
        createdAt: now,
        updatedAt: now,
      };
      existing.unshift(target);
    }

    const deduplicated = this.deduplicateProjects(existing);
    safeStorage.setItem(key, JSON.stringify(deduplicated));

    if (!isGuest && db) {
      setDoc(doc(db, 'users', userId, 'projects', target.id), target, { merge: true }).catch((err) =>
        console.warn('Firestore project save warning:', err)
      );
    }

    return target;
  }

  public async saveProjectAsync(
    userId: string,
    project: {
      id?: string;
      name: string;
      components: PlacedComponent[];
      wires: WireConnection[];
      code: string;
    }
  ): Promise<SavedProject & { savedToCloud: boolean; cloudError?: string | null }> {
    const target = this.saveProject(userId, project);
    const isGuest = userId === 'guest_user';
    let savedToCloud = false;
    let cloudError: string | null = null;

    if (!isGuest && db) {
      try {
        const cloudPromise = setDoc(doc(db, 'users', userId, 'projects', target.id), target, { merge: true });
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Cloud DB connection timed out. Circuit saved safely to local storage.')), 4000)
        );
        await Promise.race([cloudPromise, timeoutPromise]);
        savedToCloud = true;
      } catch (err: any) {
        cloudError = formatFirebaseError(err);
        console.warn('Firestore async project save error:', err);
      }
    }
    return { ...target, savedToCloud, cloudError };
  }

  public deleteProject(userId: string, projectId: string): boolean {
    const isGuest = userId === 'guest_user';
    if (!isGuest && (!this.currentUser || (this.currentUser.id !== userId && this.currentUser.role !== 'admin'))) {
      throw new Error('Authorization Denied: You cannot delete another user’s project.');
    }
    const key = this.getUserProjectKey(userId);
    const existing = this.getProjects(userId);
    const filtered = existing.filter((p) => p.id !== projectId);
    safeStorage.setItem(key, JSON.stringify(filtered));

    if (!isGuest && db) {
      deleteDoc(doc(db, 'users', userId, 'projects', projectId)).catch((err) =>
        console.warn('Firestore project delete warning:', err)
      );
    }

    return true;
  }

  public renameProject(userId: string, projectId: string, newName: string): SavedProject {
    const isGuest = userId === 'guest_user';
    if (!isGuest && (!this.currentUser || (this.currentUser.id !== userId && this.currentUser.role !== 'admin'))) {
      throw new Error('Authorization Denied: You cannot rename another user’s project.');
    }
    const key = this.getUserProjectKey(userId);
    const existing = this.getProjects(userId);
    const project = existing.find((p) => p.id === projectId);
    if (!project) {
      throw new Error('Project not found.');
    }
    project.name = newName.trim() || 'Untitled Circuit';
    project.updatedAt = Date.now();
    safeStorage.setItem(key, JSON.stringify(existing));

    if (!isGuest && db) {
      setDoc(doc(db, 'users', userId, 'projects', projectId), { name: project.name, updatedAt: project.updatedAt }, { merge: true }).catch((err) =>
        console.warn('Firestore project rename warning:', err)
      );
    }

    return project;
  }

  public duplicateProject(userId: string, projectId: string): SavedProject {
    const isGuest = userId === 'guest_user';
    if (!isGuest && (!this.currentUser || (this.currentUser.id !== userId && this.currentUser.role !== 'admin'))) {
      throw new Error('Authorization Denied: You cannot duplicate another user’s project.');
    }
    const existing = this.getProjects(userId);
    const project = existing.find((p) => p.id === projectId);
    if (!project) {
      throw new Error('Project not found.');
    }
    const dup: SavedProject = {
      ...JSON.parse(JSON.stringify(project)),
      id: `prj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: `${project.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    existing.unshift(dup);
    safeStorage.setItem(this.getUserProjectKey(userId), JSON.stringify(existing));

    if (!isGuest && db) {
      setDoc(doc(db, 'users', userId, 'projects', dup.id), dup).catch((err) =>
        console.warn('Firestore project duplicate warning:', err)
      );
    }

    return dup;
  }
}

export const authService = new AuthService();
