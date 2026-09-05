import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

    if (!word) {
      return new Response(
        JSON.stringify({ error: 'Word is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Getting pronunciation for word: ${word}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a pronunciation expert. For any given English word, provide:
1. IPA phonetic transcription (International Phonetic Alphabet)
2. Korean pronunciation approximation

Return the result as a JSON object with this exact format:
{
  "ipa": "/aɪ piː eɪ/",
  "korean": "아이 피 에이"
}

Be accurate and consistent. For the Korean pronunciation, use standard Korean approximations that would help Korean speakers pronounce the word correctly.`
          },
          {
            role: 'user',
            content: `Please provide the IPA phonetic transcription and Korean pronunciation for the English word: "${word}"`
          }
        ],
        temperature: 0.1,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    console.log(`OpenAI response for ${word}:`, content);

    // Try to parse the JSON response
    let pronunciationData;
    try {
      pronunciationData = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', content);
      // Fallback: try to extract pronunciation from the response
      const ipaMatch = content.match(/[\/\[]([^\/\]]+)[\/\]]/);
      const koreanMatch = content.match(/한국어|Korean[:\s]*([^\n]+)/i);
      
      pronunciationData = {
        ipa: ipaMatch ? `/${ipaMatch[1]}/` : '',
        korean: koreanMatch ? koreanMatch[1].trim() : ''
      };
    }

    return new Response(
      JSON.stringify({
        word,
        ipa: pronunciationData.ipa || '',
        korean: pronunciationData.korean || '',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in get-pronunciation function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get pronunciation',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});