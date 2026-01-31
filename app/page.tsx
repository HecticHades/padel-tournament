'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <span className="text-txt-secondary font-medium">{labels.loading}</span>
        </div>
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
        <header className="flex justify-between items-center mb-8 animate-fade-in">
          <div className="flex items-center gap-3">
            {/* Logo accent bar */}
            <div className="w-1.5 h-8 bg-gradient-to-b from-accent to-accent-dim rounded-full" />
            <h1 className="text-2xl sm:text-3xl font-display text-txt tracking-wide">
              {labels.appTitle}
            </h1>
          </div>
          <DarkModeToggle />
        </header>

        {!hasTournament ? (
          // No tournament - show welcome
          <div className="space-y-6">
            {/* Hero Section with Mascot */}
            <div className="flex flex-col items-center text-center py-6 animate-slide-up">
              {/* Mascot with glow effect */}
              <div className="relative mb-6">
                <div className="absolute inset-0 blur-2xl bg-accent/20 rounded-full scale-110" />
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden ring-4 ring-accent/50 ring-offset-4 ring-offset-dark shadow-glow">
                  <Image
                    src="/sandi.png"
                    alt="Sändi - Dein Turnierleiter"
                    width={176}
                    height={176}
                    className="object-cover w-full h-full"
                    priority
                  />
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                  <Badge variant="accent" className="shadow-glow-sm whitespace-nowrap">
                    Turnierleiter
                  </Badge>
                </div>
              </div>

              {/* Name with gradient */}
              <h2 className="text-3xl font-display text-gradient tracking-wider mb-1">
                Sändi
              </h2>
              <p className="text-txt-secondary">
                heisst dich willkommen!
              </p>
            </div>

            {/* Welcome Card */}
            <Card glow className="animate-slide-up delay-100" style={{ animationFillMode: 'backwards' }}>
              <CardContent>
                <h2 className="text-2xl font-display text-txt tracking-wide mb-3">
                  {labels.welcomeTitle}
                </h2>
                <p className="text-txt-secondary mb-4 leading-relaxed">
                  {labels.welcomeSubtitle}
                </p>
                <p className="text-txt-muted text-sm leading-relaxed">
                  {labels.americanoExplanation}
                </p>
              </CardContent>
            </Card>

            {/* CTA Button */}
            <div className="animate-slide-up delay-200" style={{ animationFillMode: 'backwards' }}>
              <Button
                size="lg"
                fullWidth
                onClick={() => setShowCreateModal(true)}
                className="shadow-glow"
              >
                {labels.createTournament}
              </Button>
            </div>
          </div>
        ) : (
          // Existing tournament
          <div className="space-y-6">
            {/* Tournament Card with Mascot */}
            <Card glow className="animate-slide-up">
              <CardContent>
                <div className="flex items-center gap-4">
                  {/* Mini mascot */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-accent/40 ring-offset-2 ring-offset-dark-card">
                      <Image
                        src="/sandi.png"
                        alt="Sändi - Turnierleiter"
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    {/* Status indicator */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center shadow-glow-sm">
                      <span className="text-dark text-xs font-bold">!</span>
                    </div>
                  </div>

                  {/* Tournament info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h2 className="text-xl font-display text-txt tracking-wide truncate">
                        {tournament?.name}
                      </h2>
                      <Badge variant="accent" className="flex-shrink-0">
                        {labels.tournamentStatus[tournament?.status || 'setup']}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-txt-secondary text-sm">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                        {tournament?.players.length} {labels.players}
                      </span>
                      {(tournament?.matches.length ?? 0) > 0 && (
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-court-light" />
                          {labels.round} {tournament?.currentRound} / {tournament?.settings.rounds}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3 animate-slide-up delay-100" style={{ animationFillMode: 'backwards' }}>
              <Button size="lg" fullWidth onClick={handleContinue} className="shadow-glow">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="reset-dialog-title">
            <button
              type="button"
              className="absolute inset-0 bg-dark/80 backdrop-blur-sm cursor-default"
              onClick={() => setShowResetConfirm(false)}
              aria-label="Dialog schliessen"
            />
            <Card className="relative w-full max-w-sm animate-scale-in glow-border">
              <CardContent>
                <h3 id="reset-dialog-title" className="text-xl font-display text-txt tracking-wide mb-2">
                  {labels.resetConfirmTitle}
                </h3>
                <p className="text-txt-secondary mb-6">
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
