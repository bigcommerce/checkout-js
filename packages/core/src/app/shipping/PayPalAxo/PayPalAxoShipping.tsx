import {
    Address,
    AddressRequestBody,
    Cart,
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
import React from 'react';

import { AddressFormSkeleton } from '@bigcommerce/checkout/ui';

import { MultiShippingFormValues } from '../MultiShippingForm';
import ShippingHeader from '../ShippingHeader';
import { SingleShippingFormValues } from '../SingleShippingForm';

import PayPalAxoShippingForm from './PayPalAxoShippingForm';
import usePayPalConnectAddress from './usePayPalConnectAddress';

interface PayPalAxoShippingProps {
    cart: Cart;
    cartHasChanged: boolean;
    consignments: Consignment[];
    countries: Country[];
    countriesWithAutocomplete: string[];
    customerMessage: string;
    customer: Customer;
    isBillingSameAsShipping: boolean;
    isFloatingLabelEnabled?: boolean;
    isGuest: boolean;
    isInitializing: boolean;
    isMultiShippingMode: boolean;
    isLoading: boolean;
    isShippingStepPending: boolean;
    shouldShowMultiShipping: boolean;
    shouldShowOrderComments: boolean;
    shouldShowAddAddressInCheckout: boolean;
    assignItem(consignment: ConsignmentAssignmentRequestBody): Promise<CheckoutSelectors>;
    createCustomerAddress(address: AddressRequestBody): Promise<CheckoutSelectors>;
    deinitialize(options: ShippingRequestOptions): Promise<CheckoutSelectors>;
    deleteConsignments(): Promise<Address | undefined>;
    getFields(countryCode?: string): FormField[];
    initialize(options: ShippingInitializeOptions): Promise<CheckoutSelectors>;
    onCreateAccount(): void;
    onMultiShippingChange(): void;
    onMultiShippingSubmit(values: MultiShippingFormValues): void;
    onSignIn(): void;
    onSingleShippingSubmit(values: SingleShippingFormValues): void;
    onUnhandledError(error: Error): void;
    onUseNewAddress(address: Address, itemId: string): void;
    signOut(options?: CustomerRequestOptions): void;
    updateAddress(address: Partial<Address>): Promise<CheckoutSelectors>;
}

const PayPalAxoShipping = ({
    customer,
    isBillingSameAsShipping,
    isFloatingLabelEnabled,
    isGuest,
    isInitializing,
    isMultiShippingMode,
    shouldShowMultiShipping,
    deinitialize,
    initialize,
    onMultiShippingChange,
    onMultiShippingSubmit,
    onSingleShippingSubmit,
    onUseNewAddress,
    updateAddress,
    ...shippingFormProps
}: PayPalAxoShippingProps) => {
    const { mergeAddresses } = usePayPalConnectAddress();
    const addresses = mergeAddresses(customer.addresses);

    console.log('*** customer.addresses', customer.addresses);
    console.log('*** addresses', addresses);

    return (
        <AddressFormSkeleton isLoading={isInitializing}>
            <div className="checkout-form">
                <ShippingHeader
                    isGuest={isGuest}
                    isMultiShippingMode={isMultiShippingMode}
                    onMultiShippingChange={onMultiShippingChange}
                    shouldShowMultiShipping={shouldShowMultiShipping}
                />
                <PayPalAxoShippingForm
                    {...shippingFormProps}
                    addresses={addresses}
                    deinitialize={deinitialize}
                    initialize={initialize}
                    isBillingSameAsShipping={isBillingSameAsShipping}
                    isFloatingLabelEnabled={isFloatingLabelEnabled}
                    isGuest={isGuest}
                    isMultiShippingMode={isMultiShippingMode}
                    onMultiShippingSubmit={onMultiShippingSubmit}
                    onSingleShippingSubmit={onSingleShippingSubmit}
                    onUseNewAddress={onUseNewAddress}
                    shouldShowSaveAddress={!isGuest}
                    updateAddress={updateAddress}
                />
            </div>
        </AddressFormSkeleton>
    );
};

export default PayPalAxoShipping;
