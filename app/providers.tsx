'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import { AppProvider } from '@/app/context/AppContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppProvider>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </AppProvider>
    </SessionProvider>
  );
}
