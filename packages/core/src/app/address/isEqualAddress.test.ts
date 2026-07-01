import { getAddress } from './address.mock';
import { getAddressFormFields } from './formField.mock';
import isEqualAddress from './isEqualAddress';
import mapAddressFromFormValues from './mapAddressFromFormValues';
import mapAddressToFormValues from './mapAddressToFormValues';

describe('isEqualAddress', () => {
    it('returns true when ignored values are different', () => {
        expect(
            isEqualAddress(getAddress(), {
                ...getAddress(),
                stateOrProvinceCode: 'w',
                country: 'none',
                id: 'x',
                email: 'y',
                shouldSaveAddress: false,
                type: 'z',
            }),
        ).toBeTruthy();
    });

    it('returns true when stateOrProvinceCode matches stateOrProvince', () => {
        expect(
            isEqualAddress(
                {
                    ...getAddress(),
                    stateOrProvince: '',
                    stateOrProvinceCode: 'CA',
                },
                {
                    ...getAddress(),
                    stateOrProvince: 'California',
                    stateOrProvinceCode: 'CA',
                },
            ),
        ).toBeTruthy();

        expect(
            isEqualAddress(
                {
                    ...getAddress(),
                    stateOrProvince: 'California',
                    stateOrProvinceCode: '',
                },
                {
                    ...getAddress(),
                    stateOrProvince: 'California',
                    stateOrProvinceCode: 'CA',
                },
            ),
        ).toBeTruthy();

        expect(
            isEqualAddress(
                {
                    ...getAddress(),
                    stateOrProvince: '',
                    stateOrProvinceCode: '',
                },
                {
                    ...getAddress(),
                    stateOrProvince: '',
                    stateOrProvinceCode: '',
                },
            ),
        ).toBeTruthy();
    });

    it('returns false when values are different', () => {
        expect(
            isEqualAddress(
                {
                    ...getAddress(),
                    stateOrProvince: 'California',
                    stateOrProvinceCode: '',
                },
                {
                    ...getAddress(),
                    stateOrProvince: 'New York',
                    stateOrProvinceCode: '',
                },
            ),
        ).toBeFalsy();

        expect(
            isEqualAddress(
                {
                    ...getAddress(),
                    stateOrProvince: '',
                    stateOrProvinceCode: 'CA',
                },
                {
                    ...getAddress(),
                    stateOrProvince: '',
                    stateOrProvinceCode: 'NY',
                },
            ),
        ).toBeFalsy();
    });

    it('returns true for transformed address', () => {
        const address = getAddress();
        const transformedAddress = mapAddressFromFormValues(
            mapAddressToFormValues(getAddressFormFields(), address),
        );

        expect(isEqualAddress(address, transformedAddress)).toBeTruthy();
    });

    it('returns true when when custom fields are empty', () => {
        expect(
            isEqualAddress(getAddress(), {
                ...getAddress(),
                customFields: [{ fieldId: 'foo', fieldValue: '' }],
            }),
        ).toBeTruthy();
    });

    describe('extraFields', () => {
        it('returns true when extra fields match', () => {
            expect(
                isEqualAddress(
                    {
                        ...getAddress(),
                        extraFields: [{ fieldId: 'costCenter', fieldValue: '5000' }],
                    },
                    {
                        ...getAddress(),
                        extraFields: [{ fieldId: 'costCenter', fieldValue: '5000' }],
                    },
                ),
            ).toBeTruthy();
        });

        it('returns false when extra field values differ', () => {
            expect(
                isEqualAddress(
                    {
                        ...getAddress(),
                        extraFields: [{ fieldId: 'costCenter', fieldValue: '5000' }],
                    },
                    {
                        ...getAddress(),
                        extraFields: [{ fieldId: 'costCenter', fieldValue: '9999' }],
                    },
                ),
            ).toBeFalsy();
        });

        it('returns false when only one address carries extra fields', () => {
            expect(
                isEqualAddress(
                    {
                        ...getAddress(),
                        extraFields: [{ fieldId: 'costCenter', fieldValue: '5000' }],
                    },
                    getAddress(),
                ),
            ).toBeFalsy();
        });

        it('returns true for B2C addresses without extra fields', () => {
            expect(isEqualAddress(getAddress(), getAddress())).toBeTruthy();
        });
    });
});
