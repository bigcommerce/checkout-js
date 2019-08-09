import { Address, Consignment, Country, FormField } from '@bigcommerce/checkout-sdk';
import { CustomerAddress } from '@bigcommerce/checkout-sdk/dist/internal-mappers';
import React, { Component, ReactNode } from 'react';

import {  isValidCustomerAddress, AddressForm, AddressSelect } from '../address';
import { connectFormik, ConnectFormikProps } from '../common/form';
import { Fieldset } from '../ui/form';
import { LoadingOverlay } from '../ui/loading';

import { SingleShippingFormValues } from './SingleShippingForm';

export interface ShippingAddressFormProps {
    addresses: CustomerAddress[];
    address?: Address;
    consignments: Consignment[];
    countries?: Country[];
    countriesWithAutocomplete: string[];
    googleMapsApiKey?: string;
    isLoading: boolean;
    formFields: FormField[];
    onUseNewAddress(): void;
    onFieldChange(fieldName: string, value: string): void;
    onAddressSelect(address: Address): void;
}

const addressFieldName = 'shippingAddress';

class ShippingAddressForm extends Component<ShippingAddressFormProps & ConnectFormikProps<SingleShippingFormValues>> {
    render(): ReactNode {
        const {
            addresses,
            address: shippingAddress,
            onAddressSelect,
            onUseNewAddress,
            countries,
            countriesWithAutocomplete,
            formFields,
            isLoading,
            googleMapsApiKey,
            onFieldChange,
            formik: {
                values: {
                    shippingAddress: formAddress,
                },
            },
        } = this.props;

        const hasAddresses = addresses && addresses.length > 0;
        const hasValidCustomerAddress = isValidCustomerAddress(shippingAddress, addresses, formFields);

        return (
            <Fieldset id="checkoutShippingAddress">
                { hasAddresses &&
                    <Fieldset id="shippingAddresses">
                        <LoadingOverlay isLoading={ isLoading }>
                            <AddressSelect
                                addresses={ addresses }
                                onUseNewAddress={ onUseNewAddress }
                                selectedAddress={ hasValidCustomerAddress ? shippingAddress : undefined }
                                onSelectAddress={ address => onAddressSelect(address) }
                            />
                        </LoadingOverlay>
                    </Fieldset>
                }

                { !hasValidCustomerAddress &&
                    <LoadingOverlay isLoading={ isLoading } unmountContentWhenLoading>
                        <AddressForm
                            countries={ countries }
                            countriesWithAutocomplete={ countriesWithAutocomplete }
                            setFieldValue={ this.setFieldValue }
                            googleMapsApiKey={ googleMapsApiKey }
                            countryCode={ formAddress && formAddress.countryCode }
                            onChange={ this.onChange }
                            onAutocompleteToggle={ ({ isOpen, inputValue }) => {
                                if (!isOpen) {
                                    onFieldChange('address1', inputValue);
                                }
                            } }
                            fieldName={ addressFieldName }
                            formFields={ formFields }
                        />
                    </LoadingOverlay>
                }
            </Fieldset>
        );
    }

    private setFieldValue: (fieldName: string, fieldValue: string) => void = (fieldName, fieldValue) => {
        const {
            formik: { setFieldValue },
            formFields,
        } = this.props;

        const customFormFieldNames = formFields
            .filter(field => field.custom)
            .map(field => field.name);

        const formFieldName = customFormFieldNames.includes(fieldName) ?
            `customFields.${fieldName}` :
            fieldName;

        setFieldValue(`${addressFieldName}.${formFieldName}`, fieldValue);
    };

    private onChange: (fieldName: string, value: string) => void = (fieldName, value) => {
        const {
            onFieldChange,
        } = this.props;

        onFieldChange(fieldName, value);
    };
}

export default connectFormik(ShippingAddressForm);
