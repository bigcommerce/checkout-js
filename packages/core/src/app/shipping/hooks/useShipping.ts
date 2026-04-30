import { useCallback } from 'react';
import { createSelector } from 'reselect';

import { type CheckoutContextProps, useCapabilities, useCheckout } from '@bigcommerce/checkout/contexts';
import { shouldUseStripeLinkByMinimumAmount } from '@bigcommerce/checkout/instrument-utils';
import { PaymentMethodId } from '@bigcommerce/checkout/payment-integration-api';

import { EMPTY_ARRAY, isExperimentEnabled } from '../../common/utility';
import getBackorderCount from '../../order/getBackorderCount';
import getProviderWithCustomCheckout from '../../payment/getProviderWithCustomCheckout';
import getShippableItemsCount from '../getShippableItemsCount';
import getShippingMethodId from '../getShippingMethodId';
import hasPromotionalItems from '../hasPromotionalItems';

const deleteConsignmentsSelector = createSelector(
    ({ checkoutService: { deleteConsignment } }: CheckoutContextProps) => deleteConsignment,
    ({ checkoutState: { data } }: CheckoutContextProps) => data.getConsignments(),
    (deleteConsignment, consignments) => async () => {
        if (!consignments || !consignments.length) {
            return;
        }

        const [{ data }] = await Promise.all(consignments.map(({ id }) => deleteConsignment(id)));

        return data.getShippingAddress();
    },
);

export const useShipping = () => {
    const { checkoutState, checkoutService } = useCheckout();
    const { userJourney: { hasAddressExtraFields } } = useCapabilities();

    const {
        data: {
            getCart,
            getCheckout,
            getConfig,
            getCustomer,
            getConsignments,
            getShippingAddress,
            getBillingAddress,
            getShippingAddressFields,
            getShippingCountries,
            getAddressExtraFields,
        },
        statuses: {
            isShippingStepPending,
            isSelectingShippingOption,
            isLoadingShippingOptions,
            isUpdatingConsignment,
            isCreatingConsignments,
            isCreatingCustomerAddress,
            isLoadingShippingCountries,
            isUpdatingBillingAddress,
            isUpdatingCheckout,
            isDeletingConsignment,
            isLoadingCheckout,
        },
    } = checkoutState;

    const checkout = getCheckout();
    const config = getConfig();
    const consignments = getConsignments() || [];
    const customer = getCustomer();
    const cart = getCart();

    if (!checkout || !config || !customer || !cart) {
        throw new Error('Unable to access checkout data');
    }

    const {
        checkoutSettings: {
            enableOrderComments,
            hasMultiShippingEnabled,
        },
    } = config;

    const methodId = getShippingMethodId(checkout, config);
    const isLoading =
        isLoadingShippingOptions() ||
        isSelectingShippingOption() ||
        isUpdatingConsignment() ||
        isCreatingConsignments() ||
        isUpdatingBillingAddress() ||
        isUpdatingCheckout() ||
        isCreatingCustomerAddress() ||
        isDeletingConsignment() ||
        isLoadingCheckout();

    const shippableItemsCount = getShippableItemsCount(cart);
    const shouldShowMultiShipping =
        hasMultiShippingEnabled && !methodId && shippableItemsCount > 1;

    const shippingAddress =
        !shouldShowMultiShipping && consignments.length > 1 ? undefined : getShippingAddress();

    const providerWithCustomCheckout = getProviderWithCustomCheckout(
        config.checkoutSettings.providerWithCustomCheckout,
    );

    const showDefaultShippingExpectationPrompt =
      config.inventorySettings?.shouldDisplayBackorderMessagesOnStorefront &&
      config.inventorySettings?.showDefaultShippingExpectationPrompt &&
      getBackorderCount(cart.lineItems) > 0;
    const defaultShippingExpectationPrompt = config.inventorySettings?.defaultShippingExpectationPrompt ?? undefined;

    const getFieldsWithExtraFields = useCallback((countryCode?: string) => {
        const addressFields = getShippingAddressFields(countryCode || '');

        if (!hasAddressExtraFields) {
            return addressFields;
        }

        const addressExtraFields = getAddressExtraFields();

        return [...addressFields, ...addressExtraFields];
    }, [getShippingAddressFields, getAddressExtraFields, hasAddressExtraFields]);

    return {
        assignItem: checkoutService.assignItemsToAddress,
        billingAddress: getBillingAddress(),
        cart,
        cartHasPromotionalItems: hasPromotionalItems(cart),
        consignments,
        countries: getShippingCountries() || EMPTY_ARRAY,
        customer,
        customerMessage: checkout.customerMessage,
        createCustomerAddress: checkoutService.createCustomerAddress,
        defaultShippingExpectationMessage: showDefaultShippingExpectationPrompt ? defaultShippingExpectationPrompt : undefined,
        deinitializeShippingMethod: checkoutService.deinitializeShipping,
        deleteConsignments: deleteConsignmentsSelector({
            checkoutService,
            checkoutState,
        }),
        hasMultiShippingEnabled,
        getFields: getFieldsWithExtraFields,
        initializeShippingMethod: checkoutService.initializeShipping,
        isGuest: customer.isGuest,
        isInitializing: isLoadingShippingCountries() || isLoadingShippingOptions(),
        isLoading,
        isNoCountriesErrorOnCheckoutEnabled: isExperimentEnabled(config.checkoutSettings, 'CHECKOUT-9630.no_countries_error_on_checkout', true),
        isShippingStepPending: isShippingStepPending(),
        loadShippingAddressFields: checkoutService.loadShippingAddressFields,
        loadBillingAddressFields: checkoutService.loadBillingAddressFields,
        loadShippingOptions: checkoutService.loadShippingOptions,
        methodId,
        providerWithCustomCheckout,
        shippingAddress,
        shouldShowMultiShipping,
        shouldShowOrderComments: enableOrderComments,
        signOut: checkoutService.signOutCustomer,
        unassignItem: checkoutService.unassignItemsToAddress,
        updateBillingAddress: checkoutService.updateBillingAddress,
        updateCheckout: checkoutService.updateCheckout,
        updateShippingAddress: checkoutService.updateShippingAddress,
        shouldRenderStripeForm: providerWithCustomCheckout === PaymentMethodId.StripeUPE && shouldUseStripeLinkByMinimumAmount(cart),
        validateMaxLength: isExperimentEnabled(config.checkoutSettings, 'CHECKOUT-9768.form_fields_max_length_validation', false),
    };
}
