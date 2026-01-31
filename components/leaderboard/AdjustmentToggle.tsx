'use client';

import type { AdjustmentMethod } from '@/lib/types';
import { labels } from '@/lib/labels';

interface AdjustmentToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  method: AdjustmentMethod;
  onMethodChange: (method: AdjustmentMethod) => void;
  maxMatches?: number;
}

const methodDescriptions: Record<AdjustmentMethod, string> = {
  'average': labels.adjustmentAverageDesc,
  'opponent-based': labels.adjustmentOpponentBasedDesc,
  'partner-based': labels.adjustmentPartnerBasedDesc,
};

export function AdjustmentToggle({
  enabled,
  onChange,
  method,
  onMethodChange,
  maxMatches,
}: AdjustmentToggleProps) {
  return (
    <div className="space-y-3">
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
        <div className="pl-14 space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {labels.adjustmentMethod}:
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onMethodChange('average')}
              className={`flex-1 min-w-[80px] px-3 py-2 text-xs rounded-lg border transition-colors ${
                method === 'average'
                  ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="font-medium">{labels.adjustmentAverage}</div>
            </button>
            <button
              type="button"
              onClick={() => onMethodChange('opponent-based')}
              className={`flex-1 min-w-[80px] px-3 py-2 text-xs rounded-lg border transition-colors ${
                method === 'opponent-based'
                  ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="font-medium">{labels.adjustmentOpponentBased}</div>
            </button>
            <button
              type="button"
              onClick={() => onMethodChange('partner-based')}
              className={`flex-1 min-w-[80px] px-3 py-2 text-xs rounded-lg border transition-colors ${
                method === 'partner-based'
                  ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="font-medium">{labels.adjustmentPartnerBased}</div>
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {methodDescriptions[method]}
          </p>
        </div>
      )}
    </div>
  );
}
