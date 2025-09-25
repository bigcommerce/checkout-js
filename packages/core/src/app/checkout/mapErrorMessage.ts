import { type TranslationData } from '@bigcommerce/checkout-sdk';

export function mapCheckoutComponentErrorMessage(
    error: any,
    translate: (key: string, data?: TranslationData) => string,
): { message: string, action: string } {
    switch (error.type) {
        case 'empty_cart':
            return {
                message: translate('cart.empty_cart_error_message'),
                action: 'reload'
            };

        default:
            return {
                message: error.message,
                action: 'default'
            };
    }
}
