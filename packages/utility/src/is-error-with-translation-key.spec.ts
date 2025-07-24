import isErrorWithTranslationKey from './is-error-with-translation-key';

describe('isErrorWithTranslationKey', () => {
    it('returns true if translation key is present', () => {
        const error = {
            translationKey: 'payment.errors.invalid_request',
        };

        expect(isErrorWithTranslationKey(error)).toBe(true);
    });
});
