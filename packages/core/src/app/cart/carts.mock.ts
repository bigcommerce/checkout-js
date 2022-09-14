import { Cart } from '@bigcommerce/checkout-sdk';

import { getDigitalItem, getPhysicalItem } from './lineItem.mock';

// TODO: Consider exporting mock objects from SDK
export function getCart(): Cart {
    return {
        id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
        customerId: 4,
        currency: {
            name: 'US Dollar',
            code: 'USD',
            symbol: '$',
            decimalPlaces: 2,
        },
        email: 'foo@bar.com',
        isTaxIncluded: false,
        baseAmount: 200,
        discountAmount: 10,
        cartAmount: 190,
        coupons: [],
        discounts: [],
        lineItems: {
            physicalItems: [getPhysicalItem()],
            digitalItems: [getDigitalItem()],
            giftCertificates: [],
            customItems: [],
        },
        createdTime: '2018-03-06T04:41:49+00:00',
        updatedTime: '2018-03-07T03:44:51+00:00',
    };
}
