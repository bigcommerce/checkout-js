export default class CustomError extends Error {
    static shouldReport: boolean;

    data: any;
    title: string;
    type: string;

    constructor({
        data = {},
        message = '',
        title = '',
        name = '',
    }: {
        data?: any;
        message?: string;
        title?: string;
        name?: string;
    }) {
        super();

        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, CustomError);
        } else {
            this.stack = new Error().stack;
        }

         
        this.data = data;
        this.message = message;
        this.name = name;
        this.title = title;
        this.type = 'custom';
    }

    // todo: remove these methods when all error types has specific subclasses.
    // they are only provided for compatibility with errors defined in `app.errors.ts` while we transition
    // to proper error subclasses.
    protected setDefaultValues({
        name,
        defaultError,
        defaultTitle,
    }: {
        name: string;
        defaultError: string;
        defaultTitle: string;
    }): void {
        this.name = this.name || name;
        this.message = this.message || defaultError;
        this.title = this.title || defaultTitle;
    }
}
