export const getSynonymAntonymPrompt = (text: string) => `지문을 입력하면 다음과 같은 형식으로 중요 단어를 분석하여 표로 제공:
빈도수, 중요도 기준 20-25개 단어 선택
알파벳순 정렬
각 단어의 한글 의미
유의어 2-3개 (한글 의미 괄호)
반의어 2개 (한글 의미 괄호)
[표 형식]
Word	Meaning	Synonyms	Antonyms
digital	디지털의	electronic(전자의), computerized(전산화된)	analog(아날로그의), manual(수동의)

위의 형식으로 다음 지문에 대한 단어 분석을 제공해주세요:

${text}`;