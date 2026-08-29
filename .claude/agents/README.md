# 옳은영어(ORUN ENGLISH) 에이전트 조직 — Claude Code Subagents

김성진T(AX팀장) 총괄 아래 8개 부서 + 개발팀으로 구성된 에이전트 조직입니다.
깃헙의 에이전트 팀 패턴(`contains-studio/agents` 스타일 — 팀별 폴더에 마크다운 에이전트)을 따릅니다.

```
                  총괄 (김성진T, AX팀장)
                          │
  ┌────────┬────────┬─────┼─────┬────────┬────────┬────────┬────────┐
  ▼        ▼        ▼     ▼     ▼        ▼        ▼        ▼        ▼
콘텐츠   디자인    CS    회계  조교관리  흑석고   구암고    AX     dev
개발팀    팀      팀    팀     팀     내신팀   내신팀    팀    (개발)
```

## 부서별 에이전트

### 1️⃣ 콘텐츠개발팀 `content-dev/`
| 에이전트 | 역할 |
|---|---|
| `reading-architect` | 옳은독해 READING GRAPHY — 지문 → 4문항 → ORUN FLOW → 5단계 훈련 → 시그니처 문항 → 해설 |
| `grammar-optimizer` | 옳은문법 ORUN GRAMMAR 누적복습 교재 (품사편·시제편) |
| `vocab-curator` | 옳은보카 9레벨 + Ultimate — 커리큘럼·Boot Camp·로드맵 |

### 2️⃣ 디자인팀 `design/`
| 에이전트 | 역할 |
|---|---|
| `brand-keeper` | 표지·브랜드 일관성 (옳은어법 밤하늘·골드·등대 / 옳은문법 오렌지·블루 / READING GRAPHY 레벨 색상) |
| `layout-master` | 페이지 설계 — A4 유닛 구조, 풀/축약 포맷, 폰트·여백 규칙 |
| `qa-designer` | 컬러·타이포·인쇄 색감 최종 시각 검증 (읽기 전용) |

### 3️⃣ CS팀 `cs/`
| 에이전트 | 역할 |
|---|---|
| `progress-tracker` | 학생별 독해 레벨 진행·보카 완료율 관리 |
| `counsel-bot` | 수강 문의 → 레벨 컨설팅 → 커리큘럼 추천 (답변 초안) |
| `student-manager` | 학생 정보 일관성 — 등급·반·담당강사 매핑 |

### 4️⃣ 회계팀 `finance/`
| 에이전트 | 역할 |
|---|---|
| `enrollment-tracker` | 가입·해지, 월별 학생수 통계, 학교별·반별 명단 |
| `payroll-processor` | 출근 시간 × 시급 급여 계산, 월말 명세서 |
| `billing-bot` | 수강료 청구·수납·연체 알림 초안·환불 계산 |

### 5️⃣ 조교관리팀 `ta-ops/`
| 에이전트 | 역할 |
|---|---|
| `task-assigner` | 일일 조교 업무 배정 (감독·과제 수집·제본·배포) |
| `schedule-maker` | 월 근무표 작성 (선호도 → 시간표 배치) |
| `ta-reviewer` | 월별 성과 평가 보고 (읽기 전용) |

### 6️⃣ 흑석고내신팀 `heukseok/`
| 에이전트 | 역할 |
|---|---|
| `heukseok-specialist` | 흑석고 시그니처 "영영풀이" 유형 — 기출 분석·훈련 자료 |
| `heukseok-exam-builder` | RT 워크북 + 동형모의고사 |
| `heukseok-performance-monitor` | 성적 동향·취약 유형 분석 (읽기 전용) |

### 7️⃣ 구암고내신팀 `guam/`
| 에이전트 | 역할 |
|---|---|
| `guam-specialist` | 구암고 특화 유형 분석 → 유형 정의서 → 맞춤 훈련 자료 |
| `guam-exam-builder` | RT 워크북 + 동형모의고사 |
| `guam-performance-monitor` | 학생별 강점·약점 관리 (읽기 전용) |

### 8️⃣ AX팀 `ax/` — 제작·검수·발주
| 에이전트 | 역할 |
|---|---|
| `pipeline-master` | 콘텐츠 → 인쇄본 자동화 (WeasyPrint/docx, Noto Sans CJK KR, XML 후처리, pdftoppm 검증) |
| `quality-checker` | 교재 최종 검수 — 정답·오타·레이아웃·부서 간 일관성 (읽기 전용) |
| `order-manager` | 인쇄소 발주 파일 정리·재고·배송 추적 |

### 🛠 개발팀 `dev/` — 학문당 앱(이 저장소) 개발
| 에이전트 | 역할 |
|---|---|
| `question-type-builder` | 새 문제 유형 추가 (프롬프트→등록→렌더러 배선) |
| `prompt-engineer` | Claude API 문제 생성 프롬프트 품질 |
| `frontend-developer` | React + shadcn/ui UI 작업 |
| `supabase-engineer` | 인증·액세스 코드·DB |
| `docx-export-specialist` | 워드 내보내기·시험지 서식 |
| `code-reviewer` | 커밋 전 코드 리뷰 (읽기 전용) |

## 🔄 부서 간 협업 흐름

```
콘텐츠개발팀 (지문/문항)
    ↓
디자인팀 (표지·레이아웃 규정)
    ↓
AX팀 pipeline-master (PDF/docx 생성)
    ↓
AX팀 quality-checker (최종 검수 — "발주 승인" 필요)
    ↓
AX팀 order-manager (인쇄소 발주 준비)
    ↓
조교관리팀 (학습지 배포)
    ↓
흑석고/구암고 내신팀 (학생 피드백·성적 수집)
    ↓
CS팀 (만족도 → 다음 콘텐츠 개선 요청)
```

## 사용법

- **자동 위임**: 평소처럼 요청하면 Claude가 알맞은 에이전트에 위임합니다. (예: "흑석고 영영풀이 훈련지 만들어줘" → `heukseok-specialist`)
- **명시 호출**: "counsel-bot으로 이 문의 답변 초안 써줘"처럼 이름을 지정할 수 있습니다.
- **목록 확인/편집**: Claude Code에서 `/agents` 명령.

## 공통 규칙

1. **학생 개인정보·성적·급여 데이터는 git에 커밋하지 않습니다.** 데이터 작업은 로컬 파일로만.
2. 검수(quality-checker) 승인 없이 발주 단계로 넘어가지 않습니다.
3. 대외 발송(학부모 문자, 인쇄소 전송)은 항상 사람이 최종 실행합니다 — 에이전트는 초안·패키지 준비까지.

## 새 에이전트 추가

해당 팀 폴더에 `이름.md`를 만들면 됩니다:

```markdown
---
name: my-agent            # 소문자-하이픈, 조직 내 유일해야 함
description: 언제 쓰는지 (자동 위임 기준이므로 구체적으로)
tools: Read, Grep, Glob   # 생략하면 모든 도구 상속 (검수형은 읽기 전용 권장)
model: sonnet
---

역할, 담당 업무, 작업 원칙을 시스템 프롬프트로 씁니다.
```
