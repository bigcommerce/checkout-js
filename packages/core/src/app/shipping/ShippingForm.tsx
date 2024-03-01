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
import { isPayPalFastlaneMethod, usePayPalFastlaneAddress } from '@bigcommerce/checkout/paypal-fastlane-integration';

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
    shouldShowAddAddressInCheckout: boolean;
    isFloatingLabelEnabled?: boolean;
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
    shouldShowAddAddressInCheckout,
    signOut,
    updateAddress,
    isShippingStepPending,
    isFloatingLabelEnabled,
}: ShippingFormProps & WithLanguageProps) => {
    const { isPayPalFastlaneEnabled, mergedBcAndPayPalFastlaneAddresses } = usePayPalFastlaneAddress();
    const shippingAddresses = isPayPalFastlaneEnabled ? mergedBcAndPayPalFastlaneAddresses : addresses;

    useEffect(() => {
        if (isPayPalFastlaneMethod(methodId) && isPayPalFastlaneEnabled) {
            initialize({ methodId });
        }
    });

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
            isLoading={isLoading}
            onCreateAccount={onCreateAccount}
            onSignIn={onSignIn}
            onSubmit={onMultiShippingSubmit}
            onUnhandledError={onUnhandledError}
            onUseNewAddress={onUseNewAddress}
            shouldShowAddAddressInCheckout={shouldShowAddAddressInCheckout}
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
