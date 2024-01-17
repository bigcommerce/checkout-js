import { Address, CardInstrument, PaymentProviderCustomer } from '@bigcommerce/checkout-sdk';

interface PayPalConnectPaymentProviderCustomer {
    authenticationState?: string;
    addresses?: Address[];
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
