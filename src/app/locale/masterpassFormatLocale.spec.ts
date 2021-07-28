import masterpassFormatLocale from './masterpassFormatLocale';

describe('formatLocale', () => {
    it('fixes the format of locales with a dash', () => {
        expect(masterpassFormatLocale('en-us'))
        .toBe('en_us');
    });

    it('fills language string with default country code', () => {
        expect(masterpassFormatLocale('FR'))
        .toBe('fr_fr');
    });

    it('corrects locale with unsupported country for a given language', () => {
        expect(masterpassFormatLocale('zh_mx'))
        .toBe('zh_sg');
    });

    it('uses a default locale with unsupported languages', () => {
        expect(masterpassFormatLocale('tr'))
        .toBe('en_us');
    });

    it('uses a default locale with invalid input', () => {
        expect(masterpassFormatLocale('esp_mex'))
        .toBe('en_us');
    });

    it('only uses the valid part of a string', () => {
        expect(masterpassFormatLocale('es_mx_invalid_data'))
        .toBe('es_mx');
    });

    it('uses the default country with invalid countries', () => {
        expect(masterpassFormatLocale('es_mex'))
        .toBe('es_es');
    });

    it('maintains the value of valid locale', () => {
        expect(masterpassFormatLocale('uk_ua'))
        .toBe('uk_ua');
    });
});
