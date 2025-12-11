const APPLE_PAY = 'applepay';

// TODO: The API should tell UI which payment method offers its own checkout button
export const SUPPORTED_METHODS: string[] = [
    'amazonpay',
    APPLE_PAY,
    'chasepay',
    'bigcommerce_payments',
    'bigcommerce_payments_paylater',
    'bigcommerce_payments_venmo',
    'braintreevisacheckout',
    'braintreepaypal',
    'braintreepaypalcredit',
    'paypalcommerce',
    'paypalcommercevenmo',
    'paypalcommercecredit',
    'googlepayadyenv2',
    'googlepayadyenv3',
    'googlepayauthorizenet',
    'googlepaybnz',
    'googlepaybraintree',
    'googlepaycheckoutcom',
    'googlepaycybersourcev2',
    'googlepayorbital',
    'googlepaystripe',
    'googlepaystripeupe',
    'googlepayworldpayaccess',
    'googlepaypaypalcommerce',
    'googlepaytdonlinemart',
    'stripeocs',
    'googlepaystripeocs',
    'googlepay_bigcommerce_payments',
];

export const getSupportedMethodIds = (methodIds: string[]): string[] => {
    return methodIds.filter((methodId) => SUPPORTED_METHODS.includes(methodId));
}
