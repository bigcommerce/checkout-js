import { CardInstrument } from '@bigcommerce/checkout-sdk';
import { FieldProps } from 'formik';
import React, { FunctionComponent, memo, useCallback } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import {
    BasicFormField,
    Fieldset,
    Legend,
    ModalTrigger,
    ModalTriggerModalProps,
} from '@bigcommerce/checkout/ui';

import { InstrumentSelect } from '../InstrumentSelect';
import { ManageInstrumentsModal } from '../ManageInstrumentsModal';

export interface CardInstrumentFieldsetProps {
    instruments: CardInstrument[];
    selectedInstrumentId?: string;
    shouldHideExpiryDate?: boolean;
    validateInstrument?: React.ReactNode;
    onDeleteInstrument?(instrumentId: string): void;
    onSelectInstrument(id: string): void;
    onUseNewInstrument(): void;
}

const CardInstrumentFieldset: FunctionComponent<CardInstrumentFieldsetProps> = ({
    instruments,
    onDeleteInstrument,
    onSelectInstrument,
    onUseNewInstrument,
    selectedInstrumentId,
    shouldHideExpiryDate = false,
    validateInstrument = null,
}) => {
    const renderInput = useCallback(
        (field: FieldProps<string>) => (
            <InstrumentSelect
                {...field}
                instruments={instruments}
                onSelectInstrument={onSelectInstrument}
                onUseNewInstrument={onUseNewInstrument}
                selectedInstrumentId={selectedInstrumentId}
                shouldHideExpiryDate={shouldHideExpiryDate}
            />
        ),
        [
            instruments,
            onSelectInstrument,
            onUseNewInstrument,
            selectedInstrumentId,
            shouldHideExpiryDate,
        ],
    );

    const renderModal = useCallback(
        (props: ModalTriggerModalProps) => (
            <ManageInstrumentsModal
                instruments={instruments}
                onDeleteInstrument={onDeleteInstrument}
                {...props}
            />
        ),
        [instruments, onDeleteInstrument],
    );

    return (
        <Fieldset
            additionalClassName="instrumentFieldset"
            legend={
                <Legend hidden>
                    <TranslatedString id="payment.instrument_text" />
                </Legend>
            }
        >
            <ModalTrigger modal={renderModal}>
                {({ onClick }) => (
                    <button className="instrumentModal-trigger" onClick={onClick} type="button">
                        <TranslatedString id="payment.instrument_manage_button" />
                    </button>
                )}
            </ModalTrigger>

            <BasicFormField name="instrumentId" render={renderInput} />

            <div style={{ display: selectedInstrumentId ? undefined : 'none' }}>
                {validateInstrument}
            </div>
        </Fieldset>
    );
};

export default memo(CardInstrumentFieldset);
