// Client helper for the AI place-recommendation feature.

export type AiRecommendErrorCode =
  | 'RETRY_LATER' // transient server/upstream error — safe to retry later
  | 'BAD_REQUEST' // 400 — empty / invalid input
  | 'UNREACHABLE' // network failure reaching our own proxy
  | 'UNKNOWN';

export class AiRecommendError extends Error {
  code: AiRecommendErrorCode;
  constructor(code: AiRecommendErrorCode, message: string) {
    super(message);
    this.name = 'AiRecommendError';
    this.code = code;
  }
}

export interface AiPlace {
  title: string;
  coordinates: [number, number];
}

export type AiRecommendResult =
  | { kind: 'ok'; place: AiPlace }
  | { kind: 'not_found'; title?: string }; // → ask the user for a new place

// Server response contract (see app/api/openai/Coordinates/route.ts).
interface AiApiResponse {
  ok?: boolean;
  kind?: 'NOT_FOUND' | 'SERVER_ERROR' | 'BAD_REQUEST';
  title?: string;
  coordinates?: [number, number];
  // Legacy fields kept for backward-compatibility with the old contract.
  tryAgain?: boolean;
  reason?: string;
  error?: string;
}

const MAX_ATTEMPTS = 3;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Ask the AI for a place recommendation and geocode it.
export async function fetchAiPlace(value: string): Promise<AiRecommendResult> {
  const query = value.trim();
  if (!query) throw new AiRecommendError('BAD_REQUEST', 'Empty input');

  let lastErr = 'AI recommendation failed';

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let res: Response;
    try {
      res = await fetch('/api/openai/Coordinates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: query }),
      });
    } catch (err) {
      // Network failure reaching our own proxy — transient, back off and retry.
      lastErr = err instanceof Error ? err.message : 'Network error';
      await sleep(500 * (attempt + 1));
      continue;
    }

    // 400 — our input is invalid; retrying won't help.
    if (res.status === 400) {
      throw new AiRecommendError('BAD_REQUEST', `[400] ${lastErr}`);
    }

    // 5xx (including our own 503 'SERVER_ERROR') — transient, back off and retry.
    if (res.status >= 500) {
      lastErr = `Request failed with status ${res.status}`;
      await sleep(500 * (attempt + 1));
      continue;
    }

    let data: AiApiResponse;
    try {
      data = (await res.json()) as AiApiResponse;
    } catch {
      // A 200 that isn't JSON (e.g. an auth redirect served as HTML) — retry.
      lastErr = 'Recommendation proxy returned a non-JSON response';
      await sleep(500 * (attempt + 1));
      continue;
    }

    // Success: a resolved place with coordinates.
    if (data.coordinates?.length === 2 && data.title) {
      return {
        kind: 'ok',
        place: { title: data.title, coordinates: data.coordinates },
      };
    }

    // The model/geocoder couldn't resolve a real place → ask for a new one.
    // (Return immediately — this is not a transient error.)
    if (data.kind === 'NOT_FOUND' || data.tryAgain) {
      return { kind: 'not_found', title: data.title };
    }

    // Server flagged a transient error while returning 200 — retry.
    if (data.kind === 'SERVER_ERROR') {
      lastErr = data.reason || 'Server error';
      await sleep(500 * (attempt + 1));
      continue;
    }

    // Unexpected shape — treat as retryable rather than a silent dead end.
    lastErr = data.error || data.reason || 'Unexpected response';
    await sleep(500 * (attempt + 1));
  }

  // Every attempt exhausted on a transient error → let the caller offer a retry.
  throw new AiRecommendError('RETRY_LATER', lastErr);
}
