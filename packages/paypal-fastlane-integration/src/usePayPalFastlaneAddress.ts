import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import isBraintreeFastlaneMethod from './is-braintree-fastlane-method';
import isPayPalFastlaneAddress from './is-paypal-fastlane-address';
import isPayPalFastlaneCustomer from './is-paypal-fastlane-customer';
import isPayPalFastlaneMethod from './is-paypal-fastlane-method';

const usePayPalFastlaneAddress = () => {
    const { checkoutState } = useCheckout();
    const { getConfig, getCustomer, getPaymentProviderCustomer } = checkoutState.data;

    const providerWithCustomCheckout =
        getConfig()?.checkoutSettings.providerWithCustomCheckout || '';
    const isPayPalFastlaneEnabled = isPayPalFastlaneMethod(providerWithCustomCheckout);

    const isBraintreeFastlaneIconExperimentOn =
        getConfig()?.checkoutSettings.features['PAYPAL-3926.braintree_fastlane_icon_switch'];
    const isPayPalCommerceFastlaneIconExperimentOn =
        getConfig()?.checkoutSettings.features['PAYPAL-3926.paypal_commerce_fastlane_icon_switch'];

    const paymentProviderCustomer = getPaymentProviderCustomer();
    const paypalFastlaneCustomer = isPayPalFastlaneCustomer(paymentProviderCustomer)
        ? paymentProviderCustomer
        : {};

    const paypalFastlaneAddresses = paypalFastlaneCustomer.addresses || [];
    const bcAddresses = getCustomer()?.addresses || [];

    const mergedBcAndPayPalFastlaneAddresses = isPayPalFastlaneEnabled
        ? [
              ...paypalFastlaneAddresses,
              ...bcAddresses.filter(
                  (address) => !isPayPalFastlaneAddress(address, paypalFastlaneAddresses),
              ),
          ]
        : bcAddresses;

    const hasPayPalAddresses = !!paypalFastlaneAddresses.length;

    const shouldShowBraintreeFastlaneLabel =
        hasPayPalAddresses &&
        isBraintreeFastlaneIconExperimentOn &&
        isBraintreeFastlaneMethod(providerWithCustomCheckout);
    const shouldShowPayPalCommerceFastlaneLabel =
        hasPayPalAddresses &&
        isPayPalCommerceFastlaneIconExperimentOn &&
        isPayPalFastlaneMethod(providerWithCustomCheckout);
    const shouldShowPayPalFastlaneLabel =
        shouldShowBraintreeFastlaneLabel || shouldShowPayPalCommerceFastlaneLabel;
    const shouldShowPayPalConnectLabel = !shouldShowPayPalFastlaneLabel && hasPayPalAddresses;

    return {
        isPayPalFastlaneEnabled,
        paypalFastlaneAddresses,
        shouldShowPayPalConnectLabel,
        shouldShowPayPalFastlaneLabel,
        mergedBcAndPayPalFastlaneAddresses,
    };
};

export default usePayPalFastlaneAddress;
