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
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link
              href="/"
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              &larr; {labels.back}
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {tournament?.name || labels.setup}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <LogoutButton onLogout={() => router.push('/')} />
          </div>
        </div>

        <div className="space-y-6">
          {/* Players section */}
          <Card>
            <CardHeader>
              <CardTitle>
                {labels.players} ({players.length})
              </CardTitle>
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
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {labels.minPlayersError}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Config section */}
          {settings && (
            <ConfigPanel
              settings={settings}
              numPlayers={players.length}
              onUpdate={updateSettings}
            />
          )}

          {/* Error message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Start button */}
          <Button
            size="lg"
            fullWidth
            onClick={handlePreviewSchedule}
            disabled={!canStart}
          >
            {labels.startTournament}
          </Button>
        </div>

        {/* Confirmation modal with preview of players with fewer matches */}
        {showConfirmModal && schedulePreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 dark:bg-black/70"
              onClick={() => setShowConfirmModal(false)}
            />
            <Card className="relative w-full max-w-md max-h-[90vh] overflow-y-auto">
              <CardContent>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  {labels.startTournament}
                </h3>

                <div className="space-y-4 mb-4">
                  {/* Schedule summary */}
                  <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <span className="font-medium">{schedulePreview.totalRounds}</span> {labels.rounds} &bull;{' '}
                      <span className="font-medium">{schedulePreview.matches.length}</span> Spiele total
                    </p>
                  </div>

                  {/* Warning about players with fewer matches */}
                  {schedulePreview.playersWithFewerMatches.length > 0 && (
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                        Spieler mit weniger Spielen:
                      </p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {schedulePreview.playersWithFewerMatches.map((player) => (
                          <Badge
                            key={player.name}
                            variant="warning"
                            className="bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100"
                          >
                            <span className="font-semibold">{player.name}</span>
                            <span className="ml-1 opacity-75">
                              ({player.matches}/{player.maxMatches})
                            </span>
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        {labels.fewerMatchesNote}
                      </p>
                    </div>
                  )}

                  {/* Perfect schedule info */}
                  {schedulePreview.playersWithFewerMatches.length === 0 && (
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-700 dark:text-green-300">
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
