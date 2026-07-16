import React, { type FunctionComponent, memo, useMemo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { CheckboxFormField } from '@bigcommerce/checkout/ui';

export interface BillingSameAsShippingFieldProps {
    disabled?: boolean;
    labelStringId?: string;
    onChange?(isChecked: boolean): void;
}

const BillingSameAsShippingField: FunctionComponent<BillingSameAsShippingFieldProps> = ({
    disabled,
    labelStringId = 'billing.use_shipping_address_label',
    onChange,
}) => {
    const labelContent = useMemo(() => <TranslatedString id={labelStringId} />, [labelStringId]);

    return (
        <CheckboxFormField
            disabled={disabled}
            id="sameAsBilling"
            labelContent={labelContent}
            name="billingSameAsShipping"
            onChange={onChange}
            testId="billingSameAsShipping"
        />
    );
};

export default memo(BillingSameAsShippingField);
