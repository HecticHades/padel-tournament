import type { TournamentData, AppSettings } from './types';
import { STORAGE_KEYS } from './types';

// Tournament storage
export function getTournament(): TournamentData | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEYS.TOURNAMENT);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function saveTournament(tournament: TournamentData): void {
  localStorage.setItem(STORAGE_KEYS.TOURNAMENT, JSON.stringify(tournament));
}

export function clearTournament(): void {
  localStorage.removeItem(STORAGE_KEYS.TOURNAMENT);
}

// App settings storage
export function getAppSettings(): AppSettings {
  if (typeof window === 'undefined') {
    return { darkMode: false };
  }

  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!stored) {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return { darkMode: prefersDark };
  }

  try {
    return JSON.parse(stored);
  } catch {
    return { darkMode: false };
  }
}

export function saveAppSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

// Dark mode helper
export function getDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
  if (stored !== null) {
    return stored === 'true';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function setDarkMode(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(enabled));
  if (enabled) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// Export tournament as JSON
export function exportTournament(tournament: TournamentData): string {
  return JSON.stringify(tournament, null, 2);
}

// Import tournament from JSON
export function importTournament(json: string): TournamentData | null {
  try {
    const data = JSON.parse(json);
    // Basic validation
    if (!data.id || !data.players || !data.matches || !data.settings) {
      return null;
    }
    return data as TournamentData;
  } catch {
    return null;
  }
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Shuffle array (Fisher-Yates)
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
