import { MOBILE_MAX_WIDTH } from './breakpoints';

let query: MediaQueryList;

export default function isMobileView() {
    query = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);

    return query.matches;
}
