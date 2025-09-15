import { type Order, type ShopperCurrency, type StoreCurrency } from '@bigcommerce/checkout-sdk';
import React, { lazy, type ReactElement } from 'react';

import { CartSummarySkeleton, LazyContainer } from '@bigcommerce/checkout/ui';

import { retry } from '../../common/utility';
import { MobileView } from '../../ui/responsive';
import mapToOrderSummarySubtotalsProps from '../mapToOrderSummarySubtotalsProps';
import PrintLink from '../PrintLink';

const OrderSummary = lazy(() =>
    retry(
        () =>
            import(
                /* webpackChunkName: "order-summary" */
                '../OrderSummary'
                ),
    ),
);

const OrderSummaryDrawer = lazy(() =>
    retry(
        () =>
            import(
                /* webpackChunkName: "order-summary-drawer" */
                '../OrderSummaryDrawer'
                ),
    ),
);

interface OrderSummaryContainerProps {
    order: Order;
    currency: StoreCurrency;
    shopperCurrency: ShopperCurrency;
    isShippingDiscountDisplayEnabled: boolean;
}

export const OrderSummaryContainer = ({
    currency,
    isShippingDiscountDisplayEnabled,
    order,
    shopperCurrency,
}:OrderSummaryContainerProps):ReactElement => (
    <MobileView>
        {(matched) => {
            if (matched) {
                return (
                    <LazyContainer loadingSkeleton={<></>}>
                        <OrderSummaryDrawer
                            {...mapToOrderSummarySubtotalsProps(order, isShippingDiscountDisplayEnabled)}
                            headerLink={<PrintLink className="modal-header-link cart-modal-link" />}
                            lineItems={order.lineItems}
                            shopperCurrency={shopperCurrency}
                            storeCurrency={currency}
                            total={order.orderAmount}
                        />
                    </LazyContainer>
                );
            }

            return (
                <LazyContainer loadingSkeleton={<CartSummarySkeleton />}>
                    <aside className="layout-cart">
                        <OrderSummary
                            headerLink={<PrintLink />}
                            {...mapToOrderSummarySubtotalsProps(order, isShippingDiscountDisplayEnabled)}
                            lineItems={order.lineItems}
                            shopperCurrency={shopperCurrency}
                            storeCurrency={currency}
                            total={order.orderAmount}
                        />
                    </aside>
                </LazyContainer>
            );
        }}
    </MobileView>
);
