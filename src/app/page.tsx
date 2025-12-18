'use client';

// import { useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import Link from 'next/link';
import PageTransition from 'src/components/PageTransition';
import { useTheme } from 'src/provider/ThemeProvider';
// import SolanaConnectButton from 'src/components/Button/SolanaConnectButton';
import { UserRoundCheck } from 'lucide-react';
import LiveMatches from 'src/views/live-matches';
import UpcomingMatches from 'src/views/upcoming-matches';
import InputStartIcon from 'src/components/Input/InputStartIcon';
import { TThemeMode } from 'src/types';
import TestMatches from 'src/views/test-matches';

interface UserPillProps {
  name: string;
  theme: TThemeMode;
}

function UserPill({ name, theme }: UserPillProps) {
  const pillBase =
    'relative border border-none dark:border-white/10 bg-[#e5e5e5] dark:bg-white/5 text-sm font-light flex-1 min-w-0 px-4 py-2 overflow-hidden flex items-center justify-end';
  const pillShape = 'rounded-l-full rounded-r-[48px] pr-8 text-right';

  return (
    <Link href="/profile">
      <div className={`flex min-w-0 flex-1 items-center flex-row-reverse`}>
        <div className={`-ml-4 md:-ml-6 z-10 shrink-0 overflow-hidden bg-[#161616] rounded-full`}>
          <div className="p-2 bg-linear-to-r from-[#1c54ff] to-[#001a61] dark:from-[#e4e9ff] dark:to-[#4c5061] hover:from-[#163fbf] hover:to-[#001244] rounded-[50%] shadow-lg transition-all duration-200 flex items-center gap-2">
            <UserRoundCheck color={theme === 'light' ? 'white' : 'black'} />
          </div>
        </div>
        <div className={`${pillBase} ${pillShape}`}>
          <div className="pointer-events-none absolute inset-0 rounded-full border border-white/5 opacity-40" />
          <span className="relative w-full text-xs truncate text-right" title={name}>
            {name}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { theme } = useTheme();
  const [username] = useState<string | null>(() => {
    try {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem('username');
    } catch {
      return null;
    }
  });
  // const { connected } = useWallet();

  return (
    <PageTransition direction="forward">
      <div className="flex flex-col h-full relative">
        <main className="flex min-h-full w-full flex-col items-center px-4 bg-white dark:bg-black">
          <div className="flex w-full justify-between gap-6">
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold">Tumo</p>
            </div>
            {/* {!connected ? (
              <div>
                <SolanaConnectButton />
              </div>
            ) : (
              <Link
                href="/profile"
                className="p-2 bg-linear-to-r from-[#1c54ff] to-[#001a61] dark:from-[#e4e9ff] dark:to-[#4c5061] hover:from-[#163fbf] hover:to-[#001244] rounded-[50%] shadow-lg transition-all duration-200"
              >
                <UserRoundCheck color={theme === 'light' ? 'white' : 'black'} />
              </Link>
            )} */}
            <div className="flex items-center gap-2">
              {username ? <UserPill name={username} theme={theme} /> : null}
            </div>
          </div>
          <InputStartIcon />
          <TestMatches />
          <LiveMatches />
          <UpcomingMatches />
        </main>
      </div>
    </PageTransition>
  );
}
