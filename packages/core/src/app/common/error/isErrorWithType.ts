import { RequestError } from '@bigcommerce/checkout-sdk';

interface ErrorWithType extends RequestError {
    type: string;
}

// eslint-disable-next-line @typescript-eslint/ban-types
function hasOwnProperty<X extends {}, Y extends PropertyKey>(
    obj: X,
    key: Y,
): obj is X & Record<Y, unknown> {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

export default function isErrorWithType(error: unknown): error is ErrorWithType {
    return (
        typeof error === 'object' &&
        error !== null &&
        hasOwnProperty(error, 'type') &&
        typeof error.type === 'string'
    );
}
