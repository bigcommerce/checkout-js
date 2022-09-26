import { AdyenV2ValidationState, CardInstrument, PaymentMethod } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, { FunctionComponent, useContext, useEffect, useState } from 'react';

import { TranslatedString } from '../../locale';
import PaymentContext from '../PaymentContext';

export type FieldsValidation = { [key in AdyenV2CardFields]?: AdyenV2ValidationState };

enum AdyenV2CardFields {
    CardNumber = 'encryptedCardNumber',
    SecurityCode = 'encryptedSecurityCode',
    ExpiryDate = 'encryptedExpiryDate',
}

export interface AdyenV2CardValidationProps {
    verificationFieldsContainerId?: string;
    shouldShowNumberField: boolean;
    paymentMethod: PaymentMethod;
    cardValidationState?: AdyenV2ValidationState;
    selectedInstrument?: CardInstrument;
}

const getInitialValidationState = ({
    shouldShowNumberField,
    method,
}: {
    shouldShowNumberField: boolean;
    method: string;
}) => {
    const validationState: FieldsValidation = {};

    if (shouldShowNumberField) {
        validationState[AdyenV2CardFields.CardNumber] = { valid: false };
    }

    if (method === 'scheme') {
        validationState[AdyenV2CardFields.SecurityCode] = { valid: false };
    }

    if (method === 'bcmc') {
        validationState[AdyenV2CardFields.ExpiryDate] = { valid: false };
    }

    return validationState;
};

const isFieldInvalid = (fieldKey: AdyenV2CardFields, fieldsValidation: FieldsValidation): boolean =>
    !!fieldsValidation[fieldKey] && !fieldsValidation[fieldKey]?.valid;

const AdyenV2CardValidation: FunctionComponent<AdyenV2CardValidationProps> = ({
    verificationFieldsContainerId,
    shouldShowNumberField,
    selectedInstrument,
    paymentMethod,
    cardValidationState,
}) => {
    const paymentContext = useContext(PaymentContext);

    const [fieldsValidation, setFieldsValidation] = useState<FieldsValidation>(
        getInitialValidationState({ shouldShowNumberField, method: paymentMethod.method }),
    );

    useEffect(() => {
        if (!cardValidationState) {
            return;
        }

        if (cardValidationState.fieldType) {
            if (cardValidationState.fieldType === AdyenV2CardFields.CardNumber) {
                setFieldsValidation({
                    ...fieldsValidation,
                    [AdyenV2CardFields.CardNumber]:
                        cardValidationState.endDigits !== selectedInstrument?.last4
                            ? { ...cardValidationState, valid: false }
                            : { ...cardValidationState },
                });
            } else {
                setFieldsValidation({
                    ...fieldsValidation,
                    [cardValidationState.fieldType]: cardValidationState,
                });
            }
        }
    }, [cardValidationState, setFieldsValidation]);

    useEffect(() => {
        paymentContext?.disableSubmit(
            paymentMethod,
            Object.values(fieldsValidation).some((field) => !field.valid),
        );
    }, [fieldsValidation, paymentContext, paymentMethod]);

    useEffect(() => {
        if (selectedInstrument?.bigpayToken) {
            setFieldsValidation(
                getInitialValidationState({ shouldShowNumberField, method: paymentMethod.method }),
            );
        } else {
            paymentContext?.disableSubmit(paymentMethod, false);
        }
    }, [
        getInitialValidationState,
        selectedInstrument,
        paymentContext,
        paymentMethod,
        shouldShowNumberField,
    ]);

    const showValidationIcon = (key: AdyenV2CardFields) =>
        isFieldInvalid(key, fieldsValidation) && (
            <span
                className="adyen-checkout-input__inline-validation adyen-checkout-input__inline-validation--invalid"
                style={{ transform: 'none', right: '20px' }}
            >
                <img
                    className="adyen-checkout__icon"
                    src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/field_error.svg"
                />
            </span>
        );

    return (
        <div>
            {shouldShowNumberField && (
                <p>
                    <strong>
                        <TranslatedString id="payment.instrument_trusted_shipping_address_title_text" />
                    </strong>

                    <br />

                    <TranslatedString id="payment.instrument_trusted_shipping_address_text" />
                </p>
            )}

            <div className="form-ccFields" id={verificationFieldsContainerId}>
                {shouldShowNumberField && (
                    <div
                        className={classNames(
                            'form-field',
                            'form-field--ccNumber',
                            {
                                'form-field--ccNumber--hasExpiryDate':
                                    paymentMethod.method === 'bcmc',
                            },
                            // This div is hiding by CSS because there is an Adyen library in
                            // checkout-sdk which mounts verification fields and if is removed with JS this mounting event will be thrown an error
                            { 'form-field-ccNumber--hide': !shouldShowNumberField },
                        )}
                    >
                        <label htmlFor={AdyenV2CardFields.CardNumber}>
                            <TranslatedString id="payment.credit_card_number_label" />
                        </label>
                        <div
                            className={classNames(
                                'form-input',
                                'optimizedCheckout-form-input',
                                'has-icon',
                                'adyen-checkout__input-wrapper',
                                {
                                    'adyen-checkout__input--error': isFieldInvalid(
                                        AdyenV2CardFields.CardNumber,
                                        fieldsValidation,
                                    ),
                                },
                            )}
                            data-cse={AdyenV2CardFields.CardNumber}
                            id={AdyenV2CardFields.CardNumber}
                        />
                        {showValidationIcon(AdyenV2CardFields.CardNumber)}
                    </div>
                )}

                {paymentMethod.method === 'scheme' && (
                    <div className="form-field form-ccFields-field--ccCvv">
                        <label htmlFor={AdyenV2CardFields.SecurityCode}>
                            <TranslatedString id="payment.credit_card_cvv_label" />
                        </label>
                        <div
                            className={classNames(
                                'form-input',
                                'optimizedCheckout-form-input',
                                'has-icon',
                                'adyen-checkout__input-wrapper',
                                {
                                    'adyen-checkout__input--error': isFieldInvalid(
                                        AdyenV2CardFields.SecurityCode,
                                        fieldsValidation,
                                    ),
                                },
                            )}
                            data-cse={AdyenV2CardFields.SecurityCode}
                            id={AdyenV2CardFields.SecurityCode}
                        />
                        {showValidationIcon(AdyenV2CardFields.SecurityCode)}
                    </div>
                )}
                {paymentMethod.method === 'bcmc' && (
                    <div className="form-field form-field--ccExpiry">
                        <label htmlFor={AdyenV2CardFields.ExpiryDate}>
                            <TranslatedString id="payment.credit_card_expiration_label" />
                        </label>
                        <div
                            className={classNames(
                                'form-input',
                                'optimizedCheckout-form-input',
                                'has-icon',
                                'adyen-checkout__input-wrapper',
                                {
                                    'adyen-checkout__input--error': isFieldInvalid(
                                        AdyenV2CardFields.ExpiryDate,
                                        fieldsValidation,
                                    ),
                                },
                            )}
                            data-cse={AdyenV2CardFields.ExpiryDate}
                            id={AdyenV2CardFields.ExpiryDate}
                        />
                        {showValidationIcon(AdyenV2CardFields.ExpiryDate)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdyenV2CardValidation;
