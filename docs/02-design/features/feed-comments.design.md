# Feed Comments Design

> giscus 기반 GitHub Discussions 댓글 시스템 설계

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 독자가 피드 글에 질문/의견을 남길 수 있는 소통 채널 필요 |
| **WHO** | TIL 피드 독자 (주로 개발자), 글 작성자(kh1012) |
| **RISK** | GitHub 계정이 없는 사용자는 댓글 불가, giscus 외부 서비스 의존성 |
| **SUCCESS** | 댓글 영역이 기존 디자인과 자연스럽게 통합되고, 다크모드 지원 |
| **SCOPE** | 피드 상세 페이지(`/feeds/[slug]`)에만 적용 |

---

## 1. Overview

피드 상세 페이지 하단에 giscus 위젯을 삽입하여 GitHub Discussions 기반 댓글 시스템을 제공한다.

### 1.1 선택된 설계안: Option C (Pragmatic Balance) → 실제 적용: Option A 변형

- `@giscus/react` 패키지 사용
- `GiscusComments.tsx` 컴포넌트 1개 생성 (설정값 컴포넌트 내부 관리)
- `repoId`, `categoryId`는 컴포넌트에 직접 하드코딩 (단일 배포 프로젝트이므로 env var 분리 불필요)
- 기존 `useTheme()` 훅 직접 사용
- 관련글 추천(`RelatedFeeds`) 위에 댓글 섹션 배치

### 1.2 설계 결정 사유

| 대안 | 기각 사유 |
|------|-----------|
| Option A (Minimal) | 채택 — 단일 배포 프로젝트에서 env var 분리는 불필요한 복잡성 |
| Option B (Clean) | giscus 단일 위젯에 설정 파일 + 커스텀 훅은 과설계 |
| Option C (Pragmatic) | env var 분리가 이 프로젝트에서는 과설계로 판단, A로 간소화 |

## 2. Architecture

### 2.1 컴포넌트 구조

```
FeedDetailContent.tsx
├── <article> (본문 카드)
├── <GiscusComments />     ← NEW (관련글 위에 배치)
├── <RelatedFeeds />
└── <이전/다음 네비게이션>
```

### 2.2 데이터 흐름

```
ThemeProvider (theme state)
    ↓ useTheme()
GiscusComments
    ↓ theme → giscus theme prop
    ↓ @giscus/react <Giscus />
    ↓ iframe (giscus.app)
    ↓ GitHub Discussions API
```

## 3. Detailed Design

### 3.1 GiscusComments 컴포넌트

**파일**: `src/components/feeds/GiscusComments.tsx`

**Props**: 없음 (slug는 giscus가 `pathname` mapping으로 자동 처리)

**핵심 로직**:
1. `useTheme()`으로 현재 테마 조회
2. theme에 따라 giscus 테마 매핑: `light` → `light`, `dark` → `dark_dimmed`
3. `@giscus/react`의 `<Giscus />` 컴포넌트 렌더링

**giscus 설정**:

```typescript
{
  repo: "kh1012/feeds",
  repoId: "R_kgDOQeEtbQ",
  category: "comments",
  categoryId: "DIC_kwDOQeEtbc4C5O49",
  mapping: "pathname",
  strict: "0",
  reactionsEnabled: "1",
  emitMetadata: "1",
  inputPosition: "top",
  theme: theme === 'dark' ? 'dark_dimmed' : 'light',
  lang: "ko",
  loading: "lazy",
}
```

**스타일링**:
- 기존 카드 스타일과 동일한 래퍼: `bg-[var(--card-bg)]`, `rounded-xl`, `border border-[var(--card-border)]/80`
- 섹션 제목: "댓글" (h2 수준, `text-lg font-semibold`)
- 상단 여백: `mt-5` (본문 article과 동일 간격)
- 내부 패딩: `p-5 lg:p-8`

### 3.2 FeedDetailContent 수정

**파일**: `src/components/feeds/FeedDetailContent.tsx`

**변경 내용**:
- `GiscusComments` import 추가
- `</article>` 와 `<RelatedFeeds />` 사이에 `<GiscusComments />` 삽입

**삽입 위치**:
```tsx
</article>

{/* 댓글 */}
<GiscusComments />

{/* 관련 글 추천 */}
<RelatedFeeds currentDoc={doc} allDocs={docs} />
```

> GiscusComments 컴포넌트가 자체적으로 카드 래퍼와 반응형 마진(`mx-4 lg:mx-0`)을 포함

### 3.3 패키지 추가

```bash
yarn add @giscus/react
```

## 4. Dark Mode 연동

### 4.1 테마 매핑

| 앱 테마 | giscus 테마 | 사유 |
|---------|-------------|------|
| `light` | `light` | 기본 밝은 테마 |
| `dark` | `dark_dimmed` | `dark`보다 warm tone 디자인에 적합 |

### 4.2 실시간 전환

