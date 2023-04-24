import React, { FunctionComponent, memo, useMemo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { CheckboxFormField } from '../ui/form';

export interface BillingSameAsShippingFieldProps {
    onChange?(isChecked: boolean): void;
}

const BillingSameAsShippingField: FunctionComponent<BillingSameAsShippingFieldProps> = ({
    onChange,
}) => {
    const labelContent = useMemo(
        () => <TranslatedString id="billing.use_shipping_address_label" />,
        [],
    );

    return (
        <CheckboxFormField
            id="sameAsBilling"
            labelContent={labelContent}
            name="billingSameAsShipping"
            onChange={onChange}
        />
    );
};

export default memo(BillingSameAsShippingField);
