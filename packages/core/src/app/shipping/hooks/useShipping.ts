import { type AddressRequestBody } from '@bigcommerce/checkout-sdk';
import { useCallback } from 'react';
import { createSelector } from 'reselect';

import {
    type CheckoutContextProps,
    useCapabilities,
    useCheckout,
} from '@bigcommerce/checkout/contexts';
import { shouldUseStripeLinkByMinimumAmount } from '@bigcommerce/checkout/instrument-utils';
import { PaymentMethodId } from '@bigcommerce/checkout/payment-integration-api';
import { isExperimentEnabled } from '@bigcommerce/checkout/utility';

import { encodeAddressForWrite } from '../../address';
import { EMPTY_ARRAY } from '../../common/utility';
import getBackorderCount from '../../order/getBackorderCount';
import getProviderWithCustomCheckout from '../../payment/getProviderWithCustomCheckout';
import getShippingMethodId from '../getShippingMethodId';
import hasPromotionalItems from '../hasPromotionalItems';
import shouldShowMultiShippingToggle from '../shouldShowMultiShippingToggle';

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
    const { checkoutState, checkoutService } = useCheckout(
        ({
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
        }) => ({
            cart: getCart(),
            checkout: getCheckout(),
            config: getConfig(),
            customer: getCustomer(),
            consignments: getConsignments(),
            shippingAddress: getShippingAddress(),
            billingAddress: getBillingAddress(),
            shippingCountries: getShippingCountries(),
            isShippingStepPending: isShippingStepPending(),
            isSelectingShippingOption: isSelectingShippingOption(),
            isLoadingShippingOptions: isLoadingShippingOptions(),
            isUpdatingConsignment: isUpdatingConsignment(),
            isCreatingConsignments: isCreatingConsignments(),
            isCreatingCustomerAddress: isCreatingCustomerAddress(),
            isLoadingShippingCountries: isLoadingShippingCountries(),
            isUpdatingBillingAddress: isUpdatingBillingAddress(),
            isUpdatingCheckout: isUpdatingCheckout(),
            isDeletingConsignment: isDeletingConsignment(),
            isLoadingCheckout: isLoadingCheckout(),
            getShippingAddressFields,
            getAddressExtraFields,
        }),
    );
    const {
        userJourney: { hasAddressExtraFields, hasAddressLabel },
    } = useCapabilities();

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
    const consignments = getConsignments() || EMPTY_ARRAY;
    const customer = getCustomer();
    const cart = getCart();

    if (!checkout || !config || !customer || !cart) {
        throw new Error('Unable to access checkout data');
    }

    const {
        checkoutSettings: {
            enableOrderComments,
            hasMultiShippingEnabled,
            shippingQuoteFailedMessage,
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

    const shouldShowMultiShipping = shouldShowMultiShippingToggle(checkout, config, cart);

    const shippingAddress =
        !shouldShowMultiShipping && consignments.length > 1 ? undefined : getShippingAddress();

    const providerWithCustomCheckout = getProviderWithCustomCheckout(
        config.checkoutSettings.providerWithCustomCheckout,
    );

    const showDefaultShippingExpectationPrompt =
        config.inventorySettings?.shouldDisplayBackorderMessagesOnStorefront &&
        config.inventorySettings?.showDefaultShippingExpectationPrompt &&
        getBackorderCount(cart.lineItems) > 0;
    const defaultShippingExpectationPrompt =
        config.inventorySettings?.defaultShippingExpectationPrompt ?? undefined;

    const getFieldsWithExtraFields = useCallback(
        (countryCode?: string) => {
            const addressFields = getShippingAddressFields(countryCode || '');

            if (!hasAddressExtraFields) {
                return addressFields;
            }

            const addressExtraFields = getAddressExtraFields();

            return [...addressFields, ...addressExtraFields];
        },
        [getShippingAddressFields, getAddressExtraFields, hasAddressExtraFields],
    );

    // Write boundary for the address label: callers pass decoded addresses, these wrappers encode
    // just before the request leaves the app (idempotent, no-op unless the capability is on).
    const encodeAddr = useCallback(
        <T extends Partial<AddressRequestBody> | undefined>(address: T): T =>
            address && hasAddressLabel ? encodeAddressForWrite(address) : address,
        [hasAddressLabel],
    );
    const encodeConsignmentReq = useCallback(
        <T extends { address?: AddressRequestBody; shippingAddress?: AddressRequestBody }>(
            req: T,
        ): T =>
            hasAddressLabel
                ? {
                      ...req,
                      address: encodeAddr(req.address),
                      shippingAddress: encodeAddr(req.shippingAddress),
                  }
                : req,
        [encodeAddr, hasAddressLabel],
    );

    const assignItem = useCallback(
        (...args: Parameters<typeof checkoutService.assignItemsToAddress>) => {
            const [req, ...rest] = args;

            return checkoutService.assignItemsToAddress(encodeConsignmentReq(req), ...rest);
        },
        [checkoutService, encodeConsignmentReq],
    );
    const updateShippingAddress = useCallback(
        (...args: Parameters<typeof checkoutService.updateShippingAddress>) => {
            const [address, ...rest] = args;

            return checkoutService.updateShippingAddress(encodeAddr(address), ...rest);
        },
        [checkoutService, encodeAddr],
    );
    const updateConsignment = useCallback(
        (...args: Parameters<typeof checkoutService.updateConsignment>) => {
            const [req, ...rest] = args;

            return checkoutService.updateConsignment(encodeConsignmentReq(req), ...rest);
        },
        [checkoutService, encodeConsignmentReq],
    );

    return {
        assignItem,
        billingAddress: getBillingAddress(),
        cart,
        cartHasPromotionalItems: hasPromotionalItems(cart),
        consignments,
        countries: getShippingCountries() || EMPTY_ARRAY,
        customer,
        customerMessage: checkout.customerMessage,
        createCustomerAddress: checkoutService.createCustomerAddress,
        defaultShippingExpectationMessage: showDefaultShippingExpectationPrompt
            ? defaultShippingExpectationPrompt
            : undefined,
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
        isNoCountriesErrorOnCheckoutEnabled: isExperimentEnabled(
            config.checkoutSettings,
            'CHECKOUT-9630.no_countries_error_on_checkout',
            true,
        ),
        isShippingStepPending: isShippingStepPending(),
        loadShippingAddressFields: checkoutService.loadShippingAddressFields,
        loadBillingAddressFields: checkoutService.loadBillingAddressFields,
        loadShippingOptions: checkoutService.loadShippingOptions,
        methodId,
        providerWithCustomCheckout,
        shippingAddress,
        shouldShowMultiShipping,
        shouldShowOrderComments: enableOrderComments,
        shippingQuoteFailedMessage,
        selectConsignmentShippingOption: checkoutService.selectConsignmentShippingOption,
        signOut: checkoutService.signOutCustomer,
        unassignItem: checkoutService.unassignItemsToAddress,
        updateBillingAddress: checkoutService.updateBillingAddress,
        updateCheckout: checkoutService.updateCheckout,
        updateShippingAddress,
        updateConsignment,
        getConsignments,
        shouldRenderStripeForm:
            providerWithCustomCheckout === PaymentMethodId.StripeUPE &&
            shouldUseStripeLinkByMinimumAmount(cart),
    };
};
