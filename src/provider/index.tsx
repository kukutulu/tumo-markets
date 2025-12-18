'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SolanaProvider from './SolanaProvider';
import { ThemeProvider } from './ThemeProvider';
import JotaiProvider from './JotaiProvider';
import WalletEffect from 'src/components/WalletEffect';
import { ToastNotifier } from 'src/components/ToastNotify/ToastNotifier';

export default function GeneralProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        <SolanaProvider>
          <WalletEffect />
          <ThemeProvider>
            {children}
            <ToastNotifier />
          </ThemeProvider>
        </SolanaProvider>
      </QueryClientProvider>
    </JotaiProvider>
  );
}
