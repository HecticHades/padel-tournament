'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTournament } from '@/hooks/useTournament';
import { labels } from '@/lib/labels';

export default function ResetPage() {
  const router = useRouter();
  const { tournament, deleteTournament, isLoading } = useTournament();

  const handleReset = () => {
    deleteTournament();
    router.push('/');
  };

  // Show loading state during initialization
  if (isLoading) {
    return (
      <main className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-md mx-auto text-center">
          <p className="text-slate-500 dark:text-slate-400">{labels.loading}</p>
        </div>
      </main>
    );
  }

  // Redirect if no tournament exists
  if (!tournament) {
    if (typeof window !== 'undefined') {
      router.push('/');
    }
    return null;
  }

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-md mx-auto">
        <Link
          href="/"
          className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        >
          &larr; {labels.back}
        </Link>

        <Card className="mt-4">
          <CardContent>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <WarningIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {labels.resetConfirmTitle}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {labels.resetConfirmMessage}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-700 mb-6">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                <strong>Turnier:</strong> {tournament.name}
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                <strong>Spieler:</strong> {tournament.players.length}
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                <strong>Spiele:</strong> {tournament.matches.filter(m => m.completed).length} / {tournament.matches.length}
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => router.push('/')}>
                {labels.cancel}
              </Button>
              <Button variant="danger" fullWidth onClick={handleReset}>
                {labels.resetConfirm}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function WarningIcon({ className }: { className?: string }) {
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
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
      />
    </svg>
  );
}
