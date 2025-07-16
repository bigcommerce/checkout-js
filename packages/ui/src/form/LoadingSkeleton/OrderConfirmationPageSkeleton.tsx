import React, { FunctionComponent } from 'react';

import { CartSummarySkeleton } from './CartSummarySkeleton';

const OrderConfirmationPageSkeleton: FunctionComponent = () => (
    <>
        <div className="layout-main" data-test="order-confirmation-page-skeleton">
            <div className="order-confirmation-page-skeleton">
                <div className="thankyou" />
                <div className="line-1" />
                <div className="line-2" />
                <div className="continue" />
            </div>
        </div>
        <CartSummarySkeleton />
    </>
);

export default OrderConfirmationPageSkeleton;
