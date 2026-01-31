'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import type {
  TournamentData,
  Player,
  Match,
  TournamentSettings,
  AuthState,
  StoredAuth,
  Standing,
} from '@/lib/types';
import {
  getTournament,
  saveTournament,
  clearTournament,
  generateId,
  getDarkMode,
  setDarkMode,
} from '@/lib/storage';
import {
  getStoredAuth,
  createTournamentAuth,
  validatePin,
  createSession,
  isSessionValid,
  handleFailedAttempt,
  resetAuthState,
  clearStoredAuth,
  checkLockout,
} from '@/lib/auth';

// State types
interface TournamentState {
  tournament: TournamentData | null;
  auth: AuthState;
  darkMode: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}

// Action types
type TournamentAction =
  | { type: 'INIT'; payload: { tournament: TournamentData | null; auth: AuthState; darkMode: boolean } }
  | { type: 'SET_TOURNAMENT'; payload: TournamentData }
  | { type: 'CLEAR_TOURNAMENT' }
  | { type: 'UPDATE_TOURNAMENT'; payload: Partial<TournamentData> }
  | { type: 'ADD_PLAYER'; payload: Player }
  | { type: 'REMOVE_PLAYER'; payload: string }
  | { type: 'UPDATE_PLAYER'; payload: { id: string; name: string } }
  | { type: 'SET_MATCHES'; payload: Match[] }
  | { type: 'UPDATE_MATCH'; payload: Match }
  | { type: 'SET_CURRENT_ROUND'; payload: number }
  | { type: 'SET_STATUS'; payload: TournamentData['status'] }
  | { type: 'SET_AUTH'; payload: AuthState }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial state
const initialState: TournamentState = {
  tournament: null,
  auth: resetAuthState(),
  darkMode: false,
  isLoading: true,
  isInitialized: false,
};

