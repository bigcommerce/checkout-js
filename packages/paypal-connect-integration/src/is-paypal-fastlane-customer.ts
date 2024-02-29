import {
    CardInstrument,
    CustomerAddress,
    PaymentProviderCustomer,
} from '@bigcommerce/checkout-sdk';

interface PayPalFastlaneCustomer {
    authenticationState?: string;
    addresses?: CustomerAddress[];
    instruments?: CardInstrument[];
}

export default function isPayPalFastlaneCustomer(
    customer?: PaymentProviderCustomer,
): customer is PayPalFastlaneCustomer {
    if (!customer) {
        return false;
    }

    return (
        'authenticationState' in customer || 'addresses' in customer || 'instruments' in customer
    );
}
