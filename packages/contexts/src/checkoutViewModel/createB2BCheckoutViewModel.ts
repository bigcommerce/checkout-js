import { type CheckoutSelectors } from '@bigcommerce/checkout-sdk';

import { type CheckoutViewModel, CheckoutViewModelType } from './CheckoutViewModelType';

export const createB2BCheckoutViewModel = (checkoutState: CheckoutSelectors): CheckoutViewModel => {
    // eslint-disable-next-line no-console
    console.log('Creating B2B Checkout View Model.');

    return {
        type: CheckoutViewModelType.B2B,
        capabilities: {
            canSearchAddresses: true,
            lockShipping: false,
        },
        data: {
            addressBook: [
                {
                    id: 101,
                    firstName: 'Jane',
                    lastName: 'Doe',
                    address1: '123 Market St',
                    address2: 'Apt 4B',
                    city: 'San Francisco',
                    stateOrProvince: 'California',
                    stateOrProvinceCode: 'CA',
                    postalCode: '94105',
                    country: 'United States',
                    countryCode: 'US',
                    phone: '415-555-0101',
                    company: 'Acme Inc',
                    customFields: [],
                    type: 'residential',
                },
                {
                    id: 102,
                    firstName: 'John',
                    lastName: 'Smith',
                    address1: '500 5th Ave',
                    address2: '',
                    city: 'New York',
                    stateOrProvince: 'New York',
                    stateOrProvinceCode: 'NY',
                    postalCode: '10110',
                    country: 'United States',
                    countryCode: 'US',
                    phone: '212-555-0199',
                    company: '',
                    customFields: [],
                    type: 'residential',
                },
                ...(checkoutState.data.getCustomer()?.addresses || []),
            ],
        },
    };
};
