import {
  ErrorLogger,
  ErrorLoggerOptions,
  ErrorLoggerServiceConfig,
} from '@bigcommerce/checkout/error-handling-utils';

import ConsoleErrorLogger from './ConsoleErrorLogger';
import NoopErrorLogger from './NoopErrorLogger';
import SentryErrorLogger from './SentryErrorLogger';

export default function createErrorLogger(
    serviceConfig?: ErrorLoggerServiceConfig,
    options?: ErrorLoggerOptions,
): ErrorLogger {
    if (serviceConfig && serviceConfig.sentry) {
        return new SentryErrorLogger(serviceConfig.sentry, {
            ...options,
            consoleLogger: new ConsoleErrorLogger(options),
        });
    }

    if (process.env.NODE_ENV === 'test') {
        return new NoopErrorLogger();
    }

    return new ConsoleErrorLogger(options);
}
