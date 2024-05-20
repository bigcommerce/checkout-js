import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import isBraintreeFastlaneMethod from './is-braintree-fastlane-method';
import isPayPalCommerceFastlaneMethod from './is-paypal-commerce-fastlane-method';
import isPayPalFastlaneAddress from './is-paypal-fastlane-address';
import isPayPalFastlaneCustomer from './is-paypal-fastlane-customer';
import isPayPalFastlaneMethod from './is-paypal-fastlane-method';

const usePayPalFastlaneAddress = () => {
    const { checkoutState } = useCheckout();
    const { getConfig, getCustomer, getPaymentProviderCustomer } = checkoutState.data;
    const paymentWithCustomCheckout =
        getConfig()?.checkoutSettings.providerWithCustomCheckout || '';

    const isPayPalFastlaneEnabled = isPayPalFastlaneMethod(paymentWithCustomCheckout);

    const paymentProviderCustomer = getPaymentProviderCustomer();
    const paypalFastlaneCustomer = isPayPalFastlaneCustomer(paymentProviderCustomer)
        ? paymentProviderCustomer
        : {};

    const customerAuthenticationState =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        paymentProviderCustomer?.authenticationState;

    const shouldHideBraintreeFastlaneForStoreMembers =
        isBraintreeFastlaneMethod(paymentWithCustomCheckout) &&
        getConfig()?.checkoutSettings.features[
            'PAYPAL-4001.braintree_fastlane_stored_member_flow_removal'
        ];
    const shouldHidePayPalCommerceFastlaneForStoreMembers =
        isPayPalCommerceFastlaneMethod(paymentWithCustomCheckout) &&
        getConfig()?.checkoutSettings.features[
            'PAYPAL-4001.paypal_commerce_fastlane_stored_member_flow_removal'
        ];

    const shouldHidePayPalFastlaneForStoreMembers =
        shouldHideBraintreeFastlaneForStoreMembers ||
        shouldHidePayPalCommerceFastlaneForStoreMembers;

    const paypalFastlaneAddresses = paypalFastlaneCustomer.addresses || [];

    // Info: BC address support will be deprecated for Fastlane in nearest future
    const bcAddresses = shouldHidePayPalFastlaneForStoreMembers
        ? []
        : getCustomer()?.addresses || [];
    const mergedBcAndPayPalFastlaneAddresses = isPayPalFastlaneEnabled
        ? [
              ...paypalFastlaneAddresses,
              ...bcAddresses.filter(
                  (address) => !isPayPalFastlaneAddress(address, paypalFastlaneAddresses),
              ),
          ]
        : bcAddresses;

    const shouldShowPayPalFastlaneLabel =
        paypalFastlaneAddresses.length > 0 && isPayPalFastlaneEnabled;

    const shouldShowPayPalFastlaneShippingForm =
        paypalFastlaneAddresses.length > 0 &&
        customerAuthenticationState &&
        customerAuthenticationState !== 'CANCELED' &&
        customerAuthenticationState !== 'unrecognized' &&
        getConfig()?.checkoutSettings.features['PAYPAL-3996.paypal_fastlane_shipping_update'];

    return {
        isPayPalFastlaneEnabled,
        paypalFastlaneAddresses,
        shouldShowPayPalFastlaneLabel,
        shouldShowPayPalFastlaneShippingForm,
        mergedBcAndPayPalFastlaneAddresses,
        shouldHidePayPalFastlaneForStoreMembers,
    };
};

export default usePayPalFastlaneAddress;
