import { createCheckoutService, type CurrencyService, type Order } from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import React, { type FunctionComponent } from 'react';

import { CheckoutProvider, LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getGiftCertificateItem, getPhysicalItem } from '../cart/lineItem.mock';
import { getStoreConfig } from '../config/config.mock';
import { IconGiftCertificate } from '../ui/icon';

import mapToOrderSummarySubtotalsProps from './mapToOrderSummarySubtotalsProps';
import { getOrder } from './orders.mock';
import OrderSummaryDrawer, { type OrderSummaryDrawerProps } from './OrderSummaryDrawer';
import { type OrderSummarySubtotalsProps } from './OrderSummarySubtotals';
import PrintLink from './PrintLink';

describe('OrderSummaryDrawer', () => {
    let order: Order;
    let localeContext: LocaleContextType;
    let currencyService: CurrencyService;
    let OrderSummaryDrawerTest: FunctionComponent<OrderSummaryDrawerProps & OrderSummarySubtotalsProps>;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
        currencyService = localeContext.currency;

        order = getOrder();
    });

    describe('renders order summary drawer', () => {

        beforeEach(() => {
            OrderSummaryDrawerTest = () => (
                <CheckoutProvider checkoutService={createCheckoutService()}>
                    <LocaleContext.Provider value={localeContext}>
                        <OrderSummaryDrawer
                            {...mapToOrderSummarySubtotalsProps(order, false)}
                            additionalLineItems="foo"
                            headerLink={<PrintLink />}
                            lineItems={order.lineItems}
                            shopperCurrency={getStoreConfig().shopperCurrency}
                            storeCurrency={getStoreConfig().currency}
                            total={order.orderAmount}
                        />
                    </LocaleContext.Provider>
                </CheckoutProvider>
            );
        });

        it('renders gift certificate icon when buying only GC', () => {
            const { container } = render(
                <CheckoutProvider checkoutService={createCheckoutService()}>
                    <LocaleContext.Provider value={localeContext}>
                        <OrderSummaryDrawer
                            {...mapToOrderSummarySubtotalsProps(order, false)}
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

            const { container: iconGiftCertificateContainer } = render(<IconGiftCertificate />);

            expect(container.innerHTML).toContain(iconGiftCertificateContainer.innerHTML);
        });

        it('renders order amount', () => {
            render(<OrderSummaryDrawerTest />);

            expect(screen.getByText(currencyService.toCustomerCurrency(order.orderAmount))).toBeInTheDocument();
        });

        it('renders line items count', () => {
            render(<OrderSummaryDrawerTest />);

            expect(screen.getByText(
                localeContext.language.translate('cart.item_count_text', { count: 2 }),
            )).toBeInTheDocument();
        });

        it('renders image of first product', () => {
            render(<OrderSummaryDrawerTest />);

            expect(screen.getByTestId('cart-item-image')).toHaveAttribute(
                'src', getPhysicalItem().imageUrl,
            );
        });
    });

    describe('when clicked', () => {
        it('renders order summary modal with the correct data', async () => {
            render(
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

            await userEvent.click(screen.getByTestId('cart-item-image'));

            expect(screen.getByText('Order Summary')).toBeInTheDocument();
            expect(screen.getByText(order.coupons[0].code)).toBeInTheDocument();
            expect(screen.getByText(order.coupons[1].code)).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: `1 x ${order.lineItems.giftCertificates[0].name}` })).toBeInTheDocument();
            expect(screen.getByText('foo')).toBeInTheDocument();
            expect(screen.getByText('Close')).toBeInTheDocument();
            expect(screen.getByText('Print')).toBeInTheDocument();
        });
    });

    describe('when active and enter is pressed', () => {
        it('renders order summary modal with the correct data', async () => {
            render(
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

            await userEvent.keyboard('{tab}');
            await userEvent.keyboard('{enter}');

            expect(screen.getByText('Order Summary')).toBeInTheDocument();
            expect(screen.getByText(order.coupons[0].code)).toBeInTheDocument();
            expect(screen.getByText(order.coupons[1].code)).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: `1 x ${order.lineItems.giftCertificates[0].name}` })).toBeInTheDocument();
            expect(screen.getByText('foo')).toBeInTheDocument();
            expect(screen.getByText('Close')).toBeInTheDocument();
            expect(screen.getByText('Print')).toBeInTheDocument();
        });
    });

    it('renders correct summary for line items for bundled products', async () => {
        order.lineItems.physicalItems.push({ ...getPhysicalItem(), id: '888', parentId: 'test' });

        render(
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

        await userEvent.click(screen.getByTestId('cart-item-image'));

        // one is physical item and other is gift certificate
        expect(screen.getAllByTestId('cart-item')).toHaveLength(2);
    });
});
