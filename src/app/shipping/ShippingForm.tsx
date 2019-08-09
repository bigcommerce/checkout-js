import { Address, Cart, CheckoutSelectors, Consignment, ConsignmentAssignmentRequestBody, Country, CustomerAddress, CustomerRequestOptions, FormField, ShippingInitializeOptions, ShippingRequestOptions } from '@bigcommerce/checkout-sdk';
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
    isMultiShippingMode: boolean;
    methodId?: string;
    shippingAddress?: Address;
    shouldShowOrderComments: boolean;
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
    updateAddress(address: Partial<Address>): Promise<CheckoutSelectors>;
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
            signOut,
            updateAddress,
        } = this.props;

        return isMultiShippingMode ?
            <MultiShippingForm
                cart={ cart }
                consignments={ consignments }
                customerMessage={ customerMessage }
                isGuest={ isGuest }
                addresses={ addresses }
                assignItem={ assignItem }
                onUnhandledError={ onUnhandledError }
                onUseNewAddress={ onUseNewAddress }
                onSignIn={ onSignIn }
                createAccountUrl={ createAccountUrl }
                isLoading={ isLoading }
                getFields={ getFields }
                cartHasChanged={ cartHasChanged }
                shouldShowOrderComments={ shouldShowOrderComments }
                onSubmit={ onMultiShippingSubmit }
            /> :
            <SingleShippingForm
                countriesWithAutocomplete={ countriesWithAutocomplete }
                customerMessage={ customerMessage }
                cartHasChanged={ cartHasChanged }
                isMultiShippingMode={ isMultiShippingMode }
                shouldShowOrderComments={ shouldShowOrderComments }
                shippingAddress={ shippingAddress }
                onSubmit={ onSingleShippingSubmit }
                updateAddress={ updateAddress }
                deleteConsignments={ deleteConsignments }
                getFields={ getFields }
                onUnhandledError={ onUnhandledError }
                consignments={ consignments }
                methodId={ methodId }
                isLoading={ isLoading }
                googleMapsApiKey={ googleMapsApiKey }
                countries={ countries }
                addresses={ addresses }
                initialize={ initialize }
                deinitialize={ deinitialize }
                signOut={ signOut }
            />;
    }
}

export default withLanguage(ShippingForm);
