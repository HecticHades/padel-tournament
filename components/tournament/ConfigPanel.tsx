'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { labels } from '@/lib/labels';
import type { TournamentSettings } from '@/lib/types';
import { estimateSchedule } from '@/lib/scheduler';

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
  const { rounds, matchesPerPlayer, perfectSchedule } = estimateSchedule(numPlayers, settings.courts);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.setup}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Points per match */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {labels.pointsPerMatch}
          </label>
          <div className="flex gap-2 items-center">
            {/* Preset buttons */}
            {[16, 24, 32].map((points) => (
              <button
                key={points}
                onClick={() => onUpdate({ pointsPerMatch: points })}
                disabled={disabled}
                className={`py-2 px-3 rounded-lg border-2 transition-colors font-medium ${
                  settings.pointsPerMatch === points
                    ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {points}
              </button>
            ))}
            {/* Custom input */}
            <div className="flex items-center gap-1">
              <span className="text-sm text-slate-500 dark:text-slate-400">oder:</span>
              <input
                type="number"
                min="1"
                max="99"
                value={![16, 24, 32].includes(settings.pointsPerMatch) ? settings.pointsPerMatch : ''}
                placeholder="..."
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (val > 0 && val <= 99) {
                    onUpdate({ pointsPerMatch: val });
                  }
                }}
                disabled={disabled}
                className={`w-16 py-2 px-2 text-center rounded-lg border-2 font-medium transition-colors ${
                  ![16, 24, 32].includes(settings.pointsPerMatch)
                    ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* Courts */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {labels.courts}
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((courtNum) => (
              <button
                key={courtNum}
                onClick={() => onUpdate({ courts: courtNum })}
                disabled={disabled}
                className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors font-medium ${
                  settings.courts === courtNum
                    ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {courtNum}
              </button>
            ))}
          </div>
        </div>

        {/* Estimate */}
        {numPlayers >= 4 && (
          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700 space-y-1">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {rounds} {labels.rounds}
              </span>
              {' '}&bull;{' '}
              {matchesPerPlayer} Spiele pro Spieler
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Jeder spielt mit jedem anderen einmal als Partner
            </p>
            {!perfectSchedule && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Hinweis: Bei {numPlayers} Spielern ist kein perfekter Spielplan möglich.
                Empfohlen: 4, 5, 8, 9, 12 oder 13 Spieler.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
