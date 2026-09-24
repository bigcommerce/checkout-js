import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ExtensionService } from '@bigcommerce/checkout/checkout-extension';
import { CheckoutProvider, ExtensionProvider, LocaleContext } from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import { configure, render, screen, within } from '@bigcommerce/checkout/test-utils';

import { getPhysicalItem } from '../cart/lineItem.mock';
import { createErrorLogger } from '../common/error';
import { getStoreConfig } from '../config/config.mock';

import mapToOrderSummarySubtotalsProps from './mapToOrderSummarySubtotalsProps';
import { getOrder } from './orders.mock';
import { OrderSummaryDrawerV2 } from './OrderSummaryDrawerV2';

configure({ testIdAttribute: 'data-test' });

describe('OrderSummaryDrawerV2', () => {
    const localeContext = createLocaleContext(getStoreConfig());

    beforeAll(() => {
        window.PointerEvent = MouseEvent as unknown as typeof PointerEvent;
    });

    const renderComponent = (orderOverrides = {}) => {
        const order = { ...getOrder(), ...orderOverrides };
        const config = getStoreConfig();
        const checkoutService = createCheckoutService();
        const extensionService = new ExtensionService(checkoutService, createErrorLogger());

        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(config);
        jest.spyOn(checkoutService.getState().data, 'getOrder').mockReturnValue(order);

        return render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <ExtensionProvider extensionService={extensionService}>
                        <OrderSummaryDrawerV2
                            {...mapToOrderSummarySubtotalsProps(order)}
                            bundledItems={order.bundledItems}
                            lineItems={order.lineItems}
                            shopperCurrency={config.shopperCurrency}
                            storeCurrency={config.currency}
                            total={order.orderAmount}
                        />
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

    it('renders the collapsed bar with item count and order amount', () => {
        renderComponent({ orderAmount: 250 });

        expect(within(getCollapsedBar()).getByTestId('cart-item-count')).toHaveTextContent(
            '2 Items',
        );

        // 250 * 1.12 exchangeRate = $280.00
        expect(
            within(getCollapsedBar()).getByTestId('cart-outstanding-balance'),
        ).toHaveTextContent('$280.00 (USD)');
    });

    it('opens the sheet and shows the print link instead of an edit-cart link', async () => {
        renderComponent();

        await userEvent.click(getCollapsedBar());

        expectSheetOpen();

        expect(within(getSheet()).getByText('Print')).toBeInTheDocument();
        expect(within(getSheet()).queryByText('Edit Cart')).not.toBeInTheDocument();
    });

    it('excludes bundle children listed in order.bundledItems from the item count', () => {
        const order = getOrder();
        const bundleChild = { ...getPhysicalItem(), id: '777', addedByAttributeId: 'attr-1' };

        renderComponent({
            lineItems: {
                ...order.lineItems,
                physicalItems: [...order.lineItems.physicalItems, bundleChild],
            },
            bundledItems: { physicalItems: [bundleChild], digitalItems: [] },
        });

        expect(within(getCollapsedBar()).getByTestId('cart-item-count')).toHaveTextContent(
            '2 Items',
        );
    });
});
