'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PlayerInput } from '@/components/tournament/PlayerInput';
import { PlayerList } from '@/components/tournament/PlayerList';
import { ConfigPanel } from '@/components/tournament/ConfigPanel';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { DarkModeToggle } from '@/components/ui/DarkModeToggle';
import { useTournament } from '@/hooks/useTournament';
import { labels } from '@/lib/labels';
import { generateSchedule, getScheduleStats, estimateSchedule } from '@/lib/scheduler';

interface SchedulePreview {
  matches: ReturnType<typeof generateSchedule>['matches'];
  byesByRound: ReturnType<typeof generateSchedule>['byesByRound'];
  totalRounds: number;
  playersWithFewerMatches: { name: string; matches: number; maxMatches: number }[];
}

function SetupContent() {
  const router = useRouter();
  const {
    tournament,
    players,
    settings,
    addPlayer,
    removePlayer,
    updateSettings,
    setMatches,
    startTournament,
  } = useTournament();

  const [error, setError] = useState<string | null>(null);
  const [schedulePreview, setSchedulePreview] = useState<SchedulePreview | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Check if perfect schedule is possible
  const scheduleInfo = useMemo(() => {
    if (players.length < 4) return null;
    return estimateSchedule(players.length, settings?.courts || 2);
  }, [players.length, settings?.courts]);

  const handlePreviewSchedule = () => {
    if (players.length < 4) {
      setError(labels.minPlayersError);
      return;
    }

    if (!settings) return;

    // Generate schedule for preview
    const { matches, byesByRound, totalRounds } = generateSchedule(
      players,
      settings.courts,
      settings.pointsPerMatch
    );

    if (matches.length === 0) {
      setError('Spielplan konnte nicht erstellt werden');
      return;
    }

    // Get stats to find players with fewer matches
    const stats = getScheduleStats(matches, players);
    const playersWithFewerMatches: SchedulePreview['playersWithFewerMatches'] = [];

    players.forEach(player => {
      const playerMatches = stats.matchesPerPlayer[player.id] || 0;
      if (playerMatches < stats.maxMatches) {
        playersWithFewerMatches.push({
          name: player.name,
          matches: playerMatches,
          maxMatches: stats.maxMatches,
        });
      }
    });

    setSchedulePreview({ matches, byesByRound, totalRounds, playersWithFewerMatches });
    setShowConfirmModal(true);
  };

  const handleConfirmStart = () => {
    if (!schedulePreview) return;

    // Save matches and start
    setMatches(schedulePreview.matches, schedulePreview.byesByRound);
    startTournament();
    router.push('/play');
  };

  const canStart = players.length >= 4;

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
              {tournament?.name || labels.setup}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <LogoutButton onLogout={() => router.push('/')} />
          </div>
        </header>

        <div className="space-y-6">
          {/* Players section */}
          <Card className="animate-slide-up">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {labels.players}
                </CardTitle>
                <Badge variant={players.length >= 4 ? 'accent' : 'default'}>
                  {players.length} Spieler
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <PlayerInput
                onAdd={(name) => {
                  addPlayer(name);
                  setError(null);
                }}
                existingNames={players.map((p) => p.name)}
              />
              <PlayerList
                players={players}
                onRemove={removePlayer}
              />
              {players.length < 4 && (
                <p className="text-sm text-warning flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                  {labels.minPlayersError}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Config section */}
          {settings && (
            <div className="animate-slide-up delay-100" style={{ animationFillMode: 'backwards' }}>
              <ConfigPanel
                settings={settings}
                numPlayers={players.length}
                onUpdate={updateSettings}
              />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm flex items-center gap-2 animate-scale-in">
              <span className="w-2 h-2 rounded-full bg-danger" />
              {error}
            </div>
          )}

          {/* Start button */}
          <div className="animate-slide-up delay-200" style={{ animationFillMode: 'backwards' }}>
            <Button
              size="lg"
              fullWidth
              onClick={handlePreviewSchedule}
              disabled={!canStart}
              className={canStart ? 'shadow-glow' : ''}
            >
              {labels.startTournament}
            </Button>
          </div>
        </div>

        {/* Confirmation modal with preview of players with fewer matches */}
        {showConfirmModal && schedulePreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
              onClick={() => setShowConfirmModal(false)}
            />
            <Card className="relative w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in glow-border">
              <CardContent>
                <h3 className="text-xl font-display text-txt tracking-wide mb-4">
                  {labels.startTournament}
                </h3>

                <div className="space-y-4 mb-6">
                  {/* Schedule summary */}
                  <div className="p-4 rounded-xl bg-dark-surface/50 border border-dark-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                          <span className="text-accent font-display text-lg">{schedulePreview.totalRounds}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-txt">{schedulePreview.totalRounds} {labels.rounds}</p>
                          <p className="text-xs text-txt-muted">{schedulePreview.matches.length} Spiele total</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Warning about players with fewer matches */}
                  {schedulePreview.playersWithFewerMatches.length > 0 && (
                    <div className="p-4 rounded-xl bg-warning/10 border border-warning/30">
                      <p className="text-sm font-semibold text-warning mb-3">
                        Spieler mit weniger Spielen:
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {schedulePreview.playersWithFewerMatches.map((player) => (
                          <Badge
                            key={player.name}
                            variant="warning"
                          >
                            <span className="font-semibold">{player.name}</span>
                            <span className="ml-1.5 opacity-75">
                              {player.matches}/{player.maxMatches}
                            </span>
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-txt-secondary leading-relaxed">
                        {labels.fewerMatchesNote}
                      </p>
                    </div>
                  )}

                  {/* Perfect schedule info */}
                  {schedulePreview.playersWithFewerMatches.length === 0 && (
                    <div className="p-4 rounded-xl bg-success/10 border border-success/30">
                      <p className="text-sm text-success flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-success" />
                        Alle Spieler haben gleich viele Spiele.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => setShowConfirmModal(false)}
                  >
                    {labels.cancel}
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleConfirmStart}
                    className="shadow-glow-sm"
                  >
                    {labels.startTournament}
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

export default function SetupPage() {
  return (
    <AuthGuard requireAuth={true} allowReadOnly={false}>
      <SetupContent />
    </AuthGuard>
  );
}
