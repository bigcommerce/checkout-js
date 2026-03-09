import hideEditCartLink from './hideEditCartLink';

describe('hideEditCartLink', () => {
    it('returns true when isBuyNowCart is true', () => {
        expect(hideEditCartLink(true, false)).toBe(true);
    });

    it('returns true when disableEditCart is true', () => {
        expect(hideEditCartLink(false, true)).toBe(true);
    });

    it('returns true when both are true', () => {
        expect(hideEditCartLink(true, true)).toBe(true);
    });

    it('returns false when both are false', () => {
        expect(hideEditCartLink(false, false)).toBe(false);
    });
});
