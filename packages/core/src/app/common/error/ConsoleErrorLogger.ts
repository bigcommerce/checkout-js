import {
  ErrorLevelType,
  ErrorLogger,
  ErrorMeta,
  ErrorTags,
} from '@bigcommerce/checkout/error-handling-utils';

export interface ConsoleErrorLoggerOptions {
    console?: Console;
    errorTypes?: string[];
}

// tslint:disable:no-console
export default class ConsoleErrorLogger implements ErrorLogger {
    private console: Console;

    constructor(options?: ConsoleErrorLoggerOptions) {
        const { console: customConsole = console } = options || {};

        this.console = customConsole;
    }

    log(
        error: Error,
        tags?: ErrorTags,
        level: ErrorLevelType = ErrorLevelType.Error,
        meta?: ErrorMeta,
    ): void {
        switch (level) {
            case ErrorLevelType.Error:
                return this.console.error(error, tags, meta);

            case ErrorLevelType.Info:
                return this.console.info(error, tags, meta);

            case ErrorLevelType.Warning:
                return this.console.warn(error, tags, meta);

            default:
                return this.console.log(error, tags, meta);
        }
    }
}
