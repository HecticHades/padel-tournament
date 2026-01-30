'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { RoundCard } from '@/components/tournament/RoundCard';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { DarkModeToggle } from '@/components/ui/DarkModeToggle';
import { useTournament } from '@/hooks/useTournament';
import { useAuth } from '@/hooks/useAuth';
import { labels } from '@/lib/labels';

function ScheduleContent() {
  const router = useRouter();
  const { tournament, players, matches, currentRound, totalRounds } = useTournament();
  const { isReadOnly } = useAuth();

  // Group matches by round
  const matchesByRound = useMemo(() => {
    const grouped: Record<number, typeof matches> = {};
    for (let r = 1; r <= totalRounds; r++) {
      grouped[r] = matches.filter((m) => m.round === r);
    }
    return grouped;
  }, [matches, totalRounds]);

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

        {/* Rounds */}
        <div className="space-y-4">
          {Object.entries(matchesByRound).map(([round, roundMatches]) => (
            <RoundCard
              key={round}
              round={parseInt(round)}
              matches={roundMatches}
              byePlayers={tournament?.byesByRound[parseInt(round)] || []}
              players={players}
              isCurrentRound={parseInt(round) === currentRound}
            />
          ))}
        </div>
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
