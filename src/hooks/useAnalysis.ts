/**
 * useAnalysis Hook — manages full client-side analysis lifecycle.
 * Handles file upload, text submission, stage progression,
 * error states, and result storage for the UI layer.
 */

'use client';

import { useState, useCallback } from 'react';
import type { AnalysisResult, PipelineStage } from '@/types';

/** User-facing messages for each pipeline stage */
const STAGE_MESSAGES: Record<PipelineStage, string> = {
  uploading: 'Uploading document...',
  parsing: 'Parsing and cleaning document...',
  chunking: 'Identifying clause boundaries...',
  classifying: 'Classifying clause types...',
  scoring: 'Scoring risk severity...',
  recommending: 'Generating recommendations...',
  summarising: 'Preparing executive summary...',
  complete: 'Analysis complete',
  error: 'An error occurred',
};

/** Ordered stages for the progress indicator animation */
const STAGE_ORDER: PipelineStage[] = [
  'uploading', 'parsing', 'chunking', 'classifying', 'scoring', 'recommending', 'summarising',
];

export function useAnalysis() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<PipelineStage | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);

  /** Simulates stage transitions while the API processes in the background */
  const simulateProgress = useCallback(() => {
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < STAGE_ORDER.length) {
        setStage(STAGE_ORDER[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  /** Uploads a PDF file and triggers the analysis pipeline */
  const analyseFile = useCallback(async (file: File) => {
    setIsAnalysing(true);
    setError(null);
    setResult(null);
    setStage('uploading');

    const stopProgress = simulateProgress();

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResult(data.data);
      setStage('complete');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      setStage('error');
    } finally {
      stopProgress();
      setIsAnalysing(false);
    }
  }, [simulateProgress]);

  /** Submits pasted text and triggers the analysis pipeline */
  const analyseText = useCallback(async (text: string) => {
    setIsAnalysing(true);
    setError(null);
    setResult(null);
    setStage('uploading');

    const stopProgress = simulateProgress();

    try {
      const formData = new FormData();
      formData.append('text', text);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResult(data.data);
      setStage('complete');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      setStage('error');
    } finally {
      stopProgress();
      setIsAnalysing(false);
    }
  }, [simulateProgress]);

  /** Resets all state to return to the landing/upload view */
  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setStage(null);
    setIsAnalysing(false);
  }, []);

  return {
    result,
    error,
    stage,
    stageMessage: stage ? STAGE_MESSAGES[stage] : null,
    isAnalysing,
    analyseFile,
    analyseText,
    reset,
  };
}
