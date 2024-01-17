import {
    CardInstrument,
    CustomerAddress,
    PaymentProviderCustomer,
} from '@bigcommerce/checkout-sdk';

interface PayPalConnectPaymentProviderCustomer {
    authenticationState?: string;
    addresses?: CustomerAddress[];
    instruments?: CardInstrument[];
}

export default function isPayPalConnectAcceleratedCheckoutCustomer(
    customer?: PaymentProviderCustomer,
): customer is PayPalConnectPaymentProviderCustomer {
    if (!customer) {
        return false;
    }

    return (
        'authenticationState' in customer || 'addresses' in customer || 'instruments' in customer
    );
}
