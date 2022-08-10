import { PaymentMethod } from "@bigcommerce/checkout-sdk";

export function getMethod(): PaymentMethod {
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
        initializationData: {
            payPalCreditProductBrandName: {credit: ''},
        },
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
