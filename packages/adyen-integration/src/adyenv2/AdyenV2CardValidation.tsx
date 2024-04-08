import {
    AdyenValidationState,
    CardInstrument,
    LanguageService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, { FunctionComponent, useEffect, useState } from 'react';

export type FieldsValidation = { [key in AdyenCardFields]?: AdyenValidationState };

enum AdyenCardFields {
    CardNumber = 'encryptedCardNumber',
    SecurityCode = 'encryptedSecurityCode',
    ExpiryDate = 'encryptedExpiryDate',
}

export interface AdyenV2CardValidationProps {
    verificationFieldsContainerId?: string;
    shouldShowNumberField: boolean;
    paymentMethod: PaymentMethod;
    cardValidationState?: AdyenValidationState;
    selectedInstrument?: CardInstrument;
    language?: LanguageService;
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
        validationState[AdyenCardFields.CardNumber] = { valid: false };
    }

    if (method === 'scheme') {
        validationState[AdyenCardFields.SecurityCode] = { valid: false };
    }

    if (method === 'bcmc') {
        validationState[AdyenCardFields.ExpiryDate] = { valid: false };
    }

    return validationState;
};

const isFieldInvalid = (fieldKey: AdyenCardFields, fieldsValidation: FieldsValidation): boolean =>
    !!fieldsValidation[fieldKey] && !fieldsValidation[fieldKey]?.valid;

const AdyenV2CardValidation: FunctionComponent<AdyenV2CardValidationProps> = ({
    verificationFieldsContainerId,
    shouldShowNumberField,
    selectedInstrument,
    paymentMethod,
    cardValidationState,
    language,
}) => {
    const [fieldsValidation, setFieldsValidation] = useState<FieldsValidation>(
        getInitialValidationState({ shouldShowNumberField, method: paymentMethod.method }),
    );

    useEffect(() => {
        if (!cardValidationState) {
            return;
        }

        if (
            cardValidationState.fieldType &&
            (!fieldsValidation[cardValidationState.fieldType] ||
                fieldsValidation[cardValidationState.fieldType]?.valid !==
                    cardValidationState.valid)
        ) {
            if (cardValidationState.fieldType === AdyenCardFields.CardNumber) {
                setFieldsValidation({
                    ...fieldsValidation,
                    [AdyenCardFields.CardNumber]:
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cardValidationState, setFieldsValidation, selectedInstrument?.last4]);

    useEffect(() => {
        if (selectedInstrument?.bigpayToken) {
            setFieldsValidation(
                getInitialValidationState({ shouldShowNumberField, method: paymentMethod.method }),
            );
        }
    }, [selectedInstrument?.bigpayToken, paymentMethod.method, shouldShowNumberField]);

    const showValidationIcon = (key: AdyenCardFields) =>
        isFieldInvalid(key, fieldsValidation) && (
            <span
                className="adyen-checkout-input__inline-validation adyen-checkout-input__inline-validation--invalid"
                style={{ transform: 'none', right: '20px' }}
            >
                <img
                    alt="adyen-checkout-icon"
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
                        {language?.translate(
                            'payment.instrument_trusted_shipping_address_title_text',
                        )}
                    </strong>

                    <br />

                    {language?.translate('payment.instrument_trusted_shipping_address_text')}
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
                        <label htmlFor={AdyenCardFields.CardNumber}>
                            {language?.translate('payment.credit_card_number_label')}
                        </label>
                        <div
                            className={classNames(
                                'form-input',
                                'optimizedCheckout-form-input',
                                'has-icon',
                                'adyen-checkout__input-wrapper',
                                {
                                    'adyen-checkout__input--error': isFieldInvalid(
                                        AdyenCardFields.CardNumber,
                                        fieldsValidation,
                                    ),
                                },
                            )}
                            data-cse={AdyenCardFields.CardNumber}
                            id={AdyenCardFields.CardNumber}
                        />
                        {showValidationIcon(AdyenCardFields.CardNumber)}
                    </div>
                )}

                {paymentMethod.method === 'scheme' && (
                    <div className="form-field form-ccFields-field--ccCvv">
                        <label htmlFor={AdyenCardFields.SecurityCode}>
                            {language?.translate('payment.credit_card_cvv_label')}
                        </label>
                        <div
                            className={classNames(
                                'form-input',
                                'optimizedCheckout-form-input',
                                'has-icon',
                                'adyen-checkout__input-wrapper',
                                {
                                    'adyen-checkout__input--error': isFieldInvalid(
                                        AdyenCardFields.SecurityCode,
                                        fieldsValidation,
                                    ),
                                },
                            )}
                            data-cse={AdyenCardFields.SecurityCode}
                            id={AdyenCardFields.SecurityCode}
                        />
                        {showValidationIcon(AdyenCardFields.SecurityCode)}
                    </div>
                )}
                {paymentMethod.method === 'bcmc' && (
                    <div className="form-field form-field--ccExpiry">
                        <label htmlFor={AdyenCardFields.ExpiryDate}>
                            {language?.translate('payment.credit_card_expiration_label')}
                        </label>
                        <div
                            className={classNames(
                                'form-input',
                                'optimizedCheckout-form-input',
                                'has-icon',
                                'adyen-checkout__input-wrapper',
                                {
                                    'adyen-checkout__input--error': isFieldInvalid(
                                        AdyenCardFields.ExpiryDate,
                                        fieldsValidation,
                                    ),
                                },
                            )}
                            data-cse={AdyenCardFields.ExpiryDate}
                            id={AdyenCardFields.ExpiryDate}
                        />
                        {showValidationIcon(AdyenCardFields.ExpiryDate)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdyenV2CardValidation;
