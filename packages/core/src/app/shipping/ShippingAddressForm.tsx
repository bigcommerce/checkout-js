import {
    type Address,
    type Consignment,
    type FormField,
} from '@bigcommerce/checkout-sdk';
import React, { type ReactElement } from 'react';

import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

import { AddressForm, AddressSelect, AddressType, isValidCustomerAddress } from '../address';
import { connectFormik, type ConnectFormikProps } from '../common/form';
import { EMPTY_ARRAY } from '../common/utility';
import { Fieldset } from '../ui/form';

import { type SingleShippingFormValues } from './SingleShippingForm';

export interface ShippingAddressFormProps {
    address?: Address;
    consignments: Consignment[];
    countriesWithAutocomplete: string[];
    googleMapsApiKey?: string;
    isLoading: boolean;
    formFields: FormField[];
    isFloatingLabelEnabled?: boolean;
    onUseNewAddress(): void;
    onFieldChange(fieldName: string, value: string): void;
    onAddressSelect(address: Address): void;
}

const addressFieldName = 'shippingAddress';

const ShippingAddressForm = (
    {
        address: shippingAddress,
        onAddressSelect,
        onUseNewAddress,
        countriesWithAutocomplete,
        formFields,
        isLoading,
        googleMapsApiKey,
        isFloatingLabelEnabled,
        formik: {
            values: { shippingAddress: formAddress },
            setFieldValue: formikSetFieldValue,
        },
        onFieldChange,
    }: ShippingAddressFormProps & ConnectFormikProps<SingleShippingFormValues>,
): ReactElement => {
    const {
        checkoutState:{
            data:{
                getCustomer,
                getShippingCountries,
            },
        },
    } = useCheckout();

    const customer = getCustomer();
    const addresses = customer?.addresses || [];
    const countries = getShippingCountries() || EMPTY_ARRAY;
    const shouldShowSaveAddress = !(customer?.isGuest);

    const setFieldValue = (fieldName: string, fieldValue: string) => {
        const customFormFieldNames = formFields
            .filter((field) => field.custom)
            .map((field) => field.name);

        const formFieldName = customFormFieldNames.includes(fieldName)
            ? `customFields.${fieldName}`
            : fieldName;

        void formikSetFieldValue(`${addressFieldName}.${formFieldName}`, fieldValue);
    };

    const handleChange = (fieldName: string, value: string) => {
        onFieldChange(fieldName, value);
    };

    const handleAutocompleteToggle = ({
        isOpen,
        inputValue,
    }: {
        inputValue: string;
        isOpen: boolean;
    }) => {
        if (!isOpen) {
            onFieldChange('address1', inputValue);
        }
    };

    const hasAddresses = addresses && addresses.length > 0;
    const hasValidCustomerAddress = isValidCustomerAddress(
        shippingAddress,
        addresses,
        formFields,
    );

    return (
        <Fieldset id="checkoutShippingAddress">
            {hasAddresses && (
                <Fieldset id="shippingAddresses">
                    <LoadingOverlay isLoading={isLoading}>
                        <AddressSelect
                            addresses={addresses}
                            onSelectAddress={onAddressSelect}
                            onUseNewAddress={onUseNewAddress}
                            selectedAddress={
                                hasValidCustomerAddress ? shippingAddress : undefined
                            }
                            type={AddressType.Shipping}
                        />
                    </LoadingOverlay>
                </Fieldset>
            )}

            {!hasValidCustomerAddress && (
                <LoadingOverlay isLoading={isLoading} unmountContentWhenLoading>
                    <AddressForm
                        countries={countries}
                        countriesWithAutocomplete={countriesWithAutocomplete}
                        countryCode={formAddress && formAddress.countryCode}
                        fieldName={addressFieldName}
                        formFields={formFields}
                        googleMapsApiKey={googleMapsApiKey}
                        isFloatingLabelEnabled={isFloatingLabelEnabled}
                        onAutocompleteToggle={handleAutocompleteToggle}
                        onChange={handleChange}
                        setFieldValue={setFieldValue}
                        shouldShowSaveAddress={shouldShowSaveAddress}
                    />
                </LoadingOverlay>
            )}
        </Fieldset>
    );
};

export default connectFormik(ShippingAddressForm);
