/**
 * SeverityBadge — colour-coded pill indicator for High/Medium/Low risk.
 * Supports sm/md/lg size variants.
 */

'use client';

import type { SeverityLevel } from '@/types';

interface SeverityBadgeProps {
  severity: SeverityLevel;
  size?: 'sm' | 'md' | 'lg';
}

const SEVERITY_STYLES: Record<SeverityLevel, string> = {
  High: 'bg-red-100 text-red-800 border-red-200',
  Medium: 'bg-amber-100 text-amber-800 border-amber-200',
  Low: 'bg-green-100 text-green-800 border-green-200',
};

const SIZE_STYLES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5 font-semibold',
};

export function SeverityBadge({ severity, size = 'md' }: SeverityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${SEVERITY_STYLES[severity]} ${SIZE_STYLES[size]}`}
    >
      {severity === 'High' && '● '}
      {severity === 'Medium' && '◐ '}
      {severity === 'Low' && '○ '}
      {severity} Risk
    </span>
  );
}
