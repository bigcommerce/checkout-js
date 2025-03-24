import { Consignment } from '@bigcommerce/checkout-sdk';

import { getAddress } from '../address/address.mock';

import { getShippingOption, getShippingOptionFlagRate } from './shippingOption/shippingMethod.mock';

export function getConsignment(): Consignment {
    return {
        id: '55c96cda6f04c',
        selectedShippingOption: getShippingOption(),
        shippingCost: 0,
        handlingCost: 0,
        lineItemIds: ['12e11c8f-7dce-4da3-9413-b649533f8bad'],
        shippingAddress: getAddress(),
        availableShippingOptions: [getShippingOption()],
        discounts: [],
        address: getAddress(),
    };
}

export function getConsignmentWithShippingDiscount(): Consignment {
    return {
        id: '55c96cda6f04c',
        selectedShippingOption: getShippingOptionFlagRate(),
        shippingCost: 0,
        handlingCost: 0,
        lineItemIds: ['12e11c8f-7dce-4da3-9413-b649533f8bad'],
        shippingAddress: getAddress(),
        availableShippingOptions: [getShippingOptionFlagRate()],
        discounts: [{
            id: 1,
            type: 'AUTOMATIC',
            amount: 10,
        }],
        address: getAddress(),
    };
}
