import { CardInstrument } from '@bigcommerce/checkout-sdk';
import { FieldProps } from 'formik';
import React, { FunctionComponent, useEffect } from 'react';

import { usePaymentFormContext } from '@bigcommerce/checkout/payment-integration-api';
import { PoweredByPayPalFastlaneLabel } from '@bigcommerce/checkout/paypal-fastlane-integration';
import { DropdownTrigger } from '@bigcommerce/checkout/ui';

import BraintreeAcceleratedCheckoutInstrumentMenu from './BraintreeAcceleratedCheckoutInstrumentMenu';
import BraintreeAcceleratedCheckoutInstrumentSelectButton from './BraintreeAcceleratedCheckoutInstrumentSelectButton';

interface BraintreeAcceleratedCheckoutInstrumentSelectProps extends FieldProps<string> {
    instruments: CardInstrument[];
    selectedInstrument?: CardInstrument;
    onSelectInstrument(id: string): void;
    onUseNewInstrument(): void;
}

const BraintreeAcceleratedCheckoutInstrumentSelect: FunctionComponent<
    BraintreeAcceleratedCheckoutInstrumentSelectProps
> = ({ field, selectedInstrument, instruments, onSelectInstrument, onUseNewInstrument }) => {
    const { paymentForm } = usePaymentFormContext();

    const updateFieldValue = (instrumentId?: string) => {
        paymentForm.setFieldValue('instrumentId', instrumentId);
    };

    useEffect(() => {
        updateFieldValue(selectedInstrument?.bigpayToken);

        return () => updateFieldValue();
    }, [selectedInstrument]);

    return (
        <div className="instrumentSelect" data-test="instrument-select">
            <DropdownTrigger
                dropdown={
                    <BraintreeAcceleratedCheckoutInstrumentMenu
                        instruments={instruments}
                        onSelectInstrument={onSelectInstrument}
                        onUseNewInstrument={onUseNewInstrument}
                        selectedInstrument={selectedInstrument}
                    />
                }
            >
                <BraintreeAcceleratedCheckoutInstrumentSelectButton
                    instrument={selectedInstrument}
                />

                <input type="hidden" {...field} />
            </DropdownTrigger>

            {selectedInstrument && <PoweredByPayPalFastlaneLabel />}
        </div>
    );
};

export default BraintreeAcceleratedCheckoutInstrumentSelect;
