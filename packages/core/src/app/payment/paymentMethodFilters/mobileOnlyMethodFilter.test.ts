import { type PaymentMethod } from '@bigcommerce/checkout-sdk';

import { defaultCapabilities } from '@bigcommerce/checkout/contexts';
import { type PaymentMethodFilterContext } from '@bigcommerce/checkout/payment-integration-api';

import { getCheckout } from '../../checkout/checkouts.mock';
import { isMobile } from '../../common/utility';
import { getStoreConfig } from '../../config/config.mock';
import { getMobilePaymentMethod, getPaymentMethod } from '../payment-methods.mock';

import { mobileOnlyMethodFilter } from './mobileOnlyMethodFilter';

jest.mock('../../common/utility', () => ({
    ...jest.requireActual('../../common/utility'),
    isMobile: jest.fn(),
}));

describe('mobileOnlyMethodFilter', () => {
    const mobileOnlyMethod: PaymentMethod = getMobilePaymentMethod();
    const otherMethod: PaymentMethod = { ...getPaymentMethod(), id: 'authorizenet' };

    const buildContext = (): PaymentMethodFilterContext => ({
        capabilities: defaultCapabilities,
        checkout: getCheckout(),
        checkoutSettings: getStoreConfig().checkoutSettings,
        getPaymentMethod: jest.fn(),
        paymentProviderCustomer: undefined,
    });

    it('removes mobile-only methods on desktop', () => {
        jest.mocked(isMobile).mockReturnValue(false);

        expect(
            mobileOnlyMethodFilter.apply([mobileOnlyMethod, otherMethod], buildContext()),
        ).toEqual([otherMethod]);
    });

    it('keeps mobile-only methods on mobile devices', () => {
        jest.mocked(isMobile).mockReturnValue(true);

        const methods = [mobileOnlyMethod, otherMethod];

        expect(mobileOnlyMethodFilter.apply(methods, buildContext())).toEqual(methods);
    });

    it('keeps methods without the flag regardless of device', () => {
        jest.mocked(isMobile).mockReturnValue(false);

        const methods = [otherMethod];

        expect(mobileOnlyMethodFilter.apply(methods, buildContext())).toEqual(methods);
    });
});
