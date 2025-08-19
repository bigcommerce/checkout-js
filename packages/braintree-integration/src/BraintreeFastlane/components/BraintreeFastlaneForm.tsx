import React, { type FunctionComponent, useEffect } from 'react';

import { type BraintreeFastlaneComponentRef } from '../BraintreeFastlanePaymentMethod';
import { useBraintreeFastlaneInstruments } from '../hooks/useBraintreeFastlaneInstruments';

import BraintreFastlaneCreditCardForm from './BraintreeFastlaneCreditCardForm';
import BraintreeFastlaneInstrumentsForm from './BraintreeFastlaneInstrumentsForm';

interface BraintreeFastlaneFormProps {
    renderPayPalCardComponent?: BraintreeFastlaneComponentRef['renderPayPalCardComponent'];
    showPayPalCardSelector?: BraintreeFastlaneComponentRef['showPayPalCardSelector'];
}

const BraintreeFastlaneForm: FunctionComponent<BraintreeFastlaneFormProps> = ({
    renderPayPalCardComponent,
    showPayPalCardSelector,
}) => {
    const { instruments, handleSelectInstrument, selectedInstrument } =
        useBraintreeFastlaneInstruments();

    const shouldShowInstrumentsForm = instruments.length > 0;

    useEffect(() => {
        if (!selectedInstrument && instruments.length > 0) {
            handleSelectInstrument(instruments[0]);
        }
    }, [instruments, selectedInstrument]);

    return (
        <div className="paymentMethod paymentMethod--creditCard" id="braintree-fastlane">
            {shouldShowInstrumentsForm && (
                <BraintreeFastlaneInstrumentsForm
                    handleSelectInstrument={handleSelectInstrument}
                    onChange={showPayPalCardSelector}
                    selectedInstrument={selectedInstrument || instruments[0]}
                />
            )}

            {!shouldShowInstrumentsForm && (
                <BraintreFastlaneCreditCardForm
                    renderPayPalCardComponent={renderPayPalCardComponent}
                />
            )}
        </div>
    );
};

export default BraintreeFastlaneForm;
