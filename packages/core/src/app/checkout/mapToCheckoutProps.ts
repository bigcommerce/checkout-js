// @ts-nocheck
import { CheckoutSelectors, CustomError } from '@bigcommerce/checkout-sdk';
import { createSelector } from 'reselect';

import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';

import { EMPTY_ARRAY } from '../common/utility';

import { WithCheckoutProps } from './Checkout';
import getCheckoutStepStatuses from './getCheckoutStepStatuses';

export default function mapToCheckoutProps({
    checkoutService,
    checkoutState,
}: CheckoutContextProps): WithCheckoutProps {
    const { data, errors, statuses } = checkoutState;
    const { promotions = EMPTY_ARRAY } = data.getCheckout() || {};
    const submitOrderError = errors.getSubmitOrderError() as CustomError;
    const {
        checkoutSettings: {
            guestCheckoutEnabled: isGuestEnabled = false,
            checkoutUserExperienceSettings = {
                walletButtonsOnTop: false,
                floatingLabelEnabled: false,
            } ,
        } = {},
        links: {
            loginLink: loginUrl = '',
            createAccountLink: createAccountUrl = '',
            cartLink: cartUrl = '',
        } = {},
        displaySettings: { hidePriceFromGuests: isPriceHiddenFromGuests = false } = {},
    } = data.getConfig() || {};

    const subscribeToConsignmentsSelector = createSelector(
        ({ checkoutService: { subscribe } }: CheckoutContextProps) => subscribe,
        (subscribe) => (subscriber: (state: CheckoutSelectors) => void) => {
            return subscribe(subscriber, ({ data: { getConsignments } }) => getConsignments());
        },
    );

    const subscribeToLoginSelector = createSelector(
        ({ checkoutService: { subscribe} }: CheckoutContextProps) => subscribe,
        subscribe => (subscriber: (state: CheckoutSelectors) => void) => {
            return subscribe(subscriber, ({ data: { getCustomer } }) => getCustomer());
        }
    );
    const walletButtonsOnTopFlag = Boolean(checkoutUserExperienceSettings.walletButtonsOnTop);

    return {
        billingAddress: data.getBillingAddress(),
        cart: data.getCart(),
        clearError: checkoutService.clearError,
        consignments: data.getConsignments(),
        deleteConsignment: checkoutService.deleteConsignment,
        hasCartChanged: submitOrderError && submitOrderError.type === 'cart_changed', // TODO: Need to clear the error once it's displayed
        isGuestEnabled,
        isLoadingCheckout: statuses.isLoadingCheckout(),
        isPending: statuses.isPending(),
        isPriceHiddenFromGuests,
        isShowingWalletButtonsOnTop: walletButtonsOnTopFlag,
        loadCheckout: checkoutService.loadCheckout,
        loadPaymentMethodByIds: checkoutService.loadPaymentMethodByIds,
        loginUrl,
        cartUrl,
        createAccountUrl,
        promotions,
        // Added the two lines below because we need to reload data after consignment is deleted on login subscription
        loadShippingAddressFields: checkoutService.loadShippingAddressFields,
        loadShippingOptions: checkoutService.loadShippingOptions,
        subscribeToConsignments: subscribeToConsignmentsSelector({
            checkoutService,
            checkoutState,
        }),
        subscribeToLogin: subscribeToLoginSelector({ checkoutService, checkoutState }),
        steps: data.getCheckout() ? getCheckoutStepStatuses(checkoutState) : EMPTY_ARRAY,
    };
}
