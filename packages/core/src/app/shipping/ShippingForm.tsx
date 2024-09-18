import {
    Address,
    AddressRequestBody,
    Cart,
    CheckoutParams,
    CheckoutSelectors,
    Consignment,
    ConsignmentAssignmentRequestBody,
    Country,
    CustomerAddress,
    CustomerRequestOptions,
    FormField,
    RequestOptions,
    ShippingInitializeOptions,
    ShippingRequestOptions,
} from '@bigcommerce/checkout-sdk';
import React, { useEffect } from 'react';

import { withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';
import { usePayPalFastlaneAddress } from '@bigcommerce/checkout/paypal-fastlane-integration';

import MultiShippingForm, { MultiShippingFormValues } from './MultiShippingForm';
import SingleShippingForm, { SingleShippingFormValues } from './SingleShippingForm';

export interface ShippingFormProps {
    addresses: CustomerAddress[];
    cart: Cart;
    cartHasChanged: boolean;
    consignments: Consignment[];
    countries: Country[];
    countriesWithAutocomplete: string[];
    customerMessage: string;
    googleMapsApiKey?: string;
    isBillingSameAsShipping: boolean;
    isGuest: boolean;
    isLoading: boolean;
    isShippingStepPending: boolean;
    isMultiShippingMode: boolean;
    methodId?: string;
    shippingAddress?: Address;
    shouldShowSaveAddress?: boolean;
    shouldShowOrderComments: boolean;
    isFloatingLabelEnabled?: boolean;
    isInitialValueLoaded: boolean;
    assignItem(consignment: ConsignmentAssignmentRequestBody): Promise<CheckoutSelectors>;
    deinitialize(options: ShippingRequestOptions): Promise<CheckoutSelectors>;
    deleteConsignments(): Promise<Address | undefined>;
    getFields(countryCode?: string): FormField[];
    initialize(options: ShippingInitializeOptions): Promise<CheckoutSelectors>;
    onCreateAccount(): void;
    createCustomerAddress(address: AddressRequestBody): Promise<CheckoutSelectors>;
    onMultiShippingSubmit(values: MultiShippingFormValues): void;
    onSignIn(): void;
    onSingleShippingSubmit(values: SingleShippingFormValues): void;
    onUnhandledError(error: Error): void;
    onUseNewAddress(address: Address, itemId: string): void;
    signOut(options?: CustomerRequestOptions): void;
    updateAddress(
        address: Partial<Address>,
        options: RequestOptions<CheckoutParams>,
    ): Promise<CheckoutSelectors>;
}

const ShippingForm = ({
    addresses,
    assignItem,
    cart,
    cartHasChanged,
    createCustomerAddress,
    consignments,
    countries,
    countriesWithAutocomplete,
    onCreateAccount,
    customerMessage,
    deinitialize,
    deleteConsignments,
    getFields,
    googleMapsApiKey,
    initialize,
    isBillingSameAsShipping,
    isGuest,
    isLoading,
    isMultiShippingMode,
    methodId,
    onMultiShippingSubmit,
    onSignIn,
    onSingleShippingSubmit,
    onUnhandledError,
    onUseNewAddress,
    shippingAddress,
    shouldShowOrderComments,
    shouldShowSaveAddress,
    signOut,
    updateAddress,
    isShippingStepPending,
    isFloatingLabelEnabled,
    isInitialValueLoaded,
}: ShippingFormProps & WithLanguageProps) => {
    // TODO: remove PayPal Fastlane related code and useEffect when PayPal Fastlane will not be available for Store members
    const {
        isPayPalFastlaneEnabled,
        paypalFastlaneAddresses,
        shouldShowPayPalFastlaneShippingForm,
    } = usePayPalFastlaneAddress();

    const shippingAddresses = isPayPalFastlaneEnabled && isGuest
        ? paypalFastlaneAddresses
        : addresses;

    useEffect(() => {
        if (isPayPalFastlaneEnabled && !shouldShowPayPalFastlaneShippingForm) {
            initialize({ methodId });
        }
    }, [isPayPalFastlaneEnabled, shouldShowPayPalFastlaneShippingForm, methodId, initialize]);

    return isMultiShippingMode ? (
        <MultiShippingForm
            addresses={shippingAddresses}
            assignItem={assignItem}
            cart={cart}
            cartHasChanged={cartHasChanged}
            consignments={consignments}
            countries={countries}
            countriesWithAutocomplete={countriesWithAutocomplete}
            createCustomerAddress={createCustomerAddress}
            customerMessage={customerMessage}
            defaultCountryCode={shippingAddress?.countryCode}
            getFields={getFields}
            googleMapsApiKey={googleMapsApiKey}
            isFloatingLabelEnabled={isFloatingLabelEnabled}
            isGuest={isGuest}
            isInitialValueLoaded={isInitialValueLoaded}
            isLoading={isLoading}
            onCreateAccount={onCreateAccount}
            onSignIn={onSignIn}
            onSubmit={onMultiShippingSubmit}
            onUnhandledError={onUnhandledError}
            onUseNewAddress={onUseNewAddress}
            shouldShowOrderComments={shouldShowOrderComments}
        />
    ) : (
        <SingleShippingForm
            addresses={shippingAddresses}
            cartHasChanged={cartHasChanged}
            consignments={consignments}
            countries={countries}
            countriesWithAutocomplete={countriesWithAutocomplete}
            customerMessage={customerMessage}
            deinitialize={deinitialize}
            deleteConsignments={deleteConsignments}
            getFields={getFields}
            googleMapsApiKey={googleMapsApiKey}
            initialize={initialize}
            isBillingSameAsShipping={isBillingSameAsShipping}
            isFloatingLabelEnabled={isFloatingLabelEnabled}
            isInitialValueLoaded={isInitialValueLoaded}
            isLoading={isLoading}
            isMultiShippingMode={isMultiShippingMode}
            isShippingStepPending={isShippingStepPending}
            methodId={methodId}
            onSubmit={onSingleShippingSubmit}
            onUnhandledError={onUnhandledError}
            shippingAddress={shippingAddress}
            shouldShowOrderComments={shouldShowOrderComments}
            shouldShowSaveAddress={shouldShowSaveAddress}
            signOut={signOut}
            updateAddress={updateAddress}
        />
    );
};

export default withLanguage(ShippingForm);
