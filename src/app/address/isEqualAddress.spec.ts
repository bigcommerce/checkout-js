import { getAddress } from './address.mock';
import { getAddressFormFields } from './formField.mock';
import isEqualAddress from './isEqualAddress';
import mapAddressFromFormValues from './mapAddressFromFormValues';
import mapAddressToFormValues from './mapAddressToFormValues';

describe('isEqualAddress', () => {
    it('returns true when ignored values are different', () => {
        expect(isEqualAddress(getAddress(), {
            ...getAddress(),
            stateOrProvinceCode: 'w',
            id: 'x',
            email: 'y',
            shouldSaveAddress: false,
            type: 'z',
        })).toBeTruthy();
    });

    it('returns false when values are different', () => {
        expect(isEqualAddress(getAddress(), {
            ...getAddress(),
            stateOrProvince: 'Foo',
        })).toBeFalsy();
    });

    it('returns true for transformed address', () => {
        const address = getAddress();
        const transformedAddress = mapAddressFromFormValues(
            mapAddressToFormValues(getAddressFormFields(), address)
        );

        expect(isEqualAddress(address, transformedAddress)).toBeTruthy();
    });

    it('returns true when when custom fields are empty', () => {
        expect(isEqualAddress(getAddress(), {
            ...getAddress(),
            customFields: [{ fieldId: 'foo', fieldValue: '' }],
        })).toBeTruthy();
    });
});
