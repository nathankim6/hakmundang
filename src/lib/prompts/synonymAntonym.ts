export const getSynonymAntonymPrompt = (text: string) => `당신은 영어 지문을 분석하여 중요 단어의 유의어와 반의어를 찾아내는 전문가입니다. 다음 규칙에 따라 단어 목록을 만들어주세요:

분석 기준:
- 빈도수와 중요도를 고려하여 20-25개의 단어 선택
- 알파벳 순으로 정렬
- 다양한 품사(명사, 동사, 형용사, 부사 등) 포함
- 학습 가치가 높은 단어 위주로 선정

출력 형식:
[OUTPUT]
Word	Meaning	Synonyms/Antonyms

각 행은 다음 요소를 포함:
1. Word: 원문에서 선택된 단어
2. Meaning: 한글 의미
3. Synonyms/Antonyms: 유의어 2-3개(한글 의미)와 반의어 2개(↔ 기호 사용, 한글 의미)

예시:
digital	디지털의	electronic(전자의), computerized(전산화된) ↔ analog(아날로그의), manual(수동의)

위의 예시와 같은 형식으로 다음 지문에 대한 단어 분석을 제공해주세요:

${text}`;