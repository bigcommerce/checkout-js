import { SMALL_SCREEN_MAX_WIDTH } from "./breakpoints";
import isSmallScreen from "./isSmallScreen";

describe('isSmallScreen', () => {
    beforeAll(() => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockImplementation(query => ({
                matches: window.innerWidth <= SMALL_SCREEN_MAX_WIDTH,
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            })),
        });
    });

    it('returns true for screens less than 551px', () => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            value: 500,
        });

        expect(isSmallScreen()).toBe(true);
    });

    it('returns false for screens more than 551px', () => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            value: 552,
        });

        expect(isSmallScreen()).toBe(false);
    });
});
