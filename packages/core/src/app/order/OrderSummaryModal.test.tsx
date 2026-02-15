import { createCheckoutService, type Order } from '@bigcommerce/checkout-sdk';
import React from 'react';

import { LocaleProvider } from '@bigcommerce/checkout/contexts';
import { getLanguageService } from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../config/config.mock';
import { SMALL_SCREEN_MAX_WIDTH } from '../ui/responsive';

import mapToOrderSummarySubtotalsProps from './mapToOrderSummarySubtotalsProps';
import { getOrder } from './orders.mock';
import OrderSummaryModal from './OrderSummaryModal';

let order: Order;

jest.mock('./OrderSummaryPrice', () => (props: any) => (
    <span {...props} />
));

describe('OrderSummaryModal', () => {
    const checkoutService = createCheckoutService();
    const checkoutState = checkoutService.getState();

    beforeEach(() => {
        order = getOrder();

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());
    });

    it('renders order summary', () => {
        render(
            <OrderSummaryModal
                isOpen={true}
                {...mapToOrderSummarySubtotalsProps(order, true)}
                additionalLineItems="foo"
                items={order.lineItems}
                shopperCurrency={getStoreConfig().shopperCurrency}
                storeCurrency={getStoreConfig().currency}
                total={order.orderAmount}
            />,
        );

        expect(screen.getByText('Order Summary')).toBeInTheDocument();
        expect(screen.getByText(order.coupons[0].code)).toBeInTheDocument();
        expect(screen.getByText(order.coupons[1].code)).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: `1 x ${order.lineItems.giftCertificates[0].name}` })).toBeInTheDocument();
        expect(screen.getByText('foo')).toBeInTheDocument();
        expect(screen.getByText('Close')).toBeInTheDocument();
    });

    describe('when taxes are inclusive', () => {
        it('displays tax as summary section', () => {
            const taxIncludedOrder = {
                ...getOrder(),
                isTaxIncluded: true,
            };

            render(
                <OrderSummaryModal
                    {...mapToOrderSummarySubtotalsProps(taxIncludedOrder, true)}
                    isOpen={true}
                    items={taxIncludedOrder.lineItems}
                    shopperCurrency={getStoreConfig().shopperCurrency}
                    storeCurrency={getStoreConfig().currency}
                    total={taxIncludedOrder.orderAmount}
                />,
            );

            expect(screen.getByText('Order Summary')).toBeInTheDocument();
            expect(screen.getByText(taxIncludedOrder.coupons[0].code)).toBeInTheDocument();
            expect(screen.getByText(taxIncludedOrder.coupons[1].code)).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: `1 x ${taxIncludedOrder.lineItems.giftCertificates[0].name}` })).toBeInTheDocument();
            expect(screen.getByText('Tax Included in Total:')).toBeInTheDocument();
        });
    });

    describe('is updated modal UI on mobile screens', () => {
        beforeAll(() => {
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: jest.fn().mockImplementation(query => ({
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
                <LocaleProvider
                    checkoutService={checkoutService}
                    languageService={getLanguageService()}
                >
                    <OrderSummaryModal
                        {...mapToOrderSummarySubtotalsProps(getOrder(), true)}
                        isOpen={true}
                        items={getOrder().lineItems}
                        shopperCurrency={getStoreConfig().shopperCurrency}
                        storeCurrency={getStoreConfig().currency}
                        total={getOrder().orderAmount}
                    />
                </LocaleProvider>,
            );

            expect(screen.getByRole('button', { name: 'RETURN TO CHECKOUT' })).toBeInTheDocument();
        });
    });
});
