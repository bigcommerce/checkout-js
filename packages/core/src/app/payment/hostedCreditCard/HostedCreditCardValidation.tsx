import React, { FunctionComponent } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import HostedCreditCardCodeField from './HostedCreditCardCodeField';
import HostedCreditCardNumberField from './HostedCreditCardNumberField';
import HostedCreditCardExpiryField from "./HostedCreditCardExpiryField";

export interface HostedCreditCardValidationProps {
    cardCodeId?: string;
    cardNumberId?: string;
    cardExpiryId?: string;
    focusedFieldType?: string;
}

const HostedCreditCardValidation: FunctionComponent<HostedCreditCardValidationProps> = ({
    cardCodeId,
    cardNumberId,
    cardExpiryId,
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

            {cardExpiryId && (
                <HostedCreditCardExpiryField
                    appearFocused={focusedFieldType === 'cardExpiry'}
                    id={cardExpiryId}
                    name="hostedForm.errors.cardExpiryVerification"
                />
            )}
        </div>
    </>
);

export default HostedCreditCardValidation;
