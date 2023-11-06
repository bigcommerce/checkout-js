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

import { AddressFormSkeleton } from '@bigcommerce/checkout/ui';

import { isEqualAddress, mapAddressFromFormValues } from '../address';
import { CheckoutContextProps, withCheckout } from '../checkout';
import CheckoutStepStatus from '../checkout/CheckoutStepStatus';
import { EMPTY_ARRAY, isFloatingLabelEnabled } from '../common/utility';
import { PaymentMethodId } from '../payment/paymentMethod';

import { UnassignItemError } from './errors';
import getShippableItemsCount from './getShippableItemsCount';
import getShippingMethodId from './getShippingMethodId';
import { MultiShippingFormValues } from './MultiShippingForm';
import ShippingForm from './ShippingForm';
import ShippingHeader from './ShippingHeader';
import { SingleShippingFormValues } from './SingleShippingForm';
import StripeShipping from './stripeUPE/StripeShipping';
import fitmentCentres from '../../static/fitment-centres.json';
import fitmentPartner from '../../static/img/fitment-partner.png';
import { Button, ButtonVariant } from '../ui/button';

import { TranslatedString } from '../locale';
// import IconChevronRight from '../ui/icon/IconChevronRight';

export type FitmentCentre = {
    company: string
    latitude: number
    longitude: number
    fax?: string
    phone: string
    street: string
    suburb: string
    state: string
    postcode: string
    email?: string
    distance?: number
}

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
    providerWithCustomCheckout?: string;
    useFloatingLabel?: boolean;
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
    selectConsignmentShippingOption(consignmentId: string, optionId: string): Promise<CheckoutSelectors>;
}

interface ShippingState {
    isInitializing: boolean;
    fitmentCentre?: FitmentCentre;
    isLoading: boolean;
    postcodeFilter?: string;
}

class Shipping extends Component<ShippingProps & WithCheckoutShippingProps, ShippingState> {
    constructor(props: ShippingProps & WithCheckoutShippingProps) {
        super(props);

        this.state = {
            isInitializing: true,
            isLoading: false
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
            await Promise.all([loadShippingAddressFields(), loadShippingOptions()]);

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
            providerWithCustomCheckout,
            step,
            useFloatingLabel,
            ...shippingFormProps
        } = this.props;

        const {
            isInitializing,
            isLoading
        } = this.state;

        if (providerWithCustomCheckout === PaymentMethodId.StripeUPE && !customer.email && this.props.countries.length > 0) {
            return <StripeShipping
                {...shippingFormProps}
                customer={customer}
                deinitialize={deinitializeShippingMethod}
                initialize={initializeShippingMethod}
                isBillingSameAsShipping={isBillingSameAsShipping}
                isGuest={isGuest}
                isLoading={isInitializing}
                isShippingMethodLoading={this.props.isLoading}
                isMultiShippingMode={isMultiShippingMode}
                onMultiShippingChange={this.handleMultiShippingModeSwitch}
                onSubmit={this.handleSingleShippingSubmit}
                shouldShowMultiShipping={shouldShowMultiShipping}
                step={step}
                updateAddress={updateShippingAddress}
            />;
        }

        const includesFitmentCentreItem = this.props.cart.lineItems.physicalItems
            .flatMap(item => item.options)
            .some(option => option?.name.includes("Fitment") && option?.value == "EGR Fitment Centre")

        const postcodeFilter = this.state.postcodeFilter;

        if (includesFitmentCentreItem) {

            return (
                <>
                    <div className="fitment-message">
                        Please select your preferred fitment centre location. Your items will be shipped to your nominated fitment provider.
                    </div>
                    <div>
                        <div className='form-field'>
                            <label className="form-label">Search by postcode</label>
                            <input className='form-input' type='text' value={postcodeFilter} onChange={(event) => this.setState({ postcodeFilter: event.target.value })} />
                        </div>
                    </div>
                    <div className="fitment-wrapper">
                        {fitmentCentres.filter((fitmentCentre) => fitmentCentre.postcode.includes(this.state.postcodeFilter ?? "")).map(this.renderFitmentCentreSelection)}
                    </div>
                    <div className="form-actions">
                        <Button
                            disabled={this.state.fitmentCentre == undefined}
                            id="checkout-shipping-continue"
                            isLoading={isLoading}
                            type="button"
                            variant={ButtonVariant.Primary}
                            onClick={() => this.props.navigateNextStep(false)}
                        >
                            <TranslatedString id="common.continue_action" />
                        </Button>
                    </div>
                </>
            );
        }

        return (
            <AddressFormSkeleton isLoading={isInitializing}>
                <div className="checkout-form">
                    <ShippingHeader
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
                        isGuest={isGuest}
                        isMultiShippingMode={isMultiShippingMode}
                        onMultiShippingSubmit={this.handleMultiShippingSubmit}
                        onSingleShippingSubmit={this.handleSingleShippingSubmit}
                        onUseNewAddress={this.handleUseNewAddress}
                        shouldShowSaveAddress={!isGuest}
                        updateAddress={updateShippingAddress}
                        useFloatingLabel={useFloatingLabel}
                    />
                </div>
            </AddressFormSkeleton>
        );
    }

