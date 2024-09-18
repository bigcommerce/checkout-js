import { AccountInstrument } from '@bigcommerce/checkout-sdk';
import { FieldProps } from 'formik';
import React, { FunctionComponent, memo, useCallback } from 'react';

import { TranslatedHtml, TranslatedString } from '@bigcommerce/checkout/locale';
import {
    BasicFormField,
    Fieldset,
    Legend,
    ModalTrigger,
    ModalTriggerModalProps,
} from '@bigcommerce/checkout/ui';

import { AccountInstrumentSelect } from '../AccountInstrumentSelect';
import { ManageInstrumentsModal } from '../ManageInstrumentsModal';

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
    const renderInput = useCallback(
        (field: FieldProps<string>) => (
            <AccountInstrumentSelect
                {...field}
                instruments={instruments}
                onSelectInstrument={onSelectInstrument}
                onUseNewInstrument={onUseNewInstrument}
                selectedInstrumentId={selectedInstrument && selectedInstrument.bigpayToken}
            />
        ),
        [instruments, onSelectInstrument, onUseNewInstrument, selectedInstrument],
    );

    const renderModal = useCallback(
        (props: ModalTriggerModalProps) => (
            <ManageInstrumentsModal instruments={instruments} {...props} />
        ),
        [instruments],
    );

    return (
        <Fieldset
            additionalClassName="instrumentFieldset"
            legend={
                <Legend hidden>
                    <TranslatedString id="payment.account_instrument_text" />
                </Legend>
            }
            testId="account-instrument-fieldset"
        >
            <ModalTrigger modal={renderModal}>
                {({ onClick }) => (
                    <button className="instrumentModal-trigger" onClick={onClick} type="button">
                        <TranslatedString id="payment.instrument_manage_button" />
                    </button>
                )}
            </ModalTrigger>

            <BasicFormField name="instrumentId" render={renderInput} />

            {instruments.length === 0 && (
                <div className="instrumentSelect-note" data-test="instrument-select-note">
                    <TranslatedHtml id="payment.account_instrument_new_shipping_address" />
                </div>
            )}
        </Fieldset>
    );
};

export default memo(AccountInstrumentFieldset);
