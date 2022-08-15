import CustomError from './CustomError';

// todo: remove this method in favour of creating proper subclasses for each error type.
// it's only provided for compatibility with errors defined in `app.errors.ts` while we transition
// to proper error subclasses.
export default function createCustomErrorType({
    name,
    defaultError = '',
    defaultTitle = '',
    shouldReport = false,
}: {
    name: string;
    defaultError?: string;
    defaultTitle?: string;
    shouldReport?: boolean;
}) {
    class CustomErrorType extends CustomError {
        constructor(data = {}, errorMessage = '', errorTitle = '') {
            super({
                data,
                message: errorMessage,
                title: errorTitle,
            });

            // todo: this should use new.taget.prototype in the parent class once we can make it work
            setPrototypeOf(this, CustomErrorType.prototype);

            this.setDefaultValues({
                name,
                defaultError,
                defaultTitle,
            });
        }
    }

    CustomErrorType.shouldReport = shouldReport;

    return CustomErrorType;
}

export function setPrototypeOf(object: any, prototype: any) {
    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(object, prototype);
    } else {
        object.__proto__ = prototype;
    }

    return object;
}
