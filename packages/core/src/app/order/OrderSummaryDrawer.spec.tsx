import { createCheckoutService, Order } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import React from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { getGiftCertificateItem, getPhysicalItem } from '../cart/lineItem.mock';
import { getStoreConfig } from '../config/config.mock';
import { ShopperCurrency } from '../currency';
import { IconGiftCertificate } from '../ui/icon';

import mapToOrderSummarySubtotalsProps from './mapToOrderSummarySubtotalsProps';
import { getOrder } from './orders.mock';
import OrderSummaryDrawer from './OrderSummaryDrawer';
import OrderSummaryModal from './OrderSummaryModal';
import PrintLink from './PrintLink';

describe('OrderSummaryDrawer', () => {
    let order: Order;
    let orderSummary: ReactWrapper;
    let localeContext: LocaleContextType;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());

        order = getOrder();

        orderSummary = mount(
            <CheckoutProvider checkoutService={createCheckoutService()}>
                <LocaleContext.Provider value={localeContext}>
                    <OrderSummaryDrawer
                        {...mapToOrderSummarySubtotalsProps(order)}
                        additionalLineItems="foo"
                        headerLink={<PrintLink />}
                        lineItems={order.lineItems}
                        shopperCurrency={getStoreConfig().shopperCurrency}
                        storeCurrency={getStoreConfig().currency}
                        total={order.orderAmount}
                    />
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );
    });

    it('renders gift certificate icon when buying only GC', () => {
        orderSummary = mount(
            <CheckoutProvider checkoutService={createCheckoutService()}>
                <LocaleContext.Provider value={localeContext}>
                    <OrderSummaryDrawer
                        {...mapToOrderSummarySubtotalsProps(order)}
                        additionalLineItems="foo"
                        headerLink={<PrintLink />}
                        lineItems={{
                            giftCertificates: [getGiftCertificateItem()],
                            physicalItems: [],
                            digitalItems: [],
                        }}
                        shopperCurrency={getStoreConfig().shopperCurrency}
                        storeCurrency={getStoreConfig().currency}
                        total={order.orderAmount}
                    />
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        expect(orderSummary.find(IconGiftCertificate)).toHaveLength(1);
    });

    it('renders order amount', () => {
        expect(orderSummary.find(ShopperCurrency).prop('amount')).toEqual(order.orderAmount);
    });

    it('renders line items count', () => {
        expect(orderSummary.find('.cartDrawer-items').text()).toEqual(
            localeContext.language.translate('cart.item_count_text', { count: 2 }),
        );
    });

    it('renders image of first product', () => {
        expect(orderSummary.find('[data-test="cart-item-image"]').prop('src')).toEqual(
            getPhysicalItem().imageUrl,
        );
    });

    describe('when clicked', () => {
        beforeEach(() => {
            orderSummary.find('.cartDrawer').simulate('click');
        });

        it('renders order summary modal with the right props', () => {
            expect(orderSummary.find(OrderSummaryModal)).toHaveLength(1);

            expect(orderSummary.find(OrderSummaryModal).find('#cart-print-link')).toHaveLength(1);

            expect(orderSummary.find(OrderSummaryModal).props()).toMatchObject({
                ...mapToOrderSummarySubtotalsProps(getOrder()),
                lineItems: getOrder().lineItems,
                total: getOrder().orderAmount,
                storeCurrency: getStoreConfig().currency,
                shopperCurrency: getStoreConfig().shopperCurrency,
                additionalLineItems: 'foo',
            });
        });
    });

    describe('when active and enter is pressed', () => {
        beforeEach(() => {
            orderSummary.find('.cartDrawer').simulate('keypress', { key: 'Enter' });
        });

        it('renders order summary modal with the right props', () => {
            expect(orderSummary.find(OrderSummaryModal)).toHaveLength(1);

            expect(orderSummary.find(OrderSummaryModal).find('#cart-print-link')).toHaveLength(1);

            expect(orderSummary.find(OrderSummaryModal).props()).toMatchObject({
                ...mapToOrderSummarySubtotalsProps(getOrder()),
                lineItems: getOrder().lineItems,
                total: getOrder().orderAmount,
                storeCurrency: getStoreConfig().currency,
                shopperCurrency: getStoreConfig().shopperCurrency,
                additionalLineItems: 'foo',
            });
        });
    });
});
