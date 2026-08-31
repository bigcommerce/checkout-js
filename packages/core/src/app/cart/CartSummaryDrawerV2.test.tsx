import { type Checkout, createCheckoutService } from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ExtensionService } from '@bigcommerce/checkout/checkout-extension';
import { CheckoutProvider, ExtensionProvider, LocaleContext } from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import {
    act,
    configure,
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from '@bigcommerce/checkout/test-utils';

import { getCheckout } from '../checkout/checkouts.mock';
import { createErrorLogger } from '../common/error';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';

import CartSummaryDrawerV2 from './CartSummaryDrawerV2';
import { getPicklistItem } from './lineItem.mock';

configure({ testIdAttribute: 'data-test' });

describe('CartSummaryDrawerV2 Component', () => {
    const localeContext = createLocaleContext(getStoreConfig());

    beforeAll(() => {
        // jsdom lacks PointerEvent; a MouseEvent stand-in lets fireEvent carry clientY
        window.PointerEvent = MouseEvent as unknown as typeof PointerEvent;
    });

    const renderComponent = (checkout: Checkout = getCheckout()) => {
        const checkoutService = createCheckoutService();
        const extensionService = new ExtensionService(checkoutService, createErrorLogger());

        jest.spyOn(checkoutService.getState().data, 'getCustomer').mockReturnValue(getCustomer());
        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(getStoreConfig());

        const getCheckoutMock = jest
            .spyOn(checkoutService.getState().data, 'getCheckout')
            .mockReturnValue(checkout);

        const buildUi = () => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <ExtensionProvider extensionService={extensionService}>
                        <CartSummaryDrawerV2 isMultiShippingMode={false} />
                    </ExtensionProvider>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );

        const view = render(buildUi());

        return { ...view, getCheckoutMock, rerenderComponent: () => view.rerender(buildUi()) };
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

    it('closes the sheet when the handle is swiped down', async () => {
        renderComponent();

        await userEvent.click(getCollapsedBar());

        expectSheetOpen();

        const handle = screen.getByTestId('cart-summary-sheet-handle');

        fireEvent.pointerDown(handle, { pointerId: 1, clientY: 100 });
        fireEvent.pointerUp(handle, { pointerId: 1, clientY: 200 });

        await expectSheetClosed();
    });

    it('keeps the sheet open when the handle swipe is too short', async () => {
        renderComponent();

        await userEvent.click(getCollapsedBar());

        expectSheetOpen();

        const handle = screen.getByTestId('cart-summary-sheet-handle');

        fireEvent.pointerDown(handle, { pointerId: 1, clientY: 100 });
        fireEvent.pointerUp(handle, { pointerId: 1, clientY: 120 });

        expectSheetOpen();
    });

    it('closes the sheet when the backdrop is clicked', async () => {
        renderComponent();

        await userEvent.click(getCollapsedBar());

        expectSheetOpen();

        await userEvent.click(screen.getByTestId('cart-summary-backdrop'));

        await expectSheetClosed();
    });

    it('slides the old balance out, shows dots, then slides the new balance in', () => {
        jest.useFakeTimers();

        try {
            const checkout = getCheckout();
            const { getCheckoutMock, rerenderComponent } = renderComponent(checkout);

            expect(screen.queryByTestId('loading-dots')).not.toBeInTheDocument();

            getCheckoutMock.mockReturnValue({ ...checkout, outstandingBalance: 300 });
            rerenderComponent();

            const balance = screen.getByTestId('cart-outstanding-balance');

            expect(screen.queryByTestId('loading-dots')).not.toBeInTheDocument();
            expect(balance).toHaveTextContent('$212.80 (USD)');

            act(() => {
                jest.advanceTimersByTime(200);
            });

            expect(within(balance).getByTestId('loading-dots')).toBeInTheDocument();
            expect(balance).toHaveAttribute('aria-busy', 'true');
            expect(balance).not.toHaveTextContent('$');
            expect(balance).not.toHaveTextContent('(USD)');

            act(() => {
                jest.advanceTimersByTime(1200);
            });

            expect(screen.queryByTestId('loading-dots')).not.toBeInTheDocument();
            expect(balance).toHaveTextContent('$336.00 (USD)');
        } finally {
            jest.useRealTimers();
        }
    });
});
