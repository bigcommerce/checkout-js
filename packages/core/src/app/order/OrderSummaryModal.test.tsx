import { createCheckoutService, type Order } from '@bigcommerce/checkout-sdk';
import React from 'react';

import { CheckoutProvider, LocaleContext, LocaleProvider } from '@bigcommerce/checkout/contexts';
import { createLocaleContext, getLanguageService } from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';
import { SMALL_SCREEN_MAX_WIDTH } from '@bigcommerce/checkout/ui';

import { getPhysicalItem } from '../cart/lineItem.mock';
import { getStoreConfig } from '../config/config.mock';

import mapToOrderSummarySubtotalsProps from './mapToOrderSummarySubtotalsProps';
import { getOrder } from './orders.mock';
import { setBackorderDetailsExpanded } from './OrderSummaryItems';
import OrderSummaryModal from './OrderSummaryModal';

let order: Order;

jest.mock('./OrderSummaryPrice', () => (props: any) => <span {...props} />);

describe('OrderSummaryModal', () => {
    const checkoutService = createCheckoutService();
    const checkoutState = checkoutService.getState();
    const languageService = getLanguageService();

    beforeEach(() => {
        order = getOrder();

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());
        jest.spyOn(checkoutState.data, 'getOrder').mockReturnValue(order);
    });

    afterEach(() => {
        // The backorder toggle selection is module-scoped; reset it so it can't leak between tests.
        setBackorderDetailsExpanded(false);
    });

    it('renders order summary', () => {
        render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleProvider checkoutService={checkoutService} languageService={languageService}>
                    <OrderSummaryModal
                        isOpen={true}
                        {...mapToOrderSummarySubtotalsProps(order)}
                        items={order.lineItems}
                        shopperCurrency={getStoreConfig().shopperCurrency}
                        storeCurrency={getStoreConfig().currency}
                        total={order.orderAmount}
                    />
                </LocaleProvider>
            </CheckoutProvider>,
        );

        expect(screen.getByText('Order Summary')).toBeInTheDocument();

        const couponsInOrderSummary = screen.getAllByTestId('cart-coupon');

        expect(couponsInOrderSummary).toHaveLength(2);
        expect(couponsInOrderSummary[0]).toHaveTextContent(order.coupons[0].code);
        expect(couponsInOrderSummary[1]).toHaveTextContent(order.coupons[1].code);
        expect(
            screen.getByRole('heading', {
                name: `1 x ${order.lineItems.giftCertificates[0].name}`,
            }),
        ).toBeInTheDocument();
        expect(screen.getByText('Close')).toBeInTheDocument();
    });

    describe('when taxes are inclusive', () => {
        it('displays tax as summary section', () => {
            const taxIncludedOrder = {
                ...getOrder(),
                isTaxIncluded: true,
            };

            jest.spyOn(checkoutState.data, 'getOrder').mockReturnValue(taxIncludedOrder);

            render(
                <CheckoutProvider checkoutService={checkoutService}>
                    <LocaleProvider
                        checkoutService={checkoutService}
                        languageService={languageService}
                    >
                        <OrderSummaryModal
                            {...mapToOrderSummarySubtotalsProps(taxIncludedOrder)}
                            isOpen={true}
                            items={taxIncludedOrder.lineItems}
                            shopperCurrency={getStoreConfig().shopperCurrency}
                            storeCurrency={getStoreConfig().currency}
                            total={taxIncludedOrder.orderAmount}
                        />
                    </LocaleProvider>
                </CheckoutProvider>,
            );

            expect(screen.getByText('Order Summary')).toBeInTheDocument();

            const couponsInOrderSummary = screen.getAllByTestId('cart-coupon');

            expect(couponsInOrderSummary).toHaveLength(2);
            expect(couponsInOrderSummary[0]).toHaveTextContent(taxIncludedOrder.coupons[0].code);
            expect(couponsInOrderSummary[1]).toHaveTextContent(taxIncludedOrder.coupons[1].code);
            expect(
                screen.getByRole('heading', {
                    name: `1 x ${taxIncludedOrder.lineItems.giftCertificates[0].name}`,
                }),
            ).toBeInTheDocument();
            expect(screen.getByText('Tax Included in Total:')).toBeInTheDocument();
        });
    });

    describe('bundle pick-list rendering', () => {
        const localeContext = createLocaleContext(getStoreConfig());

        // Raw line items, exactly as the mobile drawer now passes them through: a bundle
        // parent plus a backordered child carrying a parentId. Before the fix the drawer
        // pre-stripped the child via removeBundledItems, so it never reached this point.
        const bundleItems = {
            customItems: [],
            physicalItems: [
                { ...getPhysicalItem(), id: '666', quantity: 1 },
                {
                    ...getPhysicalItem(),
                    id: '777',
                    name: 'Bundled Hat',
                    parentId: '666',
                    quantity: 1,
                    stockPosition: {
                        quantityBackordered: 2,
                        quantityOnHand: 3,
                        quantityOutOfStock: 0,
                        backorderMessage: 'Ships in 5 days',
                    },
                },
            ],
            digitalItems: [],
            giftCertificates: [],
        };

        beforeEach(() => {
            const config = getStoreConfig();

            jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
                ...config,
                inventorySettings: {
                    showQuantityOnBackorder: true,
                    showBackorderMessage: true,
                    showQuantityOnHand: false,
                    showBackorderAvailabilityPrompt: false,
                    backorderAvailabilityPrompt: null,
                    showDefaultShippingExpectationPrompt: false,
                    defaultShippingExpectationPrompt: null,
                    shouldDisplayBackorderMessagesOnStorefront: true,
                },
            });
        });

        const renderModal = () =>
            render(
                <CheckoutProvider checkoutService={checkoutService}>
                    <LocaleContext.Provider value={localeContext}>
                        <OrderSummaryModal
                            {...mapToOrderSummarySubtotalsProps(getOrder())}
                            isOpen={true}
                            items={bundleItems}
                            shopperCurrency={getStoreConfig().shopperCurrency}
                            storeCurrency={getStoreConfig().currency}
                            total={getOrder().orderAmount}
                        />
                    </LocaleContext.Provider>
                </CheckoutProvider>,
            );

        it('renders the bundle parent as a top-level line item', () => {
            renderModal();

            expect(
                screen.getByRole('heading', { name: `1 x ${getPhysicalItem().name}` }),
            ).toBeInTheDocument();
        });

        it('does not render the bundle child as a separate top-level line item', () => {
            renderModal();

            expect(
                screen.queryByRole('heading', { name: '1 x Bundled Hat' }),
            ).not.toBeInTheDocument();
        });
    });

    describe('is updated modal UI on mobile screens', () => {
        beforeAll(() => {
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: jest.fn().mockImplementation((query) => ({
                    matches: window.innerWidth <= SMALL_SCREEN_MAX_WIDTH,
                    media: query,
                    onchange: null,
                    addListener: jest.fn(),
                    removeListener: jest.fn(),
                    addEventListener: jest.fn(),
                    removeEventListener: jest.fn(),
                    dispatchEvent: jest.fn(),
                })),
            });
        });

        it('displays continue to checkout button', () => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                value: 500,
            });

            render(
                <CheckoutProvider checkoutService={checkoutService}>
                    <LocaleProvider
                        checkoutService={checkoutService}
                        languageService={languageService}
                    >
                        <OrderSummaryModal
                            {...mapToOrderSummarySubtotalsProps(getOrder())}
                            isOpen={true}
                            items={getOrder().lineItems}
                            shopperCurrency={getStoreConfig().shopperCurrency}
                            storeCurrency={getStoreConfig().currency}
                            total={getOrder().orderAmount}
                        />
                    </LocaleProvider>
                </CheckoutProvider>,
            );

            expect(screen.getByRole('button', { name: 'RETURN TO CHECKOUT' })).toBeInTheDocument();
        });
    });
});
