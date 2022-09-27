import { CustomError, setPrototypeOf } from '../../common/error';

export class EmbeddedCheckoutUnsupportedError extends CustomError {
    constructor(message: string) {
        super({
            name: 'EMBEDDED_CHECKOUT_UNSUPPORTED_ERROR',
            message,
        });

        setPrototypeOf(this, EmbeddedCheckoutUnsupportedError.prototype);
    }
}
