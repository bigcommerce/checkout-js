export function getPayPalCommerceMethod() {
    return {
        clientToken: undefined,
        config: {
            cardCode: true,
            displayName: 'Credit Cards',
            enablePaypal: undefined,
            hasDefaultStoredInstrument: false,
            helpText: '',
            is3dsEnabled: undefined,
            isHostedFormEnabled: false,
            isVaultingCvvEnabled: undefined,
            isVaultingEnabled: false,
            isVisaCheckoutEnabled: undefined,
            logo: undefined,
            merchantId: '',
            requireCustomerCode: false,
            testMode: true,
        },
        gateway: undefined,
        id: 'paypalcommerce',
        initializationData: {
            attributionId: 'BC_id',
            availableAlternativePaymentMethods: [],
            buttonStyle: {
                color: 'black',
                shape: 'rect',
                height: 55,
                label: 'pay',
            },
            clientId: 'asd123',
            enabledAlternativePaymentMethods: [],
            intent: 'capture',
            isComplete: false,
            isDeveloperModeApplicable: false,
            isHostedCheckoutEnabled: true,
            isInlineCheckoutEnabled: false,
            isPayPalCreditAvailable: true,
            isVenmoEnabled: true,
            merchantId: 'XdasdQWe1123',
            orderId: undefined,
            shouldRenderFields: true,
            showOnlyOnMobileDevices: false,
        },
        initializationStrategy: {
            type: 'not_applicable',
        },
        logoUrl: 'http://logo_url_path',
        method: 'paypal',
        nonce: undefined,
        returnUrl: undefined,
        supportedCards: [
            'PAYPAL',
            'PAYPALCREDIT',
            'VISA',
            'MC',
            'AMEX',
            'DISCOVER',
            'VENMO',
            'APPLEPAY',
        ],
        type: 'PAYMENT_TYPE_API',
    };
}

export function getPayPalCommerceCreditMethod() {
    const paypalCommerce = getPayPalCommerceMethod();

    return {
        ...paypalCommerce,
        id: 'paypalcommercecredit',
        initializationData: {
            ...paypalCommerce.initializationData,
            payPalCreditProductBrandName: {
                credit: 'Pay Later',
                messaging: 'Pay Later',
            },
        },
        method: 'paypal-credit',
    };
}

export function getPayPalCommerceVenmoMethod() {
    const paypalCommerce = getPayPalCommerceMethod();

    return {
        ...paypalCommerce,
        id: 'paypalcommercevenmo',
        method: 'paypal-venmo',
    };
}

export function getPayPalCommerceAPMsMethod() {
    const paypalCommerce = getPayPalCommerceMethod();

    const apms = ['bancontact', 'eps', 'giropay', 'ideal', 'mybank', 'p24', 'sepa', 'sofort'];

    return {
        ...paypalCommerce,
        config: {
            ...paypalCommerce.config,
            displayName: 'Sepa',
        },
        gateway: 'paypalcommercealternativemethods',
        id: 'sepa',
        initializationData: {
            ...paypalCommerce.initializationData,
            availableAlternativePaymentMethods: apms,
            enabledAlternativePaymentMethods: apms,
        },
        method: 'multi-option',
    };
}
