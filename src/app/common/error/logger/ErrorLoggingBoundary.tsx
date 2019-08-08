import React, { ReactNode } from 'react';

import ErrorLogger from './ErrorLogger';

export interface ErrorLoggingBoundaryProps {
    children: ReactNode;
    logger: ErrorLogger;
}

class ErrorLoggingBoundary extends React.Component<ErrorLoggingBoundaryProps> {
    componentDidCatch(error: Error): void {
        const { logger } = this.props;

        logger.log(error);
    }

    render(): ReactNode {
        const { children } = this.props;

        return children;
    }
}

export default ErrorLoggingBoundary;
