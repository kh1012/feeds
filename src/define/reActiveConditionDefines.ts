/**
 * 재활성(Re-active) 시스템 적용 조건 정의
 *
 * 특정 도메인만 재활성 알림이 필요한 경우 여기서 설정합니다.
 * - 기술 학습 도메인(frontend 등): 주기적 복습 필요
 * - 메타/프로세스 도메인(scrum, meta 등): 복습 불필요
 */

/** 재활성이 적용되는 도메인 목록 */
export const RE_ACTIVE_ENABLED_DOMAINS: string[] = ['frontend'];

/**
 * 해당 도메인에 재활성 시스템이 적용되는지 확인
 * @param domain - 확인할 도메인명
 * @returns 재활성 적용 여부
 */
export function isReActiveEnabledDomain(domain: string): boolean {
  return RE_ACTIVE_ENABLED_DOMAINS.includes(domain.toLowerCase());
}
