import { CardInstrument } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { FunctionComponent, useCallback } from 'react';

import BraintreeAcceleratedCheckoutInstrumentMenuItem from './BraintreeAcceleratedCheckoutInstrumentMenuItem';

interface BraintreeAcceleratedCheckoutInstrumentOptionProps {
    instrument: CardInstrument;
    testId?: string;
    onClick?(token: string): void;
}

const BraintreeAcceleratedCheckoutInstrumentOption: FunctionComponent<
    BraintreeAcceleratedCheckoutInstrumentOptionProps
> = ({ instrument, onClick = noop, testId = 'instrument-select-option' }) => {
    const handleClick = useCallback(() => {
        onClick(instrument.bigpayToken);
    }, [onClick, instrument]);

    return (
        <BraintreeAcceleratedCheckoutInstrumentMenuItem
            instrument={instrument}
            onClick={handleClick}
            testId={testId}
        />
    );
};

export default BraintreeAcceleratedCheckoutInstrumentOption;
