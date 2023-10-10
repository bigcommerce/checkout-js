import { CheckoutService, createCheckoutService, StandardError } from '@bigcommerce/checkout-sdk';
import { mount, render } from 'enzyme';
import React, { FunctionComponent } from 'react';

import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import SpamProtectionField, { SpamProtectionProps } from './SpamProtectionField';
import { LocaleProvider } from '@bigcommerce/checkout/locale';

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

    it('renders spam protection field', () => {
        expect(render(<SpamProtectionTest />)).toMatchSnapshot();
    });

    it('notifies parent component if unable to verify', async () => {
        const handleError = jest.fn();
        const error = { type: 'test error' };

        jest.spyOn(checkoutService, 'executeSpamCheck').mockRejectedValue(error);

        const component = mount(<SpamProtectionTest onUnhandledError={handleError} />);

        await new Promise((resolve) => process.nextTick(resolve));
        component.update();

        expect(handleError).toHaveBeenCalledWith(error);
    });

    it('does not notify parent component if unable to verify because of cancellation by user', async () => {
        const handleError = jest.fn();
        const error = { type: 'spam_protection_challenge_not_completed' };

        jest.spyOn(checkoutService, 'executeSpamCheck').mockRejectedValue(error);

        const component = mount(<SpamProtectionTest onUnhandledError={handleError} />);

        await new Promise((resolve) => process.nextTick(resolve));
        component.update();

        expect(handleError).not.toHaveBeenCalledWith(error);
    });

    describe('if have not exceeded limit', () => {
        it('executes spam check on mount', () => {
            mount(<SpamProtectionTest />);

            expect(checkoutService.executeSpamCheck).toHaveBeenCalled();
        });

        it('does not render verify message', () => {
            const component = mount(<SpamProtectionTest />);

            expect(component.exists('[data-test="spam-protection-verify-button"]')).toBeFalsy();
        });

        it('renders verify message if there is error', async () => {
            jest.spyOn(checkoutService, 'executeSpamCheck').mockRejectedValue(
                new Error('Unknown error'),
            );

            const component = mount(<SpamProtectionTest />);

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(component.exists('[data-test="spam-protection-verify-button"]')).toBeTruthy();
        });
    });

    describe('if exceeded limit at least once', () => {
        it('does not execute spam check on mount', () => {
            mount(<SpamProtectionTest didExceedSpamLimit />);

            expect(checkoutService.executeSpamCheck).not.toHaveBeenCalled();
        });

        it('executes spam check on click', () => {
            const component = mount(<SpamProtectionTest didExceedSpamLimit />);

            component.find('[data-test="spam-protection-verify-button"]').simulate('click');

            expect(checkoutService.executeSpamCheck).toHaveBeenCalled();
        });

        it('renders verify message', () => {
            const component = mount(<SpamProtectionTest didExceedSpamLimit />);

            expect(component.exists('[data-test="spam-protection-verify-button"]')).toBeTruthy();
        });
    });
});
