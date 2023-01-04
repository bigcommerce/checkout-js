import React, { FunctionComponent } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { HostedCreditCardCodeField, HostedCreditCardNumberField } from '../';

export interface HostedCreditCardValidationProps {
    cardCodeId?: string;
    cardNumberId?: string;
    focusedFieldType?: string;
}

const HostedCreditCardValidation: FunctionComponent<HostedCreditCardValidationProps> = ({
    cardCodeId,
    cardNumberId,
    focusedFieldType,
}) => (
    <>
        {cardNumberId && (
            <p>
                <strong>
                    <TranslatedString id="payment.instrument_trusted_shipping_address_title_text" />
                </strong>

                <br />

                <TranslatedString id="payment.instrument_trusted_shipping_address_text" />
            </p>
        )}

        <div className="form-ccFields">
            {cardNumberId && (
                <HostedCreditCardNumberField
                    appearFocused={focusedFieldType === 'cardNumber'}
                    id={cardNumberId}
                    name="hostedForm.errors.cardNumberVerification"
                />
            )}

            {cardCodeId && (
                <HostedCreditCardCodeField
                    appearFocused={focusedFieldType === 'cardCode'}
                    id={cardCodeId}
                    name="hostedForm.errors.cardCodeVerification"
                />
            )}
        </div>
    </>
);

export default HostedCreditCardValidation;
