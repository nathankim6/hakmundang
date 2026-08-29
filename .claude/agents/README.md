# 학문당 에이전트 팀 (Claude Code Subagents)

이 폴더는 [Claude Code 서브에이전트](https://code.claude.com/docs/en/sub-agents) 정의입니다.
깃헙에서 널리 쓰이는 에이전트 팀 패턴(예: `wshobson/agents`, `contains-studio/agents`)과 같은 방식으로,
마크다운 파일 하나가 전문 에이전트 하나입니다.

## 팀 구성

| 에이전트 | 역할 | 이런 요청에 사용 |
|---|---|---|
| `question-type-builder` | 새 문제 유형 추가/수정 | "OO고 유형 추가해줘", "새 서술형 유형 만들어줘" |
| `prompt-engineer` | 문제 생성 프롬프트 품질 개선 | "오답이 이상해", "출력 형식이 깨져" |
| `frontend-developer` | React/shadcn/Tailwind UI 작업 | "버튼 추가", "모바일에서 깨져" |
| `supabase-engineer` | 인증·액세스 코드·DB | "로그인 안 돼", "액세스 코드 관리" |
| `docx-export-specialist` | 워드(.docx) 내보내기·서식 | "워드 저장이 이상해", "문제지 양식 수정" |
| `code-reviewer` | 커밋 전 코드 리뷰 (읽기 전용) | "리뷰해줘", 큰 변경 후 자동 호출 |

## 사용법

Claude Code에서 이 저장소를 열면 자동으로 로드됩니다.

- **자동 위임**: 그냥 평소처럼 요청하면 Claude가 `description`을 보고 알맞은 에이전트에 위임합니다.
- **명시 호출**: `question-type-builder 에이전트로 새 빈칸 유형 추가해줘`처럼 이름을 직접 지정할 수도 있습니다.
- **목록 확인/편집**: Claude Code에서 `/agents` 명령으로 확인·수정할 수 있습니다.

## 새 에이전트 추가하는 법

이 폴더에 `이름.md` 파일을 하나 만들면 됩니다:

```markdown
---
name: my-agent            # 소문자-하이픈 이름
description: 언제 이 에이전트를 쓰는지 (자동 위임의 기준이 되므로 구체적으로)
tools: Read, Grep, Glob   # 생략하면 모든 도구 상속
model: sonnet             # 생략 가능 (sonnet / opus / haiku)
---

여기에 시스템 프롬프트를 씁니다. 역할, 담당 파일, 작업 원칙을 구체적으로.
```
