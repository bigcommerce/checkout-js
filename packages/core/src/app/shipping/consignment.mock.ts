import { Consignment } from '@bigcommerce/checkout-sdk';

import { getAddress } from '../address/address.mock';

import { getShippingOption } from './shippingOption/shippingMethod.mock';

export function getConsignment(): Consignment {
    return {
        id: '55c96cda6f04c',
        selectedShippingOption: getShippingOption(),
        shippingCost: 0,
        handlingCost: 0,
        lineItemIds: ['12e11c8f-7dce-4da3-9413-b649533f8bad'],
        shippingAddress: getAddress(),
        availableShippingOptions: [getShippingOption()],
    };
}
