import React, { type FunctionComponent, useEffect } from 'react';

import { type BigCommercePaymentsFastlaneCardComponentRef } from '../BigCommercePaymentsFastlanePaymentMethod';
import { useBigCommercePaymentsFastlaneInstruments } from '../hooks/useBigCommercePaymentsFastlaneInstruments';

import BigCommercePaymentsFastlaneCreditCardForm from './BigCommercePaymentsFastlaneCreditCardForm';
import BigCommercePaymentsFastlaneInstrumentsForm from './BigCommercePaymentsFastlaneInstrumentsForm';

interface BigCommercePaymentsFastlaneFormProps {
    renderPayPalCardComponent?: BigCommercePaymentsFastlaneCardComponentRef['renderPayPalCardComponent'];
    showPayPalCardSelector?: BigCommercePaymentsFastlaneCardComponentRef['showPayPalCardSelector'];
}

const BigCommercePaymentsFastlaneForm: FunctionComponent<BigCommercePaymentsFastlaneFormProps> = ({
    renderPayPalCardComponent,
    showPayPalCardSelector,
}) => {
    const { instruments, handleSelectInstrument, selectedInstrument } =
        useBigCommercePaymentsFastlaneInstruments();

    const shouldShowInstrumentsForm = instruments.length > 0;

    useEffect(() => {
        if (!selectedInstrument && instruments.length > 0) {
            handleSelectInstrument(instruments[0]);
        }
    }, [instruments, selectedInstrument, handleSelectInstrument]);

    return (
        <div className="paymentMethod paymentMethod--creditCard">
            {shouldShowInstrumentsForm && (
                <BigCommercePaymentsFastlaneInstrumentsForm
                    handleSelectInstrument={handleSelectInstrument}
                    onChange={showPayPalCardSelector}
                    selectedInstrument={selectedInstrument || instruments[0]}
                />
            )}

            {!shouldShowInstrumentsForm && (
                <BigCommercePaymentsFastlaneCreditCardForm
                    renderPayPalCardComponent={renderPayPalCardComponent}
                />
            )}
        </div>
    );
};

export default BigCommercePaymentsFastlaneForm;
