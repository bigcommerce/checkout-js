import { createLanguageService, LanguageService } from '@bigcommerce/checkout-sdk';

import { formFieldData } from '../components';

import getBraintreeAchValidationSchema from './getBraintreeAchValidationSchema';
import { getValidData } from './validation-schemas.mock';

describe('getBraintreeAchValidationSchema()', () => {
    let language: LanguageService;
    let validData: { [fieldName: string]: string };

    beforeEach(() => {
        language = createLanguageService();

        jest.spyOn(language, 'translate').mockImplementation((key) => key);

        validData = getValidData();
    });

    it('data validation was successful', () => {
        const schema = getBraintreeAchValidationSchema({
            formFieldData,
            language,
        });

        expect(schema.validateSync(validData)).toEqual(validData);
    });

    it('returns error if account number is missing', () => {
        const schema = getBraintreeAchValidationSchema({
            formFieldData,
            language,
        });

        expect(() => schema.validateSync({ ...validData, accountNumber: '' })).toThrow(
            'payment.errors.account_number_required_error',
        );
    });

    it('returns error if routing number is missing', () => {
        const schema = getBraintreeAchValidationSchema({
            formFieldData,
            language,
        });

        expect(() => schema.validateSync({ ...validData, routingNumber: '' })).toThrow(
            'payment.errors.routing_number_required_error',
        );
    });
});
