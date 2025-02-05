import { CheckoutSettings } from '@bigcommerce/checkout-sdk';

import { isApplePayWindow } from "../common/utility";
import shouldFilterApplePay from '../common/utility/should-filter-apple-pay';

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
];

export const getSupportedMethodIds = (methodIds: string[], features: CheckoutSettings['features'] = {}): string[] => {
    return methodIds.filter((methodId) => {
        // TODO: this check have to be deleted after implementation of Apple Pay for third party browsers will be tested and released
        if (shouldFilterApplePay(methodId, features['PAYPAL-4324.applepay_web_browser_support'] ?? true)) {
            return false;
        }

        return SUPPORTED_METHODS.indexOf(methodId) !== -1;
    });
}
