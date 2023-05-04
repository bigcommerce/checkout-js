import { createLanguageService, LanguageService } from '@bigcommerce/checkout-sdk';

import { formFieldData } from '../components';
import {
    AccountTypes,
    OwnershipTypes,
} from '../components/BraintreeAchPaymentForm/braintreeAchPaymentFormConfig';

import getBraintreeAchValidationSchema from './getBraintreeAchValidationSchema';

describe('getBraintreeAchValidationSchema()', () => {
    let language: LanguageService;
    let validData: { [fieldName: string]: string };

    beforeEach(() => {
        language = createLanguageService();

        jest.spyOn(language, 'translate').mockImplementation((key) => key);

        validData = {
            ownershipType: OwnershipTypes.Personal,
            accountType: AccountTypes.Savings,
            accountNumber: '1000000000',
            routingNumber: '011000015',
            businessName: 'Business Name',
            firstName: 'Test',
            lastName: 'Tester',
            address1: '12345 Testing Way',
            address2: '',
            postalCode: 'US',
            countryCode: '95555',
            city: 'Some City',
            stateOrProvinceCode: 'CA',
        };
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
