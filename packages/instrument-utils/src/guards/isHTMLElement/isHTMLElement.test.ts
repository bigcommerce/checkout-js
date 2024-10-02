import isHTMLElement from './isHTMLElement';

describe('isHTMLElement', () => {
    test('returns true for an actual HTMLElement', () => {
        const div = document.createElement('div');

        expect(isHTMLElement(div)).toBe(true);
    });

    test('returns false for non-HTMLElement objects', () => {
        expect(isHTMLElement(null)).toBe(false);
        expect(isHTMLElement(undefined)).toBe(false);
    });
});
