import { AccountInstrument } from '@bigcommerce/checkout-sdk';
import { FieldProps } from 'formik';
import React, { memo, useCallback, FunctionComponent } from 'react';

import { TranslatedHtml, TranslatedString } from '../../locale';
import { BasicFormField, Fieldset, Legend } from '../../ui/form';

import AccountInstrumentSelect from './AccountInstrumentSelect';

export interface AccountInstrumentFieldsetProps {
    instruments: AccountInstrument[];
    selectedInstrument?: AccountInstrument;
    onSelectInstrument(id: string): void;
    onUseNewInstrument(): void;
}

export interface AccountInstrumentFieldsetValues {
    instrumentId: string;
}

const AccountInstrumentFieldset: FunctionComponent<AccountInstrumentFieldsetProps> = ({
    instruments,
    onSelectInstrument,
    onUseNewInstrument,
    selectedInstrument,
}) => {
    const renderInput = useCallback((field: FieldProps) => (
        <AccountInstrumentSelect
            { ...field }
            instruments={ instruments }
            onSelectInstrument={ onSelectInstrument }
            onUseNewInstrument={ onUseNewInstrument }
            selectedInstrumentId={ selectedInstrument && selectedInstrument.bigpayToken }
        />
    ), [
        instruments,
        onSelectInstrument,
        onUseNewInstrument,
        selectedInstrument,
    ]);

    return <Fieldset
        additionalClassName="instrumentFieldset"
        legend={
            <Legend hidden>
                <TranslatedString id="payment.account_instrument_text" />
            </Legend>
        }
    >
        <BasicFormField
            name="instrumentId"
            render={ renderInput }
        />

        { instruments.length === 0 && <div className="instrumentSelect-note">
            <TranslatedHtml id="payment.account_instrument_new_shipping_address" />
        </div> }
    </Fieldset>;
};

export default memo(AccountInstrumentFieldset);
