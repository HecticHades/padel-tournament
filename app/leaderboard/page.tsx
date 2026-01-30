'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { AdjustmentToggle } from '@/components/leaderboard/AdjustmentToggle';
import { ExportButtons } from '@/components/leaderboard/ExportButton';
import { FewerMatchesNotification } from '@/components/tournament/FewerMatchesNotification';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { DarkModeToggle } from '@/components/ui/DarkModeToggle';
import { useTournament } from '@/hooks/useTournament';
import { useAuth } from '@/hooks/useAuth';
import { labels } from '@/lib/labels';
import {
  calculateAdjustedStandings,
  sortByAdjusted,
  calculateFairnessStats,
  getPlayersWithFewerMatches,
} from '@/lib/fairness';

function LeaderboardContent() {
  const router = useRouter();
  const { tournament, leaderboard, settings, status, currentRound, totalRounds } =
    useTournament();
  const { isReadOnly } = useAuth();

  // Fairness stats
  const fairnessStats = useMemo(() => {
    return calculateFairnessStats(leaderboard);
  }, [leaderboard]);

  // Players with fewer matches
  const playersWithFewerMatches = useMemo(() => {
    return getPlayersWithFewerMatches(leaderboard);
  }, [leaderboard]);

  // Auto-enable adjusted view when tournament is completed and there are imbalanced matches
  const [showAdjusted, setShowAdjusted] = useState(false);

  useEffect(() => {
    if (status === 'completed' && !fairnessStats.isBalanced) {
      setShowAdjusted(true);
    }
  }, [status, fairnessStats.isBalanced]);

  // Calculate adjusted standings
  const adjustedStandings = useMemo(() => {
    if (!settings) return [];
    return calculateAdjustedStandings(leaderboard, settings.pointsPerMatch);
  }, [leaderboard, settings]);

  // Sort by adjusted if showing adjusted
  const displayStandings = useMemo(() => {
    return showAdjusted ? sortByAdjusted(adjustedStandings) : leaderboard;
  }, [showAdjusted, adjustedStandings, leaderboard]);

  const showAdjustmentToggle = !fairnessStats.isBalanced;

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
              {labels.leaderboard}
            </h1>
            {status !== 'completed' && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {labels.round} {currentRound} / {totalRounds}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <LogoutButton onLogout={() => router.push('/')} />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mb-6">
          {!isReadOnly && status !== 'completed' && (
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
            onClick={() => router.push('/schedule')}
            fullWidth
          >
            {labels.schedule}
          </Button>
        </div>

        {/* Tournament completed status */}
        {status === 'completed' && (
          <Card className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent>
              <p className="text-green-700 dark:text-green-300 font-medium text-center">
                Turnier abgeschlossen
              </p>
            </CardContent>
          </Card>
        )}

        {/* Fewer matches notification */}
        {playersWithFewerMatches.length > 0 && (
          <div className="mb-6">
            <FewerMatchesNotification players={playersWithFewerMatches} />
          </div>
        )}

        {/* Adjustment toggle */}
        {showAdjustmentToggle && (
          <div className="mb-4">
            <AdjustmentToggle
              enabled={showAdjusted}
              onChange={setShowAdjusted}
              maxMatches={fairnessStats.maxMatches}
            />
          </div>
        )}

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {labels.leaderboard}
                {showAdjusted && (
                  <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
                    (hochgerechnet auf {fairnessStats.maxMatches} Spiele)
                  </span>
                )}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <LeaderboardTable
              standings={displayStandings}
              showAdjusted={showAdjusted}
              maxMatches={fairnessStats.maxMatches}
            />
          </CardContent>
        </Card>

        {/* Export */}
        <div className="mt-4 flex justify-end">
          <ExportButtons
            standings={displayStandings}
            showAdjusted={showAdjusted}
            tournament={tournament}
            maxMatches={fairnessStats.maxMatches}
          />
        </div>
      </div>
    </main>
  );
}

export default function LeaderboardPage() {
  return (
    <AuthGuard requireAuth={true} allowReadOnly={true}>
      <LeaderboardContent />
    </AuthGuard>
  );
}
