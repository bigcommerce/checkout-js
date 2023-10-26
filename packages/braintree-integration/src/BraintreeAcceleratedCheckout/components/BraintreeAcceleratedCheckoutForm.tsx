import React, { FunctionComponent, useEffect } from 'react';

import { PayPalConnectComponentRef } from '../BraintreeAcceleratedCheckoutPaymentMethod';
import { useBraintreeAcceleratedCheckoutInstruments } from '../hooks/useBraintreeAcceleratedCheckoutInstruments';

import BraintreeAcceleratedCheckoutCreditCardForm from './BraintreeAcceleratedCheckoutCreditCardForm';
import BraintreeAcceleratedCheckoutInstrumentFieldset from './BraintreeAcceleratedCheckoutInstrumentFieldset';

interface BraintreeAcceleratedCheckoutFormProps {
    renderPayPalConnectComponent?: PayPalConnectComponentRef['render'];
}

const BraintreeAcceleratedCheckoutForm: FunctionComponent<
    BraintreeAcceleratedCheckoutFormProps
> = ({ renderPayPalConnectComponent }) => {
    const {
        instruments,
        isAddingNewInstrument,
        selectedInstrument,
        handleUseNewInstrument,
        handleSelectInstrument,
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
                <BraintreeAcceleratedCheckoutInstrumentFieldset
                    instruments={instruments}
                    onSelectInstrument={handleSelectInstrument}
                    onUseNewInstrument={handleUseNewInstrument}
                    selectedInstrument={selectedInstrument}
                />
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
