import classNames from 'classnames';
import React, { FunctionComponent } from 'react';

import { LoadingSpinner } from '../../loading';
import { isEmbedded, isMobileView } from '../../utils';

import { CartSummarySkeleton } from './CartSummarySkeleton';

const CheckoutPageSkeletonDesktop: FunctionComponent = () => (
    <div
        className={classNames('remove-checkout-step-numbers', { 'is-embedded': isEmbedded() })}
        data-test="checkout-page-container"
        id="checkout-page-container"
    >
        <div className="layout optimizedCheckout-contentPrimary">
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
        </div>
    </div>
);

const CheckoutPageSkeletonMobile: FunctionComponent = () => <LoadingSpinner isLoading={true} />;

const CheckoutPageSkeleton: FunctionComponent = () => {
    return isMobileView() ? <CheckoutPageSkeletonMobile /> : <CheckoutPageSkeletonDesktop />;
};

export default CheckoutPageSkeleton;
