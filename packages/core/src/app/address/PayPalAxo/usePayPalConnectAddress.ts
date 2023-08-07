import { Address } from '@bigcommerce/checkout-sdk';

import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import { isEqualAddress } from '..';

const usePayPalConnectAddress = () => {
    const { checkoutState } = useCheckout();
    
    const getPaypalConnectAddresses = (): Address[] => {
        const { data: { getPaymentProviderCustomer }} = checkoutState;

        return getPaymentProviderCustomer()?.addresses || [];
    };

    const isPayPalConnectAddress = (address: Address): boolean => {
        const paypalConnectAddresses = getPaypalConnectAddresses();

        if (!paypalConnectAddresses.length) {
            return false;
        }

        return paypalConnectAddresses.some((paypalConnectAddress) => isEqualAddress(address, paypalConnectAddress));
    };

    const shouldShowPayPalConnectLabel = (): boolean => !!getPaypalConnectAddresses().length;

    const mergeAddresses = (customerAddresses: Address[]): Address[] => [
        ...getPaypalConnectAddresses(),
        ...customerAddresses.filter((address) => !isPayPalConnectAddress(address)),
    ];

    return {
        isPayPalConnectAddress,
        shouldShowPayPalConnectLabel,
        mergeAddresses,
    };
};

export default usePayPalConnectAddress;
