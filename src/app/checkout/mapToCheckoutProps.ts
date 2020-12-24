import { CheckoutSelectors, CustomError } from '@bigcommerce/checkout-sdk';
import { createSelector } from 'reselect';

import { EMPTY_ARRAY } from '../common/utility';

import getCheckoutStepStatuses from './getCheckoutStepStatuses';
import { WithCheckoutProps } from './Checkout';
import { CheckoutContextProps } from './CheckoutContext';

export default function mapToCheckoutProps(
    { checkoutService, checkoutState }: CheckoutContextProps
): WithCheckoutProps {
    const { data, errors, statuses } = checkoutState;
    const { promotions = EMPTY_ARRAY } = data.getCheckout() || {};
    const submitOrderError = errors.getSubmitOrderError() as CustomError;
    const {
        checkoutSettings: {
            guestCheckoutEnabled: isGuestEnabled = false,
            features = {},
        } = {},
        links: {
            loginLink: loginUrl = '',
            createAccountLink: createAccountUrl = '',
        } = {},
    } = data.getConfig() || {};

    const subscribeToConsignmentsSelector = createSelector(
        ({ checkoutService: { subscribe} }: CheckoutContextProps) => subscribe,
        subscribe => (subscriber: (state: CheckoutSelectors) => void) => {
            return subscribe(subscriber, ({ data: { getConsignments } }) => getConsignments());
        }
    );

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
        createAccountUrl,
        canCreateAccountInCheckout: features['CHECKOUT-4941.account_creation_in_checkout'],
        promotions,
        subscribeToConsignments: subscribeToConsignmentsSelector({ checkoutService, checkoutState }),
        steps: data.getCheckout() ? getCheckoutStepStatuses(checkoutState) : EMPTY_ARRAY,
    };
}
