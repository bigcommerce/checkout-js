import { omit } from 'lodash';

import { getShippingAddress } from '../shipping/shipping-addresses.mock';

import mapAddressFromFormValues from './mapAddressFromFormValues';
import { type AddressFormValues } from './mapAddressToFormValues';

describe('mapAddressFromFormValues', () => {
    it('converts address form values to address object', () => {
        const formValues: AddressFormValues = {
            ...omit(getShippingAddress(), 'customFields'),
            customFields: {},
        };

        expect(mapAddressFromFormValues(formValues)).toMatchObject(getShippingAddress());
    });

    it('strips extra fields with b2bExtraField_ prefix from the result', () => {
        const formValues: AddressFormValues = {
            ...omit(getShippingAddress(), 'customFields'),
            customFields: {},
            b2bExtraField_100: 'Acme Corp',
            b2bExtraField_200: 'Engineering',
        };

        const result = mapAddressFromFormValues(formValues);

        expect(result).not.toHaveProperty('b2bExtraField_100');
        expect(result).not.toHaveProperty('b2bExtraField_200');
    });

    it('preserves non-extra fields when stripping extra fields', () => {
        const formValues: AddressFormValues = {
            ...omit(getShippingAddress(), 'customFields'),
            customFields: {},
            b2bExtraField_100: 'Acme Corp',
        };

        const result = mapAddressFromFormValues(formValues);

        expect(result.firstName).toBe(getShippingAddress().firstName);
        expect(result.lastName).toBe(getShippingAddress().lastName);
        expect(result).not.toHaveProperty('b2bExtraField_100');
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
