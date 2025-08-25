import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent } from 'react';

import {
    createLocaleContext,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/locale';
import { CheckoutProvider, PaymentMethodId } from '@bigcommerce/checkout/payment-integration-api';
import { getStoreConfig } from '@bigcommerce/checkout/test-mocks';
import { render } from '@bigcommerce/checkout/test-utils';

import PaypalCommerceCreditBanner from './PaypalCommerceCreditBanner';

describe('PaypalCommerceCreditBanner', () => {
    let PaypalCommerceCreditBannerTest: FunctionComponent;
    let localeContext: LocaleContextType;

    const checkoutService = createCheckoutService();
    const checkoutState = checkoutService.getState();
    const bannerContainerId = 'paypal-commerce-credit-banner-container';

    const defaultProps = {
        onUnhandledError: jest.fn(),
        containerId: bannerContainerId,
        methodId: 'paypalcommercecredit',
    };

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());

        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

        PaypalCommerceCreditBannerTest = () => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <PaypalCommerceCreditBanner {...defaultProps} />
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('initializes PaypalCommerceCreditBanner', () => {
        render(<PaypalCommerceCreditBannerTest />);

        expect(checkoutService.initializePayment).toHaveBeenCalledWith({
            methodId: PaymentMethodId.PaypalCommerceCredit,
            paypalcommercecredit: {
                bannerContainerId,
            },
        });

        expect(checkoutService.deinitializePayment).toHaveBeenCalledWith({
            methodId: PaymentMethodId.PaypalCommerceCredit,
        });
    });

    it('catches error during PaypalCommerceCreditBanner initialization', () => {
        jest.spyOn(checkoutService, 'initializePayment').mockImplementation(() => {
            throw new Error('something went wrong!');
        });

        render(<PaypalCommerceCreditBannerTest />);

        expect(checkoutService.initializePayment).toHaveBeenCalledWith({
            methodId: PaymentMethodId.PaypalCommerceCredit,
            paypalcommercecredit: {
                bannerContainerId,
            },
        });

        expect(defaultProps.onUnhandledError).toHaveBeenCalled();
    });
});
