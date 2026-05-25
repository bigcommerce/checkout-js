import { getBillingAddress } from '../../billing/billingAddresses.mock';
import { getCart } from '../../cart/carts.mock';
import { getCustomer } from '../../customer/customers.mock';
import { getShippingAddress } from '../shipping-addresses.mock';

import { type useShipping } from './useShipping';

export const getUseShippingTestMock: () => ReturnType<typeof useShipping> = () => ({
    assignItem: jest.fn(),
    billingAddress: getBillingAddress(),
    cart: getCart(),
    cartHasPromotionalItems: false,
    consignments: [],
    countries: [],
    createCustomerAddress: jest.fn(),
    customer: getCustomer(),
    customerMessage: '',
    defaultShippingExpectationMessage: undefined,
    deinitializeShippingMethod: jest.fn(),
    deleteConsignments: jest.fn(),
    getFields: jest.fn(() => []),
    hasMultiShippingEnabled: false,
    initializeShippingMethod: jest.fn(),
    isGuest: false,
    isInitializing: false,
    isLoading: false,
    isNoCountriesErrorOnCheckoutEnabled: false,
    isShippingStepPending: false,
    loadBillingAddressFields: jest.fn(),
    loadShippingAddressFields: jest.fn(),
    loadShippingOptions: jest.fn(),
    methodId: undefined,
    providerWithCustomCheckout: undefined,
    selectConsignmentShippingOption: jest.fn(),
    shippingAddress: getShippingAddress(),
    shippingQuoteFailedMessage: '',
    shouldRenderStripeForm: false,
    shouldShowMultiShipping: false,
    shouldShowOrderComments: true,
    signOut: jest.fn(),
    unassignItem: jest.fn(),
    updateBillingAddress: jest.fn(),
    updateCheckout: jest.fn(),
    updateConsignment: jest.fn(),
    updateShippingAddress: jest.fn(),
    validateMaxLength: false,
});
