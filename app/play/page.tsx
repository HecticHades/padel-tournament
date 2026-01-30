'use client';

import { useMemo, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { MatchScoreInput } from '@/components/tournament/MatchScoreInput';
import { ProgressBar } from '@/components/tournament/ProgressBar';
import { FewerMatchesNotification } from '@/components/tournament/FewerMatchesNotification';
import { ByeBadge } from '@/components/ui/Badge';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { DarkModeToggle } from '@/components/ui/DarkModeToggle';
import { useTournament } from '@/hooks/useTournament';
import { labels } from '@/lib/labels';
import { getPlayersWithFewerMatches } from '@/lib/fairness';

function PlayContent() {
  const router = useRouter();
  const {
    tournament,
    players,
    settings,
    currentRound,
    totalRounds,
    currentRoundMatches,
    currentRoundByes,
    isRoundComplete,
    isTournamentComplete,
    leaderboard,
    submitScore,
    advanceRound,
    finishTournament,
  } = useTournament();

  // Match navigation state
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  // O(1) player lookup instead of O(n) find
  const playerMap = useMemo(
    () => new Map(players.map(p => [p.id, p.name])),
    [players]
  );

  const getPlayerName = useCallback(
    (id: string) => playerMap.get(id) || 'Unbekannt',
    [playerMap]
  );

  // Players with fewer matches
  const playersWithFewerMatches = useMemo(
    () => getPlayersWithFewerMatches(leaderboard),
    [leaderboard]
  );

  // Match navigation handlers
  const goToPreviousMatch = useCallback(() => {
    setCurrentMatchIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToNextMatch = useCallback(() => {
    setCurrentMatchIndex((prev) => Math.min(currentRoundMatches.length - 1, prev + 1));
  }, [currentRoundMatches.length]);

  const toggleViewMode = useCallback(() => {
    setShowAll((prev) => !prev);
  }, []);

  const handleSubmitScore = (matchId: string, score1: number, score2: number) => {
    submitScore(matchId, score1, score2);
  };

  const handleNextRound = () => {
    if (currentRound < totalRounds) {
      advanceRound();
    }
  };

  const handleFinish = () => {
    finishTournament();
    router.push('/leaderboard');
  };

  // Completed matches count
  const completedMatches = currentRoundMatches.filter((m) => m.completed).length;
  const totalMatchesInRound = currentRoundMatches.length;

  // Overall progress
  const allMatches = tournament?.matches || [];
  const totalCompleted = allMatches.filter((m) => m.completed).length;
  const totalMatches = allMatches.length;

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link
              href="/"
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              &larr; {labels.back}
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {labels.roundOf
                .replace('{current}', currentRound.toString())
                .replace('{total}', totalRounds.toString())}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <LogoutButton onLogout={() => router.push('/')} />
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2 mb-6">
          <ProgressBar
            current={completedMatches}
            total={totalMatchesInRound}
            label="Diese Runde"
          />
          <ProgressBar
            current={totalCompleted}
            total={totalMatches}
            label="Gesamt"
          />
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-2 mb-6">
          <Button
            variant="secondary"
            onClick={() => router.push('/schedule')}
            fullWidth
          >
            {labels.schedule}
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push('/leaderboard')}
            fullWidth
          >
            {labels.leaderboard}
          </Button>
        </div>

        {/* Fewer matches notification */}
        {playersWithFewerMatches.length > 0 ? (
          <div className="mb-6">
            <FewerMatchesNotification players={playersWithFewerMatches} />
          </div>
        ) : null}

        {/* Bye players */}
        {currentRoundByes.length > 0 ? (
          <Card className="mb-6">
            <CardContent>
              <div className="flex items-center gap-2 flex-wrap">
                <ByeBadge />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {labels.byePlayers}:
                </span>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {currentRoundByes.map(getPlayerName).join(', ')}
                </span>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* View mode toggle */}
        {currentRoundMatches.length > 1 && (
          <div className="flex justify-end mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleViewMode}
            >
              {showAll ? labels.showSingleMatch : labels.showAllMatches}
            </Button>
          </div>
        )}

        {/* Matches */}
        {showAll ? (
          <div className="space-y-4 mb-6">
            {currentRoundMatches.map((match) => (
              <MatchScoreInput
                key={match.id}
                match={match}
                players={players}
                pointsPerMatch={settings?.pointsPerMatch || 24}
                onSubmit={(score1, score2) => handleSubmitScore(match.id, score1, score2)}
              />
            ))}
          </div>
        ) : (
          <div className="mb-6">
            {/* Match navigation header */}
            {currentRoundMatches.length > 1 && (
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={goToPreviousMatch}
                  disabled={currentMatchIndex === 0}
                  aria-label={labels.previousMatch}
                >
                  &larr; {labels.previousMatch}
                </Button>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {labels.matchOf
                    .replace('{current}', (currentMatchIndex + 1).toString())
                    .replace('{total}', currentRoundMatches.length.toString())}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={goToNextMatch}
                  disabled={currentMatchIndex === currentRoundMatches.length - 1}
                  aria-label={labels.nextMatch}
                >
                  {labels.nextMatch} &rarr;
                </Button>
              </div>
            )}

            {/* Current match */}
            {currentRoundMatches[currentMatchIndex] && (
              <MatchScoreInput
                match={currentRoundMatches[currentMatchIndex]}
                players={players}
                pointsPerMatch={settings?.pointsPerMatch || 24}
                onSubmit={(score1, score2) =>
                  handleSubmitScore(currentRoundMatches[currentMatchIndex].id, score1, score2)
                }
              />
            )}

            {/* Match indicators */}
            {currentRoundMatches.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {currentRoundMatches.map((match, index) => (
                  <button
                    key={match.id}
                    type="button"
                    onClick={() => setCurrentMatchIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentMatchIndex
                        ? 'bg-emerald-500'
                        : match.completed
                          ? 'bg-slate-400 dark:bg-slate-500'
                          : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                    aria-label={`Spiel ${index + 1}${match.completed ? ' (abgeschlossen)' : ''}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Round complete / Tournament complete */}
        {isRoundComplete ? (
          <div className="space-y-3">
            {isTournamentComplete || currentRound >= totalRounds ? (
              <Button size="lg" fullWidth onClick={handleFinish}>
                {labels.finishTournament}
              </Button>
            ) : (
              <Button size="lg" fullWidth onClick={handleNextRound}>
                {labels.nextRound}
              </Button>
            )}
          </div>
        ) : null}

        {!isRoundComplete && currentRoundMatches.length > 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 text-sm">
            {totalMatchesInRound - completedMatches} Spiele ausstehend
          </p>
        ) : null}
      </div>
    </main>
  );
}

export default function PlayPage() {
  return (
    <AuthGuard requireAuth={true} allowReadOnly={false}>
      <PlayContent />
    </AuthGuard>
  );
}
