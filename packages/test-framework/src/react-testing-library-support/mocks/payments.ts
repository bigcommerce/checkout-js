const payments = [
    {
        id: 'instore',
        gateway: null,
        logoUrl: '',
        method: 'offline',
        supportedCards: [],
        providesShippingAddress: false,
        config: {
            displayName: 'Pay in Store',
            cardCode: null,
            helpText: 'Type instructions to pay by visiting your retail store in here.',
            enablePaypal: null,
            merchantId: null,
            is3dsEnabled: null,
            testMode: false,
            isVisaCheckoutEnabled: null,
            requireCustomerCode: false,
            isVaultingEnabled: false,
            isVaultingCvvEnabled: null,
            hasDefaultStoredInstrument: false,
            isHostedFormEnabled: false,
            logo: null,
        },
        type: 'PAYMENT_TYPE_OFFLINE',
        initializationStrategy: {
            type: 'not_applicable',
        },
        nonce: null,
        initializationData: null,
        clientToken: null,
        returnUrl: null,
    },
    {
        id: 'cod',
        gateway: null,
        logoUrl: '',
        method: 'offline',
        supportedCards: [],
        providesShippingAddress: false,
        config: {
            displayName: 'Cash on Delivery',
            cardCode: null,
            helpText: 'Type your Cash on Delivery instructions in here.',
            enablePaypal: null,
            merchantId: null,
            is3dsEnabled: null,
            testMode: false,
            isVisaCheckoutEnabled: null,
            requireCustomerCode: false,
            isVaultingEnabled: false,
            isVaultingCvvEnabled: null,
            hasDefaultStoredInstrument: false,
            isHostedFormEnabled: false,
            logo: null,
            showCardHolderName: null,
        },
        type: 'PAYMENT_TYPE_OFFLINE',
        initializationStrategy: {
            type: 'not_applicable',
        },
        nonce: null,
        initializationData: null,
        clientToken: null,
        returnUrl: null,
    },
    {
        id: 'bigpaypay',
        gateway: null,
        logoUrl: '',
        method: 'zzzblackhole',
        supportedCards: ['VISA', 'AMEX', 'MC'],
        providesShippingAddress: false,
        config: {
            displayName: 'Test Payment Provider',
            cardCode: null,
            helpText: '',
            enablePaypal: null,
            merchantId: null,
            is3dsEnabled: null,
            testMode: false,
            isVisaCheckoutEnabled: null,
            requireCustomerCode: false,
            isVaultingEnabled: false,
            isVaultingCvvEnabled: null,
            hasDefaultStoredInstrument: false,
            isHostedFormEnabled: true,
            logo: null,
        },
        type: 'PAYMENT_TYPE_API',
        initializationStrategy: {
            type: 'not_applicable',
        },
        nonce: null,
        initializationData: null,
        clientToken: null,
        returnUrl: null,
    },
];

export { payments };
