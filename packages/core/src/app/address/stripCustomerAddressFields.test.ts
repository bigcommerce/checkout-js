import { type Address, type CustomerAddress } from '@bigcommerce/checkout-sdk';

import { getShippingAddress } from '../shipping/shipping-addresses.mock';

import stripCustomerAddressFields from './stripCustomerAddressFields';

describe('stripCustomerAddressFields', () => {
    it('removes CustomerAddress-only metadata from the address', () => {
        const customerAddress: CustomerAddress = {
            ...getShippingAddress(),
            id: 5,
            type: 'residential',
            isShipping: true,
            isBilling: false,
            isDefaultShipping: true,
            isDefaultBilling: false,
        };

        const result = stripCustomerAddressFields(customerAddress);

        expect(result).not.toHaveProperty('id');
        expect(result).not.toHaveProperty('type');
        expect(result).not.toHaveProperty('isShipping');
        expect(result).not.toHaveProperty('isBilling');
        expect(result).not.toHaveProperty('isDefaultShipping');
        expect(result).not.toHaveProperty('isDefaultBilling');
    });

    it('keeps the request-body address fields intact', () => {
        const address: Address = getShippingAddress();

        expect(stripCustomerAddressFields(address)).toEqual(address);
    });
});
