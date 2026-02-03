import {
  ErrorLevelType,
  type ErrorLogger,
  type ErrorMeta,
  type ErrorTags,
} from '@bigcommerce/checkout/error-handling-utils';

export interface ConsoleErrorLoggerOptions {
  console?: Console;
  errorTypes?: string[];
}

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
      case ErrorLevelType.Error: {
        this.console.error(error, tags, meta);

        return;
      }

      case ErrorLevelType.Info: {
        this.console.info(error, tags, meta);

        return;
      }

      case ErrorLevelType.Warning: {
        this.console.warn(error, tags, meta);

        return;
      }

      default: {
        this.console.log(error, tags, meta);
      }
    }
  }
}
