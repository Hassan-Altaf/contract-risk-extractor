/**
 * Pipeline Orchestration Endpoint — POST /api/analyze
 * Orchestrates the 6-stage contract analysis pipeline:
 *   Stage 1: Ingestion — PDF parse + text cleaning
 *   Stage 2: Chunking — heading-based clause splitting
 *   Stages 3–5: Combined AI Analysis — classify, score, recommend (1 API call)
 *   Stage 6: Executive Summary (1 API call)
 * Total: exactly 2 AI calls per analysis.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ingestPDF, ingestText } from '@/services/ingestion-service';
import { chunkContract } from '@/services/chunking-service';
import { analyseAllClauses } from '@/services/combined-analysis-service';
import { generateSummary } from '@/services/summary-service';
import { delay } from '@/lib/openai';

/** Vercel serverless function timeout — accommodates AI calls + retry backoff */
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let cleanedText: string;

    // Stage 1: Input handling — accept PDF upload or plain text
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const text = formData.get('text') as string | null;

      if (file && file.size > 0) {
        if (file.size > 20 * 1024 * 1024) {
          return NextResponse.json(
            { success: false, error: 'File size exceeds 20MB limit' },
            { status: 400 }
          );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const ingestion = await ingestPDF(buffer);
        cleanedText = ingestion.cleaned_text;
      } else if (text && text.trim().length > 0) {
        const ingestion = await ingestText(text);
        cleanedText = ingestion.cleaned_text;
      } else {
        return NextResponse.json(
          { success: false, error: 'Please provide a PDF file or paste contract text' },
          { status: 400 }
        );
      }
    } else {
      const body = await request.json();
      if (!body.text || body.text.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Please provide contract text' },
          { status: 400 }
        );
      }
      const ingestion = await ingestText(body.text);
      cleanedText = ingestion.cleaned_text;
    }

    // Stage 2: Split contract into semantically meaningful clause chunks
    const { clauses } = await chunkContract(cleanedText);

    // Stages 3–5: Combined AI Analysis — classify, score, recommend (1 API call)
    const analysed_clauses = await analyseAllClauses(clauses);
    await delay(3000);

    // Stage 6: Executive Summary (1 API call)
    const { summary } = await generateSummary(analysed_clauses);

    return NextResponse.json({
      success: true,
      data: {
        clauses: analysed_clauses,
        summary,
      },
    });
  } catch (error) {
    console.error('Pipeline error:', error);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const statusCode = (error as any)?.status;
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';

    /** User-friendly error messages for common API failures */
    if (statusCode === 429 || message.includes('429')) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI API rate limit reached. Please wait 1-2 minutes and try again, or generate a new API key at https://console.groq.com',
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
