'use client';

import { useTournamentContext } from '@/context/TournamentContext';

export function useTournament() {
  const {
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
    importTournamentData,
    currentRoundMatches,
    currentRoundByes,
    leaderboard,
    isRoundComplete,
    isTournamentComplete,
    totalRounds,
  } = useTournamentContext();

  return {
    // State
    tournament: state.tournament,
    isLoading: state.isLoading,
    isInitialized: state.isInitialized,

    // Tournament actions
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
    importTournamentData,

    // Computed values
    currentRoundMatches,
    currentRoundByes,
    leaderboard,
    isRoundComplete,
    isTournamentComplete,
    totalRounds,

    // Helper getters
    players: state.tournament?.players || [],
    matches: state.tournament?.matches || [],
    settings: state.tournament?.settings,
    currentRound: state.tournament?.currentRound || 1,
    status: state.tournament?.status || 'setup',
    hasTournament: !!state.tournament,
  };
}
