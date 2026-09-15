import { type CheckoutSettings } from '@bigcommerce/checkout-sdk';

import { isExperimentEnabled } from '@bigcommerce/checkout/utility';

export const isGooglePayHandleUnsuccessful3dsCheckExperimentOn = (
    checkoutSettings?: CheckoutSettings,
): boolean =>
    isExperimentEnabled(
        checkoutSettings,
        'PI-5643.google_pay_handle_unsuccessful_3ds_check',
        false,
    );
