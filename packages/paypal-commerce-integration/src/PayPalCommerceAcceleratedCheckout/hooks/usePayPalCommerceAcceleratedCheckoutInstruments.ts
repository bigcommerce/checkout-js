import { CardInstrument } from '@bigcommerce/checkout-sdk';
import { useState } from 'react';

import { useCheckout, usePaymentFormContext } from '@bigcommerce/checkout/payment-integration-api';

export const usePayPalCommerceAcceleratedCheckoutInstruments = () => {
    const [selectedInstrument, setSelectedInstrument] = useState<CardInstrument>();

    const { getPaymentProviderCustomer } = useCheckout().checkoutState.data;
    const paymentProviderCustomer = getPaymentProviderCustomer();

    const { paymentForm } = usePaymentFormContext();

    const handleSelectInstrument = (instrument: CardInstrument): void => {
        setSelectedInstrument(instrument);
        paymentForm.setFieldValue('instrumentId', instrument.bigpayToken);
    };

    return {
        instruments: paymentProviderCustomer?.instruments || [],
        handleSelectInstrument,
        selectedInstrument,
    };
};
