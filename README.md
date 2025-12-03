# TIL Feeds

개인 학습 기록(TIL - Today I Learned)을 시각화하고 분석하는 Next.js 기반 웹 애플리케이션입니다.

## 프로젝트 개요

GitHub TIL 저장소의 마크다운 파일들을 파싱하여 피드 형태로 표시하고, 학습 현황을 히트맵과 분석 대시보드로 시각화합니다.

### 주요 기능

- **피드 뷰**: SNS 스타일의 학습 기록 피드
- **히트맵**: 카테고리/토픽별 학습 현황 시각화
- **분석 대시보드**: 만족도 기반 학습 분석
- **재활성 시스템**: 복습이 필요한 토픽 알림

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State Management | TanStack Query (React Query) |
| Data Source | GitHub Raw Content API |
| Analytics | Upstash Redis (방문자 수) |

---

## 라우터별 페이지 구조

### `/` - Feeds (홈)

피드 카드 형태로 학습 기록을 표시합니다.

**주요 컴포넌트**:
- `HomeViewContent.tsx`: 피드 목록 및 필터링
- `FeedCard.tsx`: 개별 피드 카드
- `MobileFilter.tsx` / `DesktopFilterPanel.tsx`: 도메인/카테고리 필터

**데이터 흐름**:
```
GitHub TIL README.md → fetchTilContents() → loadAllDocsWithUrl() → useGetFeedContents()
```

**필터링 조건**:
- Domain: frontend, backend, devops 등
- Category: javascript, react, typescript 등

---

### `/heatmap` - 히트맵

카테고리별 토픽 학습 현황을 GitHub Contribution 스타일로 시각화합니다.

**주요 컴포넌트**:
- `SkillHeatMap.tsx`: 히트맵 메인 컴포넌트

**학습 상태 (Topic Status)**:

| 상태 | 조건 | 색상 |
|------|------|------|
| NOT_STARTED | count = 0 | 회색 |
| STARTED | count = 1 | 연두색 |
| FOCUSED | 2 ≤ count ≤ 4 | 녹색 |
| MASTERED | count ≥ 5 | 진녹색 |

**재활성(Re-active) 시스템**:

토픽별 마지막 학습일 기준으로 복습 필요 여부를 표시합니다.

| 레벨 | 조건 | 색상 | 설명 |
|------|------|------|------|
| NONE | < 30일 | - | 재활성 불필요 |
| LEVEL_1 | ≥ 30일 | 노란색 | 1차 재활성 필요 |
| LEVEL_2 | ≥ 90일 | 주황색 | 2차 재활성 필요 |
| LEVEL_3 | ≥ 180일 | 빨간색 | 긴급 재활성 필요 |

**예외 조건**:
- MASTERED 상태(count ≥ 5)인 토픽은 재활성 표시 제외
- 특정 도메인만 재활성 적용 (설정 파일에서 관리)

**재활성 적용 도메인**:
- `src/define/reActiveConditionDefines.ts` 에서 관리
- 현재 적용 도메인: `frontend`
- 비적용 도메인: `scrum`, `meta` 등 (복습 필요 없는 영역)

```typescript
// src/define/reActiveConditionDefines.ts
export const RE_ACTIVE_ENABLED_DOMAINS: string[] = ['frontend'];
```

---

### `/analysis` - 분석 대시보드

학습 만족도 기반 정적 분석을 제공합니다.

**주요 컴포넌트**:
- `AnalysisDashboard.tsx`: 분석 대시보드 메인
- `ReviewList.tsx`: 재활성 필요 토픽 리스트

**분석 항목**:
1. **전체 통계**: 평균/중앙값/최고/최저 만족도
2. **사분면 차트**: 학습 빈도 × 만족도 매트릭스
3. **만족도 분포**: 점수 구간별 분포
4. **카테고리별 만족도**: 카테고리별 평균
5. **키워드 분석**: 고/저 만족도 컨텐츠의 공통 키워드
6. **재활성 리스트**: 복습이 필요한 토픽 목록

**사분면 분류**:

| 사분면 | 조건 | 의미 |
|--------|------|------|
| 마스터 | 고빈도 + 고만족 | 핵심 역량 |
| 숨은 보석 | 저빈도 + 고만족 | 확장 가능성 |
| 개선 필요 | 고빈도 + 저만족 | 학습 방법 개선 필요 |
| 관심 필요 | 저빈도 + 저만족 | 기초 보강 필요 |

