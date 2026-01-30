'use client';

import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { RoundCard } from '@/components/tournament/RoundCard';
import { MatchScoreInput } from '@/components/tournament/MatchScoreInput';
import { Card, CardContent } from '@/components/ui/Card';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { DarkModeToggle } from '@/components/ui/DarkModeToggle';
import { useTournament } from '@/hooks/useTournament';
import { useAuth } from '@/hooks/useAuth';
import { labels } from '@/lib/labels';
import type { Match } from '@/lib/types';

function ScheduleContent() {
  const router = useRouter();
  const { tournament, players, matches, settings, currentRound, totalRounds, submitScore } =
    useTournament();
  const { isReadOnly } = useAuth();

  // Round navigation state
  const [viewedRound, setViewedRound] = useState(currentRound);
  const [showAllRounds, setShowAllRounds] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  // Group matches by round
  const matchesByRound = useMemo(() => {
    const grouped: Record<number, typeof matches> = {};
    for (let r = 1; r <= totalRounds; r++) {
      grouped[r] = matches.filter((m) => m.round === r);
    }
    return grouped;
  }, [matches, totalRounds]);

  // Navigation handlers
  const goToPreviousRound = useCallback(() => {
    setViewedRound((prev) => Math.max(1, prev - 1));
  }, []);

  const goToNextRound = useCallback(() => {
    setViewedRound((prev) => Math.min(totalRounds, prev + 1));
  }, [totalRounds]);

  const toggleViewMode = useCallback(() => {
    setShowAllRounds((prev) => !prev);
  }, []);

  // Match click handler for editing
  const handleMatchClick = useCallback(
    (matchId: string) => {
      if (isReadOnly) return;
      const match = matches.find((m) => m.id === matchId);
      if (match) {
        setEditingMatch(match);
      }
    },
    [matches, isReadOnly]
  );

  // Score submit handler
  const handleScoreSubmit = useCallback(
    (score1: number, score2: number) => {
      if (editingMatch) {
        submitScore(editingMatch.id, score1, score2);
        setEditingMatch(null);
      }
    },
    [editingMatch, submitScore]
  );

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
              {labels.schedule}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {labels.roundOf
                .replace('{current}', currentRound.toString())
                .replace('{total}', totalRounds.toString())}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <LogoutButton onLogout={() => router.push('/')} />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mb-6">
          {!isReadOnly && (
            <Button
              variant="primary"
              onClick={() => router.push('/play')}
              fullWidth
            >
              {labels.enterScores}
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => router.push('/leaderboard')}
            fullWidth
          >
            {labels.leaderboard}
          </Button>
        </div>

        {/* View mode toggle */}
        {totalRounds > 1 && (
          <div className="flex justify-end mb-4">
            <Button variant="ghost" size="sm" onClick={toggleViewMode}>
              {showAllRounds ? labels.showSingleRound : labels.showAllRounds}
            </Button>
          </div>
        )}

        {/* Rounds */}
        {showAllRounds ? (
          <div className="space-y-4">
            {Object.entries(matchesByRound).map(([round, roundMatches]) => (
              <RoundCard
                key={round}
                round={parseInt(round)}
                matches={roundMatches}
                byePlayers={tournament?.byesByRound[parseInt(round)] || []}
                players={players}
                isCurrentRound={parseInt(round) === currentRound}
                onMatchClick={!isReadOnly ? handleMatchClick : undefined}
              />
            ))}
          </div>
        ) : (
          <div>
            {/* Round navigation header */}
            {totalRounds > 1 && (
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={goToPreviousRound}
                  disabled={viewedRound === 1}
                  aria-label={labels.previousRound}
                >
                  &larr; {labels.previousRound}
                </Button>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {labels.roundOf
                    .replace('{current}', viewedRound.toString())
                    .replace('{total}', totalRounds.toString())}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={goToNextRound}
                  disabled={viewedRound === totalRounds}
                  aria-label={labels.nextRoundNav}
                >
                  {labels.nextRoundNav} &rarr;
                </Button>
              </div>
            )}

            {/* Current viewed round */}
            <RoundCard
              round={viewedRound}
              matches={matchesByRound[viewedRound] || []}
              byePlayers={tournament?.byesByRound[viewedRound] || []}
              players={players}
              isCurrentRound={viewedRound === currentRound}
              onMatchClick={!isReadOnly ? handleMatchClick : undefined}
            />

            {/* Round indicators */}
            {totalRounds > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: totalRounds }, (_, i) => i + 1).map((round) => {
                  const roundMatches = matchesByRound[round] || [];
                  const allComplete = roundMatches.length > 0 && roundMatches.every((m) => m.completed);
                  return (
                    <button
                      key={round}
                      type="button"
                      onClick={() => setViewedRound(round)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        round === viewedRound
                          ? 'bg-emerald-500'
                          : allComplete
                            ? 'bg-slate-400 dark:bg-slate-500'
                            : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                      aria-label={`Runde ${round}${allComplete ? ' (abgeschlossen)' : ''}`}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Edit Match Modal */}
        {editingMatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 dark:bg-black/70"
              onClick={() => setEditingMatch(null)}
            />
            <Card className="relative w-full max-w-md">
              <CardContent>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  {labels.editScore}
                </h3>
                <MatchScoreInput
                  match={editingMatch}
                  players={players}
                  pointsPerMatch={settings?.pointsPerMatch || 24}
                  onSubmit={handleScoreSubmit}
                />
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => setEditingMatch(null)}
                  className="mt-3"
                >
                  {labels.cancel}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}

export default function SchedulePage() {
  return (
    <AuthGuard requireAuth={true} allowReadOnly={true}>
      <ScheduleContent />
    </AuthGuard>
  );
}
