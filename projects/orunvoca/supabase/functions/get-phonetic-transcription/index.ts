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
    const { word } = await req.json();

    if (!word) {
      throw new Error('Word is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`Getting phonetic transcription for word: ${word}`);

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
            content: 'You are a pronunciation expert. When given an English word, provide both the IPA (International Phonetic Alphabet) transcription and Korean pronunciation guide. Return a JSON object with two fields: "ipa" (the phonetic symbols between forward slashes) and "korean" (Korean pronunciation using 한글). For example, for "hello" return {"ipa": "/həˈloʊ/", "korean": "헐로우"}.'
          },
          {
            role: 'user',
            content: `Provide both IPA phonetic transcription and Korean pronunciation for the word: ${word}`
          }
        ],
        temperature: 0.1,
        max_tokens: 50
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const responseContent = data.choices[0].message.content.trim();
    
    let phoneticData;
    try {
      // JSON 응답 파싱 시도
      phoneticData = JSON.parse(responseContent);
    } catch (e) {
      // JSON 파싱 실패 시 폴백
      phoneticData = {
        ipa: responseContent.includes('/') ? responseContent : `/unknown/`,
        korean: 'unknown'
      };
    }

    console.log(`Generated phonetic data:`, phoneticData);

    return new Response(JSON.stringify({ 
      phoneticTranscription: phoneticData.ipa,
      koreanPronunciation: phoneticData.korean,
      word 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-phonetic-transcription function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      phoneticTranscription: '/unknown/',
      koreanPronunciation: 'unknown',
      word: 'unknown'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});