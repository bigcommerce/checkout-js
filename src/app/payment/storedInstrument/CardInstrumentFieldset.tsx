import { CardInstrument } from '@bigcommerce/checkout-sdk';
import { FieldProps } from 'formik';
import React, { memo, useCallback, FunctionComponent } from 'react';

import { TranslatedString } from '../../locale';
import { BasicFormField, Fieldset, Legend } from '../../ui/form';
import { ModalTrigger, ModalTriggerModalProps } from '../../ui/modal';

import InstrumentSelect from './InstrumentSelect';
import ManageInstrumentsModal from './ManageInstrumentsModal';

export interface CardInstrumentFieldsetProps {
    instruments: CardInstrument[];
    selectedInstrumentId?: string;
    validateInstrument?: React.ReactNode;
    onSelectInstrument(id: string): void;
    onUseNewInstrument(): void;
}

export interface CardInstrumentFieldsetValues {
    ccCvv?: string;
    ccNumber?: string;
    instrumentId: string;
}

const CardInstrumentFieldset: FunctionComponent<CardInstrumentFieldsetProps> = ({
    instruments,
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
            instruments={ instruments }
            { ...props }
        />
    ), [instruments]);

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

        <div style={ {display: selectedInstrumentId ? undefined : 'none'} }>
            { validateInstrument }
        </div>
    </Fieldset>;
};

export default memo(CardInstrumentFieldset);
