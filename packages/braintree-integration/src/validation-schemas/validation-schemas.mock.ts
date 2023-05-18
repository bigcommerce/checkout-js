import {
    AccountTypes,
    OwnershipTypes,
} from '../components/BraintreeAchPaymentForm/braintreeAchPaymentFormConfig';

export const getValidData = () => ({
    ownershipType: OwnershipTypes.Personal,
    accountType: AccountTypes.Savings,
    accountNumber: '1000000000',
    routingNumber: '011000015',
    businessName: 'Business Name',
    firstName: 'Test',
    lastName: 'Tester',
    address1: '12345 Testing Way',
    address2: '',
    postalCode: 'US',
    countryCode: '95555',
    city: 'Some City',
    stateOrProvinceCode: 'CA',
});
