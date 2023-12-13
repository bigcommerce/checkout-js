import { isApplePayWindow } from "../common/utility";

const APPLE_PAY = 'applepay';

// TODO: The API should tell UI which payment method offers its own checkout button
export const SUPPORTED_METHODS: string[] = [
    'amazonpay',
    APPLE_PAY,
    'braintreevisacheckout',
    'braintreepaypal',
    'braintreepaypalcredit',
    'chasepay',
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
];

export const getSupportedMethodIds = (methodIds: string[]): string[] => {
    return methodIds.filter((methodId) => {
        if (methodId === APPLE_PAY && !isApplePayWindow(window)) {
            return false;
        }

        return SUPPORTED_METHODS.indexOf(methodId) !== -1;
    });
}
