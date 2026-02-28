/**
 * AI Client Configuration — centralised AI model access layer.
 * Uses Groq's LLaMA 3.3 70B via OpenAI-compatible endpoint.
 * Free tier: 14,400 requests/day, 30 requests/min — 10x more than Gemini.
 * Includes retry logic with exponential backoff for resilience.
 */

import OpenAI from 'openai';

export const MODEL = 'llama-3.3-70b-versatile';

let _client: OpenAI | null = null;

/** Lazy-initialises the AI client to avoid build-time env var errors */
export function getOpenAIClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GROQ_API_KEY environment variable is required. Get a free key at https://console.groq.com'
      );
    }
    _client = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }
  return _client;
}

/** Proxy wrapper enables direct `openai.chat.completions.create()` usage across services */
export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    const client = getOpenAIClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

/** Delays execution — used between API calls to respect rate limits */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Detects whether an error is a transient API failure worth retrying */
function isRetryableError(error: unknown): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const statusCode = (error as any)?.status ?? (error as any)?.statusCode;
  if (statusCode === 429 || statusCode === 500 || statusCode === 503) return true;

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('429') || msg.includes('rate') || msg.includes('overloaded') ||
        msg.includes('500') || msg.includes('503') || msg.includes('resource_exhausted') ||
        msg.includes('quota') || msg.includes('too many')) return true;
  }

  return false;
}

/** Wraps an async function with retry logic — waits 5-30s between attempts */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      if (!isRetryableError(error) || attempt === maxRetries) {
        throw error;
      }

      const waitMs = Math.min(5000 * Math.pow(2, attempt), 30000);
      console.log(`[withRetry] Attempt ${attempt + 1}/${maxRetries} failed — retrying in ${waitMs / 1000}s`);
      await delay(waitMs);
    }
  }
  throw new Error('Retry exhausted');
}
