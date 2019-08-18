import React, { FunctionComponent } from 'react';

import { TranslatedString } from '../locale';
import { CheckboxFormField } from '../ui/form';

export interface BillingSameAsShippingFieldProps {
    onChange?(isChecked: boolean): void;
}

const BillingSameAsShippingField: FunctionComponent<BillingSameAsShippingFieldProps>  = ({
    onChange,
}) => (
    <CheckboxFormField
        name="billingSameAsShipping"
        id="sameAsBilling"
        labelContent={ <TranslatedString id="billing.use_shipping_address_label" /> }
        onChange={ onChange }
    />
);

export default BillingSameAsShippingField;
