import {
    Address,
    AddressRequestBody,
    Cart,
    CheckoutRequestBody,
    CheckoutSelectors,
    Consignment,
    ConsignmentAssignmentRequestBody,
    Country,
    Customer,
    CustomerRequestOptions,
    FormField,
    ShippingInitializeOptions,
    ShippingRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { Component, ReactNode } from 'react';
import { createSelector } from 'reselect';

import { ExtensionContextProps, withExtension } from '@bigcommerce/checkout/checkout-extension';
import { shouldUseStripeLinkByMinimumAmount } from '@bigcommerce/checkout/instrument-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';
import { AddressFormSkeleton, ConfirmationModal } from '@bigcommerce/checkout/ui';

import { isEqualAddress, mapAddressFromFormValues } from '../address';
import { withCheckout } from '../checkout';
import CheckoutStepStatus from '../checkout/CheckoutStepStatus';
import { EMPTY_ARRAY, isExperimentEnabled, isFloatingLabelEnabled } from '../common/utility';
import getProviderWithCustomCheckout from '../payment/getProviderWithCustomCheckout';
import { PaymentMethodId } from '../payment/paymentMethod';

import getShippableItemsCount from './getShippableItemsCount';
import getShippingMethodId from './getShippingMethodId';
import hasPromotionalItems from './hasPromotionalItems';
import { MultiShippingFormValues } from './MultiShippingForm';
import ShippingForm from './ShippingForm';
import ShippingHeader from './ShippingHeader';
import { SingleShippingFormValues } from './SingleShippingForm';
import StripeShipping from './stripeUPE/StripeShipping';

export interface ShippingProps {
    isBillingSameAsShipping: boolean;
    cartHasChanged: boolean;
    isMultiShippingMode: boolean;
    step: CheckoutStepStatus;
    onCreateAccount(): void;
    onToggleMultiShipping(): void;
    onReady?(): void;
    onUnhandledError(error: Error): void;
    onSignIn(): void;
    navigateNextStep(isBillingSameAsShipping: boolean): void;
    setIsMultishippingMode(isMultiShippingMode: boolean): void;
}

export interface WithCheckoutShippingProps {
    billingAddress?: Address;
    cart: Cart;
    cartHasPromotionalItems: boolean;
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
    shouldShowMultiShipping: boolean;
    shouldShowOrderComments: boolean;
    shouldRenderWhileLoading: boolean;
    isGuestMultiShippingEnabled: boolean;
    providerWithCustomCheckout?: string;
    isFloatingLabelEnabled?: boolean;
    assignItem(consignment: ConsignmentAssignmentRequestBody): Promise<CheckoutSelectors>;
    deinitializeShippingMethod(options: ShippingRequestOptions): Promise<CheckoutSelectors>;
    deleteConsignments(): Promise<Address | undefined>;
    getFields(countryCode?: string): FormField[];
    initializeShippingMethod(options: ShippingInitializeOptions): Promise<CheckoutSelectors>;
    loadShippingAddressFields(): Promise<CheckoutSelectors>;
    loadBillingAddressFields(): Promise<CheckoutSelectors>;
    loadShippingOptions(): Promise<CheckoutSelectors>;
    signOut(options?: CustomerRequestOptions): void;
    createCustomerAddress(address: AddressRequestBody): Promise<CheckoutSelectors>;
    unassignItem(consignment: ConsignmentAssignmentRequestBody): Promise<CheckoutSelectors>;
    updateBillingAddress(address: Partial<Address>): Promise<CheckoutSelectors>;
    updateCheckout(payload: CheckoutRequestBody): Promise<CheckoutSelectors>;
    updateShippingAddress(address: Partial<Address>): Promise<CheckoutSelectors>;
    shouldRenderStripeForm: boolean;
}

interface ShippingState {
    isInitializing: boolean;
    isMultiShippingUnavailableModalOpen: boolean;
}

class Shipping extends Component<ShippingProps & WithCheckoutShippingProps & ExtensionContextProps, ShippingState> {
    constructor(props: ShippingProps & WithCheckoutShippingProps & ExtensionContextProps) {
        super(props);

        this.state = {
            isInitializing: true,
            isMultiShippingUnavailableModalOpen: false,
        };
    }

    async componentDidMount(): Promise<void> {
        const {
            loadShippingAddressFields,
            loadBillingAddressFields,
            loadShippingOptions,
            onReady = noop,
            onUnhandledError = noop,
            cartHasPromotionalItems,
            isMultiShippingMode,
        } = this.props;

        try {
            await Promise.all([loadShippingAddressFields(), loadShippingOptions(), loadBillingAddressFields()]);

            if (cartHasPromotionalItems && isMultiShippingMode) {
                this.setState({ isMultiShippingUnavailableModalOpen: true });
            }

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
            updateShippingAddress,
            initializeShippingMethod,
            deinitializeShippingMethod,
            isMultiShippingMode,
            isGuestMultiShippingEnabled,
            step,
            isFloatingLabelEnabled,
            shouldRenderStripeForm,
            shouldRenderWhileLoading,
            cartHasPromotionalItems,
            extensionState: { shippingFormRenderTimestamp } = {},
            setIsMultishippingMode,
            ...shippingFormProps
        } = this.props;

        const {
            isInitializing,
            isMultiShippingUnavailableModalOpen,
        } = this.state;

        const handleSwitchToSingleShipping = async () => {
            this.setState({ isMultiShippingUnavailableModalOpen: false });
            await this.handleMultiShippingModeSwitch();
        }

        if (shouldRenderStripeForm && !customer.email && this.props.countries.length > 0) {
            return <StripeShipping
                { ...shippingFormProps }
                customer={ customer }
                deinitialize={deinitializeShippingMethod}
                initialize={initializeShippingMethod}
                isBillingSameAsShipping={isBillingSameAsShipping}
                isGuest={ isGuest }
                isInitialValueLoaded={shouldRenderWhileLoading ? !isInitializing : true}
                isLoading={ isInitializing }
                isMultiShippingMode={isMultiShippingMode}
                isShippingMethodLoading={ this.props.isLoading }
                onMultiShippingChange={ this.handleMultiShippingModeSwitch }
                onSubmit={this.handleSingleShippingSubmit}
                shouldShowMultiShipping={ shouldShowMultiShipping }
                step={step}
                updateAddress={updateShippingAddress}
            />;
        }

        return (
            <AddressFormSkeleton isLoading={isInitializing} renderWhileLoading={shouldRenderWhileLoading}>
                <div className="checkout-form">
                    <ConfirmationModal
                        action={handleSwitchToSingleShipping}
                        actionButtonLabel={<TranslatedString id="common.ok_action" />}
                        headerId="shipping.multishipping_unavailable_action"
                        isModalOpen={isMultiShippingUnavailableModalOpen}
                        messageId="shipping.checkout_switched_to_single_shipping"
                        shouldShowCloseButton={false}
                    />
                    <ShippingHeader
                        cartHasPromotionalItems={cartHasPromotionalItems}
                        isGuest={isGuest}
                        isMultiShippingMode={isMultiShippingMode}
                        onMultiShippingChange={this.handleMultiShippingModeSwitch}
                        shouldShowMultiShipping={shouldShowMultiShipping}
                    />
                    <ShippingForm
                        {...shippingFormProps}
                        addresses={customer.addresses}
                        deinitialize={deinitializeShippingMethod}
                        initialize={initializeShippingMethod}
                        isBillingSameAsShipping={isBillingSameAsShipping}
                        isFloatingLabelEnabled={isFloatingLabelEnabled}
                        isGuest={isGuest}
                        isGuestMultiShippingEnabled={isGuestMultiShippingEnabled}
                        isInitialValueLoaded={shouldRenderWhileLoading ? !isInitializing : true}
                        isMultiShippingMode={isMultiShippingMode}
                        onMultiShippingSubmit={this.handleMultiShippingSubmit}
                        onSingleShippingSubmit={this.handleSingleShippingSubmit}
                        setIsMultishippingMode={setIsMultishippingMode}
                        shippingFormRenderTimestamp={shippingFormRenderTimestamp}
                        shouldShowSaveAddress={!isGuest}
                        updateAddress={updateShippingAddress}
                    />
                </div>
            </AddressFormSkeleton>
        );
    }

    private handleMultiShippingModeSwitch: () => void = async () => {
        const {
            consignments,
            isMultiShippingMode,
            onToggleMultiShipping = noop,
            onUnhandledError = noop,
            updateShippingAddress,
            deleteConsignments,
        } = this.props;

        try {
            this.setState({ isInitializing: true });

            if (isMultiShippingMode && consignments.length) {
                // Collapse all consignments into one
                await updateShippingAddress(consignments[0].shippingAddress);
            }
            else {
                await deleteConsignments();
            }
        } catch (error) {
            onUnhandledError(error);
        } finally {
            this.setState({ isInitializing: false });
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

        if (!isEqualAddress(updatedShippingAddress, shippingAddress) || shippingAddress?.shouldSaveAddress !== updatedShippingAddress?.shouldSaveAddress) {
            promises.push(updateShippingAddress(updatedShippingAddress || {}));
        }

        if (
            billingSameAsShipping &&
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
            if (error instanceof Error) {
                onUnhandledError(error);
            }
        }
    };

    private hasRemoteBilling: (methodId?: string) => boolean = (methodId) => {
        const PAYMENT_METHOD_VALID = ['amazonpay'];

        return PAYMENT_METHOD_VALID.some((method) => method === methodId);
    };

    private handleMultiShippingSubmit: (values: MultiShippingFormValues) => void = async ({
        orderComment,
    }) => {
        const { customerMessage, updateCheckout, navigateNextStep, onUnhandledError } = this.props;

        try {
            if (customerMessage !== orderComment) {
                await updateCheckout({ customerMessage: orderComment });
            }

            navigateNextStep(false);
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError(error);
            }
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

        const [{ data }] = await Promise.all(consignments.map(({ id }) => deleteConsignment(id)));

        return data.getShippingAddress();
    },
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

    const countriesWithAutocomplete = ['US', 'CA', 'AU', 'NZ', 'GB'];

    const shippingAddress =
        !shouldShowMultiShipping && consignments.length > 1 ? undefined : getShippingAddress();

    const providerWithCustomCheckout = getProviderWithCustomCheckout(
        config.checkoutSettings.providerWithCustomCheckout,
    );

    const isGuestMultiShippingEnabled = isExperimentEnabled(config?.checkoutSettings, 'CHECKOUT-9161.enable_storefront_guest_multi_shipping');

    return {
        assignItem: checkoutService.assignItemsToAddress,
        billingAddress: getBillingAddress(),
        cart,
        cartHasPromotionalItems: hasPromotionalItems(cart),
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
        loadBillingAddressFields: checkoutService.loadBillingAddressFields,
        loadShippingOptions: checkoutService.loadShippingOptions,
        methodId,
        providerWithCustomCheckout,
        shippingAddress,
        shouldRenderWhileLoading: features['CHECKOUT-8300.improve_extension_performance'] ?? true,
        shouldShowMultiShipping,
        shouldShowOrderComments: enableOrderComments,
        signOut: checkoutService.signOutCustomer,
        unassignItem: checkoutService.unassignItemsToAddress,
        updateBillingAddress: checkoutService.updateBillingAddress,
        updateCheckout: checkoutService.updateCheckout,
        updateShippingAddress: checkoutService.updateShippingAddress,
        isFloatingLabelEnabled: isFloatingLabelEnabled(config.checkoutSettings),
        shouldRenderStripeForm: providerWithCustomCheckout === PaymentMethodId.StripeUPE && shouldUseStripeLinkByMinimumAmount(cart),
        isGuestMultiShippingEnabled,
    };
}

export default withExtension(withCheckout(mapToShippingProps)(Shipping));
