import React, { Fragment } from 'react';

import { TranslatedString } from '../../locale';
import { CreditCardCodeField, CreditCardNumberField } from '../creditCard';
import StoreInstrumentFieldset from '../StoreInstrumentFieldset';

interface CreditCardValidationProps {
    shouldShowCardCodeField: boolean;
    shouldShowNumberField: boolean;
    shouldShowSetCardAsDefault?: boolean;
}

export interface CreditCardValidationValues {
    ccCvv?: string;
    ccNumber?: string;
}

const CreditCardValidation: React.FunctionComponent<CreditCardValidationProps> = ({
    shouldShowNumberField,
    shouldShowCardCodeField,
    shouldShowSetCardAsDefault,
}) => (
    <Fragment>
        { shouldShowNumberField && <p>
            <strong>
                <TranslatedString id="payment.instrument_trusted_shipping_address_title_text" />
            </strong>

            <br />

            <TranslatedString id="payment.instrument_trusted_shipping_address_text" />
        </p> }

        <div className="form-ccFields">
            { shouldShowNumberField && <CreditCardNumberField name="ccNumber" /> }

            { shouldShowCardCodeField && <CreditCardCodeField name="ccCvv" /> }

            <StoreInstrumentFieldset
                isAccountInstrument={ false }
                showSave={ false }
                showSetAsDefault={ Boolean(shouldShowSetCardAsDefault) }
            />
        </div>
    </Fragment>
);

export default CreditCardValidation;
