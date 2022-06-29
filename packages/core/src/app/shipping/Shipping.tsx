import { Address, AddressRequestBody, Cart, CheckoutRequestBody, CheckoutSelectors, Consignment, ConsignmentAssignmentRequestBody, Country, Customer, CustomerRequestOptions, FormField, ShippingInitializeOptions, ShippingRequestOptions } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { Component, ReactNode } from 'react';
import { createSelector } from 'reselect';

import { isEqualAddress, mapAddressFromFormValues } from '../address';
import { withCheckout, CheckoutContextProps } from '../checkout';
import { EMPTY_ARRAY } from '../common/utility';
import { LoadingOverlay } from '../ui/loading';

import { UnassignItemError } from './errors';
import getShippableItemsCount from './getShippableItemsCount';
import getShippingMethodId from './getShippingMethodId';
import { MultiShippingFormValues } from './MultiShippingForm';
import ShippingForm from './ShippingForm';
import ShippingHeader from './ShippingHeader';
import { SingleShippingFormValues } from './SingleShippingForm';

export interface ShippingProps {
    isBillingSameAsShipping: boolean;
    cartHasChanged: boolean;
    isMultiShippingMode: boolean;
    onCreateAccount(): void;
    onToggleMultiShipping(): void;
    onReady?(): void;
    onUnhandledError(error: Error): void;
    onSignIn(): void;
    navigateNextStep(isBillingSameAsShipping: boolean): void;
}

export interface WithCheckoutShippingProps {
    billingAddress?: Address;
    cart: Cart;
    consignments: Consignment[];
    countries: Country[];
    countriesWithAutocomplete: string[];
    customer: Customer;
    customerMessage: string;
    googleMapsApiKey: string;
    isGuest: boolean;
    isInitializing: boolean;
    isLoading: boolean;
    isShippingStepPending: boolean;
    methodId?: string;
    shippingAddress?: Address;
    shouldShowAddAddressInCheckout: boolean;
    shouldShowMultiShipping: boolean;
    shouldShowOrderComments: boolean;
    assignItem(consignment: ConsignmentAssignmentRequestBody): Promise<CheckoutSelectors>;
    deinitializeShippingMethod(options: ShippingRequestOptions): Promise<CheckoutSelectors>;
    deleteConsignments(): Promise<Address | undefined>;
    getFields(countryCode?: string): FormField[];
    initializeShippingMethod(options: ShippingInitializeOptions): Promise<CheckoutSelectors>;
    loadShippingAddressFields(): Promise<CheckoutSelectors>;
    loadShippingOptions(): Promise<CheckoutSelectors>;
    signOut(options?: CustomerRequestOptions): void;
    createCustomerAddress(address: AddressRequestBody): Promise<CheckoutSelectors>;
    unassignItem(consignment: ConsignmentAssignmentRequestBody): Promise<CheckoutSelectors>;
    updateBillingAddress(address: Partial<Address>): Promise<CheckoutSelectors>;
    updateCheckout(payload: CheckoutRequestBody): Promise<CheckoutSelectors>;
    updateShippingAddress(address: Partial<Address>): Promise<CheckoutSelectors>;
}

interface ShippingState {
    isInitializing: boolean;
}

class Shipping extends Component<ShippingProps & WithCheckoutShippingProps, ShippingState> {
    constructor(props: ShippingProps & WithCheckoutShippingProps) {
        super(props);

        this.state = {
            isInitializing: true,
        };
    }

    async componentDidMount(): Promise<void> {
        const {
            loadShippingAddressFields,
            loadShippingOptions,
            onReady = noop,
            onUnhandledError = noop,
        } = this.props;

        try {
            await Promise.all([
                loadShippingAddressFields(),
                loadShippingOptions(),
            ]);

            onReady();
        } catch (error) {
            onUnhandledError(error);
        } finally {
            this.setState({ isInitializing: false });
        }
    }

