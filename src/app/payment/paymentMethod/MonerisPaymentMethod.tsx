import { CardInstrument, PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { useCallback, FunctionComponent } from 'react';

import { CreditCardValidation } from '../storedInstrument';

import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

export type MonerisPaymentMethodProps = Omit< HostedWidgetPaymentMethodProps, 'containerId'>;

const MonerisPaymentMethod: FunctionComponent<MonerisPaymentMethodProps> = ({
    initializePayment,
    method,
    ...rest
  }) => {

    const containerId = `moneris-iframe-container`;

    const initializeMonerisPayment = useCallback((options: PaymentInitializeOptions) => initializePayment({
        ...options,
        moneris: {
            containerId,
        },
    }), [containerId, initializePayment]);

    const validateInstrument = (_shouldShowNumberField: boolean, selectedInstrument?: CardInstrument): React.ReactNode => {
        const trustedShippingAddress = selectedInstrument && selectedInstrument.trustedShippingAddress;

        return (<CreditCardValidation
            shouldShowCardCodeField={ method.config && !!method.config.isVaultingCvvEnabled }
            shouldShowNumberField={ !trustedShippingAddress }
        />);
    };

    return <HostedWidgetPaymentMethod
        { ...rest }
        containerId={ containerId }
        initializePayment={ initializeMonerisPayment }
        method={ method }
        validateInstrument= { validateInstrument }
    />;
};

export default MonerisPaymentMethod;
