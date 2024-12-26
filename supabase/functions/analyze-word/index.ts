import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { Anthropic } from "https://esm.sh/@anthropic-ai/sdk@0.10.2";

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
        content: `Analyze the English word "${word}" and provide:
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
}`
      }]
    });

    console.log('Received response from Claude API:', response);

    if (!response.content) {
      throw new Error('No content in Claude API response');
    }

    const content = response.content[0];
    if (!content || content.type !== 'text' || !content.text) {
      throw new Error('Invalid content format in Claude API response');
    }

    let analysis;
    try {
      analysis = JSON.parse(content.text);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', content.text);
      throw new Error('Failed to parse Claude API response as JSON');
    }

    // Validate all required fields are present
    const requiredFields = ['partOfSpeech', 'example', 'exampleTranslation', 'difficulty', 'meaning'];
    for (const field of requiredFields) {
      if (!analysis[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Ensure difficulty is a number between 1 and 3
    analysis.difficulty = Math.max(1, Math.min(3, Number(analysis.difficulty)));

    console.log(`Successfully analyzed word: ${word}`);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(`Error analyzing word:`, error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});