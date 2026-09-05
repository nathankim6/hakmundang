import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Retry helper with exponential backoff
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.ok) {
        return response;
      }
      
      // Handle rate limiting
      if (response.status === 429) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`Rate limited, waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // For 5xx errors, retry
      if (response.status >= 500) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`Server error ${response.status}, waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // For other errors, don't retry
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const waitTime = Math.pow(2, attempt) * 1000;
      console.log(`Network error, waiting ${waitTime}ms before retry...`, error);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { words, questionType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const results = [];

    for (const word of words) {
      let prompt = '';
      
      if (questionType === 'example') {
        prompt = `Create an example sentence for the English word "${word.word}". 
        The sentence should:
        - Be natural and commonly used
        - Show clear context for the word's meaning
        - Be at an intermediate English level
        - Replace the word with "______" (6 underscores)
        - MUST be entirely in English - do NOT include any Korean text, translations, or meanings
        - Do NOT include the Korean meaning "${word.meaning}" or any Korean characters anywhere in the sentence
        
        Return ONLY the English sentence with the blank, nothing else.`;
      } else if (questionType === 'definition') {
        prompt = `Create a clear English definition for the word "${word.word}".
        The definition should:
        - Be concise (1-2 sentences maximum)
        - Use simple, clear English
        - Not include the word itself
        - Be suitable for an intermediate English learner
        
        Return ONLY the definition, nothing else.`;
      }

      const response = await fetchWithRetry('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: [
            {
              role: 'system',
              content: 'You are an English teacher creating exam questions. Always respond with exactly what is requested, no explanations or extra text.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AI Gateway error for word "${word.word}":`, response.status, errorText);
        
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Payment required. Please add credits to continue." }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      const data = await response.json();
      const generatedContent = data.choices[0].message.content.trim();

      results.push({
        word: word.word,
        meaning: word.meaning,
        generatedContent,
        questionType
      });
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-exam-questions:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});