import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('CLAUDE_API_KEY');
    if (!apiKey) {
      throw new Error('CLAUDE_API_KEY is not set');
    }

    const { word } = await req.json();
    if (!word) {
      throw new Error('Word parameter is required');
    }

    console.log(`Analyzing word: ${word}`);

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

    console.log('Sending request to Claude API...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [{ 
          role: 'user', 
          content: prompt 
        }],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      console.error('Claude API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Claude API raw response:', JSON.stringify(data));

    if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
      console.error('Invalid response format from Claude API:', data);
      throw new Error('Invalid response format from Claude API: content array is empty or missing');
    }

    const content = data.content[0];
    if (!content || typeof content !== 'object' || !('text' in content)) {
      console.error('Invalid content format from Claude API:', content);
      throw new Error('Invalid content format from Claude API: text property missing');
    }

    try {
      const analysis = JSON.parse(content.text);
      console.log('Parsed analysis:', analysis);

      // Validate the analysis object has all required fields
      const requiredFields = ['partOfSpeech', 'example', 'exampleTranslation', 'difficulty', 'meaning'];
      for (const field of requiredFields) {
        if (!(field in analysis)) {
          throw new Error(`Missing required field in analysis: ${field}`);
        }
      }

      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', content.text);
      throw new Error(`Failed to parse Claude response as JSON: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Error in analyze-word function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});