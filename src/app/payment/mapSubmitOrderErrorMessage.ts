import { TranslationData } from '@bigcommerce/checkout-sdk';
import { includes } from 'lodash';

export default function mapSubmitOrderErrorMessage(
    error: any,
    translate: (key: string, data?: TranslationData) => string
): string {
    switch (error.type) {
        case 'payment_cancelled':
            return translate('payment.payment_cancelled');

        case 'payment_method_invalid':
            return translate('payment.payment_method_disabled_error');

        case 'cart_changed':
            return translate('shipping.cart_change_error');

        default:
            if (includes([
                'order_could_not_be_finalized_error',
                'provider_fatal_error',
                'payment_invalid',
                'provider_error',
                'provider_widget_error',
                'user_payment_error',
            ], error.body && error.body.type)) {
                return translate('payment.payment_method_error', { message: error.message });
            }

            // Checking here if the error is a RequestError, get the translated message(s) based on the error code (s).
            // It's an array of errors, so there could be more than one message.
            // If we are going to add all BigPay messages to the translation JSON file,
            // it should be not possible to have a code that does not exit.
            // However, we want this case to be handled.
            if (error.body && error.body.errors) {
                const messages = error.body.errors.map((error: { code: any; }) => translate(`payment.errors.${error.code}`));

                if (messages.length) {
                    return messages.join(' ');
                }
            }
            
            if (error.message) {
                return error.message;
            }

            return error.type === 'unrecoverable' ?
                translate('common.unavailable_error') :
                translate('payment.place_order_error');
    }
}

export function mapSubmitOrderErrorTitle(
    error: any,
    translate: (key: string, data?: TranslationData) => string
): string {
    if (error.type === 'unrecoverable') {
        return translate('common.unavailable_heading');
    }

    return translate('common.error_heading');
}
