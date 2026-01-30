import type { Match, Player } from './types';
import { generateId, shuffleArray } from './storage';

interface ScheduleResult {
  matches: Match[];
  byesByRound: Record<number, string[]>;
  totalRounds: number;
}

// Generate all unique pairs (partnerships) from players
function generateAllPairs(playerIds: string[]): [string, string][] {
  const pairs: [string, string][] = [];
  for (let i = 0; i < playerIds.length; i++) {
    for (let j = i + 1; j < playerIds.length; j++) {
      pairs.push([playerIds[i], playerIds[j]]);
    }
  }
  return pairs;
}

// Check if two pairs share a player
function pairsOverlap(pair1: [string, string], pair2: [string, string]): boolean {
  return pair1[0] === pair2[0] || pair1[0] === pair2[1] ||
         pair1[1] === pair2[0] || pair1[1] === pair2[1];
}

// Get all players from matches in a round
function getPlayersInRound(roundMatches: Match[]): Set<string> {
  const players = new Set<string>();
  for (const match of roundMatches) {
    match.team1.forEach(p => players.add(p));
    match.team2.forEach(p => players.add(p));
  }
  return players;
}

/**
 * Main Americano scheduling algorithm
 *
 * Goal: Each player partners with every other player exactly once
 *
 * Mathematics:
 * - n players → C(n,2) = n*(n-1)/2 unique partnerships needed
 * - Each match uses 2 partnerships (2 teams of 2)
 * - Total matches needed = n*(n-1)/4
 * - Each player plays (n-1) matches
 *
 * This only works perfectly when n*(n-1) is divisible by 4:
 * - n ≡ 0 (mod 4): 4, 8, 12 players
 * - n ≡ 1 (mod 4): 5, 9, 13 players
 *
 * For other values, some partnerships may repeat or be missing.
 */
export function generateSchedule(
  players: Player[],
  courts: number,
  pointsPerMatch: number
): ScheduleResult {
  const playerIds = shuffleArray(players.map(p => p.id));
  const n = playerIds.length;

  if (n < 4) {
    return { matches: [], byesByRound: {}, totalRounds: 0 };
  }

  // Generate all required partnerships
  const allPairs = generateAllPairs(playerIds);
  const usedPairs = new Set<string>();

  // Helper to create pair key for tracking
  const pairKey = (p1: string, p2: string) =>
    p1 < p2 ? `${p1}|${p2}` : `${p2}|${p1}`;

  // Helper to check if pair is already used
  const isPairUsed = (pair: [string, string]) =>
    usedPairs.has(pairKey(pair[0], pair[1]));

  // Helper to mark pair as used
  const markPairUsed = (pair: [string, string]) =>
    usedPairs.add(pairKey(pair[0], pair[1]));

  const matches: Match[] = [];
  const byesByRound: Record<number, string[]> = {};
  let round = 1;

  // Keep creating rounds until all partnerships are used
  while (usedPairs.size < allPairs.length) {
    const roundMatches: Match[] = [];
    const playersInRound = new Set<string>();
    let court = 1;

    // Get unused pairs, sorted to prioritize players with fewer matches
    const playerMatchCount: Record<string, number> = {};
    playerIds.forEach(id => { playerMatchCount[id] = 0; });
    matches.forEach(m => {
      [...m.team1, ...m.team2].forEach(p => { playerMatchCount[p]++; });
    });

    // Filter to only unused pairs
    const availablePairs = allPairs.filter(pair => !isPairUsed(pair));

    // Sort pairs by sum of player match counts (prioritize players with fewer matches)
    availablePairs.sort((a, b) => {
      const scoreA = playerMatchCount[a[0]] + playerMatchCount[a[1]];
      const scoreB = playerMatchCount[b[0]] + playerMatchCount[b[1]];
      return scoreA - scoreB;
    });

    // Try to form matches for this round
    for (const team1 of availablePairs) {
      // Skip if any player in this pair is already playing this round
      if (playersInRound.has(team1[0]) || playersInRound.has(team1[1])) {
        continue;
      }

      // Skip if this pair is already used
      if (isPairUsed(team1)) {
        continue;
      }

      // Find a compatible team2
      let bestTeam2: [string, string] | null = null;
      let bestScore = Infinity;

      for (const team2 of availablePairs) {
        // Skip if same pair or overlapping players
        if (pairsOverlap(team1, team2)) {
          continue;
        }

        // Skip if any player in team2 is already playing this round
        if (playersInRound.has(team2[0]) || playersInRound.has(team2[1])) {
          continue;
        }

        // Skip if this pair is already used
        if (isPairUsed(team2)) {
          continue;
        }

        // Score: prioritize players with fewer matches
        const score = playerMatchCount[team2[0]] + playerMatchCount[team2[1]];
        if (score < bestScore) {
          bestScore = score;
          bestTeam2 = team2;
        }
      }

      if (bestTeam2 && court <= courts) {
        // Create match
        const match: Match = {
          id: generateId(),
          round,
          court,
          team1,
          team2: bestTeam2,
          score1: null,
          score2: null,
          completed: false,
        };

        roundMatches.push(match);
        markPairUsed(team1);
        markPairUsed(bestTeam2);

        // Mark players as playing this round
        team1.forEach(p => playersInRound.add(p));
        bestTeam2.forEach(p => playersInRound.add(p));

        court++;
      }
    }

    // If we couldn't create any matches, break to avoid infinite loop
    if (roundMatches.length === 0) {
      break;
    }

    // Record byes for this round
    const byePlayers = playerIds.filter(p => !playersInRound.has(p));
    byesByRound[round] = byePlayers;

    matches.push(...roundMatches);
    round++;

    // Safety check: don't exceed a reasonable number of rounds
    if (round > n * 2) {
      break;
    }
  }

  const totalRounds = round - 1;

  return { matches, byesByRound, totalRounds };
}

