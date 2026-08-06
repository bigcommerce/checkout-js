import { type CheckoutSettings } from '@bigcommerce/checkout-sdk';

import { isPayPalFastlaneMethod } from '@bigcommerce/checkout/paypal-fastlane-integration';
import { isExperimentEnabled } from '@bigcommerce/checkout/utility';

import getProviderWithCustomCheckout from '../payment/getProviderWithCustomCheckout';

export function getIsNewPhoneValidationExperimentEnabled(
    checkoutSettings?: CheckoutSettings,
): boolean {
    // PayPal Fastlane stores keep the legacy phone input for now, due to incident
    const isPayPalFastlaneEnabled = isPayPalFastlaneMethod(
        getProviderWithCustomCheckout(checkoutSettings?.providerWithCustomCheckout),
    );

    return (
        !isPayPalFastlaneEnabled &&
        isExperimentEnabled(
            checkoutSettings,
            'CHECKOUT-9019.use_new_phone_number_validation',
            false,
        )
    );
}
