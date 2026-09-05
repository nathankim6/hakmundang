import { QuestionType } from "@/types/question";
import { getPromptForType } from "./questionTypes";
import { verifyGrammarQuestion } from "./grammar/verifyGrammarQuestion";
import { AnthropicClient } from "./ai/anthropicClient";
import { OpenAIClient } from "./ai/openaiClient";
import { DeepseekClient } from "./ai/deepseekClient";
import { AIClient } from "./grammar/types";
import { getOrderPrompt } from "./prompts/order";
import { supabase } from "@/integrations/supabase/client";

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

const generateGrammarWorkbookFromData = async (text: string) => {
  try {
    // Veritas Supabase Edge Function을 통해 New Veritas's Choice 오답 데이터 가져오기
    const { data: response, error } = await supabase.functions.invoke('get-veritas-grammar-data', {});

    if (error) {
      console.error('Error calling Veritas data function:', error);
      throw new Error('New Veritas\'s Choice 오답 데이터를 가져오는 중 오류가 발생했습니다.');
    }

    if (!response.success) {
      console.error('Veritas function returned error:', response.error);
      throw new Error('New Veritas\'s Choice 오답 데이터를 가져오는 중 오류가 발생했습니다.');
    }

    const incorrectOptions = response.data;

    if (!incorrectOptions || incorrectOptions.length === 0) {
      throw new Error('New Veritas\'s Choice 오답 데이터가 없습니다.');
    }

    // 문제 생성 - 텍스트 위치 순서대로 처리 (제한 없이 최대한 많이)
    let modifiedText = text;
    const answers: string[] = [];
    let questionNumber = 1;

    console.log(`🎯 New Veritas's Choice 기반 어법워크북 생성 시작`);
    console.log(`📖 원문 길이: ${text.length}자`);
    console.log(`📚 사용 가능한 오답 옵션: ${incorrectOptions.length}개`);

    // 모든 매칭 위치를 찾아서 정렬
    const allMatches: Array<{
      position: number;
      endPosition: number;
      matchedText: string; // 실제 텍스트에서 매칭된 단어
      incorrect_text: string;
      usage_count: number;
    }> = [];

    // 각 오답 옵션에 대해 텍스트에서 모든 매칭 위치 찾기
    for (const option of incorrectOptions) {
      const { correct_text, incorrect_text, usage_count } = option;
      
      // 정확한 매칭을 위한 정규식 (단어 경계 고려)
      const escapedText = correct_text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedText}\\b`, 'gi');
      
      let match;
      while ((match = regex.exec(text)) !== null) {
        allMatches.push({
          position: match.index,
          endPosition: match.index + match[0].length,
          matchedText: match[0], // 실제 텍스트에서 매칭된 단어 사용
          incorrect_text,
          usage_count
        });
      }
    }

    // 위치 순서대로 정렬 (텍스트 앞쪽부터)
    allMatches.sort((a, b) => a.position - b.position);

    console.log(`🔍 전체 매칭 발견: ${allMatches.length}개`);

    // 겹치지 않는 매칭만 선택하여 문제 생성
    const selectedMatches = [];
    let lastEndPosition = -1;

    for (const match of allMatches) {
      // 이전 매칭과 겹치지 않는지 확인
      if (match.position >= lastEndPosition) {
        selectedMatches.push(match);
        lastEndPosition = match.endPosition;
      }
    }

    console.log(`✅ 선택된 매칭: ${selectedMatches.length}개`);

    // 텍스트를 뒤에서부터 교체 (앞쪽 위치가 변경되지 않도록)
    let workingText = text;
    const reverseMatches = [...selectedMatches].reverse();
    
    for (let i = 0; i < reverseMatches.length; i++) {
      const match = reverseMatches[i];
      const questionNum = selectedMatches.length - i; // 원래 순서대로 번호 매기기
      
      const choicePattern = `(${questionNum})[${match.incorrect_text}/${match.matchedText}]`;
      
      // 텍스트 교체
      const beforeMatch = workingText.substring(0, match.position);
      const afterMatch = workingText.substring(match.endPosition);
      workingText = beforeMatch + choicePattern + afterMatch;
      
      console.log(`✅ 문제 ${questionNum}: "${match.matchedText}" → [${match.incorrect_text}/${match.matchedText}] (위치: ${match.position}, 사용빈도: ${match.usage_count})`);
    }

    // 정답 배열 생성 (순서대로) - 실제 매칭된 텍스트 사용
    for (let i = 0; i < selectedMatches.length; i++) {
      answers.push(selectedMatches[i].matchedText);
    }

    if (answers.length === 0) {
      throw new Error('생성 가능한 문제가 없습니다. 텍스트와 New Veritas\'s Choice 오답 데이터가 일치하지 않습니다.');
    }

    // 정답을 사용자 예시와 같은 형식으로 포맷팅
    const formattedAnswers = answers.map((answer, index) => `(${index + 1})${answer}`).join(' ');

    // 최종 결과 포맷팅 - 사용자 예시와 동일한 형식
    const result = `다음 중 어법상 옳은 것을 고르시오.
${workingText}

어법 정답
${formattedAnswers}`;

    console.log(`🎉 어법워크북 생성 완료: ${answers.length}개 문제`);
    return result;
  } catch (error) {
    console.error('Error generating grammar workbook:', error);
    throw error;
  }
};

export const generateQuestion = async (
  type: QuestionType, 
  text: string, 
  paraphraseLevel: string = "1", 
  complexity: string = "수능"
) => {
  try {
    // Debug logging to check the type structure
    console.log("Type object received:", type);
    console.log("Type ID:", type?.id);
    console.log("Type ID check result:", type?.id === "order");
    
    // Handle grammar workbook with Supabase data
    if (type?.id === "grammarWorkbook") {
      console.log("✅ Processing grammar workbook with Supabase data - bypassing AI completely");
      const result = await generateGrammarWorkbookFromData(text);
      console.log("✅ Grammar workbook generated successfully with Supabase data");
      return result;
    }
    
    // Handle order questions directly with JavaScript function - multiple checks for safety
    if (type?.id === "order" || (typeof type === 'object' && type !== null && 'id' in type && type.id === "order")) {
      console.log("✅ Processing order question with JavaScript function - bypassing AI completely");
      const result = getOrderPrompt(text);
      console.log("✅ Order question generated successfully with JavaScript");
      return result;
    }

    // Additional safety check for any string type that might be "order"
    if (typeof type === 'string' && type === "order") {
      console.log("✅ Processing order question (string type) with JavaScript function");
      return getOrderPrompt(text);
    }

    // If we reach here, it means it's not an order question, proceed with AI
    console.log("📝 Not an order question, proceeding with AI generation for type:", type?.id || type);

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
        model: "claude-sonnet-4-20250514"
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
    
    if (paraphraseLevel !== "1") {
      console.log(`Paraphrasing text with paraphrase level ${paraphraseLevel}`);
      
      const paraphrasePrompt = paraphraseLevel === "2" 
        ? `Please partially paraphrase the following text in English, changing some words and sentences while maintaining the core meaning. Keep approximately 50% of the original text and paraphrase the rest. If the input is not in English, translate it to English first, then paraphrase:\n\n${text}`
        : `Please completely paraphrase the entire text in English while maintaining its core meaning and difficulty level. Change all sentences but keep the same concepts and complexity. If the input is not in English, translate it to English first, then paraphrase:\n\n${text}`;

      processedText = await retryWithExponentialBackoff(async () => {
        return await client.generateCompletion(paraphrasePrompt);
      });
      
      console.log('Text successfully paraphrased');
    }

    console.log(`Generating question with complexity level: ${complexity}`);
    
    let complexityInstruction = "";
    if (complexity === "GRE") {
      complexityInstruction = "이 문제는 GRE 시험 수준의 최상급 난이도로 만들어야 합니다. 다음 가이드라인을 반드시 따라주세요:\n\n" +
                             "1. 어휘: 대학원생 수준의 최고급 학술 어휘와 전문 용어를 사용하세요. 어휘 난이도는 CEFR C2 이상 수준이어야 합니다. 특히 선택지에 사용되는 영어 어휘는 반드시 C2 이상의 고급 학술 어휘로 구성하고 길이도 충분히 길게 작성하세요.\n" +
                             "2. 문장 구조: 복잡한 중첩 구문, 학술적 수사법, 정교한 조건문, 각주와 인용이 포함된 복잡한 구조를 사용하세요. 선택지는 단순한 문장이 아닌 복잡하고 긴 문장으로 구성하세요.\n" +
                             "3. 추론 수준: 고도의 논리적 사고, 복잡한 암시적 내용 파악, 미묘한 함의 분석, 반론 구성이 필요한 문제를 만드세요. 단순한 사실 확인이 아닌 깊은 분석적 사고를 요구해야 합니다.\n" +
                             "4. 선택지: 모든 선지가 정답처럼 보이며 매우 유사하고 구분이 어려운 선택지로 구성하세요. 선택지 간의 차이가 매우 미묘해야 하고, 각 선택지는 길고 복잡하게 작성하여 판별이 극도로 어렵게 만드세요.\n" +
                             "5. 주제: 철학, 과학 이론, 문학 비평, 경제 이론과 같은 추상적이고 학술적인 주제를 다루세요.\n" +
                             "6. 중요: 지문 자체는 변형하지 말고, 선택지와 설명만 위 기준에 맞게 어렵게 구성하세요. 각 선택지는 최소 2-3줄 이상의 길이로 작성하여 복잡도를 높이세요.\n" +
                             "7. 반드시 각 문제 유형의 프롬프트에 제시된 예시와 형식을 정확히 따라야 합니다. 선택지가 영어로 제시되어야 하는 유형과 한국어로 제시되어야 하는 유형을 구분하여 출력하세요.";
    } else if (complexity === "토플") {
      complexityInstruction = "이 문제는 TOEFL 시험 수준의 중상급 난이도로 만들어야 합니다. 다음 가이드라인을 반드시 따라주세요:\n\n" +
                             "1. 어휘: 대학 수준의 학술적 어휘와 다양한 의미를 가진 단어들을 사용하세요. 어휘 난이도는 CEFR C1 수준이어야 합니다. 특히 선택지에 사용되는 영어 어휘는 반드시 C1 수준으로 구성하세요.\n" +
                             "2. 문장 구조: 완료시제, 수동태, 가정법 등 다양한 문법 구조를 사용하세요.\n" +
                             "3. 추론 수준: 단순 정보 확인을 넘어 암시, 의도, 함축된 의미를 파악하는 추론 능력을 요구하는 문제를 만드세요.\n" +
                             "4. 선택지: 다소 매력적인 오답을 포함하여 깊은 이해력을 테스트하세요. 정답과 오답의 구분에 주의 깊은 분석이 필요해야 합니다.\n" +
                             "5. 중요: 지문 자체는 변형하지 말고, 선택지와 설명만 위 기준에 맞게 구성하세요.\n" +
                             "6. 반드시 각 문제 유형의 프롬프트에 제시된 예시와 형식을 정확히 따라야 합니다. 선택지가 영어로 제시되어야 하는 유형과 한국어로 제시되어야 하는 유형을 구분하여 출력하세요.";
    } else { // "수능" 기본값
      complexityInstruction = "이 문제는 한국 수능 영어 수준의 기본 난이도로 만들어야 합니다. 다음 가이드라인을 반드시 따라주세요:\n\n" +
                             "1. 어휘: 고등학교 영어 과정에서 배우는 명확하고 기본적인 어휘를 사용하세요. 어휘 난이도는 CEFR B1 수준이어야 합니다. 특히 선택지에 사용되는 영어 어휘는 반드시 B1 수준으로 구성하세요.\n" +
                             "2. 문장 구조: 간결하고 명확한 문법 구조를 사용하세요.\n" +
                             "3. 추론 수준: 주로 직접적인 정보 확인과 기초적인 추론 능력을 테스트하는 문제로 구성하세요. 고급 비판적 사고나 특수 지식은 요구하지 마세요.\n" +
                             "4. 선택지: 정답과 오답 사이에 명확한 구분이 있어야 합니다. 선택지는 단순 명료해야 합니다.\n" +
                             "5. 중요: 지문 자체는 변형하지 말고, 선택지와 설명만 위 기준에 맞게 구성하세요.\n" +
                             "6. 반드시 각 문제 유형의 프롬프트에 제시된 예시와 형식을 정확히 따라야 합니다. 선택지가 영어로 제시되어야 하는 유형과 한국어로 제시되어야 하는 유형을 구분하여 출력하세요.";
    }
    
    const basePrompt = getPromptForType(type, processedText);
    
    const strictFormatInstructions = `
다음 지시사항을 엄격히 준수하세요:

1. 프롬프트에서 제공된 형식과 예시를 정확히 따라야 합니다.
2. 선택지의 언어는 문제 유형마다 다릅니다:
   - 다음 유형은 반드시 영어 선택지로 제공: topic, title, blank, blankMultiple, contentMatch, contentMismatch, vocabulary, implication
   - 다음 유형은 반드시 한글 선택지로 제공: mainPoint(한글), purpose(한글), claim(한글)
   - 각 유형의 예시에 나온 언어 형식을 정확히 준수하세요
3. 문제 설명과 해설은 각 유형의 예시와 동일한 언어로 제공하세요.
4. 선택지 형식(번호, 괄호, 마침표 등)을 정확히 예시와 일치시키세요.
5. 지문 자체는 변경하지 말고 그대로 사용하세요.
6. 출력 형식의 모든 섹션을 빠짐없이 포함하세요.

위 지침을 엄격히 따르지 않으면 문제가 제대로 생성되지 않을 수 있습니다.
`;

    const finalPrompt = strictFormatInstructions + "\n\n" + complexityInstruction + "\n\n" + basePrompt;
    
    console.log("Final prompt structure (beginning):", finalPrompt.substring(0, 200) + "...");
    
    let result = await retryWithExponentialBackoff(async () => {
      return await client.generateCompletion(finalPrompt);
    });

    if (type.id === "contentMismatch") {
      if (!result.includes("① ") || !result.match(/①.*[a-zA-Z]/)) {
        console.log("Regenerating contentMismatch question to ensure English options");
        
        const enforcedPrompt = `${strictFormatInstructions}
        
특별 지시사항: 내용불일치 문제는 반드시 다음 형식을 따라야 합니다:
1. 문제 제목: "다음의 내용과 일치하지 않는 것을 고르시오."
2. 원본 영어 텍스트를 그대로 제시
3. 5개의 영어 선택지 (①~⑤)
4. 정답은 항상 ④번으로 설정
5. 정답 설명 및 한국어 번역 제공

아래 예시 형식을 정확히 따르세요:

다음의 내용과 일치하지 않는 것을 고르시오.

[영어 원문 텍스트]

① [영어 선택지1]
② [영어 선택지2]
③ [영어 선택지3]
④ [영어 선택지4 - 정답(일치하지 않는 내용)]
⑤ [영어 선택지5]

[정답] ④

[해설]
④번 선택지는 "[내용]"이라고 했는데, 지문에서는 "[실제 내용]"이라고 언급했으므로 지문의 내용과 일치하지 않습니다.

[보기 해석]
① [첫 번째 선택지 한국어 번역]
② [두 번째 선택지 한국어 번역]
③ [세 번째 선택지 한국어 번역]
④ [네 번째 선택지 한국어 번역]
⑤ [다섯 번째 선택지 한국어 번역]

${basePrompt}`;

        result = await retryWithExponentialBackoff(async () => {
          return await client.generateCompletion(enforcedPrompt);
        });
      }
    } else if (type.id === "blank" || type.id === "blankMultiple") {
      if (!result.includes("① ") || !result.match(/①.*[a-zA-Z]/)) {
        console.log("Regenerating blank question to ensure English options");
        
        const enforcedPrompt = `${strictFormatInstructions}
        
특별 지시사항: 빈칸 문제는 반드시 다음 형식을 따라야 합니다:
1. 문제 제목: "다음 빈칸에 들어갈 말로 가장 적절한 것을 고르시오."
2. 빈칸이 포함된 원본 영어 텍스트 제시
3. 5개의 영어 선택지 (①~⑤)
4. 정답 및 해설 제공

선택지는 반드시 영어로 작성해야 합니다.

${basePrompt}`;

        result = await retryWithExponentialBackoff(async () => {
          return await client.generateCompletion(enforcedPrompt);
        });
      }
    } else if (type.id === "mainPoint") {
      if (!result.includes("① ") || !result.match(/①.*[ㄱ-ㅎㅏ-ㅣ가-힣]/)) {
        console.log("Regenerating mainPoint question to ensure Korean options");
        
        const enforcedPrompt = `${strictFormatInstructions}
        
특별 지시사항: 요지 문제는 반드시 다음 형식을 따라야 합니다:
1. 문제 제목: "다음 글의 요지로 가장 적절한 것은?"
2. 원본 영어 텍스트를 그대로 제시
3. 5개의 한글 선택지 (①~⑤)
4. 정답 및 한글 해설 제공

선택지는 반드시 한글로 작성해야 합니다.

${basePrompt}`;

        result = await retryWithExponentialBackoff(async () => {
          return await client.generateCompletion(enforcedPrompt);
        });
      }
    }

    if (type.id === "grammar") {
      result = await verifyGrammarQuestion(client, result);
    }
    
    return result;
  } catch (error) {
    console.error("Error generating question:", error);
    throw error;
  }
};
