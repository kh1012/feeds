## frontmatter 샘플
---
type: "skill"
domain: "meta"
category: "learning-system"
topic: "skill-matrix-design"
updatedAt: "2025-11-30"

keywords:

- "skill-matrix"
- "taxonomy"
- "dynamic-category"
- "heatmap"
- "self-assessment"
- "frontend-skill-model"

relatedCategories:

- "javascript"
- "typescript"
- "react"
- "architecture"

---

## 기본적인 카테고리, 토픽 리스트 정의

export const baseCategories = [
'javascript',
'typescript',
'react',
'nextjs',
'state-management',
'server-state',
'performance',
'ui-ux',
'css',
'testing',
'build-infra',
'troubleshoot',
'meta',
] as const;

export type BaseCategory = (typeof baseCategories)[number];

export const baseTopics: Record<string, string[]> = {
javascript: [
// 기본기 & 메모리
'data-types-primitive', // number, string, boolean, null, undefined, symbol, bigint
'data-types-reference', // object, array, function, map, set 등
'value-vs-reference', // 값/참조, 얕은/깊은 복사
'stack-heap', // 콜스택 vs 힙
'memory-management', // 메모리 관리 개념
'garbage-collection', // GC, reachability

    // 실행 컨텍스트 & 렉시컬 환경
    'execution-context', // 전역/함수/모듈 컨텍스트
    'lexical-environment', // environment record, OER
    'scope-chain',
    'hoisting-deep-dive',
    'callstack-deep-dive',

    // this & 컨텍스트
    'this-binding',
    'call-apply-bind',
    'arrow-function-this',
    'method-context-loss',

    // 프로토타입 & 객체 모델
    'prototype-chain',
    'object-internals',
    'class-vs-prototype',

    // 비동기 & 런타임
    'event-loop-deep-dive',
    'microtask-queue',
    'task-queue',
    'render-queue',

],

typescript: [
// 기본 타입 & 리터럴
'ts-primitive-types',
'literal-types',
'widening-narrowing',
'any-vs-unknown',

    // 타입 시스템 원리
    'structural-typing',
    'type-narrowing',
    'control-flow-analysis',
    'excess-property-checks',

    // 제네릭 & 고급 타입
    'generics-deep-dive',
    'generic-constraints',
    'conditional-types',
    'infer-keyword',
    'distributive-conditional',
    'mapped-types-deep-dive',

    // tsconfig & 컴파일
    'tsconfig-strict-mode',
    'module-resolution',
    'declaration-files',

],

react: [
'component-lifecycle',
'hooks',
'memoization',
'context',
'error-boundary',
'suspense',
'hydration',
'key-mechanism',
'controlled',
'uncontrolled',
],

nextjs: [
'ssg',
'ssr',
'server-components',
'client-components',
'streaming',
'routing',
'middleware',
'edge-runtime',
'fetch-caching',
'hydration-mismatch',
],

'state-management': [
'store-architecture',
'selector-pattern',
'atomic-state',
'derived-state',
'side-effects',
'immutable-pattern',
'global-vs-local-store',
'performance-issue',
],

'server-state': [
'staleTime',
'cacheTime',
'queryKey',
'hydration',
'optimistic-update',
'infinite-query',
'mutation-flow',
'retry-backoff',
'prefetching',
'initialData',
],

performance: [
'rerender-causes',
'memoization',
'code-splitting',
'lazy-loading',
'throttle',
'debounce',
'concurrent-feature',
'profiling',
'expensive-op',
'web-vitals',
],

'ui-ux': [
'design-tokens',
'accessibility',
'semantic-html',
'feedback-pattern',
'skeleton',
'layout-composition',
'form-patterns',
'input-handling',
'list-virtualization',
],

css: [
'flex',
'grid',
'responsive',
'typography',
'custom-utilities',
'pseudo-element',
'variants',
'animations',
'theming',
'spacing-scale',
],

testing: [
'unit-test',
'integration-test',
'e2e-test',
'mocking',
'snapshot-test',
'test-pyramid',
'msw',
'regression-test',
],

'build-infra': [
'bundler',
'tree-shaking',
'code-splitting-build',
'build-optimization',
'ci',
'caching',
'static-assets',
'environment-config',
],

troubleshoot: [],

meta: [],
};
