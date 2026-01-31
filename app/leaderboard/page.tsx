'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
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
  calculatePartnerBasedAdjustment,
  calculateCombinedAdjustment,
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

    if (adjustmentMethod === 'partner-based') {
      return calculatePartnerBasedAdjustment(
        leaderboard,
        tournament.matches,
        settings.pointsPerMatch
      );
    }

    if (adjustmentMethod === 'combined') {
      return calculateCombinedAdjustment(
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
              {labels.leaderboard}
            </h1>
            {status !== 'completed' && (
              <p className="text-sm text-txt-secondary mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                {labels.round} {currentRound} / {totalRounds}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <LogoutButton onLogout={() => router.push('/')} />
          </div>
        </header>

        {/* Navigation */}
        <div className="flex gap-2 mb-6 animate-slide-up">
          {!isReadOnly && status !== 'completed' && (
            <Button
              variant="primary"
              onClick={() => router.push('/play')}
              fullWidth
              className="shadow-glow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {labels.enterScores}
            </Button>
          )}
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
        </div>

        {/* Tournament completed status */}
        {status === 'completed' && (
          <Card glow className="mb-6 animate-slide-up delay-100" style={{ animationFillMode: 'backwards' }}>
            <CardContent>
              <div className="flex items-center gap-4">
                {/* Mascot with celebration ring */}
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 blur-xl bg-accent/30 rounded-full scale-125" />
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden ring-2 ring-accent ring-offset-2 ring-offset-dark-card">
                    <Image
                      src="/sandi.png"
                      alt="Sändi gratuliert"
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  {/* Trophy badge */}
                  <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
                    <span className="text-dark font-bold text-sm">!</span>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-accent font-display text-2xl tracking-wide">
                    Gratulation!
                  </p>
                  <p className="text-txt-secondary text-sm">
                    Turnier erfolgreich abgeschlossen
                  </p>
                </div>
              </div>

              {!isReadOnly && (
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowRestartConfirm(true)}
                  className="mt-5"
                >
                  {labels.restartTournament}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Fewer matches notification */}
        {playersWithFewerMatches.length > 0 && (
          <div className="mb-6 animate-slide-up delay-100" style={{ animationFillMode: 'backwards' }}>
            <FewerMatchesNotification players={playersWithFewerMatches} />
          </div>
        )}

        {/* Adjustment toggle */}
        {showAdjustmentToggle && (
          <div className="mb-4 animate-slide-up delay-200" style={{ animationFillMode: 'backwards' }}>
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
        <Card className="animate-slide-up delay-200" style={{ animationFillMode: 'backwards' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {labels.leaderboard}
              </CardTitle>
              {showAdjusted && (
                <Badge variant="accent" size="sm">
                  auf {fairnessStats.maxMatches} Spiele
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <LeaderboardTable
              standings={displayStandings}
              showAdjusted={showAdjusted}
              maxMatches={fairnessStats.maxMatches}
              showCalculationDetails={adjustmentMethod !== 'average'}
              calculationType={adjustmentMethod !== 'average' ? adjustmentMethod : undefined}
            />
          </CardContent>
        </Card>

        {/* Export */}
        <div className="mt-4 flex justify-end animate-fade-in delay-300" style={{ animationFillMode: 'backwards' }}>
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
              className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
              onClick={() => setShowRestartConfirm(false)}
            />
            <Card className="relative w-full max-w-sm animate-scale-in glow-border">
              <CardContent>
                <h3 className="text-xl font-display text-txt tracking-wide mb-2">
                  {labels.restartConfirmTitle}
                </h3>
                <p className="text-txt-secondary mb-6">
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
                    className="shadow-glow-sm"
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
