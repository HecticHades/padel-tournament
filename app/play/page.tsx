'use client';

import { useMemo } from 'react';
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

  const getPlayerName = (id: string) => {
    return players.find((p) => p.id === id)?.name || 'Unbekannt';
  };

  // Players with fewer matches
  const playersWithFewerMatches = useMemo(() => {
    return getPlayersWithFewerMatches(leaderboard);
  }, [leaderboard]);

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
        {playersWithFewerMatches.length > 0 && (
          <div className="mb-6">
            <FewerMatchesNotification players={playersWithFewerMatches} />
          </div>
        )}

        {/* Bye players */}
        {currentRoundByes.length > 0 && (
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
        )}

        {/* Matches */}
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

        {/* Round complete / Tournament complete */}
        {isRoundComplete && (
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
        )}

        {!isRoundComplete && currentRoundMatches.length > 0 && (
          <p className="text-center text-slate-500 dark:text-slate-400 text-sm">
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
