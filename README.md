# 학문당 · Lovable 프로젝트 모음

Lovable에서 만든 프로젝트들을 GitHub으로 옮겨 Claude Code에서 유지보수하기 위한 레포입니다.

## 구성

| 위치 | 내용 |
|---|---|
| `projects/` | Lovable에서 코드 그대로 옮겨 온 프로젝트들. 목록과 상태는 [`projects/README.md`](./projects/README.md) |
| 루트(`src/`, `public/` 등) | **orunquiz 프로젝트의 2025년 1월 옛 사본**입니다. 최신 코드는 [nathankim6/orunquiz](https://github.com/nathankim6/orunquiz)에 있으니 참고용으로만 두세요. |

## 프로젝트 하나 실행해 보기

```sh
cd projects/oruntestreport   # 원하는 프로젝트 폴더로
npm install                  # 필요한 부품(패키지) 내려받기
npm run dev                  # 브라우저에서 http://localhost:8080 열기
```

`bun`을 쓰는 새 형식 프로젝트(mini-book-style, school-data-lover, orunmiddle, weekend-clinic-buddy, glassmorphism-gem, olpumta)는 `npm install` 대신 `bun install`, `bun run dev`로 실행합니다.

## 알아 둘 것

- `projects/` 아래 사본들은 Lovable과 **자동으로 동기화되지 않습니다.** 앞으로 고치는 일은 이 레포에서 하세요.
- 각 프로젝트 폴더의 `LOVABLE.md`에 Lovable 편집기 주소, 배포 주소, 데이터베이스 종류, 가져오지 못한 파일이 적혀 있습니다.
- 데이터베이스가 "내 Supabase"인 앱은 그대로 동작합니다. "Lovable Cloud"인 앱은 Lovable 구독이 있는 동안 동작합니다.
- 초보자용 전체 안내서: https://claude.ai/code/artifact/50c503f6-aac2-4228-ac5f-de1b98662c47
