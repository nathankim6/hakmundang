import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { word } = await req.json();
    const apiKey = Deno.env.get('CLAUDE_API_KEY');

    if (!apiKey) {
      throw new Error('CLAUDE_API_KEY is not set');
    }

    const prompt = `Analyze the English word "${word}" and provide:
1. Part of speech (as [명사], [동사], [형용사], [부사], [전치사] etc.)
2. A simple example sentence with Korean translation
3. Difficulty level (1-3) for Korean high school students
4. Brief meaning in Korean

Format the response as JSON:
{
  "partOfSpeech": string,
  "example": string,
  "exampleTranslation": string,
  "difficulty": number,
  "meaning": string
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 1000,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    const data = await response.json();
    const analysis = JSON.parse(data.content[0].text);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});