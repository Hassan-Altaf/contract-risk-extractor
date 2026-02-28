/**
 * SeverityChart — stacked horizontal bar chart with legend
 * showing proportional risk distribution across all clauses.
 */

'use client';

interface SeverityChartProps {
  high: number;
  medium: number;
  low: number;
}

export function SeverityChart({ high, medium, low }: SeverityChartProps) {
  const total = high + medium + low;
  if (total === 0) return null;

  const highPct = (high / total) * 100;
  const mediumPct = (medium / total) * 100;
  const lowPct = (low / total) * 100;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
        Risk Distribution
      </h4>

      <div className="h-4 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
        {high > 0 && (
          <div
            className="bg-red-500 transition-all duration-500"
            style={{ width: `${highPct}%` }}
          />
        )}
        {medium > 0 && (
          <div
            className="bg-amber-400 transition-all duration-500"
            style={{ width: `${mediumPct}%` }}
          />
        )}
        {low > 0 && (
          <div
            className="bg-green-500 transition-all duration-500"
            style={{ width: `${lowPct}%` }}
          />
        )}
      </div>

      <div className="flex justify-between text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-slate-700 dark:text-slate-300">
            High <span className="font-bold text-red-700">{high}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="text-slate-700 dark:text-slate-300">
            Medium <span className="font-bold text-amber-700">{medium}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-slate-700 dark:text-slate-300">
            Low <span className="font-bold text-green-700">{low}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
