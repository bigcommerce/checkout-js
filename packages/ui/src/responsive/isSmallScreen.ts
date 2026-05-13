import { SMALL_SCREEN_MAX_WIDTH } from './breakpoints';

let query: MediaQueryList;

export function isSmallScreen() {
    query = window.matchMedia(`(max-width: ${SMALL_SCREEN_MAX_WIDTH}px)`);

    return query.matches;
}
