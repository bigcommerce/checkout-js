import { Address } from '@bigcommerce/checkout-sdk';

import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import { isEqualAddress } from '..';

const PAYPAL_CONNECT_CUSTOMER_KEY = 'paypal-connect-customer';

const usePayPalConnectAddress = () => {
    const { checkoutState } = useCheckout();
    
    const getPaypalConnectAddresses = (): Address[] => {
        const { data: { getPaymentProviderCustomer, getCustomer }} = checkoutState;
        let addresses = getPaymentProviderCustomer()?.addresses;

        if (!addresses?.length) {
            const storesPayPalConnectCustomer = JSON.parse(
                localStorage.getItem(PAYPAL_CONNECT_CUSTOMER_KEY) || ''
            );

            addresses = getCustomer()?.email === storesPayPalConnectCustomer?.email
                ? storesPayPalConnectCustomer?.addresses
                : [];
        }

        return addresses || [];
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
