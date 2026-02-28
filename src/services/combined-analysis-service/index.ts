/**
 * Combined Analysis Service — performs Classification, Risk Scoring,
 * and Recommendation generation in a SINGLE AI call.
 * Reduces total pipeline API calls to just 2 (this + summary).
 * Groq's LLaMA 3.3 70B context window handles 40+ page contracts.
 */

import { openai, MODEL, withRetry } from '@/lib/openai';
import type { ClauseChunk, AnalysedClause, SeverityLevel, ClauseCategory } from '@/types';

const VALID_CATEGORIES: ClauseCategory[] = [
  'liability', 'IP', 'termination', 'payment', 'change_control',
  'confidentiality', 'data_protection', 'indemnity', 'warranties',
  'governing_law', 'insurance', 'other',
];

const VALID_SEVERITIES: SeverityLevel[] = ['High', 'Medium', 'Low'];

const SYSTEM_PROMPT = `You are a senior contract risk analyst and commercial negotiation advisor specialising in UK commercial contracts.

For EACH contract clause provided, you must produce ALL THREE of the following in a single pass:

1. **CATEGORY** — Classify the clause into exactly ONE of these categories:
   liability, IP, termination, payment, change_control, confidentiality, data_protection, indemnity, warranties, governing_law, insurance, other

2. **SEVERITY** — Score risk from the CLIENT's perspective:
   - High: Significant financial, legal, or operational exposure (e.g., liability cap far below contract value, unlimited indemnity, overly broad IP assignment)
   - Medium: Potentially unfavourable but not immediately dangerous (e.g., auto-renewal, moderately long payment terms)
   - Low: Standard commercial practice, minimal risk (e.g., standard confidentiality, reasonable warranties)

3. **REASONING** — 1-2 sentence specific risk explanation referencing actual values, timeframes, or percentages from the clause.

4. **RECOMMENDATION** — A specific, actionable negotiation recommendation:
   - Reference actual values, percentages, timeframes
   - Suggest concrete alternative language or thresholds
   - Frame as negotiation actions, not observations
   - For low-risk clauses, briefly confirm acceptability

SCORING RULES:
- A liability cap must be assessed relative to the contract value
- Payment terms of 90 days are worse than 30 days
- IP assignment capturing pre-existing tools is HIGH risk
- Termination with only 7 days to cure is HIGH risk
- Exclusion of indirect/consequential losses favours the supplier

Respond ONLY with valid JSON. No markdown.`;

function buildUserPrompt(clauses: ClauseChunk[]): string {
  const clauseList = clauses.map((c) =>
    `[${c.clause_id}] "${c.clause_title}"\n${c.clause_text.substring(0, 2000)}`
  ).join('\n\n---\n\n');

  return `Analyse each clause below. Return JSON:
{"analysis": [{"clause_id": "...", "category": "...", "severity": "High|Medium|Low", "reasoning": "...", "recommendation": "..."}]}

Clauses:

${clauseList}`;
}

interface AIAnalysisItem {
  clause_id: string;
  category: string;
  severity: string;
  reasoning: string;
  recommendation: string;
}

function validateCategory(cat: string): ClauseCategory {
  const normalised = cat.toLowerCase().trim();
  return VALID_CATEGORIES.find((v) => v.toLowerCase() === normalised) || 'other';
}

function validateSeverity(sev: string): SeverityLevel {
  const normalised = sev.charAt(0).toUpperCase() + sev.slice(1).toLowerCase();
  return VALID_SEVERITIES.includes(normalised as SeverityLevel)
    ? (normalised as SeverityLevel)
    : 'Medium';
}

/** Classifies, scores, and recommends ALL clauses in a single API call */
export async function analyseAllClauses(clauses: ClauseChunk[]): Promise<AnalysedClause[]> {
  const response = await withRetry(() =>
    openai.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(clauses) },
      ],
    })
  );

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Empty response from analysis model');

  let parsed: { analysis: AIAnalysisItem[] };
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('Failed to parse analysis response as JSON');
  }

  const resultMap = new Map(
    (parsed.analysis || []).map((r) => [r.clause_id, r])
  );

  return clauses.map((clause) => {
    const result = resultMap.get(clause.clause_id);
    return {
      ...clause,
      category: result ? validateCategory(result.category) : 'other',
      severity: result ? validateSeverity(result.severity) : 'Medium',
      reasoning: result?.reasoning || 'Unable to determine risk reasoning.',
      recommendation: result?.recommendation || 'No specific recommendation generated.',
    };
  });
}
