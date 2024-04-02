import React, { FunctionComponent, useEffect } from 'react';

import { BraintreeFastlaneComponentRef } from '../BraintreeAcceleratedCheckoutPaymentMethod';
import { useBraintreeAcceleratedCheckoutInstruments } from '../hooks/useBraintreeAcceleratedCheckoutInstruments';

import BraintreeAcceleratedCheckoutCreditCardForm from './BraintreeAcceleratedCheckoutCreditCardForm';
import BraintreeAcceleratedCheckoutInstrumentFieldset from './BraintreeAcceleratedCheckoutInstrumentFieldset';
import BraintreeFastlaneInstrumentsForm from './BraintreeFastlaneInstrumentsForm';

interface BraintreeAcceleratedCheckoutFormProps {
    renderPayPalConnectComponent?: BraintreeFastlaneComponentRef['render'];
    showPayPalCardSelector?: BraintreeFastlaneComponentRef['showPayPalCardSelector'];
}

const BraintreeAcceleratedCheckoutForm: FunctionComponent<
    BraintreeAcceleratedCheckoutFormProps
> = ({ renderPayPalConnectComponent, showPayPalCardSelector }) => {
    const {
        instruments,
        isAddingNewInstrument,
        selectedInstrument,
        handleUseNewInstrument,
        handleSelectInstrument,
        handlePaypalFastlaneSelectInstrument,
    } = useBraintreeAcceleratedCheckoutInstruments();

    const shouldShowInstrumentFieldset = instruments.length > 0;
    const shouldShowForm = !shouldShowInstrumentFieldset || isAddingNewInstrument;

    useEffect(() => {
        if (!isAddingNewInstrument && !selectedInstrument && instruments.length > 0) {
            handleSelectInstrument(instruments[0].bigpayToken);
        }
    }, [instruments, selectedInstrument, isAddingNewInstrument]);

    return (
        <div className="paymentMethod paymentMethod--creditCard">
            {shouldShowInstrumentFieldset && (
                <>
                    {!showPayPalCardSelector && (
                        <BraintreeAcceleratedCheckoutInstrumentFieldset
                            instruments={instruments}
                            onSelectInstrument={handleSelectInstrument}
                            onUseNewInstrument={handleUseNewInstrument}
                            selectedInstrument={selectedInstrument}
                        />
                    )}
                    {showPayPalCardSelector && (
                        <BraintreeFastlaneInstrumentsForm
                            onChange={showPayPalCardSelector}
                            handleSelectInstrument={handlePaypalFastlaneSelectInstrument}
                            selectedInstrument={selectedInstrument || instruments[0]}
                        />
                    )}
                </>
            )}

            {shouldShowForm && (
                <BraintreeAcceleratedCheckoutCreditCardForm
                    renderPayPalConnectComponent={renderPayPalConnectComponent}
                />
            )}
        </div>
    );
};

export default BraintreeAcceleratedCheckoutForm;
