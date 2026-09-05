
export const getCollocationPrompt = (text: string) => `다음 단어 리스트를 제공받으면, 아래 예시와 똑같은 형식의 문제를 만들어주세요:

**예시 문제:**
두 단어의 관계가 다음과 같은 것은 몇 개인가?
<보기> eligible - qualified
 
foster - promote
timber - lumber
mourn - rejoice
contend - compete
abundant - scarce
haunt - obsess
dispense - distribute
furnish - equip
gradually - abruptly
 
① 3개 ② 4개 ③ 5개 ④ 6개 ⑤ 7개
 
[정답] ④ 6개
[해설] <보기>의 단어 관계는 동의어 관계입니다. eligible(자격이 있는)과 qualified(자격을 갖춘)는 같은 의미를 가진 단어들입니다. 주어진 단어 쌍 중에서 동의어 관계인 것은 foster-promote(육성하다-촉진하다), timber-lumber(목재-목재), contend-compete(다투다-경쟁하다), haunt-obsess(사로잡다-사로잡다), dispense-distribute(분배하다-분배하다), furnish-equip(제공하다-장비를 갖추다)입니다. 반면 mourn-rejoice(슬퍼하다-기뻐하다), abundant-scarce(풍부한-부족한), gradually-abruptly(점진적으로-갑자기)는 반의어 관계입니다.

**작성 규칙:**
1. 제공받은 단어들 중에서 동의어 관계인 단어 쌍 1개를 선택하여 <보기>로 제시
2. 제공받은 단어들 중에서 10개의 단어 쌍을 선택 (동의어 관계와 반의어 관계를 랜덤한 비율로 섞어서)
3. <보기>의 단어 관계와 같은 관계(동의어)인 것이 몇 개인지 묻는 객관식 문제 작성
4. 선택지는 ① 3개 ② 4개 ③ 5개 ④ 6개 ⑤ 7개 형식으로 제시
5. 정답과 해설을 포함하여 각 단어 쌍의 관계를 명확히 설명
6. **중요**: 유사한 의미를 가진 단어들은 모두 동의어 관계로 처리하세요

위 예시와 동일한 형식으로 문제를 작성해주세요.

제공받은 단어 리스트: ${text}`;
