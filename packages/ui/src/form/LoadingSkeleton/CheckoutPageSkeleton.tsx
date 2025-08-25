import React, { type FunctionComponent } from 'react';

import { isMobileView } from '../../utils';

import { CartSummarySkeleton } from './CartSummarySkeleton';

const CheckoutPageSkeletonDesktop: FunctionComponent = () => (
    <div className="layout optimizedCheckout-contentPrimary" data-test="checkout-page-skeleton">
        <div className="layout-main">
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
    </div>
);

const CheckoutPageSkeletonMobile: FunctionComponent = () => (
    <div
        className="layout optimizedCheckout-contentPrimary"
        data-test="checkout-page-skeleton-mobile"
    >
        <div className="layout-main ">
            <div className="checkout-page-skeleton">
                <div className="walletbutton--tagline" />
                <div className="walletbutton" />
                <div className="walletbutton--divider" />
                <div className="mobile-title--first" />
                <div className="textbox" />
                <div className="textbox" />
                <div className="terms--1" />
                <div className="mobile-title--2" />
                <div className="divider" />
                <div className="mobile-title--3" />
                <div className="divider" />
                <div className="mobile-title--4" />
                <div className="divider" />
                <div className="divider" />
            </div>
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

const CheckoutPageSkeleton: FunctionComponent = () => {
    return isMobileView() ? <CheckoutPageSkeletonMobile /> : <CheckoutPageSkeletonDesktop />;
};

export default CheckoutPageSkeleton;