    render(): ReactNode {
        const {
            isBillingSameAsShipping,
            isGuest,
            shouldShowMultiShipping,
            customer,
            unassignItem,
            updateShippingAddress,
            initializeShippingMethod,
            deinitializeShippingMethod,
            isMultiShippingMode,
            onToggleMultiShipping,
            ...shippingFormProps
        } = this.props;

        const {
            isInitializing,
        } = this.state;

        return (
            <div className="checkout-form">
                <ShippingHeader
                    isGuest={ isGuest }
                    isMultiShippingMode={ isMultiShippingMode }
                    onMultiShippingChange={ this.handleMultiShippingModeSwitch }
                    shouldShowMultiShipping={ shouldShowMultiShipping }
                />

                <LoadingOverlay
                    isLoading={ isInitializing }
                    unmountContentWhenLoading
                >
                    <ShippingForm
                        { ...shippingFormProps }
                        addresses={ customer.addresses }
                        deinitialize={ deinitializeShippingMethod }
                        initialize={ initializeShippingMethod }
                        isBillingSameAsShipping = { isBillingSameAsShipping }
                        isGuest={ isGuest }
                        isMultiShippingMode={ isMultiShippingMode }
                        onMultiShippingSubmit={ this.handleMultiShippingSubmit }
                        onSingleShippingSubmit={ this.handleSingleShippingSubmit }
                        onUseNewAddress={ this.handleUseNewAddress }
                        shouldShowSaveAddress={ !isGuest }
                        updateAddress={ updateShippingAddress }
                    />
                </LoadingOverlay>
            </div>
        );
    }

    private handleMultiShippingModeSwitch: () => void = async () => {
        const {
            consignments,
            isMultiShippingMode,
            onToggleMultiShipping = noop,
            onUnhandledError = noop,
            updateShippingAddress,
        } = this.props;

        if (isMultiShippingMode && consignments.length > 1) {
            this.setState({ isInitializing: true });

            try {
                // Collapse all consignments into one
                await updateShippingAddress(consignments[0].shippingAddress);
            } catch (error) {
                onUnhandledError(error);
            } finally {
                this.setState({ isInitializing: false });
            }
        }

        onToggleMultiShipping();
    };

    private handleSingleShippingSubmit: (values: SingleShippingFormValues) => void = async ({
        billingSameAsShipping,
        shippingAddress: addressValues,
        orderComment,
    }) => {
        const {
            customerMessage,
            updateCheckout,
            updateShippingAddress,
            updateBillingAddress,
            navigateNextStep,
            onUnhandledError,
            shippingAddress,
            billingAddress,
            methodId,
        } = this.props;

        const updatedShippingAddress = addressValues && mapAddressFromFormValues(addressValues);
        const promises: Array<Promise<CheckoutSelectors>> = [];
        const hasRemoteBilling = this.hasRemoteBilling(methodId);

        if (!isEqualAddress(updatedShippingAddress, shippingAddress)) {
            promises.push(updateShippingAddress(updatedShippingAddress || {}));
        }

        if (billingSameAsShipping &&
            updatedShippingAddress &&
            !isEqualAddress(updatedShippingAddress, billingAddress) &&
            !hasRemoteBilling
        ) {
            promises.push(updateBillingAddress(updatedShippingAddress));
        }

        if (customerMessage !== orderComment) {
            promises.push(updateCheckout({ customerMessage: orderComment }));
        }

        try {
            await Promise.all(promises);

            navigateNextStep(billingSameAsShipping);
        } catch (error) {
            onUnhandledError(error);
        }
    };

    private hasRemoteBilling: (methodId?: string) => boolean = methodId => {
        const PAYMENT_METHOD_VALID = ['amazonpay'];

        return PAYMENT_METHOD_VALID.some(method => method === methodId);
    };

    private handleUseNewAddress: (address: Address, itemId: string) => void = async (address, itemId) => {
        const { unassignItem, onUnhandledError } = this.props;

        try {
            await unassignItem({
                address,
                lineItems: [{
                    quantity: 1,
                    itemId,
                }],
            });

            location.href = '/account.php?action=add_shipping_address&from=checkout';
        } catch (e) {
            onUnhandledError(new UnassignItemError(e));
        }
    };

