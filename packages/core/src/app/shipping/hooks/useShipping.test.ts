import { renderHook } from '@testing-library/react';

import * as contexts from '@bigcommerce/checkout/contexts';
import { PaymentMethodId } from '@bigcommerce/checkout/payment-integration-api';
import {
    getCart,
    getCheckout,
    getConsignment,
    getCustomer,
    getShippingAddress,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';

import { getAddressFormFields } from '../../address/formField.mock';
import { getBillingAddress } from '../../billing/billingAddresses.mock';
import { getCountries } from '../../geography/countries.mock';

import { useShipping } from './useShipping';

describe('useShipping', () => {
    const checkoutService = {
        assignItemsToAddress: jest.fn(),
        createCustomerAddress: jest.fn(),
        deinitializeShipping: jest.fn(),
        deleteConsignment: jest.fn(),
        initializeShipping: jest.fn(),
        loadShippingAddressFields: jest.fn(),
        loadBillingAddressFields: jest.fn(),
        loadShippingOptions: jest.fn(),
        signOutCustomer: jest.fn(),
        unassignItemsToAddress: jest.fn(),
        updateBillingAddress: jest.fn(),
        updateCheckout: jest.fn(),
        updateShippingAddress: jest.fn(),
    };
    const checkoutState = {
        data: {
            getCart,
            getCheckout,
            getConfig: getStoreConfig,
            getCustomer,
            getConsignments: () => [getConsignment()],
            getShippingAddress,
            getBillingAddress,
            getShippingAddressFields: getAddressFormFields,
            getShippingCountries: getCountries,
        },
        statuses: {
            isShippingStepPending: () => false,
            isSelectingShippingOption: () => false,
            isLoadingShippingOptions: () => false,
            isUpdatingConsignment: () => false,
            isCreatingConsignments: () => false,
            isCreatingCustomerAddress: () => false,
            isLoadingShippingCountries: () => false,
            isUpdatingBillingAddress: () => false,
            isUpdatingCheckout: () => false,
            isDeletingConsignment: () => false,
            isLoadingCheckout: () => false,
        },
    };

    beforeEach(() => {
        jest.spyOn(contexts, 'useCheckout').mockReturnValue({ checkoutState, checkoutService });
        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue({ id: 'checkout', customerMessage: 'msg' });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns all expected values from the hook', () => {
        const { result } = renderHook(() => useShipping());

        expect(result.current.cart).toEqual(getCart());
        expect(result.current.customer).toEqual(getCustomer());
        expect(result.current.shouldShowOrderComments).toBe(true);
        expect(result.current.shouldShowMultiShipping).toBe(false);
        expect(result.current.validateMaxLength).toBe(false);
    });

    it('throws if required checkout data is missing', () => {
        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(undefined);

        expect(() => renderHook(() => useShipping())).toThrow('Unable to access checkout data');
    });

    describe('shouldShowMultiShipping', () => {
        beforeEach(() => {
            jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(
                {
                    ...getCart(),
                    lineItems: {
                        physicalItems: [
                            {
                                ...getCart().lineItems.physicalItems[0],
                                quantity: 2,
                            },
                        ],
                    },
                }
            );
            jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
                ...getStoreConfig(),
                checkoutSettings: {
                    ...getStoreConfig().checkoutSettings,
                    features: {
                        ...getStoreConfig().checkoutSettings?.features,
                        'CHECKOUT-9768.form_fields_max_length_validation': true,
                    },
                },
            });
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('is false if hasMultiShippingEnabled is false', () => {
            jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
                ...getStoreConfig(),
                checkoutSettings: {
                    ...getStoreConfig().checkoutSettings,
                    enableOrderComments: true,
                    hasMultiShippingEnabled: false,
                    providerWithCustomCheckout: undefined,
                },
            });

            const { result } = renderHook(() => useShipping());

            expect(result.current.shouldShowMultiShipping).toBe(false);
        });

        it('is true if hasMultiShippingEnabled is true and providerWithCustomCheckout is undefined', () => {
            jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
                ...getStoreConfig(),
                checkoutSettings: {
                    ...getStoreConfig().checkoutSettings,
                    enableOrderComments: true,
                    hasMultiShippingEnabled: true,
                    providerWithCustomCheckout: undefined,
                },
            });

            const { result } = renderHook(() => useShipping());

            expect(result.current.shouldShowMultiShipping).toBe(true);
        });

        it('is false when remote shipping is enabled', () => {
            jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
                ...getStoreConfig(),
                checkoutSettings: {
                    ...getStoreConfig().checkoutSettings,
                    enableOrderComments: true,
                    hasMultiShippingEnabled: true,
                    providerWithCustomCheckout: undefined,
                },
            });

            jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue({
                ...getCheckout(),
                payments: [{ providerId: 'amazonpay' }],
            } as Checkout);

            const { result } = renderHook(() => useShipping());

            expect(result.current.shouldShowMultiShipping).toBe(false);
        });
    });

    describe('validateMaxLength', () => {
        it('is false when experiment is not enabled', () => {
            const { result } = renderHook(() => useShipping());

            expect(result.current.validateMaxLength).toBe(false);
        });

        it('is true when CHECKOUT-9768.form_fields_max_length_validation experiment is enabled', () => {
            const config = getStoreConfig();
            jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
                ...config,
                checkoutSettings: {
                    ...config.checkoutSettings,
                    features: {
                        ...config.checkoutSettings.features,
                        'CHECKOUT-9768.form_fields_max_length_validation': true,
                    },
                },
            });

            const { result } = renderHook(() => useShipping());

            expect(result.current.validateMaxLength).toBe(true);
        });
    });

    it('shouldRenderStripeForm is true if providerWithCustomCheckout is StripeUPE and shouldUseStripeLinkByMinimumAmount returns true', () => {

        jest.mock(
            '@bigcommerce/checkout/instrument-utils',
            () => ({
                ...jest.requireActual('@bigcommerce/checkout/instrument-utils'),
                shouldUseStripeLinkByMinimumAmount: jest.fn().mockResolvedValue(true),
            }),
        );
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
            ...getStoreConfig(),
            checkoutSettings: {
                ...getStoreConfig().checkoutSettings,
                enableOrderComments: true,
                hasMultiShippingEnabled: true,
                providerWithCustomCheckout: PaymentMethodId.StripeUPE,
            },
        });

        const { result } = renderHook(() => useShipping());

        expect(result.current.shouldRenderStripeForm).toBe(true);
    });
});
