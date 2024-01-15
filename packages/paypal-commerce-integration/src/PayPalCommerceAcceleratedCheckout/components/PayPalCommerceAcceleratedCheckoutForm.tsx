import React, { FunctionComponent, useEffect } from 'react';

import {
    usePayPalCommerceAcceleratedCheckoutInstruments
} from '../hooks/usePayPalCommerceAcceleratedCheckoutInstruments';
import { PayPalConnectCardComponentRef } from '../PayPalCommerceAcceleratedCheckoutPaymentMethod';

import PayPalCommerceAcceleratedCheckoutCreditCardForm from './PayPalCommerceAcceleratedCheckoutCreditCardForm';
import PayPalCommerceAcceleratedCheckoutInstrumentsForm from './PayPalCommerceAcceleratedCheckoutInstrumentsForm';

interface PayPalCommerceAcceleratedCheckoutFormProps {
    renderPayPalConnectCardComponent?: PayPalConnectCardComponentRef['render'];
    showPayPalConnectCardSelector?: PayPalConnectCardComponentRef['showPayPalConnectCardSelector'];
}

const PayPalCommerceAcceleratedCheckoutForm: FunctionComponent<
    PayPalCommerceAcceleratedCheckoutFormProps
> = ({ renderPayPalConnectCardComponent, showPayPalConnectCardSelector }) => {
    const {
        instruments,
        handleSelectInstrument,
        selectedInstrument,
    } = usePayPalCommerceAcceleratedCheckoutInstruments();

    const shouldShowInstrumentsForm = instruments.length > 0;

    useEffect(() => {
        if (!selectedInstrument && instruments.length > 0) {
            handleSelectInstrument(instruments[0]);
        }
    }, [instruments, selectedInstrument]);

    return (
        <div
            className="paymentMethod paymentMethod--creditCard"
        >
            {/* Add vaulted element here */}
            {shouldShowInstrumentsForm && (
                <PayPalCommerceAcceleratedCheckoutInstrumentsForm
                    handleSelectInstrument={handleSelectInstrument}
                    onChange={showPayPalConnectCardSelector}
                    selectedInstrument={selectedInstrument || instruments[0]}
                />
            )}

            {!shouldShowInstrumentsForm && (
                <PayPalCommerceAcceleratedCheckoutCreditCardForm
                    renderPayPalConnectCardComponent={renderPayPalConnectCardComponent}
                />
            )}
        </div>
    );
};

export default PayPalCommerceAcceleratedCheckoutForm;
