import { RequestError } from '@bigcommerce/checkout-sdk';

export default function isRequestError(error: unknown): error is RequestError {
    const requestError = error as RequestError;

    return requestError.type === 'request';
}
