/**
 * App Root — orchestrates the five UI states:
 * Landing → Upload → Loading → Results (or Error).
 * Wrapped in ErrorBoundary for unhandled render crash protection.
 */

'use client';

import { useEffect, useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Header } from '@/components/Header';
import { Landing } from '@/components/Landing';
import { UploadSection } from '@/components/UploadSection';
import { LoadingProgress } from '@/components/LoadingProgress';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { ErrorState } from '@/components/ErrorState';
import { useAnalysis } from '@/hooks/useAnalysis';

function AppContent() {
  const [darkMode, setDarkMode] = useState(false);
  const {
    result,
    error,
    stage,
    isAnalysing,
    analyseFile,
    analyseText,
    reset,
  } = useAnalysis();

  const showLanding = !isAnalysing && !result && !error;
  const showLoading = isAnalysing && stage && stage !== 'complete' && stage !== 'error';
  const showResults = !!result && !isAnalysing;
  const showError = !!error && !isAnalysing;

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDarkMode = storedTheme ? storedTheme === 'dark' : systemPrefersDark;
    setDarkMode(initialDarkMode);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onReset={reset}
        showReset={showResults || showError}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
      />

      <main className="flex-1 pb-12 sm:pb-16">
        {showLanding && (
          <>
            <Landing />
            <UploadSection
              onFileSelect={analyseFile}
              onTextSubmit={analyseText}
              disabled={isAnalysing}
            />
          </>
        )}

        {showLoading && stage && <LoadingProgress currentStage={stage} />}

        {showResults && result && <ResultsDashboard result={result} />}

        {showError && error && <ErrorState message={error} onRetry={reset} />}
      </main>

      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-4 text-center text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 px-4 bg-white/65 dark:bg-slate-950/45 backdrop-blur-sm">
        Contract Risk Extractor — Built for the Leveld.ai Technical Challenge
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
