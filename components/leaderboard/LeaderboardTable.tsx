'use client';

import { MedalBadge, Badge } from '@/components/ui/Badge';
import type { Standing, AdjustedStanding } from '@/lib/types';
import { labels } from '@/lib/labels';
import { formatDecimal } from '@/lib/utils';
import { hasFewerMatches } from '@/lib/fairness';
import { cn } from '@/lib/utils';

interface LeaderboardTableProps {
  standings: Standing[] | AdjustedStanding[];
  showAdjusted: boolean;
  maxMatches?: number;
  showCalculationDetails?: boolean;
  calculationType?: 'partner-based' | 'combined';
}

export function LeaderboardTable({ standings, showAdjusted, maxMatches, showCalculationDetails, calculationType }: LeaderboardTableProps) {
  const isAdjusted = (s: Standing | AdjustedStanding): s is AdjustedStanding => {
    return 'adjustedPoints' in s;
  };

  const hasPartnerDetails = (s: Standing | AdjustedStanding): s is AdjustedStanding & { partnerCalculationDetails: NonNullable<AdjustedStanding['partnerCalculationDetails']> } => {
    return isAdjusted(s) && s.partnerCalculationDetails !== undefined;
  };

  const hasCombinedDetails = (s: Standing | AdjustedStanding): s is AdjustedStanding & { combinedCalculationDetails: NonNullable<AdjustedStanding['combinedCalculationDetails']> } => {
    return isAdjusted(s) && s.combinedCalculationDetails !== undefined;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-dark-border/50">
            <th className="text-left py-3 px-2 text-xs font-semibold text-txt-muted uppercase tracking-wider">
              {labels.rank}
            </th>
            <th className="text-left py-3 px-2 text-xs font-semibold text-txt-muted uppercase tracking-wider">
              {labels.player}
            </th>
            <th className="text-right py-3 px-2 text-xs font-semibold text-txt-muted uppercase tracking-wider">
              {showAdjusted ? `Hochgerechnet` : labels.points}
            </th>
            <th className="text-right py-3 px-2 text-xs font-semibold text-txt-muted uppercase tracking-wider">
              {labels.matches}
            </th>
            <th className="text-right py-3 px-2 text-xs font-semibold text-txt-muted uppercase tracking-wider">
              {labels.average}
            </th>
          </tr>
        </thead>
        <tbody>
          {standings.map((standing, index) => {
            const rank = index + 1;
            const showMedal = rank <= 3 && standing.matchesPlayed > 0;
            const fewerMatches = hasFewerMatches(standing, standings);
            const isExtrapolated = showAdjusted && isAdjusted(standing) && fewerMatches;
            const isTopThree = rank <= 3;

            return (
              <tr
                key={standing.playerId}
                className={cn(
                  'border-b border-dark-border/30 transition-colors',
                  'hover:bg-dark-surface/50',
                  fewerMatches && 'bg-warning/5',
                  isTopThree && 'bg-dark-surface/30'
                )}
              >
                <td className="py-4 px-2">
                  <div className="flex items-center gap-2">
                    {showMedal ? (
                      <MedalBadge rank={rank as 1 | 2 | 3} />
                    ) : (
                      <span className="w-8 h-8 flex items-center justify-center text-txt-muted font-display text-lg">
                        {rank}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn(
                      'font-medium',
                      isTopThree ? 'text-txt' : 'text-txt-secondary'
                    )}>
                      {standing.playerName}
                    </span>
                    {fewerMatches && (
                      <Badge variant="warning" size="sm">
                        {standing.matchesPlayed}/{maxMatches || '?'}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="py-4 px-2 text-right">
                  {showAdjusted && isAdjusted(standing) ? (
                    <div>
                      <span className={cn(
                        'font-display text-lg tracking-wide',
                        isExtrapolated ? 'text-warning' : 'text-txt'
                      )}>
                        {formatDecimal(standing.adjustedPoints, 1)}
                      </span>
                      {isExtrapolated && showCalculationDetails && calculationType === 'partner-based' && hasPartnerDetails(standing) ? (
                        <div className="text-xs text-txt-muted space-y-0.5 mt-1">
                          <div>
                            {standing.points} + ØGewinnpunkte {standing.partnerCalculationDetails.avgPartnerPointsWon}
                          </div>
                          <div className="text-[10px] leading-tight opacity-75">
                            {standing.partnerCalculationDetails.partnerBreakdown
                              .map(p => `${p.name.split(' ')[0]} ${p.avgPointsWon}`)
                              .join(', ')}
                          </div>
                        </div>
                      ) : isExtrapolated && showCalculationDetails && calculationType === 'combined' && hasCombinedDetails(standing) ? (
                        <div className="text-xs text-txt-muted space-y-0.5 mt-1">
                          <div>
                            {standing.points} + Ø {standing.combinedCalculationDetails.combinedAverage}
                          </div>
                          <div className="text-[10px] leading-tight opacity-75">
                            Eigen {standing.combinedCalculationDetails.ownAverage}, Partner {standing.combinedCalculationDetails.avgPartnerPointsWon}
                          </div>
                        </div>
                      ) : isExtrapolated ? (
                        <div className="text-xs text-txt-muted mt-1">
                          (tatsächlich: {standing.points})
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <span className={cn(
                      'font-display text-lg tracking-wide',
                      isTopThree ? 'text-accent' : 'text-txt'
                    )}>
                      {standing.points}
                    </span>
                  )}
                </td>
                <td className="py-4 px-2 text-right text-txt-secondary">
                  {standing.matchesPlayed}
                </td>
                <td className="py-4 px-2 text-right text-txt-secondary">
                  {formatDecimal(standing.average, 1)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {standings.length === 0 && (
        <div className="text-center py-12 text-txt-muted">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-dark-surface border border-dark-border flex items-center justify-center">
            <svg className="w-6 h-6 text-txt-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          Noch keine Ergebnisse
        </div>
      )}
    </div>
  );
}
