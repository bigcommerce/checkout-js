import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import React, { type FunctionComponent } from 'react';

import { LocaleProvider } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getBillingAddress } from '../billing/billingAddresses.mock';
import { getCheckout } from '../checkout/checkouts.mock';
import { getStoreConfig } from '../config/config.mock';

import CustomerInfo, { type CustomerInfoProps } from './CustomerInfo';
import { getCustomer, getGuestCustomer } from './customers.mock';

describe('CustomerInfo', () => {
    let CustomerInfoTest: FunctionComponent<CustomerInfoProps>;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

        jest.spyOn(checkoutState.data, 'getBillingAddress').mockReturnValue(getBillingAddress());

        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());

        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getGuestCustomer());

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        CustomerInfoTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleProvider checkoutService={checkoutService}>
                    <CustomerInfo {...props} />
                </LocaleProvider>
            </CheckoutProvider>
        );
    });

    describe('when customer is guest', () => {
        it("displays billing address's email", () => {
            const email = getBillingAddress().email ?? '';

            render(<CustomerInfoTest />);

            expect(screen.getByText(email)).toBeInTheDocument();
            expect(screen.queryByTestId('sign-out-link')).not.toBeInTheDocument();
        });
    });

    describe('when customer is signed in', () => {
        beforeEach(() => {
            jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());
        });

        it("displays customer's email", () => {
            render(<CustomerInfoTest />);

            expect(screen.getByText(getCustomer().email)).toBeInTheDocument();
        });

        it('renders sign-out button if customer can sign out', () => {
            render(<CustomerInfoTest />);

            expect(screen.getByTestId('sign-out-link')).toBeInTheDocument();
        });

        it('signs out customer when they click on "sign out" button', async () => {
            jest.spyOn(checkoutService, 'signOutCustomer').mockReturnValue(
                Promise.resolve(checkoutService.getState()),
            );

            render(<CustomerInfoTest />);

            await userEvent.click(screen.getByTestId('sign-out-link'));

            expect(checkoutService.signOutCustomer).toHaveBeenCalled();
        });

        it('triggers completion callback if able to sign out', async () => {
            jest.spyOn(checkoutService, 'signOutCustomer').mockResolvedValue(
                checkoutService.getState(),
            );

            const handleSignOut = jest.fn();

            render(<CustomerInfoTest onSignOut={handleSignOut} />);

            await userEvent.click(screen.getByTestId('sign-out-link'));

            await new Promise((resolve) => process.nextTick(resolve));

            expect(handleSignOut).toHaveBeenCalledWith({ isCartEmpty: false });
        });

        it('triggers completion callback if able to sign out but cart is empty', async () => {
            jest.spyOn(checkoutService, 'signOutCustomer').mockRejectedValue({
                type: 'checkout_not_available',
            });

            const handleSignOut = jest.fn();

            render(<CustomerInfoTest onSignOut={handleSignOut} />);

            await userEvent.click(screen.getByTestId('sign-out-link'));

            await new Promise((resolve) => process.nextTick(resolve));

            expect(handleSignOut).toHaveBeenCalledWith({ isCartEmpty: true });
        });

        it('triggers error callback if unable to sign out', async () => {
            jest.spyOn(checkoutService, 'signOutCustomer').mockRejectedValue({
                type: 'unknown_error',
            });

            const handleError = jest.fn();

            render(<CustomerInfoTest onSignOutError={handleError} />);

            await userEvent.click(screen.getByTestId('sign-out-link'));

            await new Promise((resolve) => process.nextTick(resolve));

            expect(handleError).toHaveBeenCalledWith({ type: 'unknown_error' });
        });

        it('redirects to storefront when experiment on and shouldRedirectToStorefrontForAuth is true', async () => {
            Object.defineProperty(window, 'location', {
                writable: true,
                value: {
                    // eslint-disable-next-line @typescript-eslint/no-misused-spread
                    ...window.location,
                    assign: jest.fn(),
                },
            });

            jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
                ...getStoreConfig(),
                checkoutSettings: {
                    ...getStoreConfig().checkoutSettings,
                    shouldRedirectToStorefrontForAuth: true,
                }
            });

            const expectedLogoutLink = getStoreConfig().links.logoutLink;
            const expectedCheckoutLink = getStoreConfig().links.checkoutLink;
        
            render(<CustomerInfoTest />);
        
            await userEvent.click(screen.getByTestId('sign-out-link'));

            expect(window.location.assign).toHaveBeenCalledWith(`${expectedLogoutLink}?redirectTo=${expectedCheckoutLink}`);
        });
    });
});
