import { type TranslationData } from '@bigcommerce/checkout-sdk';

export function mapCheckoutComponentErrorMessage(
    error: any,
    translate: (key: string, data?: TranslationData) => string,
): string {
    switch (error.type) {
        case 'empty_cart':
            return translate('cart.empty_cart_error_message');

        default:
            return error.message;
    }
}
