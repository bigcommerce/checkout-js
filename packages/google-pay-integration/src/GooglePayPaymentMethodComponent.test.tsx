import '@testing-library/jest-dom';
import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    type LanguageService,
} from '@bigcommerce/checkout-sdk';
import { render } from '@testing-library/react';
import React from 'react';

import { type PaymentFormService } from '@bigcommerce/checkout/payment-integration-api';
import { getPaymentFormServiceMock, getPaymentMethod } from '@bigcommerce/checkout/test-mocks';

import GooglePayPaymentMethodComponent from './GooglePayPaymentMethodComponent';
import googlePayIntegrations from './googlePayIntegrations';

describe('GooglePayPaymentMethodComponent', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let paymentForm: PaymentFormService;
    let onUnhandledError: jest.Mock;

    const method = {
        ...getPaymentMethod(),
        id: 'googlepaybraintree',
        gateway: 'braintree',
    };

    const defaultProps = () => ({
        checkoutService,
        checkoutState,
        language: { translate: jest.fn() } as unknown as LanguageService,
        method,
        onUnhandledError,
        paymentForm,
    });

    beforeEach(() => {
        jest.useFakeTimers();

        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        paymentForm = getPaymentFormServiceMock();
        onUnhandledError = jest.fn();

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);
        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('hides the Place Order button on mount', () => {
        render(<GooglePayPaymentMethodComponent {...defaultProps()} />);

        expect(paymentForm.hidePaymentSubmitButton).toHaveBeenCalledWith(method, true);
    });

    it('does not call initializePayment before the DOM has updated', () => {
        render(<GooglePayPaymentMethodComponent {...defaultProps()} />);

        expect(checkoutService.initializePayment).not.toHaveBeenCalled();
    });

    it('calls initializePayment with container options after setTimeout(0)', () => {
        render(<GooglePayPaymentMethodComponent {...defaultProps()} />);

        jest.runAllTimers();

        expect(checkoutService.initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                methodId: method.id,
                gatewayId: method.gateway,
                integrations: googlePayIntegrations,
                [method.id]: {
                    container: 'checkout-payment-continue',
                    buttonColor: 'default',
                    buttonSizeMode: 'fill',
                    buttonType: 'pay',
                    loadingContainerId: 'checkout-app',
                    onError: expect.any(Function),
                },
            }),
        );
    });

    it('passes onUnhandledError as the onError callback', () => {
        render(<GooglePayPaymentMethodComponent {...defaultProps()} />);

        jest.runAllTimers();

        const call = (checkoutService.initializePayment as jest.Mock).mock.calls[0][0];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((call as Record<string, any>)[method.id].onError).toBe(onUnhandledError);
    });

    it('renders null — no visible DOM output', () => {
        const { container } = render(<GooglePayPaymentMethodComponent {...defaultProps()} />);

        expect(container).toBeEmptyDOMElement();
    });

    it('restores the Place Order button on unmount', () => {
        const { unmount } = render(<GooglePayPaymentMethodComponent {...defaultProps()} />);

        unmount();

        expect(paymentForm.hidePaymentSubmitButton).toHaveBeenCalledWith(method, false);
    });

    it('deinitializes payment on unmount', () => {
        const { unmount } = render(<GooglePayPaymentMethodComponent {...defaultProps()} />);

        unmount();

        expect(checkoutService.deinitializePayment).toHaveBeenCalledWith({
            methodId: method.id,
            gatewayId: method.gateway,
        });
    });

    it('cancels pending initializePayment when unmounting before setTimeout fires', () => {
        const { unmount } = render(<GooglePayPaymentMethodComponent {...defaultProps()} />);

        unmount();

        jest.runAllTimers();

        expect(checkoutService.initializePayment).not.toHaveBeenCalled();
    });

    it('calls onUnhandledError when initializePayment rejects', async () => {
        const error = new Error('initialization failed');

        jest.spyOn(checkoutService, 'initializePayment').mockRejectedValue(error);

        render(<GooglePayPaymentMethodComponent {...defaultProps()} />);

        jest.runAllTimers();

        await Promise.resolve();

        expect(onUnhandledError).toHaveBeenCalledWith(error);
    });

    it('does not call onUnhandledError for non-Error rejections', async () => {
        jest.spyOn(checkoutService, 'initializePayment').mockRejectedValue('string rejection');

        render(<GooglePayPaymentMethodComponent {...defaultProps()} />);

        jest.runAllTimers();

        await Promise.resolve();

        expect(onUnhandledError).not.toHaveBeenCalled();
    });
});
