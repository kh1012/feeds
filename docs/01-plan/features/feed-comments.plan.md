# Feed Comments Plan

> 피드 상세 페이지 하단에 giscus 기반 GitHub Discussions 댓글 시스템 추가

## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | 피드 댓글 시스템 (giscus) |
| 시작일 | 2026-03-25 |
| 예상 규모 | Small (컴포넌트 1개 + 설정) |

### Value Delivered

| 관점 | 설명 |
|------|------|
| **Problem** | 피드 글에 대한 피드백/토론 채널이 없어 독자와 소통 불가 |
| **Solution** | giscus 위젯으로 GitHub Discussions 기반 댓글 시스템 임베드 |
| **Function UX Effect** | 글 하단에서 바로 댓글/답글 작성, 리액션, 수정/삭제 가능 |
| **Core Value** | 독자 참여를 통한 TIL 콘텐츠 품질 향상 및 커뮤니티 형성 |

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 독자가 피드 글에 질문/의견을 남길 수 있는 소통 채널 필요 |
| **WHO** | TIL 피드 독자 (주로 개발자), 글 작성자(kh1012) |
| **RISK** | GitHub 계정이 없는 사용자는 댓글 불가, giscus 외부 서비스 의존성 |
| **SUCCESS** | 댓글 영역이 기존 디자인과 자연스럽게 통합되고, 다크모드 지원 |
| **SCOPE** | 피드 상세 페이지(`/feeds/[slug]`)에만 적용 |

---

## 1. 배경 및 목적

### 1.1 현재 상황
- 피드 상세 페이지에 글 본문, 관련글 추천, 이전/다음 네비게이션이 존재
- 독자가 글에 대한 피드백이나 질문을 남길 방법이 없음

### 1.2 목적
- 피드 글 하단에 댓글 시스템을 추가하여 독자 참여 유도
- GitHub Discussions를 백엔드로 활용하여 별도 DB/서버 불필요

## 2. 요구사항

### 2.1 기능 요구사항

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-01 | GitHub 로그인으로 댓글 작성 | Must |
| FR-02 | 댓글 목록 조회 (글별) | Must |
| FR-03 | 답글(대댓글/스레드) 작성 | Must |
| FR-04 | 본인 댓글 수정/삭제 | Must |
| FR-05 | 리액션(이모지) 기능 | Should |
| FR-06 | 다크모드 자동 연동 | Must |
| FR-07 | 기존 디자인 시스템과 스타일 통합 | Must |

### 2.2 비기능 요구사항

| ID | 요구사항 | 기준 |
|----|----------|------|
| NFR-01 | 초기 로딩 성능 | giscus iframe lazy loading |
| NFR-02 | 반응형 지원 | 모바일/데스크톱 모두 정상 표시 |
| NFR-03 | 접근성 | giscus 기본 접근성 준수 |

## 3. 기술 스택

| 구분 | 선택 | 사유 |
|------|------|------|
| 댓글 시스템 | giscus | GitHub Discussions 기반, 오픈소스, 무료 |
| 인증 | GitHub OAuth (giscus 내장) | 별도 인증 구현 불필요 |
| 저장소 | GitHub Discussions | 별도 DB 불필요, GitHub 리포와 통합 |
| 테마 | giscus 커스텀 테마 or 내장 테마 | 다크모드 자동 연동 |

## 4. 구현 범위

### 4.1 변경 대상 파일

| 파일 | 작업 | 설명 |
|------|------|------|
| `src/components/feeds/GiscusComments.tsx` | 신규 | giscus 위젯 래퍼 컴포넌트 |
| `src/components/feeds/FeedDetailContent.tsx` | 수정 | 댓글 컴포넌트 삽입 (관련글 위 또는 아래) |
| `package.json` | 수정 | @giscus/react 패키지 추가 |

### 4.2 외부 설정 (1회성)

| 작업 | 설명 |
|------|------|
| GitHub Discussions 활성화 | TIL 리포지토리에서 Discussions 기능 활성화 |
| giscus 앱 설치 | github.com/apps/giscus 에서 리포에 설치 |
| Discussion 카테고리 생성 | "Comments" 또는 "Announcements" 카테고리 설정 |

## 5. 구현 계획

### 5.1 단계

1. **패키지 설치**: `@giscus/react` 설치
2. **GiscusComments 컴포넌트 생성**: giscus 위젯 래퍼 (다크모드 연동 포함)
3. **FeedDetailContent에 삽입**: 관련글 추천 영역 바로 위에 댓글 섹션 배치
4. **스타일 조정**: 기존 카드 스타일과 통합 (border, radius, padding 일치)
5. **다크모드 테스트**: 테마 전환 시 giscus 테마도 동적 변경

### 5.2 giscus 설정 값

```typescript
{
  repo: "kh1012/feeds",
  repoId: "...",                // giscus.app에서 조회
  category: "Comments",         // Discussion 카테고리
  categoryId: "...",            // giscus.app에서 조회
  mapping: "pathname",          // URL pathname으로 Discussion 매핑
  reactionsEnabled: "1",        // 리액션 활성화
  emitMetadata: "0",
  inputPosition: "top",         // 입력창 위치 (상단)
  theme: "preferred_color_scheme", // 시스템 테마 따름 또는 동적 전환
  lang: "ko",                   // 한국어
}
```

## 6. 제약 사항 및 리스크

| 리스크 | 영향 | 대응 |
|--------|------|------|
| GitHub 계정 필수 | 비개발자 댓글 불가 | 대상 독자가 개발자이므로 수용 가능 |
| giscus 서비스 의존 | 서비스 장애 시 댓글 불가 | 오픈소스이므로 셀프호스팅 가능 |
| Discussion 카테고리 미설정 | 댓글 저장 실패 | 구현 전 사전 설정 필수 |
| repoId/categoryId 미확인 | 빌드 시 하드코딩 필요 | giscus.app에서 조회 후 환경변수로 관리 |

## 7. 성공 기준

| 기준 | 측정 방법 |
|------|-----------|
| 댓글 영역이 피드 상세 페이지 하단에 자연스럽게 표시 | 시각적 확인 |
| GitHub 로그인 후 댓글/답글 작성 가능 | 기능 테스트 |
| 다크모드 전환 시 댓글 테마 자동 변경 | 테마 전환 테스트 |
| 모바일에서 댓글 영역 정상 표시 | 반응형 테스트 |
| 기존 warm tone 디자인 시스템과 조화 | 시각적 확인 |
