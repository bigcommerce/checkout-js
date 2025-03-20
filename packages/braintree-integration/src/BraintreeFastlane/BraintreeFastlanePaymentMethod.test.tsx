import { createCheckoutService, createLanguageService } from '@bigcommerce/checkout-sdk';
import React from 'react';

import { getPaymentFormServiceMock } from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import BraintreeFastlanePaymentMethod from './BraintreeFastlanePaymentMethod';
import { act } from 'react-dom/test-utils';

describe('BraintreeFastlanePaymentMethod', () => {
    const checkoutService = createCheckoutService();
    const checkoutState = checkoutService.getState();

    const method = {
        clientToken: 'token',
        config: {
            displayName: 'Credit Card',
            testMode: true,
        },
        id: 'braintreeacceleratedcheckout',
        initializationData: {
            isAcceleratedCheckoutEnabled: true,
        },
        logoUrl: 'http://logo_url_path',
        method: 'credit-card',
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
        initializePayment: jest.fn(),
    };

    it('initializes BraintreeFastlanePaymentMethod with required props', () => {
        const initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);

        render(<BraintreeFastlanePaymentMethod {...props} />);

        expect(initializePayment).toHaveBeenCalledWith({
            methodId: props.method.id,
            braintreefastlane: {
                onInit: expect.any(Function),
                onChange: expect.any(Function),
                threeDSecure: {
                    addFrame: expect.any(Function),
                    removeFrame: expect.any(Function),
                },
            },
        });
    });

    it('deinitializes BraintreeFastlanePaymentMethod with required props', () => {
        const deinitializePayment = jest
            .spyOn(checkoutService, 'deinitializePayment')
            .mockResolvedValue(checkoutState);

        const view = render(<BraintreeFastlanePaymentMethod {...props} />);

        view.unmount();

        expect(deinitializePayment).toHaveBeenCalledWith({
            methodId: props.method.id,
        });
    });

    it('renders 3DS modal when content is set', async () => {
        const initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);

        render(<BraintreeFastlanePaymentMethod {...props} />);

        await act(async () => {
            await initializePayment;
        });

        // @ts-ignore
        const addFrame = initializePayment.mock.calls[0][0].braintreefastlane.threeDSecure.addFrame;

        act(() => {
            addFrame(null, document.createElement('div'), jest.fn());
        });

        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
});
