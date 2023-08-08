import { CardInstrument } from '@bigcommerce/checkout-sdk';
import { useState } from 'react';

import { useCheckout, usePaymentFormContext } from '@bigcommerce/checkout/payment-integration-api';

export const useBraintreeAcceleratedCheckoutInstruments = () => {
    const [isAddingNewInstrument, setIsAddingNewInstrument] = useState<boolean>(false);
    const [selectedInstrumentId, setSelectedInstrumentId] = useState<string | undefined>();
    const state = useCheckout().checkoutState.data;

    const { getPaymentProviderCustomer } = state;
    const paymentProviderCustomer = getPaymentProviderCustomer();
    const { paymentForm } = usePaymentFormContext();

    const paypalConnectInstruments = paymentProviderCustomer?.instruments || [];
    const selectedInstrument = paypalConnectInstruments.find(
        (instrument: CardInstrument) => instrument.bigpayToken === selectedInstrumentId,
    );

    const handleUseNewInstrument = (): void => {
        setIsAddingNewInstrument(true);
        setSelectedInstrumentId(undefined);
        paymentForm.setFieldValue('instrumentId', undefined);
    };

    const handleSelectInstrument = (id: string): void => {
        setIsAddingNewInstrument(false);
        setSelectedInstrumentId(id);
        paymentForm.setFieldValue('instrumentId', id);
    };

    return {
        instruments: paypalConnectInstruments,
        isAddingNewInstrument,
        handleUseNewInstrument,
        handleSelectInstrument,
        selectedInstrument,
    };
};
