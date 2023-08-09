import { Address, CustomerAddress } from '@bigcommerce/checkout-sdk';

import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import isEqualAddress from '../isEqualAddress';

const PAYPAL_ADDRESS_TYPE = 'paypal-address';
const PAYPAL_CONNECT_CUSTOMER_KEY = 'paypal-connect.customer';

const usePayPalConnectAddress = () => {
    const { checkoutState } = useCheckout();
    
    const getPaypalConnectAddresses = (): CustomerAddress[] => {
        const { data: { getPaymentProviderCustomer, getCustomer, getBillingAddress }} = checkoutState;
        let addresses = getPaymentProviderCustomer()?.addresses;

        if (!addresses?.length) {
            const storedPayPalConnectCustomer = localStorage.getItem(PAYPAL_CONNECT_CUSTOMER_KEY);

            if (!storedPayPalConnectCustomer) {
                return [];
            }

            const { email: storedEmail, addresses: storedAddresses } = JSON.parse(storedPayPalConnectCustomer) || {};
            const customerEmail = getCustomer()?.email || getBillingAddress()?.email;

            addresses = customerEmail === storedEmail ? storedAddresses : [];
        }

        return addresses || [];
    };

    const isPayPalConnectAddress = (address: CustomerAddress | Address): boolean => {
        if ('type' in address) {
            return address.type === PAYPAL_ADDRESS_TYPE;
        }

        return getPaypalConnectAddresses().some(
            (paypalConnectAddress) => isEqualAddress(address, paypalConnectAddress)
        );
    };

    const shouldShowPayPalConnectLabel = (): boolean => !!getPaypalConnectAddresses().length;

    const mergeAddresses = (customerAddresses: CustomerAddress[]): CustomerAddress[] => [
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
