import { Address, Country, FormField } from '@bigcommerce/checkout-sdk';
import { FormikProps, withFormik } from 'formik';
import React, { FunctionComponent } from 'react';
import { lazy } from 'yup';

import { TranslatedString, withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

import { Button, ButtonVariant } from '../ui/button';
import { Form } from '../ui/form';
import { Modal, ModalHeader } from '../ui/modal';

import AddressForm from './AddressForm';
import getAddressFormFieldsValidationSchema from './getAddressFormFieldsValidationSchema';
import mapAddressToFormValues, { AddressFormValues } from './mapAddressToFormValues';

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
    selectedAddress?: Address;
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
                <Button
                    onClick={onRequestClose}
                    variant={ButtonVariant.Secondary}>
                    <TranslatedString id="common.cancel_action" />
                </Button>

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
        mapPropsToValues: ({ getFields, selectedAddress }) => {
            return mapAddressToFormValues(
                getFields(selectedAddress && selectedAddress.countryCode),
                selectedAddress,
            )
        },
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
