import isPayPalFastlaneAddress from './is-paypal-fastlane-address';

const bigcommerceAddressMock = {
    address1: 'BC_Address',
    address2: '',
    city: 'NY',
    company: '',
    country: 'United States',
    countryCode: 'US',
    customFields: [],
    firstName: 'BC_Address',
    id: 1,
    lastName: 'BC_Address',
    phone: '',
    postalCode: '10001',
    stateOrProvince: 'New York',
    stateOrProvinceCode: 'NY',
    type: 'residential',
};

const paypalFastlaneAddressMock = {
    address1: 'BC_Address',
    address2: '',
    city: 'NY',
    company: '',
    country: '',
    countryCode: 'US',
    customFields: [],
    firstName: 'BC_Address',
    id: 12345,
    lastName: 'BC_Address',
    phone: '',
    postalCode: '10001',
    stateOrProvince: 'NY',
    stateOrProvinceCode: 'NY',
    type: 'paypal-address',
};

describe('isPayPalFastlaneAddress', () => {
    it('recognizes provided address as the same as in PayPal Fastlane', () => {
        expect(isPayPalFastlaneAddress(bigcommerceAddressMock, [paypalFastlaneAddressMock])).toBe(
            true,
        );
    });

    it('recognizes provided address does not match any address from PayPal Fastlane', () => {
        const anotherBCAddressMock = {
            ...bigcommerceAddressMock,
            address1: 'Fun land 1',
        };

        expect(isPayPalFastlaneAddress(anotherBCAddressMock, [paypalFastlaneAddressMock])).toBe(
            false,
        );
    });
});
