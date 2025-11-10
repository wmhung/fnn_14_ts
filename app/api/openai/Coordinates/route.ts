import OpenAI from 'openai';
import fetch from 'node-fetch'; // only needed if not using native fetch

const openai = new OpenAI();
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function POST(request) {
  try {
    const body = await request.json();
    const userInput = body?.value;

    if (!userInput) {
      return new Response(JSON.stringify({ error: 'Missing input value' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 1: Ask GPT for the park title only
    const gpt4Completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `
You are a helpful assistant that recommends the best park for the user's request.

🌐 Instructions:
- Understand if the user is using English or Chinese.
- Reply in the same language.
- Recommend one specific park name as JSON: {"title": "Park Name"}

Do not include coordinates. Just return the park name as a JSON object with key "title".

Examples:
→ {"title": "Daan Forest Park"}
→ {"title": "大安森林公園"}
          `.trim(),
        },
        { role: 'user', content: userInput },
      ],
    });

    const gptReply = gpt4Completion.choices[0]?.message?.content?.trim();

    let parkTitle = '';
    if (gptReply?.startsWith('{')) {
      try {
        const parsed = JSON.parse(gptReply);
        parkTitle = parsed.title;
      } catch (err) {
        return new Response(
          JSON.stringify({ tryAgain: true, reason: 'GPT JSON parse error' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!parkTitle) {
      return new Response(
        JSON.stringify({ tryAgain: true, reason: 'Missing park title' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Use Google Maps Geocoding API
    const geoRes = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        parkTitle
      )}&key=${GOOGLE_API_KEY}`
    );

    const geoData = await geoRes.json();
    const location = geoData?.results?.[0]?.geometry?.location;

    if (!location) {
      return new Response(
        JSON.stringify({
          tryAgain: true,
          reason: 'Could not geocode title',
          title: parkTitle,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        title: parkTitle,
        coordinates: [location.lat, location.lng],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Server Error:', error);
    return new Response(JSON.stringify({ error: 'Something went wrong' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
