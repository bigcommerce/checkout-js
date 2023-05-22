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
});
