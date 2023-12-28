import { CardInstrument } from '@bigcommerce/checkout-sdk';
import { useState } from 'react';

import { useCheckout, usePaymentFormContext } from '@bigcommerce/checkout/payment-integration-api';

export const usePayPalCommerceAcceleratedCheckoutInstruments = () => {
    const [selectedInstrumentId, setSelectedInstrumentId] = useState<string | undefined>();
    const state = useCheckout().checkoutState.data;

    const { getPaymentProviderCustomer } = state;
    const paymentProviderCustomer = getPaymentProviderCustomer();
    const { paymentForm } = usePaymentFormContext();

    const paypalConnectInstruments = paymentProviderCustomer?.instruments || [];
    const selectedInstrument = paypalConnectInstruments.find(
        (instrument: CardInstrument) => instrument.bigpayToken === selectedInstrumentId,
    );

    const handleSelectInstrument = (id: string): void => {
        setSelectedInstrumentId(id);
        paymentForm.setFieldValue('instrumentId', id);
    };

    return {
        instruments: paypalConnectInstruments,
        handleSelectInstrument,
        selectedInstrument,
    };
};
