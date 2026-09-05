# READ RIGHT 전 문장 표기 데이터 (rr/uNN.js) 작성 규칙

`rr/uNN.js` 는 `module.exports = { "46": [ 문장1토큰, …, 문장15토큰 ], "47": [...], … }` 를 내보낸다.
레슨 번호는 `units/uNN.js` 의 `no` 문자열과 같아야 한다. 각 문장은 `[[텍스트, 역할], …]` 배열이다.

## 역할 값 (build.js 의 ORUN FLOW 렌더링과 1:1)
| 역할 | 뜻 | 인쇄 모양 |
|---|---|---|
| `"s"`  | 주절 주어 | 초록 밑줄 + S |
| `"v"`  | 주절 본동사 (한 덩어리) | △ 를 글자 위에 + V |
| `"c"`  | 접속사 · 관계사 · 접속사 구실을 하는 말 | 골드 네모 |
| `"s2"` | 종속절 주어 | 초록 밑줄 + S′ |
| `"v2"` | 종속절 동사 (한 덩어리) | △ + V′ |
| `"m"`  | 수식어(구) — 전치사구 · 부사(구) · 분사구 · 부사적 to부정사 · 동격·삽입 부사구 | 회색 밑줄 + M |
| `null` | 표시하지 않는 것 — 목적어 · 보어 · 명사절 본체 · 기타 | 그냥 글자 |

## 절대 규칙
1. **토큰을 공백 하나로 이으면 원문과 글자까지 똑같아야 한다.** `rrcheck.js` 가 검사한다.
   쉼표·마침표·콜론·세미콜론은 **앞 토큰에 붙인다** (`"heat,"`, `"the same score."`). 구두점만 있는 토큰은 금지.
2. 동사는 **한 덩어리**: 조동사+동사 · have/has/had+p.p · be+p.p · be+~ing · `has quietly moved` 처럼 사이에 낀 부사까지 한 토큰.
   `is not` · `cannot stay` · `would not last` · `has been found` 도 한 토큰.  `stops sounding`, `keeps feeding` 은 `stops`/`keeps` 만 v 로 두고 뒤는 null.
3. 명사구는 **통째로 한 토큰**: `"the risk of a slow quarter"`, `"a small family of goods"`. 잘게 쪼개지 않는다.
   주어가 긴 명사구면 그 전체가 `"s"` 한 토큰 (`"Studies of legislative influence"` → s).  다만 주어를 꾸미는 **분사구·관계절·전치사구는 떼어** 각각 m / c+v2 … 로 표시한다.
4. 접속사·관계사는 **단독 토큰** `"c"`: that, because, when, while, where, if, whether, since, as, so, and/but(절을 이을 때만), which, who, whose, the moment, long after, rather than(절), what/how/why 절을 이끄는 말은 명사절이면 **null 덩어리** 안에 둔다 (예: `"what our own thin blanket does here"` 전체 null).
   관계대명사가 종속절의 주어일 때는 `"c"` 만 두고 s2 는 없다 (`["villages",null],["that","c"],["solved","v2"],["this",null]`).
   whose 절도 같은 방식 (`["whose rules","c"]` 은 안 됨 → `["whose","c"],["rules","s2"],["were never explained","v2"]`).
5. 종속절 안의 주어·동사는 s2 · v2. 등위접속된 **두 번째 주절**은 다시 s · v.
   `You were hired, you stayed, and the firm carried …` → s v · s v · [and] s v.
6. 목적어·보어는 null. `It is a headline` → `["a headline",null]`.  `to be informative` 같은 to부정사 보어도 null.
7. 부사구·전치사구·분사구는 m: `"for most of the twentieth century,"`, `"in the amounts they need."`, `"built around cure"`, `"Unbundled,"`, `"To learn how pain works,"`.
   문장 끝 마침표는 마지막 토큰에 붙는다 (역할이 m 이든 null 이든).
8. 명령문의 동사는 v (주어 없음).  `There is/are` 구문은 `["There",null],["is","v"],…`.
9. 문장당 v 가 최소 하나. s2 가 있으면 v2 도 있어야 한다.

## 예시 (units 파일의 `fl.model.toks` 와 같은 방식)
- `The cost is that the risk has quietly moved from the firm to the individual.`
  `[["The cost","s"],["is","v"],["that","c"],["the risk","s2"],["has quietly moved","v2"],["from the firm to the individual.","m"]]`
- `Prices ending in nine survive because the eye reads the first digit and moves on.`
  `[["Prices","s"],["ending in nine","m"],["survive","v"],["because","c"],["the eye","s2"],["reads","v2"],["the first digit",null],["and","c"],["moves on.","v2"]]`
- `Critics answer that the shopper is playing a game whose rules were never explained.`
  `[["Critics","s"],["answer","v"],["that","c"],["the shopper","s2"],["is playing","v2"],["a game",null],["whose","c"],["rules","s2"],["were never explained.","v2"]]`
- `It stops sounding simple the moment you try to write it as one number.`
  `[["It","s"],["stops","v"],["sounding simple",null],["the moment","c"],["you","s2"],["try","v2"],["to write it",null],["as one number.","m"]]`
- `Meanwhile the same physics explains what our own thin blanket does here.`
  `[["Meanwhile","m"],["the same physics","s"],["explains","v"],["what our own thin blanket does here.",null]]`
- `A luxury that everyone can afford stops performing the job it was bought for.`
  `[["A luxury","s"],["that","c"],["everyone","s2"],["can afford","v2"],["stops","v"],["performing the job it was bought for.",null]]`

## 작업 순서
1. `units/uNN.js` 의 각 레슨 `sent[15]` 를 그대로 복사해 토큰으로 자른다 (철자·구두점 변경 금지).
2. 각 레슨의 `fl.model.toks` 와 `fl.drill[].ans` 를 참고해 같은 분석이 되게 한다 (model 토큰은 마침표가 빠져 있으니 rr 에서는 붙인다).
3. `node rrcheck.js NN` 이 "규격 통과" 를 낼 때까지 고친다.
