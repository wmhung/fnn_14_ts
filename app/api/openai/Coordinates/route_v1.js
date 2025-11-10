import OpenAI from 'openai';

// Automatically reads from process.env.OPENAI_API_KEY
const openai = new OpenAI();

export async function POST(request) {
  try {
    const body = await request.json();
    const userInput = body?.value;

    if (!userInput) {
      return new Response(JSON.stringify({ error: 'Missing input value' }), {
        status: 400,
      });
    }

    const gpt4Completion = await openai.chat.completions.create({
      model: 'gpt-4o', // ← GPT-4o model name
      messages: [
        {
          role: 'system',
          content: `
You are a helpful assistant that extracts a location title and coordinates from the user's input.

🌐 You must:
- Detect whether the user is speaking in Chinese or English.
- Reply in the same language as the input.
- ONLY return a JSON object with two keys:
  - "title" (string)
  - "coordinates" (array of two numbers like [25.033964, 121.564468])

Do NOT include any explanation. Return only the raw JSON.

Examples:

English input:
User: "Which park is perfect for family in Taipei city?"
→ {"title": "Daan Forest Park", "coordinates": [25.026, 121.535]}

中文輸入：
User: "台北市哪個公園適合親子？"
→ {"title": "大安森林公園", "coordinates": [25.026, 121.535]}
        `.trim(),
        },
        { role: 'user', content: userInput },
      ],
    });

    const responseText = gpt4Completion.choices[0]?.message?.content;

    if (responseText?.trim().startsWith('{')) {
      try {
        const json = JSON.parse(responseText);
        return new Response(JSON.stringify(json), { status: 200 });
      } catch (err) {
        return new Response(
          JSON.stringify({
            tryAgain: true,
            reason: 'Failed to parse JSON',
          }),
          { status: 200 }
        );
      }
    }

    return new Response(
      JSON.stringify({ tryAgain: true, reason: 'Invalid response format' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate response from OpenAI' }),
      { status: 500 }
    );
  }
}
