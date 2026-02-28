/**
 * Header — sticky navigation bar with branding and "Analyse Another" reset action.
 */

'use client';

import { MoonStar, Shield, Sun } from 'lucide-react';

interface HeaderProps {
  onReset?: () => void;
  showReset?: boolean;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Header({ onReset, showReset, darkMode, onToggleDarkMode }: HeaderProps) {
  return (
    <header className="border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-950/70 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 animate-float">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">
              Contract Risk Extractor
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 -mt-0.5 truncate">
              AI-Powered Clause Analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleDarkMode}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 transition-colors px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-400/30 bg-blue-50/70 dark:bg-blue-500/10 animate-soft-glow"
            aria-label="Toggle dark mode"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <MoonStar className="w-4 h-4" />}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          {showReset && onReset && (
            <button
              onClick={onReset}
              className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 transition-colors px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-900 border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              Analyse Another
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
