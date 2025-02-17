import { getStoreConfig } from '../config/config.mock';

import { getSupportedMethodIds } from './getSupportedMethods';

describe('getSupportedMethods', () => {
    const defaultStoreConfig = getStoreConfig();

    it('filters out unsupported methods', () => {
        const methods = ['amazonpay', 'test'];

        const filteredMethods = getSupportedMethodIds(methods);

        expect(filteredMethods).toEqual(['amazonpay']);
    });

    it('filters out applepay if not supported methods', () => {
        const methods = ['amazonpay', 'applepay'];

        defaultStoreConfig.checkoutSettings.features['PAYPAL-4324.applepay_web_browser_support'] = false;

        const filteredMethods = getSupportedMethodIds(methods, defaultStoreConfig.checkoutSettings);

        expect(filteredMethods).toEqual(['amazonpay']);
    });

    it('do not filter applepay it experiment is enabled', () => {
        const methods = ['amazonpay', 'applepay'];

        defaultStoreConfig.checkoutSettings.features['PAYPAL-4324.applepay_web_browser_support'] = true;

        const filteredMethods = getSupportedMethodIds(methods, defaultStoreConfig.checkoutSettings);

        expect(filteredMethods).toEqual(['amazonpay', 'applepay']);
    });

    it('do not filter applepay if experiment in undefined', () => {
        const methods = ['amazonpay', 'applepay'];

        const filteredMethods = getSupportedMethodIds(methods, defaultStoreConfig.checkoutSettings);

        expect(filteredMethods).toEqual(['amazonpay', 'applepay']);
    });
});
