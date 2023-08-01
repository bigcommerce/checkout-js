import { Address } from '@bigcommerce/checkout-sdk';

import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import { isEqualAddress } from '../../address';

const usePayPalConnectAddress = () => {
    const { checkoutState } = useCheckout();
    
    const getPaypalConnectAddresses = (): Address[] => {
        const { data: { getPaymentProviderCustomer }} = checkoutState;
        const addresses = getPaymentProviderCustomer()?.addresses || [];

        console.log('*** getPaymentProviderCustomer()', getPaymentProviderCustomer());

        // TODO: if no data in getPaymentProviderCustomer => need to get from LS
        // if data from LS need to check email from LS and email from customer step

        // TODO: remove this mock after fix types on checkout-sdk-js
        return addresses.map(address => ({
            ...address,
            country: address.countryCode,
        }));
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
        getPaypalConnectAddresses,
        isPayPalConnectAddress,
        shouldShowPayPalConnectLabel,
        mergeAddresses,
    };
};

export default usePayPalConnectAddress;
