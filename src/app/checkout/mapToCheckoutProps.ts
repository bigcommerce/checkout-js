import { CustomError } from '@bigcommerce/checkout-sdk';

import { EMPTY_ARRAY } from '../common/utility';

import getCheckoutStepStatuses from './getCheckoutStepStatuses';
import { CheckoutProps, WithCheckoutProps } from './Checkout';
import { CheckoutContextProps } from './CheckoutContext';

export default function mapToCheckoutProps(
    { checkoutService, checkoutState }: CheckoutContextProps
): WithCheckoutProps {
    const { data, errors, statuses } = checkoutState;
    const { grandTotal = 0, promotions = EMPTY_ARRAY } = data.getCheckout() || {};
    const { storeCredit = 0 } = data.getCustomer() || {};
    const submitOrderError = errors.getSubmitOrderError() as CustomError;
    const {
        checkoutSettings: { guestCheckoutEnabled: isGuestEnabled = false } = {},
        links: { loginLink: loginUrl = '' } = {},
    } = data.getConfig() || {};

    return {
        billingAddress: data.getBillingAddress(),
        cart: data.getCart(),
        clearError: checkoutService.clearError,
        consignments: data.getConsignments(),
        hasCartChanged: submitOrderError && submitOrderError.type === 'cart_changed', // TODO: Need to clear the error once it's displayed
        isGuestEnabled,
        isLoadingCheckout: statuses.isLoadingCheckout(),
        isPending: statuses.isPending(),
        loadCheckout: checkoutService.loadCheckout,
        loginUrl,
        promotions,
        steps: data.getCheckout() ? getCheckoutStepStatuses(checkoutState) : EMPTY_ARRAY,
        usableStoreCredit: Math.min(grandTotal, storeCredit),
    };
}
