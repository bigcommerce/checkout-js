import React, { FunctionComponent } from 'react';

import { LoadingSkeleton, LoadingSkeletonProps } from './LoadingSkeleton';

const AddressFormSkeleton: FunctionComponent<LoadingSkeletonProps> = ({ children, isLoading }) => {
    const skeleton = (
        <div className="checkout-form">
            <div className="form-legend-container">
                <div className="address-form-heading-skeleton form-legend optimizedCheckout-headingSecondary" />
            </div>
            <div className="address-form-skeleton">
                <div className="name-fields-skeleton">
                    <div className="skeleton-container">
                        <div className="input-skeleton" />
                    </div>
                    <div className="skeleton-container">
                        <div className="input-skeleton" />
                    </div>
                </div>
                <div className="skeleton-container">
                    <div className="input-skeleton" />
                </div>
            </div>
        </div>
    );

    return <LoadingSkeleton {...{ children, isLoading, skeleton }} />;
};

export default AddressFormSkeleton;
