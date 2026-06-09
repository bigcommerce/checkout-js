import { type PaymentMethod } from '@bigcommerce/checkout-sdk';

export function getMethod(): PaymentMethod {
    return {
        id: 'b2b.net_terms',
        gateway: undefined,
        logoUrl: '',
        method: 'net_terms',
        supportedCards: [],
        config: {
            displayName: 'Payment Net Terms',
            helpText: '',
            testMode: false,
        },
        type: 'PAYMENT_TYPE_OFFLINE',
        skipRedirectConfirmationAlert: false,
    };
}
