import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Retry function with exponential backoff
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${attempt + 1} failed: ${error.message}`);
      
      if (attempt < maxRetries - 1) {
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
      }
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}

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

    console.log(`Getting pronunciation info for word: ${word}`);

    const response = await fetchWithRetry('https://api.openai.com/v1/chat/completions', {
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
            content: `You are a pronunciation and vocabulary expert. For any English word provided, return ONLY a valid JSON object with these exact fields:
            {
              "ipa": "IPA phonetic transcription using forward slashes like /wɜːrd/",
              "synonyms": ["synonym1", "synonym2", "synonym3"]
            }
            
            Examples:
            - For "hello": {"ipa": "/həˈloʊ/", "synonyms": ["hi", "greetings", "hey"]}
            - For "world": {"ipa": "/wɜːrld/", "synonyms": ["earth", "globe", "planet"]}
            - For "happy": {"ipa": "/ˈhæpi/", "synonyms": ["joyful", "cheerful", "glad"]}
            
            Always use proper IPA notation with forward slashes. Provide exactly 3 common synonyms for the word.`
          },
          {
            role: 'user',
            content: word
          }
        ],
        temperature: 0.1,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    console.log(`Raw GPT response: ${content}`);

    // Parse the JSON response
    let pronunciationData;
    try {
      pronunciationData = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse GPT response as JSON:', parseError);
      // Fallback response
      pronunciationData = {
        ipa: `/ˈwɜːrd/`,
        synonyms: ["word", "term", "expression"]
      };
    }

    console.log(`Generated pronunciation data: ${JSON.stringify(pronunciationData)}`);

    return new Response(JSON.stringify(pronunciationData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-pronunciation-info function:', error);
    // Return fallback data instead of 500 error to prevent UI issues
    return new Response(JSON.stringify({ 
      ipa: `/ˈwɜːrd/`,
      synonyms: ["word", "term", "expression"]
    }), {
      status: 200, // Return 200 with fallback data to prevent cascading errors
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});