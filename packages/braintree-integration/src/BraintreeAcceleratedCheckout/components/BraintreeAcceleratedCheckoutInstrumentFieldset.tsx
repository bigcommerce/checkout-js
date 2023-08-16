import { CardInstrument } from '@bigcommerce/checkout-sdk';
import { FieldProps } from 'formik';
import React, { FunctionComponent, memo, useCallback } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { BasicFormField, Fieldset, Legend } from '@bigcommerce/checkout/ui';

import BraintreeAcceleratedCheckoutInstrumentSelect from './BraintreeAcceleratedCheckoutInstrumentSelect';

export interface BraintreeAcceleratedCheckoutInstrumentFieldsetProps {
    instruments: CardInstrument[];
    selectedInstrument?: CardInstrument;
    onSelectInstrument(id: string): void;
    onUseNewInstrument(): void;
}

const BraintreeAcceleratedCheckoutInstrumentFieldset: FunctionComponent<
    BraintreeAcceleratedCheckoutInstrumentFieldsetProps
> = ({ instruments, onSelectInstrument, onUseNewInstrument, selectedInstrument }) => {
    const renderInput = useCallback(
        (field: FieldProps<string>) => (
            <BraintreeAcceleratedCheckoutInstrumentSelect
                {...field}
                instruments={instruments}
                onSelectInstrument={onSelectInstrument}
                onUseNewInstrument={onUseNewInstrument}
                selectedInstrument={selectedInstrument}
            />
        ),
        [instruments, onSelectInstrument, onUseNewInstrument, selectedInstrument],
    );

    return (
        <Fieldset
            additionalClassName="instrumentFieldset"
            legend={
                <Legend hidden>
                    <TranslatedString id="payment.instrument_text" />
                </Legend>
            }
        >
            <BasicFormField name="instrumentId" render={renderInput} />
        </Fieldset>
    );
};

export default memo(BraintreeAcceleratedCheckoutInstrumentFieldset);
