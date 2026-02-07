import { ExtensionRegion } from '@bigcommerce/checkout-sdk/essential';
import React, { lazy } from 'react';

import { Extension } from '@bigcommerce/checkout/checkout-extension';
import { useThemeContext } from '@bigcommerce/checkout/contexts';
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

const CartSummaryDrawerV2 = lazy(() =>
    retry(
        () =>
            import(
                /* webpackChunkName: "cart-summary-drawer-v2" */
                '../../cart/CartSummaryDrawerV2'
            ),
    ),
);

export interface CartSummaryProps {
    isMultiShippingMode: boolean;
}

export const CartSummary: React.FC<CartSummaryProps> = ({ isMultiShippingMode }) => {
    const { themeV2 } = useThemeContext();

    return (
        <MobileView>
            {(matched) => {
                if (matched) {
                    if(themeV2) {
                        return (
                            <LazyContainer loadingSkeleton={<></>}>
                                <aside aria-label="Cart Summary" className="layout-cart">
                                    <CartSummaryDrawerV2 isMultiShippingMode={isMultiShippingMode} />
                                    <Extension region={ExtensionRegion.SummaryAfter} />
                                </aside>
                            </LazyContainer>
                        ) 
                    }
                    
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
