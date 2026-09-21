import { CheckoutSelectors, CustomError } from '@bigcommerce/checkout-sdk';
import { createSelector } from 'reselect';

import { EMPTY_ARRAY } from '../common/utility';

import { WithCheckoutProps } from './Checkout';
import { CheckoutContextProps } from './CheckoutContext';
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
            features = {},
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

    const walletButtonsOnTopFlag = Boolean(checkoutUserExperienceSettings.walletButtonsOnTop);

    const billingAddress = data.getBillingAddress();
    const customer = data.getCustomer();

    if (billingAddress && customer) {
        billingAddress.address1 = customer.addresses[0]?.address1;
        billingAddress.address2 = customer.addresses[0]?.address2;
        billingAddress.city = customer.addresses[0]?.city;
        billingAddress.company = customer.addresses[0]?.company;
        billingAddress.country = customer.addresses[0]?.country;
        billingAddress.countryCode = customer.addresses[0]?.countryCode;
        billingAddress.email = customer.email;
        billingAddress.firstName = customer.addresses[0]?.firstName;
        billingAddress.lastName = customer.addresses[0]?.lastName;
        billingAddress.phone = customer.addresses[0]?.phone;
        billingAddress.postalCode = customer.addresses[0]?.postalCode;
        billingAddress.stateOrProvince = customer.addresses[0]?.stateOrProvince;
        billingAddress.stateOrProvinceCode = customer.addresses[0]?.stateOrProvinceCode;
    }

    return {
        billingAddress,
        cart: data.getCart(),
        clearError: checkoutService.clearError,
        consignments: data.getConsignments(),
        hasCartChanged: submitOrderError && submitOrderError.type === 'cart_changed', // TODO: Need to clear the error once it's displayed
        isGuestEnabled,
        isLoadingCheckout: statuses.isLoadingCheckout(),
        isPending: statuses.isPending(),
        isPriceHiddenFromGuests,
        isShowingWalletButtonsOnTop: walletButtonsOnTopFlag,
        loadCheckout: checkoutService.loadCheckout,
        loginUrl,
        cartUrl,
        createAccountUrl,
        canCreateAccountInCheckout: features['CHECKOUT-4941.account_creation_in_checkout'],
        promotions,
        subscribeToConsignments: subscribeToConsignmentsSelector({
            checkoutService,
            checkoutState,
        }),
        steps: data.getCheckout() ? getCheckoutStepStatuses(checkoutState) : EMPTY_ARRAY,
    };
}
