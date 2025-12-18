'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'src/provider/ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-zinc-800 shadow-lg border border-zinc-200 dark:border-zinc-700 transition-all hover:scale-110 active:scale-95"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <Moon className="w-5 h-5 text-zinc-800" /> : <Sun className="w-5 h-5 text-yellow-400" />}
    </button>
  );
}
