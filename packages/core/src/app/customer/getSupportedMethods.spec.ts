import { getSupportedMethodIds } from './getSupportedMethods';

describe('getSupportedMethods', () => {
    it('filters out unsupported methods', () => {
        const methods = ['amazonpay', 'test'];

        const filteredMethods = getSupportedMethodIds(methods);

        expect(filteredMethods).toEqual(['amazonpay']);
    });

    it('filters out applepay if not supported methods', () => {
        const methods = ['amazonpay', 'applepay'];

        const filteredMethods = getSupportedMethodIds(methods);

        expect(filteredMethods).toEqual(['amazonpay']);
    });

    it('do not filter applepay it experiment is enabled', () => {
        const methods = ['amazonpay', 'applepay'];

        const filteredMethods = getSupportedMethodIds(methods, { 'PAYPAL-4324.applepay_web_browser_support': true });

        expect(filteredMethods).toEqual(['amazonpay', 'applepay']);
    });
});
