'use client';

interface AdjustmentToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  maxMatches?: number;
}

export function AdjustmentToggle({ enabled, onChange, maxMatches }: AdjustmentToggleProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-3 cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only peer focus-visible:ring-2 focus-visible:ring-primary-500"
            checked={enabled}
            onChange={(e) => onChange(e.target.checked)}
          />
          <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer-checked:bg-primary-500 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-2 transition-colors" />
          <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5" />
        </div>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Punkte hochrechnen {maxMatches ? `(auf ${maxMatches} Spiele)` : ''}
        </span>
      </label>
      {enabled && (
        <p className="text-xs text-slate-500 dark:text-slate-400 pl-14">
          Spieler mit weniger Spielen werden basierend auf ihrem Durchschnitt auf {maxMatches || 'die maximale Spielanzahl'} Spiele hochgerechnet.
        </p>
      )}
    </div>
  );
}