// Estimate schedule statistics
export function estimateSchedule(
  numPlayers: number,
  courts: number
): { rounds: number; matchesPerPlayer: number; perfectSchedule: boolean } {
  if (numPlayers < 4) {
    return { rounds: 0, matchesPerPlayer: 0, perfectSchedule: false };
  }

  const n = numPlayers;

  // Total partnerships needed
  const totalPairs = (n * (n - 1)) / 2;

  // Total matches needed (2 pairs per match)
  const totalMatches = totalPairs / 2;

  // Each player plays (n-1) matches
  const matchesPerPlayer = n - 1;

  // Check if perfect schedule is possible
  // n*(n-1) must be divisible by 4
  const perfectSchedule = (n * (n - 1)) % 4 === 0;

  // Matches per round (limited by courts and players)
  const matchesPerRound = Math.min(courts, Math.floor(n / 4));

  // Estimated rounds
  const rounds = Math.ceil(totalMatches / matchesPerRound);

  return { rounds, matchesPerPlayer, perfectSchedule };
}

// Get schedule statistics for verification
export function getScheduleStats(
  matches: Match[],
  players: Player[]
): {
  matchesPerPlayer: Record<string, number>;
  partnershipsCount: Record<string, number>;
  partnershipMatrix: Record<string, Record<string, number>>;
  minMatches: number;
  maxMatches: number;
  allPartnered: boolean;
} {
  const matchesPerPlayer: Record<string, number> = {};
  const partnershipsCount: Record<string, number> = {};
  const partnershipMatrix: Record<string, Record<string, number>> = {};

  // Initialize
  players.forEach(p => {
    matchesPerPlayer[p.id] = 0;
    partnershipsCount[p.id] = 0;
    partnershipMatrix[p.id] = {};
    players.forEach(q => {
      if (p.id !== q.id) {
        partnershipMatrix[p.id][q.id] = 0;
      }
    });
  });

  // Count matches and partnerships
  matches.forEach(match => {
    // Count matches per player
    [...match.team1, ...match.team2].forEach(pId => {
      matchesPerPlayer[pId] = (matchesPerPlayer[pId] || 0) + 1;
    });

    // Count partnerships
    // Team 1
    const [p1, p2] = match.team1;
    if (partnershipMatrix[p1]) partnershipMatrix[p1][p2] = (partnershipMatrix[p1][p2] || 0) + 1;
    if (partnershipMatrix[p2]) partnershipMatrix[p2][p1] = (partnershipMatrix[p2][p1] || 0) + 1;

    // Team 2
    const [p3, p4] = match.team2;
    if (partnershipMatrix[p3]) partnershipMatrix[p3][p4] = (partnershipMatrix[p3][p4] || 0) + 1;
    if (partnershipMatrix[p4]) partnershipMatrix[p4][p3] = (partnershipMatrix[p4][p3] || 0) + 1;
  });

  // Count unique partners
  players.forEach(p => {
    partnershipsCount[p.id] = Object.values(partnershipMatrix[p.id] || {})
      .filter(count => count > 0).length;
  });

  // Check if everyone has partnered with everyone
  let allPartnered = true;
  for (const p of players) {
    for (const q of players) {
      if (p.id !== q.id && (partnershipMatrix[p.id]?.[q.id] || 0) === 0) {
        allPartnered = false;
        break;
      }
    }
    if (!allPartnered) break;
  }

  const counts = Object.values(matchesPerPlayer);
  const minMatches = Math.min(...counts);
  const maxMatches = Math.max(...counts);

  return {
    matchesPerPlayer,
    partnershipsCount,
    partnershipMatrix,
    minMatches,
    maxMatches,
    allPartnered
  };
}
