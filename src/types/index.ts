/**
 * Shared type contracts for the Contract Risk Extractor pipeline.
 * Each service stage progressively enriches the clause data model:
 * ClauseChunk → ClassifiedClause → ScoredClause → AnalysedClause
 */

export type SeverityLevel = 'High' | 'Medium' | 'Low';

export type ClauseCategory =
  | 'liability'
  | 'IP'
  | 'termination'
  | 'payment'
  | 'change_control'
  | 'confidentiality'
  | 'data_protection'
  | 'indemnity'
  | 'warranties'
  | 'governing_law'
  | 'insurance'
  | 'other';

/** Stage 1 output: raw cleaned text from PDF or pasted input */
export interface IngestionOutput {
  cleaned_text: string;
  metadata: {
    page_count: number;
    source_type: 'pdf' | 'text';
  };
}

/** Stage 2 output: individual clause chunks split by heading boundaries */
export interface ClauseChunk {
  clause_id: string;
  clause_title: string;
  clause_text: string;
}

export interface ChunkingOutput {
  clauses: ClauseChunk[];
}

/** Clause enriched with category classification */
export interface ClassifiedClause extends ClauseChunk {
  category: ClauseCategory;
}

/** Clause enriched with risk severity and reasoning */
export interface ScoredClause extends ClassifiedClause {
  severity: SeverityLevel;
  reasoning: string;
}

/** Fully analysed clause with negotiation recommendation */
export interface AnalysedClause extends ScoredClause {
  recommendation: string;
}

/** Stage 6 output: executive-level risk summary for decision makers */
export interface ExecutiveSummary {
  total_high: number;
  total_medium: number;
  total_low: number;
  key_red_flags: string[];
  negotiation_priority: string[];
  executive_summary: string;
}

export interface SummaryOutput {
  summary: ExecutiveSummary;
}

/** Complete pipeline result combining all analysed clauses with executive summary */
export interface AnalysisResult {
  clauses: AnalysedClause[];
  summary: ExecutiveSummary;
}

/** Frontend loading indicator stages — maps to pipeline progression */
export type PipelineStage =
  | 'uploading'
  | 'parsing'
  | 'chunking'
  | 'classifying'
  | 'scoring'
  | 'recommending'
  | 'summarising'
  | 'complete'
  | 'error';
