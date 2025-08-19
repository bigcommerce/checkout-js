import { type LanguageService } from '@bigcommerce/checkout-sdk';

import getTermsConditionsValidationSchema from './getTermsConditionsValidationSchema';

describe('getTermsConditionsValidationSchema', () => {
    let language: LanguageService;

    beforeEach(() => {
        language = {
            translate: jest.fn((key:string) => key),
        } as unknown as LanguageService;
    });

    it('should not require terms when isTermsConditionsRequired is false', async () => {
        const schema = getTermsConditionsValidationSchema({
            isTermsConditionsRequired: false,
            language,
        });

        await expect(schema.validate({})).resolves.toEqual({});
        await expect(schema.validate({ terms: true })).resolves.toEqual({ terms: true });
        await expect(schema.validate({ terms: false })).resolves.toEqual({ terms: false });
    });

    it('should require terms to be true when isTermsConditionsRequired is true', async () => {
        const schema = getTermsConditionsValidationSchema({
            isTermsConditionsRequired: true,
            language,
        });

        await expect(schema.validate({ terms: true })).resolves.toEqual({ terms: true });
        await expect(schema.validate({ terms: false })).rejects.toThrow('terms_and_conditions.agreement_required_error');
        await expect(schema.validate({})).resolves.toEqual({});
    });

    it('should use translated error message', async () => {
        const schema = getTermsConditionsValidationSchema({
            isTermsConditionsRequired: true,
            language,
        });

        await expect(schema.validate({ terms: false })).rejects.toThrow('terms_and_conditions.agreement_required_error');
        expect(language.translate).toHaveBeenCalledWith('terms_and_conditions.agreement_required_error');
    });
});
