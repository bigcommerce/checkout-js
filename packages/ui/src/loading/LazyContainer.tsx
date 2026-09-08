import React, { type FunctionComponent, type ReactNode, Suspense, useContext } from 'react';

import { ErrorBoundary } from '@bigcommerce/checkout/error-handling-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';

import './LazyContainer.scss';

import { LoadingSkeletonContext } from './LoadingSkeletonContext';
import LoadingSpinner from './LoadingSpinner';

export interface LazyContainerProps {
    children?: ReactNode;
    loadingSkeleton?: ReactNode;
}

const filterError = (error: Error) => error.name === 'ChunkLoadError';

const LazyContainer: FunctionComponent<LazyContainerProps> = ({ loadingSkeleton, children }) => {
    const loadingSkeletonFallback = useContext(LoadingSkeletonContext);

    return (
        <ErrorBoundary
            fallback={
                <div className="lazyContainer-error">
                    <TranslatedString id="common.unstable_network_error" />
                </div>
            }
            filter={filterError}
        >
            <Suspense
                fallback={
                    loadingSkeleton || loadingSkeletonFallback || <LoadingSpinner isLoading />
                }
            >
                {children}
            </Suspense>
        </ErrorBoundary>
    );
};

export default LazyContainer;
