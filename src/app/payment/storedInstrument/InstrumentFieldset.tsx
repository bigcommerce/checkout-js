import { Instrument, PaymentMethod } from '@bigcommerce/checkout-sdk';
import { FieldProps } from 'formik';
import React, { memo, useCallback, FunctionComponent } from 'react';

import { TranslatedString } from '../../locale';
import { BasicFormField, Fieldset, Legend } from '../../ui/form';
import { ModalTrigger, ModalTriggerModalProps } from '../../ui/modal';

import InstrumentSelect from './InstrumentSelect';
import ManageInstrumentsModal from './ManageInstrumentsModal';

export interface InstrumentFieldsetProps {
    instruments: Instrument[];
    method: PaymentMethod;
    selectedInstrumentId?: string;
    validateInstrument?: React.ReactNode;
    onSelectInstrument(id: string): void;
    onUseNewInstrument(): void;
}

export interface InstrumentFieldsetValues {
    ccCvv?: string;
    ccNumber?: string;
    instrumentId: string;
}

const InstrumentFieldset: FunctionComponent<InstrumentFieldsetProps> = ({
    instruments,
    method,
    onSelectInstrument,
    onUseNewInstrument,
    selectedInstrumentId,
    validateInstrument = null,
}) => {
    const renderInput = useCallback((field: FieldProps) => (
        <InstrumentSelect
            { ...field }
            instruments={ instruments }
            onSelectInstrument={ onSelectInstrument }
            onUseNewInstrument={ onUseNewInstrument }
            selectedInstrumentId={ selectedInstrumentId }
        />
    ), [
        instruments,
        onSelectInstrument,
        onUseNewInstrument,
        selectedInstrumentId,
    ]);

    const renderModal = useCallback((props: ModalTriggerModalProps) => (
        <ManageInstrumentsModal
            methodId={ method.id }
            { ...props }
        />
    ), [method]);

    return <Fieldset
        additionalClassName="instrumentFieldset"
        legend={
            <Legend hidden>
                <TranslatedString id="payment.instrument_text" />
            </Legend>
        }
    >
        <ModalTrigger modal={ renderModal }>
            { ({ onClick }) => <button
                className="instrumentModal-trigger"
                onClick={ onClick }
                type="button"
            >
                <TranslatedString id="payment.instrument_manage_button" />
            </button> }
        </ModalTrigger>

        <BasicFormField
            name="instrumentId"
            render={ renderInput }
        />

        { selectedInstrumentId && validateInstrument }
    </Fieldset>;
};

export default memo(InstrumentFieldset);
