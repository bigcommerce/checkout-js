import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { mount, render } from 'enzyme';
import React, { FunctionComponent } from 'react';

import { LocaleProvider } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { getBillingAddress } from '../billing/billingAddresses.mock';
import { getCheckout } from '../checkout/checkouts.mock';
import { getStoreConfig } from '../config/config.mock';

import CustomerInfo, { CustomerInfoProps } from './CustomerInfo';
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

    it('matches snapshot', () => {
        expect(render(<CustomerInfoTest />)).toMatchSnapshot();
    });

    describe('when customer is guest', () => {
        it("displays billing address's email", () => {
            const component = mount(<CustomerInfoTest />);

            expect(component.find('[data-test="customer-info"]').text()).toEqual(
                getBillingAddress().email,
            );
        });

        it('does not render sign-out button', () => {
            const component = mount(<CustomerInfoTest />);

            expect(component.exists('[testId="sign-out-link"]')).toBe(false);
        });
    });

    describe('when customer is signed in', () => {
        beforeEach(() => {
            jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());
        });

        it("displays customer's email", () => {
            const component = mount(<CustomerInfoTest />);

            expect(component.find('[data-test="customer-info"]').text()).toEqual(
                getCustomer().email,
            );
        });

        it('renders sign-out button if customer can sign out', () => {
            const component = mount(<CustomerInfoTest />);

            expect(component.exists('[testId="sign-out-link"]')).toBe(true);
        });

        it('signs out customer when they click on "sign out" button', () => {
            jest.spyOn(checkoutService, 'signOutCustomer').mockReturnValue(
                Promise.resolve(checkoutService.getState()),
            );

            const component = mount(<CustomerInfoTest />);

            component.find('[data-test="sign-out-link"]').simulate('click');

            expect(checkoutService.signOutCustomer).toHaveBeenCalled();
        });

        it('triggers completion callback if able to sign out', async () => {
            jest.spyOn(checkoutService, 'signOutCustomer').mockResolvedValue(
                checkoutService.getState(),
            );

            const handleSignOut = jest.fn();
            const component = mount(<CustomerInfoTest onSignOut={handleSignOut} />);

            component.find('[data-test="sign-out-link"]').simulate('click');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(handleSignOut).toHaveBeenCalledWith({ isCartEmpty: false });
        });

        it('triggers completion callback if able to sign out but cart is empty', async () => {
            jest.spyOn(checkoutService, 'signOutCustomer').mockRejectedValue({
                type: 'checkout_not_available',
            });

            const handleSignOut = jest.fn();
            const component = mount(<CustomerInfoTest onSignOut={handleSignOut} />);

            component.find('[data-test="sign-out-link"]').simulate('click');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(handleSignOut).toHaveBeenCalledWith({ isCartEmpty: true });
        });

        it('triggers error callback if unable to sign out', async () => {
            jest.spyOn(checkoutService, 'signOutCustomer').mockRejectedValue({
                type: 'unknown_error',
            });

            const handleError = jest.fn();
            const component = mount(<CustomerInfoTest onSignOutError={handleError} />);

            component.find('[data-test="sign-out-link"]').simulate('click');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(handleError).toHaveBeenCalledWith({ type: 'unknown_error' });
        });
    });
});
