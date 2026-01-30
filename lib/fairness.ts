import type { Standing, AdjustedStanding, Match, Player } from './types';

// Calculate adjusted standings that account for different number of matches played
export function calculateAdjustedStandings(
  standings: Standing[],
  pointsPerMatch: number
): AdjustedStanding[] {
  if (standings.length === 0) return [];

  // Find the average number of matches played
  const totalMatches = standings.reduce((sum, s) => sum + s.matchesPlayed, 0);
  const avgMatches = totalMatches / standings.length;

  // If everyone has the same number of matches, no adjustment needed
  const allSameMatches = standings.every(
    s => s.matchesPlayed === standings[0].matchesPlayed
  );

  if (allSameMatches) {
    return standings.map(s => ({
      ...s,
      adjustedPoints: s.points,
      adjustedAverage: s.average,
    }));
  }

  // Calculate adjusted points
  // Players with fewer matches get their average projected to the average match count
  return standings.map(standing => {
    if (standing.matchesPlayed === 0) {
      return {
        ...standing,
        adjustedPoints: 0,
        adjustedAverage: 0,
      };
    }

    // Calculate what their points would be if they played the average number of matches
    // Based on their current average
    const projectedPoints = standing.average * avgMatches;

    // Blend between actual points and projected points based on how far from average
    // If they played less, give more weight to projection
    // If they played more, give more weight to actual
    const matchDiff = standing.matchesPlayed - avgMatches;
    let blendFactor: number;

    if (matchDiff >= 0) {
      // Played more than average - use actual points
      blendFactor = 0;
    } else {
      // Played less than average - blend based on how many fewer
      // More missing matches = more projection
      blendFactor = Math.min(1, Math.abs(matchDiff) / avgMatches);
    }

    const adjustedPoints =
      standing.points * (1 - blendFactor) + projectedPoints * blendFactor;
    const adjustedAverage = avgMatches > 0 ? adjustedPoints / avgMatches : 0;

    return {
      ...standing,
      adjustedPoints: Math.round(adjustedPoints * 10) / 10,
      adjustedAverage: Math.round(adjustedAverage * 10) / 10,
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
} {
  if (standings.length === 0) {
    return {
      matchVariance: 0,
      isBalanced: true,
      minMatches: 0,
      maxMatches: 0,
      avgMatches: 0,
    };
  }

  const matchCounts = standings.map(s => s.matchesPlayed);
  const minMatches = Math.min(...matchCounts);
  const maxMatches = Math.max(...matchCounts);
  const avgMatches =
    matchCounts.reduce((sum, c) => sum + c, 0) / matchCounts.length;

  // Calculate variance
  const variance =
    matchCounts.reduce((sum, c) => sum + Math.pow(c - avgMatches, 2), 0) /
    matchCounts.length;

  return {
    matchVariance: Math.sqrt(variance),
    isBalanced: maxMatches - minMatches <= 1,
    minMatches,
    maxMatches,
    avgMatches,
  };
}

// Generate CSV data for export
export function generateLeaderboardCsv(
  standings: Standing[] | AdjustedStanding[],
  showAdjusted: boolean
): { headers: string[]; rows: string[][] } {
  const headers = showAdjusted
    ? ['Rang', 'Spieler', 'Punkte', 'Angepasst', 'Spiele', 'Schnitt', 'Pausen']
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

// Check if a player has fewer matches than average
export function hasFewerMatches(
  standing: Standing,
  allStandings: Standing[]
): boolean {
  if (allStandings.length === 0) return false;

  const avgMatches =
    allStandings.reduce((sum, s) => sum + s.matchesPlayed, 0) /
    allStandings.length;

  return standing.matchesPlayed < Math.floor(avgMatches);
}
