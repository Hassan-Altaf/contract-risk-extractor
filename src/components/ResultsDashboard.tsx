/**
 * ResultsDashboard — main results view displaying risk overview,
 * severity distribution chart, red flags, negotiation priorities,
 * filter controls, and expandable clause cards.
 */

'use client';

import { useState } from 'react';
import { AlertTriangle, Filter } from 'lucide-react';
import { SeverityChart } from './SeverityChart';
import { ClauseCard } from './ClauseCard';
import type { AnalysisResult, SeverityLevel } from '@/types';

interface ResultsDashboardProps {
  result: AnalysisResult;
}

type FilterOption = 'all' | SeverityLevel;

export function ResultsDashboard({ result }: ResultsDashboardProps) {
  const [filter, setFilter] = useState<FilterOption>('all');
  const { clauses, summary } = result;

  const filteredClauses = filter === 'all'
    ? clauses
    : clauses.filter((c) => c.severity === filter);

  /** High-risk clauses surface first for immediate attention */
  const sortedClauses = [...filteredClauses].sort((a, b) => {
    const order: Record<SeverityLevel, number> = { High: 0, Medium: 1, Low: 2 };
    return order[a.severity] - order[b.severity];
  });

  const overallRisk =
    summary.total_high >= 3
      ? 'High'
      : summary.total_high >= 1
      ? 'Medium-High'
      : summary.total_medium >= 3
      ? 'Medium'
      : 'Low';

  const overallBg =
    overallRisk === 'High' || overallRisk === 'Medium-High'
      ? 'from-rose-600 via-red-600 to-red-700'
      : overallRisk === 'Medium'
      ? 'from-amber-500 to-orange-500'
      : 'from-emerald-600 to-green-700';

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-6 sm:space-y-8 animate-fade-up">
      {/* Overall Risk Banner */}
      <div className={`bg-gradient-to-r ${overallBg} rounded-2xl p-4 sm:p-6 text-white shadow-[0_18px_48px_-24px_rgba(15,23,42,0.55)]`}>
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg sm:text-2xl font-bold tracking-tight">Overall Risk: {overallRisk}</h2>
              <span className="bg-white/20 text-xs sm:text-sm px-3 py-1 rounded-full border border-white/30">
                {clauses.length} clauses analysed
              </span>
            </div>
            <p className="mt-2 text-white/90 leading-relaxed text-sm sm:text-base">
              {summary.executive_summary}
            </p>
          </div>
        </div>
      </div>

      {/* Stats + Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-[0_14px_32px_-24px_rgba(15,23,42,0.35)] animate-fade-up animate-delay-1">
          <SeverityChart
            high={summary.total_high}
            medium={summary.total_medium}
            low={summary.total_low}
          />
        </div>

        {/* Key Red Flags */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-[0_14px_32px_-24px_rgba(15,23,42,0.35)] animate-fade-up animate-delay-2">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
            Key Red Flags
          </h4>
          <ul className="space-y-2">
            {summary.key_red_flags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <span className="text-red-500 mt-0.5 flex-shrink-0">●</span>
                <span className="leading-relaxed">{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Negotiation Priorities */}
      {summary.negotiation_priority.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 border border-blue-100 dark:border-blue-400/20 rounded-2xl p-4 sm:p-6">
          <h4 className="text-sm font-semibold text-blue-800 uppercase tracking-wider mb-3">
            Negotiation Priority Order
          </h4>
          <div className="flex flex-wrap gap-2">
            {summary.negotiation_priority.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-400/20 rounded-lg px-3 py-1.5 text-sm text-blue-800 dark:text-blue-200 font-medium"
              >
                <span className="text-blue-400 text-xs font-bold">{i + 1}</span>
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 sm:p-3 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.35)]">
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Filter className="w-4 h-4" />
          <span>Filter:</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(['all', 'High', 'Medium', 'Low'] as FilterOption[]).map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`text-xs sm:text-sm px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                filter === option
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {option === 'all' ? `All (${clauses.length})` : option}
            </button>
          ))}
        </div>
      </div>

      {/* Clause Cards */}
      <div className="space-y-4">
        {sortedClauses.length === 0 ? (
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center text-sm text-slate-500 dark:text-slate-400">
            No clauses match this filter.
          </div>
        ) : (
          sortedClauses.map((clause) => (
            <ClauseCard key={clause.clause_id} clause={clause} />
          ))
        )}
      </div>
    </div>
  );
}
