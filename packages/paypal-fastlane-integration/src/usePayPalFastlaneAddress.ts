import { useCheckout } from '@bigcommerce/checkout/contexts';

import isBraintreeFastlaneMethod from './is-braintree-fastlane-method';
import isPayPalFastlaneCustomer from './is-paypal-fastlane-customer';
import isPayPalFastlaneMethod from './is-paypal-fastlane-method';

// TODO: PAYPAL-7303 prototype flag. Remove once Fastlane for known shoppers is rolled out to 100%
const BRAINTREE_FASTLANE_KNOWN_SHOPPERS_FEATURE = 'PAYPAL-7303.braintree_fastlane_known_shoppers';

const usePayPalFastlaneAddress = () => {
    const { checkoutState } = useCheckout();
    const { getConfig, getPaymentProviderCustomer } = checkoutState.data;
    const paymentWithCustomCheckout: string =
        getConfig()?.checkoutSettings.providerWithCustomCheckout || '';

    const isPayPalFastlaneEnabled = isPayPalFastlaneMethod(paymentWithCustomCheckout);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const paymentProviderCustomer = getPaymentProviderCustomer() || undefined;
    const paypalFastlaneCustomer = isPayPalFastlaneCustomer(paymentProviderCustomer)
        ? paymentProviderCustomer
        : {};

    const customerAuthenticationState = paypalFastlaneCustomer.authenticationState;
    const paypalFastlaneAddresses = paypalFastlaneCustomer.addresses || [];

    const features: Record<string, boolean> | undefined = getConfig()?.checkoutSettings.features;
    // TODO: PAYPAL-7303 TEMPORARY: flag is forced to true, restore the lines below before merging
    // const isFastlaneForKnownShoppersEnabled =
    //     isBraintreeFastlaneMethod(paymentWithCustomCheckout) &&
    //     !!features?.[BRAINTREE_FASTLANE_KNOWN_SHOPPERS_FEATURE];
    const isFastlaneForKnownShoppersEnabled =
        isBraintreeFastlaneMethod(paymentWithCustomCheckout) &&
        (!!features?.[BRAINTREE_FASTLANE_KNOWN_SHOPPERS_FEATURE] || true);

    const shouldShowPayPalFastlaneLabel =
        paypalFastlaneAddresses.length > 0 && isPayPalFastlaneEnabled;

    const shouldShowPayPalFastlaneShippingForm =
        paypalFastlaneAddresses.length > 0 &&
        customerAuthenticationState &&
        customerAuthenticationState !== 'CANCELED' &&
        customerAuthenticationState !== 'unrecognized';

    return {
        isPayPalFastlaneEnabled,
        isFastlaneForKnownShoppersEnabled,
        paypalFastlaneAddresses,
        shouldShowPayPalFastlaneLabel,
        shouldShowPayPalFastlaneShippingForm,
    };
};

export default usePayPalFastlaneAddress;
