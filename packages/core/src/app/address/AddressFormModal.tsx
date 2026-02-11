import { type Address, type FormField } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import { type FormikProps, withFormik } from 'formik';
import React, { type FunctionComponent } from 'react';
import { lazy } from 'yup';

import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { TranslatedString, withLanguage, type WithLanguageProps } from '@bigcommerce/checkout/locale';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

import { Button, ButtonVariant } from '../ui/button';
import { Form } from '../ui/form';
import { Modal, ModalHeader } from '../ui/modal';

import AddressForm from './AddressForm';
import AddressType from './AddressType';
import getAddressFormFieldsValidationSchema from './getAddressFormFieldsValidationSchema';
import mapAddressToFormValues, { type AddressFormValues } from './mapAddressToFormValues';

export interface AddressFormModalProps extends AddressFormProps {
    isOpen: boolean;
    onAfterOpen?(): void;
}

export interface AddressFormProps {
    isLoading: boolean;
    shouldShowSaveAddress?: boolean;
    defaultCountryCode?: string;
    getFields(countryCode?: string): FormField[];
    onSaveAddress(address: AddressFormValues): void;
    onRequestClose?(): void;
    selectedAddress?: Address;
}

const SaveAddress: FunctionComponent<
    AddressFormProps & WithLanguageProps & FormikProps<AddressFormValues>
> = ({
    getFields,
    values,
    setFieldValue,
    isLoading,
    onRequestClose,
}) => (
    <Form autoComplete="on">
        <LoadingOverlay isLoading={isLoading}>
            <AddressForm
                countryCode={values.countryCode}
                formFields={getFields(values.countryCode)}
                setFieldValue={setFieldValue}
                shouldShowSaveAddress={false}
                type={AddressType.Shipping}
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
}) => {
    const { themeV2 } = useThemeContext();

    return (
        <Modal
            additionalModalClassName={classNames("modal--medium", { "themeV2": themeV2 })}
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
}

export default AddressFormModal;