    private renderFitmentCentreSelection = (fitmentCentre: FitmentCentre) => {
        const { company, street, suburb, state, postcode, phone } = fitmentCentre;

        return (
            <label htmlFor={company} className="fitment-item-wrapper">
                <div className='details'>
                    <div style={{ fontWeight: "bold" }}>{company}</div>
                    <div>{street}</div>
                    <div>{suburb}, {state} {postcode}</div>
                    <div>Phone: {phone}</div>
                </div>
                <div className='estimate'>
                    Estimated Fitment Time from Delivery: 7-14 Days
                    <div className="partner-logo">
                        <img src={fitmentPartner} />
                    </div>
                </div>
                <div className='radio'>
                    <input
                        type="radio"
                        name="fitment-centre"
                        id={company}
                        value={company}
                        checked={fitmentCentre === this.state.fitmentCentre}
                        disabled={this.state.isLoading}
                        onClick={() => this.handleFitmentCentreChange(fitmentCentre)}
                    />
                </div>
            </label>
        )
    }


    private handleFitmentCentreChange = async (fitmentCentre: FitmentCentre) => {
        const address: Partial<Address> = {
            company: fitmentCentre.company,
            address1: fitmentCentre.street,
            address2: "",
            city: fitmentCentre.suburb,
            stateOrProvinceCode: fitmentCentre.state,
            postalCode: fitmentCentre.postcode,
            countryCode: "AU",
            phone: fitmentCentre.phone,
            firstName: "Fitment",
            lastName: "Centre"
        }


        try {
            this.setState({ isLoading: true });
            await this.props.updateShippingAddress(address);

            // If we've got a consignment here, just apply the default shipping option to it
            if (this.props.consignments && this.props.consignments[0].availableShippingOptions) {
                const consignmentId = this.props.consignments[0].id ?? "";
                const shippingOptionId = this.props.consignments[0].availableShippingOptions[0]?.id ?? "";

                this.props.selectConsignmentShippingOption(consignmentId, shippingOptionId)
            }
            // Just select the default shipping option

        } finally {
            this.setState({ isLoading: false });
            this.setState({ fitmentCentre: fitmentCentre })
        }
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
        authorityToLeave
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

        const updatedOrderComment = authorityToLeave ? "Authority to leave. " + orderComment : orderComment

        if (customerMessage !== updatedOrderComment) {
            promises.push(updateCheckout({ customerMessage: updatedOrderComment }));
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

    private handleUseNewAddress: (address: Address, itemId: string) => void = async (
        address,
        itemId,
    ) => {
        const { unassignItem, onUnhandledError } = this.props;

        try {
            await unassignItem({
                address,
                lineItems: [
                    {
                        quantity: 1,
                        itemId,
                    },
                ],
            });

            location.href = '/account.php?action=add_shipping_address&from=checkout';
        } catch (error) {
            if (error instanceof UnassignItemError) {
                onUnhandledError(new UnassignItemError(error));
            }
        }
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

// tslint:disable-next-line:cyclomatic-complexity
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
    const isLoading =
        isLoadingShippingOptions() ||
        isSelectingShippingOption() ||
        isUpdatingConsignment() ||
        isCreatingConsignments() ||
        isUpdatingBillingAddress() ||
        isUpdatingCheckout() ||
        isCreatingCustomerAddress();
    const shouldShowMultiShipping =
        hasMultiShippingEnabled && !methodId && shippableItemsCount > 1 && shippableItemsCount < 50;
    const countriesWithAutocomplete = ['US', 'CA', 'AU', 'NZ'];

    if (features['CHECKOUT-4183.checkout_google_address_autocomplete_uk']) {
        countriesWithAutocomplete.push('GB');
    }

    const shippingAddress =
        !shouldShowMultiShipping && consignments.length > 1 ? undefined : getShippingAddress();

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
        providerWithCustomCheckout: config.checkoutSettings.providerWithCustomCheckout || undefined,
        shippingAddress,
        shouldShowMultiShipping,
        shouldShowAddAddressInCheckout:
            features['CHECKOUT-4726.add_address_in_multishipping_checkout'],
        shouldShowOrderComments: enableOrderComments,
        signOut: checkoutService.signOutCustomer,
        unassignItem: checkoutService.unassignItemsToAddress,
        updateBillingAddress: checkoutService.updateBillingAddress,
        updateCheckout: checkoutService.updateCheckout,
        updateShippingAddress: checkoutService.updateShippingAddress,
        selectConsignmentShippingOption: checkoutService.selectConsignmentShippingOption,
        useFloatingLabel: isFloatingLabelEnabled(config.checkoutSettings),
    };
}

export default withCheckout(mapToShippingProps)(Shipping);
