import { Instrument, PaymentMethod } from '@bigcommerce/checkout-sdk';
import React, { Fragment, FunctionComponent } from 'react';

import { TranslatedString } from '../../locale';
import { BasicFormField, Fieldset, Legend } from '../../ui/form';
import { ModalTrigger } from '../../ui/modal';
import { CreditCardCodeField, CreditCardNumberField } from '../creditCard';

import InstrumentSelect from './InstrumentSelect';
import ManageInstrumentsModal from './ManageInstrumentsModal';

export interface InstrumentFieldsetProps {
    instruments: Instrument[];
    method: PaymentMethod;
    selectedInstrumentId?: string;
    shouldShowCardCodeField: boolean;
    shouldShowNumberField: boolean;
    onSelectInstrument(id: string): void;
    onUseNewCard(): void;
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
    onUseNewCard,
    selectedInstrumentId,
    shouldShowCardCodeField,
    shouldShowNumberField,
}) => (
    <Fieldset
        additionalClassName="instrumentFieldset"
        legend={
            <Legend hidden>
                <TranslatedString id="payment.instrument_text" />
            </Legend>
        }
    >
        <ModalTrigger modal={ props => (
            <ManageInstrumentsModal
                methodId={ method.id }
                { ...props }
            />
        ) }>
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
            render={ field => (
                <InstrumentSelect
                    { ...field }
                    instruments={ instruments }
                    onSelectInstrument={ onSelectInstrument }
                    onUseNewCard={ onUseNewCard }
                    selectedInstrumentId={ selectedInstrumentId }
                />
            ) }
        />

        { selectedInstrumentId && <Fragment>
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
            </div>
        </Fragment> }
    </Fieldset>
);

export default InstrumentFieldset;
