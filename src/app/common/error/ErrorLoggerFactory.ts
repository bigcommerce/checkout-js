import { RavenWindow } from './raven';
import ErrorLogger, { ErrorLoggerOptions } from './ErrorLogger';
import NoopErrorLogger from './NoopErrorLogger';
import RavenErrorLogger from './RavenErrorLogger';

export default class ErrorLoggerFactory {
    getLogger(options?: ErrorLoggerOptions): ErrorLogger {
        if (isRavenWindow(window)) {
            return new RavenErrorLogger(window.Raven, options);
        }

        return new NoopErrorLogger();
    }
}

function isRavenWindow(window: Window): window is RavenWindow {
    return Boolean((window as RavenWindow).Raven);
}
