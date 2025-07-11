// copied from core package
export const MOBILE_MAX_WIDTH = 968;
export const SMALL_SCREEN_MAX_WIDTH = 551;

let query: MediaQueryList;

export function isMobileView() {
    query = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);

    return query.matches;
}
