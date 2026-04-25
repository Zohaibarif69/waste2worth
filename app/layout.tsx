import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import './styles/globals.css';

export const metadata: Metadata = {
  title: 'Waste2Worth AI - End-to-End Food & Waste Intelligence',
  description: 'AI-powered platform for food demand prediction, surplus food donation, and intelligent waste management',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
