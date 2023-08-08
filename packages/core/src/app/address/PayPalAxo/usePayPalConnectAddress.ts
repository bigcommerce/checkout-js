import { CustomerAddress } from '@bigcommerce/checkout-sdk';

import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

const PAYPAL_ADDRESS_TYPE = 'paypal-address';

const usePayPalConnectAddress = () => {
    const { checkoutState } = useCheckout();
    
    const getPaypalConnectAddresses = (): CustomerAddress[] => {
        const { data: { getPaymentProviderCustomer }} = checkoutState;

        return getPaymentProviderCustomer()?.addresses || [];
    };

    const isPayPalConnectAddress = (address: CustomerAddress): boolean => address.type === PAYPAL_ADDRESS_TYPE;

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
