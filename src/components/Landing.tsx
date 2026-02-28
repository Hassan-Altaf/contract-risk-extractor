/**
 * Landing — hero section with feature highlights and trust indicators.
 * Displayed before the user uploads a document.
 */

'use client';

import { Shield, FileSearch, AlertTriangle, Lightbulb, Zap } from 'lucide-react';

export function Landing() {
  return (
    <div className="text-center max-w-5xl mx-auto pt-10 sm:pt-14 lg:pt-20 px-4 sm:px-6 animate-fade-up">
      <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full mb-5 sm:mb-6 border border-blue-100 dark:border-blue-400/20">
        <Zap className="w-3.5 h-3.5" />
        AI-Powered Contract Intelligence
      </div>

      <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-[1.1]">
        Understand contract risks
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
          before you sign
        </span>
      </h2>

      <p className="mt-4 sm:mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
        Upload any commercial contract or statement of work and get instant, AI-driven
        risk analysis with severity ratings, plain-English explanations, and actionable
        negotiation recommendations.
      </p>

      <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <FeatureCard
          icon={<FileSearch className="w-6 h-6" />}
          title="Clause Detection"
          description="Automatically identifies and classifies every clause in your contract"
        />
        <FeatureCard
          icon={<AlertTriangle className="w-6 h-6" />}
          title="Risk Scoring"
          description="Context-aware severity ratings that consider contract value and terms"
        />
        <FeatureCard
          icon={<Lightbulb className="w-6 h-6" />}
          title="Actionable Advice"
          description="Specific negotiation recommendations, not vague observations"
        />
      </div>

      <div className="mt-8 sm:mt-12 flex items-center justify-center gap-x-5 gap-y-2 sm:gap-6 flex-wrap text-xs sm:text-sm text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-1.5">
          <Shield className="w-4 h-4" />
          <span>Your documents are never stored</span>
        </div>
        <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
        <span>Analysis in under 60 seconds</span>
        <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
        <span>Works with any contract type</span>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white/95 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 text-left shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 animate-fade-up animate-delay-1">
      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-300 mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
