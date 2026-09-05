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
    console.log('Generating example sentence...');
    
    const { word, meaning, partOfSpeech } = await req.json();
    
    if (!word || !meaning) {
      return new Response(
        JSON.stringify({ error: 'Word and meaning are required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Generating example sentence for word: ${word}, meaning: ${meaning}, POS: ${partOfSpeech}`);

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
            content: `You are an English teacher creating example sentences for vocabulary learning. Create a clear, natural example sentence that:

1. Uses the target word in context in a way that clearly shows its meaning
2. Is appropriate for intermediate English learners (B1-B2 level)
3. Is 10-20 words long
4. Shows the word being used naturally in everyday or academic contexts
5. Makes the meaning of the word clear from context
6. Uses simple sentence structure that students can understand

The sentence should be educational and help students understand when and how to use the word correctly.

Only provide the example sentence, nothing else.`
          },
          {
            role: 'user',
            content: `Create an example sentence for the word "${word}" which means "${meaning}"${partOfSpeech ? ` and is a ${partOfSpeech}` : ''}.`
          }
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    const exampleSentence = data.choices[0].message.content.trim();
    
    console.log(`Generated example sentence: ${exampleSentence}`);

    return new Response(JSON.stringify({ 
      word,
      exampleSentence 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-example-sentence function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate example sentence',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});