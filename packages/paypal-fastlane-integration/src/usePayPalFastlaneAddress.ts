import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import isPayPalFastlaneCustomer from './is-paypal-fastlane-customer';
import isPayPalFastlaneMethod from './is-paypal-fastlane-method';

const usePayPalFastlaneAddress = () => {
    const { checkoutState } = useCheckout();
    const { getConfig, getPaymentProviderCustomer } = checkoutState.data;
    const paymentWithCustomCheckout =
        getConfig()?.checkoutSettings.providerWithCustomCheckout || '';

    const isPayPalFastlaneEnabled = isPayPalFastlaneMethod(paymentWithCustomCheckout);

    const paymentProviderCustomer = getPaymentProviderCustomer();
    const paypalFastlaneCustomer = isPayPalFastlaneCustomer(paymentProviderCustomer)
        ? paymentProviderCustomer
        : {};

    const customerAuthenticationState = paymentProviderCustomer?.authenticationState;

    const paypalFastlaneAddresses = paypalFastlaneCustomer.addresses || [];

    const shouldShowPayPalFastlaneLabel =
        paypalFastlaneAddresses.length > 0 && isPayPalFastlaneEnabled;

    const shouldShowPayPalFastlaneShippingForm =
        paypalFastlaneAddresses.length > 0 &&
        customerAuthenticationState &&
        customerAuthenticationState !== 'CANCELED' &&
        customerAuthenticationState !== 'unrecognized';

    return {
        isPayPalFastlaneEnabled,
        paypalFastlaneAddresses,
        shouldShowPayPalFastlaneLabel,
        shouldShowPayPalFastlaneShippingForm,
    };
};

export default usePayPalFastlaneAddress;
