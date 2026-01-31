'use client';

import { useMemo, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { MatchScoreInput } from '@/components/tournament/MatchScoreInput';
import { ProgressBar } from '@/components/tournament/ProgressBar';
import { ByeBadge } from '@/components/ui/Badge';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { DarkModeToggle } from '@/components/ui/DarkModeToggle';
import { useTournament } from '@/hooks/useTournament';
import { labels } from '@/lib/labels';
import { cn } from '@/lib/utils';

function PlayContent() {
  const router = useRouter();
  const {
    tournament,
    players,
    settings,
    currentRound,
    totalRounds,
    isRoundComplete,
    isTournamentComplete,
    submitScore,
    advanceRound,
    finishTournament,
  } = useTournament();

  // Round and match navigation state
  const [viewedRound, setViewedRound] = useState(currentRound);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  // Get matches for viewed round
  const viewedRoundMatches = useMemo(() => {
    return tournament?.matches.filter((m) => m.round === viewedRound) || [];
  }, [tournament?.matches, viewedRound]);

  // Get byes for viewed round
  const viewedRoundByes = useMemo(() => {
    return tournament?.byesByRound[viewedRound] || [];
  }, [tournament?.byesByRound, viewedRound]);

  // O(1) player lookup instead of O(n) find
  const playerMap = useMemo(
    () => new Map(players.map((p) => [p.id, p.name])),
    [players]
  );

  const getPlayerName = useCallback(
    (id: string) => playerMap.get(id) || 'Unbekannt',
    [playerMap]
  );

  // Round navigation handlers
  const goToPreviousRound = useCallback(() => {
    setViewedRound((prev) => Math.max(1, prev - 1));
    setCurrentMatchIndex(0);
  }, []);

  const goToNextRound = useCallback(() => {
    setViewedRound((prev) => Math.min(totalRounds, prev + 1));
    setCurrentMatchIndex(0);
  }, [totalRounds]);

  // Match navigation handlers
  const goToPreviousMatch = useCallback(() => {
    setCurrentMatchIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToNextMatch = useCallback(() => {
    setCurrentMatchIndex((prev) => Math.min(viewedRoundMatches.length - 1, prev + 1));
  }, [viewedRoundMatches.length]);

  const toggleViewMode = useCallback(() => {
    setShowAll((prev) => !prev);
  }, []);

  const handleSubmitScore = (matchId: string, score1: number, score2: number) => {
    submitScore(matchId, score1, score2);
  };

  const handleNextRound = () => {
    if (currentRound < totalRounds) {
      advanceRound();
      setViewedRound(currentRound + 1);
      setCurrentMatchIndex(0);
    }
  };

  const handleFinish = () => {
    finishTournament();
    router.push('/leaderboard');
  };

  // Completed matches count for viewed round
  const completedMatches = viewedRoundMatches.filter((m) => m.completed).length;
  const totalMatchesInRound = viewedRoundMatches.length;

  // Overall progress
  const allMatches = tournament?.matches || [];
  const totalCompleted = allMatches.filter((m) => m.completed).length;
  const totalMatches = allMatches.length;

  // Check if viewed round is complete
  const isViewedRoundComplete =
    viewedRoundMatches.length > 0 && viewedRoundMatches.every((m) => m.completed);

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-start mb-6 animate-fade-in">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-txt-muted hover:text-txt transition-colors mb-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {labels.back}
            </Link>
            <h1 className="text-2xl sm:text-3xl font-display text-txt tracking-wide">
              {labels.roundOf
                .replace('{current}', viewedRound.toString())
                .replace('{total}', totalRounds.toString())}
            </h1>
            {viewedRound !== currentRound && (
              <p className="text-xs text-warning mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
                Aktuelle Runde: {currentRound}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <LogoutButton onLogout={() => router.push('/')} />
          </div>
        </header>

        {/* Round Navigation */}
        {totalRounds > 1 && (
          <div className="flex items-center justify-between mb-6 animate-slide-up">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPreviousRound}
              disabled={viewedRound === 1}
              aria-label={labels.previousRound}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {labels.previousRound}
            </Button>

            {/* Round Indicators */}
            <div className="flex gap-1.5">
              {Array.from({ length: totalRounds }, (_, i) => i + 1).map((round) => {
                const roundMatches = allMatches.filter((m) => m.round === round);
                const allComplete = roundMatches.length > 0 && roundMatches.every((m) => m.completed);
                const isViewing = round === viewedRound;
                const isCurrent = round === currentRound;

                return (
                  <button
                    key={round}
                    type="button"
                    onClick={() => {
                      setViewedRound(round);
                      setCurrentMatchIndex(0);
                    }}
                    className={cn(
                      'w-3 h-3 rounded-full transition-all duration-300',
                      isViewing && 'w-6 bg-accent shadow-glow-sm indicator-active',
                      !isViewing && isCurrent && 'bg-accent/60',
                      !isViewing && !isCurrent && allComplete && 'bg-success/60',
                      !isViewing && !isCurrent && !allComplete && 'bg-dark-surface border border-dark-border'
                    )}
                    aria-label={`Runde ${round}${isCurrent ? ' (aktuell)' : ''}${allComplete ? ' (abgeschlossen)' : ''}`}
                  />
                );
              })}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={goToNextRound}
              disabled={viewedRound === totalRounds}
              aria-label={labels.nextRoundNav}
            >
              {labels.nextRoundNav}
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        )}

        {/* Progress Bars */}
        <div className="space-y-3 mb-6 animate-slide-up delay-100" style={{ animationFillMode: 'backwards' }}>
          <ProgressBar
            current={completedMatches}
            total={totalMatchesInRound}
            label={`Runde ${viewedRound}`}
          />
          <ProgressBar current={totalCompleted} total={totalMatches} label="Gesamt" />
        </div>

        {/* Quick Nav Buttons */}
        <div className="flex gap-2 mb-6 animate-slide-up delay-200" style={{ animationFillMode: 'backwards' }}>
          <Button
            variant="secondary"
            onClick={() => router.push('/schedule')}
            fullWidth
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {labels.schedule}
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push('/leaderboard')}
            fullWidth
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {labels.leaderboard}
          </Button>
        </div>

        {/* Bye Players */}
        {viewedRoundByes.length > 0 && (
          <Card className="mb-6 animate-slide-up delay-200" style={{ animationFillMode: 'backwards' }}>
            <CardContent>
              <div className="flex items-center gap-3 flex-wrap">
                <ByeBadge />
                <span className="text-sm text-txt-secondary">
                  {labels.byePlayers}:
                </span>
                <span className="text-sm font-medium text-txt">
                  {viewedRoundByes.map(getPlayerName).join(', ')}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* View Mode Toggle */}
        {viewedRoundMatches.length > 1 && (
          <div className="flex justify-end mb-4">
            <Button variant="ghost" size="sm" onClick={toggleViewMode}>
              {showAll ? labels.showSingleMatch : labels.showAllMatches}
            </Button>
          </div>
        )}

        {/* Matches */}
        {showAll ? (
          <div className="space-y-4 mb-6">
            {viewedRoundMatches.map((match, index) => (
              <div
                key={match.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
              >
                <MatchScoreInput
                  match={match}
                  players={players}
                  pointsPerMatch={settings?.pointsPerMatch || 24}
                  onSubmit={(score1, score2) => handleSubmitScore(match.id, score1, score2)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-6">
            {/* Match navigation header */}
            {viewedRoundMatches.length > 1 && (
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPreviousMatch}
                  disabled={currentMatchIndex === 0}
                  aria-label={labels.previousMatch}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {labels.previousMatch}
                </Button>
                <span className="text-sm font-display text-txt-secondary tracking-wide">
                  {labels.matchOf
                    .replace('{current}', (currentMatchIndex + 1).toString())
                    .replace('{total}', viewedRoundMatches.length.toString())}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToNextMatch}
                  disabled={currentMatchIndex === viewedRoundMatches.length - 1}
                  aria-label={labels.nextMatch}
                >
                  {labels.nextMatch}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
            )}

            {/* Current match */}
            {viewedRoundMatches[currentMatchIndex] && (
              <div className="animate-scale-in">
                <MatchScoreInput
                  match={viewedRoundMatches[currentMatchIndex]}
                  players={players}
                  pointsPerMatch={settings?.pointsPerMatch || 24}
                  onSubmit={(score1, score2) =>
                    handleSubmitScore(viewedRoundMatches[currentMatchIndex].id, score1, score2)
                  }
                />
              </div>
            )}

            {/* Match indicators */}
            {viewedRoundMatches.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {viewedRoundMatches.map((match, index) => (
                  <button
                    key={match.id}
                    type="button"
                    onClick={() => setCurrentMatchIndex(index)}
                    className={cn(
                      'w-3 h-3 rounded-full transition-all duration-300',
                      index === currentMatchIndex && 'w-6 bg-accent shadow-glow-sm',
                      index !== currentMatchIndex && match.completed && 'bg-success/60',
                      index !== currentMatchIndex && !match.completed && 'bg-dark-surface border border-dark-border'
                    )}
                    aria-label={`Spiel ${index + 1}${match.completed ? ' (abgeschlossen)' : ''}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Round/Tournament Complete Actions */}
        {viewedRound === currentRound && isRoundComplete && (
          <div className="space-y-3 animate-scale-in">
            {isTournamentComplete || currentRound >= totalRounds ? (
              <Button size="lg" fullWidth onClick={handleFinish} className="shadow-glow">
                {labels.finishTournament}
              </Button>
            ) : (
              <Button size="lg" fullWidth onClick={handleNextRound} className="shadow-glow">
                {labels.nextRound}
              </Button>
            )}
          </div>
        )}

        {/* Pending matches info */}
        {!isViewedRoundComplete && viewedRoundMatches.length > 0 && (
          <p className="text-center text-txt-muted text-sm">
            {totalMatchesInRound - completedMatches} Spiele ausstehend
          </p>
        )}
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
