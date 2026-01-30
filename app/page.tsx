'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { PinSetupModal } from '@/components/auth/PinSetupModal';
import { PinEntryModal } from '@/components/auth/PinEntryModal';
import { useTournament } from '@/hooks/useTournament';
import { useAuth } from '@/hooks/useAuth';
import { labels } from '@/lib/labels';
import { DarkModeToggle } from '@/components/ui/DarkModeToggle';

export default function HomePage() {
  const router = useRouter();
  const { tournament, hasTournament, isLoading, createNewTournament, deleteTournament } = useTournament();
  const { isAuthenticated, loginReadOnly } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400">{labels.loading}</div>
      </div>
    );
  }

  const handleCreateTournament = (pin: string, name: string) => {
    createNewTournament(name, pin);
    setShowCreateModal(false);
    router.push('/setup');
  };

  const handleContinue = () => {
    if (isAuthenticated) {
      router.push(tournament?.status === 'setup' ? '/setup' : '/play');
    } else {
      setShowPinModal(true);
    }
  };

  const handlePinSuccess = () => {
    setShowPinModal(false);
    router.push(tournament?.status === 'setup' ? '/setup' : '/play');
  };

  const handleViewLeaderboard = () => {
    loginReadOnly();
    router.push('/leaderboard');
  };

  const handleReset = () => {
    deleteTournament();
    setShowResetConfirm(false);
  };

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            {labels.appTitle}
          </h1>
          <DarkModeToggle />
        </div>

        {!hasTournament ? (
          // No tournament - show welcome and create
          <div className="space-y-6">
            <Card>
              <CardContent>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  {labels.welcomeTitle}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {labels.welcomeSubtitle}
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {labels.americanoExplanation}
                </p>
              </CardContent>
            </Card>

            <Button
              size="lg"
              fullWidth
              onClick={() => setShowCreateModal(true)}
            >
              {labels.createTournament}
            </Button>
          </div>
        ) : (
          // Existing tournament
          <div className="space-y-6">
            <Card>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {tournament?.name}
                  </h2>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {labels.tournamentStatus[tournament?.status || 'setup']}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  {tournament?.players.length} {labels.players}
                  {(tournament?.matches.length ?? 0) > 0 && (
                    <> • {labels.round} {tournament?.currentRound} / {tournament?.settings.rounds}</>
                  )}
                </p>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button size="lg" fullWidth onClick={handleContinue}>
                {labels.continueTournament}
              </Button>

              {(tournament?.matches.length ?? 0) > 0 && (
                <Button
                  size="lg"
                  fullWidth
                  variant="secondary"
                  onClick={handleViewLeaderboard}
                >
                  {labels.viewLeaderboard}
                </Button>
              )}

              <Button
                size="lg"
                fullWidth
                variant="ghost"
                onClick={() => setShowResetConfirm(true)}
              >
                {labels.resetTournament}
              </Button>
            </div>
          </div>
        )}

        {/* Modals */}
        <PinSetupModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTournament}
        />

        <PinEntryModal
          isOpen={showPinModal}
          onClose={() => setShowPinModal(false)}
          onSuccess={handlePinSuccess}
        />

        {/* Reset confirmation */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 dark:bg-black/70"
              onClick={() => setShowResetConfirm(false)}
            />
            <Card className="relative w-full max-w-sm">
              <CardContent>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  {labels.resetConfirmTitle}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {labels.resetConfirmMessage}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => setShowResetConfirm(false)}
                  >
                    {labels.cancel}
                  </Button>
                  <Button variant="danger" fullWidth onClick={handleReset}>
                    {labels.resetConfirm}
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
