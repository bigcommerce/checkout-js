import setPrototypeOf from '../setPrototypeOf';

import CustomError from './CustomError';

export default class EmbeddedCheckoutUnsupportedError extends CustomError {
    constructor(message: string) {
        super({
            name: 'EMBEDDED_CHECKOUT_UNSUPPORTED_ERROR',
            message,
        });

        setPrototypeOf(this, EmbeddedCheckoutUnsupportedError.prototype);
    }
}
