import React from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { CreditCardCodeField, CreditCardNumberField } from '../index';

interface CreditCardValidationProps {
    shouldShowCardCodeField: boolean;
    shouldShowNumberField: boolean;
}

const CreditCardValidation: React.FunctionComponent<CreditCardValidationProps> = ({
    shouldShowNumberField,
    shouldShowCardCodeField,
}) => (
    <>
        {shouldShowNumberField && (
            <p>
                <strong>
                    <TranslatedString id="payment.instrument_trusted_shipping_address_title_text" />
                </strong>

                <br />

                <TranslatedString id="payment.instrument_trusted_shipping_address_text" />
            </p>
        )}

        <div className="form-ccFields">
            {shouldShowNumberField && <CreditCardNumberField name="ccNumber" />}

            {shouldShowCardCodeField && <CreditCardCodeField name="ccCvv" />}
        </div>
    </>
);

export default CreditCardValidation;
