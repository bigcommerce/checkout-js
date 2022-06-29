import { CartChangedError } from '@bigcommerce/checkout-sdk';

export default function isCartChangedError(error: Error): error is CartChangedError {
    const requestError = error as CartChangedError;

    return requestError.type === 'cart_changed';
}
