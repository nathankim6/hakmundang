import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Implement rate limiting with a simple delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Keep track of last request timestamp
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 100; // Minimum 100ms between requests

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { word } = await req.json()
    
    if (!word) {
      return new Response(
        JSON.stringify({ error: 'Word is required' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    console.log('Fetching pronunciation for word:', word);

    // Implement request throttling
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
    }
    lastRequestTime = Date.now();

    // Implement retry logic with exponential backoff
    const maxRetries = 3;
    let retryCount = 0;
    let lastError = null;

    while (retryCount < maxRetries) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 100,
            messages: [{
              role: 'user',
              content: `Generate the IPA (International Phonetic Alphabet) pronunciation for this English word: "${word}". 
              Only return the IPA symbols between forward slashes, nothing else. For example: /wɜːd/`
            }]
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Claude API error (attempt ${retryCount + 1}):`, errorText);
          
          // Parse error response
          const errorData = JSON.parse(errorText);
          
          // Check if it's a rate limit error
          if (errorData?.error?.type === 'rate_limit_error') {
            const backoffTime = Math.pow(2, retryCount) * 1000; // Exponential backoff
            console.log(`Rate limit hit. Waiting ${backoffTime}ms before retry...`);
            await delay(backoffTime);
            retryCount++;
            lastError = new Error(`Rate limit error: ${errorData.error.message}`);
            continue;
          }
          
          throw new Error(`Failed to get pronunciation from Claude API: ${errorText}`);
        }

        const data = await response.json();
        console.log('Claude API response:', JSON.stringify(data, null, 2));
        
        if (!data || !data.content || !data.content[0] || !data.content[0].text) {
          console.error('Invalid response format from Claude API:', data);
          throw new Error('Invalid response format from Claude API');
        }

        // Extract only the IPA symbols between forward slashes
        const text = data.content[0].text.trim();
        const ipaMatch = text.match(/\/([^\/]+)\//);
        
        if (!ipaMatch) {
          console.error('No IPA pronunciation found in response:', text);
          throw new Error('Could not extract IPA pronunciation from response');
        }

        const pronunciation = ipaMatch[1];
        console.log('Pronunciation extracted:', pronunciation);

        return new Response(
          JSON.stringify({ pronunciation }),
          { 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        );
      } catch (error) {
        lastError = error;
        if (retryCount < maxRetries - 1) {
          const backoffTime = Math.pow(2, retryCount) * 1000;
          console.log(`Error occurred. Retrying in ${backoffTime}ms...`);
          await delay(backoffTime);
          retryCount++;
        } else {
          break;
        }
      }
    }

    // If we've exhausted all retries, throw the last error
    throw lastError || new Error('Failed to get pronunciation after all retries');
  } catch (error) {
    console.error('Error in get-pronunciation function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
