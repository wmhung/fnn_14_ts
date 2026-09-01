import OpenAI from 'openai';
import fetch from 'node-fetch'; // only needed if not using native fetch

const openai = new OpenAI();
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Retry config for transient upstream failures (OpenAI / Google).
const MAX_ATTEMPTS = 3;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

// A status is transient (worth retrying) if it's a 429 or any 5xx.
const isTransientStatus = (status?: number) =>
  status === 429 || (typeof status === 'number' && status >= 500);

interface GeoLocation {
  lat: number;
  lng: number;
}

interface GeoResult {
  geometry: {
    location: GeoLocation;
  };
}

interface GeoResponse {
  results?: {
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }[];
  status?: string;
}

// Response contract
//   200 { ok:true,  title, coordinates:[lat,lng] }              // resolved
//   200 { ok:false, kind:'NOT_FOUND',    tryAgain:true, title } // ask for a new place
//   503 { ok:false, kind:'SERVER_ERROR', retryable:true }       // retry later
//   400 { ok:false, kind:'BAD_REQUEST',  error }                // bad input
export async function POST(request: Request) {
  try {
    let body: { value?: unknown };
    try {
      body = (await request.json()) as { value?: unknown };
    } catch {
      return json(
        { ok: false, kind: 'BAD_REQUEST', error: 'Invalid JSON body' },
        400,
      );
    }

    const userInput = typeof body?.value === 'string' ? body.value.trim() : '';
    if (!userInput) {
      return json(
        { ok: false, kind: 'BAD_REQUEST', error: 'Missing input value' },
        400,
      );
    }

    // ---- Step 1: ask GPT for the place title only (retry transient errors) ----
    let placeTitle = '';
    // Set when the model explicitly says the input isn't a place (title: null).
    // This is a deterministic "ask the user for a new place" — NOT retryable.
    let notAPlace = false;
    let notAPlaceReason = 'not a place';
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        const gpt4Completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          // Force a parseable JSON object — removes the old "GPT JSON parse
          // error" failure mode almost entirely.
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: `
You are a helpful assistant that recommends the best place for the user's request.

🌐 Instructions:
- Understand if the user is using English or Chinese.
- Reply in the same language.
- Recommend one specific place name as JSON: {"title": "Place Name"}
- If the input is NOT a recognizable place, activity, or location request
  (e.g. gibberish, a greeting, an emotion, or random characters such as "哈哈"
  or "啥"), do NOT guess. Return {"title": null, "reason": "not a place"}.

Do not include coordinates. Return a JSON object with key "title" — a place-name
string, or null when the input isn't a place request.
              `.trim(),
            },
            { role: 'user', content: userInput },
          ],
        });

        const gptReply = gpt4Completion.choices[0]?.message?.content?.trim();
        if (gptReply) {
          try {
            const parsed = JSON.parse(gptReply);
            // Explicit null title = the model judged the input isn't a place.
            // Deterministic → stop and ask the user for a new place (no retry).
            if (parsed && parsed.title === null) {
              notAPlace = true;
              if (typeof parsed.reason === 'string' && parsed.reason.trim()) {
                notAPlaceReason = parsed.reason.trim();
              }
              break;
            }
            if (parsed?.title && typeof parsed.title === 'string') {
              placeTitle = parsed.title.trim();
            }
          } catch {
            // Malformed JSON despite response_format — fall through to retry.
          }
        }

        if (placeTitle) break;
        await sleep(500 * (attempt + 1)); // empty/unparseable → retry
      } catch (err) {
        // OpenAI SDK error. Retry on 429/5xx/network; bail on other 4xx.
        const status = err instanceof OpenAI.APIError ? err.status : undefined;
        if (status !== undefined && !isTransientStatus(status)) {
          console.error('OpenAI non-transient error:', err);
          break;
        }
        console.error(
          `OpenAI transient error (attempt ${attempt + 1}):`,
          err instanceof Error ? err.message : err,
        );
        await sleep(500 * (attempt + 1));
      }
    }

    if (notAPlace) {
      // The model recognized the input isn't a place → ask for a new one.
      return json(
        {
          ok: false,
          kind: 'NOT_FOUND',
          tryAgain: true,
          reason: notAPlaceReason,
        },
        200,
      );
    }

    if (!placeTitle) {
      // Couldn't get a usable place name after retries → transient server error.
      return json(
        {
          ok: false,
          kind: 'SERVER_ERROR',
          retryable: true,
          tryAgain: true,
          reason: 'Could not get a place from the model',
        },
        503,
      );
    }

    // ---- Step 2: geocode the title via Google (retry transient errors) ----
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        const geoRes = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            placeTitle,
          )}&key=${GOOGLE_API_KEY}`,
        );

        if (isTransientStatus(geoRes.status)) {
          await sleep(500 * (attempt + 1)); // transient upstream — retry
          continue;
        }

        const geoData: GeoResponse = await geoRes.json();
        const location = geoData.results?.[0]?.geometry.location;

        if (!location) {
          // The model named a place, but it can't be geocoded → it doesn't
          // exist. Ask the user to try a different place.
          return json(
            {
              ok: false,
              kind: 'NOT_FOUND',
              tryAgain: true,
              reason: 'Could not geocode title',
              title: placeTitle,
            },
            200,
          );
        }

        return json(
          {
            ok: true,
            title: placeTitle,
            coordinates: [location.lat, location.lng],
          },
          200,
        );
      } catch (err) {
        console.error(`Geocode transient error (attempt ${attempt + 1}):`, err);
        await sleep(500 * (attempt + 1)); // network hiccup — retry
      }
    }

    // Geocoding kept failing on transient errors → tell the client to retry later.
    return json(
      {
        ok: false,
        kind: 'SERVER_ERROR',
        retryable: true,
        tryAgain: true,
        reason: 'Geocoding service unavailable',
        title: placeTitle,
      },
      503,
    );
  } catch (error) {
    console.error('Server Error:', error);
    return json(
      {
        ok: false,
        kind: 'SERVER_ERROR',
        retryable: true,
        error: 'Something went wrong',
      },
      503,
    );
  }
}
