import { type LanguageService, type PaymentMethod } from '@bigcommerce/checkout-sdk';
import { type FieldProps } from 'formik';
import React, { type FunctionComponent, useCallback, useEffect } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { type PaymentFormService } from '@bigcommerce/checkout/payment-integration-api';
import { FormField, Legend, TextInput } from '@bigcommerce/checkout/ui';
import { getPoNumber, setPoNumber } from '@bigcommerce/checkout/utility';

import getPoNumberValidationSchema from './getPoNumberValidationSchema';

import './PoNumber.scss';

export interface PoNumberProps {
    label: string;
    isRequired: boolean;
    method: PaymentMethod;
    language: LanguageService;
    paymentForm: PaymentFormService;
}

export const PO_NUMBER_FIELD_NAME = 'poNumber';

const PoNumber: FunctionComponent<PoNumberProps> = ({
    label,
    isRequired,
    method,
    language,
    paymentForm: { setFieldValue, setValidationSchema },
}) => {
    useEffect(() => {
        setFieldValue(PO_NUMBER_FIELD_NAME, getPoNumber());
        setValidationSchema(method, getPoNumberValidationSchema(language, isRequired));

        return () => {
            setValidationSchema(method, null);
        };
    }, [isRequired, language, method, setFieldValue, setValidationSchema]);

    const renderInput = useCallback(
        ({ field }: FieldProps<string>) => (
            <TextInput
                {...field}
                aria-labelledby={`${PO_NUMBER_FIELD_NAME}-label ${PO_NUMBER_FIELD_NAME}-field-error-message`}
                id={PO_NUMBER_FIELD_NAME}
            />
        ),
        [],
    );

    const handleChange = useCallback((value: string) => {
        setPoNumber(value.trim());
    }, []);

    return (
        <div className="po-number-container">
            <FormField
                input={renderInput}
                label={
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
                                    <TranslatedString id="payment.po_number_optional" />
                                </span>
                            )}
                        </label>
                    </Legend>
                }
                name={PO_NUMBER_FIELD_NAME}
                onChange={handleChange}
            />
        </div>
    );
};

export default PoNumber;
