import { PaymentMethod } from '@bigcommerce/checkout-sdk';

export function getPaymentMethod(): PaymentMethod {
    return {
        id: 'authorizenet',
        gateway: undefined,
        logoUrl: '',
        method: 'credit-card',
        supportedCards: ['VISA', 'AMEX', 'MC'],
        initializationData: {
            payPalCreditProductBrandName: { credit: '' },
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

export function getPaypalCreditPaymentMethod(): PaymentMethod {
    return {
        config: {},
        supportedCards: [],
        id: 'paypalcommercecredit',
        gateway: undefined,
        logoUrl: '',
        method: 'paypal',
        initializationData: {
            payPalCreditProductBrandName: { credit: 'Pay in 3' },
        },
        type: 'PAYMENT_TYPE_API',
    };
}

export function getBraintreeAchPaymentMethod(): PaymentMethod {
    return {
        id: 'braintreeach',
        logoUrl: '',
        method: 'paypal-ach',
        supportedCards: [],
        config: {
            displayName: 'Braintree ACH',
            isVaultingEnabled: false,
        },
        type: 'PAYMENT_TYPE_API',
    };
}

export function getMobilePaymentMethod(): PaymentMethod {
    return {
        id: 'authorizenetMobile',
        gateway: undefined,
        logoUrl: '',
        method: 'credit-card',
        supportedCards: ['VISA', 'AMEX', 'MC'],
        initializationData: {
            showOnlyOnMobileDevices: true,
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
