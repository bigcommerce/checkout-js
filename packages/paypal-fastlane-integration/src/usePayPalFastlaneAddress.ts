import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import isPayPalFastlaneAddress from './is-paypal-fastlane-address';
import isPayPalFastlaneCustomer from './is-paypal-fastlane-customer';
import isPayPalFastlaneMethod from './is-paypal-fastlane-method';
import isBraintreeFastlaneMethod from './is-braintree-fastlane-method';
import isPayPalCommerceFastlaneMethod from './is-paypal-commerce-fastlane-method';

const usePayPalFastlaneAddress = () => {
    const { checkoutState } = useCheckout();
    const { getConfig, getCustomer, getPaymentProviderCustomer } = checkoutState.data;
    const paymentWithCustomCheckout = getConfig()?.checkoutSettings.providerWithCustomCheckout || '';

    const isPayPalFastlaneEnabled = isPayPalFastlaneMethod(paymentWithCustomCheckout);

    const paymentProviderCustomer = getPaymentProviderCustomer();
    const paypalFastlaneCustomer = isPayPalFastlaneCustomer(paymentProviderCustomer)
        ? paymentProviderCustomer
        : {};

    const shouldHideBraintreeFastlaneForStoreMembers =
        isBraintreeFastlaneMethod(paymentWithCustomCheckout) &&
        getConfig()?.checkoutSettings.features['PAYPAL-3926.braintree_fastlane_icon_switch'];
    const shouldHidePayPalCommerceFastlaneForStoreMembers =
        isPayPalCommerceFastlaneMethod(paymentWithCustomCheckout) &&
        getConfig()?.checkoutSettings.features['PAYPAL-3926.paypal_commerce_fastlane_icon_switch'];

    const shouldHidePayPalFastlaneForStoreMembers =
        shouldHideBraintreeFastlaneForStoreMembers ||
        shouldHidePayPalCommerceFastlaneForStoreMembers;

    const paypalFastlaneAddresses = paypalFastlaneCustomer.addresses || [];

    // Info: BC address support will be deprecated for Fastlane in nearest future
    const bcAddresses = shouldHidePayPalFastlaneForStoreMembers ? [] : getCustomer()?.addresses || [];
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
        paypalFastlaneAddresses.length > 0
        && paymentProviderCustomer.authenticationState !== 'CANCELED'
        && getConfig()?.checkoutSettings.features['PAYPAL-3996.paypal_fastlane_shipping_update'];

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
