# ORUN NEXUS UNIVERSE

옳은영어 커리큘럼 유니버스 — **한 하늘에 뜬 세 은하**.

| 은하 | 내용 | 교재 | 단원 노드 |
|---|---|---|---|
| **GRAMMAR** (문법 은하) | 기존 ORUN METABOOK NEXUS 전체 (시험지 478종 포함) | 11권 | 478 UNIT |
| **READING** (독해 은하) | READING GRAPHY Level 1–4 + 옳은 독해 Level 3 | 5권 | 168 UNIT |
| **VOCAB** (보카 은하) | 옳은보카 0–8 + Ultimate (표지 라인 기준, DAY가 세부 유닛) | 10권 | 482 DAY |

각 은하 중심에는 옳은영어 등대가 서고, 등대 머리 위에 Orbitron 이름판
(GRAMMAR · READING · VOCAB)이 떠 있다. 이름판이나 은하 원반을 클릭하면
그 은하로 들어가고, ESC 또는 [우주로] 버튼으로 우주 화면에 돌아온다.
활성 은하 안에서는 기존 넥서스와 동일하게 동작한다 — 교재 → 챕터/PART →
유닛/DAY 전개, 학년 필터, 차등 커리큘럼, 시험지 발행(Word · PDF · 인쇄).

## 파일

- `ORUN_NEXUS_UNIVERSE.html` — **완성본. 이 파일 하나만 열면 된다.**
- `build.py` — 아래 소스를 완성본 하나로 조립한다.
- `src/head.html` · `src/body.html` · `src/engine.js` — 화면과 엔진.
- `data/grammar.json` — 문법 은하 데이터 (원본 넥서스에서 그대로 추출, 수정 금지 대상 아님).
- `data/vocab.json` ← `data/gen_vocab.py` — 보카 은하 데이터.
- `data/reading.json` ← `data/gen_reading.py` — 독해 은하 데이터.

## 다시 빌드하기

```bash
cd orun-nexus
python3 data/gen_vocab.py      # 보카 데이터 수정 시
python3 data/gen_reading.py    # 독해 데이터 수정 시
python3 build.py               # ORUN_NEXUS_UNIVERSE.html 재조립
```

## 데이터 상태 (2026-08 기준)

- **문법**: 원본 그대로 — 478 유닛 전부 시험지 연결.
- **보카**: 책 라인(권·부제·DAY 수·표지 색)은 표지 PDF 확정값.
  PART(DAY 5일 묶음, Ultimate는 6일)는 목차 연동 전 **잠정안**
  (`confidence:"draft"`, 지도에서 "목차 잠정안" 칩으로 표시).
  샘플 시험지 2종: 옳은보카 0 DAY 01, 옳은보카 3 DAY 01 (DAILY TEST + VOCA CHECK).
- **독해**: 유닛 수·풀/축약 구성(36지문 = 풀 12 + 축약 24)은 교재 사양,
  지문 제목은 실제 지문 연동 전 **잠정안**. 소재 트랙 6종이 Level 1–4를
  가로질러 이어진다(차등 커리큘럼 패널). 샘플 유닛 1종: Level 1 UNIT 01
  The Bread Bus (READ RIGHT + READING CHECK, 지문 자체 제작).

시험지를 늘리려면 각 은하의 `worksheets`에 유닛 id 키로
`{source, baekji:{chapter, sections[]}, popquiz:{chapter, questions[], answerKey[]}}`
형태를 추가하면 된다 — 형식은 문법 은하의 기존 478종과 동일하다.
