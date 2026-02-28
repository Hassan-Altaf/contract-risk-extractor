/**
 * Root Layout — defines global metadata, font stack, and base styling.
 * All pages render within this shell.
 */

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Contract Risk Extractor | AI-Powered Clause Analysis',
  description:
    'Upload any commercial contract and get instant AI-driven risk analysis with severity ratings, explanations, and negotiation recommendations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">{children}</body>
    </html>
  );
}
