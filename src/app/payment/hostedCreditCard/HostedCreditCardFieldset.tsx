import React, { FunctionComponent, ReactNode } from 'react';

import { TranslatedString } from '../../locale';
import { Fieldset, Legend } from '../../ui/form';
import StoreInstrumentFieldset from '../StoreInstrumentFieldset';

import HostedCreditCardCodeField from './HostedCreditCardCodeField';
import HostedCreditCardExpiryField from './HostedCreditCardExpiryField';
import HostedCreditCardNameField from './HostedCreditCardNameField';
import HostedCreditCardNumberField from './HostedCreditCardNumberField';

export interface HostedCreditCardFieldsetProps {
    additionalFields?: ReactNode;
    cardCodeId?: string;
    cardExpiryId: string;
    cardNameId?: string;
    cardNumberId: string;
    focusedFieldType?: string;
    shouldShowSaveCardField?: boolean;
}

export interface HostedCreditCardFieldsetValues {
    hostedForm: {
        cardType?: string;
        errors?: {
            cardCode?: string;
            cardExpiry?: string;
            cardName?: string;
            cardNumber?: string;
        };
    };
    shouldSaveInstrument?: boolean;
}

const HostedCreditCardFieldset: FunctionComponent<HostedCreditCardFieldsetProps> = ({
    additionalFields,
    cardCodeId,
    cardExpiryId,
    cardNameId,
    cardNumberId,
    focusedFieldType,
    shouldShowSaveCardField = false,
}) => (
    <Fieldset
        legend={
            <Legend hidden>
                <TranslatedString id="payment.credit_card_text" />
            </Legend>
        }
    >
        <div className="form-ccFields">
            <HostedCreditCardNumberField
                appearFocused={ focusedFieldType === 'cardNumber' }
                id={ cardNumberId }
                name="hostedForm.errors.cardNumber"
            />

            <HostedCreditCardExpiryField
                appearFocused={ focusedFieldType === 'cardExpiry' }
                id={ cardExpiryId }
                name="hostedForm.errors.cardExpiry"
            />

            { cardNameId && <HostedCreditCardNameField
                appearFocused={ focusedFieldType === 'cardName' }
                id={ cardNameId }
                name="hostedForm.errors.cardName"
            /> }

            { cardCodeId && <HostedCreditCardCodeField
                appearFocused={ focusedFieldType === 'cardCode' }
                id={ cardCodeId }
                name="hostedForm.errors.cardCode"
            /> }

            { additionalFields }

            <StoreInstrumentFieldset
                isAccountInstrument={ false }
                showSave={ shouldShowSaveCardField }
                showSetAsDefault={ shouldShowSaveCardField }
            />
        </div>
    </Fieldset>
);

export default HostedCreditCardFieldset;
