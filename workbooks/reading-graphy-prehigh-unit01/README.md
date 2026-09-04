# READING GRAPHY · PRE-HIGH — Unit 1 「Five Ways of Reading」

옳은영어(ORUN ENGLISH) **예비고등 독해 워크북** 1개 유닛(A4 25면).
지문 5편은 EBS 『올림포스 고급영어독해 — 영미 비문학 읽기』 Field 1의 주제를 살려
**예비고1 수준(167–205 words)으로 새로 쓴 원문**이며, 삽화·아이콘도 전부 원본 SVG다.

HTML/CSS를 헤드리스 Chromium으로 인쇄해 PDF를 만든다 (docx 아님).

## 유닛 구성 — 여섯 걸음

| | TASK | 하는 일 |
|---|---|---|
| 1 | 영영풀이 매칭 | 우리말 뜻 암기 대신 영어 정의를 읽고 낱말과 잇는다 |
| 2 | 한 문장 해석 | 의미 단위로 끊어 둔 문장을 **한 줄**에 옮긴다 |
| 3 | 기호 표시 구문분석 | S·V·O·C를 적고 `( )` 수식어 · `[ ]` 절로 묶은 뒤 한 줄 해석 |
| 4 | 플로차트 완성 | 글 전체 흐름을 표 한 장으로 복원 (빈칸 4개 + 보기) |
| 5 | 패러프레이즈 | 원문 표현을 다른 말로 바꾼 문장의 빈칸을 채운다 |
| 6 | Check Up | 제목 · 내용 일치 · 서술형 한 줄 |

면 배치: **레슨당 4면** — READING / WORD·SENTENCE / MARKING·FLOW / PARAPHRASE·CHECK.
전체 25면 = 표지 1 + 구성 1 + 레슨 20 + ANSWERS 3.

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
| `content1.js` / `content2.js` | 레슨 데이터 — 지문·해석·TASK 1–6 문항과 정답 |
| `art.js` | 원본 SVG — 레슨 아이콘 5종 + 본문 삽화 5종 |
| `css.js` | 디자인 시스템 — A4 판형, 색 토큰, 컴포넌트 |
| `build.js` | 25면 HTML 생성기 |
| `output/` | 생성된 `.pdf` / `.html` |

## 빌드

```bash
apt-get install -y fonts-noto-cjk        # Noto Serif CJK KR (지문 본문용)
node build.js                            # → book.html
/opt/pw-browsers/chromium-1194/chrome-linux/chrome --headless --disable-gpu --no-sandbox \
  --no-pdf-header-footer --print-to-pdf=book.pdf --virtual-time-budget=8000 "file://$PWD/book.html"
python3 fill.py book.pdf                 # 면별 채움률 (현재 25면 모두 80–100%)
```

## 새 유닛 만들기

`content1.js` / `content2.js` 의 배열에 레슨 객체를 추가한다. 각 레슨의 키:

`no, key, accent, tint, deep, en, ko, goal, fig, tip, sent[], kor[], bank[6], defs[6],
defOrder[6], chunk[4], mark[2], flow[5], flowBogi, para[3], paraBogi, check[3]`

- `key` 는 `art.js` 의 아이콘·삽화 이름과 같아야 한다. 새 주제는 삽화도 함께 그린다.
- `defOrder` 는 영영풀이를 섞는 순서(정답 매칭에 그대로 쓰인다).
- `flow` 의 각 행은 `[단계, 내용, 정답]` 이고 `정답`이 `null`이면 빈칸 없이 제시만 한다.
- 삽화 viewBox 는 `640×230`, 배경은 CSS(`figure .art`)가 그리므로 SVG 안에 배경 사각형을 두지 않는다.

레이아웃 수치는 건드리지 않는다. 면이 넘치면 `css.js` 의 `.sect` 여백 → 표 셀 padding → 행간 순으로 줄인다.
