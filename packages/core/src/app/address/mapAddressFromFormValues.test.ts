import { omit } from 'lodash';

import { getShippingAddress } from '../shipping/shipping-addresses.mock';

import mapAddressFromFormValues from './mapAddressFromFormValues';
import { AddressFormValues } from './mapAddressToFormValues';

describe('mapAddressFromFormValues', () => {
    it('converts address form values to address object', () => {
        const formValues: AddressFormValues = {
            ...omit(getShippingAddress(), 'customFields'),
            customFields: {},
        };

        expect(mapAddressFromFormValues(formValues)).toMatchObject(getShippingAddress());
    });

    it('converts formats date values to YYYY-MM-DD format', () => {
        const formValues: AddressFormValues = {
            ...omit(getShippingAddress(), 'customFields'),
            customFields: {
                id1: new Date('18 Dec 2019'),
            },
        };

        expect(mapAddressFromFormValues(formValues)).toMatchObject({
            ...getShippingAddress(),
            customFields: [
                {
                    fieldId: 'id1',
                    fieldValue: '2019-12-18',
                },
            ],
        });
    });
});
