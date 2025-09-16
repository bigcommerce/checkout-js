import '@testing-library/jest-dom';
import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import React from 'react';

import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import {
    createLocaleContext,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getCheckout } from '../checkout/checkouts.mock';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';
import { getConsignment } from '../shipping/consignment.mock';

import CartSummary from './CartSummary';
import CartSummaryDrawer from './CartSummaryDrawer';

describe('Edit Cart Component', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let localeContext: LocaleContextType;

    beforeEach(() => {
        Object.defineProperty(window, 'location', {
            value: {
                assign: jest.fn(),
                pathname: '/checkout',
            },
            writable: true,
        });

        localeContext = createLocaleContext(getStoreConfig());
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue({
            ...getCustomer(),
            addresses: [],
        });

        jest.spyOn(checkoutState.data, 'getConsignments').mockReturnValue([getConsignment()]);

        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());
    });

    it('renders confirmation modal when using multi-shipping and CartSummary', () => {
        render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <ExtensionProvider checkoutService={checkoutService}>
                        <CartSummary isMultiShippingMode={true} />
                    </ExtensionProvider>
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        screen.getByText('Edit Cart').click();
        expect(screen.getByRole('link', { name: 'Close' })).toBeInTheDocument();
        expect(screen.getAllByRole('alert')).toHaveLength(2);
        screen.getByText('Confirm').click();

        expect(window.location.assign).toHaveBeenCalledWith(
            'https://store-k1drp8k8.bcapp.dev/cart.php',
        );
    });

    it('renders confirmation modal when using multi-shipping and CartSummaryDawer', () => {
        render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <ExtensionProvider checkoutService={checkoutService}>
                        <CartSummaryDrawer isMultiShippingMode={true} />
                    </ExtensionProvider>
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        screen.getByText('Show Details').click();
        screen.getByText('Edit Cart').click();
        expect(screen.getAllByRole('link', { name: 'Close' })).toHaveLength(2);
        expect(screen.getAllByRole('alert')).toHaveLength(2);
        screen.getByText('Confirm').click();

        expect(window.location.assign).toHaveBeenCalledWith(
            'https://store-k1drp8k8.bcapp.dev/cart.php',
        );
    });
});
