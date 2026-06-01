import { type Customer } from '@bigcommerce/checkout-sdk';

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
            {
                ...getShippingAddress(),
                id: 6,
                type: 'residential',
                address1: '67890 Testing Way',
            },
            {
                ...getShippingAddress(),
                id: 7,
                type: 'residential',
                address1: 'Infinity Testing Way',
                firstName: 'Invalid Address',
                lastName: '',
            },
        ],
        isGuest: false,
        customerGroup: {
            id: 1,
            name: 'Customer group',
        },
    };
}

export function getB2BCustomer(): Customer {
    return {
        id: 8,
        email: 'b2b@bigcommerce.com',
        firstName: 'B2B',
        fullName: 'B2B Buyer',
        lastName: 'Buyer',
        shouldEncourageSignIn: false,
        storeCredit: 0,
        addresses: [
            {
                ...getShippingAddress(),
                id: 9,
                type: 'commercial',
                isShipping: true,
                isBilling: true,
            },
            {
                ...getShippingAddress(),
                id: 10,
                type: 'commercial',
                address1: 'Shipping Only Way',
                isShipping: true,
                isBilling: false,
            },
            {
                ...getShippingAddress(),
                id: 11,
                type: 'commercial',
                address1: 'Billing Only Way',
                isShipping: false,
                isBilling: true,
            },
            {
                ...getShippingAddress(),
                id: 12,
                type: 'commercial',
                address1: 'Invalid B2B Way',
                firstName: 'Invalid Address',
                lastName: '',
                isShipping: true,
                isBilling: true,
            },
        ],
        isGuest: false,
        customerGroup: {
            id: 2,
            name: 'B2B customer group',
        },
    };
}
