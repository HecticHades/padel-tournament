import type { Match, Player } from './types';
import { generateId, shuffleArray } from './storage';

interface ScheduleResult {
  matches: Match[];
  byesByRound: Record<number, string[]>;
  totalRounds: number;
}

// Generate all unique pairs from players
function generateAllPairs(playerIds: string[]): [string, string][] {
  const pairs: [string, string][] = [];
  for (let i = 0; i < playerIds.length; i++) {
    for (let j = i + 1; j < playerIds.length; j++) {
      pairs.push([playerIds[i], playerIds[j]]);
    }
  }
  return pairs;
}

// Check if a player is already in a round
function playerInRound(playerId: string, roundMatches: Match[]): boolean {
  return roundMatches.some(
    m => m.team1.includes(playerId) || m.team2.includes(playerId)
  );
}

// Get players in a round
function getPlayersInRound(roundMatches: Match[]): Set<string> {
  const players = new Set<string>();
  for (const match of roundMatches) {
    match.team1.forEach(p => players.add(p));
    match.team2.forEach(p => players.add(p));
  }
  return players;
}

// Calculate how many times two players have been partners
function partnerCount(
  player1: string,
  player2: string,
  matches: Match[]
): number {
  return matches.filter(m => {
    const team1HasBoth = m.team1.includes(player1) && m.team1.includes(player2);
    const team2HasBoth = m.team2.includes(player1) && m.team2.includes(player2);
    return team1HasBoth || team2HasBoth;
  }).length;
}

// Calculate how many times two players have been opponents
function opponentCount(
  player1: string,
  player2: string,
  matches: Match[]
): number {
  return matches.filter(m => {
    const p1Team1 = m.team1.includes(player1);
    const p1Team2 = m.team2.includes(player1);
    const p2Team1 = m.team1.includes(player2);
    const p2Team2 = m.team2.includes(player2);
    return (p1Team1 && p2Team2) || (p1Team2 && p2Team1);
  }).length;
}

// Score a potential match based on fairness
function scoreMatch(
  team1: [string, string],
  team2: [string, string],
  existingMatches: Match[]
): number {
  // Lower score is better
  let score = 0;

  // Penalize repeat partnerships
  score += partnerCount(team1[0], team1[1], existingMatches) * 10;
  score += partnerCount(team2[0], team2[1], existingMatches) * 10;

  // Smaller penalty for repeat opponents
  score += opponentCount(team1[0], team2[0], existingMatches) * 5;
  score += opponentCount(team1[0], team2[1], existingMatches) * 5;
  score += opponentCount(team1[1], team2[0], existingMatches) * 5;
  score += opponentCount(team1[1], team2[1], existingMatches) * 5;

  return score;
}

// Try to create a match for a round
function createMatchForRound(
  availablePlayers: string[],
  existingMatches: Match[],
  roundMatches: Match[],
  round: number,
  court: number
): Match | null {
  if (availablePlayers.length < 4) return null;

  // Generate all possible team combinations
  const allPairs = generateAllPairs(availablePlayers);
  let bestMatch: Match | null = null;
  let bestScore = Infinity;

  // Try different pair combinations
  for (let i = 0; i < allPairs.length; i++) {
    const team1 = allPairs[i];

    for (let j = i + 1; j < allPairs.length; j++) {
      const team2 = allPairs[j];

      // Check if teams share a player
      if (
        team1[0] === team2[0] ||
        team1[0] === team2[1] ||
        team1[1] === team2[0] ||
        team1[1] === team2[1]
      ) {
        continue;
      }

      const score = scoreMatch(team1, team2, [...existingMatches, ...roundMatches]);

      if (score < bestScore) {
        bestScore = score;
        bestMatch = {
          id: generateId(),
          round,
          court,
          team1,
          team2,
          score1: null,
          score2: null,
          completed: false,
        };
      }
    }
  }

  return bestMatch;
}

