import React, { FunctionComponent, memo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { Fieldset, Legend } from '../../ui/form';

import CreditCardCodeField from './CreditCardCodeField';
import CreditCardCustomerCodeField from './CreditCardCustomerCodeField';
import CreditCardExpiryField from './CreditCardExpiryField';
import CreditCardNameField from './CreditCardNameField';
import CreditCardNumberField from './CreditCardNumberField';

export interface CreditCardFieldsetProps {
    shouldShowCardCodeField?: boolean;
    shouldShowCustomerCodeField?: boolean;
    shouldShowSaveCardField?: boolean;
}

const CreditCardFieldset: FunctionComponent<CreditCardFieldsetProps> = ({
    shouldShowCardCodeField,
    shouldShowCustomerCodeField,
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

            {shouldShowCardCodeField && <CreditCardCodeField name="ccCvv" />}

            {shouldShowCustomerCodeField && <CreditCardCustomerCodeField name="ccCustomerCode" />}
        </div>
    </Fieldset>
);

export default memo(CreditCardFieldset);
