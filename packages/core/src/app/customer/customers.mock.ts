import { Customer } from '@bigcommerce/checkout-sdk';

import { getShippingAddress } from '../shipping/shipping-addresses.mock';

// TODO: Consider exporting mock objects from SDK
export function getGuestCustomer(): Customer {
    return {
        id: 0,
        addresses: [],
        email: '',
        firstName: '',
        fullName: '',
        isGuest: true,
        lastName: '',
        storeCredit: 0,
        shouldEncourageSignIn: false,
        customerGroup: {
            id: 1,
            name: 'Customer group',
        },
    };
}

export function getCustomer(): Customer {
    return {
        id: 4,
        email: 'test@bigcommerce.com',
        firstName: 'Foo',
        fullName: 'Foo Bar',
        lastName: 'Bar',
        shouldEncourageSignIn: false,
        storeCredit: 0,
        addresses: [
            {
                ...getShippingAddress(),
                id: 5,
                type: 'residential',
            },
        ],
        isGuest: false,
        customerGroup: {
            id: 1,
            name: 'Customer group',
        },
    };
}
