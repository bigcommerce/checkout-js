import { type PaymentMethod } from '@bigcommerce/checkout-sdk';

export function getMethod(): PaymentMethod {
    return {
        id: 'cheque',
        logoUrl: '',
        method: 'offline',
        supportedCards: [],
        config: {
            displayName: 'Cheque',
            helpText: 'Type any special instructions in here.',
            testMode: false,
        },
        type: 'PAYMENT_TYPE_OFFLINE',
        skipRedirectConfirmationAlert: false,
    };
}
