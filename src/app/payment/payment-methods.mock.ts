import { PaymentMethod } from '@bigcommerce/checkout-sdk';

export function getPaymentMethod(): PaymentMethod {
    return {
        id: 'authorizenet',
        gateway: undefined,
        logoUrl: '',
        method: 'credit-card',
        supportedCards: [
            'VISA',
            'AMEX',
            'MC',
        ],
        config: {
            displayName: 'Authorizenet',
            cardCode: true,
            enablePaypal: undefined,
            hasDefaultStoredInstrument: false,
            helpText: '',
            is3dsEnabled: undefined,
            isVisaCheckoutEnabled: undefined,
            merchantId: undefined,
            testMode: false,
        },
        type: 'PAYMENT_TYPE_API',
    };
}
