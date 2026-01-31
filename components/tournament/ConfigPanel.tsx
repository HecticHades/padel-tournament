'use client';

import { useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { labels } from '@/lib/labels';
import type { TournamentSettings } from '@/lib/types';
import { estimateSchedule } from '@/lib/scheduler';
import { cn } from '@/lib/utils';

interface ConfigPanelProps {
  settings: TournamentSettings;
  numPlayers: number;
  onUpdate: (settings: Partial<TournamentSettings>) => void;
  disabled?: boolean;
}

export function ConfigPanel({
  settings,
  numPlayers,
  onUpdate,
  disabled = false,
}: ConfigPanelProps) {
  const { rounds, matchesPerPlayer, perfectSchedule } = useMemo(
    () => estimateSchedule(numPlayers, settings.courts),
    [numPlayers, settings.courts]
  );

  const handlePointsChange = useCallback((points: number) => {
    onUpdate({ pointsPerMatch: points });
  }, [onUpdate]);

  const handleCourtsChange = useCallback((courts: number) => {
    onUpdate({ courts });
  }, [onUpdate]);

  const handleCustomPointsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (val > 0 && val <= 99) {
      onUpdate({ pointsPerMatch: val });
    }
  }, [onUpdate]);

  const isCustomPoints = ![16, 24, 32].includes(settings.pointsPerMatch);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.setup}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Points per match */}
        <div>
          <label className="block text-sm font-medium text-txt-secondary mb-3">
            {labels.pointsPerMatch}
          </label>
          <div className="flex gap-2 items-center flex-wrap">
            {/* Preset buttons */}
            {[16, 24, 32].map((points) => (
              <button
                key={points}
                onClick={() => handlePointsChange(points)}
                disabled={disabled}
                className={cn(
                  'py-2.5 px-4 rounded-xl border-2 transition-all duration-200 font-display tracking-wide',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark',
                  settings.pointsPerMatch === points
                    ? 'border-accent bg-accent/20 text-accent shadow-glow-sm'
                    : 'border-dark-border bg-dark-surface/50 text-txt-secondary hover:border-dark-border/80 hover:bg-dark-surface',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {points}
              </button>
            ))}
            {/* Custom input */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-txt-muted">oder:</span>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                max="99"
                value={isCustomPoints ? settings.pointsPerMatch : ''}
                placeholder="…"
                onChange={handleCustomPointsChange}
                disabled={disabled}
                aria-label="Benutzerdefinierte Punkte pro Spiel"
                className={cn(
                  'w-16 py-2.5 px-2 text-center rounded-xl border-2 font-display transition-all duration-200',
                  'bg-dark-surface/50',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
                  isCustomPoints
                    ? 'border-accent text-accent shadow-glow-sm'
                    : 'border-dark-border text-txt-secondary',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              />
            </div>
          </div>
        </div>

        {/* Courts */}
        <div>
          <label className="block text-sm font-medium text-txt-secondary mb-3">
            {labels.courts}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((courtNum) => (
              <button
                key={courtNum}
                onClick={() => handleCourtsChange(courtNum)}
                disabled={disabled}
                className={cn(
                  'py-2.5 px-3 rounded-xl border-2 transition-all duration-200 font-display tracking-wide',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark',
                  settings.courts === courtNum
                    ? 'border-accent bg-accent/20 text-accent shadow-glow-sm'
                    : 'border-dark-border bg-dark-surface/50 text-txt-secondary hover:border-dark-border/80 hover:bg-dark-surface',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {courtNum}
              </button>
            ))}
          </div>
        </div>

        {/* Estimate */}
        {numPlayers >= 4 && (
          <div className={cn(
            'p-4 rounded-xl border',
            perfectSchedule
              ? 'bg-success/5 border-success/30'
              : 'bg-warning/5 border-warning/30'
          )}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-accent font-display text-lg">{rounds}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-txt">
                  {rounds} {labels.rounds}
                </p>
                <p className="text-xs text-txt-muted">
                  {matchesPerPlayer} Spiele pro Spieler
                </p>
              </div>
            </div>
            <p className="text-xs text-txt-secondary">
              Jeder spielt mit jedem anderen einmal als Partner
            </p>
            {!perfectSchedule && (
              <p className="text-xs text-warning mt-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                Bei {numPlayers} Spielern ist kein perfekter Spielplan möglich.
                Empfohlen: 4, 5, 8, 9, 12 oder 13 Spieler.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
