import React, { FunctionComponent } from 'react';

import { LoadingSkeleton, LoadingSkeletonProps } from './LoadingSkeleton';

const CustomerSkeleton: FunctionComponent<LoadingSkeletonProps> = ({ children, isLoading }) => {
    const skeleton = (
        <div className="checkout-form customer-skeleton">
            <div className="customerEmail-container">
                <div className="customerEmail-body">
                    <ul>
                        <div className="input-skeleton" />
                    </ul>
                    <ul className="subscription-skeleton button-skeleton" />
                </div>
                <div className="customerEmail-action customerEmail-floating--enabled">
                    <ul className="button-skeleton" />
                </div>
            </div>
        </div>
    );

    return <LoadingSkeleton {...{ children, isLoading, skeleton }} />;
};

export default CustomerSkeleton;
