import React, { type ChangeEvent, type FunctionComponent, useState } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { Legend, TextInput } from '@bigcommerce/checkout/ui';

import { getPoNumber, setPoNumber as setPoNumberinSessionStorage } from './poNumberStorage';

import './PoNumber.scss';

export interface PoNumberProps {
    label: string;
    isRequired: boolean;
}

const PO_NUMBER_INPUT_ID = 'po-number';

const PoNumber: FunctionComponent<PoNumberProps> = ({ label, isRequired }) => {
    const [poNumber, setPoNumber] = useState<string>(getPoNumber());

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        setPoNumber(value);
        setPoNumberinSessionStorage(value);
    };

    return (
        <div className="po-number-container">
            <Legend>
                <label className="po-number-label" htmlFor={PO_NUMBER_INPUT_ID}>
                    <span>{label}</span>
                    {!isRequired && (
                        <span>{' '}<TranslatedString id="payment.po_number_optional" /></span>
                    )}
                </label>
            </Legend>
            <TextInput
                id={PO_NUMBER_INPUT_ID}
                name={PO_NUMBER_INPUT_ID}
                onChange={handleChange}
                value={poNumber}
            />
        </div>
    );
};

export default PoNumber;
