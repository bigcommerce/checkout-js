import {
    Address,
    CheckoutSelectors,
    Consignment,
    Country,
    CustomerAddress,
    FormField,
    ShippingInitializeOptions,
    ShippingRequestOptions,
} from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo, useContext } from 'react';

import { isPayPalFastlaneMethod, usePayPalFastlaneAddress } from '@bigcommerce/checkout/paypal-fastlane-integration';
import { FormContext } from '@bigcommerce/checkout/ui';

import ShippingAddressForm from './ShippingAddressForm';
import { AmazonPayShippingAddress } from './AmazonPayShippingAddress';
import { PayPalFastlaneShippingAddress } from './PayPalFastlaneShippingAddress';

export interface ShippingAddressProps {
    addresses: CustomerAddress[];
    consignments: Consignment[];
    countries?: Country[];
    countriesWithAutocomplete: string[];
    formFields: FormField[];
    googleMapsApiKey?: string;
    isLoading: boolean;
    isShippingStepPending: boolean;
    methodId?: string;
    shippingAddress?: Address;
    shouldShowSaveAddress?: boolean;
    hasRequestedShippingOptions: boolean;
    isFloatingLabelEnabled?: boolean;
    deinitialize(options: ShippingRequestOptions): Promise<CheckoutSelectors>;
    initialize(options: ShippingInitializeOptions): Promise<CheckoutSelectors>;
    onAddressSelect(address: Address): void;
    onFieldChange(name: string, value: string): void;
    onUnhandledError?(error: Error): void;
    onUseNewAddress(): void;
}

const ShippingAddress: FunctionComponent<ShippingAddressProps> = (props) => {
    const {
        methodId,
        formFields,
        countries,
        countriesWithAutocomplete,
        consignments,
        googleMapsApiKey,
        onAddressSelect,
        onFieldChange,
        onUseNewAddress,
        isLoading,
        shippingAddress,
        hasRequestedShippingOptions,
        addresses,
        shouldShowSaveAddress,
        isFloatingLabelEnabled,
    } = props;

    const { shouldShowPayPalFastlaneShippingForm } = usePayPalFastlaneAddress();
    const { setSubmitted } = useContext(FormContext);

    const handleFieldChange: (fieldName: string, value: string) => void = (fieldName, value) => {
        if (hasRequestedShippingOptions) {
            setSubmitted(true);
        }

        onFieldChange(fieldName, value);
    };

    if (methodId === 'amazonpay' && shippingAddress) {
        return (
            <AmazonPayShippingAddress
                {...props}
                shippingAddress={shippingAddress}
            />
        );
    }

    if (methodId && isPayPalFastlaneMethod(methodId) && shippingAddress && shouldShowPayPalFastlaneShippingForm) {
        return (
            <PayPalFastlaneShippingAddress
                { ...props }
                shippingAddress={shippingAddress}
                methodId={methodId}
            />
        )
    }

    return (
        <ShippingAddressForm
            address={shippingAddress}
            addresses={addresses}
            consignments={consignments}
            countries={countries}
            countriesWithAutocomplete={countriesWithAutocomplete}
            formFields={formFields}
            googleMapsApiKey={googleMapsApiKey}
            isFloatingLabelEnabled={isFloatingLabelEnabled}
            isLoading={isLoading}
            onAddressSelect={onAddressSelect}
            onFieldChange={handleFieldChange}
            onUseNewAddress={onUseNewAddress}
            shouldShowSaveAddress={shouldShowSaveAddress}
        />
    );
};

export default memo(ShippingAddress);
