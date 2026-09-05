export interface GrammarVerificationResult {
  isValid: boolean;
  error?: string;
}

export interface AIClientConfig {
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIClient {
  generateCompletion: (prompt: string) => Promise<string>;
}