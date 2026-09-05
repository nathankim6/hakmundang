import OpenAI from "openai";
import { AIClient, AIClientConfig } from "../grammar/types";

export class OpenAIClient implements AIClient {
  private client: OpenAI;
  private config: AIClientConfig;

  constructor(config: AIClientConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      dangerouslyAllowBrowser: true
    });
    this.config = config;
  }

  async generateCompletion(prompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.config.model,
      messages: [{
        role: "user",
        content: prompt
      }],
      temperature: this.config.temperature || 0.7,
      max_tokens: this.config.maxTokens || 1000,
    });

    if (!response.choices[0]?.message?.content) {
      throw new Error("Invalid response format from GPT API");
    }

    return response.choices[0].message.content;
  }
}