`@giscus/react`의 `<Giscus />` 컴포넌트는 `theme` prop 변경 시 자동으로 iframe에 postMessage를 전송하여 giscus 테마를 업데이트한다. 별도 이벤트 리스너 불필요.

## 5. UI Layout

### 5.1 피드 상세 페이지 구조 (변경 후)

```
┌─────────────────────────────────────┐
│  ← 목록으로                          │
├─────────────────────────────────────┤
│  [본문 카드]                         │
│  프로필 / 날짜                       │
│  제목                               │
│  도메인 / 카테고리 / 키워드           │
│  마크다운 본문                       │
│  GitHub에서 보기 링크                │
├─────────────────────────────────────┤
│  [댓글 섹션] ← NEW                  │
│  "댓글" 제목                        │
│  giscus iframe (lazy loaded)        │
├─────────────────────────────────────┤
│  [관련 글 추천]                      │
├─────────────────────────────────────┤
│  [이전/다음 네비게이션]              │
└─────────────────────────────────────┘
```

### 5.2 반응형 대응

| 뷰포트 | 댓글 섹션 스타일 |
|--------|-----------------|
| Desktop (lg+) | `px-0`, 카드 형태 (rounded-xl, border) |
| Mobile | `px-4`, 동일 카드 형태 |

giscus iframe 자체가 반응형이므로 별도 처리 불필요.

## 6. 외부 의존성

### 6.1 사전 설정 필요 (1회성)

| 순서 | 작업 | 설명 |
|------|------|------|
| 1 | GitHub Discussions 활성화 | `kh1012/feeds` 리포 Settings → Features → Discussions 체크 |
| 2 | giscus 앱 설치 | https://github.com/apps/giscus 에서 리포에 설치 |
| 3 | Discussion 카테고리 생성 | "comments" 카테고리 (Announcements 형식) |
| 4 | giscus.app에서 설정값 조회 | `repoId`, `categoryId` 확인 후 컴포넌트에 반영 |

### 6.2 패키지

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `@giscus/react` | latest | giscus React 래퍼 컴포넌트 |

## 7. Error Handling

| 상황 | 대응 |
|------|------|
| 설정값 오류 | giscus가 자체적으로 에러 표시 (iframe 내부) |
| GitHub Discussions 미활성화 | giscus가 "Discussion not found" 표시 |
| 네트워크 오류 | giscus iframe 로딩 실패 (빈 영역) → lazy loading이므로 페이지 성능 영향 없음 |
| giscus 서비스 장애 | 댓글 영역만 비표시, 나머지 페이지 정상 작동 |

## 8. Performance

- `loading: "lazy"` 설정으로 뷰포트 진입 시에만 iframe 로드
- 초기 페이지 로딩에 영향 없음 (giscus는 스크롤 후 로드)
- 번들 크기: `@giscus/react`는 ~2KB (gzip) 수준

## 9. Testing Checklist

| 항목 | 검증 방법 |
|------|-----------|
| 댓글 영역 표시 | 피드 상세 페이지 접속 시 댓글 섹션 렌더링 확인 |
| 다크모드 연동 | 테마 토글 시 giscus 테마 자동 변경 확인 |
| GitHub 로그인 | giscus "Sign in" 버튼 클릭 → GitHub OAuth 동작 확인 |
| 댓글 작성 | 로그인 후 댓글 작성/답글/리액션 동작 확인 |
| 반응형 | 모바일/데스크톱에서 댓글 영역 정상 표시 확인 |
| Lazy Loading | 스크롤 전 iframe 미로드, 스크롤 후 로드 확인 |
| 페이지 전환 | 다른 피드로 이동 시 댓글이 해당 글의 Discussion으로 변경 확인 |

## 10. Security

- giscus는 GitHub OAuth를 사용하므로 별도 인증 구현 불필요
- iframe sandbox 속성으로 XSS 방어 (giscus 기본 제공)
- `repoId`, `categoryId`는 공개 정보 (보안 민감하지 않음, GitHub API로 조회 가능)

## 11. Implementation Guide

### 11.1 구현 순서

| 순서 | 작업 | 파일 | 예상 변경량 |
|------|------|------|------------|
| 1 | 패키지 설치 | `package.json` | +1 dep |
| 2 | GiscusComments 컴포넌트 생성 | `src/components/feeds/GiscusComments.tsx` | ~30 lines (신규) |
| 4 | FeedDetailContent에 삽입 | `src/components/feeds/FeedDetailContent.tsx` | ~5 lines (수정) |

### 11.2 예상 규모

- 신규 파일: 1개
- 수정 파일: 2개 (FeedDetailContent.tsx, package.json)
- 총 변경량: ~40 lines

### 11.3 Session Guide

**Module Map**:

| Module | 범위 | 의존성 |
|--------|------|--------|
| module-1 | 패키지 설치 + 환경변수 + GiscusComments 컴포넌트 생성 | 없음 |
| module-2 | FeedDetailContent 통합 + 스타일 조정 | module-1 |

**추천**: 단일 세션으로 충분 (Small 규모)
