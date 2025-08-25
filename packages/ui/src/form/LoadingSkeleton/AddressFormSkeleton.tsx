import React, { type FunctionComponent } from 'react';

import { LoadingSkeleton, type LoadingSkeletonProps } from './LoadingSkeleton';

const AddressFormSkeleton: FunctionComponent<LoadingSkeletonProps> = ({
    children,
    isLoading,
    renderWhileLoading,
}) => {
    const skeleton = (
        <>
            <div className="address-form-skeleton">
                <div className="label" />
            </div>
            <div className="address-form-skeleton">
                <div className="name" />
                <div className="name" />
            </div>
            <div className="address-form-skeleton">
                <div className="address" />
            </div>
        </>
    );

    return <LoadingSkeleton {...{ children, isLoading, renderWhileLoading, skeleton }} />;
};

export default AddressFormSkeleton;
