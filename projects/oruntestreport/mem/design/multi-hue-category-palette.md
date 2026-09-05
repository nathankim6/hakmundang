---
name: Multi-hue Category Palette
description: Per-theme categorical color tokens (--c1..--c5, --diff-*) used by report charts and cards
type: design
---
리포트 차트/카드 색상은 하드코딩 금지. `src/index.css`의 테마별 토큰 사용:
- 카테고리: `--c1`~`--c5` + `-soft`(배경 틴트) + `-deep`(라벨 텍스트)
- 난이도: `--diff-easy|mid|hard|xhard` + `-soft`
접근은 `src/utils/chartPalette.ts`의 `getCategoryAccent(index)` / `DIFFICULTY_PALETTE`.
테마별 색감: 고등부=네이비·틸·인디고·앰버·로즈, 중1=사프란·오렌지·틸·인디고·로즈, 중2=버건디·클레이·플럼·틸·골드, 중3=포레스트·올리브·시안·골드·테라코타.
채도는 중간 이하로 유지해 촌스럽지 않은 편집 디자인 톤을 지킨다.
