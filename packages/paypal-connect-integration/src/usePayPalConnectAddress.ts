import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import isPayPalConnectAddress from './is-paypal-connect-address';
import isPaypalConnectMethod from './is-paypal-connect-method';
import isPayPalConnectAcceleratedCheckoutCustomer from './is-paypal-connect-payment-provider-customer';

const usePayPalConnectAddress = () => {
    const { checkoutState } = useCheckout();
    const { getConfig, getCustomer, getPaymentProviderCustomer } = checkoutState.data;

    const providerWithCustomCheckout =
        getConfig()?.checkoutSettings.providerWithCustomCheckout || '';
    const isPayPalAxoEnabled = isPaypalConnectMethod(providerWithCustomCheckout);

    const paymentProviderCustomer = getPaymentProviderCustomer();
    const paypalConnectPaymentProviderCustomer = isPayPalConnectAcceleratedCheckoutCustomer(
        paymentProviderCustomer,
    )
        ? paymentProviderCustomer
        : {};

    const paypalConnectAddresses = paypalConnectPaymentProviderCustomer.addresses || [];
    const bcAddresses = getCustomer()?.addresses || [];

    const mergedBcAndPayPalConnectAddresses = isPayPalAxoEnabled
        ? [
              ...paypalConnectAddresses,
              ...bcAddresses.filter(
                  (address) => !isPayPalConnectAddress(address, paypalConnectAddresses),
              ),
          ]
        : bcAddresses;

    const shouldShowPayPalConnectLabel = !!paypalConnectAddresses.length;

    return {
        isPayPalAxoEnabled,
        paypalConnectAddresses,
        shouldShowPayPalConnectLabel,
        mergedBcAndPayPalConnectAddresses,
    };
};

export default usePayPalConnectAddress;
