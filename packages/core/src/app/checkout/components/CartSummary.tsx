import { ExtensionRegion } from '@bigcommerce/checkout-sdk/essential';
import React, { lazy } from 'react';

import { Extension } from '@bigcommerce/checkout/checkout-extension';
import { CartSummarySkeleton, LazyContainer } from '@bigcommerce/checkout/ui';

import { retry } from '../../common/utility';
import { MobileView } from '../../ui/responsive';

const CartSummaryComponent = lazy(() =>
    retry(
        () =>
            import(
                /* webpackChunkName: "cart-summary" */
                '../../cart/CartSummary'
            ),
    ),
);

const CartSummaryDrawer = lazy(() =>
    retry(
        () =>
            import(
                /* webpackChunkName: "cart-summary-drawer" */
                '../../cart/CartSummaryDrawer'
            ),
    ),
);

export interface CartSummaryProps {
    isMultiShippingMode: boolean;
}

export const CartSummary: React.FC<CartSummaryProps> = ({ isMultiShippingMode }) => {
    return (
        <MobileView>
            {(matched) => {
                if (matched) {
                    return (
                        <LazyContainer loadingSkeleton={<></>}>
                            <Extension region={ExtensionRegion.SummaryAfter} />
                            <CartSummaryDrawer isMultiShippingMode={isMultiShippingMode} />
                        </LazyContainer>
                    );
                }

                return (
                    <LazyContainer loadingSkeleton={<CartSummarySkeleton />}>
                        <aside aria-label="Cart Summary" className="layout-cart">
                            <CartSummaryComponent isMultiShippingMode={isMultiShippingMode} />
                            <Extension region={ExtensionRegion.SummaryAfter} />
                        </aside>
                    </LazyContainer>
                );
            }}
        </MobileView>
    );
};

export default CartSummary;
