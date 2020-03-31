import classNames from 'classnames';
import React from 'react';

import { TranslatedString } from '../../locale';

export interface AdyenV2CardValidationProps {
    verificationFieldsContainerId?: string;
    shouldShowNumberField: boolean;
    paymentMethodType: string;
}

const AdyenV2CardValidation: React.FunctionComponent<AdyenV2CardValidationProps> = ({
    verificationFieldsContainerId,
    shouldShowNumberField,
    paymentMethodType,
}) => (
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
                { 'form-field-ccNumber--hide': !shouldShowNumberField }
                ) }
            >
                <label htmlFor="encryptedCardNumber">
                    <TranslatedString id="payment.credit_card_number_label" />
                </label>
                <div className="form-input optimizedCheckout-form-input has-icon" data-cse="encryptedCardNumber" id="encryptedCardNumber" />
            </div>
            { paymentMethodType === 'scheme' && <div className="form-field form-ccFields-field--ccCvv">
                <label htmlFor="encryptedSecurityCode">
                    <TranslatedString id="payment.credit_card_cvv_label" />
                </label>
                <div
                    className={ classNames(
                        'form-input',
                        'optimizedCheckout-form-input',
                        'has-icon'
                    ) }
                    data-cse="encryptedSecurityCode"
                    id="encryptedSecurityCode"
                />
            </div> }
            { paymentMethodType === 'bcmc' && <div className="form-field form-field--ccExpiry">
                <label htmlFor="encryptedExpiryDate">
                    <TranslatedString id="payment.credit_card_expiration_label" />
                </label>
                <div
                    className={ classNames(
                        'form-input',
                        'optimizedCheckout-form-input',
                        'has-icon'
                    ) }
                    data-cse="encryptedExpiryDate"
                    id="encryptedExpiryDate"
                />
            </div> }
        </div>
    </div>
);

export default AdyenV2CardValidation;
