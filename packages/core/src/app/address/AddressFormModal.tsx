import { Country, FormField } from '@bigcommerce/checkout-sdk';
import { FormikProps, withFormik } from 'formik';
import React, { FunctionComponent } from 'react';
import { lazy } from 'yup';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString, withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';

import { Button, ButtonVariant } from '../ui/button';
import { Form } from '../ui/form';
import { LoadingOverlay } from '../ui/loading';
import { Modal, ModalHeader } from '../ui/modal';

import AddressForm from './AddressForm';
import getAddressFormFieldsValidationSchema from './getAddressFormFieldsValidationSchema';
import { AddressFormValues } from './mapAddressToFormValues';

export interface AddressFormModalProps extends AddressFormProps {
    isOpen: boolean;
    onAfterOpen?(): void;
}

export interface AddressFormProps {
    countries?: Country[];
    countriesWithAutocomplete: string[];
    googleMapsApiKey?: string;
    isLoading: boolean;
    shouldShowSaveAddress?: boolean;
    defaultCountryCode?: string;
    isFloatingLabelEnabled?: boolean;
    getFields(countryCode?: string): FormField[];
    onSaveAddress(address: AddressFormValues): void;
    onRequestClose?(): void;
}

const SaveAddress: FunctionComponent<
    AddressFormProps & WithLanguageProps & FormikProps<AddressFormValues>
> = ({
    googleMapsApiKey,
    getFields,
    countriesWithAutocomplete,
    countries,
    values,
    setFieldValue,
    isLoading,
    onRequestClose,
    isFloatingLabelEnabled,
}) => (
    <Form autoComplete="on">
        <LoadingOverlay isLoading={isLoading}>
            <AddressForm
                countries={countries}
                countriesWithAutocomplete={countriesWithAutocomplete}
                countryCode={values.countryCode}
                formFields={getFields(values.countryCode)}
                googleMapsApiKey={googleMapsApiKey}
                isFloatingLabelEnabled={isFloatingLabelEnabled}
                setFieldValue={setFieldValue}
                shouldShowSaveAddress={false}
            />
            <div className="form-actions">
                <a
                    className="button optimizedCheckout-buttonSecondary"
                    href="#"
                    onClick={preventDefault(onRequestClose)}
                >
                    <TranslatedString id="common.cancel_action" />
                </a>

                <Button
                    disabled={isLoading}
                    id="checkout-save-address"
                    type="submit"
                    variant={ButtonVariant.Primary}
                >
                    <TranslatedString id="address.save_address_action" />
                </Button>
            </div>
        </LoadingOverlay>
    </Form>
);

const SaveAddressForm = withLanguage(
    withFormik<AddressFormProps & WithLanguageProps, AddressFormValues>({
        handleSubmit: (values, { props: { onSaveAddress } }) => {
            onSaveAddress(values);
        },
        mapPropsToValues: ({ defaultCountryCode = '' }) => ({
            firstName: '',
            lastName: '',
            address1: '',
            address2: '',
            customFields: {},
            country: '',
            countryCode: defaultCountryCode,
            stateOrProvince: '',
            stateOrProvinceCode: '',
            postalCode: '',
            phone: '',
            city: '',
            company: '',
            shouldSaveAddress: false,
        }),
        validationSchema: ({ language, getFields }: AddressFormProps & WithLanguageProps) =>
            lazy<Partial<AddressFormValues>>((values) =>
                getAddressFormFieldsValidationSchema({
                    language,
                    formFields: getFields(values && values.countryCode),
                }),
            ),
    })(SaveAddress),
);

const AddressFormModal: FunctionComponent<AddressFormModalProps> = ({
    isOpen,
    onAfterOpen,
    onRequestClose,
    ...addressFormProps
}) => (
    <Modal
        additionalModalClassName="modal--medium"
        header={
            <ModalHeader>
                <TranslatedString id="address.add_address_heading" />
            </ModalHeader>
        }
        isOpen={isOpen}
        onAfterOpen={onAfterOpen}
        onRequestClose={onRequestClose}
        shouldShowCloseButton={true}
    >
        <SaveAddressForm {...addressFormProps} onRequestClose={onRequestClose} />
    </Modal>
);

export default AddressFormModal;
