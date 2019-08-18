export default interface ErrorLogger {
    /**
     * Sets a tags context that allows to look up errors by the provided tags.
     *
     * @param tags The tags to be set
     */
    setTags(tags: ErrorTags): void;

    /**
     * Logs an error in, tagging it with an error code.
     *
     * @param error The error object to be logged
     * @param tags The tags attached to the log entry
     * @param level The level of the log
     */
    log(
        error: Error,
        tags?: ErrorTags,
        level?: ErrorLevelType
    ): void;
}

export interface ErrorLoggerOptions {
    errorTypes?: string[];
}

export interface ErrorTags {
    /**
     * A code that identifies uniquely each error type
     */
    errorCode: string;
}

export enum ErrorLevelType {
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
}
