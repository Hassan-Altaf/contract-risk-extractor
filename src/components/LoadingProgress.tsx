/**
 * LoadingProgress — visual step-by-step pipeline progress indicator.
 * Shows completed, active, and pending stages with animated icons.
 */

'use client';

import { Check, Loader2 } from 'lucide-react';
import type { PipelineStage } from '@/types';

interface LoadingProgressProps {
  currentStage: PipelineStage;
}

const STAGES: { key: PipelineStage; label: string }[] = [
  { key: 'parsing', label: 'Parsing Document' },
  { key: 'chunking', label: 'Detecting Clauses' },
  { key: 'classifying', label: 'Classifying Clauses' },
  { key: 'scoring', label: 'Scoring Risks' },
  { key: 'recommending', label: 'Generating Recommendations' },
  { key: 'summarising', label: 'Building Summary' },
];

const STAGE_INDEX: Record<string, number> = {};
STAGES.forEach((s, i) => { STAGE_INDEX[s.key] = i; });

export function LoadingProgress({ currentStage }: LoadingProgressProps) {
  const currentIndex = STAGE_INDEX[currentStage] ?? -1;

  return (
    <div className="max-w-xl mx-auto mt-10 sm:mt-14 px-4 sm:px-6 animate-fade-up">
      <div className="bg-white/95 dark:bg-slate-900/85 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-[0_24px_50px_-28px_rgba(15,23,42,0.45)] p-5 sm:p-8">
        <div className="text-center mb-7 sm:mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/15 dark:to-indigo-500/15 border border-blue-100 dark:border-blue-400/20">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white dark:bg-slate-900 shadow-[0_12px_22px_-16px_rgba(37,99,235,0.65)]">
              <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-300 animate-spin" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Analysing your contract
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1.5">
            This typically takes 20–45 seconds
          </p>
        </div>

        <div className="space-y-2.5">
          {STAGES.map((stage, index) => {
            const isComplete = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;

            return (
              <div
                key={stage.key}
                className={`flex items-center gap-3 py-3 px-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-blue-50 border-blue-100 dark:bg-blue-500/12 dark:border-blue-400/25'
                    : isComplete
                    ? 'bg-emerald-50/80 border-emerald-100 dark:bg-emerald-500/12 dark:border-emerald-400/25'
                    : 'bg-slate-50/70 border-slate-100 dark:bg-slate-800/50 dark:border-slate-700/70'
                }`}
              >
                <div className="flex-shrink-0">
                  {isComplete && (
                    <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_8px_18px_-10px_rgba(16,185,129,0.9)]">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  {isCurrent && (
                    <div className="w-7 h-7 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center shadow-[0_8px_18px_-10px_rgba(37,99,235,0.9)]">
                      <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                    </div>
                  )}
                  {isPending && (
                    <div className="w-7 h-7 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    isComplete
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : isCurrent
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
