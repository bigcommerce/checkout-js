import { RequestError } from '@bigcommerce/checkout-sdk';

interface ErrorWithType extends RequestError {
    type: string;
}

function hasOwnProperty<X extends {}, Y extends PropertyKey>
  (obj: X, key: Y): obj is X & Record<Y, unknown> {
    return obj.hasOwnProperty(key)
}

export default function isErrorWithType(error: Error|unknown): error is ErrorWithType {
    return typeof error === 'object'
        && error !== null
        && hasOwnProperty(error, 'type')
        && typeof error.type === 'string';
}
