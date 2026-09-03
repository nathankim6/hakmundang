# See the World — Integrated Social Studies in English (Unit 1)

영어로 배우는 통합사회(CLIL) 교재의 소스와 빌드 스크립트입니다.
1단원 **"Four Lenses, One World"**(인간·사회·환경을 바라보는 네 가지 관점과 통합적 관점)를 다룹니다.

- 결과물: `output/see-the-world-unit1.pdf` (A4, 22쪽)
- 소스: `src/book.html`(본문), `src/styles.css`(디자인), `src/svg/*.svg`(삽화·아이콘), `src/charts.py`(데이터 차트)

## 저작권 원칙

이 교재는 기존 교과서의 글·그림·사진·도표·레이아웃을 **전혀 재사용하지 않고** 새로 만들었습니다.

- 본문 텍스트는 모두 새로 집필했습니다. 교육과정의 개념(시간적·공간적·사회적·윤리적 관점, 통합적 관점)만 공유하며, 사례는 전부 다릅니다.
  (합계출산율, 스마트폰 공급망, 선거연령 18세, 화장품 동물실험 금지, 패스트패션, 폐교, 게임 셧다운제 등)
- 삽화·아이콘은 모두 이 저장소에 있는 원본 SVG이며 외부 이미지·클립아트를 사용하지 않았습니다.
- 도표는 `src/charts.py`의 공개 통계(통계청, 교육통계, USGS 등)를 반올림해 직접 그린 것입니다. 출처는 교재 마지막 쪽에 표기했습니다.
- 서체는 모두 SIL Open Font License(Nunito, Lora, Source Sans 3, Noto Sans KR)입니다.
- 원본 교과서에서 인용된 외부 저작물(도서 발췌, 신문 기사, 사진)은 하나도 포함하지 않았습니다.

## 빌드 방법

```bash
cd textbook
./fetch-fonts.sh          # Google Fonts에서 OFL 서체 다운로드 (최초 1회, fonts/ 폴더)
pip install pymupdf       # --preview 옵션용 (선택)
python3 build.py --preview
```

- `build.py`는 SVG와 차트를 HTML에 인라인한 뒤 headless Chromium으로 PDF를 만듭니다.
  Chromium 경로는 자동 탐색하며, 필요하면 `CHROME_BIN=/path/to/chrome`으로 지정합니다.
- `--preview`를 주면 `output/preview/page-NN.png`로 각 쪽 미리보기를 만듭니다.

## 구성 (22쪽)

| 쪽 | 내용 |
|---|---|
| 1 | 표지 |
| 2 | 책 사용법 · 단원 지도 · 학습 목표 |
| 3 | Warm-up: One cafeteria, four questions |
| 4–5 | Lesson 1 · The Time Lens (시간적 관점) — 합계출산율 |
| 6–7 | Lesson 2 · The Place Lens (공간적 관점) — 스마트폰의 여정 |
| 8–9 | Lesson 3 · The Rules Lens (사회적 관점) — 선거연령 18세 |
| 10–11 | Lesson 4 · The Values Lens (윤리적 관점) — 화장품 동물실험 금지 |
| 12 | Lens Check: 네 관점 정리 · 관점 구별 활동 |
| 13 | Lesson 5 · The Integrative Lens (통합적 관점) — 네 명의 기자 |
| 14–15 | Case Study: 패스트패션을 네 관점으로 |
| 16–17 | Project: Empty Desks (폐교) 모둠 탐구 |
| 18 | Think Together: 게임 셧다운제 토론 |
| 19 | Unit Summary · Glossary |
| 20–21 | Unit Test (객관식 8 + 서술형 2) |
| 22 | Answer Key · 교사용 노트 · 출처 |

각 레슨은 Reading → Word Bank → Key Questions → Data Lab → Reading 2 → Language Focus → Check Up → Talk About It 순서로 구성됩니다.
