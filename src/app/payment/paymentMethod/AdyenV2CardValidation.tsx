import classNames from 'classnames';
import React from 'react';

import { TranslatedString } from '../../locale';

export interface AdyenV2CardValidationProps {
    verificationFieldsContainerId?: string;
    shouldShowNumberField: boolean;
}

const AdyenV2CardValidation: React.FunctionComponent<AdyenV2CardValidationProps> = ({
    verificationFieldsContainerId,
    shouldShowNumberField,
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
            { <div className="form-field form-field--ccNumber" style={ { display: (shouldShowNumberField) ? undefined : 'none' } }>
                <label htmlFor="encryptedCardNumber">
                    <TranslatedString id="payment.credit_card_number_label" />
                </label>
                <div className="form-input optimizedCheckout-form-input has-icon" data-cse="encryptedCardNumber" id="encryptedCardNumber" />
            </div> }
            <div className="form-field form-ccFields-field--ccCvv">
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
            </div>
        </div>
    </div>
);

export default AdyenV2CardValidation;
