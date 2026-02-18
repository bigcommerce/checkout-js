import {
    type Address,
    type Consignment,
    type FormField,
} from '@bigcommerce/checkout-sdk';
import React, { type ReactElement } from 'react';

import { useCheckout, useThemeContext } from '@bigcommerce/checkout/contexts';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

import { AddressForm, AddressSelect, AddressType, isValidCustomerAddress, reorderAddressFormFields } from '../address';
import { connectFormik, type ConnectFormikProps } from '../common/form';
import { Fieldset } from '../ui/form';

import { type SingleShippingFormValues } from './SingleShippingForm';

export interface ShippingAddressFormProps {
    address?: Address;
    consignments: Consignment[];
    isLoading: boolean;
    formFields: FormField[];
    validateMaxLength: boolean;
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
        formFields,
        isLoading,
        validateMaxLength,
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
            },
        },
    } = useCheckout();
    const { themeV2 } = useThemeContext();

    const customer = getCustomer();
    const addresses = customer?.addresses || [];
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
        validateMaxLength,
    );

    const sortedFormFields = themeV2 ? reorderAddressFormFields(formFields) : formFields;

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
                        countryCode={formAddress && formAddress.countryCode}
                        fieldName={addressFieldName}
                        formFields={sortedFormFields}
                        onAutocompleteToggle={handleAutocompleteToggle}
                        onChange={handleChange}
                        setFieldValue={setFieldValue}
                        shouldShowSaveAddress={shouldShowSaveAddress}
                        type={AddressType.Shipping}
                    />
                </LoadingOverlay>
            )}
        </Fieldset>
    );
};

export default connectFormik(ShippingAddressForm);
