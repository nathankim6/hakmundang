# project-signal-hub

Lovable 프로젝트를 코드 그대로 옮겨 온 사본입니다. (가져온 날짜: 2026-09-05 05:44 UTC)

| 항목 | 값 |
|---|---|
| Lovable 편집기 | https://lovable.dev/projects/18e0a5b1-45b3-4376-905f-29b50eae89d5 |
| 배포 주소 | https://project-signal-hub.lovable.app |
| Lovable 마지막 수정 | 2025-10-23 |
| 데이터베이스 | 내 Supabase (jpanpwbdlhsxnyaldddm) |
| 파일 | 텍스트 154개 복사, 그림·미디어 8개 내려받음 |

## 실행 방법

```sh
npm install
npm run dev
```

잠금 파일(package-lock.json, bun.lock, bun.lockb)은 가져오지 않았습니다. 위 `npm install`이 새로 만듭니다.

## npm 설치 설정

npm이 date-fns와 react-day-picker의 버전 호환을 이유로 설치를 거부해서, `legacy-peer-deps=true`를 담은 `.npmrc` 파일을 추가했습니다. Lovable이 쓰는 bun에서는 원래 문제없이 설치되던 조합입니다. 이 파일 덕분에 `npm install`이 그대로 동작합니다.
