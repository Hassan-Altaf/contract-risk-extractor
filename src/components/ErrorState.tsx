/**
 * ErrorState — inline error display with retry button.
 * Shown when the analysis API returns an error.
 */

'use client';

import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="max-w-lg mx-auto mt-10 sm:mt-14 px-4 animate-fade-up">
      <div className="bg-white/95 dark:bg-slate-900/80 border border-red-200 dark:border-red-500/30 rounded-2xl shadow-sm p-6 sm:p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-2xl mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Analysis Failed</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{message}</p>
        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 bg-slate-900 text-white font-medium py-2.5 px-5 rounded-xl hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
