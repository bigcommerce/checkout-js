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

    it('maps extraFields onto the result when present', () => {
        const formValues: AddressFormValues = {
            ...omit(getShippingAddress(), 'customFields'),
            customFields: {},
            extraFields: {
                b2bExtraField_100: 'Acme Corp',
                b2bExtraField_200: 'Engineering',
            },
        };

        const result = mapAddressFromFormValues(formValues);

        expect(result.firstName).toBe(getShippingAddress().firstName);
        expect(result.lastName).toBe(getShippingAddress().lastName);
        expect(result.extraFields).toEqual([
            { fieldId: '100', fieldValue: 'Acme Corp' },
            { fieldId: '200', fieldValue: 'Engineering' },
        ]);
    });

    it('omits extraFields when the form did not collect any (B2C)', () => {
        const formValues: AddressFormValues = {
            ...omit(getShippingAddress(), 'customFields'),
            customFields: {},
        };

        expect(mapAddressFromFormValues(formValues)).not.toHaveProperty('extraFields');
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
