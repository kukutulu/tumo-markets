'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface Props {
  children: React.ReactNode;
}

export default function LockGuard({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Read unlock flag from localStorage
    const unlocked = typeof window !== 'undefined' && localStorage.getItem('appUnlocked') === 'true';

    // Allow staying on login page without redirect loop
    if (!unlocked && pathname !== '/login') {
      router.push('/login');
      return;
    }

    // If already unlocked and user is on /login, send them to home
    if (unlocked && pathname === '/login') {
      router.push('/');
    }
  }, [pathname, router]);

  return <>{children}</>;
}
