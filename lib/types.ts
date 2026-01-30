// Player
export interface Player {
  id: string;
  name: string;
  createdAt: number;
}

// Match
export interface Match {
  id: string;
  round: number;
  court: number;
  team1: [string, string]; // Player IDs
  team2: [string, string]; // Player IDs
  score1: number | null;
  score2: number | null;
  completed: boolean;
}

// Settings
export interface TournamentSettings {
  pointsPerMatch: 16 | 24 | 32;
  courts: number;
  rounds: number;
}

// Tournament Data
export interface TournamentData {
  id: string;
  name: string;
  createdAt: number;
  settings: TournamentSettings;
  players: Player[];
  matches: Match[];
  currentRound: number;
  status: 'setup' | 'active' | 'completed';
  byesByRound: Record<number, string[]>; // Round -> Player IDs with byes
}

// Auth
export interface AuthState {
  isAuthenticated: boolean;
  isReadOnly: boolean;
  failedAttempts: number;
  lockedUntil: number | null;
}

export interface StoredAuth {
  pinHash: string;
  sessionToken: string | null;
  sessionExpiry: number | null;
}

// Leaderboard
export interface Standing {
  playerId: string;
  playerName: string;
  points: number;
  matchesPlayed: number;
  matchesTotal: number;
  byes: number;
  average: number;
}

export interface AdjustedStanding extends Standing {
  adjustedPoints: number;
  adjustedAverage: number;
}

// Storage keys
export const STORAGE_KEYS = {
  TOURNAMENT: 'padel_tournament',
  AUTH: 'padel_auth',
  SETTINGS: 'padel_settings',
  DARK_MODE: 'padel_dark_mode',
} as const;

// App state
export interface AppSettings {
  darkMode: boolean;
}
