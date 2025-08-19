import React, { type FunctionComponent, useEffect } from 'react';

import { usePayPalCommerceFastlaneInstruments } from '../hooks/usePayPalCommerceFastlaneInstruments';
import { type PayPalFastlaneCardComponentRef } from '../PayPalCommerceFastlanePaymentMethod';

import PayPalCommerceFastlaneCreditCardForm from './PayPalCommerceFastlaneCreditCardForm';
import PayPalCommerceFastlaneInstrumentsForm from './PayPalCommerceFastlaneInstrumentsForm';

interface PayPalCommerceFastlaneFormProps {
    renderPayPalCardComponent?: PayPalFastlaneCardComponentRef['renderPayPalCardComponent'];
    showPayPalCardSelector?: PayPalFastlaneCardComponentRef['showPayPalCardSelector'];
}

const PayPalCommerceFastlaneForm: FunctionComponent<PayPalCommerceFastlaneFormProps> = ({
    renderPayPalCardComponent,
    showPayPalCardSelector,
}) => {
    const { instruments, handleSelectInstrument, selectedInstrument } =
        usePayPalCommerceFastlaneInstruments();

    const shouldShowInstrumentsForm = instruments.length > 0;

    useEffect(() => {
        if (!selectedInstrument && instruments.length > 0) {
            handleSelectInstrument(instruments[0]);
        }
    }, [instruments, selectedInstrument]);

    return (
        <div className="paymentMethod paymentMethod--creditCard">
            {shouldShowInstrumentsForm && (
                <PayPalCommerceFastlaneInstrumentsForm
                    handleSelectInstrument={handleSelectInstrument}
                    onChange={showPayPalCardSelector}
                    selectedInstrument={selectedInstrument || instruments[0]}
                />
            )}

            {!shouldShowInstrumentsForm && (
                <PayPalCommerceFastlaneCreditCardForm
                    renderPayPalCardComponent={renderPayPalCardComponent}
                />
            )}
        </div>
    );
};

export default PayPalCommerceFastlaneForm;
