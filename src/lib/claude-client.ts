import { Anthropic } from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_CLAUDE_API_KEY,
});