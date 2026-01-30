'use client';

import { Button } from '@/components/ui/Button';
import type { Standing, AdjustedStanding, TournamentData } from '@/lib/types';
import { labels } from '@/lib/labels';
import { downloadCsv, downloadJson } from '@/lib/utils';
import { generateLeaderboardCsv } from '@/lib/fairness';

interface ExportButtonsProps {
  standings: Standing[] | AdjustedStanding[];
  showAdjusted: boolean;
  tournament: TournamentData | null;
}

export function ExportButtons({
  standings,
  showAdjusted,
  tournament,
}: ExportButtonsProps) {
  const handleExportCsv = () => {
    if (!tournament) return;

    const { headers, rows } = generateLeaderboardCsv(standings, showAdjusted);
    const filename = `${tournament.name.replace(/[^a-zA-Z0-9]/g, '_')}_rangliste.csv`;
    downloadCsv(headers, rows, filename);
  };

  const handleExportJson = () => {
    if (!tournament) return;

    const filename = `${tournament.name.replace(/[^a-zA-Z0-9]/g, '_')}_turnier.json`;
    downloadJson(tournament, filename);
  };

  return (
    <div className="flex gap-2">
      <Button variant="secondary" size="sm" onClick={handleExportCsv}>
        <DownloadIcon className="w-4 h-4 mr-1" />
        {labels.exportCsv}
      </Button>
      <Button variant="ghost" size="sm" onClick={handleExportJson}>
        {labels.exportJson}
      </Button>
    </div>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
      />
    </svg>
  );
}
