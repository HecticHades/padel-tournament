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
 * Calculate partner-based adjusted standings.
 * For players with fewer matches, estimate points based on average points won
 * by partners they haven't played with yet.
 */
export function calculatePartnerBasedAdjustment(
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

  // Track which partners each player has played with
  const playerPartners = new Map<string, Set<string>>();
  standings.forEach(s => playerPartners.set(s.playerId, new Set()));

  // Track points won by each player
  const pointsWonByPlayer = new Map<string, { total: number; matchCount: number }>();
  standings.forEach(s => pointsWonByPlayer.set(s.playerId, { total: 0, matchCount: 0 }));

  // Process matches
  completedMatches.forEach(match => {
    const score1 = match.score1 || 0;
    const score2 = match.score2 || 0;

    // Team1 partners
    if (match.team1.length === 2) {
      playerPartners.get(match.team1[0])?.add(match.team1[1]);
      playerPartners.get(match.team1[1])?.add(match.team1[0]);
    }

    // Team2 partners
    if (match.team2.length === 2) {
      playerPartners.get(match.team2[0])?.add(match.team2[1]);
      playerPartners.get(match.team2[1])?.add(match.team2[0]);
    }

    // Team1 players won score1 points
    match.team1.forEach(p => {
      const data = pointsWonByPlayer.get(p);
      if (data) {
        data.total += score1;
        data.matchCount += 1;
      }
    });

    // Team2 players won score2 points
    match.team2.forEach(p => {
      const data = pointsWonByPlayer.get(p);
      if (data) {
        data.total += score2;
        data.matchCount += 1;
      }
    });
  });

  // Calculate average points won per match for each player
  const avgPointsWon = new Map<string, number>();
  standings.forEach(s => {
    const data = pointsWonByPlayer.get(s.playerId);
    if (data && data.matchCount > 0) {
      avgPointsWon.set(s.playerId, data.total / data.matchCount);
    } else {
      avgPointsWon.set(s.playerId, pointsPerMatch / 2);
    }
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

    // Find partners this player hasn't played with
    const playedPartners = playerPartners.get(standing.playerId) || new Set();
    const unplayedPartners: Array<{ name: string; avgPointsWon: number }> = [];

    standings.forEach(potentialPartner => {
      if (potentialPartner.playerId === standing.playerId) return;
      if (playedPartners.has(potentialPartner.playerId)) return;

      const won = avgPointsWon.get(potentialPartner.playerId) || pointsPerMatch / 2;
      unplayedPartners.push({
        name: potentialPartner.playerName,
        avgPointsWon: Math.round(won * 10) / 10,
      });
    });

    // Calculate missing matches
    const missingMatches = maxMatches - standing.matchesPlayed;

    // If there are unplayed partners, use their average
    // Otherwise, fall back to overall average of all other players
    let avgPartnerWon: number;
    let partnerBreakdown: Array<{ name: string; avgPointsWon: number }>;

    if (unplayedPartners.length > 0) {
      avgPartnerWon = unplayedPartners.reduce((sum, p) => sum + p.avgPointsWon, 0) / unplayedPartners.length;
      partnerBreakdown = unplayedPartners;
    } else {
      // All partners played - use average of all other players
      let totalWon = 0;
      let count = 0;
      partnerBreakdown = [];

      standings.forEach(other => {
        if (other.playerId === standing.playerId) return;
        const won = avgPointsWon.get(other.playerId) || pointsPerMatch / 2;
        totalWon += won;
        count++;
        partnerBreakdown.push({
          name: other.playerName,
          avgPointsWon: Math.round(won * 10) / 10,
        });
      });

      avgPartnerWon = count > 0 ? totalWon / count : pointsPerMatch / 2;
    }

    const estimatedAdditionalPoints = missingMatches * avgPartnerWon;
    const adjustedPoints = standing.points + estimatedAdditionalPoints;
    const adjustedAverage = adjustedPoints / maxMatches;

    return {
      ...standing,
      adjustedPoints: Math.round(adjustedPoints * 10) / 10,
      adjustedAverage: Math.round(adjustedAverage * 10) / 10,
      partnerCalculationDetails: {
        missingMatches,
        avgPartnerPointsWon: Math.round(avgPartnerWon * 10) / 10,
        estimatedAdditionalPoints: Math.round(estimatedAdditionalPoints * 10) / 10,
        partnerBreakdown,
      },
    };
  });
}

/**
 * Calculate combined adjusted standings.
 * Average of: own average and partner-based (avg points won)
 */
export function calculateCombinedAdjustment(
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

  // Track points won by each player
  const pointsWonByPlayer = new Map<string, { total: number; matchCount: number }>();
  standings.forEach(s => {
    pointsWonByPlayer.set(s.playerId, { total: 0, matchCount: 0 });
  });

  // Process matches
  completedMatches.forEach(match => {
    const score1 = match.score1 || 0;
    const score2 = match.score2 || 0;

    match.team1.forEach(p => {
      const wonData = pointsWonByPlayer.get(p);
      if (wonData) {
        wonData.total += score1;
        wonData.matchCount += 1;
      }
    });

    match.team2.forEach(p => {
      const wonData = pointsWonByPlayer.get(p);
      if (wonData) {
        wonData.total += score2;
        wonData.matchCount += 1;
      }
    });
  });

  // Calculate averages
  const avgPointsWon = new Map<string, number>();
  standings.forEach(s => {
    const wonData = pointsWonByPlayer.get(s.playerId);
    avgPointsWon.set(s.playerId, wonData && wonData.matchCount > 0 ? wonData.total / wonData.matchCount : pointsPerMatch / 2);
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

    // 1. Own average
    const ownAverage = standing.average;

    // 2. Average partner points won (excluding self)
    let totalPartnerWon = 0;
    let partnerCount = 0;
    standings.forEach(partner => {
      if (partner.playerId === standing.playerId) return;
      const won = avgPointsWon.get(partner.playerId) || pointsPerMatch / 2;
      totalPartnerWon += won;
      partnerCount++;
    });
    const avgPartnerWon = partnerCount > 0 ? totalPartnerWon / partnerCount : pointsPerMatch / 2;

    // Combined average of both
    const combinedAverage = (ownAverage + avgPartnerWon) / 2;
    const estimatedAdditionalPoints = missingMatches * combinedAverage;
    const adjustedPoints = standing.points + estimatedAdditionalPoints;
    const adjustedAvg = adjustedPoints / maxMatches;

    return {
      ...standing,
      adjustedPoints: Math.round(adjustedPoints * 10) / 10,
      adjustedAverage: Math.round(adjustedAvg * 10) / 10,
      combinedCalculationDetails: {
        missingMatches,
        ownAverage: Math.round(ownAverage * 10) / 10,
        avgPartnerPointsWon: Math.round(avgPartnerWon * 10) / 10,
        combinedAverage: Math.round(combinedAverage * 10) / 10,
        estimatedAdditionalPoints: Math.round(estimatedAdditionalPoints * 10) / 10,
      },
    };
  });
}
