import { type ReactNode, useEffect } from 'react';

import { useCheckout } from './';

interface CaptureMessageComponentProps {
    message: string;
}

export const CaptureMessageComponent = ({ message }: CaptureMessageComponentProps): ReactNode => {
    const { errorLogger } = useCheckout();

    useEffect(() => {
        if (!message || !errorLogger) {
            return;
        }

        if (errorLogger.logMessage) {
            errorLogger.logMessage(message);
        } else {
            // eslint-disable-next-line no-console
            console.log(
                `checkout-js attempted to log the following message: "${message}", but no Sentry logger is configured.`,
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [message]);

    return null;
};
