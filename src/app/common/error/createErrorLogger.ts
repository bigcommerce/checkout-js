import ErrorLogger, { ErrorLoggerOptions, ErrorLoggerServiceConfig } from './ErrorLogger';
import NoopErrorLogger from './NoopErrorLogger';
import SentryClientFactory from './SentryClientFactory';
import SentryErrorLogger from './SentryErrorLogger';

export default function createErrorLogger(
    serviceConfig?: ErrorLoggerServiceConfig,
    options?: ErrorLoggerOptions
): ErrorLogger {
    if (serviceConfig && serviceConfig.sentry) {
        return new SentryErrorLogger(
            new SentryClientFactory(),
            serviceConfig.sentry,
            options
        );
    }

    return new NoopErrorLogger();
}
