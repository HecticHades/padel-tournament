'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
            {/* Host/Mascot Section */}
            <div className="flex flex-col items-center text-center py-4">
              <div className="relative mb-4">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden ring-4 ring-primary-500 ring-offset-4 ring-offset-slate-50 dark:ring-offset-slate-900 shadow-xl">
                  <Image
                    src="/sandi.png"
                    alt="Sändi - Dein Turnierleiter"
                    width={160}
                    height={160}
                    className="object-cover w-full h-full"
                    priority
                  />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  Turnierleiter
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Sändi
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                heisst dich willkommen!
              </p>
            </div>

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
            {/* Sandi with tournament info */}
            <Card>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-800">
                      <Image
                        src="/sandi.png"
                        alt="Sändi - Turnierleiter"
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {tournament?.name}
                      </h2>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 flex-shrink-0">
                        {labels.tournamentStatus[tournament?.status || 'setup']}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      {tournament?.players.length} {labels.players}
                      {(tournament?.matches.length ?? 0) > 0 ? (
                        <> • {labels.round} {tournament?.currentRound} / {tournament?.settings.rounds}</>
                      ) : null}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button size="lg" fullWidth onClick={handleContinue}>
                {labels.continueTournament}
              </Button>

              {(tournament?.matches.length ?? 0) > 0 ? (
                <Button
                  size="lg"
                  fullWidth
                  variant="secondary"
                  onClick={handleViewLeaderboard}
                >
                  {labels.viewLeaderboard}
                </Button>
              ) : null}

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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="reset-dialog-title">
            <button
              type="button"
              className="absolute inset-0 bg-black/50 dark:bg-black/70 cursor-default"
              onClick={() => setShowResetConfirm(false)}
              aria-label="Dialog schliessen"
            />
            <Card className="relative w-full max-w-sm">
              <CardContent>
                <h3 id="reset-dialog-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
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
