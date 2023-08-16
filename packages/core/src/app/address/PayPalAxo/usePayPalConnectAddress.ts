import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import { PaymentMethodId } from '../../payment/paymentMethod';

import { isPayPalConnectAddress } from './utils';

const usePayPalConnectAddress = () => {
    const { checkoutState } = useCheckout();
    const { getConfig, getCustomer, getPaymentProviderCustomer } = checkoutState.data;

    const providerWithCustomCheckout = getConfig()?.checkoutSettings?.providerWithCustomCheckout;
    const isPayPalAxoEnabled = providerWithCustomCheckout === PaymentMethodId.BraintreeAcceleratedCheckout
        || providerWithCustomCheckout === PaymentMethodId.Braintree;

    const paypalConnectAddresses = getPaymentProviderCustomer()?.addresses || [];
    const bcAddresses = getCustomer()?.addresses || [];

    const mergedBcAndPayPalConnectAddresses = isPayPalAxoEnabled 
        ? [
            ...paypalConnectAddresses,
            ...bcAddresses.filter((address) => !isPayPalConnectAddress(address, paypalConnectAddresses))
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
