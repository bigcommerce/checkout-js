import { createCheckoutService, createLanguageService } from '@bigcommerce/checkout-sdk';
import { createBigCommercePaymentsInvoicesPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/bigcommerce-payments';
import React from 'react';

import { type PaymentMethodProps } from '@bigcommerce/checkout/payment-integration-api';
import { render } from '@bigcommerce/checkout/test-utils';

import { getBigCommercePaymentsInvoicesMethod } from '../mocks/paymentMethods.mock';

import BigCommercePaymentsInvoicesPaymentMethod from './BigCommercePaymentsInvoicesPaymentMethod';

describe('BigCommercePaymentsInvoicesPaymentMethod', () => {
    let checkoutService: ReturnType<typeof createCheckoutService>;
    let defaultProps: PaymentMethodProps;

    beforeEach(() => {
        checkoutService = createCheckoutService();

        jest.spyOn(checkoutService.getState().data, 'isPaymentDataRequired').mockReturnValue(true);

        defaultProps = {
            method: getBigCommercePaymentsInvoicesMethod(),
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

        render(<BigCommercePaymentsInvoicesPaymentMethod {...defaultProps} />);

        expect(checkoutService.initializePayment).toHaveBeenCalledWith({
            gatewayId: defaultProps.method.gateway,
            methodId: defaultProps.method.id,
            integrations: [createBigCommercePaymentsInvoicesPaymentStrategy],
        });
    });

    it('catches error during initialization', async () => {
        jest.spyOn(checkoutService, 'initializePayment').mockRejectedValue(new Error('test error'));

        render(<BigCommercePaymentsInvoicesPaymentMethod {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultProps.onUnhandledError).toHaveBeenCalled();
    });

    it('deinitializes payment method when component unmounts', () => {
        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(
            checkoutService.getState(),
        );

        const { unmount } = render(<BigCommercePaymentsInvoicesPaymentMethod {...defaultProps} />);

        unmount();

        expect(checkoutService.deinitializePayment).toHaveBeenCalledWith({
            gatewayId: defaultProps.method.gateway,
            methodId: defaultProps.method.id,
        });
    });

    it('catches error during deinitialization', async () => {
        jest.spyOn(checkoutService, 'deinitializePayment').mockRejectedValue(
            new Error('test error'),
        );

        const { unmount } = render(<BigCommercePaymentsInvoicesPaymentMethod {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        unmount();

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultProps.onUnhandledError).toHaveBeenCalled();
    });

    it('does not initialize payment method when payment data is not required', () => {
        jest.spyOn(defaultProps.checkoutState.data, 'isPaymentDataRequired').mockReturnValue(false);
        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(
            checkoutService.getState(),
        );

        render(<BigCommercePaymentsInvoicesPaymentMethod {...defaultProps} />);

        expect(checkoutService.initializePayment).not.toHaveBeenCalled();
    });

    it('does not deinitialize payment method on unmount when payment data is not required', () => {
        jest.spyOn(defaultProps.checkoutState.data, 'isPaymentDataRequired').mockReturnValue(false);
        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(
            checkoutService.getState(),
        );

        const { unmount } = render(<BigCommercePaymentsInvoicesPaymentMethod {...defaultProps} />);

        unmount();

        expect(checkoutService.deinitializePayment).not.toHaveBeenCalled();
    });
});
