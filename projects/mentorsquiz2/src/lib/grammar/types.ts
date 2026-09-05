
export interface GrammarVerificationResult {
  isValid: boolean;
  error?: string;
  correctedQuestion?: string;  // Adding this field to store the fixed question
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
