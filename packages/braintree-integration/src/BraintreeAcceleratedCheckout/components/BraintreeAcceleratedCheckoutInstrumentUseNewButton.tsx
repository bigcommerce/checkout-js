import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { CreditCardIcon } from '@bigcommerce/checkout/ui';

interface BraintreeAcceleratedCheckoutInstrumentUseNewButtonProps {
    className?: string;
    onClick?(): void;
}

const BraintreeAcceleratedCheckoutInstrumentUseNewButton: FunctionComponent<
    BraintreeAcceleratedCheckoutInstrumentUseNewButtonProps
> = ({ className, onClick = noop }) => (
    <button
        className={className}
        data-test="instrument-select-option-use-new"
        onClick={onClick}
        type="button"
    >
        <div className="instrumentSelect-details instrumentSelect-details--addNew">
            <CreditCardIcon />

            <div className="instrumentSelect-card">
                <TranslatedString id="payment.instrument_add_card_action" />
            </div>
        </div>
    </button>
);

export default BraintreeAcceleratedCheckoutInstrumentUseNewButton;
