import {
    Address,
    CheckoutParams,
    CheckoutSelectors,
    Consignment,
    Country,
    CustomerAddress,
    CustomerRequestOptions,
    FormField,
    RequestOptions,
    ShippingInitializeOptions,
    ShippingRequestOptions,
} from '@bigcommerce/checkout-sdk';
import React from 'react';

import { useExtensions } from '@bigcommerce/checkout/checkout-extension';
import { withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';

import MultiShippingForm, { MultiShippingFormValues } from './MultiShippingForm';
import MultiShippingGuestForm from './MultiShippingGuestForm';
import SingleShippingForm, { SingleShippingFormValues } from './SingleShippingForm';

export interface ShippingFormProps {
    addresses: CustomerAddress[];
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
    deinitialize(options: ShippingRequestOptions): Promise<CheckoutSelectors>;
    deleteConsignments(): Promise<Address | undefined>;
    getFields(countryCode?: string): FormField[];
    initialize(options: ShippingInitializeOptions): Promise<CheckoutSelectors>;
    onCreateAccount(): void;
    onMultiShippingSubmit(values: MultiShippingFormValues): void;
    onSignIn(): void;
    onSingleShippingSubmit(values: SingleShippingFormValues): void;
    onUnhandledError(error: Error): void;
    signOut(options?: CustomerRequestOptions): void;
    updateAddress(
        address: Partial<Address>,
        options: RequestOptions<CheckoutParams>,
    ): Promise<CheckoutSelectors>;
}

const ShippingForm = ({
    addresses,
    cartHasChanged,
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
      shippingAddress,
      shouldShowOrderComments,
      shouldShowSaveAddress,
      signOut,
      updateAddress,
      isShippingStepPending,
      isFloatingLabelEnabled,
    isInitialValueLoaded,
  }: ShippingFormProps & WithLanguageProps) => {

    const {
        extensionState: { shippingFormRenderTimestamp },
    } = useExtensions();

    const getMultiShippingForm = () => {
        if (isGuest) {
            return (
                <MultiShippingGuestForm onCreateAccount={onCreateAccount} onSignIn={onSignIn} />
            );
        }

        return <MultiShippingForm
            cartHasChanged={cartHasChanged}
            countriesWithAutocomplete={countriesWithAutocomplete}
            customerMessage={customerMessage}
            defaultCountryCode={shippingAddress?.countryCode}
            isLoading={isLoading}
            onSubmit={onMultiShippingSubmit}
            onUnhandledError={onUnhandledError}
        />;
    };

    return isMultiShippingMode ? (
        getMultiShippingForm()
    ) : (
        <SingleShippingForm
            addresses={addresses}
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
            shippingFormRenderTimestamp={shippingFormRenderTimestamp}
            shouldShowOrderComments={shouldShowOrderComments}
            shouldShowSaveAddress={shouldShowSaveAddress}
            signOut={signOut}
            updateAddress={updateAddress}
        />
    );
};

export default withLanguage(ShippingForm);
