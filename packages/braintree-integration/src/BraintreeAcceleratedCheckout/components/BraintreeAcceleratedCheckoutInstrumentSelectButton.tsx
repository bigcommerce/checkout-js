import { CardInstrument } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import BraintreeAcceleratedCheckoutInstrumentMenuItem from './BraintreeAcceleratedCheckoutInstrumentMenuItem';
import BraintreeAcceleratedCheckoutInstrumentUseNewButton from './BraintreeAcceleratedCheckoutInstrumentUseNewButton';

interface BraintreeAcceleratedCheckoutInstrumentSelectButtonProps {
    instrument?: CardInstrument;
    onClick?(): void;
}

const BraintreeAcceleratedCheckoutInstrumentSelectButton: FunctionComponent<
    BraintreeAcceleratedCheckoutInstrumentSelectButtonProps
> = ({ instrument, onClick }) => {
    if (!instrument) {
        return (
            <BraintreeAcceleratedCheckoutInstrumentUseNewButton className="instrumentSelect-button optimizedCheckout-form-select dropdown-button form-input" />
        );
    }

    return (
        <BraintreeAcceleratedCheckoutInstrumentMenuItem
            className="instrumentSelect-button optimizedCheckout-form-select dropdown-button form-input"
            instrument={instrument}
            onClick={onClick}
            testId="instrument-select-button"
        />
    );
};

export default BraintreeAcceleratedCheckoutInstrumentSelectButton;
