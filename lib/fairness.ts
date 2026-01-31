import type { Standing, AdjustedStanding, Match } from './types';

/**
 * Calculate adjusted standings that account for different number of matches played.
 * Players with fewer matches get their average points extrapolated to the max match count.
 */
export function calculateAdjustedStandings(
  standings: Standing[],
  pointsPerMatch: number
): AdjustedStanding[] {
  if (standings.length === 0) return [];

  // Find the maximum number of matches played
  const maxMatches = Math.max(...standings.map(s => s.matchesPlayed));

  // If no one has played yet, no adjustment needed
  if (maxMatches === 0) {
    return standings.map(s => ({
      ...s,
      adjustedPoints: 0,
      adjustedAverage: 0,
    }));
  }

  // If everyone has the same number of matches, no adjustment needed
  const allSameMatches = standings.every(s => s.matchesPlayed === maxMatches);

  if (allSameMatches) {
    return standings.map(s => ({
      ...s,
      adjustedPoints: s.points,
      adjustedAverage: s.average,
    }));
  }

  // Calculate adjusted points
  // Players with fewer matches get their average extrapolated to maxMatches
  return standings.map(standing => {
    if (standing.matchesPlayed === 0) {
      return {
        ...standing,
        adjustedPoints: 0,
        adjustedAverage: 0,
      };
    }

    // If player has fewer matches, extrapolate their average to maxMatches
    if (standing.matchesPlayed < maxMatches) {
      const adjustedPoints = standing.average * maxMatches;
      return {
        ...standing,
        adjustedPoints: Math.round(adjustedPoints * 10) / 10,
        adjustedAverage: standing.average,
      };
    }

    // Player has maxMatches - use actual points
    return {
      ...standing,
      adjustedPoints: standing.points,
      adjustedAverage: standing.average,
    };
  });
}

// Sort standings by adjusted points
export function sortByAdjusted(standings: AdjustedStanding[]): AdjustedStanding[] {
  return [...standings].sort((a, b) => {
    if (b.adjustedPoints !== a.adjustedPoints) {
      return b.adjustedPoints - a.adjustedPoints;
    }
    if (b.matchesPlayed !== a.matchesPlayed) {
      return b.matchesPlayed - a.matchesPlayed;
    }
    return b.adjustedAverage - a.adjustedAverage;
  });
}

// Calculate statistics about fairness of the tournament
export function calculateFairnessStats(
  standings: Standing[]
): {
  matchVariance: number;
  isBalanced: boolean;
  minMatches: number;
  maxMatches: number;
  avgMatches: number;
  playersWithFewerMatches: string[];
} {
  if (standings.length === 0) {
    return {
      matchVariance: 0,
      isBalanced: true,
      minMatches: 0,
      maxMatches: 0,
      avgMatches: 0,
      playersWithFewerMatches: [],
    };
  }

  const matchCounts = standings.map(s => s.matchesPlayed);
  const minMatches = Math.min(...matchCounts);
  const maxMatches = Math.max(...matchCounts);
  const avgMatches = matchCounts.reduce((sum, c) => sum + c, 0) / matchCounts.length;

  // Calculate variance
  const variance =
    matchCounts.reduce((sum, c) => sum + Math.pow(c - avgMatches, 2), 0) /
    matchCounts.length;

  // Find players with fewer matches than max
  const playersWithFewerMatches = standings
    .filter(s => s.matchesPlayed < maxMatches)
    .map(s => s.playerName);

  return {
    matchVariance: Math.sqrt(variance),
    isBalanced: maxMatches - minMatches === 0,
    minMatches,
    maxMatches,
    avgMatches,
    playersWithFewerMatches,
  };
}

// Get detailed info about players with fewer matches
export function getPlayersWithFewerMatches(
  standings: Standing[]
): { name: string; matchesPlayed: number; maxMatches: number; difference: number }[] {
  if (standings.length === 0) return [];

  const maxMatches = Math.max(...standings.map(s => s.matchesPlayed));

  return standings
    .filter(s => s.matchesPlayed < maxMatches)
    .map(s => ({
      name: s.playerName,
      matchesPlayed: s.matchesPlayed,
      maxMatches,
      difference: maxMatches - s.matchesPlayed,
    }))
    .sort((a, b) => a.matchesPlayed - b.matchesPlayed);
}

// Generate CSV data for export
export function generateLeaderboardCsv(
  standings: Standing[] | AdjustedStanding[],
  showAdjusted: boolean,
  maxMatches: number
): { headers: string[]; rows: string[][] } {
  const headers = showAdjusted
    ? ['Rang', 'Spieler', 'Punkte', `Hochgerechnet (${maxMatches} Spiele)`, 'Spiele', 'Schnitt', 'Pausen']
    : ['Rang', 'Spieler', 'Punkte', 'Spiele', 'Schnitt', 'Pausen'];

  const rows = standings.map((s, index) => {
    const baseRow = [
      (index + 1).toString(),
      s.playerName,
      s.points.toString(),
    ];

    if (showAdjusted && 'adjustedPoints' in s) {
      baseRow.push(s.adjustedPoints.toFixed(1));
    }

    baseRow.push(
      s.matchesPlayed.toString(),
      s.average.toFixed(1),
      s.byes.toString()
    );

    return baseRow;
  });

  return { headers, rows };
}

