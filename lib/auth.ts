import { sha256 } from 'js-sha256';
import type { StoredAuth, AuthState } from './types';
import { STORAGE_KEYS } from './types';

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const LOCKOUT_DURATION = 30 * 1000; // 30 seconds
const MAX_ATTEMPTS = 3;

export function hashPin(pin: string): string {
  return sha256(pin + '_padel_salt');
}

export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

export function getStoredAuth(): StoredAuth | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEYS.AUTH);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function setStoredAuth(auth: StoredAuth): void {
  localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(auth));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(STORAGE_KEYS.AUTH);
}

export function createTournamentAuth(pin: string): StoredAuth {
  const pinHash = hashPin(pin);
  const sessionToken = generateSessionToken();
  const sessionExpiry = Date.now() + SESSION_DURATION;

  const auth: StoredAuth = {
    pinHash,
    sessionToken,
    sessionExpiry,
  };

  setStoredAuth(auth);
  return auth;
}

export function validatePin(pin: string, storedAuth: StoredAuth): boolean {
  return hashPin(pin) === storedAuth.pinHash;
}

export function createSession(storedAuth: StoredAuth): StoredAuth {
  const sessionToken = generateSessionToken();
  const sessionExpiry = Date.now() + SESSION_DURATION;

  const updatedAuth: StoredAuth = {
    ...storedAuth,
    sessionToken,
    sessionExpiry,
  };

  setStoredAuth(updatedAuth);
  return updatedAuth;
}

export function isSessionValid(storedAuth: StoredAuth | null): boolean {
  if (!storedAuth?.sessionToken || !storedAuth.sessionExpiry) return false;
  return Date.now() < storedAuth.sessionExpiry;
}

export function checkLockout(authState: AuthState): {
  isLocked: boolean;
  remainingSeconds: number;
} {
  if (!authState.lockedUntil) {
    return { isLocked: false, remainingSeconds: 0 };
  }

  const remaining = authState.lockedUntil - Date.now();
  if (remaining <= 0) {
    return { isLocked: false, remainingSeconds: 0 };
  }

  return { isLocked: true, remainingSeconds: Math.ceil(remaining / 1000) };
}

export function handleFailedAttempt(currentState: AuthState): AuthState {
  const newAttempts = currentState.failedAttempts + 1;

  if (newAttempts >= MAX_ATTEMPTS) {
    return {
      ...currentState,
      failedAttempts: 0,
      lockedUntil: Date.now() + LOCKOUT_DURATION,
    };
  }

  return {
    ...currentState,
    failedAttempts: newAttempts,
  };
}

export function resetAuthState(): AuthState {
  return {
    isAuthenticated: false,
    isReadOnly: false,
    failedAttempts: 0,
    lockedUntil: null,
  };
}
