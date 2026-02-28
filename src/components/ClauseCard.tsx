/**
 * ClauseCard — expandable card showing clause severity, category,
 * risk reasoning, negotiation recommendation, and original text.
 * High-risk clauses auto-expand for immediate visibility.
 */

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SeverityBadge } from './SeverityBadge';
import type { AnalysedClause } from '@/types';

interface ClauseCardProps {
  clause: AnalysedClause;
}

/** Maps internal category keys to human-readable labels */
const CATEGORY_LABELS: Record<string, string> = {
  liability: 'Liability',
  IP: 'Intellectual Property',
  termination: 'Termination',
  payment: 'Payment',
  change_control: 'Change Control',
  confidentiality: 'Confidentiality',
  data_protection: 'Data Protection',
  indemnity: 'Indemnity',
  warranties: 'Warranties',
  governing_law: 'Governing Law',
  insurance: 'Insurance',
  other: 'General',
};

export function ClauseCard({ clause }: ClauseCardProps) {
  const [expanded, setExpanded] = useState(clause.severity === 'High');

  const borderColor =
    clause.severity === 'High'
      ? 'border-l-red-500'
      : clause.severity === 'Medium'
      ? 'border-l-amber-400'
      : 'border-l-green-500';

  return (
    <div
      className={`bg-white/95 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border-l-4 ${borderColor}`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 sm:px-5 py-4 flex items-start justify-between gap-3 sm:gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-inset"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <SeverityBadge severity={clause.severity} size="sm" />
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {CATEGORY_LABELS[clause.category] || clause.category}
            </span>
          </div>
          <h4 className="mt-2 font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-snug">
            {clause.clause_title}
          </h4>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
            {clause.reasoning}
          </p>
        </div>
        <div className="flex-shrink-0 mt-1 text-slate-400 dark:text-slate-500">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 sm:px-5 pb-5 space-y-4">
          <div className="mt-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-400/20 rounded-lg p-3 sm:p-4">
            <h5 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1.5">
              Recommendation
            </h5>
            <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
              {clause.recommendation}
            </p>
          </div>

          <div>
            <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Detailed Risk Analysis
            </h5>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {clause.reasoning}
            </p>
          </div>

          <div>
            <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Original Clause Text
            </h5>
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700 rounded-lg p-3 sm:p-4 max-h-64 overflow-y-auto">
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-mono">
                {clause.clause_text}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
