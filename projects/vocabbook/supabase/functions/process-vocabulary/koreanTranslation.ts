import { callClaudeAPI } from './claudeApi.ts';

async function getKoreanMeaning(word: string, retries = 3): Promise<string> {
  try {
    const response = await callClaudeAPI(
      `Translate this English word to Korean. Return ONLY the Korean translation, nothing else: "${word}"`,
      retries
    );
    const translation = response.content[0].text.trim();
    console.log(`Translation for ${word}: ${translation}`);
    return translation;
  } catch (error) {
    console.error('Error getting Korean meaning:', error);
    return `${word}의 뜻`;
  }
}

export { getKoreanMeaning };