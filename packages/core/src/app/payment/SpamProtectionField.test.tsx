import { type CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import React, { type FunctionComponent } from 'react';

import { LocaleProvider } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import SpamProtectionField, { type SpamProtectionProps } from './SpamProtectionField';

describe('SpamProtectionField', () => {
    let checkoutService: CheckoutService;
    let SpamProtectionTest: FunctionComponent<SpamProtectionProps>;

    beforeEach(() => {
        checkoutService = createCheckoutService();

        jest.spyOn(checkoutService, 'executeSpamCheck').mockResolvedValue(
            checkoutService.getState(),
        );

        SpamProtectionTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleProvider checkoutService={checkoutService}>
                    <SpamProtectionField {...props} />
                </LocaleProvider>
            </CheckoutProvider>
        );
    });

    it('notifies parent component if unable to verify', async () => {
        const handleError = jest.fn();
        const error = { type: 'test error' };

        jest.spyOn(checkoutService, 'executeSpamCheck').mockRejectedValue(error);

        render(<SpamProtectionTest onUnhandledError={handleError} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(handleError).toHaveBeenCalledWith(error);
    });

    it('does not notify parent component if unable to verify because of cancellation by user', async () => {
        const handleError = jest.fn();
        const error = { type: 'spam_protection_challenge_not_completed' };

        jest.spyOn(checkoutService, 'executeSpamCheck').mockRejectedValue(error);

        render(<SpamProtectionTest onUnhandledError={handleError} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(handleError).not.toHaveBeenCalledWith(error);
    });

    describe('if have not exceeded limit', () => {
        it('executes spam check on mount', () => {
            render(<SpamProtectionTest />);

            expect(checkoutService.executeSpamCheck).toHaveBeenCalled();
        });

        it('does not render verify message', () => {
            render(<SpamProtectionTest />);

            expect(screen.queryByTestId('spam-protection-verify-button')).not.toBeInTheDocument();
        });

        it('renders verify message if there is error', async () => {
            jest.spyOn(checkoutService, 'executeSpamCheck').mockRejectedValue(
                new Error('Unknown error'),
            );

            render(<SpamProtectionTest />);

            await new Promise((resolve) => process.nextTick(resolve));

            expect(screen.getByTestId('spam-protection-verify-button')).toBeInTheDocument();
        });
    });

    describe('if exceeded limit at least once', () => {
        it('does not execute spam check on mount', () => {
            render(<SpamProtectionTest didExceedSpamLimit />);

            expect(checkoutService.executeSpamCheck).not.toHaveBeenCalled();
        });

        it('executes spam check on click', async () => {
            render(<SpamProtectionTest didExceedSpamLimit />);

            await userEvent.click(screen.getByTestId('spam-protection-verify-button'));

            expect(checkoutService.executeSpamCheck).toHaveBeenCalled();
        });

        it('renders verify message', () => {
            render(<SpamProtectionTest didExceedSpamLimit />);

            expect(screen.getByTestId('spam-protection-verify-button')).toBeInTheDocument();
        });
    });
});
