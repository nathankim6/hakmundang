const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');

interface ClaudeResponse {
  content: Array<{text: string}>;
}

async function callClaudeAPI(prompt: string, retries = 5, delay = 2000): Promise<ClaudeResponse> {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempt ${i + 1} of ${retries} to call Claude API`);
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 4096,
          messages: [{
            role: 'user',
            content: prompt
          }],
        }),
      });

      if (!response.ok) {
        console.error(`Claude API error: ${response.status} on attempt ${i + 1}`);
        const errorBody = await response.text();
        console.error('Error response body:', errorBody);
        
        if (response.status === 429) {
          const waitTime = delay * Math.pow(2, i);
          console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        throw new Error(`Claude API error: ${response.status} - ${errorBody}`);
      }

      const data = await response.json();
      console.log('Successfully received response from Claude API');
      return data;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      
      if (i === retries - 1) {
        console.error('All retry attempts exhausted');
        throw new Error(`Claude API failed after ${retries} attempts: ${error.message}`);
      }
      
      const waitTime = delay * Math.pow(2, i);
      console.log(`Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  throw new Error('Max retries reached');
}

export { callClaudeAPI };