---

## API Routes

### `GET /api/contents`

마크다운 콘텐츠를 서버에서 파싱하여 반환합니다.

**응답 형식**:
```typescript
{
  contents: ContentItem[];
  fetchedAt: string;
}

type ContentItem = {
  type: string;          // "skill" | "troubleshooting"
  domain: string;        // "frontend" | "backend" | ...
  category: string;      // "javascript" | "react" | ...
  topic: string;         // 토픽명
  title: string;         // 파일명
  date: string;          // YYYY-MM-DD
  summary: string;       // 본문 첫 문단 요약
  keywords: string[];    // 키워드 배열
  satisfaction?: {       // 만족도 (선택)
    score: number;       // 0-100
    reason: string;      // 이유
  };
  // ...
}
```

### `GET/POST /api/visitors`

방문자 수 조회/증가 API (Upstash Redis 사용).

**환경 변수 필요**:
```env
UPSTASH_REDIS_REST_URL=your_url
UPSTASH_REDIS_REST_TOKEN=your_token
```

---

## 마크다운 Frontmatter 스키마

TIL 마크다운 파일의 frontmatter 형식:

```yaml
---
type: skill                    # skill | troubleshooting
domain: frontend               # 도메인
category: react                # 카테고리
topic: useState                # 토픽명
updatedAt: 2025-12-01          # 수정일
keywords:                      # 키워드 배열
  - react
  - hooks
  - state
relatedCategories:             # 연관 카테고리
  - javascript
satisfaction:                  # 만족도 (선택)
  score: 85                    # 0-100
  reason: 실무에 바로 적용 가능
---
```

---

## 디렉토리 구조

```
src/
├── app/
│   ├── page.tsx              # 홈 (Feeds)
│   ├── heatmap/page.tsx      # 히트맵
│   ├── analysis/page.tsx     # 분석
│   ├── api/
│   │   ├── contents/route.ts # 콘텐츠 API
│   │   └── visitors/route.ts # 방문자 API
│   └── layout.tsx            # 레이아웃
├── components/
│   ├── common/               # 공통 컴포넌트
│   │   ├── Button.tsx
│   │   ├── FilterSelect.tsx
│   │   ├── MiniSpinner.tsx
│   │   ├── Spinner.tsx
│   │   ├── Tag.tsx
│   │   └── VisitedBadge.tsx
│   ├── home/                 # 홈 관련
│   │   ├── HomeViewContent.tsx
│   │   ├── FeedCard.tsx
│   │   ├── MobileFilter.tsx
│   │   └── DesktopFilterPanel.tsx
│   ├── heatmap/              # 히트맵 관련
│   │   ├── SkillHeatMap.tsx
│   │   ├── matrixBuilder.ts
│   │   ├── domainHeatmap.ts
│   │   ├── heatmapTypes.ts
│   │   └── skillSchema.ts
│   └── analysis/             # 분석 관련
│       ├── AnalysisDashboard.tsx
│       └── ReviewList.tsx
├── hooks/                    # 커스텀 훅
│   ├── useGetFeedContents.ts
│   ├── useGetHeatmapData.ts
│   ├── useGetContents.ts
│   └── useVisitorCount.ts
├── utils/                    # 유틸리티
│   ├── dateUtils.ts
│   ├── formatUtils.ts
│   ├── mdParseUtils.ts
│   ├── reviewUtils.ts
│   └── tilUtils.ts
└── define/                   # 상수 정의
    ├── heightDefines.ts
    ├── metaDefines.ts
    ├── reActiveConditionDefines.ts  # 재활성 적용 도메인 설정
    ├── tilDefines.ts
    └── urlDefines.ts
```

---

## 시작하기

### 설치

```bash
yarn install
```

### 개발 서버 실행

```bash
yarn dev
```

http://localhost:3000 에서 확인

### 빌드

```bash
yarn build
```

### 환경 변수 설정 (선택)

방문자 수 기능을 사용하려면 `.env.local` 파일 생성:

```env
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

---

## 배포

Vercel 배포 시 환경 변수를 Settings → Environment Variables에서 설정하세요.

---

## 라이선스

MIT License
