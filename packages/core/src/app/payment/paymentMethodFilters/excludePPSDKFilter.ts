import { type PaymentMethodFilter } from '@bigcommerce/checkout/payment-integration-api';

import { PaymentMethodProviderType } from '../paymentMethod';

export const excludePPSDKFilter: PaymentMethodFilter = {
    name: 'excludePPSDK',
    apply(methods, { capabilities }) {
        if (!capabilities.payment.excludePPSDK) {
            return methods;
        }

        return methods.filter((method) => method.type !== PaymentMethodProviderType.PPSDK);
    },
};
