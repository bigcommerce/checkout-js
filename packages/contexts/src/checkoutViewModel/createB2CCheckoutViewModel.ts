import { type CheckoutSelectors } from '@bigcommerce/checkout-sdk';

import { type CheckoutViewModel, CheckoutViewModelType } from './CheckoutViewModelType';

export const createB2CCheckoutViewModel = (checkoutState: CheckoutSelectors): CheckoutViewModel => {
    return {
        type: CheckoutViewModelType.B2C,
        capabilities: {
            canSearchAddresses: false,
            lockShipping: false,
        },
        data: {
            addressBook: checkoutState.data.getCustomer()?.addresses || [],
        },
    };
};
