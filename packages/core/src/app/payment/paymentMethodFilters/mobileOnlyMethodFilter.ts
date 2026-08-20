import { type PaymentMethodFilter } from '@bigcommerce/checkout/payment-integration-api';

import { isMobile } from '../../common/utility';

export const mobileOnlyMethodFilter: PaymentMethodFilter = {
    name: 'mobileOnly',
    apply(methods) {
        if (isMobile()) {
            return methods;
        }

        return methods.filter((method) => !method.initializationData?.showOnlyOnMobileDevices);
    },
};
