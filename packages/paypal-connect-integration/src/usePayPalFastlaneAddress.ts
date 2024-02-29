import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import isPayPalFastlaneAddress from './is-paypal-fastlane-address';
import isPayPalFastlaneCustomer from './is-paypal-fastlane-customer';
import isPayPalFastlaneMethod from './is-paypal-fastlane-method';

const usePayPalFastlaneAddress = () => {
    const { checkoutState } = useCheckout();
    const { getConfig, getCustomer, getPaymentProviderCustomer } = checkoutState.data;

    const providerWithCustomCheckout =
        getConfig()?.checkoutSettings.providerWithCustomCheckout || '';
    const isPayPalFastlaneEnabled = isPayPalFastlaneMethod(providerWithCustomCheckout);

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

    const shouldShowPayPalFastlaneLabel = !!paypalFastlaneAddresses.length;

    return {
        isPayPalAxoEnabled: isPayPalFastlaneEnabled, // TODO: remove this option when it when we remove all it usage in checkout project
        isPayPalFastlaneEnabled,
        paypalConnectAddresses: paypalFastlaneAddresses, // TODO: remove this option when it when we remove all it usage in checkout project
        paypalFastlaneAddresses,
        shouldShowPayPalConnectLabel: shouldShowPayPalFastlaneLabel, // TODO: remove this option when it when we remove all it usage in checkout project
        shouldShowPayPalFastlaneLabel,
        mergedBcAndPayPalConnectAddresses: mergedBcAndPayPalFastlaneAddresses, // TODO: remove this option when it when we remove all it usage in checkout project
        mergedBcAndPayPalFastlaneAddresses,
    };
};

export default usePayPalFastlaneAddress;
