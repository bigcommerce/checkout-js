/**
 * Returns true when the user has requested reduced motion (accessibility).
 */
export const prefersReducedMotion = (): boolean =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
