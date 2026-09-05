# ORUN NEXUS UNIVERSE

옳은영어 커리큘럼 유니버스 — **한 하늘에 뜬 다섯 Galaxy**.

| Galaxy | 내용 | 교재 | 단원 노드 |
|---|---|---|---|
| **VOCAB** (보카 Galaxy) | 옳은보카 0–8 + Ultimate (표지 라인 기준, DAY가 세부 유닛) | 10권 | 482 DAY |
| **GRAMMAR** (문법 Galaxy) | ORUN METABOOK + 옳은문법 NEXUS 합본 (시험지 673종 포함) | 16권 | 673 UNIT |
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

## 디자인 — 「심연의 항구」

화면은 다섯 등대가 선 심우주의 항구다. 유일한 난색 광원은 등대의 골드 램프
(`#f5c518`)이고, 그 빛이 실제로 닿는 곳 — 램프·볼류메트릭 빔·발치 낙광·표지의
램프 림, 현재 위치(픽커 현재 항목·크럼 tail·선택 경로), 행동 하나(시험지 발행 /
인쇄) — 만 골드다. 나머지는 차가운 층으로 깊이를 쌓는다: 시차 별밭 → Galaxy 색
성운 → 2가닥 나선 먼지 원반 → 노드·빛의 강 → 표지 → 연막 네이비 유리 크롬.

- 디자인 토큰은 `src/head.html` 의 `:root` 한 곳에 있다(바닥 3단, 유리, 카드,
  시안 신호색, 골드, 텍스트 3단, Galaxy 액센트, 타입 스케일, 간격, 모션).
  Galaxy 액센트 값은 `engine.js` 의 `GALAXIES[].accent` 와 같아야 한다 —
  엔진은 CSS 를 읽지 않는다(오프라인·프레이밍 안정성).
- 골드 규율: 토글 켜짐·hover·계기·섹션 제목·잠정 칩·범례 점에는 골드를 쓰지 않는다.
- 활자: Orbitron 은 아이덴티티 다섯 곳(워드마크·Galaxy 픽커·이름판·Galaxy 카드
  이름·레일 masthead)에만. 나머지는 Noto Sans / Noto Sans KR 6단 스케일, 한글이
  섞이는 곳은 트래킹 0. 캔버스 라벨은 수평 + 8px 리더선 + 3px 녹아웃, 화면당
  단원 라벨 18 · 챕터 라벨 24 상한에 충돌 회피.
- 모션: 감쇠는 전부 dt 보정(`K(c)=1-(1-c)^(dt·60)`) — 120Hz 에서도 같은 속도.
  Galaxy 진입/우주 귀환은 720ms easeInOutCubic 타임라인 하나로 움직인다.
  정지 6초 뒤 툴바·크럼이 70% 로 잦아든다(마우스·키 입력에 즉시 복귀).
- 시험지(A4) 조판과 인쇄물 브랜드는 그대로다 — 모달은 껍데기만 바뀌었다.
- **실사 은하**: 원반은 점 무리가 아니라 Galaxy 마다 한 번 굽는 1024² 텍스처다
  (지수 원반 + 로그 나선 팔 — 그랜드/막대/플로큘런트/고리/세 팔 — + 먼지 띠 +
  별 1만 + HII 영역 + 따뜻한 벌지, 시드 고정). 2D 캔버스 밑의 WebGL 캔버스(`#gl`)가
  별밭 배경과 다섯 원반을 원근 보간(w=1/k)으로 이음매 없이 그리고, 노드·강·등대·
  표지는 그 위의 2D 캔버스가 그린다. WebGL 이 없으면 2D 띠 매핑으로 돌아간다.
- **심우주 하늘과 마감**: 하늘은 셰이더로 한 번 굽는다(다섯 Galaxy 색의 fBm 성운,
  별 3층, 회절 스파이크가 선 밝은 별, 먼지 골이 파인 은하수 띠, 먼 은하).
  은하 텍스처는 GPU 마감 패스를 한 번 더 거친다 — 나선을 따라 흐르는 실 같은
  먼지 띠, 구름결, 발광, 코어 글레어. 그 위에 필름 그레인(CSS overlay)과 등대 램프의
  아나모픽 스트릭이 얹힌다. 프레임 거버너가 바닥(QUALITY 0)이면 그레인과 톤 필터를 끈다.

## 파일

- `ORUN_NEXUS_UNIVERSE.html` — **완성본. 이 파일 하나만 열면 된다.**
- `build.py` — 아래 소스를 완성본 하나로 조립한다.
- `src/head.html` · `src/body.html` · `src/engine.js` — 화면과 엔진.
- `data/grammar.json` — 문법 Galaxy 데이터 (넥서스에서 그대로 추출, 생성기 없음).
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

- **문법**: 원본 그대로 — 673 유닛 전부 시험지 연결(16권·191챕터).
  두 넥서스를 합쳤습니다. 유닛 단위 넥서스(12권·611유닛)에 챕터 단위
  「옳은문법 NEXUS」에만 있던 네 권 — `Grammar Inside Starter`(13챕터),
  `Grammar Inside Level 1`(12), `Grammar Inside Level 2`(13),
  `바로 푸는 문법 2`(24) — 을 시험지째 얹었습니다. 백지 구성이
  skeleton-fill·compare-contrast·error-explain 로 같아 그대로 붙습니다.
  Grammar Inside 는 문마중·누적복습 라인과 **나란히 가는 다른 줄**이라
  학년 등급이 겹칩니다(ST=1, L1=3, L2=4). 같은 등급이면 같은 색입니다 —
  색이 곧 학년이라는 규칙을 지키려고 출판사 브랜드색 대신 은하의 ramp
  색을 씁니다. 표지는 실물 그대로입니다.
  들여온 챕터에 붙어 있던 `pending`(62개)은 시험지가 모두 있으므로 풀었습니다.
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
형태를 추가하면 된다 — 형식은 문법 Galaxy의 기존 673종과 동일하다.
