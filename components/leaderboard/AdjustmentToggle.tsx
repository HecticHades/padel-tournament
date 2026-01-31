'use client';

import type { AdjustmentMethod } from '@/lib/types';
import { labels } from '@/lib/labels';
import { cn } from '@/lib/utils';

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
  'combined': labels.adjustmentCombinedDesc,
};

export function AdjustmentToggle({
  enabled,
  onChange,
  method,
  onMethodChange,
  maxMatches,
}: AdjustmentToggleProps) {
  return (
    <div className="space-y-4">
      {/* Toggle Switch */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={enabled}
            onChange={(e) => onChange(e.target.checked)}
          />
          <div className={cn(
            'w-12 h-7 rounded-full transition-all duration-300',
            'bg-dark-surface border border-dark-border',
            'peer-checked:bg-accent/20 peer-checked:border-accent/50',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-accent/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-dark'
          )} />
          <div className={cn(
            'absolute left-1 top-1 w-5 h-5 rounded-full transition-all duration-300',
            'bg-txt-muted',
            'peer-checked:translate-x-5 peer-checked:bg-accent peer-checked:shadow-glow-sm'
          )} />
        </div>
        <span className="text-sm font-medium text-txt group-hover:text-txt-secondary transition-colors">
          Punkte hochrechnen {maxMatches ? `(auf ${maxMatches} Spiele)` : ''}
        </span>
      </label>

      {/* Method Selection */}
      {enabled && (
        <div className="pl-0 sm:pl-[60px] space-y-3 animate-fade-in">
          <p className="text-xs text-txt-muted font-medium uppercase tracking-wider">
            {labels.adjustmentMethod}
          </p>

          {/* Method Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {(['average', 'opponent-based', 'partner-based', 'combined'] as AdjustmentMethod[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onMethodChange(m)}
                className={cn(
                  'px-3 py-2.5 text-xs rounded-xl border transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
                  method === m
                    ? 'bg-accent/20 border-accent/40 text-accent shadow-glow-sm'
                    : 'bg-dark-surface/50 border-dark-border text-txt-secondary hover:border-dark-border/80 hover:bg-dark-surface'
                )}
              >
                <div className="font-semibold">
                  {m === 'average' && labels.adjustmentAverage}
                  {m === 'opponent-based' && labels.adjustmentOpponentBased}
                  {m === 'partner-based' && labels.adjustmentPartnerBased}
                  {m === 'combined' && labels.adjustmentCombined}
                </div>
              </button>
            ))}
          </div>

          {/* Description */}
          <p className="text-xs text-txt-muted leading-relaxed">
            {methodDescriptions[method]}
          </p>
        </div>
      )}
    </div>
  );
}
