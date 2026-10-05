import { createCheckoutService, createLanguageService } from '@bigcommerce/checkout-sdk';
import { createBigCommercePaymentsFastlanePaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/bigcommerce-payments';
import React from 'react';

import { PaymentFormProvider, ThemeContext } from '@bigcommerce/checkout/contexts';
import { getPaymentFormServiceMock } from '@bigcommerce/checkout/test-mocks';
import { render } from '@bigcommerce/checkout/test-utils';

import BigCommercePaymentsFastlanePaymentMethod from './BigCommercePaymentsFastlanePaymentMethod';

describe('BigCommercePaymentsFastlanePaymentMethod', () => {
    const checkoutService = createCheckoutService();
    const checkoutState = checkoutService.getState();
    const paymentForm = getPaymentFormServiceMock();

    const method = {
        clientToken: 'token',
        config: {
            displayName: 'Credit Card',
            testMode: true,
        },
        id: 'bigcommerce_payments_fastlane',
        initializationData: {
            isAcceleratedCheckoutEnabled: true,
        },
        logoUrl: 'http://logo_url_path',
        method: 'credit-card',
        skipRedirectConfirmationAlert: false,
        supportedCards: ['VISA', 'MC'],
        type: 'PAYMENT_TYPE_API',
    };

    const props = {
        method,
        checkoutService,
        checkoutState,
        paymentForm: getPaymentFormServiceMock(),
        language: createLanguageService(),
        onUnhandledError: jest.fn(),
    };

    it('initializes BigCommercePaymentsFastlanePaymentMethod without enhanced styles when enhancedThemeV1 is disabled', () => {
        const initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);

        render(
            <ThemeContext.Provider value={{ enhancedThemeV1: false }}>
                <PaymentFormProvider paymentForm={paymentForm}>
                    <BigCommercePaymentsFastlanePaymentMethod {...props} />
                </PaymentFormProvider>
            </ThemeContext.Provider>,
        );

        expect(initializePayment).toHaveBeenCalledWith({
            methodId: props.method.id,
            integrations: [createBigCommercePaymentsFastlanePaymentStrategy],
            bigcommerce_payments_fastlane: {
                onInit: expect.any(Function),
                onChange: expect.any(Function),
                onError: expect.any(Function),
                onErrorLog: expect.any(Function),
            },
        });
    });

    it('initializes BigCommercePaymentsFastlanePaymentMethod with enhanced styles when enhancedThemeV1 is enabled', () => {
        const initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);

        render(
            <ThemeContext.Provider value={{ enhancedThemeV1: true }}>
                <PaymentFormProvider paymentForm={paymentForm}>
                    <BigCommercePaymentsFastlanePaymentMethod {...props} />
                </PaymentFormProvider>
            </ThemeContext.Provider>,
        );

        expect(initializePayment).toHaveBeenCalledWith({
            methodId: props.method.id,
            integrations: [createBigCommercePaymentsFastlanePaymentStrategy],
            bigcommerce_payments_fastlane: {
                onInit: expect.any(Function),
                onChange: expect.any(Function),
                onError: expect.any(Function),
                onErrorLog: expect.any(Function),
                styles: {
                    root: {
                        backgroundColorPrimary: '#f4f6ff',
                    },
                    input: {
                        borderRadius: '12px',
                    },
                },
            },
        });
    });

    it('deinitializes BigCommercePaymentsFastlanePaymentMethod with required props', () => {
        const deinitializePayment = jest
            .spyOn(checkoutService, 'deinitializePayment')
            .mockResolvedValue(checkoutState);

        const view = render(
            <PaymentFormProvider paymentForm={paymentForm}>
                <BigCommercePaymentsFastlanePaymentMethod {...props} />
            </PaymentFormProvider>,
        );

        view.unmount();

        expect(deinitializePayment).toHaveBeenCalledWith({
            methodId: props.method.id,
        });
    });
});
