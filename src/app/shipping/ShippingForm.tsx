import { Address, Cart, CheckoutParams, CheckoutSelectors, Consignment, ConsignmentAssignmentRequestBody, Country, CustomerAddress, CustomerRequestOptions, FormField, RequestOptions, ShippingInitializeOptions, ShippingRequestOptions } from '@bigcommerce/checkout-sdk';
import React, { Component, ReactNode } from 'react';

import { withLanguage, WithLanguageProps } from '../locale';

import MultiShippingForm, { MultiShippingFormValues } from './MultiShippingForm';
import SingleShippingForm, { SingleShippingFormValues } from './SingleShippingForm';

export interface ShippingFormProps {
    addresses: CustomerAddress[];
    cart: Cart;
    cartHasChanged: boolean;
    consignments: Consignment[];
    countries: Country[];
    countriesWithAutocomplete: string[];
    createAccountUrl: string;
    customerMessage: string;
    googleMapsApiKey?: string;
    isGuest: boolean;
    isLoading: boolean;
    isShippingStepPending: boolean;
    isMultiShippingMode: boolean;
    methodId?: string;
    shippingAddress?: Address;
    shouldShowSaveAddress?: boolean;
    shouldShowOrderComments: boolean;
    shouldValidateSafeInput: boolean;
    assignItem(consignment: ConsignmentAssignmentRequestBody): Promise<CheckoutSelectors>;
    deinitialize(options: ShippingRequestOptions): Promise<CheckoutSelectors>;
    deleteConsignments(): Promise<Address | undefined>;
    getFields(countryCode?: string): FormField[];
    initialize(options: ShippingInitializeOptions): Promise<CheckoutSelectors>;
    onMultiShippingSubmit(values: MultiShippingFormValues): void;
    onSignIn(): void;
    onSingleShippingSubmit(values: SingleShippingFormValues): void;
    onUnhandledError(error: Error): void;
    onUseNewAddress(address: Address, itemId: string): void;
    signOut(options?: CustomerRequestOptions): void;
    updateAddress(address: Partial<Address>, options: RequestOptions<CheckoutParams>): Promise<CheckoutSelectors>;
}

class ShippingForm extends Component<ShippingFormProps & WithLanguageProps> {
    render(): ReactNode {
        const {
            addresses,
            assignItem,
            cart,
            cartHasChanged,
            consignments,
            countries,
            countriesWithAutocomplete,
            createAccountUrl,
            customerMessage,
            deinitialize,
            deleteConsignments,
            getFields,
            googleMapsApiKey,
            initialize,
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
            shouldValidateSafeInput,
            signOut,
            updateAddress,
            isShippingStepPending,
        } = this.props;

        return isMultiShippingMode ?
            <MultiShippingForm
                addresses={ addresses }
                assignItem={ assignItem }
                cart={ cart }
                cartHasChanged={ cartHasChanged }
                consignments={ consignments }
                createAccountUrl={ createAccountUrl }
                customerMessage={ customerMessage }
                getFields={ getFields }
                isGuest={ isGuest }
                isLoading={ isLoading }
                onSignIn={ onSignIn }
                onSubmit={ onMultiShippingSubmit }
                onUnhandledError={ onUnhandledError }
                onUseNewAddress={ onUseNewAddress }
                shouldShowOrderComments={ shouldShowOrderComments }
            /> :
            <SingleShippingForm
                addresses={ addresses }
                cartHasChanged={ cartHasChanged }
                consignments={ consignments }
                countries={ countries }
                countriesWithAutocomplete={ countriesWithAutocomplete }
                customerMessage={ customerMessage }
                deinitialize={ deinitialize }
                deleteConsignments={ deleteConsignments }
                getFields={ getFields }
                googleMapsApiKey={ googleMapsApiKey }
                initialize={ initialize }
                isLoading={ isLoading }
                isMultiShippingMode={ isMultiShippingMode }
                isShippingStepPending={ isShippingStepPending }
                methodId={ methodId }
                onSubmit={ onSingleShippingSubmit }
                onUnhandledError={ onUnhandledError }
                shippingAddress={ shippingAddress }
                shouldShowOrderComments={ shouldShowOrderComments }
                shouldShowSaveAddress={ shouldShowSaveAddress }
                shouldValidateSafeInput={ shouldValidateSafeInput }
                signOut={ signOut }
                updateAddress={ updateAddress }
            />;
    }
}

export default withLanguage(ShippingForm);
