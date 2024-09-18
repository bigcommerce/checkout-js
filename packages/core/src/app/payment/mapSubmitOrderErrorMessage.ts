import { TranslationData } from '@bigcommerce/checkout-sdk';
import { includes } from 'lodash';

export default function mapSubmitOrderErrorMessage(
    error: any,
    translate: (key: string, data?: TranslationData) => string,
    shouldLocalise: boolean,
): string {
    switch (error.type) {
        case 'not_initialized':
            return translate('payment.payment_error');

        case 'custom_provider_execute_error':
            return translate(error.subtype);

        case 'payment_cancelled':
            return translate('payment.payment_cancelled');

        case 'payment_method_invalid':
            return translate('payment.payment_method_disabled_error');

        case 'tax_provider_unavailable':
            return translate('payment.tax_provider_unavailable');

        case 'cart_changed':
            return translate('shipping.cart_change_error');

        case 'cart_consistency':
            return translate('cart.consistency_error');

        default:
            if (
                includes(
                    [
                        'order_could_not_be_finalized_error',
                        'provider_fatal_error',
                        'payment_invalid',
                        'provider_error',
                        'provider_widget_error',
                        'user_payment_error',
                    ],
                    error.body && error.body.type,
                )
            ) {
                return translate('payment.payment_method_error', { message: error.message });
            }

            if (shouldLocalise && error.body && error.body.errors && error.body.errors.length) {
                const messages = error.body.errors.map((err: { code: any }) =>
                    translate(`payment.errors.${err.code}`),
                );

                return messages.join(' ');
            }

            if (error.message) {
                return error.message;
            }

            return error.type === 'unrecoverable'
                ? translate('common.unavailable_error')
                : translate('payment.place_order_error');
    }
}

export function mapSubmitOrderErrorTitle(
    error: any,
    translate: (key: string, data?: TranslationData) => string,
): string {
    if (error.type === 'unrecoverable') {
        return translate('common.unavailable_heading');
    }

    return translate('common.error_heading');
}
