'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PlayerInput } from '@/components/tournament/PlayerInput';
import { PlayerList } from '@/components/tournament/PlayerList';
import { ConfigPanel } from '@/components/tournament/ConfigPanel';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { DarkModeToggle } from '@/components/ui/DarkModeToggle';
import { useTournament } from '@/hooks/useTournament';
import { labels } from '@/lib/labels';
import { generateSchedule } from '@/lib/scheduler';

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

  const handleGenerateAndStart = () => {
    if (players.length < 4) {
      setError(labels.minPlayersError);
      return;
    }

    if (!settings) return;

    // Generate schedule
    const { matches, byesByRound, totalRounds } = generateSchedule(
      players,
      settings.courts,
      settings.pointsPerMatch
    );

    if (matches.length === 0) {
      setError('Spielplan konnte nicht erstellt werden');
      return;
    }

    // Save matches and start
    setMatches(matches, byesByRound);
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
            onClick={handleGenerateAndStart}
            disabled={!canStart}
          >
            {labels.startTournament}
          </Button>
        </div>
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
