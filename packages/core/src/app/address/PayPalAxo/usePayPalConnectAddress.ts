import { Address, CustomerAddress } from '@bigcommerce/checkout-sdk';

import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import { PaymentMethodId } from '../../payment/paymentMethod';
import isEqualAddress from '../isEqualAddress';

const PAYPAL_ADDRESS_TYPE = 'paypal-address';
const PAYPAL_CONNECT_CUSTOMER_KEY = 'paypal-connect.customer';

const usePayPalConnectAddress = () => {
    const {
        checkoutState: {
            data: {
                getBillingAddress,
                getConfig,
                getCustomer,
                getPaymentProviderCustomer,
            }
        }
    } = useCheckout();
    const providerWithCustomCheckout = getConfig()?.checkoutSettings?.providerWithCustomCheckout;
    const isPayPalAxoEnabled = providerWithCustomCheckout === PaymentMethodId.BraintreeAcceleratedCheckout
        || providerWithCustomCheckout === PaymentMethodId.Braintree;

    const getPaypalConnectAddresses = (): CustomerAddress[] => {
        if (!isPayPalAxoEnabled) {
            return [];
        }

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
        if (!isPayPalAxoEnabled) {
            return false;
        }

        if ('type' in address) {
            return address.type === PAYPAL_ADDRESS_TYPE;
        }

        return getPaypalConnectAddresses().some(
            (paypalConnectAddress) => isEqualAddress(address, paypalConnectAddress)
        );
    };

    const shouldShowPayPalConnectLabel = (): boolean => isPayPalAxoEnabled && !!getPaypalConnectAddresses().length;

    const mergeWithPayPalAddresses = (customerAddresses: CustomerAddress[]): CustomerAddress[] => [
        ...getPaypalConnectAddresses(),
        ...customerAddresses.filter((address) => !isPayPalConnectAddress(address)),
    ];

    return {
        isPayPalAxoEnabled,
        isPayPalConnectAddress,
        shouldShowPayPalConnectLabel,
        mergeWithPayPalAddresses,
    };
};

export default usePayPalConnectAddress;
