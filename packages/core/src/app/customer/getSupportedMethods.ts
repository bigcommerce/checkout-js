const APPLE_PAY = 'applepay';

// TODO: The API should tell UI which payment method offers its own checkout button
export const SUPPORTED_METHODS: string[] = [
    'amazonpay',
    APPLE_PAY,
    'chasepay',
    'braintreevisacheckout',
    'braintreepaypal',
    'braintreepaypalcredit',
    'masterpass',
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
];

export const getSupportedMethodIds = (methodIds: string[]): string[] => {
    return methodIds.filter((methodId) => SUPPORTED_METHODS.includes(methodId));
}
