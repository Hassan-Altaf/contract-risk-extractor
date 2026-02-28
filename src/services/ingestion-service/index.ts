/**
 * Ingestion Service — Stage 1 of the analysis pipeline.
 * Accepts PDF buffers or raw text, extracts clean content,
 * and removes repeated headers/footers using frequency analysis.
 * No document-specific patterns — fully generic across all contracts.
 */

import type { IngestionOutput } from '@/types';

/** Static noise patterns common across all PDF-extracted legal documents */
const NOISE_PATTERNS = [
  /^[-–—]{3,}\s*$/gm,
  /^page\s+\d+\s*(of\s+\d+)?$/gim,
  /^\s*-- \d+ of \d+ --\s*$/gm,
  /^©.*$/gm,
  /^\s*\f\s*$/gm,
];

/**
 * Detects lines that appear 3+ times in a document — a strong signal
 * of repeated headers/footers injected by PDF rendering.
 * Numbers are normalised before comparison to catch "Page 1 of 9" vs "Page 2 of 9".
 */
function detectRepeatedHeaders(text: string): RegExp[] {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 10);
  const freq = new Map<string, number>();

  for (const line of lines) {
    const normalised = line.replace(/\d+/g, '#');
    freq.set(normalised, (freq.get(normalised) || 0) + 1);
  }

  const patterns: RegExp[] = [];
  for (const [normalised, count] of freq.entries()) {
    if (count >= 3) {
      const escaped = normalised
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/#/g, '\\d+');
      patterns.push(new RegExp(`^${escaped}$`, 'gim'));
    }
  }

  return patterns;
}

/** Strips noise, collapses whitespace, and normalises line breaks */
function cleanText(rawText: string): string {
  let text = rawText;

  const repeatedHeaders = detectRepeatedHeaders(text);
  for (const pattern of repeatedHeaders) {
    text = text.replace(pattern, '');
  }

  for (const pattern of NOISE_PATTERNS) {
    text = text.replace(pattern, '');
  }

  text = text.replace(/\n{4,}/g, '\n\n\n');
  text = text.replace(/[ \t]+\n/g, '\n');
  text = text.replace(/[^\S\n]+/g, ' ');

  const lines = text.split('\n');
  const cleanedLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '' && cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1].trim() === '') {
      continue;
    }
    cleanedLines.push(trimmed);
  }

  return cleanedLines.join('\n').trim();
}

/** Parses a PDF buffer and returns cleaned text with page count */
export async function ingestPDF(buffer: Buffer): Promise<IngestionOutput> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse');
    const result = await pdfParse(buffer);
    const fullText = result.text || '';

    const cleaned = cleanText(fullText);

    return {
      cleaned_text: cleaned,
      metadata: {
        page_count: result.numpages || 1,
        source_type: 'pdf',
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown PDF parsing error';
    throw new Error(`PDF ingestion failed: ${message}`);
  }
}

/** Cleans raw pasted text and estimates page count */
export async function ingestText(rawText: string): Promise<IngestionOutput> {
  if (!rawText || rawText.trim().length === 0) {
    throw new Error('Empty text input provided');
  }

  const cleaned = cleanText(rawText);
  const approximatePages = Math.ceil(cleaned.length / 3000);

  return {
    cleaned_text: cleaned,
    metadata: {
      page_count: approximatePages,
      source_type: 'text',
    },
  };
}
