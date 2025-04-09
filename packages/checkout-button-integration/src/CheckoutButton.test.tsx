import { createCheckoutService, createLanguageService } from '@bigcommerce/checkout-sdk';
import React from 'react';

import { CheckoutButtonProps } from '@bigcommerce/checkout/payment-integration-api';
import { render } from '@bigcommerce/checkout/test-utils';

import CheckoutButton from './CheckoutButton';

describe('CheckoutButton', () => {
    let defaultProps: CheckoutButtonProps;
    let checkoutService: ReturnType<typeof createCheckoutService>;

    beforeEach(() => {
        checkoutService = createCheckoutService();

        defaultProps = {
            checkoutService,
            checkoutState: checkoutService.getState(),
            containerId: 'button-container',
            language: createLanguageService(),
            methodId: 'foobar',
            onUnhandledError: jest.fn(),
            onWalletButtonClick: jest.fn(),
        };
    });

    it('initializeCustomer is called when component is mounted', () => {
        jest.spyOn(checkoutService, 'initializeCustomer').mockResolvedValue(
            checkoutService.getState(),
        );
        render(<CheckoutButton {...defaultProps} />);

        expect(checkoutService.initializeCustomer).toHaveBeenCalledWith({
            methodId: 'foobar',
            foobar: {
                container: 'button-container',
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                onClick: expect.any(Function),
                onUnhandledError: defaultProps.onUnhandledError,
            },
        });
    });

    it('deinitializeCustomer is called when component is unmounted', () => {
        jest.spyOn(checkoutService, 'deinitializeCustomer').mockResolvedValue(
            checkoutService.getState(),
        );

        const { unmount } = render(<CheckoutButton {...defaultProps} />);

        unmount();
        expect(checkoutService.deinitializeCustomer).toHaveBeenCalledWith({
            methodId: 'foobar',
        });
    });
});
