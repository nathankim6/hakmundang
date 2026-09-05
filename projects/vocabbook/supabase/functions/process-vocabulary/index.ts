import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callClaudeAPI } from './claudeApi.ts';
import { getKoreanMeaning } from './koreanTranslation.ts';

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
    console.log('Processing vocabulary request...');
    const { inputText } = await req.json();
    
    if (!inputText?.trim()) {
      console.error('Empty input text received');
      return new Response(
        JSON.stringify({ error: 'Input text is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Calling Claude API with input:', inputText.substring(0, 100) + '...');
    const prompt = `You are a vocabulary expert. Analyze the given text and create vocabulary cards.

For each word, provide:
1. Difficulty level (1-3 stars)
2. Part of speech in Korean (품사)
3. Korean meaning (표제어뜻)
4. English definition (영영정의)
5. EXACTLY 3 synonyms with their Korean meanings (only include CEFR A2-B2 level words)
6. EXACTLY 3 antonyms with their Korean meanings (only include CEFR A2-B2 level words)

IMPORTANT RULES FOR VERBS:
1. For any verb forms (participles, gerunds), use ONLY the base/infinitive form as the headword (표제어)
2. For synonyms and antonyms of verbs, also use ONLY their base/infinitive forms
Example:
- If encountering "running", use "run" as the headword
- If encountering "broken", use "break" as the headword
- For synonyms/antonyms, use forms like "walk" instead of "walking", "stop" instead of "stopped"

If there aren't enough suitable synonyms or antonyms, you can leave them empty.
If you find fewer than 16 important words, add more relevant words to reach exactly 16.
If there are more than 16 important words, select the 16 most crucial ones.

Return ONLY a valid JSON object with this structure, no other text:
{
  "title": "",
  "words": [
    {
      "표제어": string,
      "품사": string,
      "난이도": number,
      "표제어뜻": string,
      "영영정의": string,
      "동의어": string[],
      "동의어뜻": string[],
      "반의어": string[],
      "반의어뜻": string[]
    }
  ]
}

Input text: ${inputText}`;

    const claudeResponse = await callClaudeAPI(prompt);
    console.log('Received response from Claude API');

    if (!claudeResponse.content || !claudeResponse.content[0] || !claudeResponse.content[0].text) {
      console.error('Invalid response format from Claude API:', claudeResponse);
      throw new Error('Invalid response format from Claude API');
    }

    const content = claudeResponse.content[0].text;
    console.log('Raw content from Claude:', content.substring(0, 100) + '...');

    // Clean up the response to ensure it's valid JSON
    const cleanedContent = content.trim()
      .replace(/^```json/g, '')
      .replace(/```$/g, '')
      .trim();

    console.log('Cleaned content:', cleanedContent.substring(0, 100) + '...');

    try {
      let parsedData = JSON.parse(cleanedContent);
      console.log('Successfully parsed JSON data');

      // Validate the structure
      if (!parsedData || typeof parsedData !== 'object') {
        throw new Error('Invalid response: not an object');
      }
      if (!Array.isArray(parsedData.words)) {
        throw new Error('Invalid response: words must be an array');
      }

      // Ensure exactly 16 words
      while (parsedData.words.length < 16) {
        const lastWord = { ...parsedData.words[parsedData.words.length - 1] };
        parsedData.words.push(lastWord);
      }
      if (parsedData.words.length > 16) {
        console.warn(`Truncating words array from ${parsedData.words.length} to 16`);
        parsedData.words = parsedData.words.slice(0, 16);
      }

      return new Response(
        JSON.stringify(parsedData),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Failed content:', cleanedContent);
      throw new Error(`Failed to parse Claude response: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Error in process-vocabulary function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});