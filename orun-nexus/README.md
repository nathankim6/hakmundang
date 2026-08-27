# ORUN NEXUS UNIVERSE

옳은영어 커리큘럼 유니버스 — **한 하늘에 뜬 다섯 Galaxy**.

| Galaxy | 내용 | 교재 | 단원 노드 |
|---|---|---|---|
| **VOCAB** (보카 Galaxy) | 옳은보카 0–8 + Ultimate (표지 라인 기준, DAY가 세부 유닛) | 10권 | 482 DAY |
| **GRAMMAR** (문법 Galaxy) | 기존 ORUN METABOOK NEXUS 전체 (시험지 478종 포함) | 11권 | 478 UNIT |
| **SYNTAX** (구문 Galaxy) | ORUN WEEKLY VOL.1 · 옳은영어 주간지 for Top/고1 | 1권 | 20 WEEK |
| **USAGE** (어법 Galaxy) | ORUN USAGE 옳은 어법 (36차시 · 360문항) | 1권 | 36 ROUND |
| **READING** (독해 Galaxy) | READING GRAPHY Level 1–4 + 옳은 독해 Level 3 | 5권 | 168 UNIT |

배치는 학습 순서를 따른 대칭 피라미드다 — 아랫줄에 VOCAB · GRAMMAR · READING,
그 사이 위쪽에 SYNTAX · USAGE. 다섯 Galaxy는 카메라에서 같은 깊이에 놓여
화면 배율이 완전히 같다(0.5319).

각 Galaxy 중심에는 옳은영어 등대가 서고, 등대 머리 위에 Orbitron 이름판
(VOCAB · GRAMMAR · SYNTAX · USAGE · READING)이 떠 있다. 이름판이나 Galaxy
원반을 클릭하면 그 Galaxy로 들어가고, ESC 또는 [우주로] 버튼으로 우주 화면에
돌아온다. 활성 Galaxy 안에서는 기존 넥서스와 동일하게 동작한다 — 교재 →
챕터/PART/PHASE/BLOCK → 유닛/DAY/WEEK/ROUND 전개, 학년 필터, 차등 커리큘럼,
시험지 발행(Word · PDF · 인쇄).

## 파일

- `ORUN_NEXUS_UNIVERSE.html` — **완성본. 이 파일 하나만 열면 된다.**
- `build.py` — 아래 소스를 완성본 하나로 조립한다.
- `src/head.html` · `src/body.html` · `src/engine.js` — 화면과 엔진.
- `data/grammar.json` — 문법 Galaxy 데이터 (원본 넥서스에서 그대로 추출, 생성기 없음).
- `data/vocab.json` ← `data/gen_vocab.py` — 보카 Galaxy 데이터.
- `data/syntax.json` ← `data/gen_syntax.py` — 구문(ORUN WEEKLY) Galaxy 데이터.
- `data/usage.json` ← `data/gen_usage.py` — 어법(ORUN USAGE) Galaxy 데이터.
- `data/reading.json` ← `data/gen_reading.py` — 독해 Galaxy 데이터.

## 다시 빌드하기

```bash
cd orun-nexus
python3 data/gen_vocab.py      # 보카 데이터 수정 시
python3 data/gen_syntax.py     # 주간지 데이터 수정 시
python3 data/gen_usage.py      # 어법 데이터 수정 시
python3 data/gen_reading.py    # 독해 데이터 수정 시
python3 build.py               # ORUN_NEXUS_UNIVERSE.html 재조립
```

## 데이터 상태 (2026-08 기준)

- **문법**: 원본 그대로 — 478 유닛 전부 시험지 연결.
- **보카**: 책 라인(권·부제·DAY 수·표지 색)은 표지 PDF 확정값.
  PART(DAY 5일 묶음, Ultimate는 6일)는 목차 연동 전 **잠정안**
  (`confidence:"draft"`, 지도에서 "목차 잠정안" 칩으로 표시).
  샘플 시험지 2종: 옳은보카 0 DAY 01, 옳은보카 3 DAY 01 (DAILY TEST + VOCA CHECK).
- **구문(ORUN WEEKLY)**: 표지·목차·주차별 첫 장·문장 지면의 어법 이름표·권말
  정답지까지 실물 8개 PDF(750면)에서 확인한 **확정값**. 20주 · 1,921문장 ·
  주마다 100문장, 문장마다 어법 오류 하나. 주차별 어법 종수가 28 → 23 → 21 →
  17 → 16 → 14 → 12 → 12 → 11 → 9 → 5 → 1 로 좁아지는 깔때기가 이 교재의 설계다.
  16–20주차는 목차·정답지에만 있고 본문 면을 받지 못해 어휘 수가 비어 있다.
  PHASE 4구분(전 영역 스캔 / 빈출 압축 / 핵심 집중 / 실전 마무리)은 교재에
  인쇄된 것이 아니라 그 깔때기의 마디를 따라 지도용으로 나눈 것이다.
  샘플 시험지 1종: WEEK 01 (SLASH NOTE + WEEKLY SET, 문장·정답 모두 실물).
- **어법(ORUN USAGE)**: 36차시 · 360문항(차시당 밑줄형 5 + 선택형 5)과 표지·
  본문 문구는 실물 확정. ROUND 여섯씩 묶은 BLOCK 구분은 교재에 없는, 지도
  항해를 위한 구분이다. 샘플 시험지 1종: ROUND 01 (REASON NOTE + USAGE SET).
- **독해**: 유닛 수·풀/축약 구성(36지문 = 풀 12 + 축약 24)은 교재 사양,
  지문 제목은 실제 지문 연동 전 **잠정안**. 소재 트랙 6종이 Level 1–4를
  가로질러 이어진다(차등 커리큘럼 패널). 샘플 유닛 1종: Level 1 UNIT 01
  The Bread Bus (READ RIGHT + READING CHECK, 지문 자체 제작).

시험지를 늘리려면 각 Galaxy의 `worksheets`에 유닛 id 키로
`{source, baekji:{chapter, sections[]}, popquiz:{chapter, questions[], answerKey[]}}`
형태를 추가하면 된다 — 형식은 문법 Galaxy의 기존 478종과 동일하다.
