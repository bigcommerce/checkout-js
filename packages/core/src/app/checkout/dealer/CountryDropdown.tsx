import { Country, FormField } from '@bigcommerce/checkout-sdk';
import React, { PureComponent } from 'react';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { DynamicFormField } from '../../ui/form';
import { Formik } from 'formik';

export interface CountryDropdownProps {
  countries: Country[];
  selectedCountry?: string;
  validateSelectedCountry: (value: string | string[]) => void;
}

export default class CountryDropdown extends PureComponent<CountryDropdownProps> {
  render() {
    const { validateSelectedCountry } = this.props;

    // Create a country field definition for the DynamicFormField
    const countryField: FormField = {
      name: 'countryCode',
      id: 'countryCode',
      label: 'Country',
      required: true,
      custom: false,
      fieldType: 'dropdown',
      type: 'array',
      default: 'US',
      options: {
        items: [
          {
            value: 'US',
            label: 'United States',
          },
        ], // Only include US as an option
      },
    };

    const initialValues = {
      countryCode: 'US',
    };

    return (
      <Formik initialValues={initialValues} onSubmit={() => {}}>
        <DynamicFormField
          field={countryField}
          onChange={validateSelectedCountry}
          inputId="countryCodeInput"
          label={<TranslatedString id="address.country_label" />}
          extraClass="dynamic-form-field--countryCode"
        />
      </Formik>
    );
  }
}
