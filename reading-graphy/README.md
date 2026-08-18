# 옳은영어 READING GRAPHY — 중등 독해 교재 1~4권

옳은영어(ORUN ENGLISH) `orun-reading-prep` 스킬로 제작한 중등 독해 교재 4권의 유닛 소스.

## 구성

권마다 지문 36개 · **324면**:

| 구분 | 대상 지문 | 본문 | 해설 |
|---|---|---|---|
| 풀 유닛 | 1, 4, 7, …, 34 (12개) | 10면 | 3면 |
| 축약 유닛 | 나머지 (24개) | 5면 | 2면 |

해설은 책 맨 뒤에 전 유닛을 몰아서 싣는다. 유닛마다 독립된 Word 섹션이라
첫 면 머리글 없음·유닛별 바닥글이 적용되고 쪽번호는 책 전체에서 이어진다.

- **풀 유닛**: 독해 4문항 → 핵심구문·ORUN FLOW 구문분석 → 한 줄 해석 →
  READ RIGHT 5단계(소재·핵심어 / 흐름 / 주제문 / 요약 / 같은 뜻) + Knowledge Bank →
  RE:RIGHT 워크북 R1~R7
- **축약 유닛**: 독해 4문항 → 구문 → 한 줄 해석 → STEP 1 → 워크북 R1·R2

레벨은 권 번호와 같다(1권 = Level 1 … 4권 = Level 4).

## 폴더

```
rg1/ rg2/ rg3/ rg4/
  units/unitNN.js     유닛 모듈 (render / renderExplain)
  assets/             유닛 배너 PNG, 풀 유닛 Knowledge Bank 도식 PNG
AUTHORING.md          유닛 저작 지침 (문장 수별 레이아웃 조정표 · 해설 분량 가드 포함)
check_unit.js         유닛 스모크 테스트 (모듈 필드 · 자산 · 실제 렌더 검증)
build_book.sh         빌드 + 오토핏 (면수가 어긋나면 직전 값으로 자동 롤백)
```

## 빌드

스킬 폴더(`orun-reading-prep`)의 `scripts/`·`assets/`를 책 폴더에 복사하고
`npm install docx`, 폰트 설치 후:

```bash
node check_unit.js rgN/units/unitNN.js full|short   # 유닛 단위 검증
bash build_book.sh rgN 3                            # 책 빌드 (baseline → 오토핏 3회)
```

`build_book.sh`는 오토핏 전 baseline 면수가 324인지 먼저 확인하고,
오토핏이 여백을 과하게 넣어 면수가 어긋나면 직전 상태로 되돌린 뒤 정상 판본으로 마감한다.
