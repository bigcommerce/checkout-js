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

import BraintreePaypalCreditBanner from './BraintreePaypalCreditBanner';

describe('BraintreePaypalCreditBanner', () => {
    let BraintreePaypalCreditBannerTest: FunctionComponent;
    let localeContext: LocaleContextType;

    const checkoutService = createCheckoutService();
    const checkoutState = checkoutService.getState();
    const bannerContainerId = 'braintree-credit-banner-container';
    const defaultProps = {
        containerId: bannerContainerId,
        methodId: PaymentMethodId.BraintreePaypalCredit,
        onUnhandledError: jest.fn(),
    };

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());

        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

        BraintreePaypalCreditBannerTest = () => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <BraintreePaypalCreditBanner {...defaultProps} />
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('initializes BraintreePaypalCreditBanner', () => {
        render(<BraintreePaypalCreditBannerTest />);

        expect(checkoutService.initializePayment).toHaveBeenCalledWith({
            methodId: PaymentMethodId.BraintreePaypalCredit,
            braintree: {
                bannerContainerId,
            },
        });

        expect(checkoutService.deinitializePayment).toHaveBeenCalledWith({
            methodId: PaymentMethodId.BraintreePaypalCredit,
        });
    });

    it('catches error during BraintreePaypalCreditBanner initialization', () => {
        jest.spyOn(checkoutService, 'initializePayment').mockImplementation(() => {
            throw new Error('something went wrong!');
        });

        render(<BraintreePaypalCreditBannerTest />);

        expect(checkoutService.initializePayment).toHaveBeenCalledWith({
            methodId: PaymentMethodId.BraintreePaypalCredit,
            braintree: {
                bannerContainerId,
            },
        });

        expect(defaultProps.onUnhandledError).toHaveBeenCalled();
    });
});
