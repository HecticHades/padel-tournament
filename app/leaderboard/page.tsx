'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
  calculateOpponentBasedAdjustment,
  sortByAdjusted,
  calculateFairnessStats,
  getPlayersWithFewerMatches,
} from '@/lib/fairness';
import type { AdjustmentMethod } from '@/lib/types';

function LeaderboardContent() {
  const router = useRouter();
  const { tournament, leaderboard, settings, status, currentRound, totalRounds, restartTournament } =
    useTournament();
  const { isReadOnly } = useAuth();
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

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
  const [adjustmentMethod, setAdjustmentMethod] = useState<AdjustmentMethod>('average');

  useEffect(() => {
    if (status === 'completed' && !fairnessStats.isBalanced) {
      setShowAdjusted(true);
    }
  }, [status, fairnessStats.isBalanced]);

  // Calculate adjusted standings based on selected method
  const adjustedStandings = useMemo(() => {
    if (!settings || !tournament) return [];

    if (adjustmentMethod === 'opponent-based') {
      return calculateOpponentBasedAdjustment(
        leaderboard,
        tournament.matches,
        settings.pointsPerMatch
      );
    }

    return calculateAdjustedStandings(leaderboard, settings.pointsPerMatch);
  }, [leaderboard, settings, tournament, adjustmentMethod]);

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
          <Card className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden ring-2 ring-green-500 ring-offset-2 ring-offset-green-50 dark:ring-offset-green-900/20">
                    <Image
                      src="/sandi.png"
                      alt="Sändi gratuliert"
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-green-700 dark:text-green-300 font-bold text-lg">
                    Gratulation!
                  </p>
                  <p className="text-green-600 dark:text-green-400 text-sm">
                    Turnier erfolgreich abgeschlossen
                  </p>
                </div>
              </div>
              {!isReadOnly && (
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowRestartConfirm(true)}
                  className="mt-4"
                >
                  {labels.restartTournament}
                </Button>
              )}
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
              method={adjustmentMethod}
              onMethodChange={setAdjustmentMethod}
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
              showCalculationDetails={adjustmentMethod === 'opponent-based'}
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

        {/* Restart confirmation modal */}
        {showRestartConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 dark:bg-black/70"
              onClick={() => setShowRestartConfirm(false)}
            />
            <Card className="relative w-full max-w-sm">
              <CardContent>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  {labels.restartConfirmTitle}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {labels.restartConfirmMessage}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => setShowRestartConfirm(false)}
                  >
                    {labels.cancel}
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => {
                      restartTournament();
                      setShowRestartConfirm(false);
                      router.push('/setup');
                    }}
                  >
                    {labels.restartConfirm}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
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
