import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import {
    createBigCommercePaymentsPayLaterPaymentStrategy,
    createBigCommercePaymentsPaymentStrategy,
} from '@bigcommerce/checkout-sdk/integrations/bigcommerce-payments';
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
        methodId: PaymentMethodId.BigCommercePaymentsPayLater,
        containerId: 'bigcommerce-payments-paylater-banner-container',
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
            integrations: [
                createBigCommercePaymentsPayLaterPaymentStrategy,
                createBigCommercePaymentsPaymentStrategy,
            ],
            bigcommerce_payments_paylater: {
                bannerContainerId: 'bigcommerce-payments-paylater-banner-container',
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
            integrations: [
                createBigCommercePaymentsPayLaterPaymentStrategy,
                createBigCommercePaymentsPaymentStrategy,
            ],
            bigcommerce_payments_paylater: {
                bannerContainerId: 'bigcommerce-payments-paylater-banner-container',
            },
        });

        expect(defaultProps.onUnhandledError).toHaveBeenCalled();
    });

    it('initializes BigCommercePaymentsPayLaterBanner with bigcommerce_payments method ID', () => {
        const propsWithBigCommercePayments = {
            ...defaultProps,
            methodId: PaymentMethodId.BigCommercePaymentsPayPal,
            containerId: 'bigcommerce-payments-banner-container',
        };

        const BigCommercePaymentsBannerTest = () => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <BigCommercePaymentsPayLaterBanner {...propsWithBigCommercePayments} />
                </LocaleContext.Provider>
            </CheckoutProvider>
        );

        render(<BigCommercePaymentsBannerTest />);

        expect(checkoutService.initializePayment).toHaveBeenCalledWith({
            methodId: PaymentMethodId.BigCommercePaymentsPayPal,
            integrations: [
                createBigCommercePaymentsPayLaterPaymentStrategy,
                createBigCommercePaymentsPaymentStrategy,
            ],
            bigcommerce_payments: {
                bannerContainerId: 'bigcommerce-payments-banner-container',
            },
        });

        expect(checkoutService.deinitializePayment).toHaveBeenCalledWith({
            methodId: PaymentMethodId.BigCommercePaymentsPayPal,
        });
    });
});
