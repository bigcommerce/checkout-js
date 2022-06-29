import { AdyenComponentState } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, { useMemo, FunctionComponent } from 'react';

export enum AdyenV2CardFields {
    CardNumber = 'encryptedCardNumber',
    SecurityCode = 'encryptedSecurityCode',
    ExpiryDate = 'encryptedExpiryDate',
}

import { TranslatedString } from '../../locale';

export interface AdyenV2CardValidationError {
    valid?: boolean;
    fieldType?: AdyenV2CardFields;
}

export type AdyenV2CardValidationState = (AdyenComponentState & AdyenV2CardValidationError);

export type FieldsValidation = {[key in AdyenV2CardFields]?: AdyenV2CardValidationState};

export interface AdyenV2CardValidationProps {
    verificationFieldsContainerId?: string;
    shouldShowNumberField: boolean;
    paymentMethodType: string;
    cardValidationState?: AdyenV2CardValidationState;
}

const AdyenV2CardValidation: FunctionComponent<AdyenV2CardValidationProps> = ({
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
            Object.values(AdyenV2CardFields).forEach((key: AdyenV2CardFields) => {
                newFieldValidation[key] = {valid: false} as AdyenV2CardValidationState;
            });
        } else if (!!cardValidationState.fieldType) {
            newFieldValidation[cardValidationState.fieldType] = cardValidationState;
        }

        return newFieldValidation;
    }, [cardValidationState]);

    const isFieldInvalid = (fieldKey: AdyenV2CardFields): boolean => {
        return !!fieldsValidation[fieldKey] && !fieldsValidation[fieldKey]?.valid;
    };

    const showValidationIcon = (key: AdyenV2CardFields) => (
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
                    <label htmlFor={ AdyenV2CardFields.CardNumber }>
                        <TranslatedString id="payment.credit_card_number_label" />
                    </label>
                    <div
                        className={ classNames(
                            'form-input',
                            'optimizedCheckout-form-input',
                            'has-icon',
                            'adyen-checkout__input-wrapper',
                            { 'adyen-checkout__input--error': isFieldInvalid(AdyenV2CardFields.CardNumber) }
                        ) }
                        data-cse={ AdyenV2CardFields.CardNumber }
                        id={ AdyenV2CardFields.CardNumber }
                    >
                        { showValidationIcon(AdyenV2CardFields.CardNumber) }
                    </div>
                </div>
                { paymentMethodType === 'scheme' && <div className="form-field form-ccFields-field--ccCvv">
                    <label htmlFor={ AdyenV2CardFields.SecurityCode }>
                        <TranslatedString id="payment.credit_card_cvv_label" />
                    </label>
                    <div
                        className={ classNames(
                            'form-input',
                            'optimizedCheckout-form-input',
                            'has-icon',
                            'adyen-checkout__input-wrapper',
                            { 'adyen-checkout__input--error': isFieldInvalid(AdyenV2CardFields.SecurityCode) }
                        ) }
                        data-cse={ AdyenV2CardFields.SecurityCode }
                        id={ AdyenV2CardFields.SecurityCode }
                    >
                        { showValidationIcon(AdyenV2CardFields.SecurityCode) }
                    </div>
                </div> }
                { paymentMethodType === 'bcmc' && <div className="form-field form-field--ccExpiry">
                    <label htmlFor={ AdyenV2CardFields.ExpiryDate }>
                        <TranslatedString id="payment.credit_card_expiration_label" />
                    </label>
                    <div
                        className={ classNames(
                            'form-input',
                            'optimizedCheckout-form-input',
                            'has-icon',
                            'adyen-checkout__input-wrapper',
                            { 'adyen-checkout__input--error': isFieldInvalid(AdyenV2CardFields.ExpiryDate) }
                        ) }
                        data-cse={ AdyenV2CardFields.ExpiryDate }
                        id={ AdyenV2CardFields.ExpiryDate }
                    >
                        { showValidationIcon(AdyenV2CardFields.ExpiryDate) }
                    </div>
                </div> }
            </div>
        </div>
    );
};

export default AdyenV2CardValidation;
