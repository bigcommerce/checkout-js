import '@testing-library/jest-dom';
import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen, waitFor } from '@bigcommerce/checkout/test-utils';

import { getAddressFormFields } from '../address/formField.mock';
import { getAddressContent } from '../address/SingleLineStaticAddress';
import { getCart } from '../cart/carts.mock';
import { getPhysicalItem } from '../cart/lineItem.mock';
import { getCheckout } from '../checkout/checkouts.mock';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';

import { getConsignment } from './consignment.mock';
import MultiShippingFormV2, { MultiShippingFormV2Props } from './MultiShippingFormV2';
import { getShippingAddress } from './shipping-addresses.mock';

describe('MultiShippingFormV2 Component', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: MultiShippingFormV2Props;
    let localeContext: LocaleContextType;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

        defaultProps = {
            customerMessage: 'x',
            countriesWithAutocomplete: [],
            isLoading: false,
            onCreateAccount: jest.fn(),
            onSignIn: jest.fn(),
            onUnhandledError: jest.fn(),
            onSubmit: jest.fn(),
        };

        jest.spyOn(checkoutState.data, 'getBillingAddressFields').mockReturnValue(
            getAddressFormFields(),
        );

        jest.spyOn(checkoutState.data, 'getShippingAddressFields').mockReturnValue(
            getAddressFormFields(),
        );
        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue({
            ...getCart(),
            lineItems: {
                physicalItems: [
                    {
                        ...getPhysicalItem(),
                        quantity: 3,
                    },
                ],
            },
        } as Cart);

        jest.spyOn(checkoutState.data, 'getShippingAddress').mockReturnValue(getShippingAddress());

        jest.spyOn(checkoutState.data, 'getBillingAddress').mockReturnValue(undefined);

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue({
            ...getCustomer(),
            addresses: [],
        });

        jest.spyOn(checkoutState.data, 'getConsignments').mockReturnValue([getConsignment()]);

        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());
    });

    describe('when user is guest', () => {
        beforeEach(() => {
            jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue({
                ...getCustomer(),
                isGuest: true,
                addresses: [],
            });
        });

        it('renders sign in message', async () => {
            render(
                <CheckoutProvider checkoutService={checkoutService}>
                    <LocaleContext.Provider value={localeContext}>
                        <ExtensionProvider checkoutService={checkoutService}>
                            <MultiShippingFormV2 {...defaultProps} />
                        </ExtensionProvider>
                    </LocaleContext.Provider>
                </CheckoutProvider>,
            );

            expect(screen.getByTestId('shipping-sign-in-link')).toBeInTheDocument();
            await userEvent.click(screen.getByTestId('shipping-sign-in-link'));
            await waitFor(() => {
                expect(defaultProps.onSignIn).toHaveBeenCalled();
            });
        });
    });

    describe('when user is signed in', () => {

        it('renders shipping destination 1', () => {
            const address = getShippingAddress();

            render(
                <CheckoutProvider checkoutService={checkoutService}>
                    <LocaleContext.Provider value={localeContext}>
                        <ExtensionProvider checkoutService={checkoutService}>
                            <MultiShippingFormV2 {...defaultProps} />
                        </ExtensionProvider>
                    </LocaleContext.Provider>
                </CheckoutProvider>,
            );

            expect(screen.getByText('Shipping destination 1')).toBeInTheDocument();
            expect(screen.getByText(getAddressContent(address))).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Add shipping destination' })).toBeInTheDocument();
        });
    });
});
