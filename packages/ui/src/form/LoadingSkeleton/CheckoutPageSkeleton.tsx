import React, { FunctionComponent } from 'react';

import { CartSummarySkeleton } from './CartSummarySkeleton';

const CheckoutPageSkeleton: FunctionComponent = () => (
    <>
        <div className="layout-main" data-test="checkout-page-skeleton">
            <div className="checkout-steps checkout-page-skeleton">
                <div className="title--first" />
                <div className="textbox" />
                <div className="subscription">
                    <div className="checkbox" />
                    <div className="description" />
                </div>
                <div className="terms--1" />
                <div className="terms--2" />
                <div className="title" />
                <div className="title" />
                <div className="title" />
            </div>
        </div>
        <CartSummarySkeleton />
    </>
);

export default CheckoutPageSkeleton;
