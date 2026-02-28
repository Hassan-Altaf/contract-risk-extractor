/**
 * Summary Service — Stage 6 (final) of the analysis pipeline.
 * Uses AI to produce an executive-level risk briefing in plain English
 * suitable for non-legal project managers to make sign/negotiate decisions.
 */

import { openai, MODEL, withRetry } from '@/lib/openai';
import type { AnalysedClause, ExecutiveSummary, SummaryOutput } from '@/types';

const SYSTEM_PROMPT = `You are a senior contract risk advisor preparing an executive briefing for a non-legal project manager.

Your task is to produce a concise executive summary of the contract risk analysis. The summary should:

1. Be written in plain English — no legal jargon
2. Clearly state the overall risk posture
3. Highlight the most critical red flags that need immediate attention
4. Prioritise which clauses to negotiate first
5. Be suitable for someone who needs to decide whether to sign or push back

The executive summary paragraph should be 3-5 sentences, covering:
- Overall risk level of the contract
- The most dangerous clauses and why
- A clear recommendation on whether to sign as-is or negotiate

Respond ONLY with valid JSON.`;

function buildUserPrompt(clauses: AnalysedClause[]): string {
  const clauseSummaries = clauses.map((c) =>
    `[${c.clause_id}] ${c.clause_title} | ${c.category} | ${c.severity}\nRisk: ${c.reasoning}\nRecommendation: ${c.recommendation}`
  ).join('\n\n');

  const highCount = clauses.filter((c) => c.severity === 'High').length;
  const mediumCount = clauses.filter((c) => c.severity === 'Medium').length;
  const lowCount = clauses.filter((c) => c.severity === 'Low').length;

  return `Produce an executive summary of this contract risk analysis.

Risk distribution: ${highCount} High, ${mediumCount} Medium, ${lowCount} Low

Analysed clauses:

${clauseSummaries}

Return JSON:
{
  "total_high": ${highCount},
  "total_medium": ${mediumCount},
  "total_low": ${lowCount},
  "key_red_flags": ["3-5 most critical issues as short bullet points"],
  "negotiation_priority": ["ordered list of clause IDs or titles to negotiate first"],
  "executive_summary": "3-5 sentence plain-English summary for a project manager"
}`;
}

/** Produces the final executive summary, with fallbacks for missing AI fields */
export async function generateSummary(clauses: AnalysedClause[]): Promise<SummaryOutput> {
  const response = await withRetry(() =>
    openai.chat.completions.create({
      model: MODEL,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(clauses) },
      ],
    })
  );

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Empty response from summary model');

  let parsed: ExecutiveSummary;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('Failed to parse summary response as JSON');
  }

  const highCount = clauses.filter((c) => c.severity === 'High').length;
  const mediumCount = clauses.filter((c) => c.severity === 'Medium').length;
  const lowCount = clauses.filter((c) => c.severity === 'Low').length;

  return {
    summary: {
      total_high: parsed.total_high ?? highCount,
      total_medium: parsed.total_medium ?? mediumCount,
      total_low: parsed.total_low ?? lowCount,
      key_red_flags: Array.isArray(parsed.key_red_flags) ? parsed.key_red_flags : [],
      negotiation_priority: Array.isArray(parsed.negotiation_priority) ? parsed.negotiation_priority : [],
      executive_summary: parsed.executive_summary || 'Summary generation failed.',
    },
  };
}
