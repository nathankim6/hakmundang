import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { Anthropic } from "https://esm.sh/@anthropic-ai/sdk@0.10.2";

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
    const { word } = await req.json();
    const apiKey = Deno.env.get('CLAUDE_API_KEY');

    if (!apiKey) {
      throw new Error('CLAUDE_API_KEY is not set');
    }

    if (!word) {
      throw new Error('Word parameter is required');
    }

    console.log(`Starting analysis for word: ${word}`);

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      temperature: 0.7,
      messages: [{
        role: "user",
        content: `Please analyze the English word "${word}" and provide the following information in a structured format:

1. Part of speech (specify as [명사], [동사], [형용사], [부사], [전치사], etc.)
2. A simple example sentence that clearly demonstrates the word's usage
3. Korean translation of the example sentence
4. Difficulty level for Korean high school students (1 for easy, 2 for medium, 3 for hard)
5. Brief Korean meaning/definition of the word

Format your response as a valid JSON object with these exact keys:
{
  "partOfSpeech": "string (e.g., [명사])",
  "example": "string (English example sentence)",
  "exampleTranslation": "string (Korean translation)",
  "difficulty": "number (1-3)",
  "meaning": "string (Korean meaning)"
}`
      }]
    });

    console.log('Raw Claude response:', JSON.stringify(response));

    if (!response?.content?.[0]?.text) {
      console.error('Invalid response structure:', response);
      throw new Error('Invalid response from Claude API');
    }

    let analysis;
    try {
      const text = response.content[0].text.trim();
      // Find the JSON object in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }
      analysis = JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Failed to parse response:', response.content[0].text);
      throw new Error('Failed to parse Claude API response as JSON');
    }

    // Validate required fields
    const requiredFields = ['partOfSpeech', 'example', 'exampleTranslation', 'difficulty', 'meaning'];
    for (const field of requiredFields) {
      if (!analysis[field]) {
        console.error(`Missing required field: ${field}`);
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Ensure difficulty is a number between 1 and 3
    analysis.difficulty = Math.max(1, Math.min(3, Number(analysis.difficulty)));

    console.log('Successfully analyzed word:', word, 'Result:', analysis);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-word function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});