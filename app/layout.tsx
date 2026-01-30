import type { Metadata, Viewport } from 'next';
import { TournamentProvider } from '@/context/TournamentContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Padel Americano Turnier',
  description: 'Verwalte dein Padel Americano Turnier - Spielplan, Punkte und Rangliste',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de-CH" suppressHydrationWarning>
      <body className="antialiased">
        <TournamentProvider>{children}</TournamentProvider>
      </body>
    </html>
  );
}
