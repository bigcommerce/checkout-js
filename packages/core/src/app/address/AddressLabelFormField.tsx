import { type FormField } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import { useField } from 'formik';
import React, {
    type ChangeEvent,
    type FunctionComponent,
    memo,
    type ReactNode,
    useState,
} from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { DynamicInput, Label } from '@bigcommerce/checkout/ui';

import { getAddressFormFieldInputId } from './getAddressFormFieldInputId';

interface FloatingFieldProps {
    id: string;
    name: string;
    value: string;
    isFloatingLabelEnabled?: boolean;
    children: ReactNode;
    onChange(event: ChangeEvent<HTMLInputElement>): void;
}

// Floating-label CSS needs the input before the label; static layout wants it after. `.form-field`
// is the position:relative context the floating label positions against.
const FloatingField: FunctionComponent<FloatingFieldProps> = ({
    id,
    name,
    value,
    isFloatingLabelEnabled,
    children,
    onChange,
}) => {
    const input = (
        <DynamicInput
            id={id}
            isFloatingLabelEnabled={isFloatingLabelEnabled}
            name={name}
            onChange={onChange}
            testId={`${id}-text`}
            value={value}
        />
    );

    return (
        <div className="form-field">
            {isFloatingLabelEnabled && input}
            <Label
                additionalClassName={
                    isFloatingLabelEnabled ? 'floating-form-field-label' : 'body-medium'
                }
                htmlFor={id}
                isFloatingLabelEnabled={isFloatingLabelEnabled}
            >
                {children}
            </Label>
            {!isFloatingLabelEnabled && input}
        </div>
    );
};

const OptionalText = () => (
    <>
        {' '}
        <small className="optimizedCheckout-contentSecondary">
            <TranslatedString id="common.optional_text" />
        </small>
    </>
);

export interface AddressLabelFormFieldProps {
    field: FormField;
    parentFieldName?: string;
    inputId?: string;
    isFloatingLabelEnabled?: boolean;
    onChange?(value: string): void;
}

// Renders the Address Label input next to Company Name. Both are plain Formik fields; the label is
// folded into `company` only at the write boundary, so there's no encode/decode bookkeeping here.
const AddressLabelFormField: FunctionComponent<AddressLabelFormFieldProps> = ({
    field,
    parentFieldName,
    inputId,
    isFloatingLabelEnabled,
    onChange,
}) => {
    const labelPath = parentFieldName ? `${parentFieldName}.label` : 'label';
    const companyPath = parentFieldName ? `${parentFieldName}.company` : 'company';
    const companyInputId = inputId ?? getAddressFormFieldInputId('company');

    const [labelField, , labelHelpers] = useField<string>(labelPath);
    const [companyField] = useField<string>(companyPath);
    const [slashError, setSlashError] = useState(false);

    // Label and company both change the value persisted to `company` (encoded on write), so either
    // edit should notify the parent to run its autosave.
    const notifyChange = (value = companyField.value ?? '') => onChange?.(value);

    const handleLabelChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newLabel = event.target.value;

        // A "/" would collide with the label/company delimiter used on the wire.
        if (newLabel.includes('/')) {
            setSlashError(true);

            return;
        }

        setSlashError(false);
        void labelHelpers.setValue(newLabel);
        notifyChange();
    };

    const handleCompanyChange = (event: ChangeEvent<HTMLInputElement>) => {
        companyField.onChange(event);
        notifyChange(event.target.value);
    };

    const wrapperClass = (extraClass: string) =>
        classNames(
            'dynamic-form-field',
            { 'floating-form-field': isFloatingLabelEnabled },
            extraClass,
        );

    return (
        <>
            <div className={wrapperClass('dynamic-form-field--addressLabel')}>
                <FloatingField
                    id="addressLabelInput"
                    isFloatingLabelEnabled={isFloatingLabelEnabled}
                    name="addressLabel"
                    onChange={handleLabelChange}
                    value={labelField.value ?? ''}
                >
                    <TranslatedString id="address.address_label_label" />
                    <OptionalText />
                </FloatingField>
                {slashError && (
                    <p
                        className="form-field-error-message optimizedCheckout-form-field-error"
                        data-test="address-label-slash-error"
                    >
                        <TranslatedString id="address.address_label_slash_error" />
                    </p>
                )}
            </div>

            <div className={wrapperClass('dynamic-form-field--labelCompany')}>
                <FloatingField
                    id={companyInputId}
                    isFloatingLabelEnabled={isFloatingLabelEnabled}
                    name={companyField.name}
                    onChange={handleCompanyChange}
                    value={companyField.value ?? ''}
                >
                    <TranslatedString id="address.company_name_label" />
                    {!field.required && <OptionalText />}
                </FloatingField>
            </div>
        </>
    );
};

export default memo(AddressLabelFormField);
