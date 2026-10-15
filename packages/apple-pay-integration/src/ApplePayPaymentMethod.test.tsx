import {
    createCheckoutService,
    createLanguageService,
    type PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { createApplePayPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/apple-pay';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { CheckoutProvider } from '@bigcommerce/checkout/contexts';
import { type PaymentMethodProps } from '@bigcommerce/checkout/payment-integration-api';
import { getCustomer, getGuestCustomer } from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import ApplePayPaymentMethod from './ApplePayPaymentMethod';
import { getMethod } from './paymentMethods.mock';

describe('ApplePayPaymentMethod', () => {
    let checkoutService: ReturnType<typeof createCheckoutService>;
    let defaultProps: PaymentMethodProps;

    beforeEach(() => {
        checkoutService = createCheckoutService();

        defaultProps = {
            method: getMethod(),
            checkoutService,
            checkoutState: checkoutService.getState(),

            paymentForm: jest.fn() as unknown as PaymentMethodProps['paymentForm'],

            language: createLanguageService(),
            onUnhandledError: jest.fn(),
        };
    });

    it('initializes payment method when component mounts', () => {
        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(
            checkoutService.getState(),
        );

        render(<ApplePayPaymentMethod {...defaultProps} />);

        expect(checkoutService.initializePayment).toHaveBeenCalledWith({
            gatewayId: defaultProps.method.gateway,
            methodId: defaultProps.method.id,
            integrations: [createApplePayPaymentStrategy],
            applepay: {
                shippingLabel: defaultProps.language.translate('cart.shipping_text'),
                subtotalLabel: defaultProps.language.translate('cart.subtotal_text'),
            },
        });
    });

    it('catches error during apple pay initialization', async () => {
        jest.spyOn(checkoutService, 'initializePayment').mockRejectedValue(new Error('test error'));

        render(<ApplePayPaymentMethod {...defaultProps} />);

        await expect(checkoutService.initializePayment).rejects.toThrow('test error');
    });

    it('deinitializes payment method when component unmounts', () => {
        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(
            checkoutService.getState(),
        );

        const { unmount } = render(<ApplePayPaymentMethod {...defaultProps} />);

        unmount();

        expect(checkoutService.deinitializePayment).toHaveBeenCalled();
    });

    it('catches error during apple pay deinitialization', async () => {
        jest.spyOn(checkoutService, 'deinitializePayment').mockRejectedValue(
            new Error('test error'),
        );

        const { unmount } = render(<ApplePayPaymentMethod {...defaultProps} />);

        unmount();

        await expect(checkoutService.deinitializePayment).rejects.toThrow('test error');
    });
    describe('save payment method checkbox', () => {
        const SAVE_LABEL = 'Save this card for future transactions';
        const DISCLAIMER = /your card may be charged for future payments/;

        const renderWithConfig = (config: Partial<PaymentMethod['config']>) => {
            const method = { ...getMethod(), config: { ...getMethod().config, ...config } };

            return render(
                <CheckoutProvider checkoutService={checkoutService}>
                    <Formik initialValues={{}} onSubmit={noop}>
                        <ApplePayPaymentMethod {...defaultProps} method={method} />
                    </Formik>
                </CheckoutProvider>,
            );
        };

        beforeEach(() => {
            jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(
                checkoutService.getState(),
            );
            jest.spyOn(checkoutService.getState().data, 'getCustomer').mockReturnValue(
                getCustomer(),
            );
        });

        it('renders the checkbox for a signed-in shopper when vaulting is enabled', () => {
            renderWithConfig({ isVaultingEnabled: true });

            expect(screen.getByLabelText(SAVE_LABEL)).toBeInTheDocument();
            expect(screen.queryByText(DISCLAIMER)).not.toBeInTheDocument();
        });

        it('renders the checkbox and the disclaimer when every wallet payment is vaulted', () => {
            renderWithConfig({ isVaultingEnabled: true, shouldVaultAllPayments: true });

            expect(screen.getByLabelText(SAVE_LABEL)).toBeInTheDocument();
            expect(screen.getByText(DISCLAIMER)).toBeInTheDocument();
        });

        it('renders only the disclaimer for a guest shopper when every wallet payment is vaulted', () => {
            jest.spyOn(checkoutService.getState().data, 'getCustomer').mockReturnValue(
                getGuestCustomer(),
            );

            renderWithConfig({ isVaultingEnabled: true, shouldVaultAllPayments: true });

            expect(screen.queryByLabelText(SAVE_LABEL)).not.toBeInTheDocument();
            expect(screen.getByText(DISCLAIMER)).toBeInTheDocument();
        });

        it('renders nothing when vaulting is disabled', () => {
            renderWithConfig({ isVaultingEnabled: false });

            expect(screen.queryByLabelText(SAVE_LABEL)).not.toBeInTheDocument();
            expect(screen.queryByText(DISCLAIMER)).not.toBeInTheDocument();
        });
    });
});
