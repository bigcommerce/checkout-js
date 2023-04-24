import { Address, Country, FormField } from '@bigcommerce/checkout-sdk';
import { memoize } from '@bigcommerce/memoize';
import { forIn, noop } from 'lodash';
import React, { Component, createRef, ReactNode, RefObject } from 'react';

import { TranslatedString, withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';

import { AutocompleteItem } from '../ui/autocomplete';
import { CheckboxFormField, DynamicFormField, DynamicFormFieldType, Fieldset } from '../ui/form';

import { AddressKeyMap } from './address';
import {
    getAddressFormFieldInputId,
    getAddressFormFieldLegacyName,
} from './getAddressFormFieldInputId';
import { GoogleAutocompleteFormField, mapToAddress } from './googleAutocomplete';
import './AddressForm.scss';

export interface AddressFormProps {
    fieldName?: string;
    countryCode?: string;
    countriesWithAutocomplete?: string[];
    countries?: Country[];
    formFields: FormField[];
    googleMapsApiKey?: string;
    shouldShowSaveAddress?: boolean;
    isFloatingLabelEnabled?: boolean;
    onAutocompleteSelect?(address: Partial<Address>): void;
    onAutocompleteToggle?(state: { inputValue: string; isOpen: boolean }): void;
    onChange?(fieldName: string, value: string | string[]): void;
    setFieldValue?(fieldName: string, value: string | string[]): void;
}

const LABEL: AddressKeyMap = {
    address1: 'address.address_line_1_label',
    address2: 'address.address_line_2_label',
    city: 'address.city_label',
    company: 'address.company_name_label',
    countryCode: 'address.country_label',
    firstName: 'address.first_name_label',
    lastName: 'address.last_name_label',
    phone: 'address.phone_number_label',
    postalCode: 'address.postal_code_label',
    stateOrProvince: 'address.state_label',
    stateOrProvinceCode: 'address.state_label',
};

const AUTOCOMPLETE: AddressKeyMap = {
    address1: 'address-line1',
    address2: 'address-line2',
    city: 'address-level2',
    company: 'organization',
    countryCode: 'country',
    firstName: 'given-name',
    lastName: 'family-name',
    phone: 'tel',
    postalCode: 'postal-code',
    stateOrProvince: 'address-level1',
    stateOrProvinceCode: 'address-level1',
};

const PLACEHOLDER: AddressKeyMap = {
    countryCode: 'address.select_country_action',
    stateOrProvince: 'address.select_state_action',
    stateOrProvinceCode: 'address.select_state_action',
};

const AUTOCOMPLETE_FIELD_NAME = 'address1';

class AddressForm extends Component<AddressFormProps & WithLanguageProps> {
    private containerRef: RefObject<HTMLElement> = createRef();
    private nextElement?: HTMLElement | null;

    private handleDynamicFormFieldChange: (name: string) => (value: string | string[]) => void =
        memoize((name) => (value) => {
            this.syncNonFormikValue(name, value);
        });

    componentDidMount(): void {
        const { current } = this.containerRef;

        if (current) {
            this.nextElement = current.querySelector<HTMLElement>('[autocomplete="address-line2"]');
        }
    }

    render(): ReactNode {
        const {
            formFields,
            fieldName,
            countriesWithAutocomplete,
            countryCode,
            googleMapsApiKey,
            onAutocompleteToggle,
            shouldShowSaveAddress,
            isFloatingLabelEnabled,
        } = this.props;

        return (
            <>
                <Fieldset>
                    <div
                        className="checkout-address"
                        ref={this.containerRef as RefObject<HTMLDivElement>}
                    >
                        {formFields.map((field) => {
                            const addressFieldName = field.name;
                            const translatedPlaceholderId = PLACEHOLDER[addressFieldName];

                            if (
                                addressFieldName === 'address1' &&
                                googleMapsApiKey &&
                                countriesWithAutocomplete
                            ) {
                                return (
                                    <GoogleAutocompleteFormField
                                        apiKey={googleMapsApiKey}
                                        countryCode={countryCode}
                                        field={field}
                                        isFloatingLabelEnabled={isFloatingLabelEnabled}
                                        key={field.id}
                                        nextElement={this.nextElement || undefined}
                                        onChange={this.handleAutocompleteChange}
                                        onSelect={this.handleAutocompleteSelect}
                                        onToggleOpen={onAutocompleteToggle}
                                        parentFieldName={fieldName}
                                        supportedCountries={countriesWithAutocomplete}
                                    />
                                );
                            }

                            return (
                                <DynamicFormField
                                    autocomplete={AUTOCOMPLETE[field.name]}
                                    extraClass={`dynamic-form-field--${getAddressFormFieldLegacyName(
                                        addressFieldName,
                                    )}`}
                                    field={field}
                                    inputId={getAddressFormFieldInputId(addressFieldName)}
                                    // stateOrProvince can sometimes be a dropdown or input, so relying on id is not sufficient
                                    isFloatingLabelEnabled={isFloatingLabelEnabled}
                                    key={`${field.id}-${field.name}`}
                                    label={
                                        field.custom ? (
                                            field.label
                                        ) : (
                                            <TranslatedString id={LABEL[field.name]} />
                                        )
                                    }
                                    onChange={this.handleDynamicFormFieldChange(addressFieldName)}
                                    parentFieldName={
                                        field.custom
                                            ? fieldName
                                                ? `${fieldName}.customFields`
                                                : 'customFields'
                                            : fieldName
                                    }
                                    placeholder={this.getPlaceholderValue(
                                        field,
                                        translatedPlaceholderId,
                                    )}
                                />
                            );
                        })}
                    </div>
                </Fieldset>
                {shouldShowSaveAddress && (
                    <CheckboxFormField
                        labelContent={<TranslatedString id="address.save_in_addressbook" />}
                        name={fieldName ? `${fieldName}.shouldSaveAddress` : 'shouldSaveAddress'}
                    />
                )}
            </>
        );
    }

    private getPlaceholderValue(field: FormField, translatedPlaceholderId: string): string {
        const { language } = this.props;

        if (field.default && field.fieldType !== 'dropdown') {
            return field.default;
        }

        return translatedPlaceholderId && language.translate(translatedPlaceholderId);
    }

    private handleAutocompleteChange: (value: string, isOpen: boolean) => void = (
        value,
        isOpen,
    ) => {
        if (!isOpen) {
            this.syncNonFormikValue(AUTOCOMPLETE_FIELD_NAME, value);
        }
    };

    private handleAutocompleteSelect: (
        place: google.maps.places.PlaceResult,
        item: AutocompleteItem,
    ) => void = (place, { value: autocompleteValue }) => {
        const { countries, setFieldValue = noop, onChange = noop } = this.props;

        const address = mapToAddress(place, countries);

        forIn(address, (value, fieldName) => {
            setFieldValue(fieldName, value as string);
            onChange(fieldName, value as string);
        });

        if (autocompleteValue) {
            this.syncNonFormikValue(AUTOCOMPLETE_FIELD_NAME, autocompleteValue);
        }
    };

    // because autocomplete state is controlled by Downshift, we need to manually keep formik
    // value in sync when autocomplete value changes
    private syncNonFormikValue: (fieldName: string, value: string | string[]) => void = (
        fieldName,
        value,
    ) => {
        const { formFields, setFieldValue = noop, onChange = noop } = this.props;

        const dateFormFieldNames = formFields
            .filter((field) => field.custom && field.fieldType === DynamicFormFieldType.date)
            .map((field) => field.name);

        if (fieldName === AUTOCOMPLETE_FIELD_NAME || dateFormFieldNames.indexOf(fieldName) > -1) {
            setFieldValue(fieldName, value);
        }

        onChange(fieldName, value);
    };
}

export default withLanguage(AddressForm);
