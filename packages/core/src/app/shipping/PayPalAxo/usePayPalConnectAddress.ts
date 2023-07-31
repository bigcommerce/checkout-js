import { Address, CustomerAddress } from '@bigcommerce/checkout-sdk';

import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import { isEqualAddress } from '../../address';

const usePayPalConnectAddress = () => {
    const { checkoutState } = useCheckout();
    
    const getPaypalConnectAddresses = (): CustomerAddress[] => {
        const { data: { getCustomer }} = checkoutState;
        const paypalConnectAddress = getCustomer()?.addresses[1];
        // const paypalConnectAddress = undefined;

        return paypalConnectAddress ? [paypalConnectAddress] : []; // TODO: mock data, should get from checkoutState.getPaymentProviderCustomer()
    };

    const isPayPalConnectAddress = (address: Address): boolean => {
        const paypalConnectAddresses = getPaypalConnectAddresses();

        if (!paypalConnectAddresses.length) {
            return false;
        }

        return paypalConnectAddresses.some((paypalConnectAddress) => isEqualAddress(address, paypalConnectAddress));
    };

    const shouldShowPayPalConnectLabel = (): boolean => !!getPaypalConnectAddresses().length;

    const mergeAddresses = (customerAddresses: CustomerAddress[]): CustomerAddress[] => [
        ...getPaypalConnectAddresses(),
        ...customerAddresses.filter((address) => !isPayPalConnectAddress(address)),
    ];

    return {
        getPaypalConnectAddresses,
        isPayPalConnectAddress,
        shouldShowPayPalConnectLabel,
        mergeAddresses,
    };
};

export default usePayPalConnectAddress;
