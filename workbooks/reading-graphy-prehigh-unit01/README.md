# READING GRAPHY · PRE-HIGH — Unit 1 「Five Ways of Reading」

옳은영어(ORUN ENGLISH) **예비고등 독해 워크북** 1개 유닛(A4 25면).
지문 5편은 EBS 『올림포스 고급영어독해 — 영미 비문학 읽기』 Field 1의 주제를 살려
**예비고1 수준(167–205 words)으로 새로 쓴 원문**이며, 삽화·아이콘도 전부 원본 SVG다.

HTML/CSS를 헤드리스 Chromium으로 인쇄해 PDF를 만든다 (docx 아님).

## 유닛 구성

| | TASK | 하는 일 |
|---|---|---|
| 1 | 영영풀이 매칭 | 우리말 뜻 암기 대신 영어 정의를 읽고 낱말과 잇는다 |
| 2 | **구문분석** | 지문에 쓰인 **핵심 구문 2개** 카드(구문명·인용·설명·해석) + 훈련 3문장 해석 |
| 2 | **READ RIGHT** | ORUN FLOW 바 + 분석 Tip + **먼저 보기**(다 표시된 문장) + 지문의 **모든 문장** 분석·해석 (지시어 표시 없음) |
| 3 | 플로차트 완성 | 글 전체 흐름을 **영문** 표 한 장으로 복원 (빈칸 4개 + 보기) → 영어 한 문장 요약 |
| 4 | 패러프레이즈 | 원문 표현을 다른 말로 바꾼 문장의 빈칸을 채운다 |
| 5 | Check Up | 고르고 끝내지 않는다 — 선지마다 **오답인 이유**와 **근거 문장 번호**를 쓴다 |
| ＋ | Knowledge Bank | 유닛 끝 배경지식 코너: 소재를 실제 사건·자료로 넓히고 ‘생각해 볼 것’으로 닫는다 |

### ORUN FLOW 표기법 (리딩그라피 공통)

`1 주어 밑줄 + S → 2 본동사 △ + V → 3 접속사 [네모] → 4 종속절 S′·V′ → 5 수식어(구) 밑줄 + M`

- 조동사+동사 · have/has/had+p.p · be+p.p · be+~ing 는 **한 덩어리**로 묶어 △ 를 올린다.
- **먼저 보기**는 접속사가 있는 문장을 골라 완전히 표시된 상태로 보여 준다(훈련 3문장과 중복 금지).
  주어 초록 밑줄 · 본동사 네이비 · 접속사 골드 네모 · 수식어 회색 밑줄.
  라벨은 **S · V · M · S′ · V′ 기호만** 쓰고 한글을 적지 않는다. △ 는 해당 단어 **글자 위에 겹쳐** 얹는다
  (`.tk{padding-top:0}` + `.tk em{position:absolute; top:1px; font-size:10.5pt}`).
  padding-top 을 주면 △ 가 글자 위로 떠 보이므로 0 으로 둔다. em 이 absolute 라 윗줄로 새지 않는다.
- 구문분석·READ RIGHT의 바·배너·번호칩은 모두 **레슨 테마색**을 따르고, 두 파트 모두 **TASK 2** 로 묶는다.
  S 초록 · V 테마 딥 · M 빨강은 표기 범례이므로 레슨과 무관하게 고정한다.
- 훈련 문장은 슬래시 없이 원문 그대로, 행간을 넓게 인쇄해 학생이 문장 위에 직접 표시한다.

면 배치: **레슨당 5면** — READING / WORD·구문분석 / READ RIGHT / CHART·PARAPHRASE / CHECK·KB.
전체 30면 = 레슨 25 + ANSWERS 5. (표지·구성 안내 면은 두지 않는다.)

**답란은 모두 한 줄**(`.aline`)이다. 판서로 함께 채우는 수업을 전제로 한다.

## 레슨

| No | Title | 주제 | Accent |
|---|---|---|---|
| 01 | Can a Poem Cross a Border? | 번역이 옮기지 못하는 것 | `#5B57A6` |
| 02 | This Is Not a Pipe | 이미지는 사물의 판본일 뿐 | `#E07A3E` |
| 03 | In Practice an Engineer | 연습은 공연의 자유를 만든다 | `#2E8B7F` |
| 04 | The Safest Room in the Castle | 위험 없는 보호는 보호가 아니다 | `#C2557A` |
| 05 | Reading Is a Conversation | 이해는 대화라는 과정에서 자란다 | `#2F7CB8` |

## 파일

| 파일 | 내용 |
|---|---|
| `content1.js` / `content2.js` | 레슨 데이터 — 지문·해석·어휘·패러프레이즈·Check Up |
| `flow.js` | ORUN FLOW — 먼저 보기 토큰(역할 태그)과 훈련 3문장 |
| `extra.js` | 영문 플로차트 · Check Up 오답 이유/근거 · Knowledge Bank |
| `art.js` | 원본 SVG — 레슨 아이콘 5종 + 본문 삽화 5종 |
| `pics.js` | 픽토그램 24종 + 레슨별 플로차트 스트립 매핑 + Knowledge Bank 코너 삽화 5종 |
| `syn.js` | 레슨별 핵심 구문 2개 — 구문명 · 본문 인용(`«»`가 밑줄부) · 설명 · 해석 |
| `css.js` | 디자인 시스템 — A4 판형, 색 토큰, 컴포넌트 |
| `build.js` | 25면 HTML 생성기 |
| `output/` | 생성된 `.pdf` / `.html` |

## 빌드

```bash
apt-get install -y fonts-noto-cjk        # Noto Serif CJK KR (지문 본문용)
node build.js                            # → book.html
/opt/pw-browsers/chromium-1194/chrome-linux/chrome --headless --disable-gpu --no-sandbox \
  --no-pdf-header-footer --print-to-pdf=book.pdf --virtual-time-budget=8000 "file://$PWD/book.html"
python3 fill.py book.pdf                 # 면별 채움률 (현재 30면 84–100%, 넘침 없음)
```

## 새 유닛 만들기

`content1.js` / `content2.js` 의 배열에 레슨 객체를 추가한다. 각 레슨의 키:

`content*.js` : `no, key, accent, tint, deep, en, ko, goal, fig, tip, sent[], kor[], bank[6],
defs[6], defOrder[6], para[3], paraBogi, check[3]`

`flow.js` : `model{n, toks[[말, 역할]], ko}` + `drill[3]{n, en, ans, ko}`
역할 태그는 `s · s2 · v · v2 · c · m` 이며 `null` 이면 표시하지 않는다.

`extra.js` : `flow[5]`, `flowBogi`, `why[5]`, `src[5]`, `kb{title, lead, items[3], ask}`

- `key` 는 `art.js` 의 아이콘·삽화 이름과 같아야 한다. 새 주제는 삽화도 함께 그린다.
- `defOrder` 는 영영풀이를 섞는 순서(정답 매칭에 그대로 쓰인다).
- `flow` 의 각 행은 `[Stage, 영문 내용, 정답]` 이고 `정답`이 `null`이면 빈칸 없이 제시만 한다.
- 먼저 보기 문장은 **반드시 접속사를 하나만** 두어야 표기가 명확해진다.
- Knowledge Bank 의 사실은 검증 가능한 것만 싣는다. 불확실한 통설은 넣지 않는다.
- 삽화 viewBox 는 `640×230`, 배경은 CSS(`figure .art`)가 그리므로 SVG 안에 배경 사각형을 두지 않는다.

레이아웃 수치는 건드리지 않는다. 면이 넘치면 `css.js` 의 `.sect` 여백 → 표 셀 padding → 행간 순으로 줄인다.
