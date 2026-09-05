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
    console.log('Generating English definition...');
    
    const { word } = await req.json();
    
    if (!word) {
      return new Response(
        JSON.stringify({ error: 'Word is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Generating definition for word: ${word}`);

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
            content: `You are an English dictionary expert. Provide a clear, concise, and accurate English definition for the given word. The definition should be:
            - Written in simple English that intermediate learners can understand
            - 1-2 sentences long
            - Include the part of speech (noun, verb, adjective, etc.)
            - Focus on the most common meaning of the word
            - Be precise and educational
            
            Format: "(part of speech) definition"
            
            Example format: "(noun) a large African animal with a long trunk and big ears"
            
            Only provide the definition, nothing else.`
          },
          {
            role: 'user',
            content: `Define the word: ${word}`
          }
        ],
        temperature: 0.3,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    const definition = data.choices[0].message.content.trim();
    
    console.log(`Generated definition: ${definition}`);

    return new Response(JSON.stringify({ 
      word,
      definition 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-english-definition function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate definition',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});