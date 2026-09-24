import { type Order, type ShopperCurrency, type StoreCurrency } from '@bigcommerce/checkout-sdk';
import React, { lazy, type ReactElement } from 'react';

import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { CartSummarySkeleton, LazyContainer, MobileView } from '@bigcommerce/checkout/ui';

import { retry } from '../../common/utility';
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

const OrderSummaryDrawerV2 = lazy(() =>
    retry(
        () =>
            import(
                /* webpackChunkName: "order-summary-drawer-v2" */
                '../OrderSummaryDrawerV2'
            ).then((m) => ({ default: m.OrderSummaryDrawerV2 })),
    ),
);

interface OrderSummaryContainerProps {
    order: Order;
    currency: StoreCurrency;
    shopperCurrency: ShopperCurrency;
}

export const OrderSummaryContainer = ({
    currency,
    order,
    shopperCurrency,
}: OrderSummaryContainerProps): ReactElement => {
    const { enhancedThemeV1 } = useThemeContext();

    return (
        <MobileView>
            {(matched) => {
                if (matched) {
                    if (enhancedThemeV1) {
                        return (
                            <LazyContainer loadingSkeleton={<></>}>
                                <aside aria-label="Cart Summary" className="layout-cart">
                                    <OrderSummaryDrawerV2
                                        {...mapToOrderSummarySubtotalsProps(order)}
                                        bundledItems={order.bundledItems}
                                        lineItems={order.lineItems}
                                        shopperCurrency={shopperCurrency}
                                        storeCurrency={currency}
                                        total={order.orderAmount}
                                    />
                                </aside>
                            </LazyContainer>
                        );
                    }

                    return (
                        <LazyContainer loadingSkeleton={<></>}>
                            <OrderSummaryDrawer
                                {...mapToOrderSummarySubtotalsProps(order)}
                                headerLink={
                                    <PrintLink className="modal-header-link cart-modal-link" />
                                }
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
                                {...mapToOrderSummarySubtotalsProps(order)}
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
};
