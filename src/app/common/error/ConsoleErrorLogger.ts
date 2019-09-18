import { includes } from 'lodash';

import DEFAULT_ERROR_TYPES from './defaultErrorTypes';
import ErrorLogger, { ErrorLevelType, ErrorTags } from './ErrorLogger';

export interface ConsoleErrorLoggerOptions {
    console?: Console;
    errorTypes?: string[];
}

// tslint:disable:no-console
export default class ConsoleErrorLogger implements ErrorLogger {
    private console: Console;
    private errorTypes: string[];

    constructor(
        options?: ConsoleErrorLoggerOptions
    ) {
        const {
            console: customConsole = console,
            errorTypes = [],
        } = options || {};

        this.console = customConsole;
        this.errorTypes = [
            ...DEFAULT_ERROR_TYPES,
            ...errorTypes,
        ];
    }

    log(
        error: Error,
        tags?: ErrorTags,
        level: ErrorLevelType = ErrorLevelType.Error
    ): void {
        if (!includes(this.errorTypes, error.name)) {
            return;
        }

        switch (level) {
        case ErrorLevelType.Error:
            return this.console.error(error, tags);

        case ErrorLevelType.Info:
            return this.console.info(error, tags);

        case ErrorLevelType.Warning:
            return this.console.warn(error, tags);
        }
    }
}
