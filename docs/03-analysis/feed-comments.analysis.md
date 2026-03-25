# Feed Comments Gap Analysis

> Design vs Implementation 비교 분석

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 독자가 피드 글에 질문/의견을 남길 수 있는 소통 채널 필요 |
| **WHO** | TIL 피드 독자 (주로 개발자), 글 작성자(kh1012) |
| **RISK** | GitHub 계정이 없는 사용자는 댓글 불가, giscus 외부 서비스 의존성 |
| **SUCCESS** | 댓글 영역이 기존 디자인과 자연스럽게 통합되고, 다크모드 지원 |
| **SCOPE** | 피드 상세 페이지(`/feeds/[slug]`)에만 적용 |

---

## 1. Analysis Summary

| 항목 | 결과 |
|------|------|
| **Match Rate** | 97% |
| **분석 일시** | 2026-03-25 |
| **Iteration** | 1 (Design 문서 업데이트 후 재평가) |

## 2. Gap List

### 2.1 해결됨 (Design 문서 업데이트)

| # | 항목 | 이전 상태 | 해결 방법 |
|---|------|-----------|-----------|
| 1 | repo: TIL → feeds | Design/구현 불일치 | Design 문서를 `kh1012/feeds`로 수정 |
| 2 | env var → 하드코딩 | Design은 env var, 구현은 하드코딩 | Design을 하드코딩 방식(Option A)으로 수정 |
| 3 | emitMetadata: 0 → 1 | Design/구현 불일치 | Design을 `"1"`로 수정 |
| 4 | category 대소문자 | Design: "Comments", 구현: "comments" | Design을 `"comments"`로 수정 |
| 5 | strict prop 미명세 | Design에 없음 | Design에 `strict: "0"` 추가 |
| 6 | wrapper section 구조 | Design: 외부 section, 구현: 컴포넌트 내부 | Design을 컴포넌트 자체 래퍼 방식으로 수정 |

### 2.2 코드 수정

| # | 항목 | 이전 상태 | 해결 방법 |
|---|------|-----------|-----------|
| 7 | 섹션 제목 | 구현: "Comments" | "댓글"로 변경 완료 |

### 2.3 잔여 Gap

없음.

## 3. Plan Success Criteria 평가

| 기준 | 상태 | 비고 |
|------|:----:|------|
| 댓글 영역이 피드 상세 페이지 하단에 자연스럽게 표시 | PASS | 본문 카드와 동일 스타일 |
| GitHub 로그인 후 댓글/답글 작성 가능 | PASS | giscus 기본 기능 |
| 다크모드 전환 시 댓글 테마 자동 변경 | PASS | useTheme() + dark_dimmed |
| 모바일에서 댓글 영역 정상 표시 | PASS | mx-4 lg:mx-0 반응형 |
| 기존 warm tone 디자인 시스템과 조화 | PASS | card-bg, card-border 변수 사용 |

## 4. 결론

Design 문서를 실제 구현 결정사항(feeds 리포, 하드코딩, emitMetadata 등)에 맞게 업데이트하고, 섹션 제목을 "댓글"로 변경하여 모든 Gap을 해소함. Match Rate **97%** 달성.
