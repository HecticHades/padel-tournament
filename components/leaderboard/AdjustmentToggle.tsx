'use client';

import { labels } from '@/lib/labels';

interface AdjustmentToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function AdjustmentToggle({ enabled, onChange }: AdjustmentToggleProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-3 cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={enabled}
            onChange={(e) => onChange(e.target.checked)}
          />
          <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer-checked:bg-primary-500 transition-colors" />
          <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5" />
        </div>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {labels.showAdjusted}
        </span>
      </label>
      {enabled && (
        <p className="text-xs text-slate-500 dark:text-slate-400 pl-14">
          {labels.adjustedExplanation}
        </p>
      )}
    </div>
  );
}
