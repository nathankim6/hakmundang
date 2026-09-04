# RE:RIGHT WORKBOOK — 올림포스 고급영어독해「영미 비문학 읽기」연계

EBS 『올림포스 고급영어독해 — 영미 비문학 읽기』(2022 개정 교육과정)를 원서로 삼아,
옳은영어(ORUN ENGLISH) 「옳은 독해」 조판 규격으로 만든 **워크북 1단원 샘플**이다.
범위는 **Field 1 Art & Literature** (Theme 01–05 + Review Test, 원서 pp.007–018).

산출물: A4 세로 **22면** — 단원 오프너 1면 + 유닛 15면(테마당 3면) + Field Review 2면 + 정답과 해설 4면.

## 설계 원칙

원서의 구성 요소를 학생이 **손으로 다시 만드는** 활동으로 1:1 전환한다.

| 원서 구성 요소 | 워크북 활동 |
|---|---|
| Words & Phrases | **R1** 어휘 재장착 — 영·한 양방향 인출 |
| — | **R1+** 본문에서 확인하기 — 어휘가 쓰인 문장 번호 되짚기 |
| Sentence Structure & Translation | **R2** 직독직해 — 의미 단위로 끊어 옮기기 |
| Key Sentence Analysis | **R3** 핵심 구문 해부 — 괄호 구조 스스로 복원 |
| Flow Chart | **R4** 흐름 복원 — 도입·전개·마무리 빈칸 채우기 |
| 지문 전체 | **R5** 요약문 완성 — 한 문장으로 압축 |
| Solution Guide | **R6** 조건 영작 — 주제문을 스스로 쓰기 |
| 수능형·내신형 문항 | **R7** 내신 실전 — 서술형으로 다시 묻기 |

단원을 관통하는 축은 **‘표현(representation)과 실재(the original) 사이의 거리’**이다.
다섯 지문(번역·이미지·연습·보호·대화)이 같은 문제를 다르게 말하고 있다는 점을 오프너에서 제시하고,
Field Review의 `D. FIELD INSIGHT` 논술 두 문항에서 회수한다.

## 조판 규격

- A4 세로, 여백 상 900 / 하 760 / 좌우 953 twips, 본문 폭 `W = 10000`
- 색 문법: 회색 `#F3F4F5` = **읽는 곳**, 크림 `#FFFCF0` = **쓰는 곳** (좌측 옐로우 띠)
- 로고 3색: `NAVYD #13345C` / `NAVY #06618C` / `YEL #FDD100`, 보조 `TEAL #2E8B7F` · `AMB #C98A1E`
- 지문 각 문장에 어깨번호 ¹²³…. 모든 활동과 해설이 이 번호로 문장을 지목한다.
- 목표 채움률 80% 이상 (현재 22면 모두 82–98%)

## 파일

| 파일 | 내용 |
|---|---|
| `lib.js` | 조판 라이브러리 — 색 토큰, 섹션 탭, R-스텝 헤더, 지문 박스, 필기란, 플로차트 |
| `data.js` | Field 1 다섯 지문의 원문·해석·R1–R7 문항과 정답 (`‹…›` 밑줄, `«…»` 이탤릭) |
| `generate.js` | 22면 조판 및 `.docx` 생성 |
| `fill.py` | 면별 채움률 측정 (PDF 픽셀 기준) |
| `output/` | 생성된 워크북 `.docx` / `.pdf` |

## 재생성

```bash
npm install docx
mkdir -p ~/.fonts && cp <Noto Sans KR·Orbitron ttf> ~/.fonts/ && fc-cache -f
WB_OUT=$PWD/wb.docx node generate.js
soffice --headless --convert-to pdf --outdir . wb.docx
python3 fill.py wb.pdf          # 면별 채움률 확인
```

`assets/logos/orun_mark.png` 가 있어야 오프너 배너의 로고 카드가 렌더링된다.
폰트를 설치하지 않으면 PDF 변환 시 한글이 깨진다.

## 다른 Field로 확장

`data.js` 의 `THEMES` 배열만 교체한다. 각 테마는 다음 키를 갖는다.

`no, en, ko, words, src, sent[], kor[], gap, r1L[6], r1R[6], r1p[4], r2[2], r3, r4, r5, r6, r7[2], kpt`

`r1p` 의 문장 번호는 `generate.js` 가 `sent[]` 를 검색해 자동으로 계산하므로 직접 적지 않는다.
렌더링 함수·색 토큰·레이아웃 수치는 건드리지 않는다.