// Main scheduling function
export function generateSchedule(
  players: Player[],
  courts: number,
  pointsPerMatch: number
): ScheduleResult {
  const playerIds = players.map(p => p.id);
  const numPlayers = playerIds.length;

  if (numPlayers < 4) {
    return { matches: [], byesByRound: {}, totalRounds: 0 };
  }

  // Calculate target number of rounds
  // In Americano, we want each player to play with as many different partners as possible
  // With n players, each player can have n-1 different partners
  // Each match gives a player 1 partner, so ideal rounds = n-1
  // But with courts limiting matches per round, we need to adjust
  const matchesPerRound = Math.min(courts, Math.floor(numPlayers / 4));
  const playersPerRound = matchesPerRound * 4;

  // Target: each player plays approximately the same number of matches
  // Aim for each player to partner with most others at least once
  const targetRounds = Math.ceil((numPlayers - 1) / 2) + 1;
  const maxRounds = Math.min(targetRounds, 15); // Cap at 15 rounds

  const matches: Match[] = [];
  const byesByRound: Record<number, string[]> = {};
  const playerMatchCount: Record<string, number> = {};

  // Initialize match counts
  playerIds.forEach(id => {
    playerMatchCount[id] = 0;
  });

  for (let round = 1; round <= maxRounds; round++) {
    const roundMatches: Match[] = [];

    // Sort players by match count (ascending) to prioritize those with fewer matches
    const sortedPlayers = shuffleArray([...playerIds]).sort(
      (a, b) => playerMatchCount[a] - playerMatchCount[b]
    );

    let availablePlayers = [...sortedPlayers];

    for (let court = 1; court <= courts && availablePlayers.length >= 4; court++) {
      const match = createMatchForRound(
        availablePlayers,
        matches,
        roundMatches,
        round,
        court
      );

      if (match) {
        roundMatches.push(match);

        // Remove assigned players from available pool
        const assignedPlayers = [...match.team1, ...match.team2];
        availablePlayers = availablePlayers.filter(
          p => !assignedPlayers.includes(p)
        );

        // Update match counts
        assignedPlayers.forEach(p => {
          playerMatchCount[p]++;
        });
      }
    }

    // Record byes (players not in any match this round)
    const playersInRound = getPlayersInRound(roundMatches);
    const byePlayers = playerIds.filter(p => !playersInRound.has(p));
    byesByRound[round] = byePlayers;

    matches.push(...roundMatches);

    // Check if we have good distribution
    const minMatches = Math.min(...Object.values(playerMatchCount));
    const maxMatches = Math.max(...Object.values(playerMatchCount));

    // If distribution is too uneven and we've played enough rounds, we can stop
    if (round >= numPlayers - 1 && maxMatches - minMatches <= 1) {
      break;
    }
  }

  // Determine actual number of rounds
  const totalRounds = Math.max(...matches.map(m => m.round), 0);

  return { matches, byesByRound, totalRounds };
}

// Estimate number of matches and rounds
export function estimateSchedule(
  numPlayers: number,
  courts: number
): { rounds: number; matchesPerPlayer: number } {
  if (numPlayers < 4) {
    return { rounds: 0, matchesPerPlayer: 0 };
  }

  const matchesPerRound = Math.min(courts, Math.floor(numPlayers / 4));
  const playersPerRound = matchesPerRound * 4;
  const targetRounds = Math.ceil((numPlayers - 1) / 2) + 1;
  const rounds = Math.min(targetRounds, 15);

  // Average matches per player
  const totalMatches = matchesPerRound * rounds;
  const matchesPerPlayer = Math.floor((totalMatches * 4) / numPlayers);

  return { rounds, matchesPerPlayer };
}

// Get schedule statistics
export function getScheduleStats(
  matches: Match[],
  players: Player[]
): {
  matchesPerPlayer: Record<string, number>;
  partnershipsCount: Record<string, number>;
  minMatches: number;
  maxMatches: number;
} {
  const matchesPerPlayer: Record<string, number> = {};
  const partnershipsCount: Record<string, number> = {};

  players.forEach(p => {
    matchesPerPlayer[p.id] = 0;
    partnershipsCount[p.id] = 0;
  });

  const seenPartners: Record<string, Set<string>> = {};
  players.forEach(p => {
    seenPartners[p.id] = new Set();
  });

  matches.forEach(match => {
    // Count matches
    [...match.team1, ...match.team2].forEach(pId => {
      matchesPerPlayer[pId] = (matchesPerPlayer[pId] || 0) + 1;
    });

    // Track unique partners
    seenPartners[match.team1[0]]?.add(match.team1[1]);
    seenPartners[match.team1[1]]?.add(match.team1[0]);
    seenPartners[match.team2[0]]?.add(match.team2[1]);
    seenPartners[match.team2[1]]?.add(match.team2[0]);
  });

  // Count unique partners
  players.forEach(p => {
    partnershipsCount[p.id] = seenPartners[p.id]?.size || 0;
  });

  const counts = Object.values(matchesPerPlayer);
  const minMatches = Math.min(...counts);
  const maxMatches = Math.max(...counts);

  return { matchesPerPlayer, partnershipsCount, minMatches, maxMatches };
}
