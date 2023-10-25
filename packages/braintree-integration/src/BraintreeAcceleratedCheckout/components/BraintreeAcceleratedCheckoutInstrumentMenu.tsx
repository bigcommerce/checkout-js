import { CardInstrument } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, { FunctionComponent } from 'react';

import BraintreeAcceleratedCheckoutInstrumentOption from './BraintreeAcceleratedCheckoutInstrumentOption';
import BraintreeAcceleratedCheckoutInstrumentUseNewButton from './BraintreeAcceleratedCheckoutInstrumentUseNewButton';

interface BraintreeAcceleratedCheckoutInstrumentMenuProps {
    instruments: CardInstrument[];
    selectedInstrument?: CardInstrument;
    onSelectInstrument(id: string): void;
    onUseNewInstrument(): void;
}

const BraintreeAcceleratedCheckoutInstrumentMenu: FunctionComponent<
    BraintreeAcceleratedCheckoutInstrumentMenuProps
> = ({ instruments, selectedInstrument, onSelectInstrument, onUseNewInstrument }) => {
    return (
        <ul
            className="instrumentSelect-dropdownMenu instrumentSelect-dropdownMenuNext dropdown-menu"
            data-test="instrument-select-menu"
        >
            {instruments.map((instrument) => (
                <li
                    className={classNames('instrumentSelect-option dropdown-menu-item', {
                        'instrumentSelect-option--selected':
                            instrument.bigpayToken === selectedInstrument?.bigpayToken,
                    })}
                    key={instrument.bigpayToken}
                >
                    <BraintreeAcceleratedCheckoutInstrumentOption
                        instrument={instrument}
                        onClick={onSelectInstrument}
                    />
                </li>
            ))}

            <li className="instrumentSelect-option instrumentSelect-option--addNew dropdown-menu-item">
                <BraintreeAcceleratedCheckoutInstrumentUseNewButton onClick={onUseNewInstrument} />
            </li>
        </ul>
    );
};

export default BraintreeAcceleratedCheckoutInstrumentMenu;
