import { isLanguageWindow } from './LanguageWindow';

describe('LanguageWindow', () => {
    it('returns true if the object has a language property', () => {
        const window = { language: {} };

        expect(isLanguageWindow(window as any)).toEqual(true);
    });

    it('returns false if the object does not have a language property', () => {
        const window = {};

        expect(isLanguageWindow(window as any)).toEqual(false);
    });
});
