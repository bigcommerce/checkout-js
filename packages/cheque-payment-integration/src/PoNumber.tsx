import { type LanguageService, type PaymentMethod } from '@bigcommerce/checkout-sdk';
import { type FieldProps } from 'formik';
import React, { type FunctionComponent, useCallback, useEffect } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { type PaymentFormService } from '@bigcommerce/checkout/payment-integration-api';
import { FormField, Legend, TextInput } from '@bigcommerce/checkout/ui';
import { B2BSessionStorage } from '@bigcommerce/checkout/utility';

import getPoNumberValidationSchema from './getPoNumberValidationSchema';

import './PoNumber.scss';

export interface PoNumberProps {
    label: string;
    isRequired: boolean;
    isFloatingLabelEnabled?: boolean;
    method: PaymentMethod;
    language: LanguageService;
    paymentForm: PaymentFormService;
}

export const PO_NUMBER_FIELD_NAME = 'poNumber';

const PoNumber: FunctionComponent<PoNumberProps> = ({
    label,
    isRequired,
    isFloatingLabelEnabled,
    method,
    language,
    paymentForm: { setFieldValue, setValidationSchema },
}) => {
    useEffect(() => {
        setFieldValue(PO_NUMBER_FIELD_NAME, B2BSessionStorage.getPaymentValues()?.poNumber ?? '');
        setValidationSchema(method, getPoNumberValidationSchema(language, isRequired, label));

        return () => {
            setValidationSchema(method, null);
        };
    }, [isRequired, label, language, method, setFieldValue, setValidationSchema]);

    const renderInput = useCallback(
        ({ field }: FieldProps<string>) => (
            <TextInput
                {...field}
                aria-labelledby={`${PO_NUMBER_FIELD_NAME}-label ${PO_NUMBER_FIELD_NAME}-field-error-message`}
                id={PO_NUMBER_FIELD_NAME}
                isFloatingLabelEnabled={isFloatingLabelEnabled}
            />
        ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    return (
        <div className="po-number-container">
            <FormField
                input={renderInput}
                isFloatingLabelEnabled={isFloatingLabelEnabled}
                label={
                    isFloatingLabelEnabled ? undefined : (
                        <Legend>
                            <label
                                className="po-number-label"
                                htmlFor={PO_NUMBER_FIELD_NAME}
                                id={`${PO_NUMBER_FIELD_NAME}-label`}
                            >
                                <span>{label}</span>
                                {!isRequired && (
                                    <span>
                                        {' '}
                                        <TranslatedString id="common.optional_text" />
                                    </span>
                                )}
                            </label>
                        </Legend>
                    )
                }
                labelContent={
                    isFloatingLabelEnabled ? (
                        <>
                            {label}
                            {!isRequired && (
                                <>
                                    {' '}
                                    <small>
                                        <TranslatedString id="common.optional_text" />
                                    </small>
                                </>
                            )}
                        </>
                    ) : undefined
                }
                name={PO_NUMBER_FIELD_NAME}
            />
        </div>
    );
};

export default PoNumber;
