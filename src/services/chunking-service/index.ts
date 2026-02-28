/**
 * Chunking Service — Stage 2 of the analysis pipeline.
 * Splits cleaned contract text into semantically meaningful clause chunks
 * using heading pattern detection (not naive token splitting).
 * Supports ALL CAPS, Title Case, and Mixed Case heading formats.
 */

import type { ClauseChunk, ChunkingOutput } from '@/types';

/** Determines if a line is a clause/section heading across all casing styles */
function isHeading(line: string): boolean {
  // Keyword-prefixed: "CLAUSE 5", "Section 4 — Title", "Article 7", "Part III"
  if (/^(?:clause|section|part|article)\s+[\dIVXivx]+[\s—–\-.:]/i.test(line)) return true;
  if (/^(?:clause|section|part|article)\s+[\dIVXivx]+\s*$/i.test(line)) return true;

  // Numbered title case: "3. Client Obligations", "14. General Provisions"
  if (/^\d{1,3}\.?\s+[A-Z][A-Za-z]+(?:[\s,&]+[A-Za-z]+)+\s*$/.test(line)) {
    const afterNum = line.replace(/^\d{1,3}\.?\s+/, '');
    if (afterNum.length >= 5 && afterNum.length <= 120) return true;
  }

  // ALL-CAPS numbered: "9. INDEMNIFICATION, LIABILITY AND RISK ALLOCATION"
  if (/^\d{1,3}\.?\s+[A-Z][A-Z\s,&]+$/.test(line)) return true;

  return false;
}

/** Matches annex/schedule/appendix section headers */
const ANNEX_HEADING = /^(?:annex|schedule|appendix|exhibit)\s+[A-Z\d]+/i;

interface RawSection {
  title: string;
  lines: string[];
  isAnnex: boolean;
}

/** Walks through document lines and groups them into sections by heading boundaries */
function detectSections(text: string): RawSection[] {
  const lines = text.split('\n');
  const sections: RawSection[] = [];
  let current: RawSection | null = null;
  let preambleLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (current) current.lines.push('');
      else preambleLines.push('');
      continue;
    }

    const isMainHeading = isHeading(trimmed);
    const isAnnexHeading = ANNEX_HEADING.test(trimmed);

    if (isMainHeading || isAnnexHeading) {
      if (current) {
        sections.push(current);
      } else if (preambleLines.some((l) => l.trim().length > 0)) {
        sections.push({
          title: 'PREAMBLE AND PARTIES',
          lines: preambleLines,
          isAnnex: false,
        });
      }

      current = {
        title: trimmed.replace(/^(?:clause|section|part|article)\s+/i, '').replace(/[—–\-]\s*/, '— '),
        lines: [],
        isAnnex: isAnnexHeading,
      };
      continue;
    }

    if (current) {
      current.lines.push(trimmed);
    } else {
      preambleLines.push(trimmed);
    }
  }

  if (current) sections.push(current);
  if (sections.length === 0 && preambleLines.length > 0) {
    sections.push({
      title: 'FULL DOCUMENT',
      lines: preambleLines,
      isAnnex: false,
    });
  }

  return sections;
}

/** Strips leading numbers and dashes from raw heading text */
function cleanTitle(raw: string): string {
  return raw
    .replace(/^[\d]+\.?\s*/, '')
    .replace(/^[—–\-]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Generates a stable, readable clause ID from heading content */
function buildClauseId(index: number, section: RawSection): string {
  const titleMatch = section.title.match(/^(\d+[A-Z]?)/);
  if (titleMatch) return `clause-${titleMatch[1].toLowerCase()}`;
  if (section.isAnnex) {
    const annexMatch = section.title.match(/(?:ANNEX|SCHEDULE|APPENDIX)\s+([A-Z\d]+)/i);
    return `annex-${(annexMatch?.[1] || index.toString()).toLowerCase()}`;
  }
  return `section-${index + 1}`;
}

/** Main entry: splits contract text into structured clause chunks */
export async function chunkContract(cleanedText: string): Promise<ChunkingOutput> {
  const sections = detectSections(cleanedText);
  const usedIds = new Set<string>();

  const clauses: ClauseChunk[] = sections
    .map((section, idx) => {
      const text = section.lines
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      if (text.length < 20) return null;

      /** Guarantee unique clause IDs — append suffix if collision detected */
      let id = buildClauseId(idx, section);
      if (usedIds.has(id)) {
        id = `${id}-${idx}`;
      }
      usedIds.add(id);

      return {
        clause_id: id,
        clause_title: cleanTitle(section.title) || section.title,
        clause_text: text,
      };
    })
    .filter((c): c is ClauseChunk => c !== null);

  if (clauses.length === 0) {
    throw new Error('No meaningful clauses could be extracted from the document');
  }

  return { clauses };
}
