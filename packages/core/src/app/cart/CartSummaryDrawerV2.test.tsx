import { type Checkout, createCheckoutService } from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ExtensionService } from '@bigcommerce/checkout/checkout-extension';
import { CheckoutProvider, ExtensionProvider, LocaleContext } from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import { configure, render, screen, waitFor, within } from '@bigcommerce/checkout/test-utils';

import { getCheckout } from '../checkout/checkouts.mock';
import { createErrorLogger } from '../common/error';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';

import CartSummaryDrawerV2 from './CartSummaryDrawerV2';
import { getPicklistItem } from './lineItem.mock';

configure({ testIdAttribute: 'data-test' });

describe('CartSummaryDrawerV2 Component', () => {
    const localeContext = createLocaleContext(getStoreConfig());

    const renderComponent = (checkout: Checkout = getCheckout()) => {
        const checkoutService = createCheckoutService();
        const extensionService = new ExtensionService(checkoutService, createErrorLogger());

        jest.spyOn(checkoutService.getState().data, 'getCustomer').mockReturnValue(getCustomer());
        jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue(checkout);
        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(getStoreConfig());

        return render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <ExtensionProvider extensionService={extensionService}>
                        <CartSummaryDrawerV2 isMultiShippingMode={false} />
                    </ExtensionProvider>
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );
    };

    const getCollapsedBar = () => screen.getByTestId('cart-summary-collapsed-bar');
    const getSheet = () => screen.getByTestId('cart-summary-sheet');

    const expectSheetOpen = () => {
        expect(getCollapsedBar()).toHaveAttribute('aria-expanded', 'true');
        expect(getSheet()).toBeInTheDocument();
    };

    const expectSheetClosed = async () => {
        expect(getCollapsedBar()).toHaveAttribute('aria-expanded', 'false');

        await waitFor(() =>
            expect(screen.queryByTestId('cart-summary-sheet')).not.toBeInTheDocument(),
        );
    };

    it('renders collapsed bar with item count, outstanding balance and product image', () => {
        renderComponent();

        expect(within(getCollapsedBar()).getByTestId('cart-item-count')).toHaveTextContent(
            '2 Items',
        );

        expect(within(getCollapsedBar()).getByTestId('cart-outstanding-balance')).toHaveTextContent(
            '$212.80 (USD)',
        );

        expect(within(getCollapsedBar()).getByTestId('cart-item-image')).toHaveAttribute(
            'src',
            '/images/canvas-laundry-cart.jpg',
        );
    });

    it('excludes bundled items from the item count and image stack', () => {
        const checkout = getCheckout();

        renderComponent({
            ...checkout,
            cart: {
                ...checkout.cart,
                lineItems: {
                    physicalItems: getPicklistItem(),
                    digitalItems: [],
                    giftCertificates: [],
                    customItems: [],
                },
            },
        });

        expect(within(getCollapsedBar()).getByTestId('cart-item-count')).toHaveTextContent(
            '1 Item',
        );

        expect(screen.getByTestId('cart-summary-figure')).not.toHaveClass(
            'cart-summary-figure--stack',
        );
    });

    it('applies stack modifier when there is more than one line item', () => {
        renderComponent();

        expect(screen.getByTestId('cart-summary-figure')).toHaveClass('cart-summary-figure--stack');
    });

    it('toggles the sheet when the collapsed bar is clicked', async () => {
        renderComponent();

        await expectSheetClosed();

        await userEvent.click(getCollapsedBar());

        expectSheetOpen();

        await userEvent.click(getCollapsedBar());

        await expectSheetClosed();
    });

    it('toggles the sheet with Enter and Space keys', async () => {
        renderComponent();

        await userEvent.tab();

        expect(getCollapsedBar()).toHaveFocus();

        await userEvent.keyboard('{Enter}');

        expectSheetOpen();

        await userEvent.keyboard('{Escape}');

        await expectSheetClosed();

        expect(getCollapsedBar()).toHaveFocus();

        await userEvent.keyboard('[Space]');

        expectSheetOpen();
    });

    it('closes the sheet with the Escape key', async () => {
        renderComponent();

        await userEvent.click(getCollapsedBar());

        expectSheetOpen();

        await userEvent.keyboard('{Escape}');

        await expectSheetClosed();
    });

    it('closes the sheet when the backdrop is clicked', async () => {
        renderComponent();

        await userEvent.click(getCollapsedBar());

        expectSheetOpen();

        await userEvent.click(screen.getByTestId('cart-summary-backdrop'));

        await expectSheetClosed();
    });
});
