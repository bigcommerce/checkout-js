import { Component, type ReactNode } from 'react';

import type ErrorLogger from './ErrorLogger';

export interface ErrorBoundaryProps {
    children?: ReactNode;
    fallback?: ReactNode;
    logger?: ErrorLogger;
    filter?(error: Error): boolean;
}

interface ErrorBoundaryState {
    error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { error };
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    state: ErrorBoundaryState = {};

    componentDidCatch(error: Error): void {
        const { filter = () => true, logger } = this.props;

        if (!filter(error)) {
            throw error;
        }

        // Adding errorCode with value `ErrorBoundary` to collect usage statistics of ErrorBoundary
        if (logger) {
            logger.log(error, {
                errorCode: 'ErrorBoundary',
            });
        }
    }

    render(): ReactNode {
        const { children, fallback, filter = () => true } = this.props;

        const { error } = this.state;

        if (error && filter(error)) {
            return fallback || null;
        }

        return children;
    }
}

export default ErrorBoundary;