// Reducer
function tournamentReducer(state: TournamentState, action: TournamentAction): TournamentState {
  switch (action.type) {
    case 'INIT':
      return {
        ...state,
        tournament: action.payload.tournament,
        auth: action.payload.auth,
        darkMode: action.payload.darkMode,
        isLoading: false,
        isInitialized: true,
      };

    case 'SET_TOURNAMENT':
      return { ...state, tournament: action.payload };

    case 'CLEAR_TOURNAMENT':
      return { ...state, tournament: null };

    case 'UPDATE_TOURNAMENT':
      if (!state.tournament) return state;
      return {
        ...state,
        tournament: { ...state.tournament, ...action.payload },
      };

    case 'ADD_PLAYER':
      if (!state.tournament) return state;
      return {
        ...state,
        tournament: {
          ...state.tournament,
          players: [...state.tournament.players, action.payload],
        },
      };

    case 'REMOVE_PLAYER':
      if (!state.tournament) return state;
      return {
        ...state,
        tournament: {
          ...state.tournament,
          players: state.tournament.players.filter(p => p.id !== action.payload),
        },
      };

    case 'UPDATE_PLAYER':
      if (!state.tournament) return state;
      return {
        ...state,
        tournament: {
          ...state.tournament,
          players: state.tournament.players.map(p =>
            p.id === action.payload.id ? { ...p, name: action.payload.name } : p
          ),
        },
      };

    case 'SET_MATCHES':
      if (!state.tournament) return state;
      return {
        ...state,
        tournament: { ...state.tournament, matches: action.payload },
      };

    case 'UPDATE_MATCH':
      if (!state.tournament) return state;
      return {
        ...state,
        tournament: {
          ...state.tournament,
          matches: state.tournament.matches.map(m =>
            m.id === action.payload.id ? action.payload : m
          ),
        },
      };

    case 'SET_CURRENT_ROUND':
      if (!state.tournament) return state;
      return {
        ...state,
        tournament: { ...state.tournament, currentRound: action.payload },
      };

    case 'SET_STATUS':
      if (!state.tournament) return state;
      return {
        ...state,
        tournament: { ...state.tournament, status: action.payload },
      };

    case 'SET_AUTH':
      return { ...state, auth: action.payload };

    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
}

// Context types
interface TournamentContextType {
  state: TournamentState;
  // Tournament actions
  createNewTournament: (name: string, pin: string) => void;
  deleteTournament: () => void;
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  updatePlayer: (id: string, name: string) => void;
  updateSettings: (settings: Partial<TournamentSettings>) => void;
  setMatches: (matches: Match[], byesByRound: Record<number, string[]>) => void;
  startTournament: () => void;
  submitScore: (matchId: string, score1: number, score2: number) => void;
  advanceRound: () => void;
  finishTournament: () => void;
  restartTournament: () => void;
  importTournamentData: (data: TournamentData) => void;
  // Auth actions
  login: (pin: string) => boolean;
  loginReadOnly: () => void;
  logout: () => void;
  // Settings actions
  toggleDarkMode: () => void;
  // Computed values
  currentRoundMatches: Match[];
  currentRoundByes: string[];
  leaderboard: Standing[];
  isRoundComplete: boolean;
  isTournamentComplete: boolean;
  totalRounds: number;
}

const TournamentContext = createContext<TournamentContextType | null>(null);

// Provider component
export function TournamentProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(tournamentReducer, initialState);

  // Initialize from localStorage
  useEffect(() => {
    const tournament = getTournament();
    const storedAuth = getStoredAuth();
    const darkMode = getDarkMode();

    let authState = resetAuthState();

    if (storedAuth) {
      if (isSessionValid(storedAuth)) {
        authState = { ...authState, isAuthenticated: true };
      }
    }

    dispatch({
      type: 'INIT',
      payload: { tournament, auth: authState, darkMode },
    });

    // Apply light mode class (dark is default, light class overrides)
    if (!darkMode) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, []);

  // Sync dark mode class with state changes
  useEffect(() => {
    if (!state.isInitialized) return;

    if (state.darkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [state.darkMode, state.isInitialized]);

  // Persist tournament changes
  useEffect(() => {
    if (state.isInitialized && state.tournament) {
      saveTournament(state.tournament);
    }
  }, [state.tournament, state.isInitialized]);

  // Tournament actions
  const createNewTournament = useCallback((name: string, pin: string) => {
    createTournamentAuth(pin);

    const tournament: TournamentData = {
      id: generateId(),
      name,
      createdAt: Date.now(),
      settings: {
        pointsPerMatch: 24,
        courts: 2,
        rounds: 0,
      },
      players: [],
      matches: [],
      currentRound: 1,
      status: 'setup',
      byesByRound: {},
    };

    saveTournament(tournament);
    dispatch({ type: 'SET_TOURNAMENT', payload: tournament });
    dispatch({
      type: 'SET_AUTH',
      payload: { isAuthenticated: true, isReadOnly: false, failedAttempts: 0, lockedUntil: null },
    });
  }, []);

  const deleteTournament = useCallback(() => {
    clearTournament();
    clearStoredAuth();
    dispatch({ type: 'CLEAR_TOURNAMENT' });
    dispatch({ type: 'SET_AUTH', payload: resetAuthState() });
  }, []);

  const addPlayer = useCallback((name: string) => {
    const player: Player = {
      id: generateId(),
      name: name.trim(),
      createdAt: Date.now(),
    };
    dispatch({ type: 'ADD_PLAYER', payload: player });
  }, []);

  const removePlayer = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_PLAYER', payload: id });
  }, []);

  const updatePlayer = useCallback((id: string, name: string) => {
    dispatch({ type: 'UPDATE_PLAYER', payload: { id, name: name.trim() } });
  }, []);

  const updateSettings = useCallback((settings: Partial<TournamentSettings>) => {
    if (!state.tournament) return;
    dispatch({
      type: 'UPDATE_TOURNAMENT',
      payload: { settings: { ...state.tournament.settings, ...settings } },
    });
  }, [state.tournament]);

  const setMatches = useCallback((matches: Match[], byesByRound: Record<number, string[]>) => {
    if (!state.tournament) return;
    const totalRounds = Math.max(...matches.map(m => m.round), 0);
    dispatch({
      type: 'UPDATE_TOURNAMENT',
      payload: {
        matches,
        byesByRound,
        settings: { ...state.tournament.settings, rounds: totalRounds },
      },
    });
  }, [state.tournament]);

  const startTournament = useCallback(() => {
    dispatch({ type: 'SET_STATUS', payload: 'active' });
  }, []);

  const submitScore = useCallback((matchId: string, score1: number, score2: number) => {
    const match = state.tournament?.matches.find(m => m.id === matchId);
    if (!match) return;

    dispatch({
      type: 'UPDATE_MATCH',
      payload: { ...match, score1, score2, completed: true },
    });
  }, [state.tournament]);

  const advanceRound = useCallback(() => {
    if (!state.tournament) return;
    const nextRound = state.tournament.currentRound + 1;
    dispatch({ type: 'SET_CURRENT_ROUND', payload: nextRound });
  }, [state.tournament]);

  const finishTournament = useCallback(() => {
    dispatch({ type: 'SET_STATUS', payload: 'completed' });
  }, []);

  const restartTournament = useCallback(() => {
    if (!state.tournament) return;

    // Reset tournament to setup state, keeping players and settings
    dispatch({
      type: 'UPDATE_TOURNAMENT',
      payload: {
        matches: [],
        byesByRound: {},
        currentRound: 1,
        status: 'setup',
        settings: { ...state.tournament.settings, rounds: 0 },
      },
    });
  }, [state.tournament]);

  const importTournamentData = useCallback((data: TournamentData) => {
    saveTournament(data);
    dispatch({ type: 'SET_TOURNAMENT', payload: data });
  }, []);

  // Auth actions
  const login = useCallback((pin: string): boolean => {
    const storedAuth = getStoredAuth();
    if (!storedAuth) return false;

    const { isLocked } = checkLockout(state.auth);
    if (isLocked) return false;

    if (validatePin(pin, storedAuth)) {
      createSession(storedAuth);
      dispatch({
        type: 'SET_AUTH',
        payload: { isAuthenticated: true, isReadOnly: false, failedAttempts: 0, lockedUntil: null },
      });
      return true;
    }

    dispatch({ type: 'SET_AUTH', payload: handleFailedAttempt(state.auth) });
    return false;
  }, [state.auth]);

  const loginReadOnly = useCallback(() => {
    dispatch({
      type: 'SET_AUTH',
      payload: { ...state.auth, isAuthenticated: true, isReadOnly: true },
    });
  }, [state.auth]);

  const logout = useCallback(() => {
    const storedAuth = getStoredAuth();
    if (storedAuth) {
      storedAuth.sessionToken = null;
      storedAuth.sessionExpiry = null;
    }
    dispatch({
      type: 'SET_AUTH',
      payload: { ...state.auth, isAuthenticated: false, isReadOnly: false },
    });
  }, [state.auth]);

  // Settings actions
  const toggleDarkMode = useCallback(() => {
    const newMode = !state.darkMode;
    setDarkMode(newMode);
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  }, [state.darkMode]);

  // Computed values
  const currentRoundMatches = useMemo(() => {
    if (!state.tournament) return [];
    return state.tournament.matches.filter(m => m.round === state.tournament!.currentRound);
  }, [state.tournament]);

  const currentRoundByes = useMemo(() => {
    if (!state.tournament) return [];
    return state.tournament.byesByRound[state.tournament.currentRound] || [];
  }, [state.tournament]);

  const leaderboard = useMemo((): Standing[] => {
    if (!state.tournament) return [];

    const { players, matches, byesByRound } = state.tournament;

    // Pre-compute player stats in a single pass through matches - O(matches)
    const playerStats = new Map<string, { points: number; completed: number; total: number }>();
    players.forEach(p => playerStats.set(p.id, { points: 0, completed: 0, total: 0 }));

    matches.forEach(match => {
      const allPlayers = [...match.team1, ...match.team2];
      allPlayers.forEach(playerId => {
        const stats = playerStats.get(playerId);
        if (stats) {
          stats.total++;
          if (match.completed) {
            stats.completed++;
            const isTeam1 = match.team1.includes(playerId);
            stats.points += isTeam1 ? (match.score1 || 0) : (match.score2 || 0);
          }
        }
      });
    });

    // Pre-compute byes count per player - O(rounds * byes)
    const byesCount = new Map<string, number>();
    players.forEach(p => byesCount.set(p.id, 0));
    Object.values(byesByRound).forEach(byeList => {
      byeList.forEach(playerId => {
        byesCount.set(playerId, (byesCount.get(playerId) || 0) + 1);
      });
    });

    // Build standings - O(players)
    const standings: Standing[] = players.map(player => {
      const stats = playerStats.get(player.id) || { points: 0, completed: 0, total: 0 };
      const byes = byesCount.get(player.id) || 0;
      const average = stats.completed > 0 ? stats.points / stats.completed : 0;

      return {
        playerId: player.id,
        playerName: player.name,
        points: stats.points,
        matchesPlayed: stats.completed,
        matchesTotal: stats.total,
        byes,
        average,
      };
    });

    // Sort by points (desc), then matches played (desc), then average (desc)
    return standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.matchesPlayed !== a.matchesPlayed) return b.matchesPlayed - a.matchesPlayed;
      return b.average - a.average;
    });
  }, [state.tournament]);

  const isRoundComplete = useMemo(() => {
    return currentRoundMatches.length > 0 && currentRoundMatches.every(m => m.completed);
  }, [currentRoundMatches]);

  const isTournamentComplete = useMemo(() => {
    if (!state.tournament) return false;
    return state.tournament.matches.length > 0 && state.tournament.matches.every(m => m.completed);
  }, [state.tournament]);

  const totalRounds = useMemo(() => {
    return state.tournament?.settings.rounds || 0;
  }, [state.tournament]);

  const contextValue: TournamentContextType = {
    state,
    createNewTournament,
    deleteTournament,
    addPlayer,
    removePlayer,
    updatePlayer,
    updateSettings,
    setMatches,
    startTournament,
    submitScore,
    advanceRound,
    finishTournament,
    restartTournament,
    importTournamentData,
    login,
    loginReadOnly,
    logout,
    toggleDarkMode,
    currentRoundMatches,
    currentRoundByes,
    leaderboard,
    isRoundComplete,
    isTournamentComplete,
    totalRounds,
  };

  return (
    <TournamentContext.Provider value={contextValue}>
      {children}
    </TournamentContext.Provider>
  );
}

// Hook for accessing context
export function useTournamentContext() {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournamentContext must be used within TournamentProvider');
  }
  return context;
}
