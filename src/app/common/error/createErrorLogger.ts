import ErrorLogger, { ErrorLoggerOptions, ErrorLoggerServiceConfig } from './ErrorLogger';
import NoopErrorLogger from './NoopErrorLogger';
import SentryErrorLogger from './SentryErrorLogger';

export default function createErrorLogger(
    serviceConfig?: ErrorLoggerServiceConfig,
    options?: ErrorLoggerOptions
): ErrorLogger {
    if (serviceConfig && serviceConfig.sentry) {
        return new SentryErrorLogger(
            serviceConfig.sentry,
            options
        );
    }

    return new NoopErrorLogger();
}