// Check if a player has fewer matches than max
export function hasFewerMatches(
  standing: Standing,
  allStandings: Standing[]
): boolean {
  if (allStandings.length === 0) return false;

  const maxMatches = Math.max(...allStandings.map(s => s.matchesPlayed));
  return standing.matchesPlayed < maxMatches;
}

/**
 * Calculate opponent-based adjusted standings.
 * For players with fewer matches, estimate points for missing matches
 * based on how opponents performed in their matches (average points lost).
 */
export function calculateOpponentBasedAdjustment(
  standings: Standing[],
  matches: Match[],
  pointsPerMatch: number
): AdjustedStanding[] {
  if (standings.length === 0) return [];

  const maxMatches = Math.max(...standings.map(s => s.matchesPlayed));

  if (maxMatches === 0) {
    return standings.map(s => ({
      ...s,
      adjustedPoints: 0,
      adjustedAverage: 0,
    }));
  }

  const allSameMatches = standings.every(s => s.matchesPlayed === maxMatches);
  if (allSameMatches) {
    return standings.map(s => ({
      ...s,
      adjustedPoints: s.points,
      adjustedAverage: s.average,
    }));
  }

  const completedMatches = matches.filter(m => m.completed);

  // Track points lost by each player (points the opponent scored against them)
  const pointsLostByPlayer = new Map<string, { total: number; matchCount: number }>();
  standings.forEach(s => pointsLostByPlayer.set(s.playerId, { total: 0, matchCount: 0 }));

  // Process matches
  completedMatches.forEach(match => {
    const score1 = match.score1 || 0;
    const score2 = match.score2 || 0;

    // Team1 players lost score2 points (opponent scored score2 against them)
    match.team1.forEach(p => {
      const data = pointsLostByPlayer.get(p);
      if (data) {
        data.total += score2;
        data.matchCount += 1;
      }
    });

    // Team2 players lost score1 points (opponent scored score1 against them)
    match.team2.forEach(p => {
      const data = pointsLostByPlayer.get(p);
      if (data) {
        data.total += score1;
        data.matchCount += 1;
      }
    });
  });

  // Calculate average points lost per match for each player
  // This tells us: "How many points do opponents typically score against this player?"
  const avgPointsLost = new Map<string, number>();
  standings.forEach(s => {
    const data = pointsLostByPlayer.get(s.playerId);
    if (data && data.matchCount > 0) {
      avgPointsLost.set(s.playerId, data.total / data.matchCount);
    } else {
      avgPointsLost.set(s.playerId, pointsPerMatch / 2);
    }
  });

  // Calculate average points lost across all opponents (excluding self)
  const getAvgOpponentPointsLost = (playerId: string): number => {
    let totalLost = 0;
    let opponentCount = 0;

    standings.forEach(opponent => {
      if (opponent.playerId === playerId) return;
      const lost = avgPointsLost.get(opponent.playerId);
      if (lost !== undefined) {
        totalLost += lost;
        opponentCount++;
      }
    });

    return opponentCount > 0 ? totalLost / opponentCount : pointsPerMatch / 2;
  };

  // Calculate adjusted standings
  return standings.map(standing => {
    if (standing.matchesPlayed === 0) {
      return {
        ...standing,
        adjustedPoints: 0,
        adjustedAverage: 0,
      };
    }

    if (standing.matchesPlayed >= maxMatches) {
      return {
        ...standing,
        adjustedPoints: standing.points,
        adjustedAverage: standing.average,
      };
    }

    // Calculate missing matches
    const missingMatches = maxMatches - standing.matchesPlayed;

    // Estimate points for missing matches based on average opponent weakness
    // (how many points opponents typically lose per match)
    const avgOpponentLost = getAvgOpponentPointsLost(standing.playerId);
    const estimatedAdditionalPoints = missingMatches * avgOpponentLost;

    const adjustedPoints = standing.points + estimatedAdditionalPoints;
    const adjustedAverage = adjustedPoints / maxMatches;

    return {
      ...standing,
      adjustedPoints: Math.round(adjustedPoints * 10) / 10,
      adjustedAverage: Math.round(adjustedAverage * 10) / 10,
      calculationDetails: {
        missingMatches,
        avgOpponentPointsLost: Math.round(avgOpponentLost * 10) / 10,
        estimatedAdditionalPoints: Math.round(estimatedAdditionalPoints * 10) / 10,
      },
    };
  });
}
