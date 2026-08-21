import React, { type FunctionComponent, type ReactNode, Suspense } from 'react';

import { ErrorBoundary } from '@bigcommerce/checkout/error-handling-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';

import './LazyContainer.scss';

import LoadingSpinner from './LoadingSpinner';

export interface LazyContainerProps {
    children?: ReactNode;
    loadingSkeleton?: ReactNode;
    errorFallback?: ReactNode;
    onError?: (error: Error) => void;
}

const filterError = (error: Error) => error.name === 'ChunkLoadError';

const defaultErrorFallback = (
    <div className="lazyContainer-error">
        <TranslatedString id="common.unstable_network_error" />
    </div>
);

const LazyContainer: FunctionComponent<LazyContainerProps> = ({
    loadingSkeleton,
    children,
    errorFallback = defaultErrorFallback,
    onError,
}) => (
    <ErrorBoundary fallback={errorFallback} filter={filterError} onError={onError}>
        <Suspense fallback={loadingSkeleton || <LoadingSpinner isLoading />}>{children}</Suspense>
    </ErrorBoundary>
);

export default LazyContainer;
