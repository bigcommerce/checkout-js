import { type Address } from '@bigcommerce/checkout-sdk';

import { getShippingAddress } from '../shipping/shipping-addresses.mock';

import stripExtraFieldsFromAddress from './stripExtraFieldsFromAddress';

describe('stripExtraFieldsFromAddress', () => {
    it('removes extraFields from address', () => {
        const address: Address = {
            ...getShippingAddress(),
            extraFields: [
                { fieldId: 'b2bExtraField_100', fieldValue: 'Acme Corp' },
            ],
        };

        const result = stripExtraFieldsFromAddress(address);

        expect(result).not.toHaveProperty('extraFields');
        expect(result.firstName).toBe(address.firstName);
        expect(result.lastName).toBe(address.lastName);
        expect(result.address1).toBe(address.address1);
        expect(result.customFields).toBe(address.customFields);
    });
});
