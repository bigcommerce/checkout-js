import React, { type FunctionComponent } from 'react';

import { isMobileView } from '../../utils';

import { CartSummarySkeleton } from './CartSummarySkeleton';

const OrderConfirmationPageSkeletonDesktop: FunctionComponent = () => (
    <div className="layout optimizedCheckout-contentPrimary">
        <div className="layout-main" data-test="order-confirmation-page-skeleton">
            <div className="order-confirmation-page-skeleton">
                <div className="thankyou" />
                <div className="line-1" />
                <div className="line-2" />
                <div className="continue" />
            </div>
        </div>
        <CartSummarySkeleton />
    </div>
);

const OrderConfirmationPageSkeletonMobile: FunctionComponent = () => (
    <div className="layout optimizedCheckout-contentPrimary">
        <div className="layout-main" data-test="order-confirmation-page-skeleton-mobile">
            <div className="order-confirmation-page-skeleton">
                <div className="thankyou" />
                <div className="text">
                    <div className="line">
                        <div className="animated-grey-box t1" />
                        <div className="animated-grey-box t2" />
                    </div>
                    <div className="animated-grey-box first-line" />
                    <div className="animated-grey-box" />
                    <div className="line">
                        <div className="animated-grey-box t3" />
                        <div className="animated-grey-box t4" />
                    </div>
                </div>
                <div className="continue" />
            </div>
        </div>
        <div className="cartDrawer optimizedCheckout-orderSummary">
            <div className="checkout-page-skeleton--cartdrawer">
                <div className="product">
                    <div className="animated-grey-box figure" />
                    <div className="details">
                        <div className="animated-grey-box name" />
                        <div className="animated-grey-box description" />
                    </div>
                </div>
                <div className="animated-grey-box more" />
            </div>
        </div>
    </div>
);

const OrderConfirmationPageSkeleton: FunctionComponent = () => {
    return isMobileView() ? (
        <OrderConfirmationPageSkeletonMobile />
    ) : (
        <OrderConfirmationPageSkeletonDesktop />
    );
};

export default OrderConfirmationPageSkeleton;
