import { AdyenV3ComponentState } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, { useMemo, FunctionComponent } from 'react';

export enum AdyenV3CardFields {
    CardNumber = 'encryptedCardNumber',
    SecurityCode = 'encryptedSecurityCode',
    ExpiryDate = 'encryptedExpiryDate',
}

import { TranslatedString } from '../../locale';

export interface AdyenV3CardValidationError {
    valid?: boolean;
    fieldType?: AdyenV3CardFields;
}

export type AdyenV3CardValidationState = AdyenV3ComponentState & AdyenV3CardValidationError;

export type FieldsValidation = {[key in AdyenV3CardFields]?: AdyenV3CardValidationState };

export interface AdyenV3CardValidationProps {
    verificationFieldsContainerId?: string;
    shouldShowNumberField: boolean;
    paymentMethodType: string;
    cardValidationState?: AdyenV3CardValidationState;
}

const AdyenV3CardValidation: FunctionComponent<AdyenV3CardValidationProps> = ({
    verificationFieldsContainerId,
    shouldShowNumberField,
    paymentMethodType,
    cardValidationState,
}) => {
    const fieldsValidation: FieldsValidation = useMemo(() => {
        const newFieldValidation: FieldsValidation = {};
        if (!cardValidationState) {
            return newFieldValidation;
        }

        if (Object.keys(cardValidationState).length === 0) {
            Object.values(AdyenV3CardFields).forEach((key: AdyenV3CardFields) => {
                newFieldValidation[key] = {
                    valid: false,
                    data: {
                        paymentMethod: { type: paymentMethodType },
                    },
                };
            });
        } else if (!!cardValidationState.fieldType) {
            newFieldValidation[cardValidationState.fieldType] = cardValidationState;
        }

        return newFieldValidation;
    }, [cardValidationState, paymentMethodType]);

    const isFieldInvalid = (fieldKey: AdyenV3CardFields): boolean => {
        return !!fieldsValidation[fieldKey] && !fieldsValidation[fieldKey]?.valid;
    };

    const showValidationIcon = (key: AdyenV3CardFields) => (
        isFieldInvalid(key) && (<span className="adyen-checkout-input__inline-validation adyen-checkout-input__inline-validation--invalid">
            <img className="adyen-checkout__icon" src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/field_error.svg" />
        </span>)
    );

    return (
        <div>
            { shouldShowNumberField && <p>
                <strong>
                    <TranslatedString id="payment.instrument_trusted_shipping_address_title_text" />
                </strong>

                <br />

                <TranslatedString id="payment.instrument_trusted_shipping_address_text" />
            </p> }

            <div className="form-ccFields" id={ verificationFieldsContainerId }>
                <div className={ classNames(
                    'form-field',
                    'form-field--ccNumber',
                    { 'form-field--ccNumber--hasExpiryDate': paymentMethodType === 'bcmc' },
                    // This div is hiding by CSS because there is an Adyen library in
                    // checkout-sdk which mounts verification fields and if is removed with JS this mounting event will be thrown an error
                    { 'form-field-ccNumber--hide': !shouldShowNumberField }
                    ) }
                >
                    <label htmlFor={ AdyenV3CardFields.CardNumber }>
                        <TranslatedString id="payment.credit_card_number_label" />
                    </label>
                    <div
                        className={ classNames(
                            'form-input',
                            'optimizedCheckout-form-input',
                            'has-icon',
                            'adyen-checkout__input-wrapper',
                            { 'adyen-checkout__input--error': isFieldInvalid(AdyenV3CardFields.CardNumber) }
                        ) }
                        data-cse={ AdyenV3CardFields.CardNumber }
                        id={ AdyenV3CardFields.CardNumber }
                    >
                        { showValidationIcon(AdyenV3CardFields.CardNumber) }
                    </div>
                </div>
                { paymentMethodType === 'scheme' && <div className="form-field form-ccFields-field--ccCvv">
                    <label htmlFor={ AdyenV3CardFields.SecurityCode }>
                        <TranslatedString id="payment.credit_card_cvv_label" />
                    </label>
                    <div
                        className={ classNames(
                            'form-input',
                            'optimizedCheckout-form-input',
                            'has-icon',
                            'adyen-checkout__input-wrapper',
                            { 'adyen-checkout__input--error': isFieldInvalid(AdyenV3CardFields.SecurityCode) }
                        ) }
                        data-cse={ AdyenV3CardFields.SecurityCode }
                        id={ AdyenV3CardFields.SecurityCode }
                    >
                        { showValidationIcon(AdyenV3CardFields.SecurityCode) }
                    </div>
                </div> }
                { paymentMethodType === 'bcmc' && <div className="form-field form-field--ccExpiry">
                    <label htmlFor={ AdyenV3CardFields.ExpiryDate }>
                        <TranslatedString id="payment.credit_card_expiration_label" />
                    </label>
                    <div
                        className={ classNames(
                            'form-input',
                            'optimizedCheckout-form-input',
                            'has-icon',
                            'adyen-checkout__input-wrapper',
                            { 'adyen-checkout__input--error': isFieldInvalid(AdyenV3CardFields.ExpiryDate) }
                        ) }
                        data-cse={ AdyenV3CardFields.ExpiryDate }
                        id={ AdyenV3CardFields.ExpiryDate }
                    >
                        { showValidationIcon(AdyenV3CardFields.ExpiryDate) }
                    </div>
                </div> }
            </div>
        </div>
    );
};

export default AdyenV3CardValidation;
