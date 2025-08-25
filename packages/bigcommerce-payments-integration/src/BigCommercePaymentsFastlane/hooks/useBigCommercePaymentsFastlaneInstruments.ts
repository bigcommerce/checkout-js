import { type CardInstrument, type PaymentProviderCustomer } from '@bigcommerce/checkout-sdk';
import { useState } from 'react';

import { useCheckout, usePaymentFormContext } from '@bigcommerce/checkout/payment-integration-api';
import { isPayPalFastlaneCustomer } from '@bigcommerce/checkout/paypal-fastlane-integration';

export const useBigCommercePaymentsFastlaneInstruments = () => {
    const [selectedInstrument, setSelectedInstrument] = useState<CardInstrument>();

    const { getPaymentProviderCustomer } = useCheckout().checkoutState.data;

    const paymentProviderCustomer: PaymentProviderCustomer = getPaymentProviderCustomer();
    const paypalFastlaneCustomer = isPayPalFastlaneCustomer(paymentProviderCustomer)
        ? paymentProviderCustomer
        : {};

    const { paymentForm } = usePaymentFormContext();

    const handleSelectInstrument = (instrument: CardInstrument): void => {
        setSelectedInstrument(instrument);
        paymentForm.setFieldValue('instrumentId', instrument.bigpayToken);
    };

    return {
        instruments: paypalFastlaneCustomer.instruments || [],
        handleSelectInstrument,
        selectedInstrument,
    };
};
