import {
    Address,
    Cart,
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
import React, { useEffect } from 'react';

import { withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';
import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import isUsingMultiShipping from './isUsingMultiShipping';
import MultiShippingForm, { MultiShippingFormValues } from './MultiShippingForm';
import MultiShippingGuestForm from './MultiShippingGuestForm';
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
    isGuestMultiShippingEnabled: boolean;
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
    shippingFormRenderTimestamp?: number;
    setIsMultishippingMode(isMultiShippingMode: boolean): void;
}

const ShippingForm = ({
    addresses,
    cart,
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
      isGuestMultiShippingEnabled,
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
    shippingFormRenderTimestamp,
    setIsMultishippingMode,
}: ShippingFormProps & WithLanguageProps) => {
    const {
        checkoutState: {
            data: { getConfig },
        },
    } = useCheckout();
    const config = getConfig();

    useEffect(() => {
        if (shippingFormRenderTimestamp) {
            const hasMultiShippingEnabled = config?.checkoutSettings?.hasMultiShippingEnabled ?? false;
            const isMultiShippingMode =
                !!cart &&
                !!consignments &&
                hasMultiShippingEnabled &&
                isUsingMultiShipping(consignments, cart.lineItems);

            setIsMultishippingMode(isMultiShippingMode);
        }
    }, [shippingFormRenderTimestamp]);

    const getMultiShippingForm = () => {
        if (isGuest && !isGuestMultiShippingEnabled) {
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
