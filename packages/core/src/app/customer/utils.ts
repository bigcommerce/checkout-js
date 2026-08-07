import { type Cart, type StoreConfig } from '@bigcommerce/checkout-sdk';

import { itemsRequireShipping } from '../shipping';

export const getContinueAsGuestButtonLabelId = (
    themeV2: boolean,
    cart?: Cart,
    config?: StoreConfig,
    isShippingStepComplete = false,
): string => {
    if (!themeV2) {
        return 'customer.continue';
    }

    const isDigitalItemsOnlyCart = !itemsRequireShipping(cart, config);

    const isSkippingShippingStep = isDigitalItemsOnlyCart || isShippingStepComplete;

    return isSkippingShippingStep
        ? 'common.continue_to_payment_action'
        : 'customer.continue_to_shipping_action';
};
