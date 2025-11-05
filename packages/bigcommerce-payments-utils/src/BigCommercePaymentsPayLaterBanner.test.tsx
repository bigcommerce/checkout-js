import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import { createBigCommercePaymentsPayLaterPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/bigcommerce-payments';
import React, { type FunctionComponent } from 'react';

import {
    CheckoutProvider,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import { PaymentMethodId } from '@bigcommerce/checkout/payment-integration-api';
import { getStoreConfig } from '@bigcommerce/checkout/test-mocks';
import { render } from '@bigcommerce/checkout/test-utils';

import BigCommercePaymentsPayLaterBanner from './BigCommercePaymentsPayLaterBanner';

describe('BigCommercePaymentsPayLaterBanner', () => {
    let BigCommercePaymentsCreditBannerTest: FunctionComponent;
    let localeContext: LocaleContextType;

    const checkoutService = createCheckoutService();
    const checkoutState = checkoutService.getState();
    const defaultProps = {
        onUnhandledError: jest.fn(),
    };

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());

        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

        BigCommercePaymentsCreditBannerTest = () => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <BigCommercePaymentsPayLaterBanner {...defaultProps} />
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('initializes BigCommercePaymentsPayLaterBanner', () => {
        render(<BigCommercePaymentsCreditBannerTest />);

        expect(checkoutService.initializePayment).toHaveBeenCalledWith({
            methodId: PaymentMethodId.BigCommercePaymentsPayLater,
            integrations: [createBigCommercePaymentsPayLaterPaymentStrategy],
            bigcommerce_payments_paylater: {
                bannerContainerId: 'bigcommerce-payments-banner-container',
            },
        });

        expect(checkoutService.deinitializePayment).toHaveBeenCalledWith({
            methodId: PaymentMethodId.BigCommercePaymentsPayLater,
        });
    });

    it('catches error during BigCommercePaymentsPayLaterBanner initialization', () => {
        jest.spyOn(checkoutService, 'initializePayment').mockImplementation(() => {
            throw new Error('something went wrong!');
        });

        render(<BigCommercePaymentsCreditBannerTest />);

        expect(checkoutService.initializePayment).toHaveBeenCalledWith({
            methodId: PaymentMethodId.BigCommercePaymentsPayLater,
            integrations: [createBigCommercePaymentsPayLaterPaymentStrategy],
            bigcommerce_payments_paylater: {
                bannerContainerId: 'bigcommerce-payments-banner-container',
            },
        });

        expect(defaultProps.onUnhandledError).toHaveBeenCalled();
    });
});
