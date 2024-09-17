import { Component, ReactNode } from 'react';

import ErrorLogger from './ErrorLogger';

export interface ErrorBoundaryProps {
    children: ReactNode;
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

        if (logger) {
            logger.log(error);
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
