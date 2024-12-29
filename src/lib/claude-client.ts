import { Anthropic } from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: localStorage.getItem("claude_api_key") || '',
  dangerouslyAllowBrowser: true // Enable browser usage
});