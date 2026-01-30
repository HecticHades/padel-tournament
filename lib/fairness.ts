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
 * based on how other players performed against those opponents.
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

  // Build a map of which opponents each player has faced
  const playerOpponents = new Map<string, Set<string>>();
  // Build a map of points scored against each opponent by all players
  const pointsAgainstOpponent = new Map<string, { total: number; count: number }>();

  standings.forEach(s => playerOpponents.set(s.playerId, new Set()));

  // Process completed matches
  matches.filter(m => m.completed).forEach(match => {
    const team1Players = match.team1;
    const team2Players = match.team2;
    const score1 = match.score1 || 0;
    const score2 = match.score2 || 0;

    // Each player in team1 faced each player in team2
    team1Players.forEach(p1 => {
      team2Players.forEach(p2 => {
        // p1 faced p2
        playerOpponents.get(p1)?.add(p2);
        playerOpponents.get(p2)?.add(p1);

        // Points scored by p1 against p2
        const key1 = `${p1}_vs_${p2}`;
        const existing1 = pointsAgainstOpponent.get(key1) || { total: 0, count: 0 };
        pointsAgainstOpponent.set(key1, {
          total: existing1.total + score1,
          count: existing1.count + 1,
        });

        // Points scored by p2 against p1
        const key2 = `${p2}_vs_${p1}`;
        const existing2 = pointsAgainstOpponent.get(key2) || { total: 0, count: 0 };
        pointsAgainstOpponent.set(key2, {
          total: existing2.total + score2,
          count: existing2.count + 1,
        });
      });
    });
  });

  // Calculate average points others scored against each opponent
  const avgPointsAgainst = new Map<string, number>();
  standings.forEach(opponent => {
    let totalPoints = 0;
    let matchCount = 0;

    standings.forEach(player => {
      if (player.playerId === opponent.playerId) return;

      const key = `${player.playerId}_vs_${opponent.playerId}`;
      const data = pointsAgainstOpponent.get(key);
      if (data && data.count > 0) {
        totalPoints += data.total;
        matchCount += data.count;
      }
    });

    // Average points scored against this opponent
    avgPointsAgainst.set(
      opponent.playerId,
      matchCount > 0 ? totalPoints / matchCount : pointsPerMatch / 2
    );
  });

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

    const missingMatches = maxMatches - standing.matchesPlayed;
    const facedOpponents = playerOpponents.get(standing.playerId) || new Set();

    // Calculate estimated points for missing matches
    let estimatedAdditionalPoints = 0;

    // First, try to estimate based on opponents not yet faced
    const unfacedOpponents: string[] = [];
    standings.forEach(potentialOpponent => {
      if (potentialOpponent.playerId === standing.playerId) return;
      if (!facedOpponents.has(potentialOpponent.playerId)) {
        unfacedOpponents.push(potentialOpponent.playerId);
      }
    });

    if (unfacedOpponents.length > 0) {
      // Estimate based on how others performed against unfaced opponents
      unfacedOpponents.forEach(opponentId => {
        const avgAgainst = avgPointsAgainst.get(opponentId) || pointsPerMatch / 2;
        estimatedAdditionalPoints += avgAgainst;
      });

      // Scale to missing matches if needed
      if (unfacedOpponents.length > missingMatches) {
        estimatedAdditionalPoints = (estimatedAdditionalPoints / unfacedOpponents.length) * missingMatches;
      } else if (unfacedOpponents.length < missingMatches) {
        // Not enough unfaced opponents - fill remaining with player's average
        const remainingMatches = missingMatches - unfacedOpponents.length;
        estimatedAdditionalPoints += standing.average * remainingMatches;
      }
    } else {
      // Player has faced everyone - estimate based on their performance against all opponents
      // Use weighted average: how did this player perform against each opponent?
      let playerTotalAgainstAll = 0;
      let playerMatchesAgainstAll = 0;

      standings.forEach(opponent => {
        if (opponent.playerId === standing.playerId) return;

        const key = `${standing.playerId}_vs_${opponent.playerId}`;
        const data = pointsAgainstOpponent.get(key);
        if (data && data.count > 0) {
          playerTotalAgainstAll += data.total;
          playerMatchesAgainstAll += data.count;
        }
      });

      // Average points per opponent-match for this player
      const avgPerOpponentMatch = playerMatchesAgainstAll > 0
        ? playerTotalAgainstAll / playerMatchesAgainstAll
        : standing.average;

      estimatedAdditionalPoints = avgPerOpponentMatch * missingMatches;
    }

    const adjustedPoints = standing.points + estimatedAdditionalPoints;
    const adjustedAverage = adjustedPoints / maxMatches;

    return {
      ...standing,
      adjustedPoints: Math.round(adjustedPoints * 10) / 10,
      adjustedAverage: Math.round(adjustedAverage * 10) / 10,
    };
  });
}
