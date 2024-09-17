import { PaymentMethod } from '@bigcommerce/checkout-sdk';

export function getMethod(): PaymentMethod {
    return {
        id: 'bankdeposit',
        logoUrl: '',
        method: 'offline',
        supportedCards: [],
        config: {
            displayName: 'Bank Deposit',
            helpText: 'Type any special instructions in here.',
            testMode: false,
        },
        type: 'PAYMENT_TYPE_OFFLINE',
    };
}
