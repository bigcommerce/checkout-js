interface ErrorWithMessage extends Error {
    message: string;
}

export default function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
    return (
        typeof error === 'object' &&
        error !== null &&
        Object.prototype.hasOwnProperty.call(error, 'message')
    );
}
