export const getOrderWritingPrompt = (text: string) => {
  // Check if there's any text marked with square brackets
  const bracketMatch = text.match(/\[(.*?)\]/);
  if (!bracketMatch) {
    return `[INPUT] 텍스트에서 주제문 또는 글의 핵심 요지와 관련된 문장을 [대괄호]로 감싸주세요.
예: Many people argue that [Color is created when the brain interprets light].`;
  }

  // Extract the sentence inside brackets
  const targetSentence = bracketMatch[1];

  // Remove the brackets and replace with blank
  const processedText = text.replace(/\[(.*?)\]/, '_'.repeat(23));

  // Generate word list from the target sentence
  const words = targetSentence
    .replace(/[.,;!?]/, '')  // Remove punctuation
    .split(' ')
    .filter(word => word.trim() !== '');  // Remove empty strings

  // Shuffle the words for the condition
  const shuffledWords = [...words].sort(() => Math.random() - 0.5);

  return `[OUTPUT]
다음 글을 읽고, 빈칸을 주어진 조건에 맞게 완성하시오.

${processedText}

[조건]
(1) 빈칸을 완성하는 데 필요한 단어 수: ${words.length}개
(2) 반드시 포함되어야 할 단어 목록 (각 단어는 1회만 사용 가능): ${shuffledWords.join(' / ')}

[정답] ${targetSentence}`;
};