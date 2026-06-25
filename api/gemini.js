export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt?.trim()) {
      return res.status(400).json({
        error: 'Prompt is required'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured'
      });
    }

    let data;
    let response;

    for (let attempt = 1; attempt <= 3; attempt++) {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1500
            }
          })
        }
      );

      data = await response.json();

      if (response.ok) {
        break;
      }

      // Retry only for rate limit / high demand
      if (
        response.status === 429 ||
        data?.error?.message?.includes('high demand')
      ) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        continue;
      }

      return res.status(response.status).json({
        error: data?.error?.message || 'Gemini API Error'
      });
    }

    if (!response.ok) {
      return res.status(429).json({
        error: 'Gemini is busy. Please try again in a few moments.'
      });
    }

    const result =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No response generated';

    return res.status(200).json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Gemini Error:', error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
