import masterpassFormatLocale from './masterpassFormatLocale';

describe('formatLocale', () => {
    it('fixes the format of locales with a dash', () => {
        expect(masterpassFormatLocale('en-us')).toBe('en_us');
    });

    it('fixes the format of locales in uppercase', () => {
        expect(masterpassFormatLocale('FR')).toBe('fr');
    });

    it('maintains the value of valid locale', () => {
        expect(masterpassFormatLocale('uk_ua')).toBe('uk_ua');
    });

    it('maintains the value of invalid locale', () => {
        expect(masterpassFormatLocale('invalid_data')).toBe('invalid_data');
    });
});
