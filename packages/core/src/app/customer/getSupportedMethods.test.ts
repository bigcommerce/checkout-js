import { type PaymentMethod } from '@bigcommerce/checkout-sdk';

import { getSupportedMethodIds } from './getSupportedMethods';
import { getPaymentMethod } from '@bigcommerce/checkout/test-mocks';

const buildPaymentMethod = (id: string, isHidden?: boolean): PaymentMethod => ({
    ...getPaymentMethod(),
    id,
    initializationData: isHidden === undefined ? undefined : { isHidden },
});

describe('getSupportedMethods', () => {
    it('filters out unsupported methods', () => {
        const methods = ['amazonpay', 'test'];

        const filteredMethods = getSupportedMethodIds(methods);

        expect(filteredMethods).toEqual(['amazonpay']);
    });

    it('filters out supported methods flagged as hidden via initializationData.isHidden', () => {
        const methods = ['amazonpay', 'applepay', 'paypalcommerce'];
        const loadedPaymentMethods = [
            buildPaymentMethod('applepay', true),
            buildPaymentMethod('paypalcommerce', false),
        ];

        const filteredMethods = getSupportedMethodIds(methods, loadedPaymentMethods);

        expect(filteredMethods).toEqual(['amazonpay', 'paypalcommerce']);
    });

    it('keeps supported methods when initializationData is missing', () => {
        const methods = ['amazonpay', 'applepay'];
        const loadedPaymentMethods = [
            buildPaymentMethod('amazonpay'),
            buildPaymentMethod('applepay'),
        ];

        const filteredMethods = getSupportedMethodIds(methods, loadedPaymentMethods);

        expect(filteredMethods).toEqual(['amazonpay', 'applepay']);
    });

    it('ignores hidden methods that are not in the supported list', () => {
        const methods = ['amazonpay'];
        const loadedPaymentMethods = [
            buildPaymentMethod('authorizenet', true),
            buildPaymentMethod('amazonpay', false),
        ];

        const filteredMethods = getSupportedMethodIds(methods, loadedPaymentMethods);

        expect(filteredMethods).toEqual(['amazonpay']);
    });

    it('returns an empty array when every supported method is hidden', () => {
        const methods = ['applepay', 'googlepaybraintree'];
        const loadedPaymentMethods = [
            buildPaymentMethod('applepay', true),
            buildPaymentMethod('googlepaybraintree', true),
        ];

        const filteredMethods = getSupportedMethodIds(methods, loadedPaymentMethods);

        expect(filteredMethods).toEqual([]);
    });

    it('treats an empty loadedPaymentMethods list as no methods hidden', () => {
        const methods = ['amazonpay', 'applepay'];

        const filteredMethods = getSupportedMethodIds(methods, []);

        expect(filteredMethods).toEqual(['amazonpay', 'applepay']);
    });
});
