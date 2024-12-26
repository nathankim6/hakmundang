import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
      console.error('CLAUDE_API_KEY is not set');
      throw new Error('CLAUDE_API_KEY is not set');
    }

    const { word } = await req.json();
    if (!word) {
      console.error('Word parameter is missing');
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

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
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

    if (!claudeResponse.ok) {
      console.error('Claude API error:', claudeResponse.status, claudeResponse.statusText);
      const errorText = await claudeResponse.text();
      console.error('Error details:', errorText);
      throw new Error(`Claude API error: ${claudeResponse.status} ${claudeResponse.statusText}`);
    }

    const data = await claudeResponse.json();
    console.log('Claude API response:', JSON.stringify(data));

    if (!data.content) {
      console.error('No content in Claude API response:', data);
      throw new Error('No content in Claude API response');
    }

    if (!Array.isArray(data.content) || data.content.length === 0) {
      console.error('Invalid content format in Claude API response:', data.content);
      throw new Error('Invalid content format in Claude API response');
    }

    const content = data.content[0];
    if (!content || typeof content !== 'object' || !('text' in content)) {
      console.error('Invalid content object format:', content);
      throw new Error('Invalid content object format in Claude API response');
    }

    let analysis;
    try {
      analysis = JSON.parse(content.text);
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', content.text);
      throw new Error(`Failed to parse Claude response as JSON: ${parseError.message}`);
    }

    // Validate required fields
    const requiredFields = ['partOfSpeech', 'example', 'exampleTranslation', 'difficulty', 'meaning'];
    const missingFields = requiredFields.filter(field => !(field in analysis));
    
    if (missingFields.length > 0) {
      console.error('Missing required fields in analysis:', missingFields);
      throw new Error(`Missing required fields in analysis: ${missingFields.join(', ')}`);
    }

    // Validate field types
    if (typeof analysis.difficulty !== 'number' || analysis.difficulty < 1 || analysis.difficulty > 3) {
      console.error('Invalid difficulty value:', analysis.difficulty);
      analysis.difficulty = 1; // Default to 1 if invalid
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

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