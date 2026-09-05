import { QuestionType } from "@/types/question";
import { getPromptForType } from "./questionTypes";
import { verifyGrammarQuestion } from "./grammar/verifyGrammarQuestion";
import { AnthropicClient } from "./ai/anthropicClient";
import { OpenAIClient } from "./ai/openaiClient";
import { DeepseekClient } from "./ai/deepseekClient";
import { AIClient } from "./grammar/types";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 second

async function retryWithExponentialBackoff<T>(
  operation: () => Promise<T>,
  retryCount: number = 0
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error.message.includes("529") || error.message.includes("overloaded")) {
      if (retryCount >= MAX_RETRIES) {
        throw new Error("서버가 과부하 상태입니다. 잠시 후 다시 시도해 주세요.");
      }
      
      const delayTime = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      console.log(`Retrying after ${delayTime}ms (attempt ${retryCount + 1} of ${MAX_RETRIES})`);
      await delay(delayTime);
      
      return retryWithExponentialBackoff(operation, retryCount + 1);
    }
    throw error;
  }
}

export const generateQuestion = async (type: QuestionType, text: string, difficulty: string = "1") => {
  try {
    const claudeApiKey = localStorage.getItem("claude_api_key");
    const gptApiKey = localStorage.getItem("gpt_api_key");
    const deepseekApiKey = localStorage.getItem("deepseek_api_key");
    
    if (!claudeApiKey && !gptApiKey && !deepseekApiKey) {
      throw new Error("API key not found. Please enter your API key in the settings.");
    }

    let client: AIClient;
    
    if (claudeApiKey) {
      client = new AnthropicClient({
        apiKey: claudeApiKey,
        model: "claude-3-sonnet-20240229"
      });
    } else if (gptApiKey) {
      client = new OpenAIClient({
        apiKey: gptApiKey,
        model: "gpt-4-turbo-preview"
      });
    } else {
      client = new DeepseekClient({
        apiKey: deepseekApiKey!,
        model: "deepseek-chat"
      });
    }

    let processedText = text;
    
    if (difficulty !== "1") {
      console.log(`Paraphrasing text with difficulty level ${difficulty}`);
      
      const paraphrasePrompt = difficulty === "2" 
        ? `Please partially paraphrase the following text in English, changing some words and sentences while maintaining the core meaning. Keep approximately 50% of the original text and paraphrase the rest. If the input is not in English, translate it to English first, then paraphrase:\n\n${text}`
        : `Please completely paraphrase the entire text in English while maintaining its core meaning and difficulty level. Change all sentences but keep the same concepts and complexity. If the input is not in English, translate it to English first, then paraphrase:\n\n${text}`;

      processedText = await retryWithExponentialBackoff(async () => {
        return await client.generateCompletion(paraphrasePrompt);
      });
      
      console.log('Text successfully paraphrased');
    }

    console.log('Generating question with processed text');
    const basePrompt = getPromptForType(type, processedText);
    
    let result = await retryWithExponentialBackoff(async () => {
      return await client.generateCompletion(basePrompt);
    });

    // For grammar questions, verify the text preservation and format
    if (type.id === "grammar") {
      result = await retryWithExponentialBackoff(async () => {
        const verification = verifyGrammarQuestion(processedText, result);
        if (!verification.isValid) {
          console.log(`Grammar verification failed: ${verification.error}`);
          return await client.generateCompletion(basePrompt);
        }
        return result;
      });
    }

    if (type.id === "weekendClinic") {
      return result.replace("[OUTPUT]\n\n", "");
    }

    return result;

  } catch (error) {
    console.error("Error generating question:", error);
    if (error.message.includes("529") || error.message.includes("overloaded")) {
      throw new Error("서버가 과부하 상태입니다. 잠시 후 다시 시도해 주세요.");
    }
    throw new Error("문제 생성 중 오류가 발생했습니다. 다시 시도해 주세요.");
  }
};