export default class CustomError extends Error {
    static shouldReport: boolean;

    data: any;
    title: any;
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

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.data = data;
        this.message = message;
        this.name = name;
        this.title = title;
        this.type = 'custom';
    }
}