    private handleMultiShippingSubmit: (values: MultiShippingFormValues) => void = async ({ orderComment }) => {
        const {
            customerMessage,
            updateCheckout,
            navigateNextStep,
            onUnhandledError,
        } = this.props;

        try {
            if (customerMessage !== orderComment) {
                await updateCheckout({ customerMessage: orderComment });
            }

            navigateNextStep(false);
        } catch (error) {
            onUnhandledError(error);
        }
    };
}

const deleteConsignmentsSelector = createSelector(
    ({ checkoutService: { deleteConsignment } }: CheckoutContextProps) => deleteConsignment,
    ({ checkoutState: { data } }: CheckoutContextProps) => data.getConsignments(),
    (deleteConsignment, consignments) => async () => {
        if (!consignments || !consignments.length) {
            return;
        }

        const [{ data }] = await Promise.all(consignments.map(({ id }) =>
            deleteConsignment(id)
        ));

        return data.getShippingAddress();
    }
);

export function mapToShippingProps({
    checkoutService,
    checkoutState,
}: CheckoutContextProps): WithCheckoutShippingProps | null {
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
        },
    } = checkoutState;

    const checkout = getCheckout();
    const config = getConfig();
    const consignments = getConsignments() || [];
    const customer = getCustomer();
    const cart = getCart();

    if (!checkout || !config || !customer || !cart) {
        return null;
    }

    const {
        checkoutSettings: {
            enableOrderComments,
            features,
            hasMultiShippingEnabled,
            googleMapsApiKey,
        },
    } = config;

    const methodId = getShippingMethodId(checkout);
    const shippableItemsCount = getShippableItemsCount(cart);
    const isLoading = (
        isLoadingShippingOptions() ||
        isSelectingShippingOption() ||
        isUpdatingConsignment() ||
        isCreatingConsignments() ||
        isUpdatingBillingAddress() ||
        isUpdatingCheckout() ||
        isCreatingCustomerAddress()
    );
    const shouldShowMultiShipping = (
        hasMultiShippingEnabled &&
        !methodId &&
        shippableItemsCount > 1 &&
        shippableItemsCount < 50
    );
    const countriesWithAutocomplete = ['US', 'CA', 'AU', 'NZ'];

    if (features['CHECKOUT-4183.checkout_google_address_autocomplete_uk']) {
        countriesWithAutocomplete.push('GB');
    }

    const shippingAddress = !shouldShowMultiShipping && consignments.length > 1 ? undefined : getShippingAddress();

    return {
        assignItem: checkoutService.assignItemsToAddress,
        billingAddress: getBillingAddress(),
        cart,
        consignments,
        countries: getShippingCountries() || EMPTY_ARRAY,
        countriesWithAutocomplete,
        customer,
        customerMessage: checkout.customerMessage,
        createCustomerAddress: checkoutService.createCustomerAddress,
        deinitializeShippingMethod: checkoutService.deinitializeShipping,
        deleteConsignments: deleteConsignmentsSelector({ checkoutService, checkoutState }),
        getFields: getShippingAddressFields,
        googleMapsApiKey,
        initializeShippingMethod: checkoutService.initializeShipping,
        isGuest: customer.isGuest,
        isInitializing: isLoadingShippingCountries() || isLoadingShippingOptions(),
        isLoading,
        isShippingStepPending: isShippingStepPending(),
        loadShippingAddressFields: checkoutService.loadShippingAddressFields,
        loadShippingOptions: checkoutService.loadShippingOptions,
        methodId,
        shippingAddress,
        shouldShowMultiShipping,
        shouldShowAddAddressInCheckout: features['CHECKOUT-4726.add_address_in_multishipping_checkout'],
        shouldShowOrderComments: enableOrderComments,
        signOut: checkoutService.signOutCustomer,
        unassignItem: checkoutService.unassignItemsToAddress,
        updateBillingAddress: checkoutService.updateBillingAddress,
        updateCheckout: checkoutService.updateCheckout,
        updateShippingAddress: checkoutService.updateShippingAddress,
    };
}

export default withCheckout(mapToShippingProps)(Shipping);
