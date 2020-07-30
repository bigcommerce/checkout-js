import React, { memo, FunctionComponent } from 'react';

import { TranslatedString } from '../../locale';
import { Fieldset, Legend } from '../../ui/form';

import CreditCardCodeField from './CreditCardCodeField';
import CreditCardCustomerCodeField from './CreditCardCustomerCodeField';
import CreditCardExpiryField from './CreditCardExpiryField';
import CreditCardNameField from './CreditCardNameField';
import CreditCardNumberField from './CreditCardNumberField';
import StoreCreditCardFieldset from './StoreCreditCardFieldset';

export interface CreditCardFieldsetProps {
    shouldShowCardCodeField?: boolean;
    shouldShowCustomerCodeField?: boolean;
    shouldShowSaveCardField?: boolean;
    shouldShowSetAsDefault?: boolean;
}

export interface CreditCardFieldsetValues {
    ccCustomerCode?: string;
    ccCvv?: string;
    ccExpiry: string;
    ccName: string;
    ccNumber: string;
    shouldSaveInstrument?: boolean;
}

const CreditCardFieldset: FunctionComponent<CreditCardFieldsetProps> = ({
    shouldShowCardCodeField,
    shouldShowCustomerCodeField,
    shouldShowSaveCardField,
    shouldShowSetAsDefault,
}) => (
    <Fieldset
        additionalClassName="creditCardFieldset"
        legend={
            <Legend hidden>
                <TranslatedString id="payment.credit_card_text" />
            </Legend>
        }
    >
        <div className="form-ccFields">
            <CreditCardNumberField name="ccNumber" />

            <CreditCardExpiryField name="ccExpiry" />

            <CreditCardNameField name="ccName" />

            { shouldShowCardCodeField && <CreditCardCodeField name="ccCvv" /> }

            { shouldShowCustomerCodeField && <CreditCardCustomerCodeField name="ccCustomerCode" /> }

            { shouldShowSaveCardField && <StoreCreditCardFieldset shouldShowSetAsDefault={ Boolean(shouldShowSetAsDefault) } /> }
        </div>
    </Fieldset>
);

export default memo(CreditCardFieldset);
