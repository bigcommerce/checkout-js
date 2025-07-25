import classNames from 'classnames';
import React, { FunctionComponent } from 'react';

import { LoadingSpinner } from '../../loading';
import { isEmbedded, isMobileView } from '../../utils';

import { CartSummarySkeleton } from './CartSummarySkeleton';

const OrderConfirmationPageSkeletonDesktop: FunctionComponent = () => (
    <div
        className={classNames('layout optimizedCheckout-contentPrimary', {
            'is-embedded': isEmbedded(),
        })}
    >
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
    <LoadingSpinner isLoading={true} />
);

const OrderConfirmationPageSkeleton: FunctionComponent = () => {
    return isMobileView() ? (
        <OrderConfirmationPageSkeletonMobile />
    ) : (
        <OrderConfirmationPageSkeletonDesktop />
    );
};

export default OrderConfirmationPageSkeleton;
