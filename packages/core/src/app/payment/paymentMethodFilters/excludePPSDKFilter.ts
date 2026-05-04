import { PaymentMethodProviderType } from '../paymentMethod';

import { type PaymentMethodFilter } from './types';

export const excludePPSDKFilter: PaymentMethodFilter = {
    name: 'excludePPSDK',
    apply(methods, { capabilities }) {
        if (!capabilities.payment.excludePPSDK) {
            return methods;
        }

        return methods.filter((method) => method.type !== PaymentMethodProviderType.PPSDK);
    },
};
