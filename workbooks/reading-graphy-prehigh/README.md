# 옳은영어 READING GRAPHY · 예비고등

EBS 『올림포스 고급영어독해 — 영미 비문학 읽기』의 **12개 분야 × 5주제 = 지문 60편**을
예비고1 수준(165–210 words)으로 새로 쓴 독해 워크북. A4 **361면**(차례 1 + 유닛 12 × 30면),
**학생용**과 **교사용**(정답 붉은 오버프린트) 두 판, 각각 한 권으로 묶인다.

지문·해석·문항·삽화 전부 이 저장소에서 생성한 원본이다. HTML/CSS 를 헤드리스 Chromium 으로
인쇄해 PDF 를 만든다(docx 아님).

## 유닛 구성 — 여섯 걸음

| TASK | 하는 일 |
|---|---|
| 1 영영풀이 매칭 | 우리말 뜻 암기 대신 영어 정의를 읽고 낱말과 잇는다 |
| 2 구문분석 | 지문에 쓰인 **핵심 구문 2개** 카드(구문명·인용·설명·해석) + 훈련 3문장 |
| | 훈련은 **① 구문 1 · ② 구문 2 · ③ 두 구문 동시 적용** 순서 |
| 3 READ RIGHT | ORUN FLOW 바 + 분석 Tip + **먼저 보기** + 지문 **모든 문장** 분석·해석 |
| 4 플로차트 완성 | 글 전체 흐름을 영문 표 한 장으로 복원 (빈칸 4개 + 보기 6개) |
| 5 패러프레이즈 | 원문 표현을 바꿔 쓴 문장의 빈칸 5개 (보기 8개) |
| 6 Check Up | 고르고 끝내지 않는다 — 선지마다 **오답 유형**(명사형 객관식)과 **근거 문장 번호** |
| ＋ Knowledge Bank | 유닛 끝 배경지식 코너: 소재를 실제 사건·자료로 넓히고 '생각해 볼 것'으로 닫는다 |

면 배치: **레슨당 5면** — READING / WORD·구문분석 / READ RIGHT / CHART·PARAPHRASE / CHECK·KB.
유닛당 30면 = 레슨 25 + ANSWERS 5.

지시문은 `~하세요 / ~해 보세요` 로 쓴다(`~하시오` 금지).
머리글은 좌 「올림포스 고급영어독해 **비문학**」, 우 옳은영어 로고로 고정한다.
답란은 모두 한 줄(`.aline`)이다 — 판서로 함께 채우는 수업을 전제로 한다.

### ORUN FLOW 표기법

`1 주어 밑줄 + S → 2 본동사 △ + V → 3 접속사 [네모] → 4 종속절 S′·V′ → 5 수식어(구) 밑줄 + M`

- 조동사+동사 · have/has/had+p.p · be+p.p · be+~ing 는 **한 덩어리**로 묶어 △ 를 올린다.
- **먼저 보기**는 접속사가 있는 문장을 골라 완전히 표시된 상태로 보여 준다(훈련 3문장과 중복 금지).
- 라벨은 `S · V · M · S′ · V′` 기호만 쓴다. 목적어처럼 라벨이 없는 토큰은 역할을 `null` 로 둔다.
- △ 는 글리프가 아니라 인라인 SVG 라 `stroke-width` 로 두께를 직접 조절한다
  (현재 `18×15px` · `stroke-width 1.6`). 크기를 키우면 두께도 같은 비율로 굵어진다.
- S 초록 · V 테마 딥 · M 빨강은 표기 범례이므로 레슨과 무관하게 고정한다.

## 열두 분야

| Field | 분야 | 레슨 | 시작 면 |
|---|---|---|---|
| 1 | Art & Literature 예술·문학 | 01–05 | 1 |
| 2 | Science & Technology 과학·기술 | 06–10 | 31 |
| 3 | Social Matters 사회 문제 | 11–15 | 61 |
| 4 | Medicine & Health 의학·건강 | 16–20 | 91 |
| 5 | Philosophy & Religion 철학·종교 | 21–25 | 121 |
| 6 | Media & IT 대중매체·정보통신 | 26–30 | 151 |
| 7 | Sports & Entertainment 스포츠·연예 | 31–35 | 181 |
| 8 | Politics, Law & History 정치·법·역사 | 36–40 | 211 |
| 9 | Education, Psychology & Language 교육·심리·언어 | 41–45 | 241 |
| 10 | Economy & Business 경제·경영 | 46–50 | 271 |
| 11 | Environment, Resources & Ecology 환경·자원·생태 | 51–55 | 301 |
| 12 | Current Affairs 시사·현안 | 56–60 | 331 |

## 파일

| 파일 | 내용 |
|---|---|
| `units/uNN.js` | 유닛 데이터 — 지문·해석·어휘·구문·플로차트·패러프레이즈·Check Up·Knowledge Bank |
| `art/uNN.js` | 유닛 삽화 — 레슨 아이콘 5 · 배너 5 · 픽토그램 스트립 · 비네트 5 |
| `figure.js` | 인물 작화 시스템 — 발밑 원점, 키 150(≈4.3등신), 팔·머리·표정 조합 |
| `kit.js` | 삽화 부품 — 말풍선·생각풍선·만화 칸·화살표·스텝·태그·막대·소품 |
| `pics.js` | 픽토그램 45종 (플로차트 스트립용) |
| `css.js` | 디자인 시스템 — A4 판형, 색 토큰, 컴포넌트 |
| `build.js` | 면 생성기 (`--unit=N` / `--units=…` / `--teacher`) |
| `orun_mark_s.png` | 머리글 우측 로고 (120px, CSS 배경으로 1회만 임베드) |
| `validate.js` | 데이터 규격 검사 |
| `clip.py` · `wrap.py` · `legend.py` · `fill.py` | 인쇄 결과 검사 |

