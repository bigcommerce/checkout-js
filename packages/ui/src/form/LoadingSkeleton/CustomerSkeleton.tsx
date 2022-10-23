import React, { FunctionComponent } from 'react';

import { LoadingSkeleton, LoadingSkeletonProps } from './LoadingSkeleton';

const CustomerSkeleton: FunctionComponent<LoadingSkeletonProps> = ({ children, isLoading }) => {
    const skeleton = (
        <div className="checkout-form customer-skeleton">
            <div className="customerEmail-container">
                <div className="customerEmail-body">
                    <div className="skeleton-container">
                        <div className="input-skeleton" />
                    </div>
                    <div className="button-skeleton skeleton-container subscription-skeleton" />
                </div>
                <div className="customerEmail-action customerEmail-floating--enabled">
                    <div className="button-skeleton skeleton-container" />
                </div>
            </div>
        </div>
    );

    return <LoadingSkeleton {...{ children, isLoading, skeleton }} />;
};

export default CustomerSkeleton;
