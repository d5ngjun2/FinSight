# 마이그레이션 및 Vercel 배포 최적화 작업 로그

## 1. 레거시 디렉토리 제거 및 백업
- **수정 사항:** 
  - 기존에 분리되어 있던 `backend` 폴더(Spring Boot 프로젝트)를 완전히 삭제했습니다.
  - 기존 `frontend` 폴더(React + Vite)는 컴포넌트 유실을 방지하기 위해 `web/src/legacy_frontend` 폴더로 코드를 복사(백업)한 후 기존 폴더를 삭제했습니다. 
- **이유:** 하나의 풀스택 환경(Next.js)으로 통합하여 Vercel 배포를 단일화하고 용이하게 만들기 위함입니다.

## 2. Prisma 데이터베이스 Provider 및 엔진 변경
- **대상 파일:** `web/prisma/schema.prisma`, `web/src/lib/prisma.ts`
- **수정 사항:** 
  - `datasource db`의 `provider`를 `"sqlite"`에서 `"postgresql"`로 변경하고 기존 `url` 속성은 제외했습니다. (Prisma v7 방식 적용)
  - Vercel 서버리스 환경에서 안전한 커넥션 풀을 관리하기 위해 `@prisma/adapter-pg`와 `pg` 패키지를 설치하여 PostgreSQL Adapter를 설정했습니다.
- **이유:** 로컬 파일 기반의 SQLite(`dev.db`)는 배포 시 데이터가 증발하므로 Vercel Postgres나 외부 Postgres DB 연결로 전환했습니다.

## 3. 프론트엔드 코드 Next.js App Router로 완전 이식 (마이그레이션 완료)
- **수정 사항:**
  - 기존 백업해둔 `legacy_frontend` 내의 모든 React 컴포넌트(`Sidebar`, `CalendarView`, `ExpenseModal` 등), 커스텀 훅(`useExpenses`, `useStatistics`), API 클라이언트 코드(`expenseApi`)를 모두 Next.js의 `src/` 디렉토리 하위로 복사 및 경로를 리팩토링했습니다.
  - `pages/Dashboard.tsx`, `pages/Analytics.tsx`, `pages/AiAnalysis.tsx`를 각각 `app/page.tsx`, `app/analytics/page.tsx`, `app/ai/page.tsx`로 App Router 규격에 맞게 변환했습니다.
  - 리액트 쿼리(`@tanstack/react-query`)의 상태 관리를 위해 `app/providers.tsx`를 만들어 최상위 레이아웃에 통합했습니다.
  - 이식이 모두 끝난 후 `legacy_frontend` 백업 폴더를 완전히 제거했습니다.
- **결과:** Vercel에 곧바로 배포가 가능한 안정적인 Next.js 풀스택 빌드(`npm run build` 성공)가 완성되었습니다.

---
### 향후 필요 작업
1. Vercel 배포 전, 사용할 PostgreSQL 데이터베이스의 URL을 `web/.env`의 `DATABASE_URL`에 입력하세요.
2. DB URL 입력 후 로컬에서 `npx prisma db push` 명령어를 실행하여 데이터베이스에 테이블(스키마)을 생성하세요.
3. Github에 코드를 푸시하고 Vercel에 프로젝트를 연결하면 별도의 세팅 없이 즉시 배포됩니다!