## 빌드

```bash
apt-get install -y fonts-noto-cjk        # Noto Serif CJK KR (지문 본문용)

node validate.js                         # 먼저 데이터부터 통과시킨다
node build.js --units=1,2,3,4,5,6,7,8,9,10,11,12            # → book.html   (학생용 361면)
node build.js --units=1,2,3,4,5,6,7,8,9,10,11,12 --teacher  # → book_t.html (교사용 361면)

/opt/pw-browsers/chromium-1194/chrome-linux/chrome --headless --disable-gpu --no-sandbox \
  --no-pdf-header-footer --virtual-time-budget=120000 --print-to-pdf=book.pdf book.html

python3 clip.py book                     # 잘림 검사 — "잘린 면 없음" 이어야 한다
python3 wrap.py book.pdf                 # 패러프레이즈 칸이 한 줄인지
python3 legend.py book.pdf               # Check Up 유형 범례가 한 줄인지
```

유닛 하나만 뽑을 때는 `node build.js --unit=7` (→ `u07.html`).
`--units` 를 주면 맨 앞에 차례 면이 붙고 쪽 번호가 유닛을 넘어 이어진다.
차례의 쪽 번호는 **유닛당 30면 고정**을 전제로 계산한다.

### 네 가지 검사를 반드시 통과시킨다

`.page` 는 `overflow:hidden` 이라 넘친 내용이 **조용히 사라진다**. 채움률만 보고 판단하면 안 된다
(100% 가 그 자체로 넘침은 아니다). 판정은 아래 넷이 한다.

- `validate.js` — 지문·해석 줄 수, 지문 길이(165–210 단어), 삽화·픽토그램 연결, `defOrder` 순열,
  drill 문장이 지문과 **글자까지** 같은지, 플로차트·패러프레이즈 정답이 보기 안에 있는지,
  패러프레이즈 문장이 **정답을 채운 뒤에도 52자 이하**인지, `wtype`/`stype` 이 Check Up 정답 번호와 맞는지.
- `clip.py` — HTML 면별 텍스트와 PDF 추출 텍스트를 대조해 사라진 토큰을 잡는다.
- `wrap.py` — 패러프레이즈 칸이 두 줄로 넘어가지 않는지(베이스라인 군집, 6pt 허용).
- `legend.py` — Check Up 유형 범례가 한 줄이고 본문 폭(552pt) 안에 있는지.

해설 면은 마지막 면만 `유닛 마무리 체크` / `NEXT UNIT` 박스를 더 얹으므로 그 면에만 `.page.tight`
로 여백을 좁힌다. 교사용 READ RIGHT 면은 `.page.te` 로 따로 압축한다.

## 새 유닛 만들기

`units/uNN.js` 는 `{ no, field, ko, tagline, next, lessons[5] }` 를 내보낸다. 레슨 키:

```
no, key, accent, tint, deep, en, ko, goal, fig, tip,
sent[15], kor[15], bank[6], defs[6], defOrder[6],
flow[5], flowBogi, para[5], paraBogi, check[3],
fl{ model{n, toks[[말, 역할]], ko}, drill[3]{n, en, ans, ko} },
syn[2], synd[3], wtype[5], stype[5], why[5], src[5],
kb{ title, lead, items[3], ask }
```

`art/uNN.js` 는 `{ icons, scenes, STRIP, VIG }` 를 내보낸다.

- `key` 는 `icons` · `scenes` 의 이름과 같아야 한다. 새 주제는 삽화도 함께 그린다.
- 배너 `scenes` 는 viewBox `640×280`, 비네트 `VIG` 는 `240×150`. 배경은 CSS 가 그리므로
  SVG 안에 배경 사각형을 두지 않는다.
- `flow` 의 각 행은 `[Stage, 영문 내용, 정답]` 이고 정답이 `null` 이면 빈칸 없이 제시만 한다.
- `wtype` 은 `정답·무관·반대·지엽·배경`, `stype` 은 `일치·반대·과장·혼동·시점` 중에서 고른다.
  정답 위치의 `wtype` 은 `정답`, `stype` 은 `일치`가 아니어야 한다.
- 먼저 보기 문장은 접속사를 하나만 두어야 표기가 명확해진다. 토큰을 이으면 원문이 되게 쓴다.
- Knowledge Bank 의 사실은 검증 가능한 것만 싣는다. 불확실한 통설은 넣지 않는다.

삽화의 인물은 `figure.js` 의 `person()` 하나로만 그린다. 캡션(`y≈274`)과 겹치지 않도록
발밑 `y` 는 **246 이하**로 둔다. 한글이 들어간 `tag()` 는 전각 폭으로 계산되므로
글자 수가 많으면 칸을 넘지 않는지 렌더해서 확인한다.

레이아웃 수치는 함부로 건드리지 않는다. 면이 넘치면 `css.js` 의 `.sect` 여백 →
표 셀 padding → 행간 순으로 줄인다.
