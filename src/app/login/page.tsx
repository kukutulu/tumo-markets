'use client';

import axios from 'axios';
import { UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Input } from 'shadcn/input';
import { useTheme } from 'src/provider/ThemeProvider';
import { apiUrl } from 'src/service/api/apiUrl';
import { useUserFunction } from 'src/states/user/hooks';
import { TCreateUser } from 'src/types/global';

export default function LoginPage() {
  const [username, setUsername] = useState('');

  const router = useRouter();
  const { theme } = useTheme();
  const dispatch = useUserFunction();

  useEffect(() => {
    // if already unlocked, redirect to home
    if (typeof window !== 'undefined' && localStorage.getItem('appUnlocked') === 'true') {
      router.replace('/');
    }
  }, [router]);

  const handleUnlock = async () => {
    try {
      const trimmed = username.trim();
      if (trimmed === '') {
        toast.info('Please enter your telegram username to proceed.');
        return;
      }
      // API helper expects (userWallet?, telegramHandle?), pass trimmed as second arg
      const { data } = await axios.post<TCreateUser>(apiUrl.createUser(undefined, trimmed));
      if (data.success && data.data?.user_id) {
        dispatch({ user_id: data.data.user_id });
        // store username for demo purposes
        localStorage.setItem('username', trimmed);
        localStorage.setItem('appUnlocked', 'true');
        toast.success('Login successful! Welcome to Tumo.');
        router.push('/');
      } else {
        toast.error('Failed to create user. Please try again.');
      }
    } catch (err) {
      console.error('Failed to unlock app:', err);
      toast.error('An error occurred during login. Please try again.');
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-semibold mb-2">Welcome to Tumo</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Please enter your telegram username so we can contact you later
        </p>
        <div className="w-full pt-4">
          <div className="relative">
            <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
              <UserRound className="size-4" />
              <span className="sr-only">User</span>
            </div>
            <Input
              type="text"
              placeholder="Your telegram username..."
              value={username}
              onChange={e => setUsername((e.target as HTMLInputElement).value)}
              className="peer pl-9 h-14 rounded-xl"
              aria-label="Your telegram username"
            />
          </div>
        </div>
        <button
          onClick={handleUnlock}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-[#1c54ff] to-[#001a61] dark:from-[#e4e9ff] dark:to-[#4c5061] hover:from-[#163fbf] hover:to-[#001244] text-white dark:text-black font-semibold rounded-xl transition-colors"
        >
          Login
        </button>
      </div>
    </div>
  );
}
